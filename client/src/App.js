import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSelection from './Components/LoginSelection';
import UserLogin from './Components/UserLogin';
import AdminLogin from './Components/AdminLogin';
import UserRegister from './Components/UserRegister';
import OverviewDashboard from './Components/OverviewDashboard';
import UserDashboard from './Components/UserDashboard';
import MyApplications from './Components/MyApplications';
import JobSearchDashboard from './Components/JobSearchDashboard';
import AnalyticsDashboard from './Components/AnalyticsDashboard';
import ProfileDashboard from './Components/ProfileDashboard';
import SettingsDashboard from './Components/SettingsDashboard';
import Success from './pages/Success';
import AdminDashboard from './Components/AdminDashboard';
import AdminOverviewDashboard from './Components/AdminOverviewDashboard';
import AdminAnalytics from './Components/AdminAnalytics';
import AdminJobManagement from './Components/AdminJobManagement';
import AdminUserManagement from './Components/AdminUserManagement';
import SystemSettings from './Components/SystemSettings';
import AdvancedAnalyticsDashboard from './Components/AdvancedAnalyticsDashboard';
import UserManagementDashboard from './Components/UserManagementDashboard';
import EmailTemplateDesigner from './Components/EmailTemplateDesigner';
import AIResumeScreening from './Components/AIResumeScreening';
import InterviewManagement from './Components/InterviewManagement';
import AuditLogsSystem from './Components/AuditLogsSystem';
import AdvancedReportsDashboard from './Components/AdvancedReportsDashboard';
import Navbar from './Components/Navbar';
import AdminNavbar from './Components/AdminNavbar';
import TestLoginHelper from './Components/TestLoginHelper';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    
    if (token && storedUserType) {
      setIsAuthenticated(true);
      setUserType(storedUserType);
    }
    // No auto-login - let user choose login type
    setLoading(false);
  }, []);

  const handleLogin = (token, type) => {
    setIsAuthenticated(true);
    setUserType(type);
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('adminData');
    
    setIsAuthenticated(false);
    setUserType(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f9fb',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3182ce',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />
      
      {!isAuthenticated ? (
        // Authentication Routes
        <>
          <Routes>
            <Route path="/" element={<LoginSelection />} />
            <Route path="/user-login" element={<UserLogin onLogin={handleLogin} />} />
            <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <TestLoginHelper onLogin={handleLogin} />
        </>
      ) : (
        // Authenticated Routes
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Conditional Navigation */}
          {userType === 'user' ? (
            <Navbar userType={userType} onLogout={handleLogout} />
          ) : (
            <AdminNavbar onLogout={handleLogout} />
          )}
          
          <div style={{ 
            marginLeft: userType === 'admin' ? '280px' : '240px', 
            width: userType === 'admin' ? 'calc(100% - 280px)' : 'calc(100% - 240px)', 
            background: '#f8fafc',
            minHeight: '100vh'
          }}>
            <Routes>
              {userType === 'user' && (
                <>
                  <Route path="/overview" element={<OverviewDashboard />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/my-applications" element={<MyApplications />} />
                  <Route path="/job-search" element={<JobSearchDashboard />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/profile" element={<ProfileDashboard />} />
                  <Route path="/settings" element={<SettingsDashboard />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="*" element={<Navigate to="/overview" />} />
                </>
              )}
              {userType === 'admin' && (
                <>
                  <Route path="/admin" element={<AdminOverviewDashboard />} />
                  <Route path="/admin/applications" element={<AdminDashboard />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/analytics-dashboard" element={<AdvancedAnalyticsDashboard />} />
                  <Route path="/admin/jobs" element={<AdminJobManagement />} />
                  <Route path="/admin/users" element={<AdminUserManagement />} />
                  <Route path="/admin/user-management" element={<UserManagementDashboard />} />
                  <Route path="/admin/email-templates" element={<EmailTemplateDesigner />} />
                  <Route path="/admin/ai-screening" element={<AIResumeScreening />} />
                  <Route path="/admin/interviews" element={<InterviewManagement />} />
                  <Route path="/admin/audit-logs" element={<AuditLogsSystem />} />
                  <Route path="/admin/reports" element={<AdvancedReportsDashboard />} />
                  <Route path="/admin/settings" element={<SystemSettings />} />
                  <Route path="*" element={<Navigate to="/admin" />} />
                </>
              )}
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
