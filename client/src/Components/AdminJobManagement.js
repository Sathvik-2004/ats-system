import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminJobManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Job cache for faster loading
const jobCache = {
  data: null,
  timestamp: 0,
  CACHE_DURATION: 60000 // 1 minute cache for jobs
};

const AdminJobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    salary: '',
    location: '',
    experience: '',
    jobType: 'Full-time',
    description: '',
    skills: ''
  });

  const createEditableJobState = (job) => ({
    _id: job._id,
    title: job.title || '',
    company: job.company || '',
    salary: job.salary || '',
    location: job.location || '',
    experience: job.experience || '',
    jobType: job.jobType || job.type || 'Full-time',
    description: job.description || '',
    skills: Array.isArray(job.requirements) ? job.requirements.join(', ') : ''
  });

  // Memoized filtered jobs for search
  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;
    const term = searchTerm.toLowerCase();
    return jobs.filter(job => 
      job.title?.toLowerCase().includes(term) ||
      job.company?.toLowerCase().includes(term) ||
      job.location?.toLowerCase().includes(term)
    );
  }, [jobs, searchTerm]);

  // Check if cache is valid
  const isCacheValid = () => {
    return jobCache.data && (Date.now() - jobCache.timestamp) < jobCache.CACHE_DURATION;
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = useCallback(async (forceRefresh = false) => {
    // Use cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid()) {
      console.log('🚀 Using cached job data');
      setJobs(jobCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔄 Fetching fresh job data...');
      const response = await axios.get(`${API_URL}/api/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 3000 // Quick timeout for faster fallback
      });

      const jobsData = Array.isArray(response.data) ? response.data : [];
      
      // Cache the fresh data
      jobCache.data = jobsData;
      jobCache.timestamp = Date.now();
      
      setJobs(jobsData);
      setLastRefresh(Date.now());
      console.log('✅ Fresh job data loaded');
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setLastRefresh(Date.now());
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/jobs`, newJob, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJobs([...jobs, response.data.data]);
      setNewJob({
        title: '',
        company: '',
        salary: '',
        location: '',
        experience: '',
        jobType: 'Full-time',
        description: '',
        skills: ''
      });
      setShowAddForm(false);
      toast.success('Job added successfully!');
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to add job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJobs(jobs.filter(job => job._id !== jobId));
      toast.success('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleEditJob = async (e) => {
    e.preventDefault();
    if (!editingJob?._id) {
      toast.error('Invalid job selected for editing');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/jobs/${editingJob._id}`, editingJob, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const updatedJob = response?.data?.data;
      if (!updatedJob) {
        toast.error('Unexpected server response while updating job');
        return;
      }

      setJobs((prev) => prev.map((job) => (job._id === updatedJob._id ? updatedJob : job)));
      setEditingJob(null);
      toast.success('Job updated successfully!');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error(error?.response?.data?.message || 'Failed to update job');
    }
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'Full-time': '#10b981',
      'Part-time': '#f59e0b',
      'Contract': '#3b82f6',
      'Internship': '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="ajm-page">
        <div className="ajm-header">
          <div>
            <h1>Job Management</h1>
            <p>Manage job postings and requirements.</p>
          </div>
        </div>
        <div className="ajm-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="ajm-card saas-card">
              <div className="saas-skeleton ajm-skeleton-title"></div>
              <div className="saas-skeleton ajm-skeleton-subtitle"></div>
              <div className="saas-skeleton ajm-skeleton-line"></div>
              <div className="saas-skeleton ajm-skeleton-line"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ajm-page">
      <div className="ajm-header">
        <div>
          <h1>Job Management</h1>
          <p>
            Manage job postings and requirements ({filteredJobs.length} jobs)
          </p>
        </div>
        <div className="ajm-actions">
          <div className="ajm-last-refresh">
            Last refresh: {new Date(lastRefresh).toLocaleTimeString()}
          </div>
          <button
            onClick={() => fetchJobs(true)}
            disabled={loading}
            className="ajm-btn ajm-btn-secondary"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="ajm-btn ajm-btn-primary"
          >
            Add New Job
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="ajm-search-wrap">
        <div className="ajm-search-box">
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ajm-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="ajm-search-clear"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Add Job Form Modal */}
      {showAddForm && (
        <div className="ajm-modal-backdrop">
          <div className="ajm-modal saas-card">
            <h2 className="ajm-modal-title">Add New Job</h2>
            <form onSubmit={handleAddJob}>
              <div className="ajm-form-grid">
                <div>
                  <label className="ajm-label">Job Title</label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    required
                    className="ajm-input"
                  />
                </div>
                <div>
                  <label className="ajm-label">Company</label>
                  <input
                    type="text"
                    value={newJob.company}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    required
                    className="ajm-input"
                  />
                </div>
              </div>

              <div className="ajm-form-grid">
                <div>
                  <label className="ajm-label">Salary</label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    placeholder="e.g., $80k - $120k"
                    required
                    className="ajm-input"
                  />
                </div>
                <div>
                  <label className="ajm-label">Location</label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    required
                    className="ajm-input"
                  />
                </div>
              </div>

              <div className="ajm-form-grid">
                <div>
                  <label className="ajm-label">Experience</label>
                  <select
                    value={newJob.experience}
                    onChange={(e) => setNewJob({...newJob, experience: e.target.value})}
                    required
                    className="ajm-input"
                  >
                    <option value="">Select Experience</option>
                    <option value="Entry-level">Entry-level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="ajm-label">Job Type</label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({...newJob, jobType: e.target.value})}
                    required
                    className="ajm-input"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="ajm-form-group">
                <label className="ajm-label">Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  rows="4"
                  required
                  className="ajm-input ajm-textarea"
                />
              </div>

              <div className="ajm-form-group">
                <label className="ajm-label">Skills</label>
                <input
                  type="text"
                  value={newJob.skills}
                  onChange={(e) => setNewJob({...newJob, skills: e.target.value})}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className="ajm-input"
                />
              </div>

              <div className="ajm-form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="ajm-btn ajm-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ajm-btn ajm-btn-primary"
                >
                  Add Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Form Modal */}
      {editingJob && (
        <div className="ajm-modal-backdrop">
          <div className="ajm-modal saas-card">
            <h2 className="ajm-modal-title">Edit Job</h2>
            <form onSubmit={handleEditJob}>
              <div className="ajm-form-grid">
                <div>
                  <label className="ajm-label">Job Title</label>
                  <input
                    type="text"
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                    required
                    className="ajm-input"
                  />
                </div>
                <div>
                  <label className="ajm-label">Company</label>
                  <input
                    type="text"
                    value={editingJob.company}
                    onChange={(e) => setEditingJob({...editingJob, company: e.target.value})}
                    required
                    className="ajm-input"
                  />
                </div>
              </div>

              <div className="ajm-form-grid">
                <div>
                  <label className="ajm-label">Salary</label>
                  <input
                    type="text"
                    value={editingJob.salary}
                    onChange={(e) => setEditingJob({...editingJob, salary: e.target.value})}
                    required
                    className="ajm-input"
                  />
                </div>
                <div>
                  <label className="ajm-label">Location</label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({...editingJob, location: e.target.value})}
                    required
                    className="ajm-input"
                  />
                </div>
              </div>

              <div className="ajm-form-grid">
                <div>
                  <label className="ajm-label">Experience</label>
                  <select
                    value={editingJob.experience}
                    onChange={(e) => setEditingJob({...editingJob, experience: e.target.value})}
                    required
                    className="ajm-input"
                  >
                    <option value="">Select Experience</option>
                    <option value="Entry-level">Entry-level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="ajm-label">Job Type</label>
                  <select
                    value={editingJob.jobType}
                    onChange={(e) => setEditingJob({...editingJob, jobType: e.target.value})}
                    required
                    className="ajm-input"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="ajm-form-group">
                <label className="ajm-label">Description</label>
                <textarea
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                  rows="4"
                  required
                  className="ajm-input ajm-textarea"
                />
              </div>

              <div className="ajm-form-group">
                <label className="ajm-label">Skills</label>
                <input
                  type="text"
                  value={editingJob.skills}
                  onChange={(e) => setEditingJob({...editingJob, skills: e.target.value})}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className="ajm-input"
                />
              </div>

              <div className="ajm-form-actions">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="ajm-btn ajm-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ajm-btn ajm-btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="ajm-grid">
        {filteredJobs.map((job) => (
          <div key={job._id} className="ajm-card saas-card saas-card-hover">
            <div className="ajm-card-head">
              <div>
                <h3 className="ajm-card-title">
                  {job.title || 'Job Title Not Available'}
                </h3>
                <p className="ajm-card-company">
                  {job.company || 'Company Not Specified'}
                </p>
              </div>
              <div className="ajm-card-actions">
                <button
                  onClick={() => setEditingJob(createEditableJobState(job))}
                  className="ajm-btn ajm-btn-small ajm-btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="ajm-btn ajm-btn-small ajm-btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="ajm-card-meta">
              <span className="ajm-location">
                {job.location || 'Location TBD'}
              </span>
              <span className="ajm-job-type" style={{ backgroundColor: getJobTypeColor(job.jobType) }}>
                {job.jobType || 'Full-time'}
              </span>
            </div>

            <p className="ajm-description">
              {job.description ? 
                (job.description.length > 150 ? 
                  job.description.substring(0, 150) + '...' : 
                  job.description
                ) : 
                'No description available'
              }
            </p>

            {Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <div className="ajm-skill-list">
                {job.requirements.slice(0, 6).map((skill, index) => (
                  <span
                    key={`${job._id}-skill-${index}`}
                    className="ajm-skill-pill"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="ajm-card-foot">
              <span className="ajm-salary">
                {job.salary || 'Salary Negotiable'}
              </span>
              <span className="ajm-date">
                {new Date(job.postedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="saas-empty-state ajm-empty-state">
          <div className="ajm-empty-icon">💼</div>
          <h3>No Jobs Posted Yet</h3>
          <p>Click "Add New Job" to create your first job posting.</p>
        </div>
      )}
    </div>
  );
};

export default AdminJobManagement;