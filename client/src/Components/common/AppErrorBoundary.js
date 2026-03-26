import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred.'
    };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f4f7fb' }}>
        <div style={{ maxWidth: 520, width: '100%', background: '#fff', border: '1px solid #d9e2ec', borderRadius: 14, padding: 20 }}>
          <h2 style={{ marginTop: 0, color: '#13212a' }}>Something went wrong</h2>
          <p style={{ color: '#5f6d79' }}>{this.state.errorMessage}</p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{ border: 0, borderRadius: 10, background: '#2563eb', color: '#fff', padding: '10px 14px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
