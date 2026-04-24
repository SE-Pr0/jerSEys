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

const listingMetrics = [
  {
    label: 'Flagged listings',
    value: '28',
    trend: '12 need immediate action',
    trendTone: 'warning',
    note: 'Active listings reported by users for policy violations.',
    tone: 'crimson',
  },
  {
    label: 'Reports received',
    value: '61',
    trend: '+14 since yesterday',
    trendTone: 'warning',
    note: 'Total community reports submitted across all listings.',
    tone: 'orange',
  },
  {
    label: 'Removed this week',
    value: '11',
    trend: '+4 vs last week',
    trendTone: 'positive',
    note: 'Listings taken down for violating marketplace policy.',
    tone: 'royal',
  },
  {
    label: 'Resolved this week',
    value: '34',
    trend: '+18 vs last week',
    trendTone: 'positive',
    note: 'Reports reviewed, closed, or dismissed by the moderation team.',
    tone: 'green',
  },
];

const statusFilters = [
  { value: 'all', label: 'All statuses' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'removed', label: 'Removed' },
  { value: 'resolved', label: 'Resolved' },
];

const reasonFilters = [
  { value: 'all', label: 'All reasons' },
  { value: 'counterfeit', label: 'Counterfeit' },
  { value: 'misleading', label: 'Misleading' },
  { value: 'prohibited', label: 'Prohibited item' },
  { value: 'spam', label: 'Spam' },
];

const listings = [
  {
    id: 'LST-0847',
    title: 'Vintage Brazil 2002 Jersey',
    seller: 'Marco Silva',
    email: 'marco@jerseysys.com',
    reports: '4 reports',
    reportsTone: 'crimson',
    reason: 'Counterfeit',
    reasonKey: 'counterfeit',
    reasonTone: 'crimson',
    reported: 'Apr 20, 2026',
    status: 'Flagged',
    statusKey: 'flagged',
    statusTone: 'crimson',
    avatarTone: 'royal',
  },
  {
    id: 'LST-0831',
    title: 'Argentina 2022 World Cup Home',
    seller: 'Lucia Torres',
    email: 'lucia@jerseysys.com',
    reports: '1 report',
    reportsTone: 'orange',
    reason: 'Misleading',
    reasonKey: 'misleading',
    reasonTone: 'orange',
    reported: 'Apr 19, 2026',
    status: 'Under Review',
    statusKey: 'under-review',
    statusTone: 'orange',
    avatarTone: 'green',
  },
  {
    id: 'LST-0819',
    title: 'Lakers City Edition 2024',
    seller: 'Derek Hall',
    email: 'derek@jerseysys.com',
    reports: '2 reports',
    reportsTone: 'orange',
    reason: 'Prohibited item',
    reasonKey: 'prohibited',
    reasonTone: 'crimson',
    reported: 'Apr 18, 2026',
    status: 'Under Review',
    statusKey: 'under-review',
    statusTone: 'orange',
    avatarTone: 'orange',
  },
  {
    id: 'LST-0798',
    title: 'Manchester City Away 2024',
    seller: 'Sam Okafor',
    email: 'sam@jerseysys.com',
    reports: '6 reports',
    reportsTone: 'crimson',
    reason: 'Counterfeit',
    reasonKey: 'counterfeit',
    reasonTone: 'crimson',
    reported: 'Apr 16, 2026',
    status: 'Flagged',
    statusKey: 'flagged',
    statusTone: 'crimson',
    avatarTone: 'crimson',
  },
  {
    id: 'LST-0785',
    title: 'Japan World Cup 2022 Home',
    seller: 'Hana Kobayashi',
    email: 'hana@jerseysys.com',
    reports: '3 reports',
    reportsTone: 'crimson',
    reason: 'Spam',
    reasonKey: 'spam',
    reasonTone: 'orange',
    reported: 'Apr 15, 2026',
    status: 'Removed',
    statusKey: 'removed',
    statusTone: 'crimson',
    avatarTone: 'green',
  },
  {
    id: 'LST-0771',
    title: 'PSG Home Jersey 2023',
    seller: 'Ethan Brooks',
    email: 'ethan@jerseysys.com',
    reports: '1 report',
    reportsTone: 'orange',
    reason: 'Misleading',
    reasonKey: 'misleading',
    reasonTone: 'orange',
    reported: 'Apr 14, 2026',
    status: 'Resolved',
    statusKey: 'resolved',
    statusTone: 'green',
    avatarTone: 'orange',
  },
  {
    id: 'LST-0756',
    title: 'Chelsea Third Kit 2024',
    seller: 'Nadia Jensen',
    email: 'nadia@jerseysys.com',
    reports: '2 reports',
    reportsTone: 'orange',
    reason: 'Prohibited item',
    reasonKey: 'prohibited',
    reasonTone: 'crimson',
    reported: 'Apr 13, 2026',
    status: 'Removed',
    statusKey: 'removed',
    statusTone: 'crimson',
    avatarTone: 'royal',
  },
  {
    id: 'LST-0741',
    title: 'Real Madrid 2023 Third Kit',
    seller: 'Fatima Al-Rashid',
    email: 'fatima@jerseysys.com',
    reports: '1 report',
    reportsTone: 'orange',
    reason: 'Spam',
    reasonKey: 'spam',
    reasonTone: 'orange',
    reported: 'Apr 12, 2026',
    status: 'Resolved',
    statusKey: 'resolved',
    statusTone: 'green',
    avatarTone: 'royal',
  },
];

const ModerateListings = () => {
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeReason, setActiveReason] = useState('all');

  const filteredListings = useMemo(() => {
    const search = normalizeText(query);

    return listings.filter((listing) => {
      const matchesStatus = activeStatus === 'all' || listing.statusKey === activeStatus;
      const matchesReason = activeReason === 'all' || listing.reasonKey === activeReason;
      const matchesSearch = buildSearchBlob([
        listing.id,
        listing.title,
        listing.seller,
        listing.email,
        listing.reason,
        listing.status,
      ]).includes(search);

      return matchesStatus && matchesReason && matchesSearch;
    });
  }, [activeStatus, activeReason, query]);

  return (
    <AdminSuiteLayout
      className="admin-listings-page"
      description="Review reported listings, enforce marketplace policy, and remove content that violates community standards."
      eyebrow="Admin Console"
      metrics={listingMetrics}
      title={(
        <>
          Moderate <span>Listings</span>
        </>
      )}
    >
      <div className="admin-suite-workspace">
        <Card className="admin-suite-panel admin-suite-main-panel">
          <div className="admin-suite-toolbar">
            <FormField label="Search listings" htmlFor="admin-listing-search">
              <input
                className="ui-input"
                id="admin-listing-search"
                placeholder="Search ID, title, or seller"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </FormField>

            <FormField label="Status" htmlFor="admin-listing-status">
              <select
                className="ui-select"
                id="admin-listing-status"
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

            <FormField label="Reason" htmlFor="admin-listing-reason">
              <select
                className="ui-select"
                id="admin-listing-reason"
                value={activeReason}
                onChange={(event) => setActiveReason(event.target.value)}
              >
                {reasonFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="admin-suite-table-header">
            <div>
              <div className="admin-suite-kicker">Moderation queue</div>
              <h2 className="admin-suite-table-title">
                {filteredListings.length} listings in view
              </h2>
              <p className="admin-suite-table-subtitle">
                Investigate flagged posts, dismiss false reports, and remove content that breaks policy.
              </p>
            </div>
          </div>

          <div className="admin-suite-table-wrap">
            <table className="admin-suite-table">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Seller</th>
                  <th>Reports</th>
                  <th>Reason</th>
                  <th>Reported</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <strong>{listing.title}</strong>
                      <span className="admin-suite-subtext">{listing.id}</span>
                    </td>
                    <td>
                      <div className="admin-suite-name-cell">
                        <span className="admin-suite-avatar" style={toneAvatarStyles[listing.avatarTone]}>
                          {getInitials(listing.seller)}
                        </span>
                        <div>
                          <strong>{listing.seller}</strong>
                          <span className="admin-suite-subtext">{listing.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-suite-pill" style={toneBadgeStyles[listing.reportsTone]}>
                        {listing.reports}
                      </span>
                    </td>
                    <td>
                      <span className="admin-suite-pill" style={toneBadgeStyles[listing.reasonTone]}>
                        {listing.reason}
                      </span>
                    </td>
                    <td>{listing.reported}</td>
                    <td>
                      <span className={`admin-suite-status is-${listing.statusTone}`}>{listing.status}</span>
                    </td>
                    <td>
                      <div className="admin-suite-actions">
                        <Button className="admin-suite-inline-button" variant="ghost">
                          Review
                        </Button>
                        <Button className="admin-suite-inline-button" variant="secondary">
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-suite-footnote">
            Showing {filteredListings.length} of {listings.length} reported listings. Act on flagged content to keep the marketplace safe.
          </div>
        </Card>
      </div>
    </AdminSuiteLayout>
  );
};

export default ModerateListings;
