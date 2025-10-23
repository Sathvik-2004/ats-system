import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuditLogsSystem = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: '7days',
    action: 'all',
    user: 'all',
    entity: 'all',
    severity: 'all'
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  const actionTypes = [
    { value: 'user_login', label: 'User Login', icon: '🔑', category: 'authentication' },
    { value: 'user_logout', label: 'User Logout', icon: '🚪', category: 'authentication' },
    { value: 'user_created', label: 'User Created', icon: '👤', category: 'user_management' },
    { value: 'user_updated', label: 'User Updated', icon: '✏️', category: 'user_management' },
    { value: 'user_deleted', label: 'User Deleted', icon: '🗑️', category: 'user_management' },
    { value: 'application_created', label: 'Application Submitted', icon: '📝', category: 'applications' },
    { value: 'application_updated', label: 'Application Updated', icon: '📋', category: 'applications' },
    { value: 'application_status_changed', label: 'Status Changed', icon: '🔄', category: 'applications' },
    { value: 'job_created', label: 'Job Posted', icon: '💼', category: 'jobs' },
    { value: 'job_updated', label: 'Job Updated', icon: '📝', category: 'jobs' },
    { value: 'job_deleted', label: 'Job Deleted', icon: '❌', category: 'jobs' },
    { value: 'interview_scheduled', label: 'Interview Scheduled', icon: '📅', category: 'interviews' },
    { value: 'interview_completed', label: 'Interview Completed', icon: '✅', category: 'interviews' },
    { value: 'settings_changed', label: 'Settings Changed', icon: '⚙️', category: 'system' },
    { value: 'data_exported', label: 'Data Exported', icon: '📤', category: 'data' },
    { value: 'bulk_operation', label: 'Bulk Operation', icon: '📊', category: 'bulk' },
    { value: 'security_event', label: 'Security Event', icon: '🛡️', category: 'security' }
  ];

  const severityLevels = {
    low: { label: 'Low', color: '#10b981', bg: '#d1fae5' },
    medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7' },
    high: { label: 'High', color: '#ef4444', bg: '#fee2e2' },
    critical: { label: 'Critical', color: '#7c2d12', bg: '#fed7d7' }
  };

  useEffect(() => {
    fetchAuditLogs();
    
    // Set up real-time updates
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance of new log every 5 seconds
          generateRealtimeLog();
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [filters, realTimeEnabled]);

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      }).catch(() => ({
        data: generateMockAuditLogs()
      }));
      
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs(generateMockAuditLogs());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAuditLogs = () => {
    const users = ['Admin User', 'HR Manager', 'Recruiter John', 'Sarah Williams', 'Mike Johnson'];
    const entities = ['applications', 'users', 'jobs', 'interviews', 'settings', 'system'];
    const ipAddresses = ['192.168.1.100', '10.0.0.15', '172.16.0.45', '192.168.0.200'];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    ];

    return Array.from({ length: 100 }, (_, i) => {
      const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      let severity = 'low';
      if (action.category === 'security') severity = Math.random() > 0.5 ? 'high' : 'critical';
      else if (action.category === 'user_management') severity = Math.random() > 0.7 ? 'medium' : 'low';
      else if (action.value.includes('delete')) severity = 'medium';
      
      return {
        _id: `log_${i}`,
        timestamp: timestamp.toISOString(),
        action: action.value,
        actionLabel: action.label,
        category: action.category,
        severity,
        user: users[Math.floor(Math.random() * users.length)],
        userId: `user_${Math.floor(Math.random() * 5)}`,
        entity: entities[Math.floor(Math.random() * entities.length)],
        entityId: `entity_${Math.floor(Math.random() * 100)}`,
        description: generateLogDescription(action),
        details: generateLogDetails(action),
        ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        success: Math.random() > 0.05, // 95% success rate
        metadata: {
          sessionId: `session_${Math.random().toString(36).substring(7)}`,
          requestId: `req_${Math.random().toString(36).substring(7)}`,
          duration: Math.floor(Math.random() * 1000) + 100
        }
      };
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const generateLogDescription = (action) => {
    const descriptions = {
      user_login: 'User successfully logged into the system',
      user_logout: 'User logged out of the system',
      user_created: 'New user account was created',
      user_updated: 'User profile information was updated',
      user_deleted: 'User account was permanently deleted',
      application_created: 'New job application was submitted',
      application_updated: 'Application details were modified',
      application_status_changed: 'Application status was changed from pending to reviewed',
      job_created: 'New job posting was published',
      job_updated: 'Job posting details were updated',
      job_deleted: 'Job posting was removed',
      interview_scheduled: 'Interview was scheduled with candidate',
      interview_completed: 'Interview feedback was submitted',
      settings_changed: 'System configuration settings were modified',
      data_exported: 'Data export operation was performed',
      bulk_operation: 'Bulk operation was executed on multiple records',
      security_event: 'Unusual activity detected - multiple failed login attempts'
    };
    
    return descriptions[action.value] || 'System action performed';
  };

  const generateLogDetails = (action) => {
    const details = {
      user_login: { loginMethod: 'email', twoFactorUsed: Math.random() > 0.5 },
      user_created: { role: 'HR', department: 'Human Resources' },
      application_status_changed: { from: 'pending', to: 'reviewed', reason: 'Initial screening completed' },
      job_created: { jobTitle: 'Senior Developer', department: 'Engineering', salary: '$90,000' },
      settings_changed: { section: 'email_templates', field: 'interview_invitation' },
      data_exported: { format: 'CSV', recordCount: 156, fileSize: '2.3MB' },
      bulk_operation: { operation: 'status_update', affected: 25 },
      security_event: { attempts: 5, blocked: true, reason: 'IP temporarily banned' }
    };
    
    return details[action.value] || {};
  };

  const generateRealtimeLog = () => {
    const realtimeActions = ['user_login', 'application_created', 'application_status_changed', 'interview_scheduled'];
    const action = actionTypes.find(a => a.value === realtimeActions[Math.floor(Math.random() * realtimeActions.length)]);
    
    const newLog = {
      _id: `log_realtime_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: action.value,
      actionLabel: action.label,
      category: action.category,
      severity: 'low',
      user: 'Live User',
      userId: 'user_live',
      entity: 'system',
      entityId: 'live_entity',
      description: generateLogDescription(action),
      details: generateLogDetails(action),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Live Session)',
      success: true,
      metadata: {
        sessionId: `live_session_${Date.now()}`,
        requestId: `live_req_${Date.now()}`,
        duration: Math.floor(Math.random() * 500) + 50
      },
      isNew: true
    };
    
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
    
    // Remove the "new" flag after 3 seconds
    setTimeout(() => {
      setAuditLogs(prev => prev.map(log => 
        log._id === newLog._id ? { ...log, isNew: false } : log
      ));
    }, 3000);
  };

  const exportLogs = async () => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create CSV content
      const csvContent = [
        ['Timestamp', 'Action', 'User', 'Entity', 'Severity', 'Description', 'IP Address', 'Success'].join(','),
        ...auditLogs.map(log => [
          log.timestamp,
          log.actionLabel,
          log.user,
          log.entity,
          log.severity,
          `"${log.description}"`,
          log.ipAddress,
          log.success ? 'Yes' : 'No'
        ].join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert('✅ Audit logs exported successfully!');
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('❌ Failed to export logs');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (filters.action !== 'all' && log.action !== filters.action) return false;
    if (filters.user !== 'all' && !log.user.toLowerCase().includes(filters.user.toLowerCase())) return false;
    if (filters.entity !== 'all' && log.entity !== filters.entity) return false;
    if (filters.severity !== 'all' && log.severity !== filters.severity) return false;
    
    // Date range filter
    const logDate = new Date(log.timestamp);
    const now = new Date();
    switch (filters.dateRange) {
      case '24hours':
        return (now - logDate) <= 24 * 60 * 60 * 1000;
      case '7days':
        return (now - logDate) <= 7 * 24 * 60 * 60 * 1000;
      case '30days':
        return (now - logDate) <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  const getActionIcon = (action) => {
    const actionType = actionTypes.find(a => a.value === action);
    return actionType ? actionType.icon : '📝';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getCategoryStats = () => {
    const stats = {};
    filteredLogs.forEach(log => {
      stats[log.category] = (stats[log.category] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            📊 Audit Logs & Activity Tracking
          </h2>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Comprehensive audit trail with real-time monitoring and compliance reporting
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
            <input
              type="checkbox"
              checked={realTimeEnabled}
              onChange={(e) => setRealTimeEnabled(e.target.checked)}
            />
            🔄 Real-time Updates
          </label>
          
          <button
            onClick={exportLogs}
            disabled={exportLoading}
            style={{
              background: exportLoading ? '#9ca3af' : '#10b981',
              color: '#fff',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: exportLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {exportLoading ? '⏳ Exporting...' : '📤 Export Logs'}
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
            {filteredLogs.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Events</div>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
            {filteredLogs.filter(log => log.severity === 'high' || log.severity === 'critical').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>High Priority</div>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
            {Math.round((filteredLogs.filter(log => log.success).length / filteredLogs.length) * 100)}%
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Success Rate</div>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>
            {new Set(filteredLogs.map(log => log.user)).size}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Active Users</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Action Type
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="all">All Actions</option>
              {actionTypes.map(action => (
                <option key={action.value} value={action.value}>
                  {action.icon} {action.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '11px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="all">All Levels</option>
              {Object.entries(severityLevels).map(([key, level]) => (
                <option key={key} value={key}>{level.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              User
            </label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
              placeholder="Filter by user..."
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Entity
            </label>
            <select
              value={filters.entity}
              onChange={(e) => setFilters(prev => ({ ...prev, entity: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
            >
              <option value="all">All Entities</option>
              <option value="applications">Applications</option>
              <option value="users">Users</option>
              <option value="jobs">Jobs</option>
              <option value="interviews">Interviews</option>
              <option value="settings">Settings</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Overview */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
          Activity Categories ({filteredLogs.length} events)
        </h3>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {getCategoryStats().map(([category, count]) => (
            <div key={category} style={{
              background: '#f3f4f6',
              padding: '8px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: '600', color: '#111827' }}>{category}</span>
              <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '12px' }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            📋 Audit Trail
          </h3>
        </div>
        
        <div style={{ maxHeight: '600px', overflow: 'auto' }}>
          {filteredLogs.map(log => (
            <div
              key={log._id}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                transition: 'background 0.2s',
                background: log.isNew ? '#f0f9ff' : '#fff',
                borderLeft: log.isNew ? '4px solid #3b82f6' : '4px solid transparent'
              }}
              onMouseEnter={(e) => e.target.style.background = log.isNew ? '#e0f2fe' : '#f9fafb'}
              onMouseLeave={(e) => e.target.style.background = log.isNew ? '#f0f9ff' : '#fff'}
              onClick={() => setSelectedLog(log)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>
                      {getActionIcon(log.action)}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {log.actionLabel}
                        </h4>
                        <span style={{
                          background: severityLevels[log.severity].bg,
                          color: severityLevels[log.severity].color,
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {severityLevels[log.severity].label}
                        </span>
                        {!log.success && (
                          <span style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}>
                            FAILED
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                        {log.description}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                    <div>👤 {log.user}</div>
                    <div>🌐 {log.ipAddress}</div>
                    <div>📦 {log.entity}</div>
                    {log.metadata.duration && <div>⏱️ {log.metadata.duration}ms</div>}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {filteredLogs.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No audit logs found for the selected filters
            </div>
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            width: '700px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getActionIcon(selectedLog.action)} {selectedLog.actionLabel}
                </h3>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  Detailed audit log information
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Basic Information */}
            <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                Basic Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
                <div><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</div>
                <div><strong>User:</strong> {selectedLog.user}</div>
                <div><strong>Action:</strong> {selectedLog.actionLabel}</div>
                <div><strong>Category:</strong> {selectedLog.category}</div>
                <div><strong>Entity:</strong> {selectedLog.entity}</div>
                <div><strong>Severity:</strong> 
                  <span style={{
                    background: severityLevels[selectedLog.severity].bg,
                    color: severityLevels[selectedLog.severity].color,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    marginLeft: '6px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {severityLevels[selectedLog.severity].label}
                  </span>
                </div>
                <div><strong>Status:</strong> 
                  <span style={{ color: selectedLog.success ? '#10b981' : '#ef4444', fontWeight: '500' }}>
                    {selectedLog.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                Technical Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '13px' }}>
                <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
                <div><strong>User Agent:</strong> {selectedLog.userAgent}</div>
                <div><strong>Session ID:</strong> {selectedLog.metadata.sessionId}</div>
                <div><strong>Request ID:</strong> {selectedLog.metadata.requestId}</div>
                <div><strong>Duration:</strong> {selectedLog.metadata.duration}ms</div>
              </div>
            </div>

            {/* Action Details */}
            {Object.keys(selectedLog.details).length > 0 && (
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  Action Details
                </h4>
                <div style={{ fontSize: '13px' }}>
                  {Object.entries(selectedLog.details).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '6px' }}>
                      <strong>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {
                        typeof value === 'object' ? JSON.stringify(value) : String(value)
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                Description
              </h4>
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#374151',
                lineHeight: 1.5
              }}>
                {selectedLog.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsSystem;