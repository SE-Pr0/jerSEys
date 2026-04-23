import React from 'react';
import { Button, Card, PageHeader } from '../../components/ui';
import AdminSuiteLayout from './AdminSuiteLayout';
import { adminSectionTabs, getInitials, toneAvatarStyles, toneBadgeStyles, toneBarStyles } from './adminConstants';

const dashboardMetrics = [
  {
    label: 'Users managed',
    value: '1,248',
    trend: '+62 this month',
    trendTone: 'positive',
    note: 'Team accounts and customer records across the storefront.',
    tone: 'royal',
  },
  {
    label: 'Open orders',
    value: '318',
    trend: '24 need review',
    trendTone: 'warning',
    note: 'Processing and fulfillment queues waiting for action.',
    tone: 'orange',
  },
  {
    label: 'Inventory SKUs',
    value: '486',
    trend: '21 low stock',
    trendTone: 'warning',
    note: 'Products monitored for restock and replenishment.',
    tone: 'crimson',
  },
  {
    label: 'Alerts resolved',
    value: '94%',
    trend: '+7% faster',
    trendTone: 'positive',
    note: 'Operational issues being cleared before they impact sales.',
    tone: 'green',
  },
];

const launchCards = [
  {
    title: 'Manage Users',
    to: '/admin/manage-users',
    eyebrow: 'Accounts',
    meta: 'Permissions, approvals, and account health',
    tone: 'royal',
    note: 'Review access, suspend risky accounts, and approve new team members.',
  },
  {
    title: 'Manage Orders',
    to: '/admin/manage-orders',
    eyebrow: 'Operations',
    meta: 'Status, payment, and fulfillment tracking',
    tone: 'orange',
    note: 'Work through queues, payment checks, and shipping progress.',
  },
  {
    title: 'Manage Inventory',
    to: '/admin/manage-inventory',
    eyebrow: 'Stock',
    meta: 'Levels, reorders, and product health',
    tone: 'green',
    note: 'Spot low-stock products and push the next restock wave.',
  },
];

const quickStatus = [
  { label: 'Sales reports', value: 'Live', tone: 'green', to: '/admin/sales-reports' },
  { label: 'Inventory reports', value: 'Live', tone: 'green', to: '/admin/inventory-reports' },
  { label: 'Pending reviews', value: '12', tone: 'orange' },
  { label: 'Urgent flags', value: '4', tone: 'crimson' },
];

const recentNotes = [
  'Two premium custom orders are ready for approval.',
  'One batch of basketball jerseys needs a stock verification pass.',
  'A bulk user invite wave is scheduled for this afternoon.',
];

const AdminDashboard = () => {
  return (
    <AdminSuiteLayout
      actions={(
        <>
          <Button to="/admin/manage-users" variant="secondary">
            Users
          </Button>
          <Button to="/admin/manage-orders">
            Orders
          </Button>
        </>
      )}
      className="admin-dashboard-page"
      description="Central command for user access, order flow, and inventory health."
      eyebrow="Admin Console"
      metrics={dashboardMetrics}
      tabs={adminSectionTabs}
      title={(
        <>
          Admin <span>Dashboard</span>
        </>
      )}
    >
      <div className="admin-suite-dashboard-grid">
        <Card className="admin-suite-panel">
          <div className="admin-suite-side-header">
            <div>
              <div className="admin-suite-kicker">Launchpad</div>
              <h2 className="admin-suite-side-title">Jump into the core management flows.</h2>
              <p className="admin-suite-side-subtitle">
                Use the same editorial styling as the rest of the site while keeping the admin tools easy to scan.
              </p>
            </div>
          </div>

          <div className="admin-suite-link-grid">
            {launchCards.map((card) => (
              <Card
                as="a"
                className={`admin-suite-link-card tone-${card.tone}`}
                href={card.to}
                key={card.title}
                interactive
              >
                <div className="admin-suite-link-eyebrow">{card.eyebrow}</div>
                <strong>{card.title}</strong>
                <p>{card.note}</p>
                <div className="admin-suite-link-foot">
                  <span className="admin-suite-link-meta">{card.meta}</span>
                  <span className="admin-suite-pill" style={toneBadgeStyles[card.tone]}>
                    Open
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <div className="admin-suite-dashboard-stack">
          <Card className="admin-suite-side-card">
            <div className="admin-suite-side-header">
              <div>
                <div className="admin-suite-kicker">System pulse</div>
                <h2 className="admin-suite-side-title">What needs attention now.</h2>
              </div>
            </div>
            <div className="admin-suite-dashboard-quicklinks">
              {quickStatus.map((item) => (
                <div className="admin-suite-dashboard-quicklink" key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <div className="admin-suite-footnote">Current status and short-term priority.</div>
                  </div>
                  <span className="admin-suite-status" style={toneBadgeStyles[item.tone || 'royal']}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="admin-suite-side-card">
            <div className="admin-suite-side-header">
              <div>
                <div className="admin-suite-kicker">Recent notes</div>
                <h2 className="admin-suite-side-title">Latest admin updates.</h2>
              </div>
            </div>
            <div className="admin-suite-list">
              {recentNotes.map((note, index) => (
                <div className="admin-suite-list-item" key={note}>
                  <strong>Update {index + 1}</strong>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="admin-suite-side-card">
            <div className="admin-suite-side-header">
              <div>
                <div className="admin-suite-kicker">Support</div>
                <h2 className="admin-suite-side-title">Team snapshot.</h2>
              </div>
            </div>
            <div className="admin-suite-list">
              <div className="admin-suite-list-item">
                <strong>Flora Shaw</strong>
                <span>Admin lead and access reviewer.</span>
              </div>
              <div className="admin-suite-list-item">
                <strong>Account coverage</strong>
                <span>2FA enabled for 94% of active staff accounts.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminSuiteLayout>
  );
};

export default AdminDashboard;
