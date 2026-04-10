const STORAGE_KEY = 'jerseys-auth-user';

export const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const setStoredUser = (user) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('jerseys-auth-change'));
};

export const clearStoredUser = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('jerseys-auth-change'));
};
