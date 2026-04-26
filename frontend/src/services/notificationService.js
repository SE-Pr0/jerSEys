import { apiRequest } from './api';
import { getStoredToken } from '../utils/auth';

const TOAST_EVENT_NAME = 'jerseys-toast';

export const showToast = ({
  icon = 'Cart',
  message = 'Added to cart!',
  subtext = 'Item ready for checkout',
} = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT_NAME, {
      detail: {
        icon,
        message,
        subtext,
      },
    })
  );
};

export { TOAST_EVENT_NAME };

export const getNotifications = async () => {
  const payload = await apiRequest('/notifications', {
    token: getStoredToken(),
  });

  return Array.isArray(payload?.data) ? payload.data : [];
};

export const markNotificationAsRead = async (notificationId) => {
  const payload = await apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
    token: getStoredToken(),
  });

  return payload?.data;
};

export const markAllNotificationsAsRead = async () => {
  const payload = await apiRequest('/notifications/read-all', {
    method: 'PATCH',
    token: getStoredToken(),
  });

  return payload?.data;
};

export const deleteNotification = async (notificationId) => {
  const payload = await apiRequest(`/notifications/${notificationId}`, {
    method: 'DELETE',
    token: getStoredToken(),
  });

  return payload?.data;
};
