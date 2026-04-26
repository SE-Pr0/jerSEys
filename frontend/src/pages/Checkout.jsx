import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, FormField, PageShell, StateBlock } from '../components/ui';
import { clearCart as clearAllCart, getCombinedCart } from '../services/cartService';
import { createOrder } from '../services/orderService';
import { getStoredUser } from '../utils/auth';
import { createOrderConfirmation, writeOrderConfirmation } from '../utils/orderConfirmation';
import '../styles/checkout.css';

const SHIPPING_FEE = 12.95;
const FREE_SHIPPING_THRESHOLD = 150;
const EXPRESS_SHIPPING_FEE = 18.95;
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

const splitFullName = (value) => {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

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

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [promoCode, setPromoCode] = useState(readStoredCoupon);
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(readStoredCoupon);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(() => {
    const storedUser = getStoredUser();
    const username = storedUser?.username || '';

    return {
      country: 'Lebanon',
      fullName: username || '',
      email: storedUser?.email || '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      zip: '',
      cardName: storedUser?.username || '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
    };
  });
  const [formErrors, setFormErrors] = useState({});

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

    syncCoupon();

    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('jerseys-cart-change', syncCart);
      window.removeEventListener('storage', syncCoupon);
      window.removeEventListener('jerseys-coupon-change', syncCoupon);
    };
  }, [loadCart]);

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
  const originalShippingCost = shippingMethod === 'express'
    ? EXPRESS_SHIPPING_FEE
    : subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
      ? 0
      : SHIPPING_FEE;
  const originalTaxCost = subtotal * TAX_RATE;
  const originalOrderTotal = subtotal + originalShippingCost + originalTaxCost;
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
      ['fullName', 'Full name is required.'],
      ['country', 'Country / Region is required.'],
      ['email', 'Email address is required.'],
      ['address1', 'Address line 1 is required.'],
      ['city', 'City is required.'],
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

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    const nextErrors = validateCheckout();
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || normalizedItems.length === 0) {
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    const { firstName, lastName } = splitFullName(formValues.fullName);
    const apiBackedItems = normalizedItems.filter((item) => item.cartSource === 'api');
    const confirmationItems = apiBackedItems.length > 0 ? apiBackedItems : normalizedItems;

    if (apiBackedItems.length > 0) {
      try {
        await createOrder();
      } catch (error) {
        setSubmitError(error.message || 'Failed to place order.');
        setIsSubmitting(false);
        return;
      }
    }

    const confirmation = createOrderConfirmation({
      items: confirmationItems,
      shippingAddress: {
        country: formValues.country.trim(),
        firstName,
        lastName,
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        address1: formValues.address1.trim(),
        address2: formValues.address2.trim(),
        city: formValues.city.trim(),
        zip: formValues.zip.trim(),
      },
      cardNumber: formValues.cardNumber,
      shippingMethod,
      couponCode: isCouponApplied ? appliedCoupon : '',
      subtotal,
      discountAmount,
      shippingCost,
      taxCost,
      orderTotal,
    });

    writeOrderConfirmation(confirmation);
    await clearAllCart();
    writeStoredCoupon('');
    setCartItems([]);
    setIsSubmitting(false);
    navigate('/order-confirmation', { state: { order: confirmation } });
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

  if (isLoading) {
    return (
      <div className="checkout-empty-wrap">
        <PageShell className="checkout-page checkout-empty-page">
          <StateBlock
            centered
            icon="..."
            title="Loading cart"
            description="Fetching the latest cart items before checkout."
          />
        </PageShell>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="checkout-empty-wrap">
        <PageShell className="checkout-page checkout-empty-page">
          <StateBlock
            centered
            icon="!"
            title="Unable to load checkout"
            description={loadError}
            actions={(
              <>
                <Button variant="secondary" to="/cart">
                  View Cart
                </Button>
                <Button to="/shop">Browse Jerseys</Button>
              </>
            )}
          />
        </PageShell>
      </div>
    );
  }

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
                  <h2>Enter a new shipping address</h2>
                  <p className="checkout-step-copy">Add the delivery details for this order.</p>
                </div>
              </div>

              {isStepOpen(1) ? (
                <form className="checkout-form-grid checkout-address-form" id="checkout-shipping-address" onSubmit={(event) => event.preventDefault()} noValidate>
                  <FormField label="Full name" htmlFor="checkout-full-name" error={formErrors.fullName}>
                    <input
                      id="checkout-full-name"
                      name="fullName"
                      className="ui-input"
                      value={formValues.fullName}
                      onChange={handleFieldChange}
                      placeholder="John Newman"
                      autoComplete="name"
                    />
                  </FormField>

                  <FormField
                    label="Phone number"
                    htmlFor="checkout-phone"
                    error={formErrors.phone}
                    hint="May be used to assist delivery."
                  >
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

                  <FormField label="Country / Region" htmlFor="checkout-country" error={formErrors.country}>
                    <input
                      id="checkout-country"
                      name="country"
                      className="ui-input"
                      value={formValues.country}
                      onChange={handleFieldChange}
                      placeholder="Lebanon"
                      autoComplete="country-name"
                    />
                  </FormField>

                  <FormField
                    label="Address"
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
                    label="Apartment, suite, unit, building"
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

                  <div className="checkout-address-location-row">
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
                  </div>

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
                      {isSubmitting ? 'Placing Order...' : 'Place Secure Order'}
                    </Button>
                    {submitError ? <p className="checkout-promo-message is-error">{submitError}</p> : null}
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
            <div className="checkout-summary-items-topbar">
              <span className="checkout-summary-items-count">{itemCount} Total Items</span>
              <Button className="checkout-summary-items-edit" variant="ghost" to="/cart">
                Edit
              </Button>
            </div>

            <div className="checkout-summary-items-strip" aria-label={`Cart preview with ${itemCount} items`}>
              {normalizedItems.map((item) => (
                <div key={item.cartKey} className="checkout-summary-item">
                  <div className="checkout-summary-item-media">
                    {item.image ? <img src={item.image} alt={item.name} /> : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-summary-items-footer">
              <div className="checkout-summary-items-pricing">
                {isCouponApplied ? (
                  <p className="checkout-summary-items-savings">You saved {formatPrice(discountAmount)}!</p>
                ) : (
                  <p className="checkout-summary-items-savings is-muted">Your cart is ready for checkout.</p>
                )}

                <div className="checkout-summary-items-price-row">
                  <strong className="checkout-summary-items-total">{formatPrice(orderTotal)}</strong>
                  {isCouponApplied ? <span className="checkout-summary-items-original">{formatPrice(originalOrderTotal)}</span> : null}
                </div>
              </div>
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
