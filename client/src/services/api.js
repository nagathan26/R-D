import axios from 'axios';

// Safely normalize the base API URL
const rawApiUrl = import.meta.env.VITE_API_URL || '';
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
const baseURL = cleanApiUrl ? `${cleanApiUrl}/api` : '/api';

// Centralized Axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 seconds to allow Render free tier to wake up
});

// Response interceptor for unified error formatting (prevents [object Object])
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected server error occurred';

    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.error === 'string') {
        message = data.error;
      } else if (typeof data.error === 'object' && data.error !== null) {
        message = data.error.message || JSON.stringify(data.error);
      } else if (typeof data.message === 'string') {
        message = data.message;
      } else if (typeof data === 'string') {
        message = data;
      } else {
        message = JSON.stringify(data);
      }
    } else if (error.message) {
      if (error.code === 'ECONNABORTED') {
        message = 'Server took too long to respond. The free server is waking up, please retry in a few seconds.';
      } else {
        message = error.message;
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;