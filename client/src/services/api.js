import axios from 'axios';

// Centralized Axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected server error occurred';
    return Promise.reject(new Error(customError));
  }
);

export default api;

