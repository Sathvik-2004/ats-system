import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = ({ dark = false, userType, onLogout, onToggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 1024;
      setIsMobile(nextIsMobile);
      if (!nextIsMobile) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    onLogout();
    navigate('/');
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const navLinkStyle = (active) => ({
    color: active ? (dark ? '#2563eb' : '#2563eb') : (dark ? '#cbd5e1' : '#2d3748'),
    fontWeight: 600,
    fontSize: 16,
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    background: active ? (dark ? 'rgba(49,130,206,0.18)' : 'rgba(49,130,206,0.12)') : 'none',
    marginBottom: 8,
    width: '90%',
    borderLeft: active ? '4px solid #2563eb' : '4px solid transparent',
    transition: 'background 0.2s, border-left 0.2s',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  });

  return (
    <>
    {isMobile && (
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          width: 44,
          height: 44,
          borderRadius: 10,
          background: '#2563eb',
          border: 'none',
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          zIndex: 1201,
          boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)'
        }}
        title={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
    )}
    {isMobile && mobileOpen && (
      <div
        onClick={() => setMobileOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          zIndex: 1198
        }}
      />
    )}
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: isMobile ? 240 : collapsed ? 64 : 240,
      background: dark ? '#232733' : '#f7f8fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      paddingTop: '32px',
      boxShadow: dark ? '2px 0 16px rgba(49,130,206,0.10)' : '2px 0 16px rgba(49,130,206,0.08)',
      zIndex: 1200,
      borderRight: dark ? '1px solid #232733' : '1px solid #e2e8f0',
      transition: 'width 0.2s, transform 0.25s ease',
      transform: isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)',
    }}>
      {!isMobile && <button onClick={() => setCollapsed(!collapsed)} style={{ 
        position: 'absolute', 
        top: 12, 
        right: 12, 
        background: 'none', 
        border: 'none', 
        color: '#2563eb', 
        cursor: 'pointer', 
        zIndex: 101, 
        width: 32, 
        height: 32, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 0 
      }} title={collapsed ? 'Expand' : 'Collapse'}>
        <span style={{ display: 'inline-block', width: 24, height: 24 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="5" width="24" height="2.5" rx="1.25" fill="#2563eb" />
            <rect y="11" width="24" height="2.5" rx="1.25" fill="#2563eb" />
            <rect y="17" width="24" height="2.5" rx="1.25" fill="#2563eb" />
          </svg>
        </span>
      </button>}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          background: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
          overflow: 'hidden',
        }}>
          <span style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>ATS</span>
        </div>
        {(!collapsed || isMobile) && <div style={{ color: dark ? '#fff' : '#2563eb', fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
          {userType === 'admin' ? 'Admin Portal' : 'Job Portal'}
        </div>}
      </div>
      
      {userType === 'user' && (
        <>
          <Link to="/overview" onClick={handleNavClick} style={navLinkStyle(location.pathname === '/overview')}>
            <span role="img" aria-label="overview" style={{ fontSize: 28, verticalAlign: 'middle' }}>🚀</span>
            {(!collapsed || isMobile) && 'Overview'}
          </Link>
          <Link to="/dashboard" onClick={handleNavClick} style={navLinkStyle(location.pathname === '/dashboard')}>
            <span role="img" aria-label="dashboard" style={{ fontSize: 28, verticalAlign: 'middle' }}>📝</span>
            {(!collapsed || isMobile) && 'Apply for Jobs'}
          </Link>
          <Link to="/my-applications" onClick={handleNavClick} style={navLinkStyle(location.pathname === '/my-applications')}>
            <span role="img" aria-label="applications" style={{ fontSize: 28, verticalAlign: 'middle' }}>📊</span>
            {(!collapsed || isMobile) && 'My Applications'}
          </Link>
          <Link to="/job-search" onClick={handleNavClick} style={navLinkStyle(location.pathname === '/job-search')}>
            <span role="img" aria-label="job-search" style={{ fontSize: 28, verticalAlign: 'middle' }}>🔍</span>
            {(!collapsed || isMobile) && 'Job Search'}
          </Link>
          <Link to="/analytics" onClick={handleNavClick} style={navLinkStyle(location.pathname === '/analytics')}>
            <span role="img" aria-label="analytics" style={{ fontSize: 28, verticalAlign: 'middle' }}>📈</span>
            {(!collapsed || isMobile) && 'Analytics'}
          </Link>
          <Link to="/notifications" onClick={handleNavClick} style={navLinkStyle(location.pathname === '/notifications')}>
            <span role="img" aria-label="notifications" style={{ fontSize: 28, verticalAlign: 'middle' }}>🔔</span>
            {(!collapsed || isMobile) && 'Notifications'}
          </Link>
          <Link to="/profile" onClick={handleNavClick} style={navLinkStyle(location.pathname === '/profile')}>
            <span role="img" aria-label="profile" style={{ fontSize: 28, verticalAlign: 'middle' }}>👤</span>
            {(!collapsed || isMobile) && 'Profile'}
          </Link>
          <Link to="/settings" onClick={handleNavClick} style={navLinkStyle(location.pathname === '/settings')}>
            <span role="img" aria-label="settings" style={{ fontSize: 28, verticalAlign: 'middle' }}>⚙️</span>
            {(!collapsed || isMobile) && 'Settings'}
          </Link>
        </>
      )}
      
      {userType === 'admin' && (
        <Link to="/admin" onClick={handleNavClick} style={navLinkStyle(location.pathname === '/admin')}>
          <span role="img" aria-label="admin-dashboard" style={{ fontSize: 28, verticalAlign: 'middle' }}>👤</span>
          {(!collapsed || isMobile) && 'Admin Dashboard'}
        </Link>
      )}

      {/* Logout Button */}
      <div style={{ marginTop: 'auto', marginBottom: '24px', width: '100%', paddingLeft: '10px', paddingRight: '10px' }}>
        <button
          onClick={onToggleTheme}
          style={{
            width: '90%',
            background: dark ? '#334155' : '#e2e8f0',
            color: dark ? '#f8fafc' : '#1e293b',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            cursor: 'pointer',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 16 }}>{dark ? '☀️' : '🌙'}</span>
          {(!collapsed || isMobile) && (dark ? 'Light Mode' : 'Dark Mode')}
        </button>
        <button
          onClick={handleLogout}
          style={{
            width: '90%',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            gap: 12,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: 16 }}>🚪</span>
          {(!collapsed || isMobile) && 'Sign Out'}
        </button>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
