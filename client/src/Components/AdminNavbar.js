import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import RealtimeNotifications from './RealtimeNotifications';

const AdminNavbar = ({ onLogout }) => {
  const location = useLocation();

  const adminMenuItems = [
    {
      path: '/admin',
      icon: '📊',
      label: 'Overview',
      description: 'Dashboard overview'
    },
    {
      path: '/admin/analytics-dashboard',
      icon: '📈',
      label: 'Analytics',
      description: 'Advanced analytics'
    },
    {
      path: '/admin/applications',
      icon: '📝',
      label: 'Applications',
      description: 'Manage applications'
    },
    {
      path: '/admin/jobs',
      icon: '💼',
      label: 'Jobs',
      description: 'Job management'
    },
    {
      path: '/admin/user-management',
      icon: '👥',
      label: 'User Management',
      description: 'Manage users'
    },
    {
      path: '/admin/interviews',
      icon: '📅',
      label: 'Interviews',
      description: 'Interview scheduling'
    },
    {
      path: '/admin/ai-screening',
      icon: '🤖',
      label: 'AI Screening',
      description: 'AI-powered screening'
    },
    {
      path: '/admin/email-templates',
      icon: '📧',
      label: 'Email Templates',
      description: 'Template designer'
    },
    {
      path: '/admin/reports',
      icon: '📈',
      label: 'Reports',
      description: 'Advanced reporting'
    },
    {
      path: '/admin/audit-logs',
      icon: '📊',
      label: 'Audit Logs',
      description: 'System audit logs'
    },
    {
      path: '/admin/settings',
      icon: '⚙️',
      label: 'Settings',
      description: 'System settings'
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{
      width: '280px',
      background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Admin Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              👑
            </div>
            <div>
              <h2 style={{
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                margin: 0
              }}>
                Admin Portal
              </h2>
            </div>
          </div>
          
          {/* Real-time Notifications */}
          <RealtimeNotifications 
            userId="admin"
            onNotificationReceived={(notification) => {
              console.log('Admin received notification:', notification);
            }}
          />
        </div>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '14px',
          margin: 0
        }}>
          System Administration
        </p>
      </div>

      {/* Navigation Menu */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {adminMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'block',
              padding: '16px 24px',
              color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              background: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRight: isActive(item.path) ? '4px solid #fbbf24' : '4px solid transparent',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: isActive(item.path) ? '600' : '500',
                  marginBottom: '2px'
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  {item.description}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Admin Info & Logout */}
      <div style={{
        padding: '24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
        background: 'rgba(0,0,0,0.1)'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              👤
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                Administrator
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                System Admin
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
          }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;