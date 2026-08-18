import axios from 'axios';

let rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').trim();
if (!rawBase.endsWith('/api/v1') && !rawBase.endsWith('/api/v1/')) {
  rawBase = rawBase.replace(/\/+$/, '') + '/api/v1';
}
const API_BASE_URL = rawBase;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('retailpulse_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401
      localStorage.removeItem('retailpulse_token');
      localStorage.removeItem('retailpulse_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
