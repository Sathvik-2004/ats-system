import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminJobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    salary: '',
    location: '',
    experience: '',
    jobType: 'Full-time',
    description: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/jobs', newJob, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJobs([...jobs, response.data]);
      setNewJob({
        title: '',
        company: '',
        salary: '',
        location: '',
        experience: '',
        jobType: 'Full-time',
        description: ''
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
      await axios.delete(`http://localhost:5000/api/admin/jobs/${jobId}`, {
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading jobs...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            💼 Job Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Manage job postings and requirements
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Add New Job
        </button>
      </div>

      {/* Add Job Form Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginBottom: '24px', color: '#1f2937' }}>Add New Job</h2>
            <form onSubmit={handleAddJob}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Job Title</label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Company</label>
                  <input
                    type="text"
                    value={newJob.company}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Salary</label>
                  <input
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    placeholder="e.g., $80k - $120k"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Location</label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Experience</label>
                  <select
                    value={newJob.experience}
                    onChange={(e) => setNewJob({...newJob, experience: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Job Type</label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({...newJob, jobType: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  rows="4"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #e5e7eb',
                    background: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Add Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {jobs.map((job) => (
          <div key={job._id} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: '#1f2937', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                  {job.title || 'Job Title Not Available'}
                </h3>
                <p style={{ color: '#667eea', fontSize: '16px', fontWeight: '600' }}>
                  🏢 {job.company || 'Company Not Specified'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setEditingJob(job)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteJob(job._id)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                📍 {job.location || 'Location TBD'}
              </span>
              <span style={{
                background: getJobTypeColor(job.jobType),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {job.jobType || 'Full-time'}
              </span>
            </div>

            <p style={{
              color: '#4b5563',
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {job.description ? 
                (job.description.length > 150 ? 
                  job.description.substring(0, 150) + '...' : 
                  job.description
                ) : 
                'No description available'
              }
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#10b981', fontWeight: '600', fontSize: '16px' }}>
                💰 {job.salary || 'Salary Negotiable'}
              </span>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>
                📅 {new Date(job.postedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Jobs Posted Yet</h3>
          <p>Click "Add New Job" to create your first job posting.</p>
        </div>
      )}
    </div>
  );
};

export default AdminJobManagement;