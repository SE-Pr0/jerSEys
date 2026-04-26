import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, PageHeader, PageShell, StateBlock } from '../components/ui';
import { cancelOrder, getOrders } from '../services/orderService';
import '../styles/order-history.css';

const statusOptions = ['All', 'Pending', 'Cancelled'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });

const OrderHistory = () => {
  const [activeStatus, setActiveStatus] = useState('All');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextOrders = await getOrders();
        if (isMounted) {
          setOrders(nextOrders);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || 'Failed to load orders.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const orderSummary = useMemo(() => [
    { value: String(orders.filter((order) => order.status === 'pending').length), label: 'In progress' },
    { value: String(orders.filter((order) => order.status === 'cancelled').length), label: 'Cancelled' },
    { value: formatCurrency(orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0)), label: 'Total spent' },
  ], [orders]);

  const filteredOrders = useMemo(() => {
    if (activeStatus === 'All') {
      return orders;
    }

    return orders.filter((order) => order.status.toLowerCase() === activeStatus.toLowerCase());
  }, [activeStatus, orders]);

  const handleCancelOrder = async (orderId) => {
    try {
      const updatedOrder = await cancelOrder(orderId);
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
      );
    } catch (error) {
      setLoadError(error.message || 'Failed to cancel order.');
    }
  };

  return (
    <PageShell className="order-history-page">
      <div className="order-history-top-section">
        <PageHeader
          eyebrow="Purchase Archive"
          title={(
            <>
              Your
              <br />
              <span>Orders</span>
            </>
          )}
          description={(
            <>
              Track past purchases, check fulfillment,
              <br />
              and revisit every jersey already in your rotation.
            </>
          )}
        />

        <Card className="order-history-card order-history-overview-card">
          <div className="order-history-section-heading">
            <div>
              <p className="order-history-kicker">Account activity</p>
              <h2>Order history</h2>
            </div>
          </div>

          <div className="order-history-summary">
            {orderSummary.map((item) => (
              <div key={item.label} className="order-history-stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="order-history-overview-actions">
            <Button variant="secondary" to="/shop">
              Shop Again
            </Button>
            <Button>Download Invoice</Button>
          </div>
        </Card>
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

      {isLoading ? (
        <StateBlock centered icon="..." title="Loading orders" description="Fetching your order history from the backend." />
      ) : loadError ? (
        <StateBlock centered icon="!" title="Unable to load orders" description={loadError} />
      ) : filteredOrders.length ? (
        <div className="order-history-list">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="order-history-card">
              <div className="order-history-card-top">
                <div>
                  <p className="order-history-kicker">Order #{order.id}</p>
                  <h2>{formatDate(order.created_at)}</h2>
                </div>
                <span className={`order-history-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-history-meta">
                <div>
                  <strong>{formatCurrency(order.total_price)}</strong>
                  <span>Total</span>
                </div>
                <div>
                  <strong>{order.status}</strong>
                  <span>Status</span>
                </div>
              </div>

              <div className="order-history-actions">
                {order.status === 'pending' ? (
                  <Button variant="secondary" onClick={() => handleCancelOrder(order.id)}>
                    Cancel order
                  </Button>
                ) : (
                  <Button variant="secondary">View details</Button>
                )}
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
