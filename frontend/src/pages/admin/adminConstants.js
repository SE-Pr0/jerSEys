export const adminSectionTabs = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/manage-users', label: 'Users' },
  { to: '/admin/manage-orders', label: 'Orders' },
  { to: '/admin/manage-inventory', label: 'Inventory' },
  { to: '/admin/manage-products', label: 'Products' },
  { to: '/admin/sales-reports', label: 'Sales Reports' },
  { to: '/admin/inventory-reports', label: 'Stock Reports' },
];

export const toneBadgeStyles = {
  royal: {
    '--chip-bg': 'rgba(27, 59, 138, 0.08)',
    '--chip-color': 'var(--royal-blue)',
  },
  orange: {
    '--chip-bg': 'rgba(244, 123, 32, 0.08)',
    '--chip-color': 'var(--orange)',
  },
  crimson: {
    '--chip-bg': 'rgba(192, 21, 42, 0.08)',
    '--chip-color': 'var(--crimson)',
  },
  green: {
    '--chip-bg': 'rgba(58, 181, 74, 0.08)',
    '--chip-color': 'var(--green)',
  },
};

export const toneAvatarStyles = {
  royal: {
    background: 'linear-gradient(135deg, #1b3b8a 0%, #4f6fb8 100%)',
  },
  orange: {
    background: 'linear-gradient(135deg, #f47b20 0%, #ff9a4a 100%)',
  },
  crimson: {
    background: 'linear-gradient(135deg, #c0152a 0%, #e05a69 100%)',
  },
  green: {
    background: 'linear-gradient(135deg, #3ab54a 0%, #74cf86 100%)',
  },
};

export const toneBarStyles = {
  royal: {
    background: 'linear-gradient(90deg, var(--royal-blue), rgba(27, 59, 138, 0.35))',
  },
  orange: {
    background: 'linear-gradient(90deg, var(--orange), rgba(244, 123, 32, 0.35))',
  },
  crimson: {
    background: 'linear-gradient(90deg, var(--crimson), rgba(192, 21, 42, 0.35))',
  },
  green: {
    background: 'linear-gradient(90deg, var(--green), rgba(58, 181, 74, 0.35))',
  },
};

export const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

export const buildSearchBlob = (values) =>
  values.flat(Infinity).filter(Boolean).join(' ').toLowerCase();

export const getInitials = (value) => {
  const parts = String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return 'JS';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};
