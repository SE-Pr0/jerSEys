import React, { useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  FormField,
  PageHeader,
  PageShell,
  StateBlock,
} from '../components/ui';
import lebanonFlag from '../../assets/icons/Flag_of_Lebanon.png';
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
    profileImage: storedUser?.profileImage || '',
  };
};

const createInitialAddress = () => {
  const storedUser = getStoredUser();

  return {
    street: storedUser?.address?.street || '',
    area: storedUser?.address?.area || '',
    country: storedUser?.address?.country || '',
  };
};

const createInitialPreferences = () => {
  const storedUser = getStoredUser();

  return {
    releases: storedUser?.preferences?.releases ?? true,
    restocks: storedUser?.preferences?.restocks ?? true,
    tradeUpdates: storedUser?.preferences?.tradeUpdates ?? false,
  };
};

const profileHighlights = [
  { value: '14', label: 'Orders placed' },
  { value: '3', label: 'Custom kits created' },
  { value: 'Gold', label: 'Member tier' },
];

const isValidPhoneNumber = (value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return true;
  }

  if (!/^[+\d\s()-]+$/.test(trimmedValue)) {
    return false;
  }

  const digitsOnly = trimmedValue.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

const Profile = () => {
  const [profile, setProfile] = useState(createInitialProfile);
  const [address, setAddress] = useState(createInitialAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [preferences, setPreferences] = useState(createInitialPreferences);

  const memberSince = useMemo(() => 'August 2024', []);

  const handleChange = (field) => (event) => {
    const nextValue = event.target.value;

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      if (field === 'phone' && !isValidPhoneNumber(nextValue)) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });

    setProfile((current) => {
      const nextProfile = {
        ...current,
        [field]: nextValue,
      };

      const phoneToStore = isValidPhoneNumber(nextProfile.phone)
        ? nextProfile.phone.trim()
        : (getStoredUser()?.phone || '');

      setStoredUser({
        ...getStoredUser(),
        username: nextProfile.username.trim(),
        fullName: nextProfile.fullName.trim(),
        email: nextProfile.email.trim(),
        phone: phoneToStore,
        jerseySize: nextProfile.jerseySize,
        favoriteSport: nextProfile.favoriteSport,
        profileImage: nextProfile.profileImage,
      });

      return nextProfile;
    });

    setHasChanges(true);
    setSaveMessage('');
  };

  const handlePreferenceToggle = (field) => (event) => {
    const nextChecked = event.target.checked;

    setPreferences((current) => {
      const nextPreferences = {
        ...current,
        [field]: nextChecked,
      };

      setStoredUser({
        ...getStoredUser(),
        username: profile.username.trim(),
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        jerseySize: profile.jerseySize,
        favoriteSport: profile.favoriteSport,
        profileImage: profile.profileImage,
        preferences: nextPreferences,
        address: {
          street: address.street.trim(),
          area: address.area.trim(),
          country: address.country.trim(),
        },
      });

      return nextPreferences;
    });

    setHasChanges(true);
    setSaveMessage('');
  };

  const handleAddressChange = (field) => (event) => {
    const nextValue = event.target.value;

    setAddress((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  const handleAddressSubmit = (event) => {
    event.preventDefault();

    const nextAddress = {
      street: address.street.trim(),
      area: address.area.trim(),
      country: address.country.trim(),
    };

    setAddress(nextAddress);
    setStoredUser({
      ...getStoredUser(),
      address: nextAddress,
      preferences,
    });
    setIsEditingAddress(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!isValidPhoneNumber(profile.phone)) {
      nextErrors.phone = 'Enter a valid phone number.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStoredUser({
      ...getStoredUser(),
      username: profile.username.trim(),
      fullName: profile.fullName.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      jerseySize: profile.jerseySize,
      favoriteSport: profile.favoriteSport,
      profileImage: profile.profileImage,
      preferences,
      address: {
        street: address.street.trim(),
        area: address.area.trim(),
        country: address.country.trim(),
      },
    });
    setHasChanges(false);
    setSaveMessage('Profile details updated successfully.');
  };

  const handleProfileImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : '';

      setProfile((current) => ({
        ...current,
        profileImage: imageData,
      }));

      setStoredUser({
        ...getStoredUser(),
        username: profile.username.trim(),
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        jerseySize: profile.jerseySize,
        favoriteSport: profile.favoriteSport,
        profileImage: imageData,
        preferences,
        address: {
          street: address.street.trim(),
          area: address.area.trim(),
          country: address.country.trim(),
        },
      });

      setHasChanges(true);
      setSaveMessage('');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const displayName = profile.fullName.trim() || profile.username.trim() || 'Member';
  const hasSavedAddress = Boolean(address.street || address.area || address.country);
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
            <button
              type="button"
              className="profile-avatar-button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile picture"
            >
              <div className="profile-avatar">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={`${displayName} profile`}
                    className="profile-avatar-image"
                  />
                ) : (
                  <span>{avatarLetters || 'M'}</span>
                )}
                <div className="profile-avatar-overlay" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h3l1.5-2h7L17 7h3v11H4z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                </div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="profile-avatar-input"
              onChange={handleProfileImageSelect}
            />
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

          <Button className="profile-order-history-link" variant="ghost" to="/order-history">
            <span>See Order History</span>
            <span className="profile-order-history-arrow" aria-hidden="true">→</span>
          </Button>
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
                <FormField
                  label="Phone number"
                  htmlFor="profile-phone"
                  error={errors.phone}
                >
                  <div className="profile-phone-field">
                    <div className="profile-phone-prefix" aria-hidden="true">
                      <img
                        src={lebanonFlag}
                        alt=""
                        className="profile-phone-flag"
                      />
                      <span className="profile-phone-caret">▾</span>
                    </div>
                    <input
                      id="profile-phone"
                      className="ui-input profile-phone-input"
                      type="tel"
                      inputMode="tel"
                      value={profile.phone}
                      onChange={handleChange('phone')}
                      placeholder="70 123 456"
                    />
                  </div>
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
                {saveMessage ? <p className="profile-save-message">{saveMessage}</p> : null}
                <Button type="submit" disabled={!hasChanges}>
                  Save Changes
                </Button>
              </div>
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

            {isEditingAddress ? (
              <form className="ui-form" onSubmit={handleAddressSubmit}>
                <FormField label="Street" htmlFor="address-street">
                  <input
                    id="address-street"
                    className="ui-input"
                    value={address.street}
                    onChange={handleAddressChange('street')}
                    placeholder="Enter street"
                  />
                </FormField>
                <FormField label="Area" htmlFor="address-area">
                  <input
                    id="address-area"
                    className="ui-input"
                    value={address.area}
                    onChange={handleAddressChange('area')}
                    placeholder="Enter area"
                  />
                </FormField>
                <FormField label="Country" htmlFor="address-country">
                  <input
                    id="address-country"
                    className="ui-input"
                    value={address.country}
                    onChange={handleAddressChange('country')}
                    placeholder="Enter country"
                  />
                </FormField>

                <Button type="submit" variant="secondary">
                  Save Address
                </Button>
              </form>
            ) : hasSavedAddress ? (
              <div className="profile-address">
                {address.street ? <p>{address.street}</p> : null}
                {address.area ? <p>{address.area}</p> : null}
                {address.country ? <p>{address.country}</p> : null}
              </div>
            ) : (
              <div className="profile-address profile-address-empty">
                <p>No address saved yet.</p>
              </div>
            )}

            {!isEditingAddress ? (
              <Button variant="secondary" onClick={() => setIsEditingAddress(true)}>
                Manage Address
              </Button>
            ) : null}
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
