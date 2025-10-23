import React from 'react';
import { toast } from 'react-toastify';

const TestLoginHelper = ({ onLogin }) => {
  const handleTestUserLogin = () => {
    const autoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ2YWVlOTY1MDQxNmMzODViYzBmNWIiLCJlbWFpbCI6InNhdGh3aWtyZWRkeTkyMjhAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTk5MzM0MDgsImV4cCI6MTc2MDUzODIwOH0.fo69NVCkgbcLfvURs9kgSZBqJDQICgqnQLp0GESVqCc';
    const autoUserData = {
      id: '68d6aee9650416c385bc0f5b',
      name: 'k. sathvik reddy',
      email: 'sathwikreddy9228@gmail.com',
      role: 'user'
    };

    localStorage.setItem('token', autoToken);
    localStorage.setItem('userData', JSON.stringify(autoUserData));
    localStorage.setItem('userType', 'user');
    
    toast.success('Test user logged in!');
    onLogin(autoToken, 'user');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 1000
    }}>
      <div style={{ marginBottom: '8px', fontSize: '12px', opacity: 0.8 }}>
        🧪 Development Testing
      </div>
      <button
        onClick={handleTestUserLogin}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        Quick Test User Login
      </button>
    </div>
  );
};

export default TestLoginHelper;