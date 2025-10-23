import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const OverviewDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    successRate: 0,
    profileCompletion: 85,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Overview - Fetching stats...');
      
      if (!token) {
        console.error('❌ Overview - No authentication token found');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/auth/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📡 Overview - API Response:', response.data);
      
      if (response.data.success) {
        const applications = response.data.applications;
        console.log(`✅ Overview - Found ${applications.length} applications`);
        
        const total = applications.length;
        const pending = applications.filter(app => app.status === 'Pending').length;
        const underReview = applications.filter(app => app.status === 'Under Review').length;
        const approved = applications.filter(app => app.status === 'Approved' || app.status === 'Interview Scheduled').length;
        const successRate = total > 0 ? Math.round((approved / total) * 100) : 0;

        setStats({
          totalApplications: total,
          pendingApplications: pending + underReview, // Combine pending and under review
          successRate,
          profileCompletion: 85, // Mock data
        });
        
        console.log('📊 Overview - Updated stats:', {
          total,
          pending: pending + underReview,
          successRate
        });
      } else {
        console.error('❌ Overview - API returned success=false:', response.data);
      }
    } catch (error) {
      console.error('❌ Overview - Error fetching stats:', error);
      if (error.response) {
        console.error('❌ Overview - Error response:', error.response.data);
      }
    }
  };

  const dashboardItems = [
    {
      title: 'Apply for Jobs',
      description: 'Submit new job applications',
      icon: '📝',
      path: '/dashboard',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      stats: 'Active Applications'
    },
    {
      title: 'My Applications',
      description: 'Track application status',
      icon: '📊',
      path: '/my-applications',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      stats: `${stats.totalApplications} Total`
    },
    {
      title: 'Job Search',
      description: 'Find new opportunities',
      icon: '🔍',
      path: '/job-search',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      stats: 'Search & Apply'
    },
    {
      title: 'Analytics',
      description: 'View performance insights',
      icon: '📈',
      path: '/analytics',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      stats: `${stats.successRate}% Success Rate`
    },
    {
      title: 'Profile',
      description: 'Manage your profile',
      icon: '👤',
      path: '/profile',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      stats: `${stats.profileCompletion}% Complete`
    },
    {
      title: 'Settings',
      description: 'Customize preferences',
      icon: '⚙️',
      path: '/settings',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      stats: 'Preferences'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '32px',
    }}>
      {/* Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        borderRadius: '20px',
        padding: '48px',
        marginBottom: '32px',
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
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              backdropFilter: 'blur(10px)',
            }}>
              🚀
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 48,
                fontWeight: 700,
                marginBottom: '12px',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                Welcome Back!
              </h1>
              <p style={{
                margin: 0,
                fontSize: 20,
                opacity: 0.9,
                fontWeight: 300,
              }}>
                Ready to take your career to the next level? Let's get started.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                {stats.totalApplications}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Total Applications</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                {stats.pendingApplications}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Pending Review</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                {stats.successRate}%
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Success Rate</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                {stats.profileCompletion}%
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Profile Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
      }}>
        {dashboardItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            style={{
              textDecoration: 'none',
              display: 'block',
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
              }}
            >
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: item.color,
                opacity: 0.05,
                borderRadius: '20px',
              }}></div>

              {/* Icon */}
              <div style={{
                width: '80px',
                height: '80px',
                background: item.color,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }}>
                {item.icon}
              </div>

              {/* Content */}
              <h3 style={{
                color: '#1f2937',
                fontWeight: 700,
                fontSize: '24px',
                margin: '0 0 12px 0',
              }}>
                {item.title}
              </h3>
              
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: 1.6,
                margin: '0 0 20px 0',
              }}>
                {item.description}
              </p>

              {/* Stats Badge */}
              <div style={{
                display: 'inline-block',
                background: item.color,
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {item.stats}
              </div>

              {/* Arrow Icon */}
              <div style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                width: '40px',
                height: '40px',
                background: 'rgba(107, 114, 128, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#6b7280',
                transition: 'all 0.3s',
              }}>
                →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '32px',
        marginTop: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{
          color: '#1f2937',
          fontWeight: 700,
          fontSize: '28px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          🕒 Recent Activity
        </h2>

        <div style={{
          display: 'grid',
          gap: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              ✅
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{
                color: '#1f2937',
                fontWeight: 600,
                margin: '0 0 4px 0',
                fontSize: '16px',
              }}>
                Application Approved
              </h4>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0,
              }}>
                Your application for Software Engineer was approved
              </p>
            </div>
            <span style={{
              color: '#6b7280',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              2 hours ago
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              📝
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{
                color: '#1f2937',
                fontWeight: 600,
                margin: '0 0 4px 0',
                fontSize: '16px',
              }}>
                New Application Submitted
              </h4>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0,
              }}>
                Applied for Frontend Developer position
              </p>
            </div>
            <span style={{
              color: '#6b7280',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              1 day ago
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{
                color: '#1f2937',
                fontWeight: 600,
                margin: '0 0 4px 0',
                fontSize: '16px',
              }}>
                Profile Updated
              </h4>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0,
              }}>
                Added new skills and experience
              </p>
            </div>
            <span style={{
              color: '#6b7280',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              3 days ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;