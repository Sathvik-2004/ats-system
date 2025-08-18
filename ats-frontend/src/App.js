

import atsLogo from './ats-logo.svg';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ApplicationForm from './components/ApplicationForm';
import Success from './pages/success';
import AdminView from './pages/AdminView';
import AdminLogin from './components/AdminLogin';
import Spinner from './components/Spinner';
import JobModal from './components/JobModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function Navbar({ dark }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
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
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: collapsed ? 64 : 240,
      background: dark ? '#232733' : '#f7f8fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      paddingTop: '32px',
      boxShadow: dark ? '2px 0 16px rgba(49,130,206,0.10)' : '2px 0 16px rgba(49,130,206,0.08)',
      zIndex: 100,
      borderRight: dark ? '1px solid #232733' : '1px solid #e2e8f0',
      transition: 'width 0.2s',
    }}>
      <button onClick={() => setCollapsed(!collapsed)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', zIndex: 101, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }} title={collapsed ? 'Expand' : 'Collapse'}>
        <span style={{ display: 'inline-block', width: 24, height: 24 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="5" width="24" height="2.5" rx="1.25" fill="#2563eb" />
            <rect y="11" width="24" height="2.5" rx="1.25" fill="#2563eb" />
            <rect y="17" width="24" height="2.5" rx="1.25" fill="#2563eb" />
          </svg>
        </span>
      </button>
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
          <img src={atsLogo} alt="ATS Logo" style={{ width: 32, height: 32 }} />
        </div>
        {!collapsed && <div style={{ color: dark ? '#fff' : '#2563eb', fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>Applicant Profile</div>}
      </div>
  <Link to="/" style={navLinkStyle(location.pathname === '/')}> <span role="img" aria-label="home" style={{ fontSize: 28, verticalAlign: 'middle' }}>📊</span> {!collapsed && 'Home'} </Link>
  <Link to="/admin" style={navLinkStyle(location.pathname === '/admin')}> <span role="img" aria-label="admin-dashboard" style={{ fontSize: 28, verticalAlign: 'middle' }}>👤</span> {!collapsed && 'Admin Dashboard'} </Link>
  <Link to="/jobs" style={navLinkStyle(location.pathname === '/jobs')}> <span role="img" aria-label="jobs" style={{ fontSize: 28, verticalAlign: 'middle' }}>💼</span> {!collapsed && 'Jobs'} </Link>
  <Link to="/settings" style={navLinkStyle(location.pathname === '/settings')}> <span role="img" aria-label="settings" style={{ fontSize: 28, verticalAlign: 'middle' }}>⚙️</span> {!collapsed && 'Settings'} </Link>
    </nav>
  );
}

// ...existing code...
function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState('');
  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(() => {
        setJobs([]);
        setLoading(false);
        toast.error('Failed to load jobs');
      });
  }, []);
  return (
    <div style={{
      marginLeft: '260px',
      padding: '48px',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      maxWidth: 700,
      marginTop: '40px',
      minHeight: 320,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h2 style={{ color: '#2563eb', fontWeight: 700, marginBottom: 24 }}>Available Jobs</h2>
      <div style={{ width: '100%', marginBottom: 18 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, marginBottom: 4 }}
        />
      </div>
      {loading ? <Spinner /> : jobs.length === 0 ? (
        <p>No jobs available.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
          {jobs.filter(job => job.title.toLowerCase().includes(search.toLowerCase())).map(job => (
            <li key={job._id} style={{
              background: '#f7f8fa',
              marginBottom: 12,
              padding: '16px 20px',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(49,130,206,0.06)',
              fontWeight: 500,
              color: '#2d3748',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }} onClick={() => setSelectedJob(job)}>
              {job.title}
            </li>
          ))}
        </ul>
      )}
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      <ToastContainer position="bottom-right" autoClose={2500} />
    </div>
  );
}

function Settings({ dark, setDark }) {
  const [language, setLanguage] = useState('English');
  const translations = {
    English: {
      settings: 'Settings',
      changePassword: 'Change Password',
      emailNotifications: 'Email Notifications',
      language: 'Language',
      darkTheme: 'Enable Dark Theme',
      logout: 'Logout',
      contact: 'Contact Support / Feedback',
      send: 'Send',
      feedbackPlaceholder: 'Type your feedback or support request here...'
    },
    Hindi: {
      settings: 'सेटिंग्स',
      changePassword: 'पासवर्ड बदलें',
      emailNotifications: 'ईमेल सूचनाएं',
      language: 'भाषा',
      darkTheme: 'डार्क थीम सक्षम करें',
      logout: 'लॉग आउट',
      contact: 'सहायता / प्रतिक्रिया',
      send: 'भेजें',
      feedbackPlaceholder: 'अपनी प्रतिक्रिया या सहायता अनुरोध यहाँ लिखें...'
    },
    Telugu: {
      settings: 'సెట్టింగ్స్',
      changePassword: 'పాస్‌వర్డ్ మార్చండి',
      emailNotifications: 'ఇమెయిల్ నోటిఫికేషన్స్',
      language: 'భాష',
      darkTheme: 'డార్క్ థీమ్ ప్రారంభించండి',
      logout: 'లాగ్ అవుట్',
      contact: 'సపోర్ట్ / ఫీడ్‌బ్యాక్',
      send: 'పంపండి',
      feedbackPlaceholder: 'మీ ఫీడ్‌బ్యాక్ లేదా సపోర్ట్ అభ్యర్థనను ఇక్కడ టైప్ చేయండి...'
    }
  };
  const [notifications, setNotifications] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { toast } = require('react-toastify');

  const handleLogout = () => {
    window.location.href = '/';
  };

  const handleSavePassword = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success('Password saved!');
      setSaving(false);
      setPassword('');
    }, 1200);
  };
  return (
    <div style={{
      marginLeft: '260px',
      padding: '48px',
      background: dark ? '#1a202c' : '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      maxWidth: 700,
      marginTop: '40px',
      color: dark ? '#fff' : '#2d3748',
      transition: 'background 0.3s, color 0.3s',
      animation: 'fadeIn 0.5s',
    }}>
  <h2 style={{ color: dark ? '#fff' : '#2563eb', fontWeight: 700, marginBottom: 24 }}>{translations[language].settings}</h2>
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        {/* Change Password */}
  <button onClick={() => setShowChangePassword(!showChangePassword)} style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>{translations[language].changePassword}</button>
        {showChangePassword && (
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 8 }}
            />
            <button onClick={handleSavePassword} disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, background: saving ? '#a5b4fc' : '#2563eb', color: '#fff', border: 'none', fontWeight: 600 }}>{saving ? 'Saving...' : 'Save Password'}</button>
          </div>
        )}
        {/* Notification Preferences */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, fontSize: 16 }}>
            <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} style={{ marginRight: 8 }} />
            {translations[language].emailNotifications}
          </label>
        </div>
        {/* Language Selection */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, fontSize: 16, marginRight: 8 }}>{translations[language].language}:</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
          </select>
        </div>
        {/* Theme Selection */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, fontSize: 16 }}>
            <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} style={{ marginRight: 8 }} />
            {translations[language].darkTheme}
          </label>
        </div>
        {/* Logout Button */}
  <button onClick={handleLogout} style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 8, background: '#e53e3e', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>{translations[language].logout}</button>
        {/* Contact Support/Feedback */}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontWeight: 500, fontSize: 16, display: 'block', marginBottom: 8 }}>{translations[language].contact}</label>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder={translations[language].feedbackPlaceholder}
            style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1px solid #e2e8f0', padding: 8 }}
          />
          <button
            style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600 }}
            onClick={() => {
              if (!feedback.trim()) {
                toast.error('Please enter feedback before submitting.');
                return;
              }
              setTimeout(() => {
                toast.success('Feedback submitted!');
                setFeedback('');
                setFeedbackSubmitted(true);
                setTimeout(() => setFeedbackSubmitted(false), 2000);
              }, 800);
            }}
          >{translations[language].send}</button>
          {feedbackSubmitted && (
            <div style={{ marginTop: 8, color: '#22c55e', fontWeight: 500, fontSize: 15 }}>
              Feedback submitted!
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/admin' && adminToken) {
      setAdminToken(null);
    }
  }, [location.pathname, adminToken]);

  return (
    <div style={{ background: dark ? '#181c23' : '#f7f9fb', minHeight: '100vh', transition: 'background 0.3s', position: 'relative' }}>
      <Navbar dark={dark} />
      <div style={{ position: 'absolute', left: '240px', top: 0, right: 0, bottom: 0, minHeight: '100vh', background: dark ? '#181c23' : '#f7f9fb', transition: 'background 0.3s', padding: 0 }}>
        <div style={{ width: '100%', textAlign: 'center', paddingTop: 32, paddingBottom: 8 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: dark ? '#fff' : '#2563eb', letterSpacing: 1, margin: 0, fontFamily: 'Segoe UI, Arial, sans-serif' }}>Application Tracking System</h1>
        </div>
        <Routes>
          <Route path="/" element={<ApplicationForm />} />
          <Route path="/success" element={<Success />} />
          <Route path="/admin" element={adminToken ? <AdminView token={adminToken} /> : <AdminLogin onLogin={setAdminToken} />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/settings" element={<Settings dark={dark} setDark={setDark} />} />
        </Routes>
      </div>
      <footer style={{ position: 'fixed', left: 0, bottom: 0, width: 240, background: dark ? '#18181b' : '#f7f8fa', color: dark ? '#fff' : '#2563eb', fontWeight: 500, fontSize: 14, textAlign: 'center', padding: '12px 0', borderTop: '1px solid #e2e8f0', boxShadow: '0 -2px 8px rgba(49,130,206,0.06)', zIndex: 999, transition: 'background 0.3s, color 0.3s' }}>
        © 2025 ATS System
      </footer>
    </div>
  );
}

export default App;
