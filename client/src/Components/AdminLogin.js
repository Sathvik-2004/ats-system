import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('🛠️ Admin login attempt with:', formData);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('🌍 Environment API_URL:', process.env.REACT_APP_API_URL);
      console.log('📡 Final API_URL:', API_URL);
      console.log('📡 Sending request to:', `${API_URL}/api/admin/login`);
      console.log('📤 Request payload:', formData);
      const response = await axios.post(`${API_URL}/api/admin/login`, formData);
      
      console.log('✅ Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('adminData', JSON.stringify(response.data.admin || { username: formData.username }));
        
        toast.success('Admin login successful!');
        onLogin(response.data.token, 'admin');
        navigate('/admin');
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Invalid admin credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: 420,
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        padding: '40px',
        animation: 'fadeIn 0.6s',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 32,
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
          }}>
            🔐
          </div>
          <h2 style={{
            color: '#2d3748',
            fontWeight: 700,
            fontSize: 28,
            marginBottom: 8,
          }}>Admin Login</h2>
          <p style={{
            color: '#4a5568',
            fontSize: 16,
          }}>Admin portal access - authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: '#4a5568',
              fontWeight: 500,
              fontSize: 14,
            }}>Admin Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter admin username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #e2e8f0',
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: '#4a5568',
              fontWeight: 500,
              fontSize: 14,
            }}>Admin Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter admin password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #e2e8f0',
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              borderRadius: 10,
              padding: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(124,58,237,0.2)',
              transition: 'all 0.3s',
              marginBottom: 16,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? 'Signing In...' : 'Admin Sign In'}
          </button>

          <div style={{
            textAlign: 'center',
            marginTop: 20,
          }}>
            <Link 
              to="/"
              style={{
                color: '#718096',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              ← Back to login selection
            </Link>
          </div>
        </form>

        <div style={{
          marginTop: 24,
          padding: '16px',
          background: '#fef3c7',
          borderRadius: 8,
          border: '1px solid #f59e0b',
        }}>
          <p style={{
            color: '#92400e',
            fontSize: 12,
            margin: 0,
            textAlign: 'center',
          }}>
            🔒 This is a secure admin area. Unauthorized access is prohibited.
          </p>
        </div>

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

export default AdminLogin;