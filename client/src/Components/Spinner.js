import React from 'react';

const Spinner = ({ size = 24, color = '#fff' }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}30`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Spinner;