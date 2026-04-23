import React, { useState, useMemo } from 'react';
import { Button, Card, PageHeader, PageShell, StateBlock } from '../components/ui';
import TradeCard from '../components/TradeCard';
import { useTrade } from '../context/TradeContext';
import '../styles/trade.css';

const SPORTS = ['All', 'Football', 'Basketball'];
const STATUSES = ['All', 'Available', 'Pending'];

const TradeMarketplace = () => {
  const { listings: TRADE_LISTINGS } = useTrade();
  const [sport, setSport] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return TRADE_LISTINGS.filter((item) => {
      const matchSport =
        sport === 'All' || item.sport === sport.toLowerCase();
      const matchStatus =
        status === 'All' || item.status === status.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.jerseyName.toLowerCase().includes(q) ||
        item.club.toLowerCase().includes(q) ||
        item.seller.name.toLowerCase().includes(q);
      return matchSport && matchStatus && matchSearch;
    });
  }, [sport, status, search]);

  const clearFilters = () => {
    setSport('All');
    setStatus('All');
    setSearch('');
  };

  return (
    <PageShell className="trade-page">
      {/* Header + hero card side by side */}
      <div className="trade-marketplace-top">
        <PageHeader
          eyebrow="Community Marketplace"
          title={
            <>
              Jersey
              <br />
              <span>Trade</span>
            </>
          }
          description="Browse listings from the community. Find a jersey you want and make an offer with one from your own collection."
        />

        <Card className="trade-filter-card">
          <div className="trade-section-heading" style={{ marginBottom: 'var(--space-3)' }}>
            Quick Stats
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[
              { val: TRADE_LISTINGS.filter((l) => l.status === 'available').length, label: 'Available' },
              { val: TRADE_LISTINGS.filter((l) => l.status === 'pending').length,   label: 'In negotiation' },
              { val: TRADE_LISTINGS.filter((l) => l.sport === 'football').length,   label: 'Football kits' },
              { val: TRADE_LISTINGS.filter((l) => l.sport === 'basketball').length, label: 'Basketball jerseys' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '32px',
                    color: 'var(--crimson)',
                    letterSpacing: '0.5px',
                    lineHeight: 1,
                    marginBottom: '4px',
                  }}
                >
                  {s.val}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button to="/trade/requests" variant="secondary" style={{ flex: 1 }}>
              My Requests
            </Button>
            <Button to="/trade/create" style={{ flex: 1 }}>
              + List Jersey
            </Button>
          </div>
        </Card>
      </div>

      {/* Filter bar */}
      <Card>
        <div className="trade-filter-row">
          <div className="trade-search-wrap">
            <input
              type="text"
              className="ui-input trade-search-input"
              placeholder="Search jerseys, clubs, traders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="trade-search-icon">🔍</span>
          </div>

          <div className="trade-filter-chips">
            {SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                className={`trade-chip${sport === s ? ' is-active' : ''}`}
                onClick={() => setSport(s)}
              >
                {s}
              </button>
            ))}
            <div className="trade-chip-divider" />
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`trade-chip${status === s ? ' is-active' : ''}`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="trade-results-label">
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
        </div>
      </Card>

      {/* Grid or empty state */}
      {filtered.length > 0 ? (
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
