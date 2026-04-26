import React, { useMemo, useState } from 'react';
import { Button, Card, FormField } from '../../components/ui';
import { getShopProducts } from '../../services/productService';
import AdminModalPortal from './AdminModalPortal';
import AdminSuiteLayout from './AdminSuiteLayout';
import { buildSearchBlob, getInitials, normalizeText, toneAvatarStyles, toneBadgeStyles } from './adminConstants';

const productMetrics = [
  {
    label: 'Live products',
    value: '486',
    trend: '+14 this month',
    trendTone: 'positive',
    note: 'Active products currently visible on the storefront.',
    tone: 'royal',
  },
  {
    label: 'Catalog edits',
    value: '38',
    trend: '12 pending publish',
    trendTone: 'warning',
    note: 'Products with draft updates to titles, images, or variants.',
    tone: 'orange',
  },
  {
    label: 'Price changes',
    value: '27',
    trend: '6 need approval',
    trendTone: 'warning',
    note: 'Recent and upcoming price updates across categories.',
    tone: 'crimson',
  },
  {
    label: 'Hidden products',
    value: '19',
    trend: '-3 this week',
    trendTone: 'positive',
    note: 'Products not visible on storefront while retained in catalog.',
    tone: 'green',
  },
];

const categoryFilters = [
  { value: 'all', label: 'All categories' },
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
];

const visibilityFilters = [
  { value: 'all', label: 'All visibility states' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
];

const catalogEditStates = ['Live', 'Draft', 'Variant update', 'Image update', 'Metadata update', 'Copy refresh'];

const toneCycle = ['royal', 'orange', 'crimson', 'green'];

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '$0.00';
  }

  return `$${numeric.toFixed(2)}`;
};

const getSizesSummary = (sizes) => {
  if (!sizes || sizes.length === 0) {
    return 'No sizes';
  }

  if (sizes.length <= 3) {
    return sizes.join(', ');
  }

  return `${sizes.slice(0, 3).join(', ')} +${sizes.length - 3}`;
};

const parseSizes = (value) =>
  String(value || '')
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean)
    .map((size) => size.toUpperCase());

const toAdminProducts = () =>
  getShopProducts().map((product, index) => {
    const avatarTone = toneCycle[index % toneCycle.length];
    const catalogState = catalogEditStates[index % catalogEditStates.length];
    const isVisible = index % 8 !== 0;

    return {
      id: product.id,
      sku: `PD-${String(index + 1001).padStart(4, '0')}`,
      name: product.name,
      team: product.team,
      category: product.sportLabel,
      categoryKey: product.sport,
      priceValue: Number(product.price) || 0,
      price: formatPrice(product.price),
      description: product.description || '',
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      image: product.image || '',
      sourceUrl: product.sourceUrl || '',
      catalogState,
      catalogTone: catalogState === 'Live' ? 'green' : 'orange',
      visibility: isVisible ? 'Visible' : 'Hidden',
      visibilityKey: isVisible ? 'visible' : 'hidden',
      visibilityTone: isVisible ? 'green' : 'crimson',
      avatarTone,
    };
  });

const ManageProducts = () => {
  const [products, setProducts] = useState(() => toAdminProducts());
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeVisibility, setActiveVisibility] = useState('all');
  const [editingProductId, setEditingProductId] = useState(null);
  const [draftProduct, setDraftProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    const search = normalizeText(query);

    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.categoryKey === activeCategory;
      const matchesVisibility = activeVisibility === 'all' || product.visibilityKey === activeVisibility;
      const matchesSearch = buildSearchBlob([
        product.name,
        product.team,
        product.sku,
        product.category,
        product.price,
        product.description,
        product.sizes,
        product.catalogState,
        product.visibility,
      ]).includes(search);

      return matchesCategory && matchesVisibility && matchesSearch;
    });
  }, [activeCategory, activeVisibility, products, query]);

  const handleOpenEditor = (product) => {
    setEditingProductId(product.id);
    setDraftProduct({
      ...product,
      sizesInput: product.sizes.join(', '),
      priceInput: String(product.priceValue.toFixed(2)),
    });
  };

  const handleCloseEditor = () => {
    setEditingProductId(null);
    setDraftProduct(null);
  };

  const handleDraftChange = (field, value) => {
    setDraftProduct((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSaveProduct = () => {
    if (!draftProduct) {
      return;
    }

    const nextPrice = Number(draftProduct.priceInput);
    const nextSizes = parseSizes(draftProduct.sizesInput);
    const normalizedVisibility = draftProduct.visibilityKey === 'hidden' ? 'hidden' : 'visible';

    const updatedProduct = {
      ...draftProduct,
      priceValue: Number.isFinite(nextPrice) ? nextPrice : draftProduct.priceValue,
      price: formatPrice(Number.isFinite(nextPrice) ? nextPrice : draftProduct.priceValue),
      sizes: nextSizes,
      visibilityKey: normalizedVisibility,
      visibility: normalizedVisibility === 'visible' ? 'Visible' : 'Hidden',
      visibilityTone: normalizedVisibility === 'visible' ? 'green' : 'crimson',
      categoryKey: draftProduct.categoryKey || 'football',
      category: draftProduct.categoryKey === 'basketball' ? 'Basketball' : 'Football',
      catalogTone: draftProduct.catalogState === 'Live' ? 'green' : 'orange',
    };

    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === editingProductId ? updatedProduct : product)),
    );
    handleCloseEditor();
  };

  return (
    <AdminSuiteLayout
      className="admin-products-page"
      description="Manage catalog editing, pricing updates, and product visibility from one control surface."
      eyebrow="Admin Console"
      metrics={productMetrics}
      title={(
        <>
          Manage <span>Products</span>
        </>
      )}
    >
      <div className="admin-suite-workspace">
        <Card className="admin-suite-panel admin-suite-main-panel">
          <div className="admin-suite-toolbar">
            <FormField label="Search products" htmlFor="admin-product-search">
              <input
                className="ui-input"
                id="admin-product-search"
                placeholder="Search product, SKU, team, or description"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </FormField>

            <FormField label="Category" htmlFor="admin-product-category">
              <select
                className="ui-select"
                id="admin-product-category"
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

            <FormField label="Visibility" htmlFor="admin-product-visibility">
              <select
                className="ui-select"
                id="admin-product-visibility"
                value={activeVisibility}
                onChange={(event) => setActiveVisibility(event.target.value)}
              >
                {visibilityFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="admin-suite-table-header">
            <div>
              <div className="admin-suite-kicker">Product control</div>
              <h2 className="admin-suite-table-title">
                {filteredProducts.length} products in view
              </h2>
            </div>
          </div>

          <div className="admin-suite-table-wrap">
            <table className="admin-suite-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Sizes</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-suite-name-cell">
                        <span className="admin-suite-avatar" style={toneAvatarStyles[product.avatarTone]}>
                          {getInitials(product.name)}
                        </span>
                        <div>
                          <strong>{product.name}</strong>
                          <span className="admin-suite-subtext">{product.team}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-suite-pill" style={toneBadgeStyles[product.avatarTone]}>
                        {product.sku}
                      </span>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <span className="admin-suite-subtext">{getSizesSummary(product.sizes)}</span>
                    </td>
                    <td>
                      <strong>{product.price}</strong>
                    </td>
                    <td>
                      <div className="admin-suite-actions">
                        <Button className="admin-suite-inline-button" onClick={() => handleOpenEditor(product)}>
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
            Showing {filteredProducts.length} of {products.length} products. Use edit mode to manage full product details.
          </div>
        </Card>
      </div>

      {draftProduct ? (
        <AdminModalPortal>
          <div
            className="admin-product-editor-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-product-editor-title"
            onClick={handleCloseEditor}
          >
            <div className="admin-product-editor-modal ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-product-editor-head">
              <div>
                <div className="admin-suite-kicker">Product editor</div>
                <h2 className="admin-suite-table-title" id="admin-product-editor-title">
                  Edit {draftProduct.name}
                </h2>
              </div>
              <Button variant="ghost" onClick={handleCloseEditor}>
                Close
              </Button>
            </div>

            <div className="admin-product-editor-content">
              <div className="admin-product-editor-preview">
                <div className="admin-product-preview-image-wrap">
                  <img
                    className="admin-product-preview-image"
                    src={draftProduct.image}
                    alt={draftProduct.name}
                  />
                </div>
                <div className="admin-product-preview-meta">
                  <strong>{draftProduct.name}</strong>
                  <span>{draftProduct.team}</span>
                  <span>{draftProduct.sku}</span>
                  <span>{draftProduct.price}</span>
                  <span>{draftProduct.visibility}</span>
                  {draftProduct.sourceUrl ? (
                    <a href={draftProduct.sourceUrl} target="_blank" rel="noreferrer">
                      Source product page
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="admin-product-editor-form">
                <FormField label="Product name" htmlFor="admin-edit-name">
                  <input
                    className="ui-input"
                    id="admin-edit-name"
                    value={draftProduct.name}
                    onChange={(event) => handleDraftChange('name', event.target.value)}
                  />
                </FormField>

                <FormField label="Price (USD)" htmlFor="admin-edit-price">
                  <input
                    className="ui-input"
                    id="admin-edit-price"
                    inputMode="decimal"
                    value={draftProduct.priceInput}
                    onChange={(event) => handleDraftChange('priceInput', event.target.value)}
                  />
                </FormField>

                <FormField label="Category" htmlFor="admin-edit-category">
                  <select
                    className="ui-select"
                    id="admin-edit-category"
                    value={draftProduct.categoryKey}
                    onChange={(event) => handleDraftChange('categoryKey', event.target.value)}
                  >
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                  </select>
                </FormField>

                <FormField label="Visibility" htmlFor="admin-edit-visibility">
                  <select
                    className="ui-select"
                    id="admin-edit-visibility"
                    value={draftProduct.visibilityKey}
                    onChange={(event) => handleDraftChange('visibilityKey', event.target.value)}
                  >
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </FormField>

                <FormField label="Catalog state" htmlFor="admin-edit-catalog-state">
                  <select
                    className="ui-select"
                    id="admin-edit-catalog-state"
                    value={draftProduct.catalogState}
                    onChange={(event) => handleDraftChange('catalogState', event.target.value)}
                  >
                    {catalogEditStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Sizes (comma separated)" htmlFor="admin-edit-sizes">
                  <input
                    className="ui-input"
                    id="admin-edit-sizes"
                    value={draftProduct.sizesInput}
                    onChange={(event) => handleDraftChange('sizesInput', event.target.value)}
                  />
                </FormField>

                <FormField label="Image URL" htmlFor="admin-edit-image">
                  <input
                    className="ui-input"
                    id="admin-edit-image"
                    value={draftProduct.image}
                    onChange={(event) => handleDraftChange('image', event.target.value)}
                  />
                </FormField>

                <FormField label="Description" htmlFor="admin-edit-description">
                  <textarea
                    className="ui-textarea"
                    id="admin-edit-description"
                    value={draftProduct.description}
                    onChange={(event) => handleDraftChange('description', event.target.value)}
                  />
                </FormField>
              </div>
            </div>

              <div className="admin-product-editor-actions">
                <Button variant="secondary" onClick={handleCloseEditor}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct}>Save changes</Button>
              </div>
            </div>
          </div>
        </AdminModalPortal>
      ) : null}
    </AdminSuiteLayout>
  );
};

export default ManageProducts;
