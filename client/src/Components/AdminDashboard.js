import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { connectSocket } from '../utils/socket.js';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalApplications: 0,
      pendingReviews: 0,
      interviewsScheduled: 0,
      hired: 0,
      lastUpdated: null
    },
    trend: [],
    statusDistribution: [],
    hiringFunnel: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(
        `${API_URL}/api/analytics/dashboard/full-data`,
        getAuthConfig()
      );

      if (response.data.success) {
        const incoming = response.data.data || {};
        setDashboardData({
          metrics: {
            totalApplications: incoming.metrics?.totalApplications || 0,
            pendingReviews: incoming.metrics?.pendingReviews || 0,
            interviewsScheduled: incoming.metrics?.interviewsScheduled || 0,
            hired: incoming.metrics?.hired || 0,
            lastUpdated: incoming.metrics?.lastUpdated || null
          },
          trend: Array.isArray(incoming.trend) ? incoming.trend : [],
          statusDistribution: Array.isArray(incoming.statusDistribution) ? incoming.statusDistribution : [],
          hiringFunnel: Array.isArray(incoming.hiringFunnel) ? incoming.hiringFunnel : []
        });
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
    const interval = setInterval(() => fetchDashboardData(true), 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    if (!socket) return undefined;

    const handleRealtimeSync = () => {
      fetchDashboardData(true);
    };

    socket.on('application:new', handleRealtimeSync);
    socket.on('application:status-updated', handleRealtimeSync);
    socket.on('application:withdrawn', handleRealtimeSync);
    socket.on('interview:scheduled', handleRealtimeSync);

    return () => {
      socket.off('application:new', handleRealtimeSync);
      socket.off('application:status-updated', handleRealtimeSync);
      socket.off('application:withdrawn', handleRealtimeSync);
      socket.off('interview:scheduled', handleRealtimeSync);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-skeleton-grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="saas-skeleton dashboard-skeleton-card"></div>
          ))}
        </div>
        <div className="saas-skeleton dashboard-skeleton-chart"></div>
        <div className="saas-skeleton dashboard-skeleton-chart"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const { metrics, trend, statusDistribution, hiringFunnel } = dashboardData;

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  const statusColors = {
    'Applied': '#3B82F6',
    'Reviewing': '#F59E0B',
    'Shortlisted': '#8B5CF6',
    'Interview Scheduled': '#10B981',
    'Selected': '#06B6D4',
    'Rejected': '#EF4444'
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 Admin Dashboard</h1>
        <div className="header-info">
          <span className="last-updated">
            Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Not yet synced'}
          </span>
          <span className={`refresh-status ${refreshing ? 'is-refreshing' : ''}`}>
            {refreshing ? 'Syncing…' : 'Live'}
          </span>
          <button onClick={() => fetchDashboardData(false)} className="refresh-btn" title="Refresh data" disabled={refreshing}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <p className="metric-label">Total Applications</p>
            <h3 className="metric-value">{metrics.totalApplications}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <p className="metric-label">Pending Reviews</p>
            <h3 className="metric-value">{metrics.pendingReviews}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <p className="metric-label">Interviews Scheduled</p>
            <h3 className="metric-value">{metrics.interviewsScheduled}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <p className="metric-label">Hired</p>
            <h3 className="metric-value">{metrics.hired}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Applications Trend Chart */}
        <div className="chart-container">
          <h2 className="chart-title">📈 Applications Over Time (Last 30 Days)</h2>
          {trend && trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="saas-empty-state">
              <p className="no-data">No trend data yet.</p>
            </div>
          )}
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="chart-container">
          <h2 className="chart-title">🥧 Application Status Distribution</h2>
          {statusDistribution && statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={statusColors[entry.name] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="saas-empty-state">
              <p className="no-data">No status distribution yet.</p>
            </div>
          )}
        </div>

        {/* Hiring Funnel Chart */}
        <div className="chart-container full-width">
          <h2 className="chart-title">🎯 Hiring Funnel</h2>
          {hiringFunnel && hiringFunnel.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hiringFunnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="stage" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => {
                    if (name === 'count') return value;
                    return value;
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#3B82F6"
                  name="Candidates"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="percentage"
                  fill="#10B981"
                  name="% of Applied"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="saas-empty-state">
              <p className="no-data">No funnel data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Section */}
      <div className="stats-section">
        <div className="stat-box">
          <h3>📊 Conversion Rate</h3>
          <p className="stat-value">
            {metrics.totalApplications > 0
              ? Math.round((metrics.hired / metrics.totalApplications) * 100)
              : 0}
            %
          </p>
          <span className="stat-desc">Hired from Total Applications</span>
        </div>

        <div className="stat-box">
          <h3>⏰ Acceptance Rate</h3>
          <p className="stat-value">
            {metrics.totalApplications > 0
              ? Math.round(((hiringFunnel.find((f) => f.stage === 'Shortlisted')?.count || 0) + metrics.hired) / metrics.totalApplications * 100)
              : 0}
            %
          </p>
          <span className="stat-desc">Shortlisted + Hired</span>
        </div>

        <div className="stat-box">
          <h3>❌ Rejection Rate</h3>
          <p className="stat-value">
            {metrics.totalApplications > 0
              ? Math.round((statusDistribution.find((s) => (s.status || '').toLowerCase() === 'rejected')?.value || 0) / metrics.totalApplications * 100)
              : 0}
            %
          </p>
          <span className="stat-desc">Rejected Applications</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
