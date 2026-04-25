import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, FormField, PageHeader, PageShell, StateBlock } from '../components/ui';
import { useTrade } from '../context/TradeContext';
import { getStoredUser } from '../utils/auth';
import '../styles/trade.css';

const CART_STORAGE_KEY = 'jerseys-cart';
const CART_EVENT_NAME = 'jerseys-cart-change';

const readStoredCart = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredCart = (items) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT_NAME));
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });

const TradeListingDetails = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { listings, addRequest } = useTrade();
  const listing = listings.find((l) => l.id === listingId);

  const [offerJersey, setOfferJersey] = useState('');
  const [message, setMessage] = useState('');
  const [offerImage, setOfferImage] = useState('');
  const [offerImageName, setOfferImageName] = useState('');
  const [sent, setSent] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener('jerseys-auth-change', handler);
    return () => window.removeEventListener('jerseys-auth-change', handler);
  }, []);

  if (!listing) {
    return (
      <PageShell className="trade-page">
        <StateBlock
          icon="?"
          title="Trade listing not found"
          description="That jersey listing may have been removed or the link is incorrect."
          centered
          actions={
            <>
              <Button variant="secondary" to="/trade">
                Browse Marketplace
              </Button>
              <Button to="/trade/create">List Your Jersey</Button>
            </>
          }
        />
      </PageShell>
    );
  }

  const {
    image,
    jerseyName,
    club,
    size,
    condition,
    conditionDetail,
    description,
    lookingFor,
    seller,
    status,
    listingType,
    price,
    listedDate,
    estimatedValue,
  } = listing;

  const showPrice = price && listingType !== 'trade';
  const canTrade  = listingType === 'trade' || listingType === 'both';

  const redirectToLogin = () => {
    navigate('/login', {
      state: { from: `${location.pathname}${location.search}${location.hash}` },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      redirectToLogin();
      return;
    }

    if (!offerImage) {
      return;
    }

    const created = addRequest(listing.id, offerJersey, message, offerImage);
    if (!created) {
      redirectToLogin();
      return;
    }

    setSent(true);
  };

  const handleOfferImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setOfferImage('');
      setOfferImageName('');
      return;
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      setOfferImage(String(imageDataUrl));
      setOfferImageName(file.name || 'kit-image');
    } catch {
      setOfferImage('');
      setOfferImageName('');
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      redirectToLogin();
      return;
    }

    const cartKey = `trade-listing|${listing.id}`;
    const unitPrice = Number(price) || 0;
    const nextCartItem = {
      cartKey,
      id: listing.id,
      productId: listing.id,
      itemType: 'trade-listing',
      name: jerseyName,
      title: jerseyName,
      team: club,
      sportLabel: 'Trade marketplace',
      categoryLabel: listingType === 'both' ? 'Trade + Buy now' : 'Buy now listing',
      season: listedDate || '',
      image,
      badge: '',
      price: unitPrice,
      unitPrice,
      quantity: 1,
      size,
      selectedSize: size,
      sellerName: seller?.name || '',
      sellerId: seller?.id || '',
      listingType,
    };

    const currentCart = readStoredCart();
    const existingItemIndex = currentCart.findIndex((item) => item.cartKey === cartKey);

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex] = {
        ...currentCart[existingItemIndex],
        quantity: Number(currentCart[existingItemIndex].quantity || 1) + 1,
      };
    } else {
      currentCart.push(nextCartItem);
    }

    writeStoredCart(currentCart);
    setAddedToCart(true);
  };

  return (
    <PageShell className="trade-page">
      {/* Back */}
      <div className="trade-details-back">
        <Button variant="ghost" to="/trade">
          ← Back to Marketplace
        </Button>
      </div>

      <div className="trade-details-grid">
        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Visual card */}
          <Card className="trade-details-visual" padded={false}>
            <div className="trade-details-emoji-wrap">
              <img
                src={image}
                alt={jerseyName}
                className="trade-details-img"
              />
              <div className="trade-details-badge-wrap">
                <span className={`trade-badge trade-badge--${status} trade-badge--lg`}>
                  {status === 'available' ? '✓ Available' : '⏳ In Negotiation'}
                </span>
              </div>
            </div>

            <div className="trade-details-visual-footer">
              <div className="trade-details-value-row">
                <span className="trade-details-value-label">
                  {showPrice ? 'Buy Now Price' : 'Est. Value'}
                </span>
                <span className="trade-details-value">
                  {showPrice ? `$${price}` : estimatedValue}
                </span>
              </div>
              <div className="trade-details-value-row">
                <span className="trade-details-value-label">Listed</span>
                <span className="trade-details-value-date">{listedDate}</span>
              </div>
            </div>
          </Card>

          {/* Seller card */}
          <Card className="trade-details-seller-card">
            <div className="trade-kicker">Listed by</div>
            <div className="trade-user-row trade-user-row--lg">
              <div
                className="trade-avatar trade-avatar--lg"
                style={{ background: seller.color }}
              >
                {seller.initial}
              </div>
              <div>
                <div className="trade-username" style={{ fontSize: '15px' }}>
                  {seller.name}
                </div>
                <div className="trade-user-meta">Verified trader &middot; Since 2025</div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="trade-details-right">
          <PageHeader
            eyebrow={club}
            title={jerseyName}
            description={null}
          />

          {/* Jersey specs */}
          <Card>
            <div className="trade-details-meta-grid">
              <div className="trade-meta-item">
                <span className="trade-meta-label">Size</span>
                <span className="trade-meta-value">{size}</span>
              </div>
              <div className="trade-meta-item">
                <span className="trade-meta-label">Condition</span>
                <span className="trade-meta-value">{condition}</span>
              </div>
              <div className="trade-meta-item">
                <span className="trade-meta-label">Detail</span>
                <span className="trade-meta-value">{conditionDetail}</span>
              </div>
            </div>

            <div className="trade-details-section">
              <div className="trade-section-heading">About this jersey</div>
              <p className="trade-details-description">{description}</p>
            </div>

            <div className="trade-details-section">
              <div className="trade-section-heading">Looking for</div>
              <p className="trade-details-description">{lookingFor}</p>
            </div>
          </Card>

          {/* Buy Now card (sale / both) */}
          {showPrice && status === 'available' && (
            <Card>
              <div className="trade-details-buynow">
                <div>
                  <div className="trade-kicker">Buy It Now</div>
                  <div className="trade-details-buynow-price">${price}</div>
                  <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
                    Instant purchase · No negotiation needed
                  </p>
                </div>
                {!user ? (
                  <div className="trade-auth-gate">
                    <p className="trade-auth-gate-text">Sign in to purchase this jersey.</p>
                    <div className="trade-auth-gate-actions">
                      <Button to="/login">Sign In</Button>
                      <Button variant="secondary" to="/register">Create Account</Button>
                    </div>
                  </div>
                ) : addedToCart ? (
                  <div className="trade-offer-sent" style={{ marginBottom: 0 }}>
                    <span className="trade-offer-sent-icon">✓</span>
                    <div>
                      <strong>Added to cart!</strong>
                      <p>You can review this item in your cart whenever you're ready.</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    block
                    onClick={() => {
                      if (!user) {
                        redirectToLogin();
                        return;
                      }

                      handleBuyNow();
                    }}
                  >
                    Buy Now — ${price}
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Trade offer card (trade / both) */}
          {canTrade && status === 'available' && (
            <Card>
              <div className="trade-section-heading">
                {listingType === 'both' ? 'Or Make a Trade Offer' : 'Make an Offer'}
              </div>

              {!user ? (
                <div className="trade-auth-gate">
                  <p className="trade-auth-gate-text">Sign in to send a trade offer.</p>
                  <div className="trade-auth-gate-actions">
                    <Button to="/login">Sign In</Button>
                    <Button variant="secondary" to="/register">Create Account</Button>
                  </div>
                </div>
              ) : sent ? (
                <div className="trade-offer-sent">
                  <span className="trade-offer-sent-icon">✓</span>
                  <div>
                    <strong>Offer sent!</strong>
                    <p>
                      We've notified <strong>{seller.name}</strong>. They'll review your offer and
                      get back to you soon.
                    </p>
                  </div>
                </div>
              ) : (
                <form className="ui-form trade-offer-form" onSubmit={handleSubmit}>
                  <FormField
                    label="Your Jersey"
                    htmlFor="offer-jersey"
                    hint="Name the jersey you're offering in exchange — include size and condition."
                  >
                    <input
                      id="offer-jersey"
                      className="ui-input"
                      type="text"
                      placeholder="e.g. FC Barcelona Home 25/26 — Size M, near mint"
                      value={offerJersey}
                      onChange={(e) => setOfferJersey(e.target.value)}
                      required
                    />
                  </FormField>

                  <div className="trade-offer-form-row">
                    <FormField
                      label="Message"
                      htmlFor="offer-message"
                      hint="Introduce yourself and give them a reason to say yes."
                    >
                      <textarea
                        id="offer-message"
                        className="ui-textarea"
                        placeholder="Tell them about your jersey's condition and why you're interested in theirs..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </FormField>

                    <FormField
                      label="Kit Image"
                      htmlFor="offer-image"
                      hint="Required: upload a clear photo of the jersey you are offering."
                    >
                      <div className="trade-offer-image-wrap">
                        <input
                          id="offer-image"
                          className="ui-input"
                          type="file"
                          accept="image/*"
                          onChange={handleOfferImageChange}
                          required
                        />
                        {offerImage ? (
                          <div className="trade-offer-image-preview">
                            <img src={offerImage} alt="Your offered jersey" />
                            <span>{offerImageName || 'Selected image'}</span>
                          </div>
                        ) : (
                          <p className="trade-offer-image-placeholder">No image selected yet.</p>
                        )}
                      </div>
                    </FormField>
                  </div>

                  <Button type="submit" block>
                    Send Trade Offer
                  </Button>
                </form>
              )}
            </Card>
          )}

          {/* Pending / unavailable */}
          {status !== 'available' && (
            <Card>
              <div className="trade-pending-notice">
                <span>⏳</span>
                <div>
                  <strong>Listing in negotiation</strong>
                  <p>
                    {seller.name} is currently considering another offer. Check back later or
                    browse other available listings.
                  </p>
                </div>
              </div>
              <Button variant="secondary" to="/trade" block>
                Browse More Listings
              </Button>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default TradeListingDetails;

