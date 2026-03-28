import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginSelection from './Components/LoginSelection';
import UserLogin from './Components/UserLogin';
import AdminLogin from './Components/AdminLogin';
import UserRegister from './Components/UserRegister';
import Navbar from './Components/Navbar';
import AdminNavbar from './Components/AdminNavbar';
import TestLoginHelper from './Components/TestLoginHelper';
import { ToastContainer, toast } from 'react-toastify';
import { ensureValidSession } from './utils/authSession';
import { SESSION_EXPIRED_EVENT, setupApiInterceptors } from './utils/apiInterceptors';
import { connectSocket, disconnectSocket } from './utils/socket';
import LoadingSpinner from './Components/common/LoadingSpinner';
import AppErrorBoundary from './Components/common/AppErrorBoundary';
import {
  applyThemeMode,
  getInitialThemeMode,
  resolveThemeMode,
  subscribeToSystemThemeChanges,
  toggleThemeMode
} from './utils/theme';
import 'react-toastify/dist/ReactToastify.css';

const OverviewDashboard = lazy(() => import('./Components/OverviewDashboard'));
const UserDashboard = lazy(() => import('./Components/UserDashboard'));
const MyApplications = lazy(() => import('./Components/MyApplications'));
const JobSearchDashboard = lazy(() => import('./Components/JobSearchDashboard'));
const AnalyticsDashboard = lazy(() => import('./Components/AnalyticsDashboard'));
const ProfileDashboard = lazy(() => import('./Components/ProfileDashboard'));
const SettingsDashboard = lazy(() => import('./Components/SettingsDashboard'));
const Success = lazy(() => import('./pages/Success'));
const AdminDashboard = lazy(() => import('./Components/AdminDashboard'));
const AdminOverviewDashboard = lazy(() => import('./Components/AdminOverviewDashboard'));
const AdminAnalytics = lazy(() => import('./Components/AdminAnalytics'));
const AdminJobManagement = lazy(() => import('./Components/AdminJobManagement'));
const AdminUserManagement = lazy(() => import('./Components/AdminUserManagement'));
const SystemSettings = lazy(() => import('./Components/SystemSettings'));
const AdvancedAnalyticsDashboard = lazy(() => import('./Components/AdvancedAnalyticsDashboard'));
const UserManagementDashboard = lazy(() => import('./Components/UserManagementDashboard'));
const EmailTemplateDesigner = lazy(() => import('./Components/EmailTemplateDesigner'));
const AIResumeScreening = lazy(() => import('./Components/AIResumeScreening'));
const InterviewManagement = lazy(() => import('./Components/InterviewManagement'));
const AuditLogsSystem = lazy(() => import('./Components/AuditLogsSystem'));
const AdvancedReportsDashboard = lazy(() => import('./Components/AdvancedReportsDashboard'));
const ApplicationsTable = lazy(() => import('./Components/ApplicationsTable'));
const AdminPanel = lazy(() => import('./Components/AdminPanel'));
const NotificationsInbox = lazy(() => import('./Components/NotificationsInbox'));

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [themeMode, setThemeMode] = useState(() => getInitialThemeMode());
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveThemeMode(getInitialThemeMode()));
  const showDevTestLogin = process.env.REACT_APP_ENABLE_TEST_LOGIN === 'true';

  useEffect(() => {
    const applied = applyThemeMode(themeMode);
    setResolvedTheme(applied.resolved);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== 'auto') {
      return undefined;
    }

    return subscribeToSystemThemeChanges((nextResolvedTheme) => {
      document.documentElement.setAttribute('data-theme', nextResolvedTheme);
      setResolvedTheme(nextResolvedTheme);
    });
  }, [themeMode]);

  const loadThemePreference = async (type, tokenOverride) => {
    try {
      if (type === 'admin') {
        setThemeMode('light');
        return;
      }

      if (type === 'user') {
        const rawUserSettings = localStorage.getItem('userSettings');
        if (!rawUserSettings) return;

        const userSettings = JSON.parse(rawUserSettings);
        const userThemeMode = userSettings?.preferences?.theme;
        if (userThemeMode) {
          setThemeMode(userThemeMode);
        }
      }
    } catch (_error) {
      if (type === 'admin') {
        setThemeMode('light');
      }
      // fallback to locally stored theme mode
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedUserType = localStorage.getItem('userType');
        const token = await ensureValidSession();
        if (token && storedUserType) {
          if (storedUserType === 'admin') {
            setThemeMode('light');
          }
          connectSocket(token);
          setIsAuthenticated(true);
          setUserType(storedUserType);
          await loadThemePreference(storedUserType, token);
        }
      } catch (_error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
        localStorage.removeItem('adminData');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = useCallback(async ({ showMessage = false } = {}) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post(`${API_URL}/api/auth/logout`, { refreshToken });
      }
    } catch (_error) {
      // local cleanup still proceeds
    } finally {
      disconnectSocket();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userType');
      localStorage.removeItem('adminData');
      setIsAuthenticated(false);
      setUserType(null);
      if (showMessage) {
        toast.error('Session expired. Please log in again.');
      }
    }
  }, []);

  useEffect(() => {
    const teardownInterceptors = setupApiInterceptors();

    return () => {
      teardownInterceptors();
    };
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      handleLogout({ showMessage: true });
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [handleLogout]);

  const handleLogin = (token, type) => {
    if (type === 'admin') {
      setThemeMode('light');
    }
    connectSocket(token);
    setIsAuthenticated(true);
    setUserType(type);
    loadThemePreference(type, token);
  };

  const handleThemeToggle = () => {
    setThemeMode((currentMode) => {
      const next = toggleThemeMode(currentMode, resolvedTheme);
      return next.mode;
    });
  };

  useEffect(() => {
    const handleThemePreferenceChanged = (event) => {
      if (userType === 'admin') {
        setThemeMode('light');
        return;
      }

      const nextMode = event.detail?.mode;
      if (nextMode === 'light' || nextMode === 'dark' || nextMode === 'auto') {
        setThemeMode(nextMode);
      }
    };

    window.addEventListener('themePreferenceChanged', handleThemePreferenceChanged);
    return () => window.removeEventListener('themePreferenceChanged', handleThemePreferenceChanged);
  }, [userType]);

  if (loading) {
    return <LoadingSpinner fullscreen label="Preparing your workspace..." />;
  }

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={3000} />
      
      <AppErrorBoundary>
        {!isAuthenticated ? (
          <>
            <Routes>
              <Route path="/" element={<LoginSelection />} />
              <Route path="/user-login" element={<UserLogin onLogin={handleLogin} />} />
              <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
              <Route path="/register" element={<UserRegister />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            {showDevTestLogin ? <TestLoginHelper onLogin={handleLogin} /> : null}
          </>
        ) : (
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {userType === 'user' ? (
              <Navbar userType={userType} onLogout={handleLogout} dark={resolvedTheme === 'dark'} onToggleTheme={handleThemeToggle} />
            ) : (
              <AdminNavbar onLogout={handleLogout} dark={resolvedTheme === 'dark'} onToggleTheme={handleThemeToggle} />
            )}

            <div style={{ 
              marginLeft: isMobile ? 0 : userType === 'admin' ? '280px' : '240px', 
              width: isMobile ? '100%' : userType === 'admin' ? 'calc(100% - 280px)' : 'calc(100% - 240px)', 
              background: 'var(--page-bg)',
              color: 'var(--text-primary)',
              minHeight: '100vh'
            }}>
              <Suspense fallback={<LoadingSpinner label="Loading view..." />}>
            <Routes>
              {userType === 'user' && (
                <>
                  <Route path="/overview" element={<OverviewDashboard />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/my-applications" element={<MyApplications />} />
                  <Route path="/job-search" element={<JobSearchDashboard />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/notifications" element={<NotificationsInbox title="My Notifications" />} />
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
                  <Route path="/admin/applications-management" element={<ApplicationsTable />} />
                  <Route path="/admin/panel" element={<AdminPanel />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/analytics-dashboard" element={<AdvancedAnalyticsDashboard />} />
                  <Route path="/admin/jobs" element={<AdminJobManagement />} />
                  <Route path="/admin/users" element={<AdminUserManagement />} />
                  <Route path="/admin/user-management" element={<UserManagementDashboard />} />
                  <Route path="/admin/email-templates" element={<EmailTemplateDesigner />} />
                  <Route path="/admin/ai-screening" element={<AIResumeScreening />} />
                  <Route path="/admin/interviews" element={<InterviewManagement />} />
                  <Route path="/admin/notifications" element={<NotificationsInbox title="Admin Notifications" />} />
                  <Route path="/admin/audit-logs" element={<AuditLogsSystem />} />
                  <Route path="/admin/reports" element={<AdvancedReportsDashboard />} />
                  <Route path="/admin/settings" element={<SystemSettings />} />
                  <Route path="*" element={<Navigate to="/admin" />} />
                </>
              )}
            </Routes>
              </Suspense>
            </div>
          </div>
        )}
      </AppErrorBoundary>
    </Router>
  );
}

export default App;
