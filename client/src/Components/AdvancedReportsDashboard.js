import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './AdvancedReportsDashboard.css';
import LoadingSpinner from './common/LoadingSpinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const numberFormatter = new Intl.NumberFormat();

const AdvancedReportsDashboard = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ statusDistribution: [], trend: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [jobTitle, setJobTitle] = useState('all');

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  const queryParams = useMemo(() => {
    const params = {};
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    if (jobTitle && jobTitle !== 'all') params.jobTitle = jobTitle;
    return params;
  }, [fromDate, toDate, jobTitle]);

  const uniqueJobTitles = useMemo(() => {
    const values = Array.from(new Set(rows.map((row) => row._id).filter(Boolean)));
    return values.sort((a, b) => String(a).localeCompare(String(b)));
  }, [rows]);

  const fetchReport = useCallback(async () => {
    try {
      const [reportResponse, summaryResponse] = await Promise.all([
        axios.get(`${API_URL}/api/reports/applications-per-job`, {
          params: queryParams,
          ...getAuthConfig()
        }),
        axios.get(`${API_URL}/api/reports/summary`, {
          params: queryParams,
          ...getAuthConfig()
        })
      ]);

      if (reportResponse.data?.success) {
        setRows(Array.isArray(reportResponse.data.data) ? reportResponse.data.data : []);
      }

      if (summaryResponse.data?.success) {
        setSummary(summaryResponse.data.data || { statusDistribution: [], trend: [] });
        setLastUpdated(new Date());
        setError('');
      } else {
        setError('Failed to fetch report data');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 15000);
    return () => clearInterval(interval);
  }, [fetchReport]);

  const totals = useMemo(() => {
    return rows.reduce(
      (accumulator, row) => ({
        totalApplications: accumulator.totalApplications + (row.totalApplications || 0),
        shortlisted: accumulator.shortlisted + (row.shortlisted || 0),
        hired: accumulator.hired + (row.hired || 0)
      }),
      { totalApplications: 0, shortlisted: 0, hired: 0 }
    );
  }, [rows]);

  const handleExportCsv = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/applications-per-job/csv`, {
        params: queryParams,
        responseType: 'blob',
        ...getAuthConfig()
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications-per-job.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to export CSV');
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports/applications-per-job/pdf`, {
        params: queryParams,
        responseType: 'blob',
        ...getAuthConfig()
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications-per-job.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to export PDF');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading reports..." />;
  }

  return (
    <div className="ard-page">
      <div className="ard-header-row">
        <div>
          <h1 className="ard-title">Reports Dashboard</h1>
          <p className="ard-subtitle">
            Live applications-per-job report (auto-refresh every 15 seconds)
          </p>
          {lastUpdated && (
            <p className="ard-updated-time">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="ard-action-row">
          <button onClick={fetchReport} className="ard-btn ard-btn-secondary">
            Refresh
          </button>
          <button onClick={handleExportCsv} className="ard-btn ard-btn-primary">
            Export CSV
          </button>
          <button onClick={handleExportPdf} className="ard-btn ard-btn-dark">
            Export PDF
          </button>
        </div>
      </div>

      <div className="ard-filter-grid">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="ard-input" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="ard-input" />
        <select value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="ard-input">
          <option value="all">All Job Roles</option>
          {uniqueJobTitles.map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setFromDate('');
            setToDate('');
            setJobTitle('all');
          }}
          className="ard-btn ard-btn-light"
        >
          Clear Filters
        </button>
      </div>

      {error && (
        <div className="ard-error-box">
          <span>{error}</span>
          <button type="button" className="ard-btn ard-btn-secondary" onClick={fetchReport}>
            Retry
          </button>
        </div>
      )}

      <div className="ard-metric-grid">
        <div className="ard-metric-card">
          <div className="ard-metric-label">Total Jobs</div>
          <div className="ard-metric-value">{numberFormatter.format(rows.length)}</div>
        </div>
        <div className="ard-metric-card">
          <div className="ard-metric-label">Applications</div>
          <div className="ard-metric-value">{numberFormatter.format(totals.totalApplications)}</div>
        </div>
        <div className="ard-metric-card">
          <div className="ard-metric-label">Shortlisted</div>
          <div className="ard-metric-value">{numberFormatter.format(totals.shortlisted)}</div>
        </div>
        <div className="ard-metric-card">
          <div className="ard-metric-label">Hired</div>
          <div className="ard-metric-value">{numberFormatter.format(totals.hired)}</div>
        </div>
      </div>

      <div className="ard-chart-grid">
        <div className="ard-chart-card">
          <h3 className="ard-chart-title">Applications Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary.trend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="ard-chart-card">
          <h3 className="ard-chart-title">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={summary.statusDistribution || []} dataKey="count" nameKey="status" outerRadius={80}>
                {(summary.statusDistribution || []).map((item, index) => (
                  <Cell key={item.status} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, _name, context) => [value, context?.payload?.status || 'status']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ard-table-wrap">
        <table className="ard-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Total Applications</th>
              <th>Shortlisted</th>
              <th>Hired</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4}><div className="ard-empty-state">No report data available.</div></td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row._id || 'unknown'}>
                <td>{row._id || 'Unknown'}</td>
                <td>
                  {numberFormatter.format(row.totalApplications || 0)}
                </td>
                <td>
                  {numberFormatter.format(row.shortlisted || 0)}
                </td>
                <td>
                  {numberFormatter.format(row.hired || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdvancedReportsDashboard;
