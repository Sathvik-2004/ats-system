import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { connectSocket } from '../utils/socket';
import './ApplicationsTable.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const clampScore = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.min(100, Math.round(parsed)));
};

const getApplicationScore = (application) => clampScore(application?.aiScore ?? application?.score);

const getMatchedSkills = (application) => {
  if (Array.isArray(application?.matchingSkills) && application.matchingSkills.length > 0) {
    return application.matchingSkills;
  }
  if (Array.isArray(application?.matchedSkills) && application.matchedSkills.length > 0) {
    return application.matchedSkills;
  }
  return [];
};

const getMissingSkills = (application) => {
  if (Array.isArray(application?.missingSkills)) {
    return application.missingSkills;
  }
  return [];
};

const getScoreBand = (score) => {
  if (score === null) return 'not-scored';
  if (score >= 80) return 'strong';
  if (score >= 60) return 'medium';
  return 'low';
};

const getApplicationJobTitle = (application) => {
  if (application?.job?.title) return application.job.title;
  if (typeof application?.jobTitle === 'string' && application.jobTitle.trim()) return application.jobTitle;
  return 'Unknown Role';
};

const ApplicationsTable = () => {
  // State Management
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobTitleFilter, setJobTitleFilter] = useState('all');
  const [jobTitles, setJobTitles] = useState([]);

  // Sort
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [screeningState, setScreeningState] = useState({});

  // Status options
  const STATUS_OPTIONS = [
    { value: 'applied', label: 'Applied', color: '#3B82F6' },
    { value: 'reviewing', label: 'Reviewing', color: '#F59E0B' },
    { value: 'shortlisted', label: 'Shortlisted', color: '#8B5CF6' },
    { value: 'interview_scheduled', label: 'Interview Scheduled', color: '#10B981' },
    { value: 'selected', label: 'Selected', color: '#06B6D4' },
    { value: 'rejected', label: 'Rejected', color: '#EF4444' },
    { value: 'withdrawn', label: 'Withdrawn', color: '#6B7280' }
  ];

  const applicantsPerJob = useMemo(() => {
    const counts = applications.reduce((acc, app) => {
      const key = getApplicationJobTitle(app);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [applications]);

  const loadingSkeletonRows = useMemo(() => Array.from({ length: Math.max(5, pageSize > 20 ? 8 : 6) }), [pageSize]);

  // Fetch job titles for filter
  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/applications/filters/job-titles`, getAuthConfig());
        if (response.data.success) {
          setJobTitles(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching job titles:', err);
      }
    };
    fetchJobTitles();
  }, []);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/applications`, {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchTerm,
          status: statusFilter === 'all' ? '' : statusFilter,
          jobTitle: jobTitleFilter === 'all' ? '' : jobTitleFilter,
          sortBy,
          sortOrder
        },
        ...getAuthConfig()
      });

      if (response.data.success) {
        setApplications(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, jobTitleFilter, sortBy, sortOrder]);

  // Fetch applications when filters/sort change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, jobTitleFilter]);

  // Fetch applications when page or sort changes
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchApplications();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchApplications]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const handleRealtimeApplications = () => {
      fetchApplications();
    };

    socket.on('application:new', handleRealtimeApplications);
    socket.on('application:status-updated', handleRealtimeApplications);
    socket.on('application:withdrawn', handleRealtimeApplications);
    socket.on('interview:scheduled', handleRealtimeApplications);

    return () => {
      socket.off('application:new', handleRealtimeApplications);
      socket.off('application:status-updated', handleRealtimeApplications);
      socket.off('application:withdrawn', handleRealtimeApplications);
      socket.off('interview:scheduled', handleRealtimeApplications);
    };
  }, [fetchApplications]);

  // Handle selection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const newSet = new Set(applications.map(app => app._id));
      setSelectedIds(newSet);
      setSelectAll(true);
    }
  };

  const handleSelectOne = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
    setSelectAll(newSet.size === applications.length);
  };

  // Update status
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const commentInput = window.prompt('Add feedback/comment for this status update (optional):', '');
      if (commentInput === null) {
        return;
      }

      setUpdatingStatus(prev => ({ ...prev, [appId]: true }));
      const response = await axios.put(
        `${API_URL}/api/applications/${appId}/status`,
        {
          status: newStatus,
          notes: commentInput.trim()
        },
        getAuthConfig()
      );

      if (response.data.success) {
        setApplications(prev =>
          prev.map(app => app._id === appId ? response.data.data : app)
        );
        toast.success('Status updated successfully');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appId]: false }));
    }
  };

  // Delete application
  const handleDeleteApplication = async (appId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        const response = await axios.delete(`${API_URL}/api/applications/${appId}`, getAuthConfig());
        if (response.data.success) {
          setApplications(prev => prev.filter(app => app._id !== appId));
          toast.success('Application deleted successfully');
        }
      } catch (err) {
        console.error('Error deleting application:', err);
        toast.error(err.response?.data?.message || 'Failed to delete application');
      }
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      toast.warning('No applications selected');
      return;
    }

    if (window.confirm(`Delete ${selectedIds.size} application(s)?`)) {
      try {
        const response = await axios.post(`${API_URL}/api/applications/bulk/delete`, {
          applicationIds: Array.from(selectedIds)
        }, getAuthConfig());

        if (response.data.success) {
          setApplications(prev =>
            prev.filter(app => !selectedIds.has(app._id))
          );
          setSelectedIds(new Set());
          setSelectAll(false);
          toast.success(`Deleted ${response.data.data.deleted} applications`);
        }
      } catch (err) {
        console.error('Error deleting applications:', err);
        toast.error(err.response?.data?.message || 'Failed to delete applications');
      }
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/applications/export/csv`, {
        params: {
          status: statusFilter === 'all' ? '' : statusFilter,
          jobTitle: jobTitleFilter === 'all' ? '' : jobTitleFilter
        },
        responseType: 'blob',
        ...getAuthConfig()
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast.error(err.response?.data?.message || 'Failed to export CSV');
    }
  };

  const handleAIScreen = async (application) => {
    if (!application?._id) return;

    try {
      setScreeningState((prev) => ({ ...prev, [application._id]: true }));
      const response = await axios.put(
        `${API_URL}/api/ai/screen/${application._id}`,
        {},
        getAuthConfig()
      );

      if (response.data?.success) {
        const updatedApplication = response.data?.data?.application;
        const matchScore = response.data?.data?.matchScore;
        const matchedSkills = response.data?.data?.matchedSkills || [];
        const missingSkills = response.data?.data?.missingSkills || [];

        setApplications((prev) => prev.map((item) => {
          if (item._id !== application._id) return item;
          return {
            ...item,
            ...(updatedApplication || {}),
            score: typeof matchScore === 'number' ? matchScore : item.score,
            matchingSkills: matchedSkills,
            missingSkills
          };
        }));

        if (selectedApplication?._id === application._id) {
          setSelectedApplication((prev) => ({
            ...prev,
            ...(updatedApplication || {}),
            score: typeof matchScore === 'number' ? matchScore : prev?.score,
            matchingSkills: matchedSkills,
            missingSkills
          }));
        }

        toast.success('AI screening completed');
      }
    } catch (err) {
      console.error('AI screening error:', err);
      toast.error(err.response?.data?.message || 'Failed to run AI screening');
    } finally {
      setScreeningState((prev) => ({ ...prev, [application._id]: false }));
    }
  };

  // Render
  if (error) {
    return (
      <div className="applications-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchApplications} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-container">
      {/* Header */}
      <div className="applications-header">
        <h1>📋 Applications Management</h1>
        <div className="header-stats">
          <span className="stat">Selected: {selectedIds.size}</span>
          <span className="stat">Total: {applications.length}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
            title="Filter by status"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={jobTitleFilter}
            onChange={(e) => setJobTitleFilter(e.target.value)}
            className="filter-select"
            title="Filter by job title"
          >
            <option value="all">All Jobs</option>
            {jobTitles.map(job => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
            title="Sort field"
          >
            <option value="createdAt">Sort: Applied Date</option>
            <option value="candidateName">Sort: Candidate Name</option>
            <option value="jobTitle">Sort: Job Role</option>
            <option value="status">Sort: Status</option>
            <option value="score">Sort: Score</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
            title="Sort order"
          >
            <option value="desc">Order: Descending</option>
            <option value="asc">Order: Ascending</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            className="filter-select"
            title="Items per page"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <div className="actions">
          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete} className="btn btn-danger">
              🗑️ Delete ({selectedIds.size})
            </button>
          )}
          <button onClick={handleExportCSV} className="btn btn-secondary">
            📥 Export CSV
          </button>
          <button onClick={fetchApplications} className="btn btn-primary">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="applicants-summary saas-card">
        <div className="applicants-summary-title">Applicants Per Job (current results)</div>
        <div className="applicants-summary-chips">
          <button
            type="button"
            onClick={() => setJobTitleFilter('all')}
            className={`summary-chip ${jobTitleFilter === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          {applicantsPerJob.map(([title, count]) => (
            <button
              key={title}
              type="button"
              onClick={() => setJobTitleFilter(title)}
              className={`summary-chip ${jobTitleFilter === title ? 'active' : ''}`}
              title={`Filter by ${title}`}
            >
              {title} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading animate-pulse" aria-label="Loading applications table">
            {loadingSkeletonRows.map((_, idx) => (
              <div key={idx} className="table-skeleton-row">
                <div className="table-skeleton-cell saas-skeleton" />
                <div className="table-skeleton-cell saas-skeleton" />
                <div className="table-skeleton-cell saas-skeleton" />
                <div className="table-skeleton-cell saas-skeleton" />
                <div className="table-skeleton-cell saas-skeleton" />
                <div className="table-skeleton-cell saas-skeleton" />
                <div className="table-skeleton-cell saas-skeleton" />
                <div className="table-skeleton-cell saas-skeleton" />
                <div className="table-skeleton-cell saas-skeleton" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="no-data saas-empty-state">
            <p>No applications found for the current filters.</p>
          </div>
        ) : (
          <table className="applications-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    title="Select all"
                  />
                </th>
                <th>Candidate Name</th>
                <th>Email</th>
                <th>Job Title</th>
                <th>Status</th>
                <th>Resume</th>
                <th>Score</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className={selectedIds.has(app._id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app._id)}
                      onChange={() => handleSelectOne(app._id)}
                    />
                  </td>
                  <td className="candidate-name">{app.candidateName}</td>
                  <td className="email">{app.candidateEmail}</td>
                  <td className="job-title">{getApplicationJobTitle(app)}</td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                      disabled={updatingStatus[app._id]}
                      className={`status-select status-${app.status}`}
                      style={{
                        borderColor: STATUS_OPTIONS.find(s => s.value === app.status)?.color
                      }}
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="resume-links">
                    {app.resumeUrl ? (
                      <div className="resume-actions">
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="action-btn view-btn"
                          title="View resume"
                        >
                          View
                        </a>
                        <a
                          href={app.resumeUrl}
                          download={app.resumeName || 'resume.pdf'}
                          className="action-btn download-btn"
                          title="Download resume"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="muted-xs">No resume</span>
                    )}
                  </td>
                  <td className="score">
                    {(() => {
                      const score = getApplicationScore(app);
                      const matchedSkills = getMatchedSkills(app);
                      const missingSkills = getMissingSkills(app);

                      if (score === null) {
                        return <span className="muted-xs">Not screened</span>;
                      }

                      return (
                        <div className="score-bar" title={`AI match score: ${score}/100`}>
                          <div className="score-headline">
                            <span className={`score-chip ${getScoreBand(score)}`}>{score}/100</span>
                          </div>
                          <div className="score-progress">
                            <div
                              className="score-fill"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <div className="score-hint">Matched: {matchedSkills.length} | Missing: {missingSkills.length}</div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="date">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => {
                        setSelectedApplication(app);
                        setShowDetailsModal(true);
                      }}
                      className="action-btn view-btn"
                      title="View details"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleAIScreen(app)}
                      className="action-btn"
                      title="Run AI screening"
                      disabled={screeningState[app._id]}
                      style={{ background: '#0f766e', color: '#fff' }}
                    >
                      {screeningState[app._id] ? '...' : 'AI'}
                    </button>
                    <button
                      onClick={() => handleDeleteApplication(app._id)}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-pagination"
          >
            ← Previous
          </button>

          <div className="page-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-pagination"
          >
            Next →
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {(() => {
                const modalScore = getApplicationScore(selectedApplication);
                const matchedSkills = getMatchedSkills(selectedApplication);
                const missingSkills = getMissingSkills(selectedApplication);

                return (
                  <section className="ai-insights-panel" aria-label="AI resume screening insights">
                    <div className="ai-insights-header">
                      <h3>AI Resume Screening</h3>
                      <span className={`score-chip ${getScoreBand(modalScore)}`}>
                        {modalScore === null ? 'Not screened' : `${modalScore}/100`}
                      </span>
                    </div>

                    <div className="ai-score-row">
                      <div className="ai-score-track">
                        <div
                          className="ai-score-fill"
                          style={{ width: `${modalScore ?? 0}%` }}
                        />
                      </div>
                      <span className="ai-score-value">{modalScore === null ? '--' : `${modalScore}%`}</span>
                    </div>

                    <div className="ai-summary-chips">
                      <span className="ai-summary-chip matched">Matched skills: {matchedSkills.length}</span>
                      <span className="ai-summary-chip missing">Missing skills: {missingSkills.length}</span>
                    </div>

                    <div className="ai-detail-block">
                      <label className="ai-detail-label">Matched Skills</label>
                      <div className="ai-chip-wrap">
                        {matchedSkills.length === 0 ? (
                          <span className="muted-xs">No matched skills yet</span>
                        ) : (
                          matchedSkills.slice(0, 24).map((skill, index) => (
                            <span key={`match-${index}`} className="ai-chip matched">
                              {skill}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="ai-detail-block">
                      <label className="ai-detail-label">Missing Skills</label>
                      <div className="ai-chip-wrap">
                        {missingSkills.length === 0 ? (
                          <span className="muted-xs">No missing skills</span>
                        ) : (
                          missingSkills.slice(0, 24).map((skill, index) => (
                            <span key={`missing-${index}`} className="ai-chip missing">
                              {skill}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                );
              })()}

              <div className="detail-row">
                <label>Candidate Name:</label>
                <span>{selectedApplication.candidateName}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedApplication.candidateEmail}</span>
              </div>
              <div className="detail-row">
                <label>Job Title:</label>
                <span>{getApplicationJobTitle(selectedApplication)}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge status-${selectedApplication.status}`}>
                  {STATUS_OPTIONS.find(s => s.value === selectedApplication.status)?.label}
                </span>
              </div>
              <div className="ai-detail-block">
                <button
                  type="button"
                  onClick={() => handleAIScreen(selectedApplication)}
                  disabled={screeningState[selectedApplication._id]}
                  className="btn btn-primary"
                >
                  {screeningState[selectedApplication._id] ? 'Running AI Screening...' : 'Run AI Screening'}
                </button>
              </div>
              <div className="detail-row">
                <label>Applied Date:</label>
                <span>{new Date(selectedApplication.createdAt).toLocaleString()}</span>
              </div>
              {selectedApplication.interviewScheduled?.date && (
                <>
                  <div className="detail-row">
                    <label>Interview Date:</label>
                    <span>
                      {new Date(selectedApplication.interviewScheduled.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Interview Time:</label>
                    <span>{selectedApplication.interviewScheduled.time}</span>
                  </div>
                </>
              )}
              {selectedApplication.notes && (
                <div className="detail-row">
                  <label>Notes:</label>
                  <span>{selectedApplication.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTable;
