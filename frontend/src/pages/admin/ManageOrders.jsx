import React, { useMemo, useState } from 'react';
import { Button, Card, FormField } from '../../components/ui';
import AdminSuiteLayout from './AdminSuiteLayout';
import {
  buildSearchBlob,
  getInitials,
  toneAvatarStyles,
  toneBadgeStyles,
  normalizeText,
} from './adminConstants';

const orderMetrics = [
  {
    label: 'Open orders',
    value: '318',
    trend: '+28 since morning',
    trendTone: 'positive',
    note: 'Queued orders, drafts, and partially fulfilled baskets.',
    tone: 'orange',
  },
  {
    label: 'Revenue today',
    value: '$42.8K',
    trend: '+12.4% vs yesterday',
    trendTone: 'positive',
    note: 'Booked revenue from completed and paid orders.',
    tone: 'royal',
  },
  {
    label: 'Need review',
    value: '24',
    trend: '7 payment flags',
    trendTone: 'warning',
    note: 'Orders needing manual review or shipping verification.',
    tone: 'crimson',
  },
  {
    label: 'Fulfilled',
    value: '92%',
    trend: '+3 pts this week',
    trendTone: 'positive',
    note: 'Completed and shipped orders rolling through the queue.',
    tone: 'green',
  },
];

const statusFilters = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'completed', label: 'Completed' },
  { value: 'refunded', label: 'Refunded' },
];

const paymentOptions = [
  { value: 'Paid', tone: 'green' },
  { value: 'Pending', tone: 'orange' },
  { value: 'Refunded', tone: 'crimson' },
];

const orders = [
  {
    orderId: 'SR-4182',
    customer: 'Lina Karam',
    email: 'lina@example.com',
    date: 'Apr 21, 2026',
    channel: 'Online Store',
    payment: 'Paid',
    paymentTone: 'green',
    total: '$138.00',
    status: 'Completed',
    statusKey: 'completed',
    statusTone: 'green',
    fulfillment: 'Shipped',
    fulfillmentTone: 'green',
    items: '2 items',
    avatarTone: 'crimson',
  },
  {
    orderId: 'SR-4175',
    customer: 'Omar Yassin',
    email: 'omar@example.com',
    date: 'Apr 20, 2026',
    channel: 'Instagram Shop',
    payment: 'Pending',
    paymentTone: 'orange',
    total: '$124.00',
    status: 'Processing',
    statusKey: 'processing',
    statusTone: 'orange',
    fulfillment: 'Picking',
    fulfillmentTone: 'orange',
    items: '3 items',
    avatarTone: 'royal',
  },
  {
    orderId: 'SR-4168',
    customer: 'Maya Khoury',
    email: 'maya@example.com',
    date: 'Apr 19, 2026',
    channel: 'Online Store',
    payment: 'Paid',
    paymentTone: 'green',
    total: '$152.00',
    status: 'Packed',
    statusKey: 'packed',
    statusTone: 'royal',
    fulfillment: 'Ready to ship',
    fulfillmentTone: 'royal',
    items: '1 item',
    avatarTone: 'orange',
  },
  {
    orderId: 'SR-4162',
    customer: 'Karim Farah',
    email: 'karim@example.com',
    date: 'Apr 18, 2026',
    channel: 'Walk-in Order',
    payment: 'Paid',
    paymentTone: 'green',
    total: '$97.00',
    status: 'Completed',
    statusKey: 'completed',
    statusTone: 'green',
    fulfillment: 'Delivered',
    fulfillmentTone: 'green',
    items: '2 items',
    avatarTone: 'green',
  },
  {
    orderId: 'SR-4159',
    customer: 'Rana Saab',
    email: 'rana@example.com',
    date: 'Apr 18, 2026',
    channel: 'Online Store',
    payment: 'Refunded',
    paymentTone: 'crimson',
    total: '$64.00',
    status: 'Refunded',
    statusKey: 'refunded',
    statusTone: 'crimson',
    fulfillment: 'Closed',
    fulfillmentTone: 'crimson',
    items: '1 item',
    avatarTone: 'crimson',
  },
  {
    orderId: 'SR-4154',
    customer: 'Tala Sayegh',
    email: 'tala@example.com',
    date: 'Apr 17, 2026',
    channel: 'Store Pickup',
    payment: 'Paid',
    paymentTone: 'green',
    total: '$108.00',
    status: 'Processing',
    statusKey: 'processing',
    statusTone: 'orange',
    fulfillment: 'Label printed',
    fulfillmentTone: 'orange',
    items: '4 items',
    avatarTone: 'green',
  },
  {
    orderId: 'SR-4148',
    customer: 'Jad Rizk',
    email: 'jad@example.com',
    date: 'Apr 16, 2026',
    channel: 'Online Store',
    payment: 'Paid',
    paymentTone: 'green',
    total: '$183.00',
    status: 'Completed',
    statusKey: 'completed',
    statusTone: 'green',
    fulfillment: 'Shipped',
    fulfillmentTone: 'green',
    items: '3 items',
    avatarTone: 'orange',
  },
  {
    orderId: 'SR-4144',
    customer: 'Elie Nasser',
    email: 'elie@example.com',
    date: 'Apr 16, 2026',
    channel: 'Online Store',
    payment: 'Pending',
    paymentTone: 'orange',
    total: '$71.00',
    status: 'Pending',
    statusKey: 'pending',
    statusTone: 'orange',
    fulfillment: 'Awaiting payment',
    fulfillmentTone: 'orange',
    items: '2 items',
    avatarTone: 'royal',
  },
];

const ManageOrders = () => {
  const [orderRecords, setOrderRecords] = useState(orders);
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [reviewOrderId, setReviewOrderId] = useState(null);
  const [reviewDraft, setReviewDraft] = useState(null);

  const filteredOrders = useMemo(() => {
    const search = normalizeText(query);

    return orderRecords.filter((order) => {
      const matchesStatus = activeStatus === 'all' || order.statusKey === activeStatus;
      const matchesSearch = buildSearchBlob([
        order.orderId,
        order.customer,
        order.email,
        order.date,
        order.payment,
        order.total,
        order.status,
      ]).includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, orderRecords, query]);

  const reviewedOrder = useMemo(
    () => orderRecords.find((order) => order.orderId === reviewOrderId) || null,
    [orderRecords, reviewOrderId],
  );

  const handleOpenReview = (order) => {
    setReviewOrderId(order.orderId);
    setReviewDraft({
      ...order,
      internalNote: order.internalNote || '',
    });
  };

  const handleCloseReview = () => {
    setReviewOrderId(null);
    setReviewDraft(null);
  };

  const handleReviewChange = (field, value) => {
    setReviewDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSaveReview = () => {
    if (!reviewDraft) {
      return;
    }

    const normalizedStatus = statusFilters.find((option) => option.value === reviewDraft.statusKey && option.value !== 'all');
    const normalizedPayment = paymentOptions.find((option) => option.value === reviewDraft.payment);

    const nextOrder = {
      ...reviewDraft,
      statusKey: normalizedStatus?.value || 'processing',
      status: normalizedStatus?.label || 'Processing',
      statusTone: normalizedStatus?.value === 'completed'
        ? 'green'
        : normalizedStatus?.value === 'packed'
          ? 'royal'
          : normalizedStatus?.value === 'refunded'
            ? 'crimson'
            : 'orange',
      payment: normalizedPayment?.value || 'Pending',
      paymentTone: normalizedPayment?.tone || 'orange',
      internalNote: String(reviewDraft.internalNote || '').trim(),
    };

    setOrderRecords((currentOrders) =>
      currentOrders.map((order) => (order.orderId === reviewOrderId ? nextOrder : order)),
    );
    handleCloseReview();
  };

  return (
    <AdminSuiteLayout
      className="admin-orders-page"
      description=""
      eyebrow="Admin Console"
      metrics={orderMetrics}
      title={(
        <>
          Manage <span>Orders</span>
        </>
      )}
    >
      <div className="admin-suite-workspace">
        <Card className="admin-suite-panel admin-suite-main-panel">
          <div className="admin-suite-toolbar">
            <FormField label="Search orders" htmlFor="admin-order-search">
              <input
                className="ui-input"
                id="admin-order-search"
                placeholder="Search order ID or customer"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </FormField>

            <FormField label="Status" htmlFor="admin-order-status">
              <select
                className="ui-select"
                id="admin-order-status"
                value={activeStatus}
                onChange={(event) => setActiveStatus(event.target.value)}
              >
                {statusFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="admin-suite-table-header">
            <div>
              <div className="admin-suite-kicker">Order queue</div>
              <h2 className="admin-suite-table-title">
                {filteredOrders.length} orders in view
              </h2>
              <p className="admin-suite-table-subtitle">
                Keep the store moving by checking payment, packing, and shipping status in one place.
              </p>
            </div>
          </div>

          <div className="admin-suite-table-wrap">
            <table className="admin-suite-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <strong>{order.orderId}</strong>
                      <span className="admin-suite-subtext">{order.date}</span>
                    </td>
                    <td>
                      <div className="admin-suite-name-cell">
                        <span className="admin-suite-avatar" style={toneAvatarStyles[order.avatarTone]}>
                          {getInitials(order.customer)}
                        </span>
                        <div>
                          <strong>{order.customer}</strong>
                          <span className="admin-suite-subtext">{order.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-suite-pill" style={toneBadgeStyles[order.paymentTone]}>
                        {order.payment}
                      </span>
                    </td>
                    <td>
                      <strong>{order.total}</strong>
                      <span className="admin-suite-subtext">{order.items}</span>
                    </td>
                    <td>
                      <span className={`admin-suite-status is-${order.statusTone}`}>{order.status}</span>
                    </td>
                    <td>
                      <div className="admin-suite-actions">
                        <Button
                          className="admin-suite-inline-button"
                          variant="ghost"
                          onClick={() => handleOpenReview(order)}
                        >
                          Review
                        </Button>
                        <Button className="admin-suite-inline-button" variant="secondary">
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-suite-footnote">
            Showing {filteredOrders.length} of {orderRecords.length} orders. Payment and status checks stay visible at a glance.
          </div>
        </Card>

      </div>

      {reviewDraft && reviewedOrder ? (
        <div
          className="admin-order-review-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-order-review-title"
          onClick={handleCloseReview}
        >
          <div className="admin-order-review-modal ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-order-review-head">
              <div>
                <div className="admin-suite-kicker">Order review</div>
                <h2 className="admin-suite-table-title" id="admin-order-review-title">
                  {reviewedOrder.orderId}
                </h2>
              </div>
              <Button variant="ghost" onClick={handleCloseReview}>Close</Button>
            </div>

            <div className="admin-order-review-summary">
              <div>
                <span>Customer</span>
                <strong>{reviewedOrder.customer}</strong>
                <small>{reviewedOrder.email}</small>
              </div>
              <div>
                <span>Date</span>
                <strong>{reviewedOrder.date}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{reviewedOrder.total}</strong>
                <small>{reviewedOrder.items}</small>
              </div>
            </div>

            <div className="admin-order-review-form">
              <FormField label="Payment" htmlFor="admin-order-review-payment">
                <select
                  className="ui-select"
                  id="admin-order-review-payment"
                  value={reviewDraft.payment}
                  onChange={(event) => handleReviewChange('payment', event.target.value)}
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.value}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Status" htmlFor="admin-order-review-status">
                <select
                  className="ui-select"
                  id="admin-order-review-status"
                  value={reviewDraft.statusKey}
                  onChange={(event) => handleReviewChange('statusKey', event.target.value)}
                >
                  {statusFilters.filter((option) => option.value !== 'all').map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Internal note" htmlFor="admin-order-review-note">
                <textarea
                  className="ui-textarea"
                  id="admin-order-review-note"
                  value={reviewDraft.internalNote}
                  onChange={(event) => handleReviewChange('internalNote', event.target.value)}
                  placeholder="Add context for payment checks, escalation, or shipping updates."
                />
              </FormField>
            </div>

            <div className="admin-order-review-actions">
              <Button variant="ghost" onClick={handleCloseReview}>Cancel</Button>
              <Button onClick={handleSaveReview}>Save review</Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminSuiteLayout>
  );
};

export default ManageOrders;
