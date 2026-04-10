import React, { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import '../styles/shop.css';
import { getShopProducts, getShopSummary } from '../services/productService';

const mainFilters = [
  { key: 'all', label: 'All Jerseys' },
  { key: 'football', label: 'Football' },
  { key: 'basketball', label: 'Basketball' },
];

const products = getShopProducts();
const summary = getShopSummary();

const formatPrice = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const sortProducts = (items, sortBy) => {
  const sorted = [...items];

  if (sortBy === 'price-low') {
    sorted.sort((left, right) => left.price - right.price);
  } else if (sortBy === 'price-high') {
    sorted.sort((left, right) => right.price - left.price);
  } else if (sortBy === 'alphabetical') {
    sorted.sort((left, right) => left.name.localeCompare(right.name));
  } else if (sortBy === 'team') {
    sorted.sort((left, right) => left.team.localeCompare(right.team));
  }

  return sorted;
};

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mainCategory, setMainCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(24);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [spotlightVisible, setSpotlightVisible] = useState(false);

  useEffect(() => {
    const enterTimeoutId = window.setTimeout(() => {
      setSpotlightVisible(true);
    }, 120);

    const intervalId = window.setInterval(() => {
      setSpotlightVisible(false);

      window.setTimeout(() => {
        setSpotlightIndex((currentIndex) => (currentIndex + 1) % products.length);
        setSpotlightVisible(true);
      }, 900);
    }, 5200);

    return () => {
      window.clearTimeout(enterTimeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setVisibleCount(24);
  }, [searchTerm, mainCategory, stockFilter, priceRange, sortBy]);

  const filteredProducts = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch = !trimmedSearch || product.searchText.includes(trimmedSearch);
      const matchesMainCategory = mainCategory === 'all' || product.sport === mainCategory;
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock' && product.inStock) ||
        (stockFilter === 'out-of-stock' && !product.inStock);
      const matchesPrice =
        priceRange === 'all' ||
        (priceRange === 'under-40' && product.price < 40) ||
        (priceRange === '40-60' && product.price >= 40 && product.price <= 60) ||
        (priceRange === 'over-60' && product.price > 60);

      return matchesSearch && matchesMainCategory && matchesStock && matchesPrice;
    });

    return sortProducts(filtered, sortBy);
  }, [mainCategory, priceRange, searchTerm, sortBy, stockFilter]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const spotlightProduct = products[spotlightIndex % products.length];

  return (
    <div className="shop-page">
      <section className="shop-hero">
        <div className="shop-hero-bg" />
        <div className="shop-hero-grid" />
        <div className="shop-hero-inner section-wrap">
          <div className="shop-hero-copy">
            <div className="shop-eyebrow">Official Team Store</div>
            <h1 className="shop-title">
              FIND THE
              <span> NEXT KIT</span>
            </h1>
            <p className="shop-subtitle">Fresh drops, classic shirts, and statement jerseys in one place.</p>
            <div className="shop-stat-row">
              <div className="shop-stat-card">
                <span className="shop-stat-value">{summary.clubCount}</span>
                <span className="shop-stat-label">Clubs</span>
              </div>
              <div className="shop-stat-card">
                <span className="shop-stat-value">{summary.countryCount}</span>
                <span className="shop-stat-label">Countries</span>
              </div>
              <div className="shop-stat-card">
                <span className="shop-stat-value">{summary.inStockCount}</span>
                <span className="shop-stat-label">In Stock</span>
              </div>
            </div>
            <div className="shop-hero-actions">
              <a className="cta-primary" href="#shop-catalog">
                Browse The Catalog
              </a>
            </div>
          </div>

          <div className="shop-spotlight-card">
            <div className="shop-spotlight-media">
              <div className={`shop-spotlight-image-shell${spotlightVisible ? ' is-visible' : ''}`}>
                <img
                  src={spotlightProduct.image}
                  alt={spotlightProduct.name}
                  className="shop-spotlight-image"
                />
              </div>
              {spotlightProduct.badge && (
                <span className={`shop-spotlight-badge shop-spotlight-badge-${spotlightProduct.badge}`}>
                  {spotlightProduct.badge}
                </span>
              )}
            </div>
            <div className="shop-spotlight-body">
              <div className={`shop-spotlight-content${spotlightVisible ? ' is-visible' : ''}`}>
                <div className="shop-spotlight-meta">
                  <span>{spotlightProduct.categoryLabel}</span>
                  <span>{spotlightProduct.season}</span>
                </div>
                <h2>{spotlightProduct.name}</h2>
                <p>{spotlightProduct.description}</p>
                <div className="shop-spotlight-footer">
                  <span className="shop-spotlight-price">{formatPrice(spotlightProduct.price)}</span>
                  <span className="shop-spotlight-team">{spotlightProduct.team}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shop-controls section-wrap">
        <div className="shop-controls-shell">
          <div className="shop-controls-copy">
            <div className="section-eyebrow">Refined Search</div>
            <h2 className="shop-panel-title">Find the jersey you want, fast.</h2>
          </div>

          <div className="shop-search-wrap">
            <SearchBar
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search kits, teams, years, or special editions..."
            />
          </div>

          <div className="shop-main-filters">
            {mainFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`shop-main-filter${mainCategory === filter.key ? ' active' : ''}`}
                onClick={() => setMainCategory(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="shop-subfilters">
            <label className="shop-select-group">
              <span>Status</span>
              <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
                <option value="all">All stock</option>
                <option value="in-stock">In stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </label>

            <label className="shop-select-group">
              <span>Price range</span>
              <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
                <option value="all">All prices</option>
                <option value="under-40">Under $40</option>
                <option value="40-60">$40 - $60</option>
                <option value="over-60">Over $60</option>
              </select>
            </label>

            <label className="shop-select-group">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="team">Team name</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section id="shop-catalog" className="shop-catalog section-wrap">
        <div className="section-header shop-results-header">
          <div>
            <div className="section-eyebrow">Catalog Results</div>
            <h2 className="section-title">
              Built For <span>Discovery</span>
            </h2>
          </div>
          <div className="shop-results-meta">
            Showing {visibleProducts.length} of {filteredProducts.length} matches
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="shop-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  sport={product.sportLabel}
                  club={product.team}
                  name={product.name}
                  price={product.price.toFixed(2)}
                  sizes={product.sizes.slice(0, 4)}
                  badge={product.badge}
                  image={product.image}
                  actionLabel="View Listing"
                  onAction={() => window.open(product.sourceUrl, '_blank', 'noopener,noreferrer')}
                />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="shop-load-more-wrap">
                <button
                  type="button"
                  className="shop-load-more"
                  onClick={() => setVisibleCount((currentCount) => currentCount + 24)}
                >
                  Load More Kits
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="shop-empty-state">
            <h3>No kits matched that combination.</h3>
            <p>Try a broader search or change one of the filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Shop;
