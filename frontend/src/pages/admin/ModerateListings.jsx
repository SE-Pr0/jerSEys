import React, { useMemo, useState } from 'react';
import { Button, Card, FormField } from '../../components/ui';
import AdminModalPortal from './AdminModalPortal';
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
    image: 'https://images.unsplash.com/photo-1580087433295-ab2600c103a5?auto=format&fit=crop&w=900&q=80',
    seller: 'Marco Silva',
    email: 'marco@jerseysys.com',
    price: '$179',
    condition: 'Used - Excellent',
    size: 'L',
    category: 'Football',
    listedOn: 'Apr 4, 2026',
    reports: '4 reports',
    reportsTone: 'crimson',
    reason: 'Counterfeit',
    reasonKey: 'counterfeit',
    reasonTone: 'crimson',
    reported: 'Apr 20, 2026',
    description: 'Rare throwback Brazil 2002 jersey. Includes original crest and sponsor marks. Price reflects collector demand.',
    listingNote: 'Seller has one prior warning for authenticity documentation.',
    status: 'Flagged',
    statusKey: 'flagged',
    statusTone: 'crimson',
    avatarTone: 'royal',
  },
  {
    id: 'LST-0831',
    title: 'Argentina 2022 World Cup Home',
    image: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=900&q=80',
    seller: 'Lucia Torres',
    email: 'lucia@jerseysys.com',
    price: '$142',
    condition: 'Used - Good',
    size: 'M',
    category: 'Football',
    listedOn: 'Apr 8, 2026',
    reports: '1 report',
    reportsTone: 'orange',
    reason: 'Misleading',
    reasonKey: 'misleading',
    reasonTone: 'orange',
    reported: 'Apr 19, 2026',
    description: 'Argentina home shirt from the 2022 run. Minor wear on sleeve cuffs, photos uploaded from multiple angles.',
    listingNote: 'Report mentions mismatch between listed and stitched player name.',
    status: 'Under Review',
    statusKey: 'under-review',
    statusTone: 'orange',
    avatarTone: 'green',
  },
  {
    id: 'LST-0819',
    title: 'Lakers City Edition 2024',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80',
    seller: 'Derek Hall',
    email: 'derek@jerseysys.com',
    price: '$129',
    condition: 'New with tags',
    size: 'XL',
    category: 'Basketball',
    listedOn: 'Apr 10, 2026',
    reports: '2 reports',
    reportsTone: 'orange',
    reason: 'Prohibited item',
    reasonKey: 'prohibited',
    reasonTone: 'crimson',
    reported: 'Apr 18, 2026',
    description: 'City Edition jersey in mint condition. Includes original tags and retail bag, available for immediate shipping.',
    listingNote: 'Title and product tags mention memorabilia bundle not allowed in this category.',
    status: 'Under Review',
    statusKey: 'under-review',
    statusTone: 'orange',
    avatarTone: 'orange',
  },
  {
    id: 'LST-0798',
    title: 'Manchester City Away 2024',
    image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=900&q=80',
    seller: 'Sam Okafor',
    email: 'sam@jerseysys.com',
    price: '$155',
    condition: 'Used - Fair',
    size: 'L',
    category: 'Football',
    listedOn: 'Apr 2, 2026',
    reports: '6 reports',
    reportsTone: 'crimson',
    reason: 'Counterfeit',
    reasonKey: 'counterfeit',
    reasonTone: 'crimson',
    reported: 'Apr 16, 2026',
    description: 'Manchester City away kit listed as limited release. Seller claims original patch set and official numbering.',
    listingNote: 'Multiple buyers flagged crest stitching inconsistencies and missing serial details.',
    status: 'Flagged',
    statusKey: 'flagged',
    statusTone: 'crimson',
    avatarTone: 'crimson',
  },
  {
    id: 'LST-0785',
    title: 'Japan World Cup 2022 Home',
    image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=900&q=80',
    seller: 'Hana Kobayashi',
    email: 'hana@jerseysys.com',
    price: '$116',
    condition: 'Used - Good',
    size: 'S',
    category: 'Football',
    listedOn: 'Apr 1, 2026',
    reports: '3 reports',
    reportsTone: 'crimson',
    reason: 'Spam',
    reasonKey: 'spam',
    reasonTone: 'orange',
    reported: 'Apr 15, 2026',
    description: 'Home kit with clean print and no major defects. Seller cross-posted in multiple categories in under one hour.',
    listingNote: 'Removed previously for repetitive posting patterns across duplicate listings.',
    status: 'Removed',
    statusKey: 'removed',
    statusTone: 'crimson',
    avatarTone: 'green',
  },
  {
    id: 'LST-0771',
    title: 'PSG Home Jersey 2023',
    image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=900&q=80',
    seller: 'Ethan Brooks',
    email: 'ethan@jerseysys.com',
    price: '$121',
    condition: 'Used - Excellent',
    size: 'M',
    category: 'Football',
    listedOn: 'Mar 30, 2026',
    reports: '1 report',
    reportsTone: 'orange',
    reason: 'Misleading',
    reasonKey: 'misleading',
    reasonTone: 'orange',
    reported: 'Apr 14, 2026',
    description: 'PSG home jersey with fan version fit. Includes close-up shots of badge, seams, and wash tags.',
    listingNote: 'Resolved after seller uploaded corrected size measurements and clearer photos.',
    status: 'Resolved',
    statusKey: 'resolved',
    statusTone: 'green',
    avatarTone: 'orange',
  },
  {
    id: 'LST-0756',
    title: 'Chelsea Third Kit 2024',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80',
    seller: 'Nadia Jensen',
    email: 'nadia@jerseysys.com',
    price: '$133',
    condition: 'New without tags',
    size: 'L',
    category: 'Football',
    listedOn: 'Mar 25, 2026',
    reports: '2 reports',
    reportsTone: 'orange',
    reason: 'Prohibited item',
    reasonKey: 'prohibited',
    reasonTone: 'crimson',
    reported: 'Apr 13, 2026',
    description: 'Chelsea third kit with custom cup patches. Includes optional signed card bundle from unofficial source.',
    listingNote: 'Listing removed for including restricted bundle item in jersey listing.',
    status: 'Removed',
    statusKey: 'removed',
    statusTone: 'crimson',
    avatarTone: 'royal',
  },
  {
    id: 'LST-0741',
    title: 'Real Madrid 2023 Third Kit',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    seller: 'Fatima Al-Rashid',
    email: 'fatima@jerseysys.com',
    price: '$126',
    condition: 'Used - Good',
    size: 'M',
    category: 'Football',
    listedOn: 'Mar 20, 2026',
    reports: '1 report',
    reportsTone: 'orange',
    reason: 'Spam',
    reasonKey: 'spam',
    reasonTone: 'orange',
    reported: 'Apr 12, 2026',
    description: 'Real Madrid third kit with official club lettering. Re-listed after previous draft expired.',
    listingNote: 'Resolved once duplicate draft was archived and active listing kept.',
    status: 'Resolved',
    statusKey: 'resolved',
    statusTone: 'green',
    avatarTone: 'royal',
  },
];

const ModerateListings = () => {
  const [listingRecords, setListingRecords] = useState(listings);
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeReason, setActiveReason] = useState('all');
  const [reviewListingId, setReviewListingId] = useState(null);
  const [reviewDraft, setReviewDraft] = useState(null);

  const filteredListings = useMemo(() => {
    const search = normalizeText(query);

    return listingRecords.filter((listing) => {
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
  }, [activeStatus, activeReason, listingRecords, query]);

  const reviewedListing = useMemo(
    () => listingRecords.find((listing) => listing.id === reviewListingId) || null,
    [listingRecords, reviewListingId],
  );

  const handleOpenReview = (listing) => {
    setReviewListingId(listing.id);
    setReviewDraft({
      ...listing,
      moderatorNote: listing.moderatorNote || '',
    });
  };

  const handleCloseReview = () => {
    setReviewListingId(null);
    setReviewDraft(null);
  };

  const handleReviewChange = (field, value) => {
    setReviewDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const getStatusTone = (statusKey) => {
    if (statusKey === 'resolved') {
      return 'green';
    }

    if (statusKey === 'removed' || statusKey === 'flagged') {
      return 'crimson';
    }

    return 'orange';
  };

  const handleSaveReview = () => {
    if (!reviewDraft) {
      return;
    }

    const normalizedStatus = statusFilters.find((option) => option.value === reviewDraft.statusKey && option.value !== 'all');
    const nextListing = {
      ...reviewDraft,
      statusKey: normalizedStatus?.value || 'under-review',
      status: normalizedStatus?.label || 'Under Review',
      statusTone: getStatusTone(normalizedStatus?.value || 'under-review'),
      moderatorNote: String(reviewDraft.moderatorNote || '').trim(),
    };

    setListingRecords((currentListings) =>
      currentListings.map((listing) => (listing.id === reviewListingId ? nextListing : listing)),
    );

    handleCloseReview();
  };

  const handleRemoveListing = (listingId) => {
    setListingRecords((currentListings) =>
      currentListings.map((listing) =>
        listing.id === listingId
          ? {
            ...listing,
            status: 'Removed',
            statusKey: 'removed',
            statusTone: 'crimson',
            moderatorNote: listing.moderatorNote || 'Removed by moderation team.',
          }
          : listing,
      ),
    );
  };

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
                        <Button
                          className="admin-suite-inline-button"
                          variant="ghost"
                          onClick={() => handleOpenReview(listing)}
                        >
                          Review
                        </Button>
                        <Button
                          className="admin-suite-inline-button"
                          variant="secondary"
                          onClick={() => handleRemoveListing(listing.id)}
                          disabled={listing.statusKey === 'removed'}
                        >
                          {listing.statusKey === 'removed' ? 'Removed' : 'Remove'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-suite-footnote">
            Showing {filteredListings.length} of {listingRecords.length} reported listings. Act on flagged content to keep the marketplace safe.
          </div>
        </Card>
      </div>

      {reviewDraft && reviewedListing ? (
        <AdminModalPortal>
          <div
            className="admin-listing-review-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-listing-review-title"
            onClick={handleCloseReview}
          >
            <div className="admin-listing-review-modal ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-listing-review-head">
              <div>
                <div className="admin-suite-kicker">Listing review</div>
                <h2 className="admin-suite-table-title" id="admin-listing-review-title">
                  {reviewedListing.id}
                </h2>
              </div>
              <Button variant="ghost" onClick={handleCloseReview}>Close</Button>
            </div>

            <div className="admin-listing-review-content">
              <article className="admin-listing-review-media">
                <div className="admin-listing-review-image-wrap">
                  <img src={reviewedListing.image} alt={reviewedListing.title} />
                </div>
                <div className="admin-listing-review-item-meta">
                  <span>{reviewedListing.category}</span>
                  <strong>{reviewedListing.title}</strong>
                </div>
              </article>

              <div className="admin-listing-review-details">
                <div className="admin-trade-review-user">
                  <span className="admin-suite-avatar" style={toneAvatarStyles[reviewedListing.avatarTone]}>
                    {getInitials(reviewedListing.seller)}
                  </span>
                  <div>
                    <strong>{reviewedListing.seller}</strong>
                    <span>{reviewedListing.email}</span>
                  </div>
                </div>

                <p className="admin-listing-review-description">{reviewedListing.description}</p>

                <div className="admin-listing-review-meta">
                  <div><span>Price</span><strong>{reviewedListing.price}</strong></div>
                  <div><span>Size</span><strong>{reviewedListing.size}</strong></div>
                  <div><span>Condition</span><strong>{reviewedListing.condition}</strong></div>
                  <div><span>Listed on</span><strong>{reviewedListing.listedOn}</strong></div>
                  <div>
                    <span>Reports</span>
                    <strong>
                      <span className="admin-suite-pill" style={toneBadgeStyles[reviewedListing.reportsTone]}>
                        {reviewedListing.reports}
                      </span>
                    </strong>
                  </div>
                  <div>
                    <span>Reason</span>
                    <strong>
                      <span className="admin-suite-pill" style={toneBadgeStyles[reviewedListing.reasonTone]}>
                        {reviewedListing.reason}
                      </span>
                    </strong>
                  </div>
                  <div><span>Reported on</span><strong>{reviewedListing.reported}</strong></div>
                  <div>
                    <span>Status</span>
                    <strong>
                      <span className={`admin-suite-status is-${reviewedListing.statusTone}`}>{reviewedListing.status}</span>
                    </strong>
                  </div>
                </div>

                <div className="admin-listing-review-note">
                  <span>Current moderation note</span>
                  <strong>{reviewedListing.listingNote}</strong>
                </div>
              </div>
            </div>

            <div className="admin-listing-review-form">
              <FormField label="Status" htmlFor="admin-listing-review-status">
                <select
                  className="ui-select"
                  id="admin-listing-review-status"
                  value={reviewDraft.statusKey}
                  onChange={(event) => handleReviewChange('statusKey', event.target.value)}
                >
                  {statusFilters.filter((option) => option.value !== 'all').map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Moderator note" htmlFor="admin-listing-review-note">
                <textarea
                  className="ui-textarea"
                  id="admin-listing-review-note"
                  value={reviewDraft.moderatorNote}
                  onChange={(event) => handleReviewChange('moderatorNote', event.target.value)}
                  placeholder="Add moderation context for future audits."
                />
              </FormField>
            </div>

            <div className="admin-listing-review-actions">
              <Button variant="ghost" onClick={handleCloseReview}>Cancel</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  handleRemoveListing(reviewedListing.id);
                  handleCloseReview();
                }}
                disabled={reviewedListing.statusKey === 'removed'}
              >
                {reviewedListing.statusKey === 'removed' ? 'Already removed' : 'Remove listing'}
              </Button>
              <Button onClick={handleSaveReview}>Save review</Button>
            </div>
            </div>
          </div>
        </AdminModalPortal>
      ) : null}
    </AdminSuiteLayout>
  );
};

export default ModerateListings;
