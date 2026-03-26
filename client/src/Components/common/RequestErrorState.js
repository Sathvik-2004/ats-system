import React from 'react';
import './feedback.css';

const RequestErrorState = ({
  message = 'Something went wrong while loading data.',
  onRetry,
  compact = false
}) => {
  const containerClass = compact ? 'request-error-wrap request-error-compact' : 'request-error-wrap';

  return (
    <div className={containerClass} role="alert">
      <h3 className="request-error-title">Unable to load data</h3>
      <p className="request-error-message">{message}</p>
      {typeof onRetry === 'function' && (
        <button type="button" className="request-error-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default RequestErrorState;
