import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, FormField, PageHeader, PageShell, StateBlock } from '../components/ui';
import { useTrade } from '../context/TradeContext';
import { getStoredUser } from '../utils/auth';
import '../styles/trade.css';

const SPORTS   = ['Football', 'Basketball'];
const SIZES    = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CONDS    = ['Brand new', 'Near mint', 'Good', 'Used'];
const EMOJIS   = { Football: '⚽', Basketball: '🏀' };

const LISTING_TYPES = [
  { value: 'trade', label: '⇄  Trade Only',        hint: 'Accept jersey offers only' },
  { value: 'sale',  label: '$  For Sale',           hint: 'Set a fixed buy-it-now price' },
  { value: 'both',  label: '⇄$  Trade + Buy Now',  hint: 'Accept offers or direct purchase' },
];

const defaultForm = {
  jerseyName:   '',
  club:         '',
  sport:        'Football',
  size:         '',
  condition:    '',
  description:  '',
  lookingFor:   '',
  listingType:  'trade',
  price:        '',
  imageUrl:     '',
};

const CreateTradeListing = () => {
  const { addListing } = useTrade();
  const navigate = useNavigate();
  const [form, setForm]           = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser]           = useState(() => getStoredUser());
  const fileInputRef              = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageUrl: objectUrl, imageFileName: file.name }));
  };

  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener('jerseys-auth-change', handler);
    return () => window.removeEventListener('jerseys-auth-change', handler);
  }, []);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const pick = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const createdListingId = addListing(form);
    if (!createdListingId) {
      navigate('/login', {
        state: { from: '/trade/create' },
      });
      return;
    }

    setSubmitted(true);
  };

  /* ── Auth gate ── */
  if (!user) {
    return (
      <PageShell narrow className="trade-page">
        <StateBlock
          icon="🔒"
          title="Sign in to list a jersey"
          description="You need a jerSEys account to create trade listings. It only takes a minute to register."
          centered
          actions={
            <>
              <Button to="/login">Sign In</Button>
              <Button variant="secondary" to="/register">Create Account</Button>
            </>
          }
        />
      </PageShell>
    );
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <PageShell narrow className="trade-page">
        <PageHeader
          eyebrow="Jersey Trading"
          title={
            <>
              Listing
              <br />
              <span>Created!</span>
            </>
          }
          description="Your jersey is now live on the marketplace. Other traders can browse it and send you offers."
        />

        <Card>
          <div className="trade-success-block">
            <span className="trade-success-icon">✓</span>
            <p>
              <strong>{form.jerseyName || 'Your jersey'}</strong> (Size {form.size || '—'},{' '}
              {form.condition || '—'})
              {form.price && form.listingType !== 'trade' ? ` at $${form.price}` : ''} has been
              listed. You'll be notified when someone makes an offer or purchase.
            </p>
          </div>

          <div className="trade-success-actions">
            <Button to="/trade">Browse Marketplace</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmitted(false);
                setForm(defaultForm);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              List Another Jersey
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  /* ── Form screen ── */
  return (
    <PageShell narrow className="trade-page trade-page--create">
      <PageHeader
        eyebrow="Jersey Trading"
        title={(
          <>
            List Your <span>Jersey</span>
          </>
        )}
        description={(
          <span className="trade-create-description">
            Put your jersey up for trade. Other members will browse your listing and make you offers from their own collections.
          </span>
        )}
      />

      {/* Form */}
      <Card>
        <form className="ui-form" onSubmit={handleSubmit}>

          {/* ── Section: Jersey Details ── */}
          <div className="trade-section-heading">Jersey Details</div>

          <div className="ui-form-grid">
            <FormField label="Jersey Name" htmlFor="jersey-name">
              <input
                id="jersey-name"
                className="ui-input"
                type="text"
                placeholder="e.g. Arsenal Away Kit 24/25"
                value={form.jerseyName}
                onChange={update('jerseyName')}
                required
              />
            </FormField>

            <FormField label="Club / Team" htmlFor="jersey-club">
              <input
                id="jersey-club"
                className="ui-input"
                type="text"
                placeholder="e.g. Arsenal FC"
                value={form.club}
                onChange={update('club')}
                required
              />
            </FormField>
          </div>

          <FormField label="Jersey Photo" htmlFor="jersey-image">
            <input
              ref={fileInputRef}
              id="jersey-image"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              required
            />
            {form.imageUrl ? (
              <div className="trade-upload-preview">
                <img src={form.imageUrl} alt="Jersey preview" className="trade-upload-thumb" />
                <div className="trade-upload-preview-info">
                  <span className="trade-upload-filename">{form.imageFileName}</span>
                  <button
                    type="button"
                    className="trade-upload-change"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Change photo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="trade-upload-area"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="trade-upload-icon">↑</span>
                <span className="trade-upload-label">Attach a photo</span>
                <span className="trade-upload-hint">JPG, PNG, WEBP</span>
              </button>
            )}
          </FormField>

          <FormField label="Sport">
            <div className="trade-option-row">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`trade-option-btn${form.sport === s ? ' is-active' : ''}`}
                  onClick={() => pick('sport', s)}
                >
                  {EMOJIS[s]} {s}
                </button>
              ))}
            </div>
          </FormField>

          {/* ── Section: Condition ── */}
          <div className="trade-section-heading" style={{ marginTop: 'var(--space-3)' }}>
            Condition
          </div>

          <div className="ui-form-grid">
            <FormField label="Size">
              <div className="trade-size-row">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`trade-size-btn${form.size === s ? ' is-active' : ''}`}
                    onClick={() => pick('size', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Condition" htmlFor="jersey-condition">
              <select
                id="jersey-condition"
                className="ui-select"
                value={form.condition}
                onChange={update('condition')}
                required
              >
                <option value="">Select condition…</option>
                {CONDS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* ── Section: Pricing ── */}
          <div className="trade-section-heading" style={{ marginTop: 'var(--space-3)' }}>
            Pricing
          </div>

          <FormField label="Listing Type" hint={LISTING_TYPES.find(t => t.value === form.listingType)?.hint}>
            <div className="trade-option-row">
              {LISTING_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`trade-option-btn${form.listingType === t.value ? ' is-active' : ''}`}
                  onClick={() => pick('listingType', t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </FormField>

          <FormField
            label={form.listingType === 'trade' ? 'Estimated Worth' : 'Buy-It-Now Price'}
            htmlFor="jersey-price"
            hint={
              form.listingType === 'trade'
                ? 'Helps traders gauge the value of your jersey when considering an offer.'
                : 'Set a fair price in USD. Buyers can purchase directly at this price.'
            }
          >
            <div className="trade-price-input-wrap">
              <span className="trade-price-symbol">$</span>
              <input
                id="jersey-price"
                className="ui-input trade-price-input"
                type="number"
                min="1"
                max="9999"
                placeholder="e.g. 85"
                value={form.price}
                onChange={update('price')}
                required
              />
            </div>
          </FormField>

          {/* ── Section: Description ── */}
          <div className="trade-section-heading" style={{ marginTop: 'var(--space-3)' }}>
            Description
          </div>

          <FormField
            label="About this jersey"
            htmlFor="jersey-description"
            hint="Be honest about the condition, any defects, season, and authenticity. Good descriptions get more offers."
          >
            <textarea
              id="jersey-description"
              className="ui-textarea"
              placeholder="Describe the jersey — season, condition details, any flaws, whether it's authentic or replica…"
              value={form.description}
              onChange={update('description')}
              required
            />
          </FormField>

          <FormField
            label="Looking for"
            htmlFor="jersey-looking"
            hint="Let traders know what you'd accept in return. Be specific or stay open — your call."
          >
            <textarea
              id="jersey-looking"
              className="ui-textarea"
              style={{ minHeight: '96px' }}
              placeholder="e.g. Open to Premier League kits or NBA jerseys in size M–L…"
              value={form.lookingFor}
              onChange={update('lookingFor')}
            />
          </FormField>

          <div className="trade-form-actions">
            <Button variant="secondary" to="/trade">
              Cancel
            </Button>
            <Button type="submit">
              List for Trade
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
};

export default CreateTradeListing;

