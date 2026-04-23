import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../ProductCard';
import SearchBar from '../SearchBar';
import '../../styles/home-catalog.css';
import { getShopProducts } from '../../services/productService';

const catalogFilters = [
  { key: 'all', label: 'All Jerseys' },
  { key: 'football', label: 'Football' },
  { key: 'basketball', label: 'Basketball' },
];

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

const HomeCatalogSection = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);

  const featuredProducts = useMemo(() => {
    const products = getShopProducts();
    return interleaveBySport(products);
  }, []);

  useEffect(() => {
    setVisibleCount(4);
  }, [activeFilter, searchTerm]);

  const filteredProducts = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    const searchFiltered = !trimmedSearch
      ? featuredProducts
      : featuredProducts.filter((product) => product.searchText.includes(trimmedSearch));

    if (activeFilter === 'all') {
      return searchFiltered;
    }

    return searchFiltered.filter((product) => product.sport === activeFilter);
  }, [activeFilter, featuredProducts, searchTerm]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <section id="jerseys" className="home-catalog section-wrap">
      <div className="section-header home-catalog-header">
        <div>
          <div className="section-eyebrow">Fresh Catalog</div>
          <h2 className="section-title">
            Explore The <span>Latest Drops</span>
          </h2>
        </div>
        <Link className="view-all" to="/shop">
          View full catalog
        </Link>
      </div>

      <div className="home-catalog-intro">
        A quick mix of football kits and basketball jerseys, pulled straight from the live shop catalog.
      </div>

      <div className="home-catalog-controls">
        <div className="home-catalog-search">
          <SearchBar
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search home catalog..."
          />
        </div>

        <div className="home-catalog-filters">
          {catalogFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`home-catalog-filter${activeFilter === filter.key ? ' active' : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="home-catalog-grid">
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
        <div className="home-catalog-load-more">
          <button
            type="button"
            className="home-catalog-load-more-btn"
            onClick={() => setVisibleCount((currentCount) => currentCount + 4)}
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
};

export default HomeCatalogSection;
