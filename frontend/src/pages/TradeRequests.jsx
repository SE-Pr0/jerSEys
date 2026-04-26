import React, { useMemo, useState } from 'react';
import { Button, Card, PageHeader, PageShell, StateBlock } from '../components/ui';
import TradeRequestCard from '../components/TradeRequestCard';
import { useTrade } from '../context/TradeContext';
import { getStoredUser } from '../utils/auth';
import '../styles/trade.css';

const TradeRequests = () => {
  const { requests, listings, removeListing, isLoading, error } = useTrade();
  const [activeTab, setActiveTab] = useState('incoming');
  const currentUser = getStoredUser();

  const incoming = requests.filter((request) => request.direction === 'incoming');
  const outgoing = requests.filter((request) => request.direction === 'outgoing');
  const listed = useMemo(
    () => listings.filter((listing) => String(listing?.seller?.id) === String(currentUser?.id)),
    [currentUser?.id, listings],
  );

  const displayed = activeTab === 'incoming'
    ? incoming
    : activeTab === 'outgoing'
      ? outgoing
      : listed;

  return (
    <PageShell className="trade-page">
      <PageHeader
        eyebrow="Trade Activity"
        title={(
          <span className="trade-requests-title">
            <span className="trade-requests-title-trade">Trade</span>
            {' '}
            <span className="trade-requests-title-requests">Requests</span>
          </span>
        )}
        description="Review offers you've received, track the requests you've sent, and manage the jerseys you have listed."
        actions={(
          <>
            <Button variant="secondary" to="/trade">
              Marketplace
            </Button>
            <Button to="/trade/create">+ List Jersey</Button>
          </>
        )}
      />

      <Card className="trade-tabs-card">
        <div className="trade-tabs">
          <button
            type="button"
            className={`trade-tab${activeTab === 'incoming' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('incoming')}
          >
            Incoming
            <span className="trade-tab-count">{incoming.length}</span>
          </button>
          <button
            type="button"
            className={`trade-tab${activeTab === 'outgoing' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('outgoing')}
          >
            Outgoing
            <span className="trade-tab-count">{outgoing.length}</span>
          </button>
          <button
            type="button"
            className={`trade-tab${activeTab === 'listed' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('listed')}
          >
            Listed
            <span className="trade-tab-count">{listed.length}</span>
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.6 }}>
          {activeTab === 'incoming'
            ? 'Other traders are offering their jerseys in exchange for yours.'
            : activeTab === 'outgoing'
              ? 'Offers you sent - waiting for the other trader to respond.'
              : 'Jerseys you currently have listed. You can cancel any of them from here.'}
        </p>
      </Card>

      {isLoading ? (
        <StateBlock icon="..." title="Loading requests" description="Fetching your sent and received trade requests from the backend." centered />
      ) : error ? (
        <StateBlock icon="!" title="Unable to load requests" description={error} centered />
      ) : activeTab === 'listed' && displayed.length > 0 ? (
        <div className="trade-requests-list">
          {displayed.map((listing) => (
            <Card key={listing.id} className="trade-request-card">
              <div className="trade-request-header">
                <div className="trade-listed-summary">
                  <div className="trade-listed-thumb-wrap">
                    {listing.image ? (
                      <img src={listing.image} alt={listing.jerseyName} className="trade-listed-thumb" />
                    ) : (
                      <div className="trade-listed-thumb trade-listed-thumb--empty">No image</div>
                    )}
                  </div>
                  <div className="trade-listed-copy">
                    <div className="trade-kicker" style={{ marginBottom: '4px' }}>{listing.club}</div>
                    <div className="trade-exchange-name">{listing.jerseyName}</div>
                    <div className="trade-exchange-owner">
                      {listing.conditionDetail}
                      {listing.size && listing.size !== 'N/A' ? ` - Size ${listing.size}` : ''}
                    </div>
                  </div>
                </div>

                <span className={`trade-badge trade-badge--${listing.status === 'available' ? 'available' : 'pending'}`}>
                  {listing.status === 'available' ? 'Available' : 'Pending'}
                </span>
              </div>

              <div className="trade-request-message">
                <span className="trade-message-quote">&quot;</span>
                <div className="trade-request-message-content">
                  <p>{listing.description || 'No description added for this listing.'}</p>
                </div>
              </div>

              <div className="trade-request-footer">
                <span className="trade-request-date">{listing.listedDate || 'Recently listed'}</span>

                <div className="trade-request-actions">
                  <Button variant="secondary" to={`/trade/${listing.id}`}>
                    View Listing
                  </Button>
                  <Button onClick={() => removeListing(listing.id)}>
                    Cancel Listing
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : displayed.length > 0 ? (
        <div className="trade-requests-list">
          {displayed.map((request) => (
            <TradeRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <StateBlock
          icon={activeTab === 'incoming' ? 'Inbox' : activeTab === 'outgoing' ? 'Send' : 'Tag'}
          title={
            activeTab === 'incoming'
              ? 'No incoming offers yet'
              : activeTab === 'outgoing'
                ? 'No outgoing offers yet'
                : 'No listed jerseys yet'
          }
          description={
            activeTab === 'incoming'
              ? "You haven't received any trade offers yet. List a jersey to start getting offers from the community."
              : activeTab === 'outgoing'
                ? "You haven't made any trade offers yet. Browse the marketplace to find jerseys you want."
                : "You haven't listed any jerseys yet. Create a listing to start trading with the community."
          }
          centered
          actions={
            activeTab === 'incoming' || activeTab === 'listed' ? (
              <Button to="/trade/create">List Your Jersey</Button>
            ) : (
              <Button to="/trade">Browse Marketplace</Button>
            )
          }
        />
      )}
    </PageShell>
  );
};

export default TradeRequests;
