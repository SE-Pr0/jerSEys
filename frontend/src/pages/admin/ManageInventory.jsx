import React, { useMemo, useState } from 'react';
import { Button, Card, FormField } from '../../components/ui';
import AdminSuiteLayout from './AdminSuiteLayout';
import {
  adminSectionTabs,
  buildSearchBlob,
  getInitials,
  toneAvatarStyles,
  toneBadgeStyles,
  toneBarStyles,
  normalizeText,
} from './adminConstants';

const inventoryMetrics = [
  {
    label: 'Live SKUs',
    value: '486',
    trend: '+8 this month',
    trendTone: 'positive',
    note: 'Products listed and ready for fulfillment or purchase.',
    tone: 'royal',
  },
  {
    label: 'Low stock',
    value: '21',
    trend: '7 urgent',
    trendTone: 'warning',
    note: 'Items close to the reorder threshold and needing attention.',
    tone: 'orange',
  },
  {
    label: 'Out of stock',
    value: '6',
    trend: '2 critical',
    trendTone: 'negative',
    note: 'Products unavailable for immediate sale until replenished.',
    tone: 'crimson',
  },
  {
    label: 'Inventory value',
    value: '$421K',
    trend: '+1.9% this week',
    trendTone: 'positive',
    note: 'Estimated stock value based on landed product cost.',
    tone: 'green',
  },
];

const categoryFilters = [
  { value: 'all', label: 'All categories' },
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'custom', label: 'Custom' },
  { value: 'training', label: 'Training' },
];

const inventoryRows = [
  {
    product: 'Barcelona 24/25 Home Jersey',
    sku: 'FB-2418',
    category: 'Football',
    categoryKey: 'football',
    stock: '12 units',
    reorder: '24 units',
    vendor: 'Kit Supplier A',
    status: 'Low stock',
    statusTone: 'orange',
    avatarTone: 'crimson',
    lastCount: 'Today',
  },
  {
    product: 'Lakers City Edition Swingman',
    sku: 'BB-1934',
    category: 'Basketball',
    categoryKey: 'basketball',
    stock: '6 units',
    reorder: '18 units',
    vendor: 'Hoop Supply',
    status: 'Critical',
    statusTone: 'crimson',
    avatarTone: 'royal',
    lastCount: 'Today',
  },
  {
    product: 'Custom Arsenal Home Kit',
    sku: 'CS-8821',
    category: 'Custom',
    categoryKey: 'custom',
    stock: '4 units',
    reorder: '10 units',
    vendor: 'In-house print',
    status: 'Critical',
    statusTone: 'crimson',
    avatarTone: 'orange',
    lastCount: 'Yesterday',
  },
  {
    product: 'PSG Training Top Navy',
    sku: 'TR-1140',
    category: 'Training',
    categoryKey: 'training',
    stock: '0 units',
    reorder: '16 units',
    vendor: 'Athletic Base',
    status: 'Out of stock',
    statusTone: 'crimson',
    avatarTone: 'green',
    lastCount: 'Yesterday',
  },
  {
    product: 'Retro Brazil 2002 Shirt',
    sku: 'FB-2172',
    category: 'Football',
    categoryKey: 'football',
    stock: '9 units',
    reorder: '20 units',
    vendor: 'Kit Supplier B',
    status: 'Low stock',
    statusTone: 'orange',
    avatarTone: 'royal',
    lastCount: '2 days ago',
  },
  {
    product: 'Celtics Statement Edition',
    sku: 'BB-2009',
    category: 'Basketball',
    categoryKey: 'basketball',
    stock: '21 units',
    reorder: '12 units',
    vendor: 'Hoop Supply',
    status: 'Healthy',
    statusTone: 'green',
    avatarTone: 'green',
    lastCount: 'Today',
  },
  {
    product: 'Custom Liverpool Name Set',
    sku: 'CS-9012',
    category: 'Custom',
    categoryKey: 'custom',
    stock: '17 units',
    reorder: '8 units',
    vendor: 'In-house print',
    status: 'Healthy',
    statusTone: 'green',
    avatarTone: 'orange',
    lastCount: 'Today',
  },
  {
    product: 'Training Bib Pack',
    sku: 'TR-3321',
    category: 'Training',
    categoryKey: 'training',
    stock: '33 units',
    reorder: '18 units',
    vendor: 'Athletic Base',
    status: 'Healthy',
    statusTone: 'green',
    avatarTone: 'green',
    lastCount: '3 days ago',
  },
];

const stockHealth = [
  { label: 'Healthy', count: 409, share: 84, tone: 'green' },
  { label: 'Low stock', count: 57, share: 12, tone: 'orange' },
  { label: 'Critical', count: 14, share: 3, tone: 'crimson' },
  { label: 'Out of stock', count: 6, share: 1, tone: 'royal' },
];

const urgentRestocks = [
  {
    title: 'Barcelona 24/25 Home Jersey',
    detail: 'Only 12 units left against a reorder level of 24.',
    tone: 'orange',
  },
  {
    title: 'Lakers City Edition Swingman',
    detail: 'Stock is below immediate dispatch demand and needs a top-up.',
    tone: 'crimson',
  },
  {
    title: 'Custom Arsenal Home Kit',
    detail: 'Print queue needs blank stock replenishment before the weekend.',
    tone: 'crimson',
  },
];

const inventoryNotes = [
  'Manual count verification completed this morning.',
  'Training wear is stable, with no immediate reorder risk.',
  'Custom print stock should be replenished before the next drop.',
];

const ManageInventory = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredRows = useMemo(() => {
    const search = normalizeText(query);

    return inventoryRows.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.categoryKey === activeCategory;
      const matchesSearch = buildSearchBlob([
        item.product,
        item.sku,
        item.category,
        item.stock,
        item.reorder,
        item.vendor,
        item.status,
      ]).includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, query]);

  return (
    <AdminSuiteLayout
      actions={(
        <>
          <Button to="/admin/inventory-reports" variant="secondary">
            Stock reports
          </Button>
          <Button to="/admin/manage-orders">
            Orders
          </Button>
        </>
      )}
      className="admin-inventory-page"
      description="Watch stock levels, reorder thresholds, and item health without leaving the admin console."
      eyebrow="Admin Console"
      metrics={inventoryMetrics}
      tabs={adminSectionTabs}
      title={(
        <>
          Manage <span>Inventory</span>
        </>
      )}
    >
      <div className="admin-suite-workspace">
        <Card className="admin-suite-panel admin-suite-main-panel">
          <div className="admin-suite-toolbar">
            <FormField label="Search items" htmlFor="admin-inventory-search">
              <input
                className="ui-input"
                id="admin-inventory-search"
                placeholder="Search product, SKU, or vendor"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </FormField>

            <FormField label="Category" htmlFor="admin-inventory-category">
              <select
                className="ui-select"
                id="admin-inventory-category"
                value={activeCategory}
                onChange={(event) => setActiveCategory(event.target.value)}
              >
                {categoryFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="admin-suite-table-header">
            <div>
              <div className="admin-suite-kicker">Inventory control</div>
              <h2 className="admin-suite-table-title">
                {filteredRows.length} products in view
              </h2>
              <p className="admin-suite-table-subtitle">
                Keep the warehouse balanced by checking reorder levels and stock coverage daily.
              </p>
            </div>

            <div className="admin-suite-filter-group">
              <Button variant="secondary">Add stock</Button>
              <Button variant="ghost">Export CSV</Button>
            </div>
          </div>

          <div className="admin-suite-table-wrap">
            <table className="admin-suite-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>On hand</th>
                  <th>Reorder</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Last count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.sku}>
                    <td>
                      <div className="admin-suite-name-cell">
                        <span className="admin-suite-avatar" style={toneAvatarStyles[item.avatarTone]}>
                          {getInitials(item.product)}
                        </span>
                        <div>
                          <strong>{item.product}</strong>
                          <span className="admin-suite-subtext">{item.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-suite-pill" style={toneBadgeStyles[item.avatarTone]}>
                        {item.sku}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <strong>{item.stock}</strong>
                    </td>
                    <td>{item.reorder}</td>
                    <td>{item.vendor}</td>
                    <td>
                      <span className={`admin-suite-status is-${item.statusTone}`}>{item.status}</span>
                    </td>
                    <td>{item.lastCount}</td>
                    <td>
                      <div className="admin-suite-actions">
                        <Button className="admin-suite-inline-button" variant="ghost">
                          Restock
                        </Button>
                        <Button className="admin-suite-inline-button" variant="secondary">
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-suite-footnote">
            Showing {filteredRows.length} of {inventoryRows.length} items. Watch the low-stock queue before the next print run.
          </div>
        </Card>

        <div className="admin-suite-side-stack">
          <Card className="admin-suite-side-card">
            <div className="admin-suite-side-header">
              <div>
                <div className="admin-suite-kicker">Stock health</div>
                <h2 className="admin-suite-side-title">Coverage across the warehouse.</h2>
              </div>
            </div>

            <div className="admin-suite-bars">
              {stockHealth.map((item) => (
                <div className="admin-suite-bar-item" key={item.label}>
                  <div className="admin-suite-side-header">
                    <strong>{item.label}</strong>
                    <span className="admin-suite-table-count">{item.count} SKUs</span>
                  </div>
                  <div className="admin-suite-bar-track">
                    <div className="admin-suite-bar-fill" style={{ width: `${item.share}%`, ...toneBarStyles[item.tone] }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="admin-suite-side-card">
            <div className="admin-suite-side-header">
              <div>
                <div className="admin-suite-kicker">Urgent restocks</div>
                <h2 className="admin-suite-side-title">Replenishment watchlist.</h2>
              </div>
            </div>

            <div className="admin-suite-list">
              {urgentRestocks.map((item) => (
                <div className="admin-suite-list-item" key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                  <span className="admin-suite-pill" style={toneBadgeStyles[item.tone]}>
                    Restock
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="admin-suite-side-card">
            <div className="admin-suite-side-header">
              <div>
                <div className="admin-suite-kicker">Recent activity</div>
                <h2 className="admin-suite-side-title">Last inventory notes.</h2>
              </div>
            </div>

            <div className="admin-suite-list">
              {inventoryNotes.map((note) => (
                <div className="admin-suite-list-item" key={note}>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminSuiteLayout>
  );
};

export default ManageInventory;
