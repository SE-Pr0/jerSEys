import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Card, PageShell, StateBlock } from '../components/ui';
import { readOrderConfirmation } from '../utils/orderConfirmation';
import '../styles/order-confirmation.css';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatPrice = (value) => currencyFormatter.format(Number.isFinite(value) ? value : 0);

const formatDate = (value) => value || '';

const buildBillingLines = (order) => {
  if (!order?.shippingAddress) {
    return [];
  }

  const {
    country,
    firstName,
    lastName,
    email,
    phone,
    address1,
    address2,
    city,
    zip,
  } = order.shippingAddress;
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const address = [address1, address2].filter(Boolean).join(', ');
  const location = [city, zip, country].filter(Boolean).join(', ');

  return [
    ['Name', fullName],
    ['Address', [address, location].filter(Boolean).join(', ')],
    ['Phone', phone],
    ['Email', email],
  ].filter(([, value]) => Boolean(value));
};

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order || readOrderConfirmation();

  if (!order) {
    return (
      <PageShell className="order-confirmation-page" narrow>
        <div className="order-confirmation-empty">
          <StateBlock
            centered
            icon="!"
            title="No recent order found"
            description="We could not find a confirmation for this session. You can head back to the shop or return to checkout if you were still placing an order."
            actions={(
              <>
                <Button to="/shop">Browse Jerseys</Button>
                <Button variant="secondary" to="/checkout">
                  Back to Checkout
                </Button>
              </>
            )}
          />
        </div>
      </PageShell>
    );
  }

  const totals = order.totals || {};
  const billingLines = buildBillingLines(order);
  const itemCount = order.summaryItems?.itemCount || order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const paymentLabel = order.paymentMethod
    ? `${order.paymentMethod}${order.paymentLast4 ? ` **** ${order.paymentLast4}` : ''}`
    : 'Card';
  const deliveryLabel = order.shippingMethod === 'express' ? '1-2 business days' : '3-5 business days';
  const receiptDate = formatDate(order.orderDate);

  return (
    <PageShell className="order-confirmation-page">
      <div className="order-confirmation-frame">
        <Card padded={false} className="order-confirmation-sheet">
          <div className="order-confirmation-panel">
            <section className="order-confirmation-left">
              <h1 className="order-confirmation-title">
                Thank you for your
                <br />
                purchase!
              </h1>
              <p className="order-confirmation-copy">
                Your order will be processed within 24 hours during working days. We will notify you by email once your order has been shipped.
              </p>

              <div className="order-confirmation-billing">
                <h2>Billing address</h2>
                <div className="order-confirmation-billing-list">
                  {billingLines.map(([label, value]) => (
                    <div key={label} className="order-confirmation-billing-row">
                      <strong>{label}</strong>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button to="/order-history" className="order-confirmation-track-button">
                Track Your Order
              </Button>
            </section>

            <aside className="order-confirmation-right" aria-label="Order summary">
              <Card className="order-confirmation-summary-card">
                <div className="order-confirmation-summary-header">
                  <h2>Order Summary</h2>
                </div>

                <div className="order-confirmation-summary-meta">
                  <div className="order-confirmation-summary-meta-item">
                    <span>Date</span>
                    <strong>{receiptDate}</strong>
                  </div>
                  <div className="order-confirmation-summary-meta-item">
                    <span>Order Number</span>
                    <strong>{order.orderNumber}</strong>
                  </div>
                  <div className="order-confirmation-summary-meta-item">
                    <span>Payment Method</span>
                    <strong>{paymentLabel}</strong>
                  </div>
                </div>

                <div className="order-confirmation-summary-divider" />

                <div className="order-confirmation-summary-items">
                  {order.items.map((item) => (
                    <div key={item.cartKey} className="order-confirmation-summary-item">
                      <div className="order-confirmation-summary-item-media">
                        {item.image ? <img src={item.image} alt={item.name} /> : null}
                      </div>

                      <div className="order-confirmation-summary-item-body">
                        <div className="order-confirmation-summary-item-top">
                          <div>
                            <h3>{item.name}</h3>
                            <p>
                              {item.team}
                              {item.size ? ` / Size ${item.size}` : ''}
                            </p>
                            <span>
                              Qty: {item.quantity}
                              {item.badge ? ` / ${item.badge}` : ''}
                            </span>
                          </div>
                          <strong>{formatPrice(item.lineTotal)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-confirmation-summary-totals">
                  <div className="order-confirmation-summary-total-row">
                    <span>Sub Total</span>
                    <strong>{formatPrice(totals.subtotal)}</strong>
                  </div>
                  <div className="order-confirmation-summary-total-row">
                    <span>Shipping</span>
                    <strong>{totals.shippingCost === 0 ? 'Free' : formatPrice(totals.shippingCost)}</strong>
                  </div>
                  <div className="order-confirmation-summary-total-row">
                    <span>Tax</span>
                    <strong>{formatPrice(totals.taxCost)}</strong>
                  </div>
                </div>

                <div className="order-confirmation-summary-total-final">
                  <span>Order Total</span>
                  <strong>{formatPrice(totals.orderTotal)}</strong>
                </div>

                <div className="order-confirmation-summary-footer">
                  <div>
                    <span>Delivery</span>
                    <strong>{deliveryLabel}</strong>
                  </div>
                  <div>
                    <span>Items</span>
                    <strong>{itemCount}</strong>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </Card>
      </div>
    </PageShell>
  );
};

export default OrderConfirmation;
