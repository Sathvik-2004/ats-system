import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    successRate: 0,
    averageResponseTime: 0,
    statusBreakdown: {},
    monthlyApplications: [],
    topCompanies: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('6months');

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      console.log('🔍 Debug - Token exists:', !!token);
      console.log('🔍 Debug - UserData exists:', !!userData);
      
      if (!token) {
        console.error('❌ No authentication token found');
        toast.error('Please log in to view applications');
        return;
      }

      console.log('📡 Making API request to fetch applications...');
      const response = await axios.get('http://localhost:5000/api/auth/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📡 API Response:', response.data);
      
      if (response.data.success) {
        const apps = response.data.applications;
        console.log(`✅ Successfully fetched ${apps.length} applications`);
        calculateAnalytics(apps);
      } else {
        console.error('❌ API returned success=false:', response.data);
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      if (error.response) {
        console.error('❌ Error response:', error.response.data);
        console.error('❌ Error status:', error.response.status);
      }
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, fetchAnalytics]);

  const calculateAnalytics = (apps) => {
    if (!apps || apps.length === 0) {
      setAnalytics({
        totalApplications: 0,
        successRate: 0,
        averageResponseTime: 0,
        statusBreakdown: {},
        monthlyApplications: [],
        topCompanies: [],
      });
      return;
    }

    const total = apps.length;
    const approved = apps.filter(app => app.status === 'Approved').length;
    const successRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    // Status breakdown
    const statusBreakdown = apps.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // Monthly applications (last 6 months)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const count = apps.filter(app => {
        // Handle both appliedDate and appliedAt fields
        const appDate = new Date(app.appliedDate || app.appliedAt);
        return appDate.getMonth() === date.getMonth() && 
               appDate.getFullYear() === date.getFullYear();
      }).length;
      monthlyData.push({ month: monthName, count });
    }

    // Top companies (by application count)
    const companyCount = apps.reduce((acc, app) => {
      // Handle both data structures
      const company = app.company || app.jobId?.company || 'Unknown Company';
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {});
    const topCompanies = Object.entries(companyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    setAnalytics({
      totalApplications: total,
      successRate,
      averageResponseTime: Math.floor(Math.random() * 14) + 3, // Mock data
      statusBreakdown,
      monthlyApplications: monthlyData,
      topCompanies,
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Approved': '#10b981',
      'Under Review': '#f59e0b',
      'Rejected': '#ef4444',
      'Interview Scheduled': '#8b5cf6',
    };
    return colors[status] || '#6b7280';
  };

  const renderChart = () => {
    const maxCount = Math.max(...analytics.monthlyApplications.map(d => d.count));
    
    return (
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{
          color: '#1f2937',
          fontWeight: 700,
          fontSize: '20px',
          marginBottom: '24px',
        }}>
          📈 Application Trends
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'end',
          gap: '12px',
          height: '200px',
          padding: '0 16px',
        }}>
          {analytics.monthlyApplications.map((data, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px 8px 0 0',
                  height: `${(data.count / (maxCount || 1)) * 160}px`,
                  minHeight: data.count > 0 ? '20px' : '0px',
                  transition: 'height 0.5s ease',
                  position: 'relative',
                }}
              >
                {data.count > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#1f2937',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    {data.count}
                  </div>
                )}
              </div>
              <span style={{
                color: '#6b7280',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {data.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
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
        <p style={{ color: '#4b5563', fontSize: '18px', fontWeight: 600 }}>
          Analyzing your data...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
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
            justifyContent: 'space-between',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
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
                  Analytics Dashboard
                </h1>
                <p style={{
                  margin: 0,
                  fontSize: 18,
                  opacity: 0.9,
                  fontWeight: 300,
                }}>
                  Track your application performance and insights
                </p>
              </div>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px',
        display: 'grid',
        gap: '24px',
      }}>
        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              opacity: 0.1,
            }}></div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
            <h3 style={{
              color: '#1f2937',
              fontWeight: 700,
              fontSize: '32px',
              margin: '0 0 8px 0',
            }}>
              {analytics.totalApplications}
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: 0,
              fontWeight: 600,
            }}>
              Total Applications
            </p>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              opacity: 0.1,
            }}></div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <h3 style={{
              color: '#10b981',
              fontWeight: 700,
              fontSize: '32px',
              margin: '0 0 8px 0',
            }}>
              {analytics.successRate}%
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: 0,
              fontWeight: 600,
            }}>
              Success Rate
            </p>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '50%',
              opacity: 0.1,
            }}></div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏱️</div>
            <h3 style={{
              color: '#f59e0b',
              fontWeight: 700,
              fontSize: '32px',
              margin: '0 0 8px 0',
            }}>
              {analytics.averageResponseTime}
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: 0,
              fontWeight: 600,
            }}>
              Avg Response (Days)
            </p>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '50%',
              opacity: 0.1,
            }}></div>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
            <h3 style={{
              color: '#8b5cf6',
              fontWeight: 700,
              fontSize: '32px',
              margin: '0 0 8px 0',
            }}>
              {analytics.topCompanies.length}
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: 0,
              fontWeight: 600,
            }}>
              Companies Applied
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
        }}>
          {renderChart()}

          {/* Status Breakdown */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{
              color: '#1f2937',
              fontWeight: 700,
              fontSize: '20px',
              marginBottom: '24px',
            }}>
              📋 Status Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                <div key={status} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getStatusColor(status),
                    }}></div>
                    <span style={{
                      color: '#4b5563',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}>
                      {status}
                    </span>
                  </div>
                  <span style={{
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: 700,
                  }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Companies */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{
            color: '#1f2937',
            fontWeight: 700,
            fontSize: '20px',
            marginBottom: '24px',
          }}>
            🏢 Top Companies Applied
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {analytics.topCompanies.map((company, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#667eea',
                  marginBottom: '8px',
                }}>
                  {company.count}
                </div>
                <div style={{
                  color: '#1f2937',
                  fontSize: '14px',
                  fontWeight: 600,
                }}>
                  {company.company}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;