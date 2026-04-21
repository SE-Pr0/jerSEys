import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, FormField, PageHeader, PageShell, StateBlock } from '../components/ui';
import { getShopProductById } from '../services/productService';
import './Cart.css';

const CART_STORAGE_KEYS = ['jerseys-cart', 'shopping-cart', 'cartItems', 'cart'];
const PREFERRED_CART_KEY = CART_STORAGE_KEYS[0];
const SHIPPING_FEE = 12.95;
const FREE_SHIPPING_THRESHOLD = 150;
const TAX_RATE = 0.085;
const VALID_COUPON_CODE = 'KAREEM';
const COUPON_DISCOUNT_RATE = 0.5;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatPrice = (value) => currencyFormatter.format(Number.isFinite(value) ? value : 0);

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

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && Array.isArray(value.items)) {
    return value.items;
  }

  if (value && Array.isArray(value.cartItems)) {
    return value.cartItems;
  }

  if (value && Array.isArray(value.lineItems)) {
    return value.lineItems;
  }

  return [];
};

const firstText = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const toColorLabel = (value) => {
  const text = firstText(value);

  if (!text) {
    return '';
  }

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text)) {
    return text.toUpperCase();
  }

  return text;
};

const getDetailPairs = (item, product, quantity) => {
  const details = [];
  const size = firstText(item.size, item.selectedSize, item.jerseySize, item.variantSize, product?.sizes?.[0]);
  const playerName = firstText(
    item.playerName,
    item.textName,
    item.nameOnShirt,
    item.customName,
    item.printName,
    item.customization?.playerName,
    item.design?.textName,
  );
  const customText = firstText(
    item.text,
    item.message,
    item.customText,
    item.customization?.text,
    item.customization?.message,
    item.design?.text,
  );
  const playerNumber = firstText(
    item.playerNumber,
    item.textNumber,
    item.shirtNumber,
    item.customNumber,
    item.customization?.playerNumber,
    item.design?.textNumber,
  );
  const notes = firstText(item.notes, item.note, item.customization?.notes);
  const badgeLogo = item.badgeLogo || item.customization?.badgeLogo ? 'Added' : '';
  const freeLogo = item.freeLogo || item.customization?.freeLogo ? 'Added' : '';
  const baseColor = toColorLabel(item.baseColor || item.customization?.baseColor || item.design?.baseColor);
  const sleeveColor = toColorLabel(item.sleeveColor || item.customization?.sleeveColor || item.design?.sleeveColor);
  const presetColor = toColorLabel(item.presetColor || item.customization?.presetColor || item.design?.presetColor);
  const collarColor = toColorLabel(item.collarColor || item.customization?.collarColor || item.design?.collarColor);
  const printColor = toColorLabel(item.textColor || item.customization?.textColor || item.design?.textColor);

  if (size) {
    details.push({ label: 'Size', value: size });
  }

  details.push({ label: 'Quantity', value: String(quantity) });

  if (playerName) {
    details.push({ label: 'Name', value: playerName });
  }

  if (customText) {
    details.push({ label: 'Text', value: customText });
  }

  if (playerNumber) {
    details.push({ label: 'Number', value: playerNumber });
  }

  if (printColor) {
    details.push({ label: 'Print color', value: printColor });
  }

  if (badgeLogo) {
    details.push({ label: 'Badge logo', value: badgeLogo });
  }

  if (freeLogo) {
    details.push({ label: 'Sponsor logo', value: freeLogo });
  }

  if (baseColor || sleeveColor || presetColor || collarColor) {
    const colors = [
      baseColor ? `Base ${baseColor}` : '',
      sleeveColor ? `Sleeves ${sleeveColor}` : '',
      presetColor ? `Accent ${presetColor}` : '',
      collarColor ? `Collar ${collarColor}` : '',
    ].filter(Boolean);

    details.push({ label: 'Colors', value: colors.join(' / ') });
  }

  if (notes) {
    details.push({ label: 'Notes', value: notes });
  }

  if (item.customization?.summary) {
    details.push({ label: 'Kit build', value: item.customization.summary });
  }

  return details;
};

const normalizeStoredItem = (item, index) => {
  const rawItem = typeof item === 'string' ? { productId: item } : { ...item };
  const rawId = firstText(rawItem.id, rawItem.productId, rawItem.slug, rawItem.cartKey) || `cart-item-${index + 1}`;
  const product = getShopProductById(String(rawId)) || getShopProductById(String(rawItem.productId || ''));
  const quantityValue = Number(rawItem.quantity ?? rawItem.qty ?? rawItem.count ?? 1);
  const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? Math.round(quantityValue) : 1;
  const unitPriceValue = Number(rawItem.price ?? rawItem.unitPrice ?? rawItem.cost ?? product?.price ?? 0);
  const unitPrice = Number.isFinite(unitPriceValue) && unitPriceValue >= 0 ? unitPriceValue : 0;

  return {
    ...rawItem,
    cartKey: rawItem.cartKey || `${rawId}-${index}`,
    productId: rawItem.productId || rawItem.id || product?.id || '',
    quantity,
    unitPrice,
    name: firstText(rawItem.name, rawItem.title, product?.name, 'Custom jersey'),
    team: firstText(rawItem.team, rawItem.club, product?.team, 'Jersey'),
    sportLabel: firstText(rawItem.sportLabel, product?.sportLabel),
    categoryLabel: firstText(rawItem.categoryLabel, product?.categoryLabel),
    season: firstText(rawItem.season, product?.season),
    image: firstText(rawItem.image, rawItem.imageUrl, product?.image),
    badge: firstText(rawItem.badge, product?.badge),
    product,
  };
};

const readCartFromStorage = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  for (const key of CART_STORAGE_KEYS) {
    const parsed = parseJson(window.localStorage.getItem(key));
    const items = asArray(parsed);

    if (items.length > 0) {
      return items.map((item, index) => normalizeStoredItem(item, index));
    }
  }

  return [];
};

const persistCart = (items) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!items.length) {
    CART_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    return;
  }

  CART_STORAGE_KEYS.forEach((key) => {
    if (key !== PREFERRED_CART_KEY) {
      window.localStorage.removeItem(key);
    }
  });

  window.localStorage.setItem(PREFERRED_CART_KEY, JSON.stringify(items));
};

const buildShippingLabel = (subtotal) => {
  if (!subtotal) {
    return formatPrice(0);
  }

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 'Free';
  }

  return formatPrice(SHIPPING_FEE);
};

const Cart = () => {
  const [cartItems, setCartItems] = useState(readCartFromStorage);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  useEffect(() => {
    const syncCart = () => {
      setCartItems(readCartFromStorage());
    };

    window.addEventListener('storage', syncCart);
    window.addEventListener('jerseys-cart-change', syncCart);

    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('jerseys-cart-change', syncCart);
    };
  }, []);

  useEffect(() => {
    persistCart(cartItems);
  }, [cartItems]);

  const normalizedItems = useMemo(
    () => cartItems.map((item, index) => normalizeStoredItem(item, index)),
    [cartItems],
  );

  const subtotal = useMemo(
    () => normalizedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [normalizedItems],
  );

  const isCouponApplied = appliedCoupon === VALID_COUPON_CODE;
  const discountAmount = isCouponApplied ? subtotal * COUPON_DISCOUNT_RATE : 0;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const originalShippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const originalTaxCost = subtotal * TAX_RATE;
  const originalOrderTotal = subtotal + originalShippingCost + originalTaxCost;
  const shippingCost = discountedSubtotal >= FREE_SHIPPING_THRESHOLD || discountedSubtotal === 0 ? 0 : SHIPPING_FEE;
  const taxCost = discountedSubtotal * TAX_RATE;
  const orderTotal = discountedSubtotal + shippingCost + taxCost;

  const updateItemQuantity = (index, nextQuantity) => {
    setCartItems((currentItems) => {
      const nextItems = currentItems.map((item, currentIndex) => {
        if (currentIndex !== index) {
          return item;
        }

        return {
          ...(typeof item === 'string' ? { productId: item } : item),
          quantity: nextQuantity,
        };
      });

      return nextItems.filter((item) => {
        const currentQuantity = Number(item.quantity ?? 1);
        return Number.isFinite(currentQuantity) && currentQuantity > 0;
      });
    });
  };

  const removeItem = (index) => {
    setCartItems((currentItems) => currentItems.filter((_, currentIndex) => currentIndex !== index));
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setPromoMessage('');
    setAppliedCoupon('');
    if (typeof window !== 'undefined') {
      CART_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    }
  };

  const handlePromoSubmit = (event) => {
    event.preventDefault();
    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode) {
      setAppliedCoupon('');
      setPromoMessage('');
      return;
    }

    if (normalizedCode !== VALID_COUPON_CODE) {
      setAppliedCoupon('');
      setPromoMessage('Invalid coupon');
      return;
    }

    setAppliedCoupon(normalizedCode);
    setPromoMessage(`Coupon ${normalizedCode} was successfully applied.`);
  };

  return (
    <PageShell className="cart-page">
      <div className="cart-top-section">
        <PageHeader
          eyebrow="Shopping bag"
          title={(
            <>
              Your <span>Cart</span>
            </>
          )}
          description="Review every jersey, kit customisation, and checkout total before you place the order."
        />
      </div>

      <div className="cart-layout">
        <div className="cart-main-column">
          {normalizedItems.length > 0 ? (
            <div className="cart-item-list">
              {normalizedItems.map((item, index) => {
                const detailPairs = getDetailPairs(item, item.product, item.quantity);
                const lineTotal = item.unitPrice * item.quantity;

                return (
                  <Card key={item.cartKey || `${item.productId || item.name}-${index}`} className="cart-item-card">
                    <div className="cart-item-media">
                      <div className="cart-item-image-shell">
                        {item.image ? <img src={item.image} alt={item.name} className="cart-item-image" /> : null}
                        {item.badge ? <span className={`cart-item-badge is-${item.badge}`}>{item.badge}</span> : null}
                      </div>
                    </div>

                    <div className="cart-item-body">
                      <div className="cart-item-header">
                        <div>
                          <p className="cart-item-kicker">
                            {item.sportLabel || 'Jersey'}
                            {item.team ? ` / ${item.team}` : ''}
                          </p>
                          <h2>{item.name}</h2>
                          {item.categoryLabel || item.season ? (
                            <p className="cart-item-subtitle">
                              {item.categoryLabel}
                              {item.categoryLabel && item.season ? ' / ' : ''}
                              {item.season}
                            </p>
                          ) : null}
                        </div>
                        <div className="cart-item-pricing">
                          <span className="cart-item-unit-price">{formatPrice(item.unitPrice)}</span>
                          <span className="cart-item-line-total">{formatPrice(lineTotal)}</span>
                        </div>
                      </div>

                      {detailPairs.length > 0 ? (
                        <div className="cart-detail-grid">
                          {detailPairs.map((detail) => (
                            <div key={`${item.cartKey}-${detail.label}`} className="cart-detail-pill">
                              <span>{detail.label}</span>
                              <strong>{detail.value}</strong>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="cart-item-footer">
                        <div className="cart-quantity-shell">
                          <span className="cart-quantity-label">Quantity</span>
                          <div className="cart-quantity-stepper" aria-label={`Quantity for ${item.name}`}>
                            <button
                              type="button"
                              className="cart-stepper-button"
                              onClick={() => updateItemQuantity(index, Math.max(item.quantity - 1, 0))}
                              aria-label={`Decrease quantity for ${item.name}`}
                            >
                              -
                            </button>
                            <span className="cart-quantity-value">{item.quantity}</span>
                            <button
                              type="button"
                              className="cart-stepper-button"
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <Button variant="secondary" onClick={() => removeItem(index)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <StateBlock
              icon="0"
              title="Your cart is empty"
              description="Pick a jersey from the shop or build a custom kit and it will show up here with size, text, number, and all the usual checkout details."
              centered
              actions={(
                <>
                  <Button to="/shop">Browse Jerseys</Button>
                  <Button variant="secondary" to="/customize">
                    Customize a Kit
                  </Button>
                </>
              )}
            />
          )}
        </div>

        <aside className="cart-summary-column">
          <Card className="cart-summary-card">
            <div className="cart-summary-heading">
              <h2>Checkout details</h2>
            </div>

            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                {isCouponApplied ? (
                  <strong className="cart-price-stack">
                    <span className="cart-price-old">{formatPrice(subtotal)}</span>
                    <span className="cart-price-new">{formatPrice(discountedSubtotal)}</span>
                  </strong>
                ) : (
                  <strong>{formatPrice(subtotal)}</strong>
                )}
              </div>
              {isCouponApplied ? (
                <div className="cart-summary-row cart-summary-coupon-row">
                  <span>{`Coupon ${appliedCoupon}`}</span>
                  <strong className="cart-coupon-applied">- {formatPrice(discountAmount)}</strong>
                </div>
              ) : null}
              <div className="cart-summary-row">
                <span>Shipping</span>
                <strong>{buildShippingLabel(discountedSubtotal)}</strong>
              </div>
              <div className="cart-summary-row">
                <span>Estimated tax</span>
                <strong>{formatPrice(taxCost)}</strong>
              </div>
              <div className="cart-summary-row is-total">
                <span>Total</span>
                {isCouponApplied ? (
                  <strong className="cart-price-stack">
                    <span className="cart-price-old">{formatPrice(originalOrderTotal)}</span>
                    <span className="cart-price-new">{formatPrice(orderTotal)}</span>
                  </strong>
                ) : (
                  <strong>{formatPrice(orderTotal)}</strong>
                )}
              </div>
            </div>

            <form className="cart-promo-form" onSubmit={handlePromoSubmit}>
              <FormField label="Promo code" htmlFor="cart-promo">
                <div className="cart-promo-row">
                  <input
                    id="cart-promo"
                    className="ui-input"
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                    placeholder="Enter code"
                  />
                  <Button type="submit" variant="secondary">
                    Apply
                  </Button>
                </div>
              </FormField>
              {promoMessage ? (
                <p
                  className={`cart-promo-message${promoMessage === 'Invalid coupon' ? ' is-error' : ' is-success'}`}
                >
                  {promoMessage}
                </p>
              ) : null}
            </form>

            <div className="cart-summary-actions">
              <Button block disabled={normalizedItems.length === 0}>
                Secure Checkout
              </Button>
              <Button block variant="secondary" to="/shop">
                Continue Shopping
              </Button>
              <Button block variant="ghost" onClick={clearCart} disabled={normalizedItems.length === 0}>
                Clear Cart
              </Button>
            </div>
          </Card>

        </aside>
      </div>
    </PageShell>
  );
};

export default Cart;
