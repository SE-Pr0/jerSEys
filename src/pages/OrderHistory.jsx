import React, { useMemo, useState } from 'react';
import { Button, Card, PageHeader, PageShell, StateBlock } from '../components/ui';
import '../styles/order-history.css';

const orderSummary = [
  { value: '8', label: 'Completed orders' },
  { value: '2', label: 'In progress' },
  { value: '$684', label: 'Total spent' },
];

const orderItems = [
  {
    id: 'JSY-1048',
    date: 'April 02, 2026',
    status: 'Delivered',
    total: '$132.00',
    itemCount: 2,
    items: ['Arsenal 24/25 Home Jersey', 'Lakers City Edition Jersey'],
    shipping: 'Delivered to Beirut on April 06',
  },
  {
    id: 'JSY-1031',
    date: 'March 18, 2026',
    status: 'Processing',
    total: '$89.00',
    itemCount: 1,
    items: ['Custom Name Football Kit'],
    shipping: 'Customization in production',
  },
  {
    id: 'JSY-0994',
    date: 'February 11, 2026',
    status: 'Delivered',
    total: '$154.00',
    itemCount: 3,
    items: ['PSG Third Jersey', 'Barcelona Retro Shirt', 'NBA Swingman Shorts'],
    shipping: 'Delivered to Beirut on February 15',
  },
  {
    id: 'JSY-0942',
    date: 'January 27, 2026',
    status: 'Cancelled',
    total: '$46.00',
    itemCount: 1,
    items: ['Training Top - Black'],
    shipping: 'Order cancelled before dispatch',
  },
];

const statusOptions = ['All', 'Delivered', 'Processing', 'Cancelled'];

const OrderHistory = () => {
  const [activeStatus, setActiveStatus] = useState('All');

  const filteredOrders = useMemo(() => {
    if (activeStatus === 'All') {
      return orderItems;
    }

    return orderItems.filter((order) => order.status === activeStatus);
  }, [activeStatus]);

  return (
    <PageShell className="order-history-page">
      <PageHeader
        eyebrow="Purchase Archive"
        title="Order History"
        description="Track past purchases, check the latest fulfillment status, and revisit the jerseys you have already ordered."
        actions={
          <>
            <Button variant="secondary" to="/shop">
              Shop Again
            </Button>
            <Button>Download Invoice</Button>
          </>
        }
      />

      <div className="order-history-summary">
        {orderSummary.map((item) => (
          <Card key={item.label} className="order-history-stat">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </Card>
        ))}
      </div>

      <Card className="order-history-filters">
        <div className="order-history-filter-copy">
          <p className="order-history-kicker">Filter by status</p>
          <h2>Recent activity</h2>
        </div>

        <div className="order-history-tabs" role="tablist" aria-label="Order statuses">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              className={`order-history-tab${activeStatus === status ? ' is-active' : ''}`}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </Card>

      {filteredOrders.length ? (
        <div className="order-history-list">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="order-history-card">
              <div className="order-history-card-top">
                <div>
                  <p className="order-history-kicker">Order {order.id}</p>
                  <h2>{order.date}</h2>
                </div>
                <span
                  className={`order-history-badge status-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-history-meta">
                <div>
                  <strong>{order.total}</strong>
                  <span>Total</span>
                </div>
                <div>
                  <strong>{order.itemCount}</strong>
                  <span>Items</span>
                </div>
                <div>
                  <strong>{order.shipping}</strong>
                  <span>Fulfillment</span>
                </div>
              </div>

              <div className="order-history-items">
                {order.items.map((item) => (
                  <div key={item} className="order-history-item">
                    <span className="order-history-item-marker" aria-hidden="true" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <div className="order-history-actions">
                <Button variant="secondary">View details</Button>
                <Button to="/shop">Reorder similar</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <StateBlock
          icon="0"
          title="No orders for this filter"
          description="Try another order status to review previous purchases or return to the shop to place a new order."
          centered
          actions={<Button to="/shop">Return To Shop</Button>}
        />
      )}
    </PageShell>
  );
};

export default OrderHistory;
