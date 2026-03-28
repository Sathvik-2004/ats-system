import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { connectSocket } from '../utils/socket';
import LoadingSpinner from './common/LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const mapStatusForUi = (status) => {
  const statusMap = {
    applied: 'Applied',
    reviewing: 'Screening',
    shortlisted: 'Screening',
    interview_scheduled: 'Interview',
    selected: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  };
  return statusMap[status] || status || 'Pending';
};

const WORKFLOW_STAGES = ['applied', 'screening', 'interview', 'offer', 'rejected'];

const WORKFLOW_LABELS = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected'
};

const mapStatusToWorkflowStage = (status) => {
  if (status === 'reviewing' || status === 'shortlisted') return 'screening';
  if (status === 'interview_scheduled') return 'interview';
  if (status === 'selected') return 'offer';
  if (status === 'rejected') return 'rejected';
  if (status === 'withdrawn') return null;
  return 'applied';
};

const getInterviewModeLabel = (rawMode) => {
  const normalized = String(rawMode || '').trim().toLowerCase();
  if (normalized === 'in-person' || normalized === 'in person' || normalized === 'in_person') {
    return 'In-person';
  }
  if (normalized === 'online') {
    return 'Online';
  }
  return 'TBD';
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [withdrawConfirm, setWithdrawConfirm] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchStats();

    const intervalId = setInterval(() => {
      fetchApplications({ silent: true });
      fetchStats();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const handleRealtimeUpdate = () => {
      fetchApplications({ silent: true });
      fetchStats();
      setLastSyncAt(new Date());
    };

    socket.on('application:new', handleRealtimeUpdate);
    socket.on('application:status-updated', handleRealtimeUpdate);
    socket.on('application:withdrawn', handleRealtimeUpdate);
    socket.on('interview:scheduled', handleRealtimeUpdate);

    return () => {
      socket.off('application:new', handleRealtimeUpdate);
      socket.off('application:status-updated', handleRealtimeUpdate);
      socket.off('application:withdrawn', handleRealtimeUpdate);
      socket.off('interview:scheduled', handleRealtimeUpdate);
    };
  }, []);

  const fetchApplications = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        if (applications.length === 0) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/applications/mine`, {
        params: { includeWithdrawn: true },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const normalized = (response.data.applications || []).map((application) => ({
          ...application,
          _id: application._id || application.id,
          statusRaw: application.status,
          status: mapStatusForUi(application.status),
          appliedDate: application.appliedDate || application.createdAt,
          statusHistory: Array.isArray(application.statusHistory) ? application.statusHistory : []
        }));
        setApplications(normalized);
        setLastSyncAt(new Date());
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      if (!silent) {
        setApplications([]);
        toast.error(error?.response?.data?.message || 'Failed to fetch your applications');
      }
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/applications/mine/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching stats from API:', error);
      setStats({ total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0 });
    }
  };

  const handleWithdraw = async (applicationId) => {
    try {
      if (!applicationId) {
        toast.error('Unable to withdraw: missing application ID');
        return;
      }

      setWithdrawing(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/applications/${applicationId}/withdraw`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Application withdrawn successfully');
        setWithdrawConfirm(null);
        fetchApplications({ silent: false });
        fetchStats();
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      const message = error.response?.data?.message || 'Failed to withdraw application';
      toast.error(message);
    } finally {
      setWithdrawing(false);
    }
  };

  const canWithdraw = (status) => {
    // Allow withdraw for applied, reviewing, shortlisted, and interview scheduled status
    return ['applied', 'reviewing', 'shortlisted', 'interview_scheduled'].includes(status);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': '#f59e0b',
      'Screening': '#3b82f6',
      'Interview': '#8b5cf6',
      'Offer': '#10b981',
      'Rejected': '#ef4444',
      'Withdrawn': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Applied': '⏳',
      'Screening': '👀',
      'Interview': '📅',
      'Offer': '✅',
      'Rejected': '❌',
      'Withdrawn': '🚫'
    };
    return icons[status] || '📄';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner fullscreen label="Loading your applications..." />;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
    }}>
      {/* Enhanced Navigation Bar */}
      <div style={{
        background: '#fff',
        padding: '16px 32px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            padding: '12px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '18px',
          }}>
            ATS
          </div>
          <h2 style={{ margin: 0, color: '#2d3748', fontWeight: 600 }}>Job Portal</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a 
            href="/user-dashboard"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            🏠 Back to Dashboard
          </a>
          
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            style={{
              background: '#e53e3e',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#c53030';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#e53e3e';
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Enhanced Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              backdropFilter: 'blur(10px)',
            }}>
              📊
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 40,
                fontWeight: 700,
                marginBottom: '8px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                My Applications
              </h1>
              <p style={{
                margin: 0,
                fontSize: 18,
                opacity: 0.9,
                fontWeight: 300,
              }}>
                Track your job applications and their current status
              </p>
              <p style={{
                margin: '10px 0 0 0',
                fontSize: 14,
                opacity: 0.9,
                fontWeight: 500,
              }}>
                {lastSyncAt ? `Live • Updated ${lastSyncAt.toLocaleTimeString()}` : 'Live updates enabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchApplications();
              fetchStats();
            }}
            disabled={refreshing}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '10px',
              padding: '10px 16px',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.7 : 1,
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px',
      }}>
        {/* Enhanced Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}>
          {[
            { 
              value: stats.total || 0, 
              label: 'Total Applications', 
              icon: '📋', 
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              shadowColor: 'rgba(102, 126, 234, 0.3)'
            },
            { 
              value: stats.pending || 0, 
              label: 'Pending', 
              icon: '⏳', 
              gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              shadowColor: 'rgba(245, 158, 11, 0.3)'
            },
            { 
              value: stats.underReview || 0, 
              label: 'Under Review', 
              icon: '👀', 
              gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              shadowColor: 'rgba(59, 130, 246, 0.3)'
            },
            { 
              value: stats.approved || 0, 
              label: 'Approved', 
              icon: '✅', 
              gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              shadowColor: 'rgba(16, 185, 129, 0.3)'
            },
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '32px 24px',
                textAlign: 'center',
                boxShadow: `0 10px 30px ${stat.shadowColor}`,
                border: '1px solid rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = `0 20px 40px ${stat.shadowColor}`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `0 10px 30px ${stat.shadowColor}`;
              }}
            >
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: stat.gradient,
                opacity: 0.1,
                borderRadius: '50%',
                pointerEvents: 'none',
              }}></div>
              
              <div style={{
                width: '60px',
                height: '60px',
                background: stat.gradient,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                margin: '0 auto 16px',
                position: 'relative',
                zIndex: 1,
              }}>
                {stat.icon}
              </div>
              
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 800, 
                background: stat.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                position: 'relative',
                zIndex: 1,
              }}>
                {stat.value}
              </div>
              
              <div style={{ 
                color: '#6b7280', 
                fontSize: '16px', 
                fontWeight: 600,
                position: 'relative',
                zIndex: 1,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Applications List */}
        {applications.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            padding: '64px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}></div>
            
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              margin: '0 auto 24px',
              position: 'relative',
              zIndex: 1,
            }}>
              📭
            </div>
            
            <h3 style={{
              color: '#1f2937',
              fontWeight: 700,
              fontSize: 28,
              marginBottom: 16,
              position: 'relative',
              zIndex: 1,
            }}>No Applications Yet</h3>
            
            <p style={{
              color: '#6b7280',
              fontSize: 18,
              marginBottom: 32,
              lineHeight: 1.6,
              position: 'relative',
              zIndex: 1,
            }}>You haven't submitted any job applications yet.<br/>Start applying for your dream job!</p>
            
            <a 
              href="/user-dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                padding: '16px 32px',
                borderRadius: 16,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 16,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s',
                position: 'relative',
                zIndex: 1,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              🚀 Apply for Jobs
            </a>
          </div>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              padding: '24px 32px',
              fontWeight: 700,
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{ fontSize: '24px' }}>📋</span>
              Recent Applications ({applications.length})
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
            }}>
              {applications.map((application, index) => (
                <div 
                  key={application._id || application.id || index} 
                  style={{
                    background: '#fff',
                    padding: '28px 32px',
                    borderBottom: index < applications.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f8fafc';
                    e.target.style.transform = 'translateX(8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fff';
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '24px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '12px',
                      }}>
                        <h3 style={{
                          color: '#1f2937',
                          fontWeight: 700,
                          fontSize: 20,
                          margin: 0,
                        }}>
                          {application.jobTitle}
                        </h3>
                        <span style={{
                          background: getStatusColor(application.status) + '15',
                          color: getStatusColor(application.status),
                          padding: '6px 16px',
                          borderRadius: 25,
                          fontSize: 14,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: `2px solid ${getStatusColor(application.status)}30`,
                        }}>
                          <span style={{ fontSize: '16px' }}>{getStatusIcon(application.status)}</span>
                          {application.status}
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '8px',
                      }}>
                        <p style={{
                          color: '#6b7280',
                          fontSize: 16,
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <span style={{ fontSize: '16px' }}>🏢</span>
                          {application.company}
                        </p>
                        <p style={{
                          color: '#9ca3af',
                          fontSize: 14,
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          <span style={{ fontSize: '14px' }}>📅</span>
                          Applied {formatDate(application.appliedDate || application.createdAt)}
                        </p>
                      </div>

                      <div style={{ marginTop: '14px' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                          gap: '8px',
                          alignItems: 'center'
                        }}>
                          {WORKFLOW_STAGES.map((stage, stageIndex) => {
                            const mappedStage = mapStatusToWorkflowStage(application.statusRaw || 'applied');
                            const currentIndex = WORKFLOW_STAGES.indexOf(mappedStage);
                            const isReached = currentIndex >= stageIndex;
                            const isCurrent = currentIndex === stageIndex;

                            return (
                              <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  background: isReached ? '#667eea' : '#d1d5db',
                                  boxShadow: isCurrent ? '0 0 0 4px rgba(102, 126, 234, 0.2)' : 'none'
                                }} />
                                <span style={{
                                  fontSize: 11,
                                  fontWeight: isCurrent ? 700 : 500,
                                  color: isReached ? '#374151' : '#9ca3af',
                                  textAlign: 'center'
                                }}>
                                  {WORKFLOW_LABELS[stage]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {application.notes && (
                        <div style={{
                          background: '#f8fafc',
                          padding: '12px 16px',
                          borderRadius: 12,
                          marginTop: '12px',
                          borderLeft: '4px solid #667eea',
                        }}>
                          <p style={{
                            color: '#4b5563',
                            fontSize: 14,
                            margin: 0,
                            fontStyle: 'italic',
                          }}>
                            💬 {application.notes}
                          </p>
                        </div>
                      )}

                      {application.statusRaw === 'interview_scheduled' && application.interviewScheduled && (
                        <div style={{
                          background: '#f5f3ff',
                          padding: '12px 16px',
                          borderRadius: 12,
                          marginTop: '12px',
                          borderLeft: '4px solid #8b5cf6',
                        }}>
                          <p style={{
                            color: '#4c1d95',
                            fontSize: 14,
                            margin: 0,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            alignItems: 'center'
                          }}>
                            <span>📅 {application.interviewScheduled?.date ? formatDate(application.interviewScheduled.date) : 'Date TBD'}</span>
                            <span>🕒 {application.interviewScheduled?.time || 'Time TBD'}</span>
                            <span>📍 {getInterviewModeLabel(application.interviewScheduled?.mode)}</span>
                            {application.interviewScheduled?.interviewLink && (
                              <span>🔗 {application.interviewScheduled.interviewLink}</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '12px',
                    }}>
                      {canWithdraw(application.statusRaw) && (
                        <button
                          onClick={() => setWithdrawConfirm(application)}
                          disabled={withdrawing}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            padding: '8px 14px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: withdrawing ? 'not-allowed' : 'pointer',
                            opacity: withdrawing ? 0.6 : 1,
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => {
                            if (!withdrawing) {
                              e.target.style.background = '#fecaca';
                              e.target.style.borderColor = '#f87171';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#fee2e2';
                            e.target.style.borderColor = '#fca5a5';
                          }}
                        >
                          🚫 Withdraw
                        </button>
                      )}
                      {application.reviewedAt && (
                        <div style={{
                          background: '#f0f9ff',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #bae6fd',
                        }}>
                          <div style={{
                            fontSize: 12,
                            color: '#0369a1',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}>
                            <span>👁️</span>
                            Reviewed: {formatDate(application.reviewedAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Withdraw Confirmation Modal */}
      {withdrawConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '32px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
            }}>
              <div style={{
                fontSize: 48,
                marginBottom: '16px',
              }}>
                ⚠️
              </div>
              <h2 style={{
                color: '#1f2937',
                fontWeight: 700,
                fontSize: 20,
                margin: 0,
                marginBottom: '8px',
              }}>
                Withdraw Application?
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: 15,
                margin: '8px 0 0 0',
              }}>
                Are you sure you want to withdraw your application for <strong>{withdrawConfirm.jobTitle}</strong>?
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: 13,
                margin: '12px 0 0 0',
              }}>
                This action cannot be undone. You can reapply later if needed.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
              <button
                onClick={() => setWithdrawConfirm(null)}
                disabled={withdrawing}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '12px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: withdrawing ? 'not-allowed' : 'pointer',
                  opacity: withdrawing ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!withdrawing) {
                    e.target.style.background = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleWithdraw(withdrawConfirm._id || withdrawConfirm.id)}
                disabled={withdrawing}
                style={{
                  background: '#fecaca',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  padding: '12px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: withdrawing ? 'not-allowed' : 'pointer',
                  opacity: withdrawing ? 0.6 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!withdrawing) {
                    e.target.style.background = '#f87171';
                    e.target.style.color = '#7f1d1d';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fecaca';
                  e.target.style.color = '#991b1b';
                }}
              >
                {withdrawing ? 'Withdrawing...' : 'Withdraw'}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
      </div>
    </div>
  );
};

export default MyApplications;