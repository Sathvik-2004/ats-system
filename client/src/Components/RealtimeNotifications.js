import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { connectSocket } from '../utils/socket';
import './RealtimeNotifications.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const RealtimeNotifications = ({ onNotificationReceived }) => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications`, {
        params: { page: 1, limit: 20 },
        ...getAuthConfig()
      });

      if (response.data?.success) {
        const current = response.data.data || [];
        setConnected(true);

        if (notifications.length > 0 && current.length > 0 && current[0]._id !== notifications[0]._id && onNotificationReceived) {
          onNotificationReceived(current[0]);
        }

        setNotifications(current);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (_error) {
      setConnected(false);
    }
  }, [notifications, onNotificationReceived]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const handleRealtimeNotification = (payload) => {
      const incoming = payload?.notification;

      if (incoming && onNotificationReceived) {
        onNotificationReceived(incoming);
      }

      fetchNotifications();
    };

    socket.on('notification:new', handleRealtimeNotification);
    socket.on('notification:refresh', handleRealtimeNotification);

    return () => {
      socket.off('notification:new', handleRealtimeNotification);
      socket.off('notification:refresh', handleRealtimeNotification);
    };
  }, [fetchNotifications, onNotificationReceived]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, getAuthConfig());
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_error) {
      // ignore for now
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/notifications/read-all`, {}, getAuthConfig());
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (_error) {
      // ignore for now
    }
  };

  const normalized = useMemo(
    () =>
      notifications.map((item) => ({
        id: item._id,
        title: item.title,
        message: item.message,
        read: item.isRead,
        priority: item.priority || 'medium',
        type: item.type || 'system',
        timestamp: item.createdAt
      })),
    [notifications]
  );

  return (
    <div className="rn-wrap">
      <button
        onClick={() => setShowPanel((prev) => !prev)}
        className="rn-bell-btn"
      >
        🔔
        <span
          className="rn-connection-dot"
          style={{ background: connected ? '#10b981' : '#ef4444' }}
        />
        {unreadCount > 0 && (
          <span className="rn-unread-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="rn-panel">
          <div className="rn-panel-header">
            <strong>Notifications</strong>
            <button onClick={markAllAsRead} className="rn-header-btn">
              Mark all read
            </button>
          </div>

          {normalized.length === 0 ? (
            <div className="rn-empty">No notifications</div>
          ) : (
            normalized.map((item) => (
              <div key={item.id} className={`rn-item ${item.read ? 'rn-item-read' : 'rn-item-unread'}`}>
                <div className="rn-item-header">
                  <strong className="rn-item-title">{item.title}</strong>
                  <span className="rn-item-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="rn-item-message">{item.message}</div>
                {!item.read && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="rn-mark-btn"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RealtimeNotifications;
