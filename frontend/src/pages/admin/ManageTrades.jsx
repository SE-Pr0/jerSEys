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

const tradeMetrics = [
  {
    label: 'Pending requests',
    value: '12',
    trend: '5 need action today',
    trendTone: 'warning',
    note: 'Trade requests submitted and waiting for admin approval.',
    tone: 'orange',
  },
  {
    label: 'Active trades',
    value: '84',
    trend: '+11 this week',
    trendTone: 'positive',
    note: 'Approved trades currently in progress between users.',
    tone: 'royal',
  },
  {
    label: 'Awaiting confirmation',
    value: '9',
    trend: '3 expiring soon',
    trendTone: 'warning',
    note: 'Matched trades waiting for both parties to confirm.',
    tone: 'crimson',
  },
  {
    label: 'Completed',
    value: '289',
    trend: '+42 this month',
    trendTone: 'positive',
    note: 'Trades fully completed and closed out.',
    tone: 'green',
  },
];

const statusFilters = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'active', label: 'Active' },
  { value: 'awaiting', label: 'Awaiting Confirmation' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
];

const trades = [
  {
    id: 'TR-001',
    userName: 'Sarah Chen',
    userEmail: 'sarah@jerseysys.com',
    counterpartyName: 'David Moore',
    counterpartyEmail: 'david@jerseysys.com',
    offering: 'Barcelona Home 2023',
    seeking: 'Man United Away 2023',
    submitted: 'Apr 21, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Pending',
    statusKey: 'pending',
    statusTone: 'orange',
    avatarTone: 'royal',
    offeringImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    seekingImage: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80',
    tradeNote: 'First-time trade request. Both users have verified addresses.',
  },
  {
    id: 'TR-002',
    userName: 'Marco Silva',
    userEmail: 'marco@jerseysys.com',
    counterpartyName: 'Lucia Torres',
    counterpartyEmail: 'lucia@jerseysys.com',
    offering: 'Brazil 2002 Vintage',
    seeking: 'Argentina 2022 Home',
    submitted: 'Apr 20, 2026',
    type: 'Counter Offer',
    typeTone: 'orange',
    status: 'Awaiting',
    statusKey: 'awaiting',
    statusTone: 'crimson',
    avatarTone: 'orange',
    offeringImage: 'https://images.unsplash.com/photo-1580087433295-ab2600c103a5?auto=format&fit=crop&w=800&q=80',
    seekingImage: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=800&q=80',
    tradeNote: 'Counter-offer pending final confirmation from both parties.',
  },
  {
    id: 'TR-003',
    userName: 'Priya Nair',
    userEmail: 'priya@jerseysys.com',
    counterpartyName: 'Omar Haddad',
    counterpartyEmail: 'omar@jerseysys.com',
    offering: 'PSG Home 2024',
    seeking: 'Real Madrid Third 2024',
    submitted: 'Apr 19, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Active',
    statusKey: 'active',
    statusTone: 'green',
    avatarTone: 'green',
    offeringImage: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=800&q=80',
    seekingImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    tradeNote: 'Approved and currently in shipping handoff stage.',
  },
  {
    id: 'TR-004',
    userName: 'Jake Owens',
    userEmail: 'jake@jerseysys.com',
    counterpartyName: 'Sana Malik',
    counterpartyEmail: 'sana@jerseysys.com',
    offering: 'Lakers City Edition',
    seeking: 'Bulls Classic Home',
    submitted: 'Apr 18, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Rejected',
    statusKey: 'rejected',
    statusTone: 'crimson',
    avatarTone: 'crimson',
    offeringImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    seekingImage: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=800&q=80',
    tradeNote: 'Rejected due to condition mismatch in submitted photos.',
  },
  {
    id: 'TR-005',
    userName: 'Lena Fischer',
    userEmail: 'lena@jerseysys.com',
    counterpartyName: 'Noah Reed',
    counterpartyEmail: 'noah@jerseysys.com',
    offering: 'Bayern Munich 2023 Home',
    seeking: 'Dortmund Away 2023',
    submitted: 'Apr 17, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Completed',
    statusKey: 'completed',
    statusTone: 'green',
    avatarTone: 'royal',
    offeringImage: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    seekingImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80',
    tradeNote: 'Completed successfully. Both users confirmed delivery.',
  },
  {
    id: 'TR-006',
    userName: 'Carlos Diaz',
    userEmail: 'carlos@jerseysys.com',
    counterpartyName: 'Eli Romero',
    counterpartyEmail: 'eli@jerseysys.com',
    offering: 'Inter Miami Home',
    seeking: 'LAFC Away 2024',
    submitted: 'Apr 16, 2026',
    type: 'Counter Offer',
    typeTone: 'orange',
    status: 'Active',
    statusKey: 'active',
    statusTone: 'green',
    avatarTone: 'orange',
    offeringImage: 'https://images.unsplash.com/photo-1599499598603-7d6f7f2d1f8f?auto=format&fit=crop&w=800&q=80',
    seekingImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    tradeNote: 'Active exchange with courier pickup scheduled.',
  },
  {
    id: 'TR-007',
    userName: 'Hana Kobayashi',
    userEmail: 'hana@jerseysys.com',
    counterpartyName: 'Yuna Park',
    counterpartyEmail: 'yuna@jerseysys.com',
    offering: 'Japan World Cup 2022',
    seeking: 'South Korea 2022 Home',
    submitted: 'Apr 15, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Pending',
    statusKey: 'pending',
    statusTone: 'orange',
    avatarTone: 'green',
    offeringImage: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80',
    seekingImage: 'https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=800&q=80',
    tradeNote: 'Pending admin approval before parties can confirm trade.',
  },
];

const ManageTrades = () => {
  const [tradeRecords, setTradeRecords] = useState(trades);
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [reviewTradeId, setReviewTradeId] = useState(null);

  const filteredTrades = useMemo(() => {
    const search = normalizeText(query);

    return tradeRecords.filter((trade) => {
      const matchesStatus = activeStatus === 'all' || trade.statusKey === activeStatus;
      const matchesSearch = buildSearchBlob([
        trade.id,
        trade.userName,
        trade.userEmail,
        trade.counterpartyName,
        trade.counterpartyEmail,
        trade.offering,
        trade.seeking,
        trade.type,
        trade.status,
      ]).includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, query, tradeRecords]);

  const reviewTrade = useMemo(
    () => tradeRecords.find((trade) => trade.id === reviewTradeId) || null,
    [reviewTradeId, tradeRecords],
  );

  const handleOpenReview = (trade) => {
    setReviewTradeId(trade.id);
  };

  const handleCloseReview = () => {
    setReviewTradeId(null);
  };

  const handleApproveTrade = (tradeId) => {
    setTradeRecords((currentTrades) =>
      currentTrades.map((trade) =>
        trade.id === tradeId
          ? {
            ...trade,
            status: 'Active',
            statusKey: 'active',
            statusTone: 'green',
            tradeNote: 'Approved by admin and moved to active workflow.',
          }
          : trade,
      ),
    );
  };

  return (
    <AdminSuiteLayout
      className="admin-trades-page"
      description="Approve trade requests, manage active workflows, and oversee the full trade lifecycle."
      eyebrow="Admin Console"
      metrics={tradeMetrics}
      title={(
        <>
          Manage <span>Trades</span>
        </>
      )}
    >
      <div className="admin-suite-workspace">
        <Card className="admin-suite-panel admin-suite-main-panel">
          <div className="admin-suite-toolbar">
            <FormField label="Search trades" htmlFor="admin-trade-search">
              <input
                className="ui-input"
                id="admin-trade-search"
                placeholder="Search trade ID or users"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </FormField>

            <FormField label="Status" htmlFor="admin-trade-status">
              <select
                className="ui-select"
                id="admin-trade-status"
                value={activeStatus}
                onChange={(event) => setActiveStatus(event.target.value)}
              >
                {statusFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="admin-suite-table-header">
            <div>
              <div className="admin-suite-kicker">Trade operations</div>
              <h2 className="admin-suite-table-title">
                {filteredTrades.length} trades in view
              </h2>
            </div>
          </div>

          <div className="admin-suite-table-wrap">
            <table className="admin-suite-table">
              <thead>
                <tr>
                  <th>Trader</th>
                  <th>Counterparty</th>
                  <th>Trade ID</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td>
                      <div className="admin-suite-name-cell">
                        <span className="admin-suite-avatar" style={toneAvatarStyles[trade.avatarTone]}>
                          {getInitials(trade.userName)}
                        </span>
                        <div>
                          <strong>{trade.userName}</strong>
                          <span className="admin-suite-subtext">{trade.userEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-suite-name-cell">
                        <span className="admin-suite-avatar" style={toneAvatarStyles[trade.avatarTone]}>
                          {getInitials(trade.counterpartyName)}
                        </span>
                        <div>
                          <strong>{trade.counterpartyName}</strong>
                          <span className="admin-suite-subtext">{trade.counterpartyEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-suite-pill" style={toneBadgeStyles[trade.typeTone]}>
                        {trade.id}
                      </span>
                    </td>
                    <td>{trade.submitted}</td>
                    <td>
                      <span className={`admin-suite-status is-${trade.statusTone}`}>{trade.status}</span>
                    </td>
                    <td>
                      <div className="admin-suite-actions">
                        <Button
                          className="admin-suite-inline-button"
                          variant="ghost"
                          onClick={() => handleOpenReview(trade)}
                        >
                          Review
                        </Button>
                        <Button
                          className="admin-suite-inline-button"
                          variant="secondary"
                          onClick={() => handleApproveTrade(trade.id)}
                          disabled={trade.statusKey === 'active' || trade.statusKey === 'completed'}
                        >
                          {trade.statusKey === 'active' || trade.statusKey === 'completed' ? 'Approved' : 'Approve'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-suite-footnote">
            Showing {filteredTrades.length} of {tradeRecords.length} trades. Approve or reject requests to keep the workflow moving.
          </div>
        </Card>
      </div>

      {reviewTrade ? (
        <div
          className="admin-trade-review-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-trade-review-title"
          onClick={handleCloseReview}
        >
          <div className="admin-trade-review-modal ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-trade-review-head">
              <div>
                <div className="admin-suite-kicker">Trade review</div>
                <h2 className="admin-suite-table-title" id="admin-trade-review-title">
                  {reviewTrade.id}
                </h2>
              </div>
              <Button variant="ghost" onClick={handleCloseReview}>Close</Button>
            </div>

            <div className="admin-trade-review-users">
              <div className="admin-trade-review-user">
                <span className="admin-suite-avatar" style={toneAvatarStyles[reviewTrade.avatarTone]}>
                  {getInitials(reviewTrade.userName)}
                </span>
                <div>
                  <strong>{reviewTrade.userName}</strong>
                  <span>{reviewTrade.userEmail}</span>
                </div>
              </div>
              <div className="admin-trade-review-user">
                <span className="admin-suite-avatar" style={toneAvatarStyles[reviewTrade.avatarTone]}>
                  {getInitials(reviewTrade.counterpartyName)}
                </span>
                <div>
                  <strong>{reviewTrade.counterpartyName}</strong>
                  <span>{reviewTrade.counterpartyEmail}</span>
                </div>
              </div>
            </div>

            <div className="admin-trade-review-gallery">
              <article className="admin-trade-review-item">
                <div className="admin-trade-review-image-wrap">
                  <img src={reviewTrade.offeringImage} alt={reviewTrade.offering} />
                </div>
                <div className="admin-trade-review-item-meta">
                  <span>Offering</span>
                  <strong>{reviewTrade.offering}</strong>
                </div>
              </article>
              <article className="admin-trade-review-item">
                <div className="admin-trade-review-image-wrap">
                  <img src={reviewTrade.seekingImage} alt={reviewTrade.seeking} />
                </div>
                <div className="admin-trade-review-item-meta">
                  <span>Seeking</span>
                  <strong>{reviewTrade.seeking}</strong>
                </div>
              </article>
            </div>

            <div className="admin-trade-review-meta">
              <div><span>Submitted</span><strong>{reviewTrade.submitted}</strong></div>
              <div>
                <span>Type</span>
                <strong>
                  <span className="admin-suite-pill" style={toneBadgeStyles[reviewTrade.typeTone]}>
                    {reviewTrade.type}
                  </span>
                </strong>
              </div>
              <div>
                <span>Status</span>
                <strong>
                  <span className={`admin-suite-status is-${reviewTrade.statusTone}`}>{reviewTrade.status}</span>
                </strong>
              </div>
              <div><span>Admin note</span><strong>{reviewTrade.tradeNote}</strong></div>
            </div>

            <div className="admin-trade-review-actions">
              <Button variant="ghost" onClick={handleCloseReview}>Close</Button>
              <Button
                onClick={() => {
                  handleApproveTrade(reviewTrade.id);
                  handleCloseReview();
                }}
                disabled={reviewTrade.statusKey === 'active' || reviewTrade.statusKey === 'completed'}
              >
                {reviewTrade.statusKey === 'active' || reviewTrade.statusKey === 'completed' ? 'Already approved' : 'Approve trade'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminSuiteLayout>
  );
};

export default ManageTrades;
