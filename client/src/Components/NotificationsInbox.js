import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { connectSocket } from '../utils/socket';
import './NotificationsInbox.css';
import RequestErrorState from './common/RequestErrorState';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const NotificationsInbox = ({ title = 'Notifications' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/notifications`, {
        params: { page: 1, limit: 50 },
        ...getAuthConfig()
      });

      if (response.data?.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const handleRealtimeNotification = () => {
      fetchNotifications();
    };

    socket.on('notification:new', handleRealtimeNotification);
    socket.on('notification:refresh', handleRealtimeNotification);

    return () => {
      socket.off('notification:new', handleRealtimeNotification);
      socket.off('notification:refresh', handleRealtimeNotification);
    };
  }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, getAuthConfig());
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_error) {
      // no-op
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/api/notifications/read-all`, {}, getAuthConfig());
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (_error) {
      // no-op
    }
  };

  return (
    <div className="ni-page">
      <div className="ni-header-row">
        <div>
          <h1 className="ni-title">{title}</h1>
          <p className="ni-subtitle">Unread: {unreadCount}</p>
        </div>
        <button onClick={markAllRead} className="ni-btn ni-btn-primary">
          Mark all as read
        </button>
      </div>

      {loading && (
        <div className="ni-skeleton-stack">
          <div className="ni-item-skeleton shimmer" />
          <div className="ni-item-skeleton shimmer" />
          <div className="ni-item-skeleton shimmer" />
        </div>
      )}

      {error && <RequestErrorState compact message={error} onRetry={fetchNotifications} />}

      <div className="ni-list-grid">
        {notifications.map((item) => (
          <div
            key={item._id}
            className={`ni-card ${item.isRead ? 'ni-read' : 'ni-unread'}`}
          >
            <div className="ni-card-header">
              <strong>{item.title}</strong>
              <span className="ni-time-text">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <p className="ni-message">{item.message}</p>
            {!item.isRead && (
              <button onClick={() => markRead(item._id)} className="ni-btn ni-btn-secondary">
                Mark read
              </button>
            )}
          </div>
        ))}
        {!loading && notifications.length === 0 && (
          <div className="ni-empty-state">No notifications right now.</div>
        )}
      </div>
    </div>
  );
};

export default NotificationsInbox;
