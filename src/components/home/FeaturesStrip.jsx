import React from 'react';
import '../../styles/home-features.css';

const FeaturesStrip = () => {
  return (
    <section className="features-strip">
      <div className="features-grid">
        <div className="feature-item">
          <div className="feature-icon">🚚</div>
          <div>
            <div className="feature-title">Free Shipping</div>
            <div className="feature-desc">Free worldwide delivery on orders over $75</div>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">✔️</div>
          <div>
            <div className="feature-title">Authenticity Verified</div>
            <div className="feature-desc">Every jersey checked by our admin team</div>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🔒</div>
          <div>
            <div className="feature-title">Secure Payments</div>
            <div className="feature-desc">256-bit SSL encrypted transactions</div>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📦</div>
          <div>
            <div className="feature-title">Easy Returns</div>
            <div className="feature-desc">30-day hassle-free return policy</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesStrip;
