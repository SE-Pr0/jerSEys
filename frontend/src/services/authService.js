import { apiRequest } from './api';
import {
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '../utils/auth';

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...getStoredUser(),
    ...user,
    id: user.id,
    name: user.name || user.username || '',
    username: user.username || user.name || '',
    email: user.email || '',
    role: user.role || 'customer',
  };
};

export const registerUser = async ({ username, name, email, password }) => {
  const payload = await apiRequest('/auth/register', {
    method: 'POST',
    body: {
      name: name || username,
      email,
      password,
    },
  });

  const user = normalizeUser(payload?.user);
  if (user) {
    setStoredUser(user);
  }

  return user;
};

export const loginUser = async ({ identity, email, password }) => {
  const normalizedEmail = (email || identity || '').trim().toLowerCase();
  const payload = await apiRequest('/auth/login', {
    method: 'POST',
    body: {
      email: normalizedEmail,
      password,
    },
  });

  const user = normalizeUser(payload?.user);

  if (payload?.token) {
    setStoredToken(payload.token);
  }

  if (user) {
    setStoredUser(user);
  }

  return {
    token: payload?.token || '',
    user,
  };
};

export const getCurrentUser = async () => {
  const payload = await apiRequest('/auth/me', {
    token: getStoredToken(),
  });

  const user = normalizeUser(payload?.user);
  if (user) {
    setStoredUser(user);
  }

  return user;
};

export const forgotPassword = async (email) => {
  const payload = await apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });

  return payload?.message || 'Password reset code sent successfully';
};

export const resetPassword = async ({ email, code, newPassword }) => {
  const payload = await apiRequest('/auth/reset-password', {
    method: 'POST',
    body: {
      email,
      code,
      newPassword,
    },
  });

  return payload?.message || 'Password has been reset successfully';
};

export const logoutUser = () => {
  clearStoredUser();
};

