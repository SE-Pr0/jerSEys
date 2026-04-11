import React from 'react';
import { Button, Card } from './ui';
import { useTrade } from '../context/TradeContext';

const STATUS_MAP = {
  pending:  { label: 'Pending',      cls: 'pending'   },
  accepted: { label: '✓ Accepted',   cls: 'available' },
  declined: { label: '✗ Declined',   cls: 'declined'  },
};

const TradeRequestCard = ({ request }) => {
  const { respondToRequest } = useTrade();
  const { id, listing, offer, message, date, direction, status } = request;

  const statusInfo = STATUS_MAP[status] || STATUS_MAP.pending;

  return (
    <Card className="trade-request-card">
      {/* Exchange visual */}
      <div className="trade-request-header">
        <div className="trade-exchange">
          <div className="trade-exchange-item">
            <span className="trade-exchange-emoji">{listing.emoji}</span>
            <div>
              <div className="trade-kicker" style={{ marginBottom: '4px' }}>Their jersey</div>
              <div className="trade-exchange-name">{listing.jerseyName}</div>
              <div className="trade-exchange-owner">listed by {listing.owner}</div>
            </div>
          </div>

          <div className="trade-exchange-arrow">⇄</div>

          <div className="trade-exchange-item">
            <div
              className="trade-avatar trade-avatar--lg"
              style={{ background: offer.color }}
            >
              {offer.initial}
            </div>
            <div>
              <div className="trade-kicker" style={{ marginBottom: '4px' }}>
                {direction === 'incoming' ? 'Their offer' : 'Your offer'}
              </div>
              <div className="trade-exchange-name">{offer.jerseyName}</div>
              <div className="trade-exchange-owner">from {offer.from}</div>
            </div>
          </div>
        </div>

        <span className={`trade-badge trade-badge--${statusInfo.cls}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Message */}
      {message && (
        <div className="trade-request-message">
          <span className="trade-message-quote">❝</span>
          <p>{message}</p>
        </div>
      )}

      {/* Footer */}
      <div className="trade-request-footer">
        <span className="trade-request-date">{date}</span>

        {direction === 'incoming' && status === 'pending' && (
          <div className="trade-request-actions">
            <Button variant="secondary" onClick={() => respondToRequest(id, 'declined')}>
              Decline
            </Button>
            <Button onClick={() => respondToRequest(id, 'accepted')}>
              Accept Offer
            </Button>
          </div>
        )}

        {direction === 'outgoing' && (
          <span className="trade-request-status-label">
            {status === 'pending'
              ? 'Awaiting response…'
              : status === 'accepted'
              ? '✓ Trade accepted!'
              : '✗ Offer declined'}
          </span>
        )}
      </div>
    </Card>
  );
};

export default TradeRequestCard;
