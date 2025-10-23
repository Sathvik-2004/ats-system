import React from 'react';

const ToastNotification = ({ 
  message, 
  type = 'info', 
  isVisible = false, 
  onClose,
  duration = 4000 
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    const styles = {
      success: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        icon: '✅'
      },
      error: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        icon: '❌'
      },
      warning: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        icon: '⚠️'
      },
      info: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        icon: 'ℹ️'
      }
    };
    return styles[type] || styles.info;
  };

  const typeStyle = getTypeStyles();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      minWidth: '300px',
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        background: typeStyle.background,
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <span style={{ fontSize: '18px' }}>{typeStyle.icon}</span>
        <div style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>
          {message}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;