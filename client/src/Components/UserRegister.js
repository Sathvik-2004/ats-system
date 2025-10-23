import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      if (response.data.success) {
        toast.success('Registration successful! Please login to continue.');
        navigate('/user-login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
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
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
          }}>
            ✨
          </div>
          <h2 style={{
            color: '#2d3748',
            fontWeight: 700,
            fontSize: 28,
            marginBottom: 8,
          }}>Create Account</h2>
          <p style={{
            color: '#4a5568',
            fontSize: 16,
          }}>Join our platform and start applying for jobs</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              color: '#4a5568',
              fontWeight: 500,
              fontSize: 14,
            }}>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
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
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

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
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
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
              placeholder="Create a password"
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
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
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
            }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
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
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              borderRadius: 10,
              padding: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(34,197,94,0.2)',
              transition: 'all 0.3s',
              marginBottom: 16,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
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
              Already have an account? 
              <Link to="/user-login" style={{
                color: '#22c55e',
                textDecoration: 'none',
                fontWeight: 500,
                marginLeft: 4,
              }}>
                Sign in here
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

export default UserRegister;