import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, FormField, StateBlock } from '../../components/ui';
import { approveAdminTrade, getAdminTrades, rejectAdminTrade } from '../../services/adminService';
import AdminModalPortal from './AdminModalPortal';
import AdminSuiteLayout from './AdminSuiteLayout';
import {
  buildSearchBlob,
  getInitials,
  toneAvatarStyles,
  normalizeText,
} from './adminConstants';

const statusFilters = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const parseTradeTitle = (title = '') => {
  const [club, ...rest] = String(title).split(' - ');

  return {
    club: rest.length > 0 ? club : 'Trade listing',
    jerseyName: rest.length > 0 ? rest.join(' - ') : title || 'Untitled listing',
  };
};

const statusMeta = {
  approved: { label: 'Approved', tone: 'green' },
  closed: { label: 'Closed', tone: 'royal' },
  pending: { label: 'Pending', tone: 'orange' },
  rejected: { label: 'Rejected', tone: 'crimson' },
};

const toTradeRecord = (trade) => {
  const { club, jerseyName } = parseTradeTitle(trade.title || '');
  const normalizedStatus = String(trade.status || 'pending').toLowerCase();
  const meta = statusMeta[normalizedStatus] || statusMeta.pending;

  return {
    id: String(trade.id),
    userName: trade.owner_name || 'Trader',
    userEmail: trade.owner_email || 'No email',
    submitted: formatDate(trade.created_at),
    club,
    jerseyName,
    description: trade.description || '',
    image: trade.image_url || '',
    status: meta.label,
    statusKey: normalizedStatus,
    statusTone: meta.tone,
    avatarTone: normalizedStatus === 'rejected' ? 'crimson' : normalizedStatus === 'approved' ? 'green' : 'royal',
  };
};

const metricToneForStatus = (status) => {
  if (status === 'pending') return 'orange';
  if (status === 'approved') return 'green';
  if (status === 'rejected') return 'crimson';
  return 'royal';
};

const buildTradeMetrics = (tradeRecords) => {
  const pendingCount = tradeRecords.filter((trade) => trade.statusKey === 'pending').length;
  const approvedCount = tradeRecords.filter((trade) => trade.statusKey === 'approved').length;
  const rejectedCount = tradeRecords.filter((trade) => trade.statusKey === 'rejected').length;
  const closedCount = tradeRecords.filter((trade) => trade.statusKey === 'closed').length;

  return [
    {
      label: 'Pending requests',
      value: String(pendingCount),
      trend: pendingCount > 0 ? 'Waiting for review' : 'No items waiting',
      trendTone: pendingCount > 0 ? 'warning' : 'positive',
      note: 'New trade listings that still need an admin decision.',
      tone: metricToneForStatus('pending'),
    },
    {
      label: 'Approved',
      value: String(approvedCount),
      trend: 'Visible in marketplace',
      trendTone: 'positive',
      note: 'Listings currently available for the community to browse.',
      tone: metricToneForStatus('approved'),
    },
    {
      label: 'Rejected',
      value: String(rejectedCount),
      trend: rejectedCount > 0 ? 'Needs creator follow-up' : 'No rejected listings',
      trendTone: rejectedCount > 0 ? 'warning' : 'positive',
      note: 'Listings rejected during moderation.',
      tone: metricToneForStatus('rejected'),
    },
    {
      label: 'Closed',
      value: String(closedCount),
      trend: 'No longer tradable',
      trendTone: 'neutral',
      note: 'Listings closed after a trade was completed.',
      tone: metricToneForStatus('closed'),
    },
  ];
};

const ManageTrades = () => {
  const [tradeRecords, setTradeRecords] = useState([]);
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('pending');
  const [reviewTradeId, setReviewTradeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeActionTradeId, setActiveActionTradeId] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTrades = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const trades = await getAdminTrades();

        if (!isMounted) {
          return;
        }

        setTradeRecords(Array.isArray(trades) ? trades.map(toTradeRecord) : []);
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || 'Failed to load trade listings.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTrades();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTrades = useMemo(() => {
    const search = normalizeText(query);

    return tradeRecords.filter((trade) => {
      const matchesStatus = activeStatus === 'all' || trade.statusKey === activeStatus;
      const matchesSearch = buildSearchBlob([
        trade.id,
        trade.userName,
        trade.userEmail,
        trade.club,
        trade.jerseyName,
        trade.description,
        trade.status,
      ]).includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, query, tradeRecords]);

  const reviewTrade = useMemo(
    () => tradeRecords.find((trade) => trade.id === reviewTradeId) || null,
    [reviewTradeId, tradeRecords],
  );

  const tradeMetrics = useMemo(() => buildTradeMetrics(tradeRecords), [tradeRecords]);

  const handleOpenReview = (trade) => {
    setReviewTradeId(trade.id);
    setActionError('');
  };

  const handleCloseReview = () => {
    setReviewTradeId(null);
  };

  const handleStatusUpdate = async (tradeId, nextStatus) => {
    setActiveActionTradeId(tradeId);
    setActionError('');

    try {
      const updatedTrade = nextStatus === 'approved'
        ? await approveAdminTrade(tradeId)
        : await rejectAdminTrade(tradeId);
      const nextRecord = toTradeRecord(updatedTrade);

      setTradeRecords((currentTrades) =>
        currentTrades.map((trade) => (trade.id === tradeId ? nextRecord : trade)),
      );
    } catch (error) {
      setActionError(error.message || `Failed to ${nextStatus} listing.`);
    } finally {
      setActiveActionTradeId('');
    }
  };

  return (
    <AdminSuiteLayout
      className="admin-trades-page"
      description="Moderate newly created trade listings and keep marketplace visibility under control."
      eyebrow="Admin Console"
      metrics={tradeMetrics}
      title={(
        <>
          Moderate <span>Listings</span>
        </>
      )}
    >
      <div className="admin-suite-workspace">
        <Card className="admin-suite-panel admin-suite-main-panel">
          <div className="admin-suite-toolbar">
            <FormField label="Search listings" htmlFor="admin-trade-search">
              <input
                className="ui-input"
                id="admin-trade-search"
                placeholder="Search listing ID, trader, club, or jersey"
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
              <div className="admin-suite-kicker">Marketplace moderation</div>
              <h2 className="admin-suite-table-title">
                {filteredTrades.length} listings in view
              </h2>
            </div>
          </div>

          {actionError ? <p className="admin-suite-subtext">{actionError}</p> : null}

          {isLoading ? (
            <StateBlock centered icon="..." title="Loading listings" description="Fetching the latest trade listings for admin review." />
          ) : loadError ? (
            <StateBlock centered icon="!" title="Unable to load listings" description={loadError} />
          ) : (
            <>
              <div className="admin-suite-table-wrap">
                <table className="admin-suite-table">
                  <thead>
                    <tr>
                      <th>Trader</th>
                      <th>Listing</th>
                      <th>ID</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrades.map((trade) => {
                      const isPending = trade.statusKey === 'pending';
                      const isBusy = activeActionTradeId === trade.id;

                      return (
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
                            <div>
                              <strong>{trade.jerseyName}</strong>
                              <div className="admin-suite-subtext">{trade.club}</div>
                            </div>
                          </td>
                          <td>
                            <span className="admin-suite-pill">
                              #{trade.id}
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
                                onClick={() => handleStatusUpdate(trade.id, 'approved')}
                                disabled={!isPending || isBusy}
                              >
                                {isBusy && isPending ? 'Saving...' : isPending ? 'Approve' : 'Approved'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="admin-suite-footnote">
                Showing {filteredTrades.length} of {tradeRecords.length} listings. Pending listings stay visible here until they are approved or rejected.
              </div>
            </>
          )}
        </Card>
      </div>

      {reviewTrade ? (
        <AdminModalPortal>
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
                  <div className="admin-suite-kicker">Listing review</div>
                  <h2 className="admin-suite-table-title" id="admin-trade-review-title">
                    {reviewTrade.jerseyName}
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
              </div>

              <div className="admin-trade-review-gallery">
                <article className="admin-trade-review-item">
                  <div className="admin-trade-review-image-wrap">
                    {reviewTrade.image ? (
                      <img src={reviewTrade.image} alt={reviewTrade.jerseyName} />
                    ) : (
                      <div className="trade-listed-thumb trade-listed-thumb--empty">No image</div>
                    )}
                  </div>
                  <div className="admin-trade-review-item-meta">
                    <span>{reviewTrade.club}</span>
                    <strong>{reviewTrade.jerseyName}</strong>
                  </div>
                </article>
              </div>

              <div className="admin-trade-review-meta">
                <div><span>Listing ID</span><strong>#{reviewTrade.id}</strong></div>
                <div><span>Submitted</span><strong>{reviewTrade.submitted}</strong></div>
                <div>
                  <span>Status</span>
                  <strong>
                    <span className={`admin-suite-status is-${reviewTrade.statusTone}`}>{reviewTrade.status}</span>
                  </strong>
                </div>
                <div><span>Description</span><strong>{reviewTrade.description || 'No description provided.'}</strong></div>
              </div>

              <div className="admin-trade-review-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleStatusUpdate(reviewTrade.id, 'rejected');
                    handleCloseReview();
                  }}
                  disabled={reviewTrade.statusKey !== 'pending' || activeActionTradeId === reviewTrade.id}
                >
                  Reject listing
                </Button>
                <Button
                  onClick={() => {
                    handleStatusUpdate(reviewTrade.id, 'approved');
                    handleCloseReview();
                  }}
                  disabled={reviewTrade.statusKey !== 'pending' || activeActionTradeId === reviewTrade.id}
                >
                  {reviewTrade.statusKey === 'pending' ? 'Approve listing' : 'Already reviewed'}
                </Button>
              </div>
            </div>
          </div>
        </AdminModalPortal>
      ) : null}
    </AdminSuiteLayout>
  );
};

export default ManageTrades;
