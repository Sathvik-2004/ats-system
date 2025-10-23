import React, { useState, useEffect } from 'react';

const RealtimeNotifications = ({ userId, onNotificationReceived }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock WebSocket connection (replace with actual WebSocket implementation)
  useEffect(() => {
    // Simulate WebSocket connection
    setIsConnected(true);
    
    // Simulate receiving notifications
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const mockNotification = generateMockNotification();
        addNotification(mockNotification);
      }
    }, 10000);

    // Add some initial notifications
    setTimeout(() => {
      addNotification({
        id: 'init-1',
        type: 'application',
        title: 'New Application Received',
        message: 'John Doe applied for Senior Developer position',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: 'medium',
        actionUrl: '/admin/applications'
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const generateMockNotification = () => {
    const types = ['application', 'interview', 'system', 'alert'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    
    const templates = {
      application: [
        'New application received for Frontend Developer',
        'Application status updated to "Under Review"',
        'Candidate withdrew application for Marketing Manager'
      ],
      interview: [
        'Interview scheduled for tomorrow at 2:00 PM',
        'Interview completed - feedback pending',
        'Candidate requested interview reschedule'
      ],
      system: [
        'System maintenance scheduled for tonight',
        'New feature: Bulk email templates available',
        'Database backup completed successfully'
      ],
      alert: [
        'High-priority application requires review',
        'Interview reminder: Meeting in 30 minutes',
        'Application deadline approaching'
      ]
    };

    const type = types[Math.floor(Math.random() * types.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const messages = templates[type];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Update`,
      message,
      timestamp: new Date(),
      read: false,
      priority,
      actionUrl: getActionUrl(type)
    };
  };

  const getActionUrl = (type) => {
    const urls = {
      application: '/admin/applications',
      interview: '/admin/interviews',
      system: '/admin/settings',
      alert: '/admin/dashboard'
    };
    return urls[type] || '/admin/dashboard';
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
    
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      application: '👤',
      interview: '📅',
      system: '⚙️',
      alert: '⚠️'
    };
    return icons[type] || '📢';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    };
    return colors[priority] || '#6b7280';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          transition: 'all 0.2s',
          fontSize: '20px'
        }}
        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        🔔
        
        {/* Connection Status */}
        <div style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isConnected ? '#10b981' : '#ef4444',
          border: '2px solid white'
        }} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid white'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '-200px',
          width: '450px',
          maxHeight: '600px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'slideDown 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            background: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Notifications
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearNotifications}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Clear all
                </button>
              </div>
            </div>
            
            {/* Connection Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isConnected ? '#10b981' : '#ef4444'
              }} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: '450px',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔕</div>
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>No notifications yet</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>You'll see updates here when they arrive</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    background: notification.read ? 'white' : '#eff6ff',
                    transition: 'all 0.2s',
                    wordWrap: 'break-word',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.target.style.background = notification.read ? 'white' : '#eff6ff'}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Icon */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: `${getPriorityColor(notification.priority)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                      <div style={{
                        fontWeight: notification.read ? '400' : '600',
                        fontSize: '14px',
                        color: '#111827',
                        marginBottom: '6px',
                        lineHeight: '1.3',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.4',
                        marginBottom: '8px',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {notification.message}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: '#9ca3af',
                        flexWrap: 'wrap',
                        gap: '4px'
                      }}>
                        <span style={{ flexShrink: 0 }}>{formatTimestamp(notification.timestamp)}</span>
                        <div style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: getPriorityColor(notification.priority),
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: '500',
                          flexShrink: 0
                        }}>
                          {notification.priority.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#3b82f6',
                        flexShrink: 0,
                        marginTop: '4px'
                      }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RealtimeNotifications;