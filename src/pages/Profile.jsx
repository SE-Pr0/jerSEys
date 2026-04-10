import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  FormField,
  PageHeader,
  PageShell,
  StateBlock,
} from '../components/ui';
import '../styles/profile.css';
import { getStoredUser, setStoredUser } from '../utils/auth';

const createInitialProfile = () => {
  const storedUser = getStoredUser();

  return {
    username: storedUser?.username || '',
    fullName: storedUser?.fullName || '',
    email: storedUser?.email || '',
    phone: storedUser?.phone || '',
    jerseySize: storedUser?.jerseySize || '',
    favoriteSport: storedUser?.favoriteSport || '',
  };
};

const savedAddress = {
  label: 'Primary shipping address',
  line1: '15 Bliss Street',
  line2: 'Hamra',
  city: 'Beirut',
  country: 'Lebanon',
};

const profileHighlights = [
  { value: '14', label: 'Orders placed' },
  { value: '3', label: 'Custom kits created' },
  { value: 'Gold', label: 'Member tier' },
];

const Profile = () => {
  const [profile, setProfile] = useState(createInitialProfile);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [preferences, setPreferences] = useState({
    releases: true,
    restocks: true,
    tradeUpdates: false,
  });

  const memberSince = useMemo(() => 'August 2024', []);

  const handleChange = (field) => (event) => {
    const nextValue = event.target.value;

    setProfile((current) => {
      const nextProfile = {
        ...current,
        [field]: nextValue,
      };

      setStoredUser({
        ...getStoredUser(),
        username: nextProfile.username.trim(),
        fullName: nextProfile.fullName.trim(),
        email: nextProfile.email.trim(),
        phone: nextProfile.phone.trim(),
        jerseySize: nextProfile.jerseySize,
        favoriteSport: nextProfile.favoriteSport,
      });

      return nextProfile;
    });

    setHasChanges(true);
    setSaveMessage('');
  };

  const handlePreferenceToggle = (field) => (event) => {
    setPreferences((current) => ({
      ...current,
      [field]: event.target.checked,
    }));
    setHasChanges(true);
    setSaveMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStoredUser({
      ...getStoredUser(),
      username: profile.username.trim(),
      fullName: profile.fullName.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      jerseySize: profile.jerseySize,
      favoriteSport: profile.favoriteSport,
    });
    setHasChanges(false);
    setSaveMessage('Profile details updated successfully.');
  };

  const displayName = profile.fullName.trim() || profile.username.trim() || 'Member';
  const avatarLetters = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return (
    <PageShell className="profile-page">
      <div className="profile-top-section">
        <PageHeader
          eyebrow="Account Hub"
          title={(
            <>
              Your
              <br />
              <span>Profile</span>
            </>
          )}
          description={(
            <>
              Manage your details, shipping preferences,
              <br />
              and jersey settings from one place.
            </>
          )}
        />

        <Card className="profile-card profile-member-card">
          <div className="profile-member-panel">
            <div className="profile-avatar" aria-hidden="true">
              {avatarLetters || 'M'}
            </div>
            <div>
              <p className="profile-kicker">Member profile</p>
              <h2>{displayName}</h2>
              <p className="profile-member-copy">Member since {memberSince}</p>
            </div>
          </div>

          <div className="profile-highlights">
            {profileHighlights.map((item) => (
              <div key={item.label} className="profile-highlight">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="profile-grid">
        <div className="profile-main-column">
          <Card className="profile-card">
            <div className="profile-section-heading">
              <div>
                <p className="profile-kicker">Personal details</p>
                <h2>Account information</h2>
              </div>
              <span className="profile-section-note">Keep your checkout details up to date.</span>
            </div>

            <form id="profile-form" className="ui-form" onSubmit={handleSubmit}>
              <div className="ui-form-grid">
                <FormField label="Username" htmlFor="profile-username">
                  <input
                    id="profile-username"
                    className="ui-input"
                    value={profile.username}
                    onChange={handleChange('username')}
                  />
                </FormField>
                <FormField label="Full name" htmlFor="profile-full-name">
                  <input
                    id="profile-full-name"
                    className="ui-input"
                    value={profile.fullName}
                    onChange={handleChange('fullName')}
                    placeholder="Add your full name"
                  />
                </FormField>
                <FormField label="Email address" htmlFor="profile-email">
                  <input
                    id="profile-email"
                    className="ui-input"
                    type="email"
                    value={profile.email}
                    onChange={handleChange('email')}
                  />
                </FormField>
                <FormField label="Phone number" htmlFor="profile-phone">
                  <input
                    id="profile-phone"
                    className="ui-input"
                    type="tel"
                    value={profile.phone}
                    onChange={handleChange('phone')}
                    placeholder="Add your phone number"
                  />
                </FormField>
                <FormField label="Preferred jersey size" htmlFor="profile-size">
                  <select
                    id="profile-size"
                    className="ui-select"
                    value={profile.jerseySize}
                    onChange={handleChange('jerseySize')}
                  >
                    <option value="">Select size</option>
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                    <option>XL</option>
                  </select>
                </FormField>
                <FormField label="Favorite sport" htmlFor="profile-sport">
                  <select
                    id="profile-sport"
                    className="ui-select"
                    value={profile.favoriteSport}
                    onChange={handleChange('favoriteSport')}
                  >
                    <option value="">Select sport</option>
                    <option>Football</option>
                    <option>Basketball</option>
                  </select>
                </FormField>
              </div>

              <div className="profile-form-actions">
                <Button type="submit" disabled={!hasChanges}>
                  Save Changes
                </Button>
              </div>

              {saveMessage ? <p className="profile-save-message">{saveMessage}</p> : null}
            </form>
          </Card>

          <Card className="profile-card">
            <div className="profile-section-heading">
              <div>
                <p className="profile-kicker">Notifications</p>
                <h2>Shopping preferences</h2>
              </div>
            </div>

            <div className="profile-preferences">
              <label className="profile-toggle">
                <div>
                  <span>New release alerts</span>
                  <p>Be the first to know when fresh drops hit the store.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.releases}
                  onChange={handlePreferenceToggle('releases')}
                />
              </label>

              <label className="profile-toggle">
                <div>
                  <span>Restock reminders</span>
                  <p>Receive updates when sold-out sizes become available again.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.restocks}
                  onChange={handlePreferenceToggle('restocks')}
                />
              </label>

              <label className="profile-toggle">
                <div>
                  <span>Trade marketplace activity</span>
                  <p>Get notified when buyers react to your listings or requests.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.tradeUpdates}
                  onChange={handlePreferenceToggle('tradeUpdates')}
                />
              </label>
            </div>
          </Card>
        </div>

        <div className="profile-side-column">
          <Card className="profile-card">
            <div className="profile-section-heading">
              <div>
                <p className="profile-kicker">Delivery</p>
                <h2>Saved address</h2>
              </div>
            </div>

            <div className="profile-address">
              <strong>{savedAddress.label}</strong>
              <p>{savedAddress.line1}</p>
              <p>{savedAddress.line2}</p>
              <p>
                {savedAddress.city}, {savedAddress.country}
              </p>
            </div>

            <Button variant="secondary">Manage Addresses</Button>
          </Card>

          <StateBlock
            icon="*"
            title="Keep your profile match-ready"
            description="A complete account makes checkout faster and helps surface the right jersey sizes and release updates."
            actions={<Button to="/shop">Continue Shopping</Button>}
          />
        </div>
      </div>
    </PageShell>
  );
};

export default Profile;
