import React, { useState } from 'react';
import axios from 'axios';
import './AdminView.css';
import { FaFileAlt, FaDownload, FaSort, FaInfoCircle } from 'react-icons/fa';

const MyApplications = () => {
  const [email, setEmail] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/applicants');
      const filtered = res.data.filter(app => app.email === email);
      setApplications(filtered);
      if (filtered.length === 0) setError('No applications found for this email.');
      setPage(1);
    } catch {
      setError('Failed to fetch applications.');
    }
    setLoading(false);
  };

  // Sorting
  const sortedApps = [...applications].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.appliedAt) - new Date(a.appliedAt);
    } else if (sortBy === 'status') {
      return (a.status || '').localeCompare(b.status || '');
    } else if (sortBy === 'job') {
      return (a.jobId?.title || '').localeCompare(b.jobId?.title || '');
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedApps.length / pageSize);
  const pagedApps = sortedApps.slice((page - 1) * pageSize, page * pageSize);

  // Summary
  const summary = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'Approved').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
    pending: applications.filter(a => a.status === 'Pending' || !a.status).length,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
      <div style={{ maxWidth: 900, width: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '32px 36px', fontFamily: 'Segoe UI, Arial, sans-serif', marginLeft: 0 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 18, color: '#2d3748', fontWeight: 700, letterSpacing: 1 }}>
          <FaFileAlt style={{ marginRight: 8, color: '#3182ce' }} /> My Applications
        </h1>
        {/* Info Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <FaInfoCircle style={{ color: '#2563eb', marginRight: 6 }} />
          <span style={{ color: '#4a5568', fontSize: 15 }}>Status: <span style={{ color: '#22c55e', fontWeight: 600 }}>Approved</span>, <span style={{ color: '#ef4444', fontWeight: 600 }}>Rejected</span>, <span style={{ color: '#f59e42', fontWeight: 600 }}>Pending</span></span>
        </div>
        {/* Summary Card */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ background: '#f7fafc', borderRadius: 12, padding: '16px 24px', minWidth: 120, textAlign: 'center', boxShadow: '0 2px 8px rgba(49,130,206,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#2563eb' }}>{summary.total}</div>
            <div style={{ color: '#4a5568', fontSize: 15 }}>Total</div>
          </div>
          <div style={{ background: '#e6ffed', borderRadius: 12, padding: '16px 24px', minWidth: 120, textAlign: 'center', boxShadow: '0 2px 8px rgba(34,197,94,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#22c55e' }}>{summary.approved}</div>
            <div style={{ color: '#22c55e', fontSize: 15 }}>Approved</div>
          </div>
          <div style={{ background: '#ffe6e6', borderRadius: 12, padding: '16px 24px', minWidth: 120, textAlign: 'center', boxShadow: '0 2px 8px rgba(239,68,68,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#ef4444' }}>{summary.rejected}</div>
            <div style={{ color: '#ef4444', fontSize: 15 }}>Rejected</div>
          </div>
          <div style={{ background: '#fff7e6', borderRadius: 12, padding: '16px 24px', minWidth: 120, textAlign: 'center', boxShadow: '0 2px 8px rgba(245,158,66,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#f59e42' }}>{summary.pending}</div>
            <div style={{ color: '#f59e42', fontSize: 15 }}>Pending</div>
          </div>
        </div>
        {/* Email Input */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
          <input
            className="search-bar"
            type="email"
            placeholder="Enter your email to view applications..."
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <button
            className="action-btn approve"
            style={{ minWidth: 120 }}
            onClick={fetchApplications}
            disabled={!email || loading}
          >
            View
          </button>
        </div>
        {/* Sorting */}
        {applications.length > 0 && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="action-btn" style={{ background: '#f7fafc', color: '#2563eb', border: '1px solid #2563eb' }} onClick={() => setSortBy('date')}><FaSort /> Sort by Date</button>
            <button className="action-btn" style={{ background: '#f7fafc', color: '#2563eb', border: '1px solid #2563eb' }} onClick={() => setSortBy('status')}><FaSort /> Sort by Status</button>
            <button className="action-btn" style={{ background: '#f7fafc', color: '#2563eb', border: '1px solid #2563eb' }} onClick={() => setSortBy('job')}><FaSort /> Sort by Job</button>
          </div>
        )}
        {/* Table & Pagination */}
        {loading ? (
          <div className="spinner">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="20" stroke="#3182ce" strokeWidth="6" strokeDasharray="31.4 31.4" strokeDashoffset="0">
                <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#ef4444', fontSize: 18 }}>{error}</p>
        ) : pagedApps.length === 0 ? null : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Applied At</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {pagedApps.map(app => (
                  <tr key={app._id}>
                    <td>{app.jobId?.title || 'N/A'}</td>
                    <td>
                      <a
                        href={`http://localhost:5000/uploads/${app.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3182ce', textDecoration: 'underline', fontWeight: 500 }}
                        title="View Resume"
                      >
                        View Resume
                      </a>
                    </td>
                    <td>
                      <span className={`status-badge status-${(app.status || 'pending').toLowerCase()}`} title={app.status || 'Pending'}>
                        {app.status || 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(app.appliedAt).toLocaleString()}</td>
                    <td>
                      <a href={`http://localhost:5000/uploads/${app.resume}`} download style={{ color: '#2563eb', fontSize: 18 }} title="Download Resume">
                        <FaDownload />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <button className="action-btn" style={{ background: '#f7fafc', color: '#2563eb', border: '1px solid #2563eb', minWidth: 80 }} disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span style={{ fontWeight: 600, color: '#2563eb' }}>Page {page} of {totalPages}</span>
              <button className="action-btn" style={{ background: '#f7fafc', color: '#2563eb', border: '1px solid #2563eb', minWidth: 80 }} disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
