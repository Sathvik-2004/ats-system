import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminAnalytics.css';
import LoadingSpinner from './common/LoadingSpinner';
import RequestErrorState from './common/RequestErrorState';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    totalJobs: 0,
    totalUsers: 0,
    applicationsByStatus: {},
    applicationsByJob: {},
    recentActivity: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const [analyticsRes, applicationsRes, reportRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/dashboard/full-data`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/applications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 20 }
        }),
        axios.get(`${API_URL}/api/reports/applications-per-job`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const fullData = analyticsRes.data?.data || {};
      const applicationsByJob = (reportRes.data?.data || []).reduce((acc, row) => {
        acc[row._id || 'Unknown'] = row.totalApplications || 0;
        return acc;
      }, {});

      const recentApplications = (applicationsRes.data?.data || []).map((item) => ({
        name: item.candidateName || 'Unknown',
        job: item.jobTitle || 'Unknown',
        status: item.status || 'applied',
        date: item.createdAt || null
      }));

      const statusMap = (fullData.statusDistribution || []).reduce((acc, item) => {
        acc[item.name || item.status || 'Unknown'] = item.value || 0;
        return acc;
      }, {});

      setAnalytics({
        totalApplications: fullData.metrics?.totalApplications || 0,
        totalJobs: Object.keys(applicationsByJob).length,
        totalUsers: fullData.totalUsers || 0,
        applicationsByStatus: statusMap,
        applicationsByJob,
        recentActivity: recentApplications,
        monthlyTrends: fullData.trend || []
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      const message = error?.response?.data?.message || 'Failed to fetch analytics data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'Under Review': '#3b82f6',
      'Interview Scheduled': '#8b5cf6',
      'Approved': '#10b981',
      'Rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <LoadingSpinner label="Loading analytics..." />;
  }

  return (
    <div className="aa-page">
      <div className="aa-header-wrap">
        <h1 className="aa-title">Admin Analytics</h1>
        <p className="aa-subtitle">
          Comprehensive overview of system performance and statistics
        </p>
      </div>

      {error && <RequestErrorState compact message={error} onRetry={fetchAnalytics} />}

      <div className="aa-metrics-grid">
        <div className="aa-metric-card aa-metric-indigo">
          <div className="aa-metric-value">
            {analytics.totalApplications}
          </div>
          <div className="aa-metric-label">Total Applications</div>
        </div>

        <div className="aa-metric-card aa-metric-rose">
          <div className="aa-metric-value">
            {analytics.totalJobs}
          </div>
          <div className="aa-metric-label">Active Jobs</div>
        </div>

        <div className="aa-metric-card aa-metric-cyan">
          <div className="aa-metric-value">
            {analytics.totalUsers}
          </div>
          <div className="aa-metric-label">Registered Users</div>
        </div>

        <div className="aa-metric-card aa-metric-green">
          <div className="aa-metric-value">
            {Math.round((analytics.applicationsByStatus?.['Approved'] || 0) / analytics.totalApplications * 100) || 0}%
          </div>
          <div className="aa-metric-label">Approval Rate</div>
        </div>
      </div>

      <div className="aa-panels-grid">
        <div className="aa-panel-card">
          <h3 className="aa-panel-title">Applications by Status</h3>
          {Object.entries(analytics.applicationsByStatus).map(([status, count]) => (
            <div key={status} className="aa-status-row" style={{ borderLeftColor: getStatusColor(status) }}>
              <span>{status}</span>
              <span className="aa-bold">{count}</span>
            </div>
          ))}
        </div>

        <div className="aa-panel-card">
          <h3 className="aa-panel-title">Top Applied Jobs</h3>
          {Object.entries(analytics.applicationsByJob)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([job, count]) => (
              <div key={job} className="aa-job-row">
                <span className="aa-job-title">{job}</span>
                <span className="aa-bold">{count}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="aa-panel-card">
        <h3 className="aa-panel-title">Recent Applications</h3>
        <div className="aa-table-wrap">
          <table className="aa-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Job</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentActivity.map((activity) => (
                <tr key={`${activity.name}-${activity.job}-${activity.date || 'na'}`}>
                  <td>{activity.name}</td>
                  <td>{activity.job}</td>
                  <td>
                    <span className="aa-status-pill" style={{ backgroundColor: getStatusColor(activity.status) }}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="aa-date-cell">
                    {activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;