import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, FormField, StateBlock } from '../components/ui';
import { clearCart as clearAllCart, getCombinedCart, readLocalCartItems, removeCartItem, updateCartItem, writeLocalCartItems } from '../services/cartService';
import './Cart.css';

const SHIPPING_FEE = 12.95;
const FREE_SHIPPING_THRESHOLD = 150;
const TAX_RATE = 0.085;
const VALID_COUPON_CODE = 'KAREEM';
const COUPON_DISCOUNT_RATE = 0.5;
const COUPON_STORAGE_KEY = 'jerseys-applied-coupon';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatPrice = (value) => currencyFormatter.format(Number.isFinite(value) ? value : 0);

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

const getDetailPairs = (item, product) => {
  const details = {
    size: '',
    name: '',
    number: '',
  };
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
    details.size = size;
  }

  if (playerName) {
    details.name = playerName;
  }

  if (playerNumber) {
    details.number = playerNumber;
  }

  return details;
};

const getCustomizationVisuals = (item) => ({
  logo: firstText(item.badgeLogo, item.customization?.badgeLogo),
  sponsor: firstText(item.freeLogo, item.customization?.freeLogo),
  patternName: firstText(item.presetName, item.customization?.presetName, item.categoryLabel),
  patternImage: firstText(item.presetImage, item.customization?.presetImage),
});

const isTradeMarketplaceLineItem = (item) =>
  firstText(item.itemType).toLowerCase() === 'trade-listing'
  || firstText(item.sportLabel).toLowerCase() === 'trade marketplace';

const readStoredCoupon = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const storedCoupon = window.localStorage.getItem(COUPON_STORAGE_KEY);
  return typeof storedCoupon === 'string' ? storedCoupon.trim().toUpperCase() : '';
};

const writeStoredCoupon = (couponCode) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedCode = String(couponCode || '').trim().toUpperCase();

  if (normalizedCode) {
    window.localStorage.setItem(COUPON_STORAGE_KEY, normalizedCode);
  } else {
    window.localStorage.removeItem(COUPON_STORAGE_KEY);
  }

  window.dispatchEvent(new Event('jerseys-coupon-change'));
};

const hydrateCustomKitEditor = (item) => {
  if (typeof window === 'undefined') {
    return;
  }

  const selectedPresetId = firstText(item.presetId, item.customization?.presetId);
  const selectedPresetName = firstText(item.presetName, item.customization?.presetName);

  if (item.baseColor || item.sleeveColor || item.presetColor || item.collarColor) {
    window.localStorage.setItem(
      'front-kit-layer-colors-v3',
      JSON.stringify({
        base: item.baseColor || '#0f172a',
        sleeve: item.sleeveColor || '#ffffff',
        preset: item.presetColor || '#ffffff',
        collar: item.collarColor || '#ffffff',
      }),
    );
  }

  if (selectedPresetId) {
    window.localStorage.setItem('front-kit-preset', selectedPresetId);
  }

  if (selectedPresetName) {
    window.localStorage.setItem('front-kit-preset-name', selectedPresetName);
  }

  if (item.badgeLogo) {
    window.localStorage.setItem('front-kit-badge-logo', item.badgeLogo);
  }

  if (item.freeLogo) {
    window.localStorage.setItem('front-kit-free-logo', item.freeLogo);
  }

  if (item.freeLogoPosition) {
    window.localStorage.setItem(
      'front-kit-free-logo-position',
      JSON.stringify({
        left: `${item.freeLogoPosition.left}%`,
        top: `${item.freeLogoPosition.top}%`,
        width: `${item.freeLogoPosition.width}%`,
      }),
    );
  }

  window.localStorage.setItem(
    'front-kit-text',
    JSON.stringify({
      name: item.playerName || item.textName || '',
      number: item.playerNumber || item.textNumber || '',
      color: item.textColor || '#ffffff',
      strokeColor: item.textStrokeColor || '#000000',
      strokeWidth: Number.isFinite(Number(item.textStrokeWidth)) ? Number(item.textStrokeWidth) : 2,
    }),
  );
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
  const location = useLocation();
  const navigate = useNavigate();
  const closeTimerRef = useRef(null);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [promoCode, setPromoCode] = useState(readStoredCoupon);
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(readStoredCoupon);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const loadCart = useCallback(async () => {
    setLoadError('');

    try {
      const items = await getCombinedCart();
      setCartItems(items);
    } catch (error) {
      setLoadError(error.message || 'Failed to load cart.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    const syncCart = () => {
      loadCart();
    };
    const syncCoupon = () => {
      const storedCoupon = readStoredCoupon();
      setPromoCode(storedCoupon);
      setAppliedCoupon(storedCoupon);
    };

    window.addEventListener('storage', syncCart);
    window.addEventListener('jerseys-cart-change', syncCart);
    window.addEventListener('storage', syncCoupon);
    window.addEventListener('jerseys-coupon-change', syncCoupon);

    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('jerseys-cart-change', syncCart);
      window.removeEventListener('storage', syncCoupon);
      window.removeEventListener('jerseys-coupon-change', syncCoupon);
    };
  }, [loadCart]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => setIsOpen(true));
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = previousOverflow;
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const normalizedItems = useMemo(() => cartItems, [cartItems]);

  const subtotal = useMemo(
    () => normalizedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [normalizedItems],
  );

  const itemCount = useMemo(
    () => normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
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

  const updateItemQuantity = async (index, nextQuantity) => {
    const selectedItem = cartItems[index];

    if (isTradeMarketplaceLineItem(selectedItem)) {
      return;
    }

    if (selectedItem?.cartSource === 'api' && selectedItem.itemId) {
      if (nextQuantity <= 0) {
        await removeCartItem(selectedItem.itemId);
      } else {
        await updateCartItem(selectedItem.itemId, nextQuantity);
      }

      await loadCart();
      return;
    }

    const nextLocalItems = readLocalCartItems()
      .map((item) => (
        item.cartKey === selectedItem.cartKey
          ? { ...item, quantity: nextQuantity }
          : item
      ))
      .filter((item) => {
        const currentQuantity = Number(item.quantity ?? 1);
        return Number.isFinite(currentQuantity) && currentQuantity > 0;
      });

    writeLocalCartItems(nextLocalItems);
    await loadCart();
  };

  const removeItem = async (index) => {
    const selectedItem = cartItems[index];

    if (selectedItem?.cartSource === 'api' && selectedItem.itemId) {
      await removeCartItem(selectedItem.itemId);
      await loadCart();
      return;
    }

    const nextLocalItems = readLocalCartItems().filter((item) => item.cartKey !== selectedItem.cartKey);
    writeLocalCartItems(nextLocalItems);
    await loadCart();
  };

  const editCustomKit = (item) => {
    hydrateCustomKitEditor(item);
    navigate('/customize');
  };

  const clearCart = async () => {
    try {
      await clearAllCart();
      setCartItems([]);
      setPromoCode('');
      setPromoMessage('');
      setAppliedCoupon('');
      writeStoredCoupon('');
    } catch (error) {
      setLoadError(error.message || 'Failed to clear cart.');
    }
  };

  const handlePromoSubmit = (event) => {
    event.preventDefault();
    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode) {
      setAppliedCoupon('');
      setPromoMessage('');
      writeStoredCoupon('');
      return;
    }

    if (normalizedCode !== VALID_COUPON_CODE) {
      setAppliedCoupon('');
      setPromoMessage('Invalid coupon');
      writeStoredCoupon('');
      return;
    }

    setAppliedCoupon(normalizedCode);
    setPromoCode(normalizedCode);
    setPromoMessage(`Coupon ${normalizedCode} was successfully applied.`);
    writeStoredCoupon(normalizedCode);
  };

  const closeCart = () => {
    if (isClosing) {
      return;
    }

    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      if (location.state?.backgroundLocation) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }, 220);
  };

  return (
    <div
      className={`cart-drawer-overlay${isOpen ? ' is-open' : ''}${isClosing ? ' is-closing' : ''}`}
      role="presentation"
      onClick={closeCart}
    >
      <aside
        className={`cart-drawer${isOpen ? ' is-open' : ''}${isClosing ? ' is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-drawer-shell">
          <header className="cart-drawer-header">
            <button type="button" className="cart-drawer-close" onClick={closeCart} aria-label="Close cart">
              ×
            </button>
            <div className="cart-drawer-title-block">
              <p className="cart-drawer-eyebrow">Shopping bag</p>
              <h1 className="cart-drawer-title">
                Your <span>Cart</span>
              </h1>
            </div>
            <div className="cart-drawer-count">{itemCount} item(s)</div>
          </header>

          <div className="cart-drawer-content">
            <div className="cart-main-column">
              {isLoading ? (
                <StateBlock icon="..." title="Loading cart" description="Fetching the latest cart items from the backend." centered />
              ) : loadError ? (
                <StateBlock icon="!" title="Unable to load cart" description={loadError} centered />
              ) : normalizedItems.length > 0 ? (
                <div className="cart-item-list">
                  {normalizedItems.map((item, index) => {
                    const detailPairs = getDetailPairs(item, item.product);
                    const customVisuals = getCustomizationVisuals(item);
                    const lineTotal = item.unitPrice * item.quantity;
                    const isCustomKit = firstText(item.itemType, item.productId).startsWith('custom-kit');
                    const isTradeMarketplaceItem = isTradeMarketplaceLineItem(item);

                    return (
                      <Card
                        key={item.cartKey || `${item.productId || item.name}-${index}`}
                        className={`cart-item-card${isCustomKit ? ' is-custom-kit' : ''}`}
                        padded={false}
                      >
                        <div className="cart-item-media">
                          <div className="cart-item-image-shell">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="cart-item-image"
                                style={item.imageFocus ? { objectPosition: item.imageFocus } : undefined}
                              />
                            ) : null}
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

                          <div className="cart-detail-stack">
                            <div className="cart-custom-top-row">
                              {detailPairs.size ? (
                                <div className="cart-detail-pill cart-detail-pill-size">
                                  <span>Size</span>
                                  <strong>{detailPairs.size}</strong>
                                </div>
                              ) : null}

                              {isCustomKit ? (
                                <div className="cart-detail-pill cart-detail-pill-pattern">
                                  <span>Pattern</span>
                                  {customVisuals.patternName ? <strong>{customVisuals.patternName}</strong> : null}
                                </div>
                              ) : null}
                            </div>

                            <div className="cart-detail-grid">
                              {detailPairs.name ? (
                                <div className="cart-detail-pill">
                                  <span>Name</span>
                                  <strong>{detailPairs.name}</strong>
                                </div>
                              ) : null}

                              {detailPairs.number ? (
                                <div className="cart-detail-pill">
                                  <span>Number</span>
                                  <strong>{detailPairs.number}</strong>
                                </div>
                              ) : null}
                            </div>

                            {isCustomKit ? (
                              <div className="cart-custom-visuals">
                                {customVisuals.logo ? (
                                  <div className="cart-custom-visual cart-custom-visual-badge">
                                    <span>Logo</span>
                                    <img src={customVisuals.logo} alt="Badge logo preview" />
                                  </div>
                                ) : null}

                                {customVisuals.sponsor ? (
                                  <div className="cart-custom-visual cart-custom-visual-sponsor">
                                    <span>Sponsor</span>
                                    <img src={customVisuals.sponsor} alt="Sponsor logo preview" />
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          <div className="cart-item-footer">
                            <div className="cart-quantity-shell">
                              <div className="cart-quantity-stepper" aria-label={`Quantity for ${item.name}`}>
                                {isTradeMarketplaceItem ? null : (
                                  <button
                                    type="button"
                                    className="cart-stepper-button"
                                    onClick={() => updateItemQuantity(index, Math.max(item.quantity - 1, 0))}
                                    aria-label={`Decrease quantity for ${item.name}`}
                                  >
                                    -
                                  </button>
                                )}
                                <span className="cart-quantity-value">{item.quantity}</span>
                                {isTradeMarketplaceItem ? null : (
                                  <button
                                    type="button"
                                    className="cart-stepper-button"
                                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                    aria-label={`Increase quantity for ${item.name}`}
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="cart-item-actions">
                              {isCustomKit ? (
                                <Button variant="secondary" onClick={() => editCustomKit(item)}>
                                  Edit
                                </Button>
                              ) : null}
                              <Button variant="secondary" onClick={() => removeItem(index)}>
                                Remove
                              </Button>
                            </div>
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
                    <strong className="cart-summary-shipping">
                      <span>{buildShippingLabel(discountedSubtotal)}</span>
                    </strong>
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
                  <Button
                    block
                    onClick={() => navigate('/checkout')}
                    disabled={normalizedItems.length === 0}
                  >
                    Secure Checkout
                  </Button>
                  <Button block variant="ghost" onClick={clearCart} disabled={normalizedItems.length === 0}>
                    Clear Cart
                  </Button>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Cart;
