import React from 'react';
import { Link } from 'react-router-dom';

const LoginSelection = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: 480,
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        padding: '48px 40px',
        textAlign: 'center',
        animation: 'fadeIn 0.6s',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 36,
          color: '#fff',
          fontWeight: 'bold',
        }}>
          ATS
        </div>
        
        <h1 style={{
          color: '#2d3748',
          fontWeight: 800,
          fontSize: 32,
          marginBottom: 16,
          letterSpacing: 0.5,
        }}>Welcome to ATS Portal</h1>
        
        <p style={{
          color: '#4a5568',
          fontSize: 18,
          marginBottom: 40,
          lineHeight: 1.6,
        }}>
          Please select your login type to continue
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <Link 
            to="/user-login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              background: 'linear-gradient(135deg, #3182ce 0%, #00bcd4 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              border: 'none',
              borderRadius: 12,
              padding: '16px 24px',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(49,130,206,0.2)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(49,130,206,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(49,130,206,0.2)';
            }}
          >
            <span style={{ fontSize: 24 }}>👤</span>
            Login as User
          </Link>

          <Link 
            to="/admin-login"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              border: 'none',
              borderRadius: 12,
              padding: '16px 24px',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124,58,237,0.2)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(124,58,237,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(124,58,237,0.2)';
            }}
          >
            <span style={{ fontSize: 24 }}>🔐</span>
            Login as Admin
          </Link>
        </div>

        <p style={{
          color: '#718096',
          fontSize: 14,
          marginTop: 32,
          marginBottom: 0,
        }}>
          New user? Contact admin to create an account
        </p>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoginSelection;