import React, { useState } from 'react';

const BulkActions = ({ selectedItems = [], onBulkAction, availableActions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const defaultActions = [
    {
      id: 'approve',
      label: 'Approve Selected',
      icon: '✅',
      color: '#10b981',
      confirmMessage: `Are you sure you want to approve ${selectedItems.length} applications?`
    },
    {
      id: 'reject',
      label: 'Reject Selected',
      icon: '❌',
      color: '#ef4444',
      confirmMessage: `Are you sure you want to reject ${selectedItems.length} applications?`
    },
    {
      id: 'interview',
      label: 'Schedule Interview',
      icon: '📅',
      color: '#3b82f6',
      confirmMessage: `Schedule interviews for ${selectedItems.length} candidates?`
    },
    {
      id: 'archive',
      label: 'Archive Selected',
      icon: '📦',
      color: '#6b7280',
      confirmMessage: `Archive ${selectedItems.length} applications?`
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: '📊',
      color: '#8b5cf6',
      confirmMessage: `Export ${selectedItems.length} applications to CSV?`
    },
    {
      id: 'email',
      label: 'Send Email',
      icon: '📧',
      color: '#f59e0b',
      confirmMessage: `Send email to ${selectedItems.length} candidates?`
    }
  ];

  const actions = availableActions.length > 0 ? availableActions : defaultActions;

  const handleAction = (action) => {
    setConfirmAction(action);
  };

  const confirmBulkAction = () => {
    if (confirmAction && onBulkAction) {
      onBulkAction(confirmAction.id, selectedItems);
    }
    setConfirmAction(null);
    setIsOpen(false);
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        animation: 'slideUp 0.3s ease-out',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <span style={{ fontSize: '16px' }}>✨</span>
          {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            Actions {isOpen ? '▼' : '▶'}
          </button>

          {/* Quick Actions */}
          <button
            onClick={() => handleAction(actions.find(a => a.id === 'approve'))}
            style={{
              background: '#10b981',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ✅ Approve
          </button>

          <button
            onClick={() => handleAction(actions.find(a => a.id === 'reject'))}
            style={{
              background: '#ef4444',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ❌ Reject
          </button>
        </div>
      </div>

      {/* Actions Dropdown */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 1001,
          minWidth: '200px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'background 0.2s',
                borderRadius: action === actions[0] ? '12px 12px 0 0' : 
                             action === actions[actions.length - 1] ? '0 0 12px 12px' : '0'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span style={{ fontSize: '16px' }}>{action.icon}</span>
              <span style={{ color: action.color, fontWeight: '500' }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {confirmAction.icon}
            </div>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827'
            }}>
              Confirm Bulk Action
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              {confirmAction.confirmMessage}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmAction(null)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkAction}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: confirmAction.color,
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default BulkActions;