import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import RealtimeNotifications from './RealtimeNotifications';

const AdminNavbar = ({ onLogout, dark = false, onToggleTheme }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 1024;
      setIsMobile(nextIsMobile);
      if (!nextIsMobile) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      path: '/admin/notifications',
      icon: '🔔',
      label: 'Notifications',
      description: 'System notifications'
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
    <>
    {isMobile && (
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          width: 44,
          height: 44,
          borderRadius: 10,
          background: '#1e3a8a',
          border: 'none',
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          zIndex: 1301,
          boxShadow: '0 8px 20px rgba(30, 58, 138, 0.35)'
        }}
        title={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
    )}
    {isMobile && mobileOpen && (
      <div
        onClick={() => setMobileOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          zIndex: 1298
        }}
      />
    )}
    <div style={{
      width: '280px',
      background: dark ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1300,
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.25s ease',
      transform: isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)'
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
            onClick={() => {
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
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
        <button
          onClick={onToggleTheme}
          style={{
            width: '100%',
            padding: '12px',
            background: dark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
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
    </>
  );
};

export default AdminNavbar;