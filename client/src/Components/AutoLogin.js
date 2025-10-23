import React, { useEffect } from 'react';

const AutoLogin = () => {
  useEffect(() => {
    // Auto-login for testing purposes
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ2YWVlOTY1MDQxNmMzODViYzBmNWIiLCJlbWFpbCI6InNhdGh3aWtyZWRkeTkyMjhAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTkyNDQzOTQsImV4cCI6MTc1OTMzMDc5NH0.J2aek-oo83E-QsWkMWDj2x2G46ytkXu8uScyFho2DqA';
    const userData = {
      id: '68d6aee9650416c385bc0f5b',
      name: 'k. sathvik reddy',
      email: 'sathwikreddy9228@gmail.com',
      role: 'user'
    };

    // Set authentication data
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    console.log('✅ Auto-login completed');
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#22c55e',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      🔑 Auto-logged in as test user
    </div>
  );
};

export default AutoLogin;