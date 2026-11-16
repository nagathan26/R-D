// client/src/services/dashboardService.js
import api from './api';

export const getDashboardSummary = async () => {
  return await api.get('/v1/dashboard/summary');
};

export const getCompanyProfile = async () => {
  return await api.get('/v1/dashboard/company');
};

export const updateCompanyProfile = async (data) => {
  return await api.put('/v1/dashboard/company', data);
};

export const getAssessmentsHistory = async () => {
  return await api.get('/v1/dashboard/assessments');
};

export const getEngagementsHistory = async () => {
  return await api.get('/v1/dashboard/engagements');
};

export const getDocumentsHistory = async () => {
  return await api.get('/v1/dashboard/documents');
};

export const getNotifications = async () => {
  return await api.get('/v1/dashboard/notifications');
};

export const markNotificationRead = async (id = 'all') => {
  return await api.put(`/v1/dashboard/notifications/${id}/read`);
};

export const getSupportTickets = async () => {
  return await api.get('/v1/dashboard/support');
};

export const createSupportTicket = async (ticketData) => {
  return await api.post('/v1/dashboard/support', ticketData);
};
