import { apiRequest } from './api';
import { getStoredToken } from '../utils/auth';

export const getTrades = async () => {
  const payload = await apiRequest('/trades');
  return Array.isArray(payload?.data) ? payload.data : [];
};

export const getTradeById = async (tradeId) => {
  const payload = await apiRequest(`/trades/${tradeId}`);
  return payload?.data;
};

export const createTrade = async ({ title, description }) => {
  const payload = await apiRequest('/trades', {
    method: 'POST',
    token: getStoredToken(),
    body: { title, description },
  });

  return payload?.data;
};

export const getMyTradeListings = async () => {
  const payload = await apiRequest('/trades/my-listings', {
    token: getStoredToken(),
  });

  return Array.isArray(payload?.data) ? payload.data : [];
};

export const requestTrade = async (tradeId) => {
  const payload = await apiRequest(`/trades/${tradeId}/request`, {
    method: 'POST',
    token: getStoredToken(),
  });

  return payload?.data;
};

export const getReceivedTradeRequests = async () => {
  const payload = await apiRequest('/trades/requests/received', {
    token: getStoredToken(),
  });

  return Array.isArray(payload?.data) ? payload.data : [];
};

export const getSentTradeRequests = async () => {
  const payload = await apiRequest('/trades/requests/sent', {
    token: getStoredToken(),
  });

  return Array.isArray(payload?.data) ? payload.data : [];
};

export const acceptTradeRequest = async (requestId) => {
  const payload = await apiRequest(`/trades/request/${requestId}/accept`, {
    method: 'PATCH',
    token: getStoredToken(),
  });

  return payload?.data;
};

export const rejectTradeRequest = async (requestId) => {
  const payload = await apiRequest(`/trades/request/${requestId}/reject`, {
    method: 'PATCH',
    token: getStoredToken(),
  });

  return payload?.data;
};

