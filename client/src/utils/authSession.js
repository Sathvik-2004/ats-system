import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const decodeJwtPayload = (token) => {
  try {
    const payloadBase64 = token.split('.')[1];
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(normalized));
    return payload;
  } catch (_error) {
    return null;
  }
};

export const isTokenExpired = (token, bufferSeconds = 30) => {
  if (!token || token === 'undefined' || token === 'null') return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + bufferSeconds;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
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

export const ensureValidSession = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (!isTokenExpired(token)) {
    return token;
  }

  return refreshAccessToken();
};
