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
    offering: 'Barcelona Home 2023',
    seeking: 'Man United Away 2023',
    submitted: 'Apr 21, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Pending',
    statusKey: 'pending',
    statusTone: 'orange',
    avatarTone: 'royal',
  },
  {
    id: 'TR-002',
    userName: 'Marco Silva',
    userEmail: 'marco@jerseysys.com',
    offering: 'Brazil 2002 Vintage',
    seeking: 'Argentina 2022 Home',
    submitted: 'Apr 20, 2026',
    type: 'Counter Offer',
    typeTone: 'orange',
    status: 'Awaiting',
    statusKey: 'awaiting',
    statusTone: 'crimson',
    avatarTone: 'orange',
  },
  {
    id: 'TR-003',
    userName: 'Priya Nair',
    userEmail: 'priya@jerseysys.com',
    offering: 'PSG Home 2024',
    seeking: 'Real Madrid Third 2024',
    submitted: 'Apr 19, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Active',
    statusKey: 'active',
    statusTone: 'green',
    avatarTone: 'green',
  },
  {
    id: 'TR-004',
    userName: 'Jake Owens',
    userEmail: 'jake@jerseysys.com',
    offering: 'Lakers City Edition',
    seeking: 'Bulls Classic Home',
    submitted: 'Apr 18, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Rejected',
    statusKey: 'rejected',
    statusTone: 'crimson',
    avatarTone: 'crimson',
  },
  {
    id: 'TR-005',
    userName: 'Lena Fischer',
    userEmail: 'lena@jerseysys.com',
    offering: 'Bayern Munich 2023 Home',
    seeking: 'Dortmund Away 2023',
    submitted: 'Apr 17, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Completed',
    statusKey: 'completed',
    statusTone: 'green',
    avatarTone: 'royal',
  },
  {
    id: 'TR-006',
    userName: 'Carlos Diaz',
    userEmail: 'carlos@jerseysys.com',
    offering: 'Inter Miami Home',
    seeking: 'LAFC Away 2024',
    submitted: 'Apr 16, 2026',
    type: 'Counter Offer',
    typeTone: 'orange',
    status: 'Active',
    statusKey: 'active',
    statusTone: 'green',
    avatarTone: 'orange',
  },
  {
    id: 'TR-007',
    userName: 'Hana Kobayashi',
    userEmail: 'hana@jerseysys.com',
    offering: 'Japan World Cup 2022',
    seeking: 'South Korea 2022 Home',
    submitted: 'Apr 15, 2026',
    type: 'New Request',
    typeTone: 'royal',
    status: 'Pending',
    statusKey: 'pending',
    statusTone: 'orange',
    avatarTone: 'green',
  },
];

const ManageTrades = () => {
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');

  const filteredTrades = useMemo(() => {
    const search = normalizeText(query);

    return trades.filter((trade) => {
      const matchesStatus = activeStatus === 'all' || trade.statusKey === activeStatus;
      const matchesSearch = buildSearchBlob([
        trade.id,
        trade.userName,
        trade.userEmail,
        trade.offering,
        trade.seeking,
        trade.type,
        trade.status,
      ]).includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, query]);

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
                placeholder="Search ID, user, or items"
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
              <p className="admin-suite-table-subtitle">
                Approve incoming requests, handle counter offers, and move trades through the workflow.
              </p>
            </div>
          </div>

          <div className="admin-suite-table-wrap">
            <table className="admin-suite-table">
              <thead>
                <tr>
                  <th>Trader</th>
                  <th>Offering</th>
                  <th>Seeking</th>
                  <th>Type</th>
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
                    <td>{trade.offering}</td>
                    <td>{trade.seeking}</td>
                    <td>
                      <span className="admin-suite-pill" style={toneBadgeStyles[trade.typeTone]}>
                        {trade.type}
                      </span>
                    </td>
                    <td>{trade.submitted}</td>
                    <td>
                      <span className={`admin-suite-status is-${trade.statusTone}`}>{trade.status}</span>
                    </td>
                    <td>
                      <div className="admin-suite-actions">
                        <Button className="admin-suite-inline-button" variant="ghost">
                          Review
                        </Button>
                        <Button className="admin-suite-inline-button" variant="secondary">
                          Approve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-suite-footnote">
            Showing {filteredTrades.length} of {trades.length} trades. Approve or reject requests to keep the workflow moving.
          </div>
        </Card>
      </div>
    </AdminSuiteLayout>
  );
};

export default ManageTrades;
