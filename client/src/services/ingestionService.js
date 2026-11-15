import api from './api';

export const getIncentiveChecklist = async (engagementId) => {
  return await api.get(`/v1/india/ingestion/checklist/${engagementId}`);
};

export const uploadAndValidateDocIndia = async (docPayload) => {
  return await api.post('/v1/india/ingestion/upload', docPayload);
};

export const reviewExtractedDocument = async (recordId, updatePayload) => {
  return await api.put(`/v1/india/ingestion/records/${recordId}/review`, updatePayload);
};

export const getEngagementRecords = async (engagementId) => {
  return await api.get(`/v1/india/ingestion/records/${engagementId}`);
};
