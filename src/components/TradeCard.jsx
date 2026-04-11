import React from 'react';
import { Link } from 'react-router-dom';

const TradeCard = ({ listing }) => {
  const {
    id,
    emoji,
    jerseyName,
    club,
    size,
    conditionDetail,
    seller,
    status,
    estimatedValue,
  } = listing;

  const isAvailable = status === 'available';

  return (
    <article className="trade-card">
      <div className="trade-card-visual">
        <span className="trade-card-emoji">{emoji}</span>
        <div className="trade-card-badge">
          <span className={`trade-badge trade-badge--${status}`}>
            {isAvailable ? '✓ Available' : '⏳ Pending'}
          </span>
        </div>
      </div>

      <div className="trade-card-body">
        <div className="trade-user-row">
          <div className="trade-avatar" style={{ background: seller.color }}>
            {seller.initial}
          </div>
          <span className="trade-username">{seller.name}</span>
        </div>

        <div>
          <div className="trade-kicker" style={{ marginBottom: '4px' }}>{club}</div>
          <div className="trade-card-name">{jerseyName}</div>
          <div className="trade-card-detail">
            Size {size} &middot; {conditionDetail}
          </div>
        </div>

        <div className="trade-card-footer">
          <span className="trade-card-value">~{estimatedValue}</span>
          {isAvailable ? (
            <Link to={`/trade/${id}`} className="trade-card-offer-btn">
              Make Offer →
            </Link>
          ) : (
            <span className="trade-card-offer-btn is-disabled">In Negotiation</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default TradeCard;
