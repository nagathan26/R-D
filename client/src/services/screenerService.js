import api from './api';

export const screenEligibilityIndia = async (formData) => {
  return await api.post('/v1/india/eligibility/screen', formData);
};

export const getCompanyContext = async (id) => {
  return await api.get(`/v1/india/company/${id}`);
};
