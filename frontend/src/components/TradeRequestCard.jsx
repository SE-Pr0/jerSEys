import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Card } from './ui';
import { useTrade } from '../context/TradeContext';

const STATUS_MAP = {
  pending: { label: 'Pending', cls: 'pending' },
  accepted: { label: 'Accepted', cls: 'available' },
  rejected: { label: 'Rejected', cls: 'declined' },
  completed: { label: 'Completed', cls: 'completed' },
};

const fallbackDescription = (item) => {
  if (typeof item?.description === 'string' && item.description.trim()) {
    return item.description.trim();
  }

  return 'No additional description provided for this offer.';
};

const TradeRequestCard = ({ request }) => {
  const { respondToRequest } = useTrade();
  const { id, listing, offer, message, date, direction, status } = request;
  const [showDetails, setShowDetails] = useState(false);

  const statusInfo = STATUS_MAP[status] || STATUS_MAP.pending;

  const { yourOffer, theirOffer } = useMemo(() => {
    if (direction === 'incoming') {
      return {
        yourOffer: {
          ...listing,
          ownerLabel: 'You',
        },
        theirOffer: {
          ...offer,
          ownerLabel: offer?.from || 'Trader',
        },
      };
    }

    return {
      yourOffer: {
        ...offer,
        ownerLabel: 'You',
      },
      theirOffer: {
        ...listing,
        ownerLabel: listing?.owner || 'Trader',
      },
    };
  }, [direction, listing, offer]);

  const theirOfferDescription = fallbackDescription(theirOffer);
  const theirOfferImage = theirOffer?.image || '';
  const theirOfferSize = theirOffer?.size || '';
  const theirOfferCondition = theirOffer?.condition || '';
  const theirOfferOwner = theirOffer?.ownerLabel || 'Trader';
  const detailsModal = showDetails ? (
    <div className="trade-offer-detail-overlay" role="presentation" onClick={() => setShowDetails(false)}>
      <Card className="trade-offer-detail-modal" onClick={(event) => event.stopPropagation()}>
        <div className="trade-offer-detail-header">
          <div className="trade-kicker" style={{ marginBottom: '6px' }}>Offer details</div>
          <h3>{theirOffer?.jerseyName || 'Jersey offer'}</h3>
          <p>Shared by {theirOfferOwner}</p>
        </div>

        <div className="trade-offer-detail-image-wrap">
          {theirOfferImage ? (
            <img src={theirOfferImage} alt={`${theirOffer?.jerseyName || 'Offered jersey'} preview`} />
          ) : (
            <div className="trade-offer-detail-image-empty">No image provided for this offer.</div>
          )}
        </div>

        <div className="trade-offer-detail-grid">
          <div className="trade-offer-detail-pill">
            <span>Jersey</span>
            <strong>{theirOffer?.jerseyName || 'Not provided'}</strong>
          </div>

          <div className="trade-offer-detail-pill">
            <span>Offered by</span>
            <strong>{theirOfferOwner}</strong>
          </div>

          {theirOfferSize ? (
            <div className="trade-offer-detail-pill">
              <span>Size</span>
              <strong>{theirOfferSize}</strong>
            </div>
          ) : (
            <div className="trade-offer-detail-pill">
              <span>Size</span>
              <strong>Not provided</strong>
            </div>
          )}

          {theirOfferCondition ? (
            <div className="trade-offer-detail-pill">
              <span>Condition</span>
              <strong>{theirOfferCondition}</strong>
            </div>
          ) : (
            <div className="trade-offer-detail-pill">
              <span>Condition</span>
              <strong>Not provided</strong>
            </div>
          )}
        </div>

        <div className="trade-offer-detail-description">
          <div className="trade-kicker" style={{ marginBottom: '6px' }}>Description</div>
          <p>{theirOfferDescription}</p>
        </div>

        <div className="trade-offer-detail-actions">
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  ) : null;

  return (
    <>
      <Card className="trade-request-card">
        <div className="trade-request-header">
          <div className="trade-offer-summary-grid">
            <div className="trade-offer-summary-card">
              <div className="trade-kicker" style={{ marginBottom: '4px' }}>You offer</div>
              <div className="trade-exchange-name">{yourOffer?.jerseyName || 'Unknown jersey'}</div>
              <div className="trade-exchange-owner">by {yourOffer?.ownerLabel || 'you'}</div>
            </div>

            <div className="trade-offer-summary-divider" aria-hidden="true">&harr;</div>

            <div className="trade-offer-summary-card">
              <div className="trade-kicker" style={{ marginBottom: '4px' }}>They offer</div>
              <div className="trade-offer-summary-main">
                <div>
                  <div className="trade-exchange-name">{theirOffer?.jerseyName || 'Unknown jersey'}</div>
                  <div className="trade-exchange-owner">by {theirOffer?.ownerLabel || 'trader'}</div>
                </div>
                <Button
                  variant="secondary"
                  className="trade-offer-inline-details"
                  onClick={() => setShowDetails(true)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>

          <span className={`trade-badge trade-badge--${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
        </div>

        {message ? (
          <div className="trade-request-message">
            <span className="trade-message-quote">&quot;</span>
            <div className="trade-request-message-content">
              <p>{message}</p>
            </div>
          </div>
        ) : null}

        <div className="trade-request-footer">
          <span className="trade-request-date">{date}</span>

          {direction === 'incoming' && status === 'pending' ? (
            <div className="trade-request-actions">
              <Button variant="secondary" onClick={() => respondToRequest(id, 'rejected')}>
                Reject
              </Button>
              <Button onClick={() => respondToRequest(id, 'accepted')}>
                Accept Offer
              </Button>
            </div>
          ) : null}

          {direction === 'incoming' && status === 'accepted' ? (
            <div className="trade-request-actions">
              <Button onClick={() => respondToRequest(id, 'completed')}>
                Mark as Completed
              </Button>
            </div>
          ) : null}

          {direction === 'outgoing' ? (
            <div className="trade-request-actions">
              <span className="trade-request-status-label">
                {status === 'pending' ? 'Awaiting response...'
                  : status === 'accepted' ? 'Accepted - arrange the swap!'
                    : status === 'completed' ? 'Trade completed'
                      : 'Offer rejected'}
              </span>
            </div>
          ) : null}
        </div>
      </Card>

      {detailsModal && typeof document !== 'undefined' ? createPortal(detailsModal, document.body) : null}
    </>
  );
};

export default TradeRequestCard;
