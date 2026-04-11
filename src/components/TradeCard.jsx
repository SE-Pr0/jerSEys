import React from 'react';
import { Link } from 'react-router-dom';

const TradeCard = ({ listing }) => {
  const {
    id,
    image,
    jerseyName,
    club,
    size,
    conditionDetail,
    seller,
    status,
    listingType,
    price,
    estimatedValue,
  } = listing;

  const isAvailable  = status === 'available';
  const isTradeOnly  = listingType === 'trade';
  const showPrice    = price && !isTradeOnly;
  const canTrade     = isTradeOnly || listingType === 'both';

  return (
    <article className="trade-card">
      <div className="trade-card-visual">
        <img
          src={image}
          alt={jerseyName}
          className="trade-card-img"
          loading="lazy"
        />
        <div className="trade-card-badge">
          <span className={`trade-badge trade-badge--${status}`}>
            {isAvailable ? '✓ Available' : '⏳ Pending'}
          </span>
        </div>
        {showPrice && isAvailable && (
          <div className="trade-card-price-tag">${price}</div>
        )}
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
          {showPrice
            ? <span className="trade-card-price">${price}</span>
            : <span className="trade-card-value">~{estimatedValue}</span>
          }
          {isAvailable ? (
            <div className="trade-card-actions">
              {showPrice && (
                <Link to={`/trade/${id}`} className="trade-card-buy-btn">
                  Buy Now
                </Link>
              )}
              {canTrade && (
                <Link to={`/trade/${id}`} className="trade-card-offer-btn">
                  {listingType === 'both' ? 'Offer' : 'Make Offer →'}
                </Link>
              )}
            </div>
          ) : (
            <span className="trade-card-offer-btn is-disabled">In Negotiation</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default TradeCard;
