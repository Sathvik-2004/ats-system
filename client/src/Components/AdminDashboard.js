import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';
import ToastNotification from './ToastNotification';
import AdvancedSearch from './AdvancedSearch';
import BulkActions from './BulkActions';
import DataExporter from './DataExporter';

const AdminDashboard = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userFilter, setUserFilter] = useState('all'); // New: Filter by specific user
  const [uniqueUsers, setUniqueUsers] = useState([]); // New: List of unique users

  useEffect(() => {
    // Check if user is actually an admin
    const userType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');
    
    if (!token || userType !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      window.location.href = '/';
      return;
    }
    
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching applications with token:', token ? 'Present' : 'Missing');
      
      const res = await axios.get('http://localhost:5000/api/admin/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched applicants:', res.data);
      setApplicants(res.data);
      
      // Extract unique users for filtering
      const users = [...new Set(res.data.map(app => app.email))].filter(Boolean);
      setUniqueUsers(users);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Admin authentication required');
        localStorage.clear();
        window.location.href = '/';
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Backend server is not running. Please start the server.');
        // Use mock data when server is down
        const mockData = generateMockApplications();
        setApplicants(mockData);
        const users = [...new Set(mockData.map(app => app.email))].filter(Boolean);
        setUniqueUsers(users);
      } else {
        toast.error('Failed to fetch applicants: ' + (error.response?.data?.message || error.message));
        // Use mock data as fallback
        const mockData = generateMockApplications();
        setApplicants(mockData);
        const users = [...new Set(mockData.map(app => app.email))].filter(Boolean);
        setUniqueUsers(users);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate mock applications for fallback
  const generateMockApplications = () => {
    return [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Full Stack Developer',
        status: 'pending',
        appliedAt: new Date().toISOString(),
        resumeUrl: '/mock-resume.pdf',
        score: 85
      },
      {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        jobTitle: 'Frontend Developer',
        status: 'approved',
        appliedAt: new Date(Date.now() - 86400000).toISOString(),
        resumeUrl: '/mock-resume-2.pdf',
        score: 92
      },
      {
        _id: '3',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        jobTitle: 'Backend Developer',
        status: 'interview',
        appliedAt: new Date(Date.now() - 172800000).toISOString(),
        resumeUrl: '/mock-resume-3.pdf',
        score: 78
      },
      {
        _id: '4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        jobTitle: 'DevOps Engineer',
        status: 'rejected',
        appliedAt: new Date(Date.now() - 259200000).toISOString(),
        resumeUrl: '/mock-resume-4.pdf',
        score: 65
      }
    ];
  };

  const updateApplicationStatus = async (id, status) => {
    setUpdatingStatus(prev => ({ ...prev, [id]: true }));
    try {
      const updatedApplicant = await axios.put(`http://localhost:5000/api/admin/applications/${id}/status`, {
        status,
        notes: `Status updated to ${status}`
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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
    if (!window.confirm('🤖 Auto-process pending and under review applications?\n\nThis will automatically:\n• APPROVE high-scoring candidates (75+ points)\n• REJECT low-scoring applications (35 or below)\n• SCHEDULE INTERVIEWS for good candidates (65+ points)\n• FINALIZE Under Review applications (more decisive)\n• Continue processing until completion')) {
      return;
    }

    setAutoProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/auto-process', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { statistics, processedCount } = response.data;
      
      if (processedCount > 0) {
        toast.success(
          `🎉 Auto-processed ${processedCount} applications!\n` +
          `✅ Approved: ${statistics.approved}\n` +
          `❌ Rejected: ${statistics.rejected}\n` +
          `📅 Interviews: ${statistics.interviewed}\n` +
          `👁️ Under Review: ${statistics.underReview}`,
          { autoClose: 8000 }
        );
      } else {
        toast.info('No pending applications to process');
      }
      
      fetchApplicants();
    } catch (error) {
      console.error('Auto-processing error:', error);
      if (error.response?.status === 401) {
        toast.error('Admin authentication required');
      } else {
        toast.error('Auto-processing failed: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setAutoProcessing(false);
    }
  };

  const getFilteredApplicants = () => {
    return applicants.filter(applicant => {
      // Filter by status
      const statusMatch = filterStatus === 'all' || applicant.status === filterStatus;
      
      // Filter by user email
      const userMatch = userFilter === 'all' || applicant.email === userFilter;
      
      return statusMatch && userMatch;
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
        <LoadingSpinner size="large" text="Loading applications..." />
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
        }}>
          {/* Advanced Search */}
          <AdvancedSearch 
            onSearch={(filters) => {
              console.log('Search filters:', filters);
              // Apply advanced search filters
              setFilterStatus(filters.status || 'all');
              // You can extend this to handle other filters
            }}
            onClear={() => {
              setFilterStatus('all');
              setUserFilter('all');
            }}
          />
          
          {/* Traditional Filters Row */}
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: '16px'
          }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 600, color: '#374151' }}>Status:</label>
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
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* User Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 600, color: '#374151' }}>User:</label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '6px',
                    fontSize: '14px',
                  background: '#fff',
                  minWidth: '200px',
                }}
              >
                <option value="all">All Users</option>
                {uniqueUsers.map(email => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
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
          </div>

          {/* Enhanced Bulk Actions */}
          {selectedApplications.length > 0 && (
            <BulkActions
              selectedItems={selectedApplications}
              onBulkAction={async (action, items) => {
                try {
                  const token = localStorage.getItem('token');
                  await axios.post('http://localhost:5000/api/applicants/bulk-update', {
                    applicationIds: items,
                    status: action,
                    notes: `Bulk ${action.toLowerCase()} by admin`
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });

                  toast.success(`${items.length} applications ${action.toLowerCase()} successfully`);
                  setSelectedApplications([]);
                  fetchApplicants();
                } catch (error) {
                  toast.error('Failed to perform bulk action');
                  console.error('Bulk action error:', error);
                }
              }}
              onClear={() => setSelectedApplications([])}
            />
          )}

          {/* Data Export */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            <DataExporter
              data={getFilteredApplicants()}
              filename="applications"
              onExport={(exportInfo) => {
                toast.success(`Exported ${exportInfo.recordCount} records as ${exportInfo.format.toUpperCase()}`);
              }}
            />
            
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
          </div>
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
    </div>
  );
};

export default AdminDashboard;