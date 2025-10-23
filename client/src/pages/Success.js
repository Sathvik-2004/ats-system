import React from 'react';
import { Link } from 'react-router-dom';
import './Success.css';

const Success = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: 500,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        padding: '48px 40px',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        textAlign: 'center',
        animation: 'successBounce 0.8s ease-out',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}></div>
        
        {/* Success icon with animation */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: 48,
          animation: 'pulse 2s infinite',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
          position: 'relative',
          zIndex: 1,
        }}>
          ✅
        </div>
        
        <h1 style={{
          color: '#1f2937',
          fontWeight: 800,
          fontSize: 32,
          marginBottom: 16,
          letterSpacing: '-0.5px',
          position: 'relative',
          zIndex: 1,
        }}>
          🎉 Success!
        </h1>
        
        <h2 style={{
          color: '#374151',
          fontWeight: 600,
          fontSize: 24,
          marginBottom: 24,
          position: 'relative',
          zIndex: 1,
        }}>
          Application Submitted Successfully
        </h2>
        
        <p style={{
          color: '#6b7280',
          fontSize: 18,
          marginBottom: 20,
          lineHeight: 1.7,
          position: 'relative',
          zIndex: 1,
        }}>
          Thank you for applying! We have received your application and our team will review it shortly.
        </p>
        
        <div style={{
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '32px',
          position: 'relative',
          zIndex: 1,
        }}>
          <p style={{
            color: '#4b5563',
            fontSize: '16px',
            margin: 0,
            fontWeight: 500,
          }}>
            📧 You will receive an email confirmation within the next few minutes.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1,
        }}>
          <Link 
            to="/user-dashboard" 
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }}
          >
            🏠 Back to Dashboard
          </Link>
          
          <Link 
            to="/my-applications" 
            style={{
              background: '#fff',
              color: '#667eea',
              fontWeight: 600,
              fontSize: 16,
              border: '2px solid #667eea',
              borderRadius: 12,
              padding: '12px 26px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = '#fff';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fff';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            📊 View Applications
          </Link>
        </div>

        <style>{`
          @keyframes successBounce {
            0% { opacity: 0; transform: scale(0.5) translateY(50px); }
            60% { opacity: 1; transform: scale(1.1) translateY(-10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Success;
