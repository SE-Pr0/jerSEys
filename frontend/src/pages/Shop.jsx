import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import '../styles/shop.css';
import { getShopProducts, getShopSummary } from '../services/productService';

const sportFilters = [
  { key: 'all', label: 'All' },
  { key: 'football', label: 'Football' },
  { key: 'basketball', label: 'Basketball' },
];

const products = getShopProducts();
const summary = getShopSummary();
const availableSizes = [...new Set(products.flatMap((product) => product.sizes))].sort((left, right) => {
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
  const leftIndex = sizeOrder.indexOf(left);
  const rightIndex = sizeOrder.indexOf(right);

  if (leftIndex === -1 && rightIndex === -1) {
    return left.localeCompare(right);
  }

  if (leftIndex === -1) {
    return 1;
  }

  if (rightIndex === -1) {
    return -1;
  }

  return leftIndex - rightIndex;
});
const productPrices = products.map((product) => product.price);
const absoluteMinPrice = Math.floor(Math.min(...productPrices));
const absoluteMaxPrice = Math.ceil(Math.max(...productPrices));
const MIN_PRICE_GAP = 1;

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

const truncateText = (value, maxLength = 120) => {
  if (!value || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
};

const interleaveBySport = (items) => {
  const football = items.filter((item) => item.sport === 'football');
  const basketball = items.filter((item) => item.sport === 'basketball');
  const mixed = [];
  const maxLength = Math.max(football.length, basketball.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (football[index]) {
      mixed.push(football[index]);
    }

    if (basketball[index]) {
      mixed.push(basketball[index]);
    }
  }

  return mixed;
};

const clampPrice = (value) => {
  if (Number.isNaN(value)) {
    return absoluteMinPrice;
  }

  return Math.min(Math.max(value, absoluteMinPrice), absoluteMaxPrice);
};

const parseInputPrice = (value, fallback) => {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const CountUpValue = ({ target, duration = 2200, delay = 650 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frameId;
    let timeoutId;

    const startAnimation = () => {
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        setCount(Math.round(target * easedProgress));

        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        }
      };

      frameId = requestAnimationFrame(tick);
    };

    timeoutId = window.setTimeout(startAnimation, delay);

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(frameId);
    };
  }, [target, duration, delay]);

  return count;
};

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [mainCategory, setMainCategory] = useState('all');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [minPriceInput, setMinPriceInput] = useState(String(absoluteMinPrice));
  const [maxPriceInput, setMaxPriceInput] = useState(String(absoluteMaxPrice));
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(24);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [spotlightVisible, setSpotlightVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextSport = params.get('sport');
    const nextCategory = params.get('category');

    if (nextSport === 'football' || nextSport === 'basketball' || nextSport === 'all') {
      setMainCategory(nextSport);
    } else {
      setMainCategory('all');
    }

    if (nextCategory === 'club' || nextCategory === 'national' || nextCategory === 'all') {
      setCatalogCategory(nextCategory);
    } else {
      setCatalogCategory('all');
    }
  }, [location.search]);

  useEffect(() => {
    if (location.hash !== '#shop-catalog') {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const catalogSection = document.getElementById('shop-catalog');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, location.search]);

  const minPrice = useMemo(() => {
    const parsedMin = clampPrice(parseInputPrice(minPriceInput, absoluteMinPrice));
    const parsedMax = clampPrice(parseInputPrice(maxPriceInput, absoluteMaxPrice));
    return Math.min(parsedMin, parsedMax - MIN_PRICE_GAP);
  }, [minPriceInput, maxPriceInput]);

  const maxPrice = useMemo(() => {
    const parsedMin = clampPrice(parseInputPrice(minPriceInput, absoluteMinPrice));
    const parsedMax = clampPrice(parseInputPrice(maxPriceInput, absoluteMaxPrice));
    return Math.max(parsedMax, parsedMin + MIN_PRICE_GAP);
  }, [minPriceInput, maxPriceInput]);

  const spotlightProducts = useMemo(() => {
    if (mainCategory === 'football') {
      return products.filter((product) => product.sport === 'football');
    }

    if (mainCategory === 'basketball') {
      return products.filter((product) => product.sport === 'basketball');
    }

    return interleaveBySport(products);
  }, [mainCategory]);

  useEffect(() => {
    setSpotlightIndex(0);
  }, [mainCategory]);

  useEffect(() => {
    if (!spotlightProducts.length) {
      return undefined;
    }

    const enterTimeoutId = window.setTimeout(() => {
      setSpotlightVisible(true);
    }, 120);

    const intervalId = window.setInterval(() => {
      setSpotlightVisible(false);

      window.setTimeout(() => {
        setSpotlightIndex((currentIndex) => (currentIndex + 1) % spotlightProducts.length);
        setSpotlightVisible(true);
      }, 900);
    }, 5200);

    return () => {
      window.clearTimeout(enterTimeoutId);
      window.clearInterval(intervalId);
    };
  }, [spotlightProducts]);

  useEffect(() => {
    setVisibleCount(24);
  }, [mainCategory, catalogCategory, searchTerm, sizeFilter, stockFilter, minPrice, maxPrice, sortBy]);

  const handleMinPriceInput = (event) => {
    setMinPriceInput(event.target.value);
  };

  const handleMaxPriceInput = (event) => {
    setMaxPriceInput(event.target.value);
  };

  const normalizeMinPriceInput = () => {
    setMinPriceInput(String(minPrice));
  };

  const normalizeMaxPriceInput = () => {
    setMaxPriceInput(String(maxPrice));
  };

  const handleMinPriceSlider = (event) => {
    const nextValue = clampPrice(Number(event.target.value));
    setMinPriceInput(String(Math.min(nextValue, maxPrice - MIN_PRICE_GAP)));
  };

  const handleMaxPriceSlider = (event) => {
    const nextValue = clampPrice(Number(event.target.value));
    setMaxPriceInput(String(Math.max(nextValue, minPrice + MIN_PRICE_GAP)));
  };

  const filteredProducts = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch = !trimmedSearch || product.searchText.includes(trimmedSearch);
      const matchesCatalogCategory =
        mainCategory === 'all' || product.sport === mainCategory;
      const matchesCategory = catalogCategory === 'all' || product.category === catalogCategory;
      const matchesSize = sizeFilter === 'all' || product.sizes.includes(sizeFilter);
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock' && product.inStock) ||
        (stockFilter === 'out-of-stock' && !product.inStock);
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

      return matchesSearch && matchesCatalogCategory && matchesCategory && matchesSize && matchesStock && matchesPrice;
    });

    const sorted = sortProducts(filtered, sortBy);

    if (mainCategory === 'all' && catalogCategory === 'all' && sortBy === 'featured') {
      return interleaveBySport(sorted);
    }

    return sorted;
  }, [mainCategory, catalogCategory, minPrice, maxPrice, searchTerm, sizeFilter, sortBy, stockFilter]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const spotlightProduct = spotlightProducts[spotlightIndex % spotlightProducts.length] || products[0];
  const priceRangeSpan = absoluteMaxPrice - absoluteMinPrice || 1;
  const minPercent = ((minPrice - absoluteMinPrice) / priceRangeSpan) * 100;
  const maxPercent = ((maxPrice - absoluteMinPrice) / priceRangeSpan) * 100;

  return (
    <div className="shop-page">
      <section className="shop-hero">
        <div className="shop-hero-bg" />
        <div className="shop-hero-grid" />
        <div className="shop-hero-inner section-wrap">
          <div className="shop-hero-copy">
            <div className="shop-eyebrow">Official Team Store</div>
            <h1 className="shop-title">
              FIND YOUR
              <span> NEXT JERSEY</span>
            </h1>
            <p className="shop-subtitle">Fresh drops, classic shirts, and statement jerseys in one place.</p>
            <div className="shop-stat-row">
              <div className="shop-stat-card">
                <span className="shop-stat-value">
                  <CountUpValue target={summary.clubCount} />
                </span>
                <span className="shop-stat-label">Clubs</span>
              </div>
              <div className="shop-stat-card">
                <span className="shop-stat-value">
                  <CountUpValue target={summary.countryCount} />
                </span>
                <span className="shop-stat-label">Countries</span>
              </div>
              <div className="shop-stat-card">
                <span className="shop-stat-value">
                  <CountUpValue target={summary.inStockCount} />
                </span>
                <span className="shop-stat-label">In Stock</span>
              </div>
            </div>
            <div className="shop-hero-actions">
              <a className="cta-primary" href="#shop-catalog">
                Browse The Catalog
              </a>
            </div>
          </div>

          <div
            className="shop-spotlight-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/shop/${spotlightProduct.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate(`/shop/${spotlightProduct.id}`);
              }
            }}
          >
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
                <p>{truncateText(spotlightProduct.description, 120)}</p>
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

          <div className="shop-filter-row">
            <div className="shop-main-filters" role="group" aria-label="Sport category">
              {sportFilters.map((filter) => (
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
                <span>Category</span>
                <select value={catalogCategory} onChange={(event) => setCatalogCategory(event.target.value)}>
                  <option value="all">All</option>
                  <option value="club">Club</option>
                  <option value="national">Country</option>
                </select>
              </label>

              <label className="shop-select-group">
                <span>Size</span>
                <select value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)}>
                  <option value="all">All sizes</option>
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <label className="shop-select-group">
                <span>Status</span>
                <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
                  <option value="all">All stock</option>
                  <option value="in-stock">In stock</option>
                  <option value="out-of-stock">Out of stock</option>
                </select>
              </label>

              <label className="shop-select-group">
                <span>Sort by</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="team">Team name</option>
                </select>
              </label>

              <label className="shop-select-group shop-select-group-price">
                <span>Price range</span>
                <div className="shop-price-range">
                  <div className="shop-price-inputs">
                    <label className="shop-price-input-shell">
                      <span>$</span>
                      <input
                        type="number"
                        value={minPriceInput}
                        onChange={handleMinPriceInput}
                        onBlur={normalizeMinPriceInput}
                      />
                    </label>
                    <label className="shop-price-input-shell">
                      <span>$</span>
                      <input
                        type="number"
                        value={maxPriceInput}
                        onChange={handleMaxPriceInput}
                        onBlur={normalizeMaxPriceInput}
                      />
                    </label>
                  </div>
                  <div
                    className="shop-price-sliders"
                    style={{
                      '--range-start': `${minPercent}%`,
                      '--range-end': `${maxPercent}%`,
                    }}
                  >
                    <input
                      type="range"
                      min={absoluteMinPrice}
                      max={absoluteMaxPrice}
                      value={minPrice}
                      onChange={handleMinPriceSlider}
                    />
                    <input
                      type="range"
                      min={absoluteMinPrice}
                      max={absoluteMaxPrice}
                      value={maxPrice}
                      onChange={handleMaxPriceSlider}
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section id="shop-catalog" className="shop-catalog section-wrap">
        <div className="section-header shop-results-header">
          <div>
            <div className="section-eyebrow">Catalog Results</div>
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
                  onAction={() => navigate(`/shop/${product.id}`)}
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
