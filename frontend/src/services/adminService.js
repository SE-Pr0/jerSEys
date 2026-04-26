import { apiRequest } from './api';
import { getStoredToken } from '../utils/auth';

const adminRequest = (path, options = {}) =>
  apiRequest(path, {
    ...options,
    token: getStoredToken(),
  });

export const getAdminDashboard = async () => (await adminRequest('/admin/dashboard'))?.data;
export const getAdminUsers = async () => (await adminRequest('/admin/users'))?.data || [];
export const getAdminOrders = async () => (await adminRequest('/admin/orders'))?.data || [];
export const updateAdminOrderStatus = async (orderId, status) =>
  (await adminRequest(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status },
  }))?.data;
export const getAdminTrades = async () => (await adminRequest('/admin/trades'))?.data || [];
export const approveAdminTrade = async (tradeId) =>
  (await adminRequest(`/admin/trades/${tradeId}/approve`, { method: 'PATCH' }))?.data;
export const rejectAdminTrade = async (tradeId) =>
  (await adminRequest(`/admin/trades/${tradeId}/reject`, { method: 'PATCH' }))?.data;
