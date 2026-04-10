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

const initialProfile = {
  firstName: 'Maya',
  lastName: 'Haddad',
  email: 'maya.haddad@example.com',
  phone: '+961 70 555 214',
  jerseySize: 'Medium',
  favoriteSport: 'Football',
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
  const [profile, setProfile] = useState(initialProfile);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [preferences, setPreferences] = useState({
    releases: true,
    restocks: true,
    tradeUpdates: false,
  });

  const memberSince = useMemo(() => 'August 2024', []);

  const handleChange = (field) => (event) => {
    setProfile((current) => ({
      ...current,
      [field]: event.target.value,
    }));
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
    setHasChanges(false);
    setSaveMessage('Profile details updated successfully.');
  };

  return (
    <PageShell className="profile-page">
      <PageHeader
        eyebrow="Account Hub"
        title="Your Profile"
        description="Manage your details, shipping preferences, and jersey settings from one place."
        actions={
          <>
            <Button variant="secondary" to="/shop">
              Browse Jerseys
            </Button>
            <Button type="submit" form="profile-form" disabled={!hasChanges}>
              Save Changes
            </Button>
          </>
        }
      />

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
                <FormField label="First name" htmlFor="profile-first-name">
                  <input
                    id="profile-first-name"
                    className="ui-input"
                    value={profile.firstName}
                    onChange={handleChange('firstName')}
                  />
                </FormField>
                <FormField label="Last name" htmlFor="profile-last-name">
                  <input
                    id="profile-last-name"
                    className="ui-input"
                    value={profile.lastName}
                    onChange={handleChange('lastName')}
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
                  />
                </FormField>
                <FormField label="Preferred jersey size" htmlFor="profile-size">
                  <select
                    id="profile-size"
                    className="ui-select"
                    value={profile.jerseySize}
                    onChange={handleChange('jerseySize')}
                  >
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
                    <option>Football</option>
                    <option>Basketball</option>
                  </select>
                </FormField>
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
            <div className="profile-member-panel">
              <div className="profile-avatar" aria-hidden="true">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>
              <div>
                <p className="profile-kicker">Member profile</p>
                <h2>
                  {profile.firstName} {profile.lastName}
                </h2>
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
