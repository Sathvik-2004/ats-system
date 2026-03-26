import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { connectSocket } from '../utils/socket.js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const ACTIVITY_META = {
  applied: { title: 'Application Submitted', icon: '📝', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  reviewing: { title: 'Application Under Review', icon: '🔍', color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  shortlisted: { title: 'Application Shortlisted', icon: '🎯', color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  interview_scheduled: { title: 'Interview Scheduled', icon: '📅', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  selected: { title: 'Application Approved', icon: '✅', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  rejected: { title: 'Application Rejected', icon: '❌', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
};

const toRelativeTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

const buildRecentActivities = (applications = []) => {
  const events = [];

  applications.forEach((app) => {
    const status = app.status || 'applied';
    const meta = ACTIVITY_META[status] || ACTIVITY_META.applied;
    const jobTitle = app.jobTitle || 'Unknown Role';

    const statusTimestamp =
      app.statusHistory?.length > 0
        ? app.statusHistory[app.statusHistory.length - 1]?.changedAt
        : app.updatedAt || app.createdAt;

    events.push({
      id: `${app._id}-status`,
      title: meta.title,
      message:
        status === 'selected'
          ? `Your application for ${jobTitle} was approved`
          : status === 'rejected'
            ? `Your application for ${jobTitle} was rejected`
            : `Status update for ${jobTitle}`,
      timestamp: statusTimestamp,
      icon: meta.icon,
      color: meta.color
    });

    events.push({
      id: `${app._id}-created`,
      title: 'Application Submitted',
      message: `Applied for ${jobTitle} position`,
      timestamp: app.createdAt,
      icon: ACTIVITY_META.applied.icon,
      color: ACTIVITY_META.applied.color
    });
  });

  return events
    .filter((event) => event.timestamp)
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
    .slice(0, 8);
};

const OverviewDashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    successRate: 0,
    profileCompletion: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const token = localStorage.getItem('token');
      if (!token) {
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      const response = await axios.get(`${API_URL}/api/applications/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data.success) {
        setStats({
          totalApplications: 0,
          pendingApplications: 0,
          successRate: 0,
          profileCompletion: 0,
        });
        setRecentActivities([]);
        return;
      }

      const applications = Array.isArray(response.data.applications) ? response.data.applications : [];

      const total = applications.length;
      const pending = applications.filter((app) => ['applied', 'reviewing', 'shortlisted'].includes(app.status)).length;
      const approved = applications.filter((app) => app.status === 'selected').length;
      const successRate = total > 0 ? Math.round((approved / total) * 100) : 0;

      setStats({
        totalApplications: total,
        pendingApplications: pending,
        successRate,
        profileCompletion: 0,
      });

      setRecentActivities(buildRecentActivities(applications));
    } catch (error) {
      console.error('❌ Overview - Error fetching overview data:', error);
      setStats({
        totalApplications: 0,
        pendingApplications: 0,
        successRate: 0,
        profileCompletion: 0,
      });
      setRecentActivities([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();

    const intervalId = setInterval(() => {
      fetchOverviewData({ silent: true });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchOverviewData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const handleRealtimeUpdate = () => {
      fetchOverviewData({ silent: true });
    };

    socket.on('application:new', handleRealtimeUpdate);
    socket.on('application:status-updated', handleRealtimeUpdate);
    socket.on('interview:scheduled', handleRealtimeUpdate);

    return () => {
      socket.off('application:new', handleRealtimeUpdate);
      socket.off('application:status-updated', handleRealtimeUpdate);
      socket.off('interview:scheduled', handleRealtimeUpdate);
    };
  }, [fetchOverviewData]);

  const dashboardItems = [
    {
      title: 'Apply for Jobs',
      description: 'Submit new job applications',
      icon: '📝',
      path: '/dashboard',
      color: '#2563eb',
      stats: 'Active Applications'
    },
    {
      title: 'My Applications',
      description: 'Track application status',
      icon: '📊',
      path: '/my-applications',
      color: '#0f766e',
      stats: `${stats.totalApplications} Total`
    },
    {
      title: 'Job Search',
      description: 'Find new opportunities',
      icon: '🔍',
      path: '/job-search',
      color: '#0369a1',
      stats: 'Search & Apply'
    },
    {
      title: 'Analytics',
      description: 'View performance insights',
      icon: '📈',
      path: '/analytics',
      color: '#7c3aed',
      stats: `${stats.successRate}% Success Rate`
    },
    {
      title: 'Profile',
      description: 'Manage your profile',
      icon: '👤',
      path: '/profile',
      color: '#d97706',
      stats: `${stats.profileCompletion}% Complete`
    },
    {
      title: 'Settings',
      description: 'Customize preferences',
      icon: '⚙️',
      path: '/settings',
      color: '#334155',
      stats: 'Preferences'
    }
  ];

  if (loading) {
    return (
      <div
        className="animate-pulse"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: '32px',
        }}
      >
        <div
          style={{
            background: '#dbeafe',
            borderRadius: '20px',
            padding: '48px',
            marginBottom: '32px',
          }}
        >
          <div style={{ height: 44, width: '38%', background: 'rgba(255,255,255,0.75)', borderRadius: 12, marginBottom: 16 }} />
          <div style={{ height: 18, width: '62%', background: 'rgba(255,255,255,0.7)', borderRadius: 10, marginBottom: 28 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 20 }}>
                <div style={{ height: 30, width: '45%', background: '#e5e7eb', borderRadius: 8, margin: '0 auto 10px' }} />
                <div style={{ height: 12, width: '70%', background: '#e5e7eb', borderRadius: 8, margin: '0 auto' }} />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <div style={{ width: 70, height: 70, borderRadius: 16, background: '#e5e7eb', marginBottom: 22 }} />
              <div style={{ height: 22, width: '58%', background: '#e5e7eb', borderRadius: 10, marginBottom: 10 }} />
              <div style={{ height: 14, width: '82%', background: '#e5e7eb', borderRadius: 8, marginBottom: 8 }} />
              <div style={{ height: 14, width: '64%', background: '#e5e7eb', borderRadius: 8, marginBottom: 18 }} />
              <div style={{ height: 30, width: '42%', background: '#d1d5db', borderRadius: 999 }} />
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <div style={{ height: 28, width: '32%', background: '#e5e7eb', borderRadius: 10, marginBottom: 18 }} />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 12, background: '#f8fafc', marginBottom: 10 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#d1d5db' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 14, width: '54%', background: '#d1d5db', borderRadius: 8, marginBottom: 8 }} />
                <div style={{ height: 12, width: '74%', background: '#e5e7eb', borderRadius: 8 }} />
              </div>
              <div style={{ width: 70, height: 12, background: '#e5e7eb', borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--page-bg)',
      padding: '32px',
      maxWidth: '1320px',
      margin: '0 auto',
    }}>
      {/* Welcome Header */}
      <div style={{
        background: 'var(--surface-elevated)',
        color: 'var(--text-primary)',
        borderRadius: '20px',
        padding: '34px',
        marginBottom: '32px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
            }}>
              🚀
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 36,
                fontWeight: 700,
                marginBottom: '12px',
              }}>
                Welcome Back!
              </h1>
              <p style={{
                margin: 0,
                fontSize: 17,
                color: 'var(--text-muted)',
                fontWeight: 400,
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
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                {stats.totalApplications}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Applications</div>
            </div>
            <div style={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                {stats.pendingApplications}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Pending Review</div>
            </div>
            <div style={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                {stats.successRate}%
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Success Rate</div>
            </div>
            <div style={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                {stats.profileCompletion}%
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Profile Complete</div>
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
                background: 'var(--surface-elevated)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)';
                e.target.style.boxShadow = 'var(--shadow-hover)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'var(--surface-muted)',
                opacity: 0.45,
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
                fontSize: '22px',
                margin: '0 0 12px 0',
              }}>
                {item.title}
              </h3>
              
              <p style={{
                color: '#6b7280',
                fontSize: '15px',
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
        background: 'var(--surface-elevated)',
        borderRadius: '20px',
        padding: '32px',
        marginTop: '32px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
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
          {recentActivities.length === 0 ? (
            <div style={{
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              No recent application activity yet.
            </div>
          ) : recentActivities.map((activity) => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: activity.color,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}>
                {activity.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  color: '#1f2937',
                  fontWeight: 600,
                  margin: '0 0 4px 0',
                  fontSize: '16px',
                }}>
                  {activity.title}
                </h4>
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  margin: 0,
                }}>
                  {activity.message}
                </p>
              </div>
              <span style={{
                color: '#6b7280',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {toRelativeTime(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;