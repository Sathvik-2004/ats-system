import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import RequestErrorState from './common/RequestErrorState';
import './JobSearchDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const JobSearchDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState('');
  const [savingJobId, setSavingJobId] = useState('');
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    experience: '',
    salaryMin: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, sortBy, filters, currentPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        paginated: 'true',
        page: currentPage,
        limit: pageSize,
        sortBy
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filters.location.trim()) params.location = filters.location.trim();
      if (filters.experience.trim()) params.experience = filters.experience.trim();
      if (filters.jobType.trim()) params.jobType = filters.jobType.trim();
      if (filters.salaryMin !== '' && Number(filters.salaryMin) >= 0) {
        params.salaryMin = Number(filters.salaryMin);
      }

      const response = await axios.get(`${API_URL}/api/jobs`, {
        params
      });

      if (response.data?.success) {
        setJobs(response.data.data || []);
        setTotalItems(response.data.pagination?.totalItems || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setJobs([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      const message = error?.response?.data?.message || 'Failed to load jobs';
      setJobs([]);
      setTotalItems(0);
      setTotalPages(1);
      setError((previousError) => {
        if (previousError !== message) {
          toast.error(message, { toastId: 'jobs-fetch-error' });
        }
        return message;
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/jobs/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        const ids = (response.data.data || []).map((job) => String(job._id));
        setSavedJobIds(new Set(ids));
      }
    } catch (_error) {
      // keep UI usable even if saved jobs call fails
    }
  };

  const handleToggleSaveJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const normalizedJobId = String(jobId);
      setSavingJobId(normalizedJobId);

      if (savedJobIds.has(normalizedJobId)) {
        await axios.delete(`${API_URL}/api/jobs/saved/${normalizedJobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(normalizedJobId);
          return next;
        });
        toast.success('Removed from saved jobs');
      } else {
        await axios.post(
          `${API_URL}/api/jobs/${normalizedJobId}/save`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedJobIds((prev) => new Set(prev).add(normalizedJobId));
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update saved job');
    } finally {
      setSavingJobId('');
    }
  };

  const handleQuickApply = async (jobId) => {
    try {
      setApplyingJobId(jobId);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      if (!token) {
        toast.error('Please login first');
        return;
      }

      await axios.post(
        `${API_URL}/api/jobs/apply`,
        { jobId, resumeUrl: userData?.resume?.url || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Application submitted successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingJobId('');
    }
  };

  if (loading) {
    return (
      <div className="jobs-page animate-pulse">
        <header className="jobs-hero">
          <div className="jobs-hero-inner">
            <div style={{ height: 34, width: '36%', borderRadius: 10, background: 'rgba(255,255,255,0.55)', marginBottom: 10 }} />
            <div style={{ height: 14, width: '55%', borderRadius: 8, background: 'rgba(255,255,255,0.45)', marginBottom: 20 }} />
            <div className="jobs-filters saas-card">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} style={{ height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.75)' }} />
              ))}
            </div>
          </div>
        </header>

        <div className="jobs-main">
          <div style={{ height: 20, width: '24%', background: '#e5e7eb', borderRadius: 8, marginBottom: 14 }} />
          <div className="jobs-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <article key={idx} className="job-card saas-card">
                <div className="job-card-main">
                  <div style={{ height: 20, width: '52%', borderRadius: 8, background: '#e5e7eb', marginBottom: 12 }} />
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div style={{ height: 22, width: 84, borderRadius: 999, background: '#e5e7eb' }} />
                    <div style={{ height: 22, width: 74, borderRadius: 999, background: '#e5e7eb' }} />
                    <div style={{ height: 22, width: 72, borderRadius: 999, background: '#e5e7eb' }} />
                  </div>
                  <div style={{ height: 12, width: '92%', borderRadius: 8, background: '#e5e7eb', marginBottom: 8 }} />
                  <div style={{ height: 12, width: '84%', borderRadius: 8, background: '#e5e7eb', marginBottom: 8 }} />
                  <div style={{ height: 12, width: '64%', borderRadius: 8, background: '#e5e7eb' }} />
                </div>
                <div className="job-card-side">
                  <div style={{ height: 32, width: 96, borderRadius: 8, background: '#e5e7eb' }} />
                  <div style={{ height: 24, width: 104, borderRadius: 999, background: '#e5e7eb' }} />
                  <div style={{ height: 36, width: 108, borderRadius: 8, background: '#d1d5db' }} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => (showSavedOnly ? savedJobIds.has(String(job._id)) : true));

  return (
    <div className="jobs-page">
      <header className="jobs-hero">
        <div className="jobs-hero-inner">
          <div className="jobs-hero-title-wrap">
            <div className="jobs-hero-icon">Search</div>
            <div>
              <h1 className="jobs-hero-title">Find your next role</h1>
              <p className="jobs-hero-subtitle">Smart filters, clean results, and one-click apply.</p>
            </div>
          </div>

          <div className="jobs-filters saas-card">
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords"
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
            />
            <select
              value={filters.jobType}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters({ ...filters, jobType: e.target.value });
              }}
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters({ ...filters, location: e.target.value });
              }}
            />
            <input
              type="text"
              placeholder="Experience (e.g. 3+)"
              value={filters.experience}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters({ ...filters, experience: e.target.value });
              }}
            />
            <input
              type="number"
              min="0"
              placeholder="Min Salary"
              value={filters.salaryMin}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters({ ...filters, salaryMin: e.target.value });
              }}
            />
            <button
              className="btn btn-ghost"
              onClick={() => {
                setCurrentPage(1);
                setSearchTerm('');
                setFilters({ jobType: '', location: '', experience: '', salaryMin: '' });
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      </header>

      <div className="jobs-main">
        {error && <RequestErrorState compact message={error} onRetry={fetchJobs} />}
        <div className="jobs-results-head">
          <h2>{showSavedOnly ? `${filteredJobs.length} Saved Jobs` : `${totalItems} Jobs Found`}</h2>
          <div className="jobs-results-actions">
            <button
              onClick={() => setShowSavedOnly((prev) => !prev)}
              className={`jobs-toggle ${showSavedOnly ? 'active' : ''}`}
            >
              {showSavedOnly ? 'Showing Saved' : 'Show Saved'}
            </button>
            <span className="jobs-sort-label">Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="salary_high">Salary: High to Low</option>
              <option value="salary_low">Salary: Low to High</option>
            </select>
          </div>
        </div>

        <div className="jobs-grid">
          {filteredJobs.map((job) => (
              <article key={job._id} className="job-card saas-card">
                <div className="job-card-main">
                  <h3>{job.title || 'Job Title Not Available'}</h3>
                  <div className="job-meta-row">
                    <span className="company-chip">{job.company || 'Infinira Tech'}</span>
                    <span className="location-chip">{job.location || 'Remote'}</span>
                    <span className="type-chip">{job.type || 'Full-time'}</span>
                  </div>
                  <p>
                    {job.description ? `${job.description.substring(0, 200)}...` : 'No description available'}
                  </p>
                </div>
                <div className="job-card-side">
                  <button
                    onClick={() => handleToggleSaveJob(job._id)}
                    disabled={savingJobId === String(job._id)}
                    className={`jobs-save-btn ${savedJobIds.has(String(job._id)) ? 'saved' : ''}`}
                  >
                    {savingJobId === String(job._id)
                      ? 'Saving...'
                      : savedJobIds.has(String(job._id))
                        ? 'Saved'
                        : 'Save Job'}
                  </button>
                  <span className="salary-chip">{job.salary || '$80k - $120k'}</span>
                  <button
                    onClick={() => handleQuickApply(job._id)}
                    disabled={applyingJobId === job._id}
                    className="btn btn-primary"
                  >
                    {applyingJobId === job._id ? 'Applying...' : 'Quick Apply'}
                  </button>
                </div>
              </article>
            ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="saas-empty-state jobs-empty-state">
            <h3>{showSavedOnly ? 'No saved jobs yet' : 'No jobs found'}</h3>
            <p>
              {showSavedOnly
                ? 'Save jobs to quickly access them here.'
                : 'Try adjusting search terms or filters to broaden results.'}
            </p>
          </div>
        )}

        <div className="jobs-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="btn btn-ghost"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="btn btn-ghost"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSearchDashboard;