import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      toast.error('Failed to fetch applications');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/application-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'Under Review': '#3b82f6',
      'Interview Scheduled': '#8b5cf6',
      'Approved': '#10b981',
      'Rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': '⏳',
      'Under Review': '👀',
      'Interview Scheduled': '📅',
      'Approved': '✅',
      'Rejected': '❌'
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
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          animation: 'pulse 2s infinite',
        }}>
          📊
        </div>
        
        <div style={{
          width: 60,
          height: 60,
          border: '6px solid rgba(102, 126, 234, 0.2)',
          borderTop: '6px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        
        <p style={{
          color: '#4b5563',
          fontSize: '18px',
          fontWeight: 600,
          margin: 0,
        }}>
          Loading your applications...
        </p>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
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
            </div>
          </div>
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
              icon: '�', 
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
                  key={application.id} 
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
                          Applied {formatDate(application.appliedAt)}
                        </p>
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
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px',
                    }}>
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
      </div>
    </div>
  );
};

export default MyApplications;