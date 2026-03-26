import React from 'react';
import './feedback.css';

const LoadingSpinner = ({ label = 'Loading...', fullscreen = false, size = 'md' }) => {
  const classes = [
    'loading-spinner-wrap',
    fullscreen ? 'loading-spinner-fullscreen' : '',
    size === 'sm' ? 'loading-spinner-sm' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="status" aria-live="polite">
      <div className="loading-spinner-circle" />
      <p className="loading-spinner-label">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
