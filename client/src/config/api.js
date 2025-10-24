// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Auth endpoints
    ADMIN_LOGIN: `${API_BASE_URL}/api/auth/admin-login`,
    USER_LOGIN: `${API_BASE_URL}/api/auth/user-login`,
    USER_REGISTER: `${API_BASE_URL}/api/auth/user-register`,
    
    // Admin endpoints
    ADMIN_APPLICATIONS: `${API_BASE_URL}/api/admin/applications`,
    ADMIN_ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
    ADMIN_JOBS: `${API_BASE_URL}/api/admin/jobs`,
    ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
    ADMIN_SETTINGS: `${API_BASE_URL}/api/admin/settings`,
    ADMIN_AUTO_PROCESS: `${API_BASE_URL}/api/admin/auto-process`,
    
    // Job endpoints
    JOBS: `${API_BASE_URL}/api/jobs`,
    
    // Application endpoints
    APPLICATIONS: `${API_BASE_URL}/api/applications`,
    APPLICANTS: `${API_BASE_URL}/api/applicants`,
  // User-specific endpoints
  USER_APPLICATIONS: `${API_BASE_URL}/api/auth/my-applications`,
  USER_APPLICATION_STATS: `${API_BASE_URL}/api/auth/application-stats`,
    
    // Upload endpoints
    UPLOADS: `${API_BASE_URL}/uploads`,
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get upload URL
export const getUploadUrl = (filename) => {
  return `${API_BASE_URL}/uploads/${filename}`;
};

export default API_CONFIG;