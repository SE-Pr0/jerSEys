const STORAGE_KEY = 'jerseys-auth-user';
const TOKEN_STORAGE_KEY = 'jerseys-auth-token';

export const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const user = JSON.parse(rawValue);

    if (!user || typeof user !== 'object') {
      return null;
    }

    return {
      ...user,
      username: user.username || user.name || '',
      name: user.name || user.username || '',
      email: user.email || '',
      role: user.role || 'customer',
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const setStoredUser = (user) => {
  if (typeof window === 'undefined') {
    return;
  }

  const currentUser = getStoredUser() || {};
  const normalizedUser = {
    ...currentUser,
    ...user,
    username: user?.username || user?.name || currentUser.username || '',
    name: user?.name || user?.username || currentUser.name || '',
    email: user?.email || currentUser.email || '',
    role: user?.role || currentUser.role || 'customer',
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
  window.dispatchEvent(new Event('jerseys-auth-change'));
};

export const clearStoredUser = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event('jerseys-auth-change'));
};

export const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || '';
};

export const setStoredToken = (token) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  window.dispatchEvent(new Event('jerseys-auth-change'));
};

export const isAdminUser = (user) => {
  const role = typeof user?.role === 'string' ? user.role.trim().toLowerCase() : '';
  return role === 'admin';
};
