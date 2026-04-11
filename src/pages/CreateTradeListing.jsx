import React, { useState } from 'react';
import { Button, Card, FormField, PageHeader, PageShell } from '../components/ui';
import '../styles/trade.css';

const SPORTS   = ['Football', 'Basketball'];
const SIZES    = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CONDS    = ['Brand new', 'Near mint', 'Good', 'Used'];
const EMOJIS   = { Football: '⚽', Basketball: '🏀' };

const defaultForm = {
  jerseyName:  '',
  club:        '',
  sport:       'Football',
  size:        '',
  condition:   '',
  description: '',
  lookingFor:  '',
};

const CreateTradeListing = () => {
  const [form, setForm]         = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const pick = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
              {form.condition || '—'}) has been listed. You'll be notified when someone makes an
              offer.
            </p>
          </div>

          <div className="trade-success-actions">
            <Button to="/trade">Browse Marketplace</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSubmitted(false);
                setForm(defaultForm);
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
    <PageShell narrow className="trade-page">
      <PageHeader
        eyebrow="Jersey Trading"
        title={
          <>
            List Your
            <br />
            <span>Jersey</span>
          </>
        }
        description="Put your jersey up for trade. Other members will browse your listing and make you offers from their own collections."
      />

      {/* Live preview */}
      <Card>
        <div className="trade-kicker" style={{ marginBottom: 'var(--space-3)' }}>
          Listing Preview
        </div>
        <div className="create-listing-preview">
          <div className="create-listing-preview-emoji">
            {EMOJIS[form.sport] || '⚽'}
          </div>
          <div className="create-listing-preview-info">
            <div className="trade-kicker" style={{ marginBottom: '6px' }}>
              {form.club || 'Club / Team Name'}
            </div>
            <div className="create-listing-preview-name">
              {form.jerseyName || 'Jersey Name'}
            </div>
            <div className="create-listing-preview-meta">
              {[form.size && `Size ${form.size}`, form.condition]
                .filter(Boolean)
                .join(' · ') || 'Size · Condition'}
            </div>
          </div>
          <span className="trade-badge trade-badge--available">✓ Available</span>
        </div>
      </Card>

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
