import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import QuickActionsWidget from './QuickActionsWidget';

const AdminDashboard = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/applicants');
      console.log('Fetched applicants:', res.data);
      setApplicants(res.data);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast.error('Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id, status) => {
    setUpdatingStatus(prev => ({ ...prev, [id]: true }));
    try {
      const updatedApplicant = await axios.put(`http://localhost:5000/api/applicants/${id}/status`, {
        status,
        notes: `Status updated to ${status}`
      });

      if (updatedApplicant.data) {
        setApplicants(prev => prev.map(app => 
          app._id === id ? { ...app, status } : app
        ));
        toast.success(`Application status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Under Review': return '#3b82f6';
      case 'Interview Scheduled': return '#8b5cf6';
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleSelectApplication = (id) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredApplicants = getFilteredApplicants();
    if (selectedApplications.length === filteredApplicants.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplicants.map(app => app._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedApplications.length === 0) {
      toast.error('Please select applications and an action');
      return;
    }

    const confirmMessage = `Are you sure you want to ${bulkAction.toLowerCase()} ${selectedApplications.length} application(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/applicants/bulk-update', {
        applicationIds: selectedApplications,
        status: bulkAction,
        notes: `Bulk ${bulkAction.toLowerCase()} by admin`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`${selectedApplications.length} applications ${bulkAction.toLowerCase()} successfully`);
      setSelectedApplications([]);
      setBulkAction('');
      fetchApplicants();
    } catch (error) {
      toast.error('Failed to perform bulk action');
      console.error('Bulk action error:', error);
    }
  };

  const autoProcessApplications = async () => {
    if (!window.confirm('Auto-process all pending applications based on predefined criteria?')) {
      return;
    }

    setAutoProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/applicants/auto-process', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Auto-processed ${response.data.processedCount} applications`);
      fetchApplicants();
    } catch (error) {
      toast.error('Auto-processing failed');
      console.error('Auto-processing error:', error);
    } finally {
      setAutoProcessing(false);
    }
  };

  const getFilteredApplicants = () => {
    return applicants.filter(applicant => {
      if (filterStatus === 'all') return true;
      return applicant.status === filterStatus;
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e3e6f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }}></div>
          <p style={{ color: '#666', fontSize: '18px', margin: 0 }}>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '30px',
          textAlign: 'center',
        }}>
          <h1 style={{ margin: '0 0 10px', fontSize: '2.5rem', fontWeight: 700 }}>
            🏢 Admin Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
            Manage job applications and candidate reviews
          </p>
        </div>

        {/* Control Panel */}
        <div style={{
          padding: '20px 30px',
          background: '#f8fafc',
          borderBottom: '2px solid #e2e8f0',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {/* Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontWeight: 600, color: '#374151' }}>Filter:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#fff',
              }}
            >
              <option value="all">All Applications</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Auto Process */}
          <button
            onClick={autoProcessApplications}
            disabled={autoProcessing}
            style={{
              background: autoProcessing ? '#9ca3af' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: autoProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {autoProcessing ? '⏳ Processing...' : '🤖 Auto-Process'}
          </button>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>
                {selectedApplications.length} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#fff',
                }}
              >
                <option value="">Choose Action</option>
                <option value="Approved">Approve</option>
                <option value="Rejected">Reject</option>
                <option value="Under Review">Under Review</option>
                <option value="Interview Scheduled">Schedule Interview</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                style={{
                  background: bulkAction ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' : '#9ca3af',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: bulkAction ? 'pointer' : 'not-allowed',
                }}
              >
                Apply Bulk Action
              </button>
            </div>
          )}
        </div>

        {/* Applications Table */}
        {getFilteredApplicants().length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.5rem' }}>No Applications Found</h3>
            <p style={{ margin: 0, fontSize: '1rem' }}>
              {filterStatus === 'all' 
                ? 'No applications have been submitted yet.' 
                : `No applications with status "${filterStatus}" found.`
              }
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              padding: '20px 32px',
              fontWeight: 600,
              fontSize: 18,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>Applications ({getFilteredApplicants().length})</span>
              <button
                onClick={handleSelectAll}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {selectedApplications.length === getFilteredApplicants().length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    background: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0',
                  }}>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'center',
                      color: '#2d3748',
                      fontWeight: 600,
                      fontSize: 14,
                      width: '50px',
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedApplications.length === getFilteredApplicants().length && getFilteredApplicants().length > 0}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      color: '#2d3748',
                      fontWeight: 600,
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>Name</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      color: '#2d3748',
                      fontWeight: 600,
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>Email</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      color: '#2d3748',
                      fontWeight: 600,
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>Job Title</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'center',
                      color: '#2d3748',
                      fontWeight: 600,
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>Status</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'center',
                      color: '#2d3748',
                      fontWeight: 600,
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>Resume</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'center',
                      color: '#2d3748',
                      fontWeight: 600,
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      width: '200px',
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredApplicants().map((applicant, index) => (
                    <tr key={applicant._id} style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: index % 2 === 0 ? '#fff' : '#f8fafc',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.target.parentElement.style.background = index % 2 === 0 ? '#fff' : '#f8fafc'}
                    >
                      <td style={{
                        padding: '16px 24px',
                        textAlign: 'center',
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(applicant._id)}
                          onChange={() => handleSelectApplication(applicant._id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        color: '#2d3748',
                        fontWeight: 500,
                      }}>
                        <div>{applicant.name}</div>
                        <div style={{
                          fontSize: 12,
                          color: '#6b7280',
                          marginTop: 4,
                        }}>
                          Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        color: '#4a5568',
                      }}>{applicant.email}</td>
                      <td style={{
                        padding: '16px 24px',
                        color: '#4a5568',
                      }}>{applicant.jobId?.title || 'N/A'}</td>
                      <td style={{
                        padding: '16px 24px',
                        textAlign: 'center',
                      }}>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{
                            background: getStatusColor(applicant.status) + '20',
                            color: getStatusColor(applicant.status),
                            padding: '4px 8px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                          }}>
                            {applicant.status}
                          </span>
                        </div>
                        <select
                          value={applicant.status}
                          onChange={(e) => updateApplicationStatus(applicant._id, e.target.value)}
                          disabled={updatingStatus[applicant._id]}
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: 4,
                            fontSize: 12,
                            background: '#fff',
                            cursor: updatingStatus[applicant._id] ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        textAlign: 'center',
                      }}>
                        <a
                          href={`http://localhost:5000/uploads/${applicant.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'linear-gradient(90deg,#3182ce 0%,#00bcd4 100%)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: 6,
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 500,
                            transition: 'opacity 0.2s',
                            display: 'inline-block',
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          📄 View Resume
                        </a>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        textAlign: 'center',
                      }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => updateApplicationStatus(applicant._id, 'Approved')}
                            disabled={updatingStatus[applicant._id] || applicant.status === 'Approved'}
                            style={{
                              background: applicant.status === 'Approved' ? '#d1d5db' : '#10b981',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: updatingStatus[applicant._id] || applicant.status === 'Approved' ? 'not-allowed' : 'pointer',
                            }}
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(applicant._id, 'Rejected')}
                            disabled={updatingStatus[applicant._id] || applicant.status === 'Rejected'}
                            style={{
                              background: applicant.status === 'Rejected' ? '#d1d5db' : '#ef4444',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: updatingStatus[applicant._id] || applicant.status === 'Rejected' ? 'not-allowed' : 'pointer',
                            }}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Widget */}
      <QuickActionsWidget />
    </div>
  );
};

export default AdminDashboard;