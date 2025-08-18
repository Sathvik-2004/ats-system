
import React from 'react';

const Success = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f7fafc',
    fontFamily: 'Segoe UI, Arial, sans-serif',
  }}>
    <div style={{
      background: 'linear-gradient(90deg,#3182ce 0%,#00bcd4 100%)',
      borderRadius: '50%',
      width: 80,
      height: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      boxShadow: '0 2px 12px rgba(49,130,206,0.12)',
    }}>
      <span style={{ fontSize: 40, color: '#fff' }}>&#10004;</span>
    </div>
    <h2 style={{
      color: '#2d3748',
      fontWeight: 700,
      marginBottom: 12,
      fontSize: 28,
      textAlign: 'center',
    }}>
      Application Submitted Successfully!
    </h2>
    <p style={{
      color: '#4a5568',
      fontSize: 18,
      textAlign: 'center',
      maxWidth: 400,
    }}>
      Thank you for applying. We'll get back to you soon.
    </p>
  </div>
);

export default Success;
