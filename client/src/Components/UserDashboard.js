import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ApplicationForm from './ApplicationForm';
import { connectSocket } from '../utils/socket';
import LoadingSpinner from './common/LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();

  const displayName = user?.name?.trim()
    || user?.email?.split('@')?.[0]
    || 'Candidate';

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token || userType !== 'user') {
      navigate('/');
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser && typeof parsedUser === 'object' ? parsedUser : null);
      } catch (_error) {
        setUser(null);
      }
    }

    const initData = async () => {
      await Promise.all([fetchStats(), fetchNotifications()]);
      setLoadingData(false);
    };

    initData();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const handleRealtimeUpdate = () => {
      fetchStats();
      fetchNotifications();
    };

    socket.on('application:new', handleRealtimeUpdate);
    socket.on('application:status-updated', handleRealtimeUpdate);
    socket.on('application:withdrawn', handleRealtimeUpdate);
    socket.on('interview:scheduled', handleRealtimeUpdate);
    socket.on('notification:new', handleRealtimeUpdate);

    return () => {
      socket.off('application:new', handleRealtimeUpdate);
      socket.off('application:status-updated', handleRealtimeUpdate);
      socket.off('application:withdrawn', handleRealtimeUpdate);
      socket.off('interview:scheduled', handleRealtimeUpdate);
      socket.off('notification:new', handleRealtimeUpdate);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/auth/application-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/notifications?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  if (!user || loadingData) {
    return (
      <LoadingSpinner fullscreen label="Loading dashboard..." />
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
                Welcome back, {displayName}! 👋
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
          maxWidth: '800px',
          margin: '0 auto 20px auto',
          background: '#fff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{ margin: 0, color: '#1f2937' }}>Notifications</h3>
            <span style={{
              background: unreadCount > 0 ? '#fee2e2' : '#e5e7eb',
              color: unreadCount > 0 ? '#b91c1c' : '#374151',
              borderRadius: '999px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {unreadCount} unread
            </span>
          </div>
          {notifications.length === 0 ? (
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>No notifications yet.</p>
          ) : (
            notifications.map((item) => (
              <div key={item._id} style={{
                padding: '10px 0',
                borderTop: '1px solid #f1f5f9'
              }}>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{item.title}</div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>{item.message}</div>
              </div>
            ))
          )}
        </div>

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