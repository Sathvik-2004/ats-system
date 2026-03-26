import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './AuditLogsSystem.css';
import LoadingSpinner from './common/LoadingSpinner';
import RequestErrorState from './common/RequestErrorState';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AuditLogsSystem = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realTime, setRealTime] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');

  const authConfig = useMemo(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchLogs = async () => {
    try {
      setError('');
      const params = {
        page: 1,
        limit: 100
      };

      if (userFilter.trim()) {
        params.user = userFilter.trim();
      }
      if (fromDate) {
        params.from = fromDate;
      }
      if (toDate) {
        params.to = toDate;
      }

      const response = await axios.get(`${API_URL}/api/audit-logs`, {
        ...authConfig,
        params
      });

      setLogs(response.data?.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Audit logs fetch error:', error);
      setError(error?.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [userFilter, fromDate, toDate]);

  useEffect(() => {
    if (!realTime) return undefined;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [realTime, userFilter, fromDate, toDate]);

  const exportCsv = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource Name'];
    const rows = logs.map((item) => [
      item.timestamp,
      item.userName,
      item.action,
      item.resourceType,
      item.resourceName || ''
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner label="Loading audit logs..." />;
  }

  return (
    <div className="als-page">
      <h2 className="als-title">Audit Logs</h2>
      <p className="als-subtitle">Live audit trail for authentication and ATS actions.</p>

      <div className="als-controls-row">
        <input placeholder="Filter by user" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="als-input" />
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="als-input" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="als-input" />
        <button onClick={fetchLogs} className="als-btn als-btn-secondary">Refresh</button>
        <button onClick={exportCsv} className="als-btn als-btn-primary">Export CSV</button>
        <label className="als-toggle-row">
          <input type="checkbox" checked={realTime} onChange={(e) => setRealTime(e.target.checked)} />
          Real-time
        </label>
        <span className="als-updated">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</span>
      </div>

      {error && <RequestErrorState compact message={error} onRetry={fetchLogs} />}

      <div className="als-table-wrap">
        <table className="als-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.userName || 'system'}</td>
                <td>{log.action}</td>
                <td>{log.resourceType} {log.resourceName ? `- ${log.resourceName}` : ''}</td>
                <td className="als-details-cell">{JSON.stringify(log.details || {})}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5}><div className="als-empty-state">No logs found.</div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsSystem;
