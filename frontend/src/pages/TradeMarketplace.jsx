import React, { useEffect, useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import { Button, Card, PageHeader, PageShell, StateBlock } from '../components/ui';
import TradeCard from '../components/TradeCard';
import { useTrade } from '../context/TradeContext';
import '../styles/shop.css';
import '../styles/trade.css';

const SPORTS = ['Football', 'Basketball'];
const LISTING_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'trade-available', label: 'Available For Trade' },
  { key: 'sale-available', label: 'Available For Sale' },
];

const TradeMarketplace = () => {
  const { listings: TRADE_LISTINGS, isLoading, error, refreshTrades } = useTrade();
  const [sport, setSport] = useState('All');
  const [listingType, setListingType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    refreshTrades();
  }, [refreshTrades]);

  const filtered = useMemo(() => {
    return TRADE_LISTINGS.filter((item) => {
      const matchSport =
        sport === 'All' || item.sport === sport.toLowerCase();
      const matchListingType =
        listingType === 'all'
          || (listingType === 'trade-available'
            && item.status === 'available'
            && (item.listingType === 'trade' || item.listingType === 'both'))
          || (listingType === 'sale-available'
            && item.status === 'available'
            && (item.listingType === 'sale' || item.listingType === 'both'))
          || (listingType === 'both' && item.listingType === 'both');
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.jerseyName.toLowerCase().includes(q) ||
        item.club.toLowerCase().includes(q) ||
        item.seller.name.toLowerCase().includes(q);
      return matchSport && matchListingType && matchSearch;
    });
  }, [TRADE_LISTINGS, sport, listingType, search]);

  const clearFilters = () => {
    setSport('All');
    setListingType('all');
    setSearch('');
  };

  return (
    <PageShell className="trade-page">
      <div className="trade-marketplace-top">
        <PageHeader
        eyebrow="Community Marketplace"
        title={
          <>
            Trade
            <br />
            <span>Marketplace</span>
          </>
        }
        description="Browse listings from the community. Find a jersey you want and make an offer with one from your own collection."
      />

        <Card className="trade-marketplace-summary">
          <div className="trade-section-heading trade-marketplace-summary-title">
            Quick Stats
          </div>
          <div className="trade-marketplace-stats">
            {[
              { val: TRADE_LISTINGS.filter((l) => l.status === 'available').length, label: 'Available' },
              { val: TRADE_LISTINGS.filter((l) => l.status === 'pending').length,   label: 'In negotiation' },
              { val: TRADE_LISTINGS.filter((l) => l.sport === 'football').length,   label: 'Football kits' },
              { val: TRADE_LISTINGS.filter((l) => l.sport === 'basketball').length, label: 'Basketball jerseys' },
            ].map((s) => (
              <div key={s.label} className="trade-marketplace-stat">
                <div className="trade-marketplace-stat-value">
                  {s.val}
                </div>
                <div className="trade-marketplace-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="trade-marketplace-actions">
            <Button to="/trade/requests" variant="secondary" style={{ flex: 1 }}>
              My Requests
            </Button>
            <Button to="/trade/create" style={{ flex: 1 }}>
              + List Jersey
            </Button>
          </div>
        </Card>
      </div>

      <Card className="trade-filter-card">
        <div className="trade-filter-row">
          <div className="shop-search-wrap trade-search-wrap">
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search jerseys, clubs, traders..."
            />
          </div>

          <div className="trade-filter-toolbar" role="group" aria-label="Trade filters">
            <div className="shop-main-filters" role="group" aria-label="Sport category">
              <button
                type="button"
                className={`shop-main-filter${sport === 'All' ? ' active' : ''}`}
                onClick={() => setSport('All')}
              >
                All
              </button>
              {SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`shop-main-filter${sport === s ? ' active' : ''}`}
                  onClick={() => setSport(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="trade-filter-divider" aria-hidden="true" />

            <div className="shop-main-filters trade-status-filters" role="group" aria-label="Listing type">
              {LISTING_TYPES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`shop-main-filter${listingType === s.key ? ' active' : ''}`}
                  onClick={() => setListingType(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="trade-results-label">
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
        </div>
      </Card>

      {/* Grid or empty state */}
      {isLoading ? (
        <StateBlock icon="..." title="Loading trade listings" description="Fetching approved marketplace listings from the backend." centered />
      ) : error ? (
        <StateBlock icon="!" title="Unable to load trade listings" description={error} centered />
      ) : filtered.length > 0 ? (
        <div className="trade-marketplace-grid">
          {filtered.map((listing) => (
            <TradeCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <StateBlock
          icon="🔍"
          title="No listings found"
          description="Try adjusting your filters or search terms, or be the first to list a jersey in this category."
          centered
          actions={
            <>
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button to="/trade/create">List Your Jersey</Button>
            </>
          }
        />
      )}
    </PageShell>
  );
};

export default TradeMarketplace;
