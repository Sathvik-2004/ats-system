// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  USER_LOGIN: `${API_BASE_URL}/api/auth/user-login`,
  ADMIN_LOGIN: `${API_BASE_URL}/api/auth/admin-login`,
  USER_REGISTER: `${API_BASE_URL}/api/auth/user-register`,
  
  // Application endpoints
  APPLICATIONS: `${API_BASE_URL}/api/applications`,
  APPLICANTS: `${API_BASE_URL}/api/applicants`,
  APPLY: `${API_BASE_URL}/api/applicants/apply`,
  
  // Job endpoints
  JOBS: `${API_BASE_URL}/api/jobs`,
  
  // Admin endpoints
  ADMIN_APPLICATIONS: `${API_BASE_URL}/api/admin/applications`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
  
  // Base URL for dynamic endpoints
  BASE_URL: API_BASE_URL
};

export default API_ENDPOINTS;