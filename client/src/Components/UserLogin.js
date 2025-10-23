import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
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

    try {
      const response = await axios.post('http://localhost:5000/api/auth/user-login', formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'user');
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        toast.success('Login successful!');
        onLogin(response.data.token, 'user');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.');
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
            background: 'linear-gradient(135deg, #3182ce 0%, #00bcd4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
          }}>
            👤
          </div>
          <h2 style={{
            color: '#2d3748',
            fontWeight: 700,
            fontSize: 28,
            marginBottom: 8,
          }}>User Login</h2>
          <p style={{
            color: '#4a5568',
            fontSize: 16,
          }}>Welcome back! Please enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: '#4a5568',
              fontWeight: 500,
              fontSize: 14,
            }}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
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
              onFocus={(e) => e.target.style.borderColor = '#3182ce'}
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
            }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
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
              onFocus={(e) => e.target.style.borderColor = '#3182ce'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3182ce 0%, #00bcd4 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              borderRadius: 10,
              padding: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(49,130,206,0.2)',
              transition: 'all 0.3s',
              marginBottom: 16,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={{
            textAlign: 'center',
            marginTop: 20,
          }}>
            <p style={{
              color: '#718096',
              fontSize: 14,
              marginBottom: 12,
            }}>
              Don't have an account? 
              <Link to="/register" style={{
                color: '#3182ce',
                textDecoration: 'none',
                fontWeight: 500,
                marginLeft: 4,
              }}>
                Register here
              </Link>
            </p>
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

export default UserLogin;