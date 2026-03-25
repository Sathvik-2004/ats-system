import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AUTH_PATHS = [
  '/api/auth/admin-login',
  '/api/auth/user-login',
  '/api/auth/register',
  '/api/auth/refresh'
];

export const SESSION_EXPIRED_EVENT = 'ats:session-expired';

const isAuthRequest = (url = '') => AUTH_PATHS.some((path) => url.includes(path));

let refreshPromise = null;
let sessionExpiryNotified = false;

const notifySessionExpired = () => {
  if (sessionExpiryNotified) {
    return;
  }

  sessionExpiryNotified = true;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));

  setTimeout(() => {
    sessionExpiryNotified = false;
  }, 1500);
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/auth/refresh`,
      { refreshToken },
      { skipAuthRefresh: true, skipGlobalErrorToast: true }
    );
    const payload = response.data?.data || response.data;

    if (!response.data?.success || !payload?.token) {
      throw new Error('Token refresh failed');
    }

    localStorage.setItem('token', payload.token);
    if (payload.refreshToken) {
      localStorage.setItem('refreshToken', payload.refreshToken);
    }

    return payload.token;
  } catch (error) {
    throw error;
  }
};

export const setupApiInterceptors = () => {
  const requestId = axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && !config.headers?.Authorization) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return config;
  });

  const responseId = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const statusCode = error?.response?.status;
      const requestUrl = error?.config?.url || '';
      const originalRequest = error?.config || {};

      if (
        statusCode === 401 &&
        !originalRequest._retry &&
        !originalRequest.skipAuthRefresh &&
        !isAuthRequest(requestUrl)
      ) {
        try {
          originalRequest._retry = true;

          if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
              refreshPromise = null;
            });
          }

          const nextToken = await refreshPromise;
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${nextToken}`
          };

          return axios(originalRequest);
        } catch (_refreshError) {
          notifySessionExpired();
        }
      }

      if (
        statusCode === 401 &&
        !originalRequest.skipAuthRefresh &&
        !isAuthRequest(requestUrl)
      ) {
        notifySessionExpired();
      }

      if (
        !error?.response &&
        !error?.config?.skipGlobalErrorToast &&
        !isAuthRequest(requestUrl)
      ) {
        toast.error('Network error. Please check your connection and try again.');
      }

      return Promise.reject(error);
    }
  );

  return () => {
    axios.interceptors.request.eject(requestId);
    axios.interceptors.response.eject(responseId);
  };
};
