const STORAGE_KEY = 'jerseys-last-order-confirmation';

const parseJson = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
};

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

export const getOrderConfirmationStorageKey = () => STORAGE_KEY;

export const readOrderConfirmation = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return parseJson(window.sessionStorage.getItem(STORAGE_KEY));
};

export const writeOrderConfirmation = (orderConfirmation) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(orderConfirmation));
};

export const clearOrderConfirmation = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
};

export const detectCardBrand = (cardNumber) => {
  const digits = String(cardNumber || '').replace(/\D/g, '');

  if (digits.startsWith('4')) {
    return 'Visa';
  }

  if (digits.startsWith('5')) {
    return 'Mastercard';
  }

  if (digits.startsWith('34') || digits.startsWith('37')) {
    return 'American Express';
  }

  if (digits.startsWith('6')) {
    return 'Discover';
  }

  return 'Card';
};

export const createOrderConfirmation = ({
  items,
  shippingAddress,
  cardNumber,
  shippingMethod,
  couponCode,
  subtotal,
  discountAmount,
  shippingCost,
  taxCost,
  orderTotal,
}) => {
  const now = new Date();
  const orderNumber = `JSY-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getTime()).slice(-5)}`;
  const orderDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    orderNumber,
    orderDate,
    shippingMethod,
    couponCode,
    paymentMethod: detectCardBrand(cardNumber),
    paymentLast4: String(cardNumber || '').replace(/\D/g, '').slice(-4),
    shippingAddress,
    items: items.map((item) => ({
      cartKey: item.cartKey,
      name: item.name,
      team: item.team,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      image: item.image,
      lineTotal: item.unitPrice * item.quantity,
      badge: item.badge,
      sportLabel: item.sportLabel,
    })),
    totals: {
      subtotal,
      discountAmount,
      shippingCost,
      taxCost,
      orderTotal,
    },
    summaryItems: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: formatCurrency(orderTotal),
    },
  };
};
