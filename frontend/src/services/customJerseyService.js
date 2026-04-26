import { apiRequest } from './api';
import { getStoredToken } from '../utils/auth';

export const createCustomJersey = async (body) => {
  const payload = await apiRequest('/custom-jerseys', {
    method: 'POST',
    token: getStoredToken(),
    body,
  });

  return payload?.data;
};

export const getCustomJerseys = async () => {
  const payload = await apiRequest('/custom-jerseys', {
    token: getStoredToken(),
  });

  return Array.isArray(payload?.data) ? payload.data : [];
};

export const getCustomJerseyById = async (customJerseyId) => {
  const payload = await apiRequest(`/custom-jerseys/${customJerseyId}`, {
    token: getStoredToken(),
  });

  return payload?.data;
};

export const updateCustomJersey = async (customJerseyId, body) => {
  const payload = await apiRequest(`/custom-jerseys/${customJerseyId}`, {
    method: 'PUT',
    token: getStoredToken(),
    body,
  });

  return payload?.data;
};

export const deleteCustomJersey = async (customJerseyId) => {
  const payload = await apiRequest(`/custom-jerseys/${customJerseyId}`, {
    method: 'DELETE',
    token: getStoredToken(),
  });

  return payload?.data;
};

