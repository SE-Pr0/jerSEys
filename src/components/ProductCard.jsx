import React from 'react';
import '../styles/product-card.css';

const ProductCard = ({
  sport = 'Football',
  club = 'Club',
  name = 'Jersey Name',
  price = '0.00',
  priceOld,
  sizes = [],
  badge,
  image,
  onAddToCart,
}) => {
  const badgeClass = badge === 'new' ? 'card-new-tag' : badge === 'hot' ? 'card-hot-tag' : '';
  const badgeLabel = badge === 'new' ? 'New' : badge === 'hot' ? 'Hot' : '';

  const backgroundStyle = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <div className="jersey-card">
      <div className="jersey-img-wrap" style={backgroundStyle}>
        <div className="card-sport-tag">{sport}</div>
        {badgeClass && <div className={badgeClass}>{badgeLabel}</div>}
        <div className="card-overlay">
          <button
            type="button"
            className="card-quick-add"
            onClick={() => onAddToCart?.(name)}
          >
            Add to Cart
          </button>
        </div>
      </div>
      <div className="jersey-card-body">
        <div className="card-club">{club}</div>
        <div className="card-title">{name}</div>
        <div className="card-footer">
          <div>
            <span className="card-price">${price}</span>
            {priceOld && <span className="card-price-old">${priceOld}</span>}
          </div>
          <div className="card-sizes">
            {sizes.map((size) => (
              <span key={size} className="size-dot">
                {size}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
