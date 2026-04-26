import { apiRequest } from './api';
import { getStoredToken } from '../utils/auth';

const CART_STORAGE_KEY = 'jerseys-cart';
const CART_EVENT_NAME = 'jerseys-cart-change';

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

const persistLocalCart = (items) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (items.length > 0) {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } else {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(CART_EVENT_NAME));
};

const mergeLocalProductItem = (items, nextItem) => {
  const nextItems = [...items];
  const existingIndex = nextItems.findIndex(
    (item) => item.cartSource === 'api' && Number(item.productId) === Number(nextItem.productId),
  );

  if (existingIndex >= 0) {
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      ...nextItem,
    };
    return nextItems;
  }

  nextItems.push(nextItem);
  return nextItems;
};

export const readLocalCartItems = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const parsed = parseJson(window.localStorage.getItem(CART_STORAGE_KEY));
  return Array.isArray(parsed) ? parsed : [];
};

export const writeLocalCartItems = (items) => {
  persistLocalCart(Array.isArray(items) ? items : []);
};

export const getCartChangeEventName = () => CART_EVENT_NAME;

export const getCart = async () => {
  const payload = await apiRequest('/cart', {
    token: getStoredToken(),
  });

  return Array.isArray(payload?.data) ? payload.data : [];
};

export const addCartItem = async ({
  productId,
  quantity = 1,
  product,
  selectedSize = '',
  playerName = '',
  playerNumber = '',
}) => {
  const payload = await apiRequest('/cart', {
    method: 'POST',
    token: getStoredToken(),
    body: {
      product_id: productId,
      quantity,
    },
  });

  const localItems = readLocalCartItems();
  const nextLocalItems = mergeLocalProductItem(localItems, {
    cartSource: 'api',
    itemId: payload?.data?.id,
    id: String(product?.id || productId),
    productId: Number(product?.backendId || productId),
    name: product?.name || payload?.data?.name || 'Jersey',
    title: product?.name || payload?.data?.name || 'Jersey',
    team: product?.team || '',
    sportLabel: product?.sportLabel || '',
    categoryLabel: product?.categoryLabel || '',
    season: product?.season || '',
    image: product?.image || payload?.data?.image_url || '',
    badge: product?.badge || '',
    price: Number(product?.price || payload?.data?.price || 0),
    unitPrice: Number(product?.price || payload?.data?.price || 0),
    quantity: Number(payload?.data?.quantity || quantity),
    size: selectedSize,
    selectedSize,
    playerName,
    playerNumber,
  });
  persistLocalCart(nextLocalItems);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_EVENT_NAME));
  }

  return payload?.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const payload = await apiRequest(`/cart/${itemId}`, {
    method: 'PUT',
    token: getStoredToken(),
    body: { quantity },
  });

  const nextLocalItems = readLocalCartItems().map((item) =>
    Number(item.itemId) === Number(itemId)
      ? { ...item, quantity }
      : item,
  );
  persistLocalCart(nextLocalItems);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_EVENT_NAME));
  }

  return payload?.data;
};

export const removeCartItem = async (itemId) => {
  const payload = await apiRequest(`/cart/${itemId}`, {
    method: 'DELETE',
    token: getStoredToken(),
  });

  const nextLocalItems = readLocalCartItems().filter((item) => Number(item.itemId) !== Number(itemId));
  persistLocalCart(nextLocalItems);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_EVENT_NAME));
  }

  return payload?.data;
};

export const clearRemoteCart = async () => {
  const payload = await apiRequest('/cart', {
    method: 'DELETE',
    token: getStoredToken(),
  });

  const nextLocalItems = readLocalCartItems().filter((item) => item.cartSource !== 'api');
  persistLocalCart(nextLocalItems);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_EVENT_NAME));
  }

  return payload?.data;
};
