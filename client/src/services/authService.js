// client/src/services/authService.js
import api from './api';

export const registerCustomer = async (formData) => {
  return await api.post('/v1/auth/register', formData);
};

export const loginCustomer = async (credentials) => {
  return await api.post('/v1/auth/login', credentials);
};

export const getCurrentUser = async () => {
  return await api.get('/v1/auth/me');
};

export const logoutCustomer = async () => {
  try {
    await api.post('/v1/auth/logout');
  } catch (err) {
    // Ignore error on logout endpoint
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const requestPasswordReset = async (email) => {
  return await api.post('/v1/auth/forgot-password', { email });
};

export const resetPasswordWithToken = async (token, newPassword) => {
  return await api.post('/v1/auth/reset-password', { token, newPassword });
};
