import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const QuickActionsWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const quickActions = [
    {
      id: 'add-job',
      icon: '💼',
      title: 'Post New Job',
      description: 'Create a new job posting',
      color: '#3b82f6',
      action: () => handleQuickAction('add-job')
    },
    {
      id: 'bulk-process',
      icon: '⚡',
      title: 'Bulk Process Applications',
      description: 'Process pending applications',
      color: '#10b981',
      action: () => handleQuickAction('bulk-process')
    },
    {
      id: 'send-emails',
      icon: '📧',
      title: 'Send Email Campaign',
      description: 'Send notifications to candidates',
      color: '#f59e0b',
      action: () => handleQuickAction('send-emails')
    },
    {
      id: 'generate-report',
      icon: '📊',
      title: 'Generate Report',
      description: 'Create analytics report',
      color: '#8b5cf6',
      action: () => handleQuickAction('generate-report')
    },
    {
      id: 'backup-data',
      icon: '💾',
      title: 'Backup System',
      description: 'Create system backup',
      color: '#ef4444',
      action: () => handleQuickAction('backup-data')
    },
    {
      id: 'sync-integrations',
      icon: '🔄',
      title: 'Sync Integrations',
      description: 'Sync with external services',
      color: '#06b6d4',
      action: () => handleQuickAction('sync-integrations')
    }
  ];

  const handleQuickAction = async (actionId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      switch (actionId) {
        case 'add-job':
          // Navigate to job creation or open modal
          console.log('Opening job creation modal...');
          break;
          
        case 'bulk-process':
          {
            const applicationsRes = await axios.get(`${API_URL}/api/applications`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { page: 1, limit: 100, status: 'applied' }
            });

            const pendingIds = (applicationsRes.data?.data || []).map((item) => item._id);
            if (pendingIds.length === 0) {
              alert('✅ No pending applications to process right now.');
              break;
            }

            await axios.post(
              `${API_URL}/api/applications/bulk/update-status`,
              { applicationIds: pendingIds, status: 'reviewing' },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`✅ Processed ${pendingIds.length} applications successfully!`);
          }
          break;
          
        case 'send-emails':
          {
            const [templatesRes, recipientsRes] = await Promise.all([
              axios.get(`${API_URL}/api/email-templates`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              axios.get(`${API_URL}/api/applications`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, limit: 100 }
              })
            ]);

            const templateCount = (templatesRes.data?.data || []).length;
            const recipientCount = (recipientsRes.data?.data || []).length;
            alert(`📧 Campaign prepared with ${templateCount} templates for ${recipientCount} candidates.`);
          }
          break;
          
        case 'generate-report':
          {
            const reportRes = await axios.get(`${API_URL}/api/reports/applications-per-job/csv`, {
              headers: { Authorization: `Bearer ${token}` },
              responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([reportRes.data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `ATS-Report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            alert('📊 Report generated and downloaded successfully!');
          }
          break;
          
        case 'backup-data':
          alert('⚠️ Backup endpoint is not configured yet.');
          break;
          
        case 'sync-integrations':
          alert('⚠️ Integration sync endpoint is not configured yet.');
          break;
          
        default:
          console.log('Unknown action:', actionId);
      }
    } catch (error) {
      console.error('Quick action error:', error);
      alert('❌ Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000
    }}>
      {/* Expanded Actions */}
      {isExpanded && (
        <div style={{
          marginBottom: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          width: '320px'
        }}>
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={loading}
              style={{
                background: '#fff',
                border: `2px solid ${action.color}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
              }}
            >
              <div style={{
                fontSize: '24px',
                marginBottom: '8px',
                color: action.color
              }}>
                {action.icon}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '4px'
              }}>
                {action.title}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                lineHeight: 1.3
              }}>
                {action.description}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={loading}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: loading 
            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          border: 'none',
          color: '#fff',
          fontSize: '24px',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginLeft: 'auto'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
          }
        }}
      >
        {loading ? (
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : isExpanded ? (
          '×'
        ) : (
          '⚡'
        )}
      </button>

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Tooltip */}
      {!isExpanded && !loading && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '0',
          background: '#111827',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s',
          zIndex: 1001
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        >
          Quick Actions
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '20px',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #111827'
          }} />
        </div>
      )}
    </div>
  );
};

export default QuickActionsWidget;