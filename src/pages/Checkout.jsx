import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, FormField, PageShell, StateBlock } from '../components/ui';
import { getShopProductById } from '../services/productService';
import { getStoredUser } from '../utils/auth';
import '../styles/checkout.css';

const CART_STORAGE_KEYS = ['jerseys-cart', 'shopping-cart', 'cartItems', 'cart'];
const SHIPPING_FEE = 12.95;
const FREE_SHIPPING_THRESHOLD = 150;
const EXPRESS_SHIPPING_FEE = 18.95;
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
    size: firstText(rawItem.size, rawItem.selectedSize, rawItem.jerseySize, rawItem.variantSize, product?.sizes?.[0]),
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

const clearCartStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  CART_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  window.dispatchEvent(new Event('jerseys-cart-change'));
};

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(readCartFromStorage);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState(() => {
    const storedUser = getStoredUser();
    const username = storedUser?.username || '';
    const nameParts = username.split(' ').filter(Boolean);

    return {
      firstName: nameParts[0] || username || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: storedUser?.email || '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      cardName: storedUser?.username || '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
    };
  });
  const [formErrors, setFormErrors] = useState({});

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

  const normalizedItems = useMemo(
    () => cartItems.map((item, index) => normalizeStoredItem(item, index)),
    [cartItems],
  );

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
  const shippingCost = shippingMethod === 'express'
    ? EXPRESS_SHIPPING_FEE
    : discountedSubtotal >= FREE_SHIPPING_THRESHOLD || discountedSubtotal === 0
      ? 0
      : SHIPPING_FEE;
  const taxCost = discountedSubtotal * TAX_RATE;
  const orderTotal = discountedSubtotal + shippingCost + taxCost;
  const paymentPlanAmount = orderTotal / 4;

  const shippingLabel = shippingMethod === 'express'
    ? formatPrice(EXPRESS_SHIPPING_FEE)
    : discountedSubtotal >= FREE_SHIPPING_THRESHOLD || discountedSubtotal === 0
      ? 'Free'
      : formatPrice(SHIPPING_FEE);

  const validateShippingStep = () => {
    const nextErrors = {};
    const requiredFields = [
      ['firstName', 'First name is required.'],
      ['lastName', 'Last name is required.'],
      ['email', 'Email address is required.'],
      ['address1', 'Address line 1 is required.'],
      ['city', 'City is required.'],
      ['state', 'State is required.'],
      ['zip', 'ZIP code is required.'],
    ];

    requiredFields.forEach(([field, message]) => {
      if (!formValues[field]?.trim()) {
        nextErrors[field] = message;
      }
    });

    return nextErrors;
  };

  const validatePaymentStep = () => {
    const nextErrors = {};
    const requiredFields = [
      ['cardName', 'Name on card is required.'],
      ['cardNumber', 'Card number is required.'],
      ['cardExpiry', 'Expiry date is required.'],
      ['cardCvv', 'Security code is required.'],
    ];

    requiredFields.forEach(([field, message]) => {
      if (!formValues[field]?.trim()) {
        nextErrors[field] = message;
      }
    });

    if (formValues.cardNumber && !/^\d{12,19}$/.test(formValues.cardNumber.replace(/\s+/g, ''))) {
      nextErrors.cardNumber = 'Enter a valid card number.';
    }

    if (formValues.cardExpiry && !/^\d{2}\/\d{2}$/.test(formValues.cardExpiry.trim())) {
      nextErrors.cardExpiry = 'Use MM/YY for the expiry date.';
    }

    if (formValues.cardCvv && !/^\d{3,4}$/.test(formValues.cardCvv.trim())) {
      nextErrors.cardCvv = 'Use a 3 or 4 digit security code.';
    }

    return nextErrors;
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setFormErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const validateCheckout = () => {
    const shippingErrors = validateShippingStep();
    const paymentErrors = validatePaymentStep();

    return {
      ...shippingErrors,
      ...paymentErrors,
    };
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

  const handlePlaceOrder = (event) => {
    event.preventDefault();

    const nextErrors = validateCheckout();
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || normalizedItems.length === 0) {
      return;
    }

    clearCartStorage();
    setCartItems([]);
    navigate('/order-history');
  };

  const openShippingMethod = () => {
    const nextErrors = validateShippingStep();
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setCurrentStep(2);
  };

  const openPaymentStep = () => {
    setCurrentStep(3);
  };

  const openReviewStep = () => {
    const nextErrors = validatePaymentStep();
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setCurrentStep(4);
  };

  const isStepOpen = (step) => currentStep === step;
  const isStepCompleted = (step) => currentStep > step;
  const canReopenStep = (step) => step < currentStep;

  const handleStepHeaderClick = (step) => {
    if (!canReopenStep(step)) {
      return;
    }

    setCurrentStep(step);
  };

  const handleStepHeaderKeyDown = (event, step) => {
    if (!canReopenStep(step)) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setCurrentStep(step);
    }
  };

  if (normalizedItems.length === 0) {
    return (
      <div className="checkout-empty-wrap">
        <PageShell className="checkout-page checkout-empty-page">
          <StateBlock
            centered
            icon="0"
            title="Your cart is empty"
            description="Add a jersey to your cart first, then come back here to review shipping, payment, and order totals."
            actions={(
              <>
                <Button to="/shop">Browse Jerseys</Button>
                <Button variant="secondary" to="/cart">
                  View Cart
                </Button>
              </>
            )}
          />
        </PageShell>
      </div>
    );
  }

  return (
    <PageShell className="checkout-page">
      <div className="checkout-topbar">
        <div>
          <div className="ui-page-eyebrow">Secure Checkout</div>
          <h1 className="ui-page-title">Checkout</h1>
        </div>
      </div>

      <div className="checkout-layout">
        <section className="checkout-main-column" aria-label="Checkout steps">
          <div className="checkout-step-layout">
            <div className={`checkout-step-number${isStepOpen(1) ? ' is-active' : isStepCompleted(1) ? ' is-complete' : ''}`}>1</div>
            <Card
              className={`checkout-step-card${isStepOpen(1) ? ' is-open' : ''}${canReopenStep(1) ? ' is-clickable' : ''}`}
              onClick={canReopenStep(1) ? () => handleStepHeaderClick(1) : undefined}
              onKeyDown={canReopenStep(1) ? (event) => handleStepHeaderKeyDown(event, 1) : undefined}
              tabIndex={canReopenStep(1) ? 0 : undefined}
              role={canReopenStep(1) ? 'button' : undefined}
              aria-label={canReopenStep(1) ? 'Reopen shipping address step' : undefined}
            >
              <div className="checkout-step-heading">
                <div>
                  <p className="checkout-step-kicker">Step 1</p>
                  <h2>Shipping address</h2>
                  <p className="checkout-step-copy">Enter the delivery details for this order.</p>
                </div>
              </div>

              {isStepOpen(1) ? (
                <form className="checkout-form-grid" id="checkout-shipping-address" onSubmit={(event) => event.preventDefault()} noValidate>
                  <FormField label="First name" htmlFor="checkout-first-name" error={formErrors.firstName}>
                    <input
                      id="checkout-first-name"
                      name="firstName"
                      className="ui-input"
                      value={formValues.firstName}
                      onChange={handleFieldChange}
                      placeholder="First name"
                      autoComplete="given-name"
                    />
                  </FormField>

                  <FormField label="Last name" htmlFor="checkout-last-name" error={formErrors.lastName}>
                    <input
                      id="checkout-last-name"
                      name="lastName"
                      className="ui-input"
                      value={formValues.lastName}
                      onChange={handleFieldChange}
                      placeholder="Last name"
                      autoComplete="family-name"
                    />
                  </FormField>

                  <FormField
                    label="Email address"
                    htmlFor="checkout-email"
                    error={formErrors.email}
                    hint="We will send your receipt and shipping updates here."
                  >
                    <input
                      id="checkout-email"
                      name="email"
                      type="email"
                      className="ui-input"
                      value={formValues.email}
                      onChange={handleFieldChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </FormField>

                  <FormField label="Phone" htmlFor="checkout-phone" error={formErrors.phone}>
                    <input
                      id="checkout-phone"
                      name="phone"
                      className="ui-input"
                      value={formValues.phone}
                      onChange={handleFieldChange}
                      placeholder="Phone number"
                      autoComplete="tel"
                    />
                  </FormField>

                  <FormField
                    label="Address line 1"
                    htmlFor="checkout-address-1"
                    error={formErrors.address1}
                  >
                    <input
                      id="checkout-address-1"
                      name="address1"
                      className="ui-input"
                      value={formValues.address1}
                      onChange={handleFieldChange}
                      placeholder="Street address"
                      autoComplete="address-line1"
                    />
                  </FormField>

                  <FormField
                    label="Address line 2"
                    htmlFor="checkout-address-2"
                    error={formErrors.address2}
                  >
                    <input
                      id="checkout-address-2"
                      name="address2"
                      className="ui-input"
                      value={formValues.address2}
                      onChange={handleFieldChange}
                      placeholder="Apartment, suite, floor"
                      autoComplete="address-line2"
                    />
                  </FormField>

                  <FormField label="City" htmlFor="checkout-city" error={formErrors.city}>
                    <input
                      id="checkout-city"
                      name="city"
                      className="ui-input"
                      value={formValues.city}
                      onChange={handleFieldChange}
                      placeholder="City"
                      autoComplete="address-level2"
                    />
                  </FormField>

                  <FormField label="State" htmlFor="checkout-state" error={formErrors.state}>
                    <input
                      id="checkout-state"
                      name="state"
                      className="ui-input"
                      value={formValues.state}
                      onChange={handleFieldChange}
                      placeholder="State"
                      autoComplete="address-level1"
                    />
                  </FormField>

                  <FormField label="ZIP code" htmlFor="checkout-zip" error={formErrors.zip}>
                    <input
                      id="checkout-zip"
                      name="zip"
                      className="ui-input"
                      value={formValues.zip}
                      onChange={handleFieldChange}
                      placeholder="ZIP code"
                      autoComplete="postal-code"
                    />
                  </FormField>

                  <div className="checkout-form-actions">
                    <Button type="button" block onClick={openShippingMethod}>
                      Continue to shipping method
                    </Button>
                  </div>
                </form>
              ) : null}
            </Card>
          </div>

          <div className="checkout-step-layout" id="checkout-shipping-method">
            <div className={`checkout-step-number${isStepOpen(2) ? ' is-active' : isStepCompleted(2) ? ' is-complete' : ''}`}>2</div>
            <Card
              className={`checkout-step-card${isStepOpen(2) ? ' is-open' : ''}${canReopenStep(2) ? ' is-clickable' : ''}`}
              onClick={canReopenStep(2) ? () => handleStepHeaderClick(2) : undefined}
              onKeyDown={canReopenStep(2) ? (event) => handleStepHeaderKeyDown(event, 2) : undefined}
              tabIndex={canReopenStep(2) ? 0 : undefined}
              role={canReopenStep(2) ? 'button' : undefined}
              aria-label={canReopenStep(2) ? 'Reopen shipping method step' : undefined}
            >
              <div className="checkout-step-heading">
                <div>
                  <p className="checkout-step-kicker">Step 2</p>
                  <h2>Shipping method</h2>
                  <p className="checkout-step-copy">Choose the speed that fits your timeline.</p>
                </div>
              </div>

              {isStepOpen(2) ? (
                <>
                  <div className="checkout-option-list" role="radiogroup" aria-label="Shipping method">
                    <label className={`checkout-option-card${shippingMethod === 'standard' ? ' is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                      />
                      <span className="checkout-option-card-main">
                        <strong>Standard shipping</strong>
                        <span>Arrives in 3 to 5 business days</span>
                      </span>
                      <span className="checkout-option-price">
                        {discountedSubtotal >= FREE_SHIPPING_THRESHOLD || discountedSubtotal === 0 ? 'Free' : formatPrice(SHIPPING_FEE)}
                      </span>
                    </label>

                    <label className={`checkout-option-card${shippingMethod === 'express' ? ' is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                      />
                      <span className="checkout-option-card-main">
                        <strong>Express shipping</strong>
                        <span>Arrives in 1 to 2 business days</span>
                      </span>
                      <span className="checkout-option-price">{formatPrice(EXPRESS_SHIPPING_FEE)}</span>
                    </label>
                  </div>

                  <div className="checkout-form-actions">
                    <Button type="button" block onClick={openPaymentStep}>
                      Continue to payment
                    </Button>
                  </div>
                </>
              ) : null}
            </Card>
          </div>

          <div className="checkout-step-layout" id="checkout-payment">
            <div className={`checkout-step-number${isStepOpen(3) ? ' is-active' : isStepCompleted(3) ? ' is-complete' : ''}`}>3</div>
            <Card
              className={`checkout-step-card${isStepOpen(3) ? ' is-open' : ''}${canReopenStep(3) ? ' is-clickable' : ''}`}
              onClick={canReopenStep(3) ? () => handleStepHeaderClick(3) : undefined}
              onKeyDown={canReopenStep(3) ? (event) => handleStepHeaderKeyDown(event, 3) : undefined}
              tabIndex={canReopenStep(3) ? 0 : undefined}
              role={canReopenStep(3) ? 'button' : undefined}
              aria-label={canReopenStep(3) ? 'Reopen payment step' : undefined}
            >
              <div className="checkout-step-heading">
                <div>
                  <p className="checkout-step-kicker">Step 3</p>
                  <h2>Payment</h2>
                  <p className="checkout-step-copy">Secure your order with a card payment.</p>
                </div>
              </div>

              {isStepOpen(3) ? (
                <>
                  <div className="checkout-form-grid checkout-payment-grid">
                    <FormField label="Name on card" htmlFor="checkout-card-name" error={formErrors.cardName}>
                      <input
                        id="checkout-card-name"
                        name="cardName"
                        className="ui-input"
                        value={formValues.cardName}
                        onChange={handleFieldChange}
                        placeholder="Name on card"
                        autoComplete="cc-name"
                      />
                    </FormField>

                    <FormField label="Card number" htmlFor="checkout-card-number" error={formErrors.cardNumber}>
                      <input
                        id="checkout-card-number"
                        name="cardNumber"
                        className="ui-input"
                        value={formValues.cardNumber}
                        onChange={handleFieldChange}
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                    </FormField>

                    <FormField label="Expiry" htmlFor="checkout-card-expiry" error={formErrors.cardExpiry}>
                      <input
                        id="checkout-card-expiry"
                        name="cardExpiry"
                        className="ui-input"
                        value={formValues.cardExpiry}
                        onChange={handleFieldChange}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                      />
                    </FormField>

                    <FormField label="Security code" htmlFor="checkout-card-cvv" error={formErrors.cardCvv}>
                      <input
                        id="checkout-card-cvv"
                        name="cardCvv"
                        className="ui-input"
                        value={formValues.cardCvv}
                        onChange={handleFieldChange}
                        placeholder="CVV"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                      />
                    </FormField>
                  </div>

                  <div className="checkout-payment-note">
                    <p>All card details are collected in this demo checkout form only.</p>
                  </div>

                  <div className="checkout-form-actions">
                    <Button type="button" block onClick={openReviewStep}>
                      Review order
                    </Button>
                  </div>
                </>
              ) : null}
            </Card>
          </div>

          <div className="checkout-step-layout" id="checkout-review">
            <div className={`checkout-step-number${isStepOpen(4) ? ' is-active' : isStepCompleted(4) ? ' is-complete' : ''}`}>4</div>
            <Card
              className={`checkout-step-card${isStepOpen(4) ? ' is-open' : ''}${canReopenStep(4) ? ' is-clickable' : ''}`}
              onClick={canReopenStep(4) ? () => handleStepHeaderClick(4) : undefined}
              onKeyDown={canReopenStep(4) ? (event) => handleStepHeaderKeyDown(event, 4) : undefined}
              tabIndex={canReopenStep(4) ? 0 : undefined}
              role={canReopenStep(4) ? 'button' : undefined}
              aria-label={canReopenStep(4) ? 'Reopen review step' : undefined}
            >
              <div className="checkout-step-heading">
                <div>
                  <p className="checkout-step-kicker">Step 4</p>
                  <h2>Review and place order</h2>
                  <p className="checkout-step-copy">Double-check the order summary before placing it.</p>
                </div>
              </div>

              {isStepOpen(4) ? (
                <div className="checkout-review-grid">
                  <div className="checkout-review-items">
                    {normalizedItems.map((item) => {
                      const lineTotal = item.unitPrice * item.quantity;

                      return (
                        <div key={item.cartKey} className="checkout-review-item">
                          <div className="checkout-review-item-media">
                            {item.image ? <img src={item.image} alt={item.name} /> : null}
                          </div>

                          <div className="checkout-review-item-body">
                            <div className="checkout-review-item-top">
                              <div>
                                <h3>{item.name}</h3>
                                <p>
                                  {item.team}
                                  {item.size ? ` / Size ${item.size}` : ''}
                                </p>
                              </div>
                              <strong>{formatPrice(lineTotal)}</strong>
                            </div>

                            <div className="checkout-review-item-meta">
                              <span>Quantity {item.quantity}</span>
                              <span>{item.sportLabel}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="checkout-review-summary">
                    <p className="checkout-review-note">
                      By placing this order, you agree to the demo store terms and confirm the shipping details above.
                    </p>
                    <Button type="submit" block onClick={handlePlaceOrder}>
                      Place Secure Order
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          </div>
        </section>

        <aside className="checkout-sidebar" aria-label="Order summary">
          <Card className="checkout-summary-card">
            <div className="checkout-summary-heading">
              <h2>Summary</h2>
              <p>Promo code and totals for this order.</p>
            </div>

            <form className="checkout-promo-form" onSubmit={handlePromoSubmit}>
              <FormField label="Promo code" htmlFor="checkout-promo">
                <div className="checkout-promo-row">
                  <input
                    id="checkout-promo"
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
                  className={`checkout-promo-message${promoMessage === 'Invalid coupon' ? ' is-error' : ' is-success'}`}
                >
                  {promoMessage}
                </p>
              ) : null}
            </form>

            <div className="checkout-summary-rows">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                {isCouponApplied ? (
                  <strong className="checkout-price-stack">
                    <span className="checkout-price-old">{formatPrice(subtotal)}</span>
                    <span className="checkout-price-new">{formatPrice(discountedSubtotal)}</span>
                  </strong>
                ) : (
                  <strong>{formatPrice(subtotal)}</strong>
                )}
              </div>

              {isCouponApplied ? (
                <div className="checkout-summary-row checkout-summary-row-discount">
                  <span>{`Coupon ${appliedCoupon}`}</span>
                  <strong className="checkout-coupon-applied">- {formatPrice(discountAmount)}</strong>
                </div>
              ) : null}

              <div className="checkout-summary-row">
                <span>Shipping</span>
                <strong className="checkout-summary-shipping">{shippingLabel}</strong>
              </div>

              <div className="checkout-summary-row">
                <span>Estimated tax</span>
                <strong>{formatPrice(taxCost)}</strong>
              </div>

              <div className="checkout-summary-row is-total">
                <span>Total</span>
                <strong>{formatPrice(orderTotal)}</strong>
              </div>
            </div>

            <div className="checkout-payment-plan">
              <p>4 interest-free payments of {formatPrice(paymentPlanAmount)} with Klarna.</p>
            </div>
          </Card>

          <Card className="checkout-summary-items-card">
            <div className="checkout-summary-heading">
              <h2>Cart ({itemCount} items)</h2>
            </div>

            <div className="checkout-summary-items">
              {normalizedItems.map((item) => {
                const lineTotal = item.unitPrice * item.quantity;

                return (
                  <div key={item.cartKey} className="checkout-summary-item">
                    <div className="checkout-summary-item-media">
                      {item.image ? <img src={item.image} alt={item.name} /> : null}
                    </div>

                    <div className="checkout-summary-item-body">
                      <div className="checkout-summary-item-top">
                        <h3>{item.name}</h3>
                        <strong>{formatPrice(lineTotal)}</strong>
                      </div>
                      <p>
                        {item.team}
                        {item.size ? ` / Size ${item.size}` : ''}
                      </p>
                      <div className="checkout-summary-item-meta">
                        <span>Qty {item.quantity}</span>
                        {item.badge ? <span>{item.badge}</span> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="checkout-help-card">
            <div className="checkout-help-actions">
              <Button variant="secondary" to="/shop">
                Back to shop
              </Button>
              <Button variant="ghost" to="/cart">
                Return to cart
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
};

export default Checkout;
