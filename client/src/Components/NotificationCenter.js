import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationCenter = ({ isOpen = true, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const normalizeNotification = (item) => ({
    id: item._id,
    type: item.type || 'system_alert',
    title: item.title || 'Notification',
    message: item.message || '',
    timestamp: item.createdAt ? new Date(item.createdAt) : new Date(),
    read: Boolean(item.isRead),
    priority: item.priority || 'medium',
    actionUrl: item.actionUrl || null
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const items = Array.isArray(response.data?.data) ? response.data.data : [];
      setNotifications(items.map(normalizeNotification));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (_error) {
      // UI state still updates below
    }

    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (_error) {
      // UI state still updates below
    }

    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getIcon = (type) => {
    const icons = {
      new_application: '📝',
      interview_scheduled: '📅',
      system_alert: '⚙️',
      job_expired: '⏰',
      milestone: '🎉',
      user_registered: '👤',
      email_sent: '📧'
    };
    return icons[type] || '📢';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#6b7280'
    };
    return colors[priority] || '#6b7280';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'high') return notif.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div style={{
      position: onClose ? 'fixed' : 'relative',
      top: onClose ? 0 : 'auto',
      right: onClose ? 0 : 'auto',
      bottom: onClose ? 0 : 'auto',
      width: onClose ? '400px' : '100%',
      maxWidth: onClose ? '400px' : '1200px',
      margin: onClose ? 0 : '0 auto',
      padding: onClose ? 0 : '20px',
      background: '#fff',
      boxShadow: onClose ? '-4px 0 24px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: onClose ? 1000 : 'auto',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: onClose ? 0 : '8px'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
            🔔 Notifications
          </h2>
          {unreadCount > 0 && (
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px'
      }}>
        {['all', 'unread', 'high'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              background: filter === filterType ? '#3b82f6' : '#fff',
              color: filter === filterType ? '#fff' : '#6b7280',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {filterType}
          </button>
        ))}
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              marginLeft: 'auto',
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <div>No notifications</div>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                background: notification.read ? '#fff' : '#f0f9ff',
                borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.background = notification.read ? '#fff' : '#f0f9ff'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ fontSize: '20px' }}>
                  {getIcon(notification.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '4px'
                  }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: notification.read ? '500' : '600',
                      color: '#111827'
                    }}>
                      {notification.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {getTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#6b7280',
                    lineHeight: 1.4
                  }}>
                    {notification.message}
                  </p>
                  {notification.actionUrl && (
                    <button
                      style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to action URL
                        console.log('Navigate to:', notification.actionUrl);
                      }}
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #e5e7eb',
        background: '#f8fafc'
      }}>
        <button
          style={{
            width: '100%',
            padding: '8px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;