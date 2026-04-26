import { apiRequest } from './api';
import { getStoredToken } from '../utils/auth';

export const createOrder = async () => {
  const payload = await apiRequest('/orders', {
    method: 'POST',
    token: getStoredToken(),
  });

  return payload?.data;
};

export const getOrders = async () => {
  const payload = await apiRequest('/orders', {
    token: getStoredToken(),
  });

  return Array.isArray(payload?.data) ? payload.data : [];
};

export const getOrderById = async (orderId) => {
  const payload = await apiRequest(`/orders/${orderId}`, {
    token: getStoredToken(),
  });

  return payload?.data;
};

export const cancelOrder = async (orderId) => {
  const payload = await apiRequest(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
    token: getStoredToken(),
  });

  return payload?.data;
};

