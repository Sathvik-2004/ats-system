import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ApplicationForm from './ApplicationForm';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token || userType !== 'user') {
      navigate('/');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchStats();
  }, [navigate]);

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

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f9fb',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3182ce',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
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
          {stats.total > 0 && (
            <Link 
              to="/my-applications"
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
              📊 View My Applications
            </Link>
          )}
          
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/');
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

      {/* Enhanced Welcome Header */}
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
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 40,
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                Welcome back, {user.name}! 👋
              </h1>
              <p style={{
                margin: '12px 0 0 0',
                fontSize: 20,
                opacity: 0.9,
                fontWeight: 300,
              }}>
                Ready to apply for your dream job?
              </p>
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          {stats.total > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginTop: '32px',
            }}>
              {[
                { value: stats.total, label: 'Total Applications', icon: '📋', color: '#4299e1' },
                { value: stats.pending || 0, label: 'Pending', icon: '⏳', color: '#ed8936' },
                { value: stats.approved || 0, label: 'Approved', icon: '✅', color: '#48bb78' },
                { value: stats.underReview || 0, label: 'Under Review', icon: '🔍', color: '#9f7aea' },
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-5px)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Application Section */}
      <div style={{ padding: '32px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <ApplicationForm />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;