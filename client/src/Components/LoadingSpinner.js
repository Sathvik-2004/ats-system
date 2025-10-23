import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizes = {
    small: { spinner: '20px', text: '12px' },
    medium: { spinner: '40px', text: '14px' },
    large: { spinner: '60px', text: '16px' }
  };

  const currentSize = sizes[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '12px'
    }}>
      <div
        style={{
          width: currentSize.spinner,
          height: currentSize.spinner,
          border: '3px solid #f3f4f6',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <div style={{
        fontSize: currentSize.text,
        color: '#6b7280',
        fontWeight: '500'
      }}>
        {text}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;