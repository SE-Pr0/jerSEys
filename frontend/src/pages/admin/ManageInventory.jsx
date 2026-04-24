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

const stockFilters = [
  { value: 'all', label: 'All stock levels' },
  { value: 'critical', label: 'Critical (5 or less)' },
  { value: 'low', label: 'Low (10 or less)' },
  { value: 'medium', label: 'Medium (11 to 20)' },
  { value: 'healthy', label: 'Healthy (21+)' },
];

const statusOptions = [
  { value: 'green', label: 'Healthy' },
  { value: 'orange', label: 'Low stock' },
  { value: 'crimson', label: 'Critical' },
];

const initialInventoryRows = [
  {
    product: 'Barcelona 24/25 Home Jersey',
    sku: 'FB-2418',
    category: 'Football',
    categoryKey: 'football',
    stock: '12 units',
    reorder: '24 units',
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
    status: 'Healthy',
    statusTone: 'green',
    avatarTone: 'green',
    lastCount: '3 days ago',
  },
];

const getStockUnits = (stockLabel) => Number.parseInt(String(stockLabel).replace(/[^\d]/g, ''), 10) || 0;
const formatUnits = (value) => `${Math.max(0, Number.parseInt(String(value), 10) || 0)} units`;

const getStatusFromStock = (stockUnits) => {
  if (stockUnits <= 0) {
    return { status: 'Out of stock', statusTone: 'crimson' };
  }

  if (stockUnits <= 5) {
    return { status: 'Critical', statusTone: 'crimson' };
  }

  if (stockUnits <= 10) {
    return { status: 'Low stock', statusTone: 'orange' };
  }

  return { status: 'Healthy', statusTone: 'green' };
};

const ManageInventory = () => {
  const [inventoryRows, setInventoryRows] = useState(initialInventoryRows);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStockFilter, setActiveStockFilter] = useState('all');
  const [editingSku, setEditingSku] = useState(null);
  const [draftItem, setDraftItem] = useState(null);

  const filteredRows = useMemo(() => {
    const search = normalizeText(query);

    return inventoryRows.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.categoryKey === activeCategory;
      const stockUnits = getStockUnits(item.stock);
      const matchesStockFilter =
        activeStockFilter === 'all' ||
        (activeStockFilter === 'critical' && stockUnits <= 5) ||
        (activeStockFilter === 'low' && stockUnits <= 10) ||
        (activeStockFilter === 'medium' && stockUnits >= 11 && stockUnits <= 20) ||
        (activeStockFilter === 'healthy' && stockUnits >= 21);
      const matchesSearch = buildSearchBlob([
        item.product,
        item.sku,
        item.category,
        item.stock,
        item.reorder,
        item.status,
      ]).includes(search);

      return matchesCategory && matchesStockFilter && matchesSearch;
    });
  }, [activeCategory, activeStockFilter, inventoryRows, query]);

  const handleOpenEditor = (item) => {
    setEditingSku(item.sku);
    setDraftItem({
      ...item,
      stockInput: String(getStockUnits(item.stock)),
      reorderInput: String(getStockUnits(item.reorder)),
    });
  };

  const handleCloseEditor = () => {
    setEditingSku(null);
    setDraftItem(null);
  };

  const handleDraftChange = (field, value) => {
    setDraftItem((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSaveItem = () => {
    if (!draftItem) {
      return;
    }

    const stockUnits = Math.max(0, Number.parseInt(String(draftItem.stockInput), 10) || 0);
    const reorderUnits = Math.max(0, Number.parseInt(String(draftItem.reorderInput), 10) || 0);
    const autoStatus = getStatusFromStock(stockUnits);
    const manualStatus = statusOptions.find((option) => option.value === draftItem.statusTone);

    const nextStatusTone = manualStatus?.value || autoStatus.statusTone;
    const nextStatus = manualStatus?.label || autoStatus.status;

    setInventoryRows((currentRows) =>
      currentRows.map((row) =>
        row.sku === editingSku
          ? {
            ...row,
            product: String(draftItem.product || '').trim() || row.product,
            sku: String(draftItem.sku || '').trim() || row.sku,
            categoryKey: draftItem.categoryKey || row.categoryKey,
            category:
              draftItem.categoryKey === 'basketball'
                ? 'Basketball'
                : draftItem.categoryKey === 'custom'
                  ? 'Custom'
                  : draftItem.categoryKey === 'training'
                    ? 'Training'
                    : 'Football',
            stock: formatUnits(stockUnits),
            reorder: formatUnits(reorderUnits),
            statusTone: nextStatusTone,
            status: stockUnits === 0 ? 'Out of stock' : nextStatus,
            lastCount: String(draftItem.lastCount || '').trim() || row.lastCount,
          }
          : row,
      ),
    );
    handleCloseEditor();
  };

  const handleRestock = (item) => {
    const currentUnits = getStockUnits(item.stock);
    const reorderUnits = getStockUnits(item.reorder);
    const nextUnits = currentUnits + reorderUnits;
    const nextStatus = getStatusFromStock(nextUnits);

    setInventoryRows((currentRows) =>
      currentRows.map((row) =>
        row.sku === item.sku
          ? {
            ...row,
            stock: formatUnits(nextUnits),
            status: nextStatus.status,
            statusTone: nextStatus.statusTone,
            lastCount: 'Just now',
          }
          : row,
      ),
    );
  };

  return (
    <AdminSuiteLayout
      className="admin-inventory-page"
      description="Watch stock levels, reorder thresholds, and item health without leaving the admin console."
      eyebrow="Admin Console"
      metrics={inventoryMetrics}
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
                placeholder="Search product or SKU"
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

            <FormField label="Amount left in stock" htmlFor="admin-inventory-stock-range">
              <select
                className="ui-select"
                id="admin-inventory-stock-range"
                value={activeStockFilter}
                onChange={(event) => setActiveStockFilter(event.target.value)}
              >
                {stockFilters.map((option) => (
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
                  <th>Status</th>
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
                    <td>
                      <span className={`admin-suite-status is-${item.statusTone}`}>{item.status}</span>
                    </td>
                    <td>
                      <div className="admin-suite-actions">
                        <Button
                          className="admin-suite-inline-button"
                          variant="ghost"
                          onClick={() => handleRestock(item)}
                        >
                          Restock
                        </Button>
                        <Button
                          className="admin-suite-inline-button"
                          variant="secondary"
                          onClick={() => handleOpenEditor(item)}
                        >
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
      </div>

      {draftItem ? (
        <div
          className="admin-inventory-editor-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-inventory-editor-title"
          onClick={handleCloseEditor}
        >
          <div className="admin-inventory-editor-modal ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-inventory-editor-head">
              <div>
                <div className="admin-suite-kicker">Inventory editor</div>
                <h2 className="admin-suite-table-title" id="admin-inventory-editor-title">
                  Edit {draftItem.product}
                </h2>
              </div>
              <Button variant="ghost" onClick={handleCloseEditor}>Close</Button>
            </div>

            <div className="admin-inventory-editor-form">
              <FormField label="Product" htmlFor="admin-inventory-edit-product">
                <input
                  className="ui-input"
                  id="admin-inventory-edit-product"
                  value={draftItem.product}
                  onChange={(event) => handleDraftChange('product', event.target.value)}
                />
              </FormField>

              <FormField label="SKU" htmlFor="admin-inventory-edit-sku">
                <input
                  className="ui-input"
                  id="admin-inventory-edit-sku"
                  value={draftItem.sku}
                  onChange={(event) => handleDraftChange('sku', event.target.value)}
                />
              </FormField>

              <FormField label="Category" htmlFor="admin-inventory-edit-category">
                <select
                  className="ui-select"
                  id="admin-inventory-edit-category"
                  value={draftItem.categoryKey}
                  onChange={(event) => handleDraftChange('categoryKey', event.target.value)}
                >
                  {categoryFilters.filter((option) => option.value !== 'all').map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Status" htmlFor="admin-inventory-edit-status">
                <select
                  className="ui-select"
                  id="admin-inventory-edit-status"
                  value={draftItem.statusTone}
                  onChange={(event) => handleDraftChange('statusTone', event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="On hand (units)" htmlFor="admin-inventory-edit-stock">
                <input
                  className="ui-input"
                  id="admin-inventory-edit-stock"
                  inputMode="numeric"
                  value={draftItem.stockInput}
                  onChange={(event) => handleDraftChange('stockInput', event.target.value)}
                />
              </FormField>

              <FormField label="Reorder level (units)" htmlFor="admin-inventory-edit-reorder">
                <input
                  className="ui-input"
                  id="admin-inventory-edit-reorder"
                  inputMode="numeric"
                  value={draftItem.reorderInput}
                  onChange={(event) => handleDraftChange('reorderInput', event.target.value)}
                />
              </FormField>

              <FormField label="Last count label" htmlFor="admin-inventory-edit-last-count">
                <input
                  className="ui-input"
                  id="admin-inventory-edit-last-count"
                  value={draftItem.lastCount}
                  onChange={(event) => handleDraftChange('lastCount', event.target.value)}
                />
              </FormField>
            </div>

            <div className="admin-inventory-editor-actions">
              <Button variant="ghost" onClick={handleCloseEditor}>Cancel</Button>
              <Button onClick={handleSaveItem}>Save item</Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminSuiteLayout>
  );
};

export default ManageInventory;
