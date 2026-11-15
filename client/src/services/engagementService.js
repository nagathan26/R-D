import api from './api';

export const prepareEngagement = async (payload) => {
  return await api.post('/v1/india/engagements/prepare', payload);
};

export const sendSigningOtp = async (engagementId, payload) => {
  return await api.post(`/v1/india/engagements/${engagementId}/send-otp`, payload);
};

export const verifyAndSignAgreement = async (engagementId, payload) => {
  return await api.post(`/v1/india/engagements/${engagementId}/verify-and-sign`, payload);
};

export const signEngagementIndia = async (engagementId, signData) => {
  return await api.post(`/v1/india/engagements/${engagementId}/sign`, signData);
};
