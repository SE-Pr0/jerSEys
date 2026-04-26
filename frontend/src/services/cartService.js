import { apiRequest } from './api';
import { getStoredToken } from '../utils/auth';
import { getShopProductById } from './productService';

const LOCAL_CART_STORAGE_KEY = 'jerseys-local-cart';
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

const firstText = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const dispatchCartChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_EVENT_NAME));
  }
};

const getProductMetadata = (productId) => {
  if (!productId) {
    return null;
  }

  return getShopProductById(String(productId)) || null;
};

const normalizeApiCartItem = (item) => {
  const product = getProductMetadata(item?.product_id);
  const unitPrice = Number(item?.price ?? product?.price ?? 0);
  const quantityValue = Number(item?.quantity ?? 1);
  const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? Math.round(quantityValue) : 1;

  return {
    cartSource: 'api',
    cartKey: `api-${item?.id}`,
    itemId: Number(item?.id),
    id: String(item?.product_id ?? ''),
    productId: Number(item?.product_id),
    name: item?.name || product?.name || 'Jersey',
    title: item?.name || product?.name || 'Jersey',
    team: product?.team || '',
    sportLabel: product?.sportLabel || '',
    categoryLabel: product?.categoryLabel || '',
    season: product?.season || '',
    image: item?.image_url || product?.image || '',
    badge: product?.badge || '',
    price: unitPrice,
    unitPrice,
    quantity,
    stock: Number(item?.stock ?? product?.stock ?? 0),
    size: '',
    selectedSize: '',
    product,
  };
};

const normalizeLocalCartItem = (item, index) => {
  const rawItem = typeof item === 'string' ? { productId: item } : { ...item };
  const rawId = firstText(rawItem.id, rawItem.productId, rawItem.slug, rawItem.cartKey) || `local-cart-item-${index + 1}`;
  const product = getProductMetadata(rawItem.productId || rawItem.id || rawId);
  const quantityValue = Number(rawItem.quantity ?? rawItem.qty ?? rawItem.count ?? 1);
  const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? Math.round(quantityValue) : 1;
  const unitPriceValue = Number(rawItem.price ?? rawItem.unitPrice ?? rawItem.cost ?? product?.price ?? 0);
  const unitPrice = Number.isFinite(unitPriceValue) && unitPriceValue >= 0 ? unitPriceValue : 0;

  return {
    ...rawItem,
    cartSource: 'local',
    cartKey: rawItem.cartKey || `${rawId}-${index}`,
    itemId: rawItem.itemId || null,
    id: String(rawItem.id || rawItem.productId || product?.id || rawId),
    productId: rawItem.productId || rawItem.id || product?.id || '',
    quantity,
    price: unitPrice,
    unitPrice,
    name: firstText(rawItem.name, rawItem.title, product?.name, 'Custom jersey'),
    title: firstText(rawItem.title, rawItem.name, product?.name, 'Custom jersey'),
    team: firstText(rawItem.team, rawItem.club, product?.team, 'Jersey'),
    sportLabel: firstText(rawItem.sportLabel, product?.sportLabel),
    categoryLabel: firstText(rawItem.categoryLabel, product?.categoryLabel),
    season: firstText(rawItem.season, product?.season),
    image: firstText(rawItem.image, rawItem.imageUrl, product?.image),
    badge: firstText(rawItem.badge, product?.badge),
    size: firstText(rawItem.size, rawItem.selectedSize, rawItem.jerseySize, rawItem.variantSize, product?.sizes?.[0]),
    product,
  };
};

const persistLocalCart = (items) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (Array.isArray(items) && items.length > 0) {
    window.localStorage.setItem(LOCAL_CART_STORAGE_KEY, JSON.stringify(items));
  } else {
    window.localStorage.removeItem(LOCAL_CART_STORAGE_KEY);
  }

  dispatchCartChange();
};

export const readLocalCartItems = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const parsed = parseJson(window.localStorage.getItem(LOCAL_CART_STORAGE_KEY));
  return Array.isArray(parsed) ? parsed.map(normalizeLocalCartItem) : [];
};

export const writeLocalCartItems = (items) => {
  persistLocalCart(Array.isArray(items) ? items : []);
};

export const clearLocalCartItems = () => {
  persistLocalCart([]);
};

export const getCartChangeEventName = () => CART_EVENT_NAME;

export const getCart = async () => {
  const token = getStoredToken();

  if (!token) {
    return [];
  }

  const payload = await apiRequest('/cart', { token });
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map(normalizeApiCartItem);
};

export const getCombinedCart = async () => {
  const [apiItems, localItems] = await Promise.all([
    getCart().catch(() => []),
    Promise.resolve(readLocalCartItems()),
  ]);

  return [...apiItems, ...localItems];
};

export const addCartItem = async ({
  productId,
  quantity = 1,
}) => {
  const payload = await apiRequest('/cart', {
    method: 'POST',
    token: getStoredToken(),
    body: {
      product_id: productId,
      quantity,
    },
  });

  dispatchCartChange();
  return normalizeApiCartItem(payload?.data || {});
};

export const updateCartItem = async (itemId, quantity) => {
  const payload = await apiRequest(`/cart/${itemId}`, {
    method: 'PUT',
    token: getStoredToken(),
    body: { quantity },
  });

  dispatchCartChange();
  return normalizeApiCartItem(payload?.data || {});
};

export const removeCartItem = async (itemId) => {
  const payload = await apiRequest(`/cart/${itemId}`, {
    method: 'DELETE',
    token: getStoredToken(),
  });

  dispatchCartChange();
  return payload?.data;
};

export const clearRemoteCart = async () => {
  const token = getStoredToken();

  if (!token) {
    return { deletedCount: 0 };
  }

  const payload = await apiRequest('/cart', {
    method: 'DELETE',
    token,
  });

  dispatchCartChange();
  return payload?.data;
};

export const clearCart = async () => {
  await Promise.allSettled([
    clearRemoteCart(),
    Promise.resolve(clearLocalCartItems()),
  ]);

  dispatchCartChange();
};
