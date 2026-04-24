import React, { useRef, useState } from 'react';
import { Button, Card, PageHeader, PageShell } from '../../components/ui';
import './AdminSuite.css';
import { toneBadgeStyles } from './adminConstants';
import ManageUsers from './ManageUsers';
import ManageOrders from './ManageOrders';
import ManageInventory from './ManageInventory';
import SalesReports from './SalesReports';
import InventoryReports from './InventoryReports';

const adminSections = [
  {
    id: 'dashboard',
    group: 'General',
    title: 'Dashboard',
    description: 'A live command center for users, orders, inventory, and active alerts.',
    status: 'Live',
    tone: 'royal',
    route: '/admin',
    chips: ['KPIs', 'Queues', 'Quick links'],
    details: [
      'Snapshot of the whole admin stack',
      'Fast entry into the most used workflows',
      'Highlights across sales, stock, and access',
    ],
  },
  {
    id: 'user-management',
    group: 'Sisyphus Ventures',
    title: 'User management',
    description: 'Review team accounts, permissions, invitations, and account health.',
    status: 'Live',
    tone: 'crimson',
    route: '/admin/manage-users',
    chips: ['Roles', 'Invites', 'Suspensions'],
    details: ['Access review and approvals', 'Role assignment', 'Account status checks'],
  },
  {
    id: 'manage-orders',
    group: 'Sisyphus Ventures',
    title: 'Manage orders',
    description: 'Track order queues, payments, shipping, and fulfillment progress.',
    status: 'Live',
    tone: 'orange',
    route: '/admin/manage-orders',
    chips: ['Queue', 'Payment', 'Fulfillment'],
    details: ['Pending and completed orders', 'Payment checks', 'Shipping labels'],
  },
  {
    id: 'manage-inventory',
    group: 'Sisyphus Ventures',
    title: 'Manage inventory',
    description: 'Monitor stock levels, reorder thresholds, and vendor restocks.',
    status: 'Live',
    tone: 'green',
    route: '/admin/manage-inventory',
    chips: ['Stock', 'Reorder', 'Vendor'],
    details: ['Low-stock flags', 'Replenishment list', 'Warehouse counts'],
  },
  {
    id: 'sales-reports',
    group: 'Sisyphus Ventures',
    title: 'Sales reports',
    description: 'Revenue, conversion, and order performance analytics.',
    status: 'Live',
    tone: 'royal',
    route: '/admin/sales-reports',
    chips: ['Revenue', 'AOV', 'Conversion'],
    details: ['Sales momentum', 'Category trends', 'Fulfillment metrics'],
  },
  {
    id: 'inventory-reports',
    group: 'Sisyphus Ventures',
    title: 'Inventory reports',
    description: 'Stock coverage, health score, and low-stock reporting.',
    status: 'Live',
    tone: 'orange',
    route: '/admin/inventory-reports',
    chips: ['Health', 'Coverage', 'Alerts'],
    details: ['Coverage windows', 'Health score', 'Urgent restocks'],
  },
  {
    id: 'manage-products',
    group: 'Sisyphus Ventures',
    title: 'Manage products',
    description: 'Catalog editing, pricing updates, and product visibility.',
    status: 'Planned',
    tone: 'crimson',
    chips: ['Catalog', 'Pricing', 'Visibility'],
    details: ['Product cards and variants', 'Price changes', 'Feature toggles'],
  },
  {
    id: 'manage-templates',
    group: 'Sisyphus Ventures',
    title: 'Manage templates',
    description: 'Pattern packs, jersey templates, and reusable design assets.',
    status: 'Planned',
    tone: 'royal',
    chips: ['Templates', 'Patterns', 'Assets'],
    details: ['Design presets', 'Pattern library', 'Reusable assets'],
  },
  {
    id: 'manage-trades',
    group: 'Sisyphus Ventures',
    title: 'Manage trades',
    description: 'Review trade listings and approval workflows.',
    status: 'Planned',
    tone: 'green',
    chips: ['Listings', 'Approvals', 'Review'],
    details: ['Trade moderation', 'Request handling', 'Listing review'],
  },
  {
    id: 'moderate-listings',
    group: 'Sisyphus Ventures',
    title: 'Moderate listings',
    description: 'Flagged content, review queues, and marketplace moderation.',
    status: 'Planned',
    tone: 'orange',
    chips: ['Flags', 'Queue', 'Reports'],
    details: ['Content moderation', 'Flag resolution', 'Marketplace safety'],
  },
];

const sidebarGroups = [
  {
    title: 'General',
    items: adminSections.filter((section) => section.group === 'General'),
  },
  {
    title: 'Sisyphus Ventures',
    items: adminSections.filter((section) => section.group === 'Sisyphus Ventures'),
  },
];

const routeToSectionId = adminSections.reduce(
  (accumulator, section) => {
    if (section.route) {
      accumulator[section.route] = section.id;
    }

    return accumulator;
  },
  { '/admin': 'dashboard' },
);
const embeddedSectionIds = new Set([
  'user-management',
  'manage-orders',
  'manage-inventory',
  'sales-reports',
  'inventory-reports',
]);

const AdminDashboard = () => {
  const mainRef = useRef(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  const groupedVisibleSections = sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items,
    }))
    .filter((group) => group.items.length > 0);

  const sidebarOptions = groupedVisibleSections.flatMap((group) => group.items);
  const groupedContentSections = groupedVisibleSections
    .map((group) => ({
      ...group,
      items: group.items.filter((section) => section.id !== 'dashboard'),
    }))
    .filter((group) => group.items.length > 0);
  const embeddedPanels = {
    'user-management': ManageUsers,
    'manage-orders': ManageOrders,
    'manage-inventory': ManageInventory,
    'sales-reports': SalesReports,
    'inventory-reports': InventoryReports,
  };
  const ActivePanel = embeddedPanels[activeSection];
  const isEmbeddedSection = (sectionId) => embeddedSectionIds.has(sectionId);

  const handleSidebarSelect = (sectionId) => {
    setActiveSection(sectionId);

    const mainElement = mainRef.current;
    if (!mainElement) {
      return;
    }

    if (isEmbeddedSection(sectionId)) {
      mainElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    const sectionElement = document.getElementById(sectionId);

    if (!sectionElement) {
      return;
    }

    mainElement.scrollTo({
      top: Math.max(sectionElement.offsetTop - 8, 0),
      behavior: 'smooth',
    });
  };

  const handleAdminLinkClick = (event) => {
    const anchor = event.target.closest('a[href]');

    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute('href');

    if (!href) {
      return;
    }

    const parsedHref = new URL(href, window.location.origin);
    const normalizedPath = parsedHref.pathname.replace(/\/+$/, '') || '/';
    if (!normalizedPath.startsWith('/admin')) {
      return;
    }

    const mappedSection = routeToSectionId[normalizedPath] || 'dashboard';

    event.preventDefault();
    event.stopPropagation();
    handleSidebarSelect(mappedSection);
  };

  return (
    <PageShell className="admin-suite-page admin-hub-page">
      <div className="admin-hub-shell ui-card">
        <aside className="admin-hub-sidebar" aria-label="Admin menu">
          <div className="admin-hub-sidebar-head">
            <strong>Admin Menu</strong>
          </div>

          <nav className="admin-hub-sidebar-menu" aria-label="Admin sections">
            {sidebarOptions.map((item) => (
              <button
                type="button"
                className={`admin-hub-sidebar-option${activeSection === item.id ? ' is-active' : ''}`}
                key={item.id}
                onClick={() => handleSidebarSelect(item.id)}
              >
                <span>{item.title}</span>
                {item.id === 'notifications' ? <em>4</em> : null}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-hub-main" ref={mainRef} onClickCapture={handleAdminLinkClick}>
          {!ActivePanel ? (
            <PageHeader
              title={(
                <>
                  Admin <span>Dashboard</span>
                </>
              )}
            />
          ) : null}

          {ActivePanel ? (
            <div className="admin-hub-embedded-view">
              <ActivePanel />
            </div>
          ) : (
            <div className="admin-hub-content">
              <div id="dashboard" />

              {groupedContentSections.map((group) => (
                <section className="admin-hub-group" key={group.title}>
                  <div className="admin-hub-section-grid">
                    {group.items.map((section) => (
                      <Card
                        className={`admin-hub-section-card tone-${section.tone}`}
                        id={section.id}
                        key={section.id}
                      >
                        <div className="admin-hub-section-head">
                          <div>
                            <div className="admin-suite-kicker">{section.group}</div>
                            <h3 className="admin-hub-section-title">{section.title}</h3>
                            <p className="admin-hub-section-subtitle">{section.description}</p>
                          </div>
                          <span className="admin-suite-pill" style={toneBadgeStyles[section.tone]}>
                            {section.status}
                          </span>
                        </div>

                        <div className="admin-hub-chip-list" aria-label={`${section.title} highlights`}>
                          {section.chips.map((chip) => (
                            <span className="admin-hub-chip" key={chip} style={toneBadgeStyles[section.tone]}>
                              {chip}
                            </span>
                          ))}
                        </div>

                        <div className="admin-hub-section-list">
                          {section.details.map((detail) => (
                            <div className="admin-hub-section-item" key={detail}>
                              <span className="admin-hub-section-dot" aria-hidden="true" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>

                        <div className="admin-hub-section-actions">
                          {section.route ? (
                            <Button onClick={() => handleSidebarSelect(section.id)}>Open page</Button>
                          ) : (
                            <Button disabled variant="secondary">
                              Coming soon
                            </Button>
                          )}
                          <Button variant="ghost" onClick={() => handleSidebarSelect(section.id)}>
                            Focus section
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageShell>
  );
};

export default AdminDashboard;
