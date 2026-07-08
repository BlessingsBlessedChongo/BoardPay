import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'http://127.0.0.1:8000/api',
  timeout: 30000,
});

/**
 * Request interceptor: Safely attach JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage?.getItem?.('access_token');
      if (token && typeof token === 'string') {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('[axios] Error reading token:', err);
    }
    return config;
  },
  (error) => {
    console.error('[axios] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors gracefully
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn('[axios] Unauthorized - clearing tokens');
      try {
        localStorage?.removeItem?.('access_token');
        localStorage?.removeItem?.('refresh_token');
      } catch (err) {
        console.error('[axios] Error clearing tokens:', err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
