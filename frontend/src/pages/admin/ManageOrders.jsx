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
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');

  const filteredOrders = useMemo(() => {
    const search = normalizeText(query);

    return orders.filter((order) => {
      const matchesStatus = activeStatus === 'all' || order.statusKey === activeStatus;
      const matchesSearch = buildSearchBlob([
        order.orderId,
        order.customer,
        order.email,
        order.date,
        order.channel,
        order.payment,
        order.total,
        order.status,
        order.fulfillment,
      ]).includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, query]);

  return (
    <AdminSuiteLayout
      className="admin-orders-page"
      description="Track order status, payment flow, and fulfillment progress from a single queue."
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
                placeholder="Search order ID, customer, or channel"
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
                  <th>Channel</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Fulfillment</th>
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
                    <td>{order.channel}</td>
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
                      <span className="admin-suite-pill" style={toneBadgeStyles[order.fulfillmentTone]}>
                        {order.fulfillment}
                      </span>
                    </td>
                    <td>
                      <div className="admin-suite-actions">
                        <Button className="admin-suite-inline-button" variant="ghost">
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
            Showing {filteredOrders.length} of {orders.length} orders. Payment and shipping checks stay visible at a glance.
          </div>
        </Card>

      </div>
    </AdminSuiteLayout>
  );
};

export default ManageOrders;
