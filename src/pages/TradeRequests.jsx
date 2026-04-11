import React, { useState } from 'react';
import { Button, Card, PageHeader, PageShell, StateBlock } from '../components/ui';
import TradeRequestCard from '../components/TradeRequestCard';
import { useTrade } from '../context/TradeContext';
import '../styles/trade.css';

const TradeRequests = () => {
  const { requests } = useTrade();
  const [activeTab, setActiveTab] = useState('incoming');

  const incoming = requests.filter((r) => r.direction === 'incoming');
  const outgoing = requests.filter((r) => r.direction === 'outgoing');
  const displayed = activeTab === 'incoming' ? incoming : outgoing;

  return (
    <PageShell className="trade-page">
      <PageHeader
        eyebrow="Trade Activity"
        title={
          <>
            Trade
            <br />
            <span>Requests</span>
          </>
        }
        description="Review offers you've received and track the requests you've sent out to other traders."
        actions={
          <>
            <Button variant="secondary" to="/trade">
              Marketplace
            </Button>
            <Button to="/trade/create">+ List Jersey</Button>
          </>
        }
      />

      {/* Tabs */}
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
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.6 }}>
          {activeTab === 'incoming'
            ? 'Other traders are offering their jerseys in exchange for yours.'
            : 'Offers you sent — waiting for the other trader to respond.'}
        </p>
      </Card>

      {/* List or empty state */}
      {displayed.length > 0 ? (
        <div className="trade-requests-list">
          {displayed.map((request) => (
            <TradeRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <StateBlock
          icon={activeTab === 'incoming' ? '📥' : '📤'}
          title={
            activeTab === 'incoming'
              ? 'No incoming offers yet'
              : 'No outgoing offers yet'
          }
          description={
            activeTab === 'incoming'
              ? "You haven't received any trade offers yet. List a jersey to start getting offers from the community."
              : "You haven't made any trade offers yet. Browse the marketplace to find jerseys you want."
          }
          centered
          actions={
            activeTab === 'incoming' ? (
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
