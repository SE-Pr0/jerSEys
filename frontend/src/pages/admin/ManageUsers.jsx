import React, { useMemo, useState } from 'react';
import { Button, Card, FormField } from '../../components/ui';
import AdminSuiteLayout from './AdminSuiteLayout';
import {
  buildSearchBlob,
  getInitials,
  toneAvatarStyles,
  toneBadgeStyles,
  normalizeText,
} from './adminConstants';

const userMetrics = [
  {
    label: 'Active users',
    value: '1,248',
    trend: '+62 this month',
    trendTone: 'positive',
    note: 'Accounts with recent logins, activity, or order history.',
    tone: 'royal',
  },
  {
    label: 'New invites',
    value: '18',
    trend: '7 awaiting approval',
    trendTone: 'warning',
    note: 'People waiting on account verification or access review.',
    tone: 'orange',
  },
  {
    label: 'Suspended',
    value: '4',
    trend: '2 need follow up',
    trendTone: 'negative',
    note: 'Accounts held while orders or payment issues are resolved.',
    tone: 'crimson',
  },
  {
    label: 'Verified rate',
    value: '96%',
    trend: '+2% since last audit',
    trendTone: 'positive',
    note: 'Users with confirmed profiles and stable sign-in records.',
    tone: 'green',
  },
];

const roleFilters = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admins' },
  { value: 'manager', label: 'Managers' },
  { value: 'staff', label: 'Staff' },
  { value: 'customer', label: 'Customers' },
  { value: 'suspended', label: 'Suspended' },
];

const initialUsers = [
  {
    name: 'Florence Shaw',
    email: 'florence@jerseysys.com',
    role: 'Admin',
    roleKey: 'admin',
    access: [
      { label: 'Products', tone: 'royal' },
      { label: 'Users', tone: 'crimson' },
      { label: 'Orders', tone: 'orange' },
    ],
    lastActive: '2 min ago',
    status: 'Active',
    statusTone: 'green',
    avatarTone: 'crimson',
  },
  {
    name: 'Amelie Laurent',
    email: 'amelie@jerseysys.com',
    role: 'Manager',
    roleKey: 'manager',
    access: [
      { label: 'Orders', tone: 'orange' },
      { label: 'Inventory', tone: 'green' },
    ],
    lastActive: '18 min ago',
    status: 'Active',
    statusTone: 'green',
    avatarTone: 'royal',
  },
  {
    name: 'Ammar Foley',
    email: 'ammar@jerseysys.com',
    role: 'Staff',
    roleKey: 'staff',
    access: [
      { label: 'Support', tone: 'royal' },
      { label: 'Orders', tone: 'orange' },
    ],
    lastActive: '44 min ago',
    status: 'Pending',
    statusTone: 'orange',
    avatarTone: 'orange',
  },
  {
    name: 'Caitlyn King',
    email: 'caitlyn@jerseysys.com',
    role: 'Customer',
    roleKey: 'customer',
    access: [
      { label: 'Orders', tone: 'orange' },
    ],
    lastActive: '1 hr ago',
    status: 'Active',
    statusTone: 'green',
    avatarTone: 'green',
  },
  {
    name: 'Sienna Hewitt',
    email: 'sienna@jerseysys.com',
    role: 'Customer',
    roleKey: 'customer',
    access: [
      { label: 'Trade', tone: 'royal' },
      { label: 'Wishlist', tone: 'green' },
    ],
    lastActive: 'Yesterday',
    status: 'Suspended',
    statusTone: 'crimson',
    avatarTone: 'crimson',
  },
  {
    name: 'Olly Shroeder',
    email: 'olly@jerseysys.com',
    role: 'Staff',
    roleKey: 'staff',
    access: [
      { label: 'Inventory', tone: 'green' },
      { label: 'Analytics', tone: 'royal' },
    ],
    lastActive: '3 hrs ago',
    status: 'Active',
    statusTone: 'green',
    avatarTone: 'royal',
  },
  {
    name: 'Mathilde Lewis',
    email: 'mathilde@jerseysys.com',
    role: 'Manager',
    roleKey: 'manager',
    access: [
      { label: 'Users', tone: 'crimson' },
      { label: 'Orders', tone: 'orange' },
      { label: 'Reports', tone: 'royal' },
    ],
    lastActive: '4 hrs ago',
    status: 'Active',
    statusTone: 'green',
    avatarTone: 'orange',
  },
  {
    name: 'Jaya Willis',
    email: 'jaya@jerseysys.com',
    role: 'Customer',
    roleKey: 'customer',
    access: [
      { label: 'Checkout', tone: 'orange' },
    ],
    lastActive: '5 hrs ago',
    status: 'Pending',
    statusTone: 'orange',
    avatarTone: 'green',
  },
];

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
  { value: 'customer', label: 'Customer' },
];

const statusOptions = [
  { value: 'green', label: 'Active' },
  { value: 'orange', label: 'Pending' },
  { value: 'crimson', label: 'Suspended' },
];

const avatarOptions = [
  { value: 'royal', label: 'Royal' },
  { value: 'orange', label: 'Orange' },
  { value: 'crimson', label: 'Crimson' },
  { value: 'green', label: 'Green' },
];

const profileImageSeeds = ['mia', 'amelie', 'ammar', 'caitlyn', 'sienna', 'olly', 'mathilde', 'jaya'];

const defaultAccessTone = {
  products: 'royal',
  users: 'crimson',
  orders: 'orange',
  inventory: 'green',
  support: 'royal',
  trade: 'royal',
  wishlist: 'green',
  analytics: 'royal',
  reports: 'royal',
  checkout: 'orange',
};

const toneCycle = ['royal', 'orange', 'crimson', 'green'];

const getRoleLabel = (roleKey) =>
  roleOptions.find((role) => role.value === roleKey)?.label || 'Customer';

const getStatusLabel = (statusTone) =>
  statusOptions.find((status) => status.value === statusTone)?.label || 'Active';

const parseAccessInput = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label, index) => {
      const normalized = normalizeText(label);
      const tone = defaultAccessTone[normalized] || toneCycle[index % toneCycle.length];
      return {
        label,
        tone,
      };
    });

const ManageUsers = () => {
  const [userRecords, setUserRecords] = useState(() =>
    initialUsers.map((user, index) => ({
      ...user,
      id: `USR-${String(index + 1).padStart(4, '0')}`,
      isVerified: user.statusTone === 'green',
      accountNotes: '',
      lastAdminAction: 'No recent admin action',
      profileImage: `https://api.dicebear.com/7.x/adventurer/png?seed=${profileImageSeeds[index] || user.name}`,
    })),
  );
  const [query, setQuery] = useState('');
  const [activeRole, setActiveRole] = useState('all');
  const [viewingUserId, setViewingUserId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [draftUser, setDraftUser] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');

  const filteredUsers = useMemo(() => {
    const search = normalizeText(query);

    return userRecords.filter((user) => {
      const matchesRole = activeRole === 'all'
        || (activeRole === 'suspended'
          ? user.statusTone === 'crimson'
          : user.roleKey === activeRole);
      const matchesSearch = buildSearchBlob([
        user.id,
        user.name,
        user.email,
        user.role,
        user.lastActive,
        user.status,
        user.access.map((item) => item.label),
      ]).includes(search);

      return matchesRole && matchesSearch;
    });
  }, [activeRole, query, userRecords]);

  const viewingUser = useMemo(
    () => userRecords.find((user) => user.id === viewingUserId) || null,
    [userRecords, viewingUserId],
  );

  const handleOpenView = (user) => {
    setViewingUserId(user.id);
    setAdminMessage('');
  };

  const handleCloseView = () => {
    setViewingUserId(null);
    setAdminMessage('');
  };

  const handleOpenEdit = (user) => {
    setEditingUserId(user.id);
    setDraftUser({
      ...user,
      accessInput: user.access.map((item) => item.label).join(', '),
    });
    setAdminMessage('');
  };

  const handleCloseEdit = () => {
    setEditingUserId(null);
    setDraftUser(null);
    setAdminMessage('');
  };

  const handleDraftChange = (field, value) => {
    setDraftUser((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSaveUser = () => {
    if (!draftUser) {
      return;
    }

    const normalizedRoleKey = roleOptions.some((role) => role.value === draftUser.roleKey)
      ? draftUser.roleKey
      : 'customer';
    const normalizedStatusTone = statusOptions.some((status) => status.value === draftUser.statusTone)
      ? draftUser.statusTone
      : 'green';
    const normalizedAvatarTone = avatarOptions.some((avatar) => avatar.value === draftUser.avatarTone)
      ? draftUser.avatarTone
      : 'royal';
    const access = parseAccessInput(draftUser.accessInput);

    setUserRecords((currentUsers) =>
      currentUsers.map((user) =>
        user.id === editingUserId
          ? {
            ...user,
            name: draftUser.name.trim() || user.name,
            email: draftUser.email.trim() || user.email,
            roleKey: normalizedRoleKey,
            role: getRoleLabel(normalizedRoleKey),
            access: access.length ? access : user.access,
            lastActive: draftUser.lastActive.trim() || user.lastActive,
            statusTone: normalizedStatusTone,
            status: getStatusLabel(normalizedStatusTone),
            avatarTone: normalizedAvatarTone,
            profileImage: String(draftUser.profileImage || '').trim(),
            accountNotes: draftUser.accountNotes?.trim() || '',
            isVerified: Boolean(draftUser.isVerified),
            lastAdminAction: draftUser.lastAdminAction || user.lastAdminAction,
          }
          : user,
      ),
    );
    handleCloseEdit();
  };

  const handleAdminAction = (action) => {
    if (!draftUser) {
      return;
    }

    if (action === 'suspend') {
      setDraftUser((current) => (current
        ? {
          ...current,
          statusTone: 'crimson',
          lastAdminAction: 'Account suspended by admin',
        }
        : current));
      setAdminMessage('Account status changed to Suspended.');
      return;
    }

    if (action === 'reactivate') {
      setDraftUser((current) => (current
        ? {
          ...current,
          statusTone: 'green',
          lastAdminAction: 'Account reactivated by admin',
        }
        : current));
      setAdminMessage('Account status changed to Active.');
      return;
    }

    if (action === 'force-sign-out') {
      setDraftUser((current) => (current
        ? {
          ...current,
          lastActive: 'Just now (forced sign-out)',
          lastAdminAction: 'Forced sign-out executed',
        }
        : current));
      setAdminMessage('Forced sign-out recorded on this account.');
      return;
    }

    if (action === 'reset-password') {
      setDraftUser((current) => (current
        ? {
          ...current,
          lastAdminAction: 'Password reset link sent',
        }
        : current));
      setAdminMessage('Password reset link queued for this user.');
      return;
    }

    if (action === 'verify-toggle') {
      setDraftUser((current) => (current
        ? {
          ...current,
          isVerified: !current.isVerified,
          lastAdminAction: current.isVerified ? 'Verification removed' : 'Account marked verified',
        }
        : current));
      setAdminMessage(draftUser.isVerified ? 'Verification removed.' : 'Account marked as verified.');
    }
  };

  return (
    <AdminSuiteLayout
      className="admin-users-page"
      description=""
      eyebrow="Admin Console"
      metrics={userMetrics}
      title={(
        <>
          Manage <span>Users</span>
        </>
      )}
    >
      <div className="admin-suite-workspace">
        <Card className="admin-suite-panel admin-suite-main-panel">
          <div className="admin-suite-toolbar">
            <FormField label="Search users" htmlFor="admin-user-search">
              <input
                className="ui-input"
                id="admin-user-search"
                placeholder="Search name, email, or role"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </FormField>

            <FormField label="Role" htmlFor="admin-user-role">
              <select
                className="ui-select"
                id="admin-user-role"
                value={activeRole}
                onChange={(event) => setActiveRole(event.target.value)}
              >
                {roleFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="admin-suite-table-header">
            <div>
              <div className="admin-suite-kicker">User directory</div>
              <h2 className="admin-suite-table-title">
                {filteredUsers.length} records matched
              </h2>
              <p className="admin-suite-table-subtitle">
                Manage permissions, review account state, and keep the storefront team aligned.
              </p>
            </div>
          </div>

          <div className="admin-suite-table-wrap">
            <table className="admin-suite-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Access</th>
                  <th>Last active</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-suite-name-cell">
                        <span className="admin-suite-avatar" style={toneAvatarStyles[user.avatarTone]}>
                          {user.profileImage ? (
                            <img
                              className="admin-suite-avatar-image"
                              src={user.profileImage}
                              alt={user.name}
                            />
                          ) : (
                            getInitials(user.name)
                          )}
                        </span>
                        <div>
                          <strong>{user.name}</strong>
                          <span className="admin-suite-subtext">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-suite-pill" style={toneBadgeStyles[user.avatarTone]}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="admin-suite-pill-group">
                        {user.access.map((item) => (
                          <span className="admin-suite-pill" key={item.label} style={toneBadgeStyles[item.tone]}>
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{user.lastActive}</td>
                    <td>
                      <span className={`admin-suite-status is-${user.statusTone}`}>{user.status}</span>
                    </td>
                    <td>
                      <div className="admin-suite-actions">
                        <Button
                          className="admin-suite-inline-button"
                          variant="ghost"
                          onClick={() => handleOpenView(user)}
                        >
                          View
                        </Button>
                        <Button
                          className="admin-suite-inline-button"
                          variant="secondary"
                          onClick={() => handleOpenEdit(user)}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-suite-footnote">
            Showing {filteredUsers.length} of {userRecords.length} users. Review permissions regularly to keep access clean.
          </div>
        </Card>

      </div>

      {viewingUser ? (
        <div
          className="admin-user-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-user-view-title"
          onClick={handleCloseView}
        >
          <div className="admin-user-modal ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-user-modal-head">
              <div>
                <div className="admin-suite-kicker">Account detail</div>
                <h2 className="admin-suite-table-title" id="admin-user-view-title">
                  {viewingUser.name}
                </h2>
              </div>
              <Button variant="ghost" onClick={handleCloseView}>Close</Button>
            </div>

            <div className="admin-user-view-grid">
              <div className="admin-user-view-profile">
                <span className="admin-suite-avatar" style={toneAvatarStyles[viewingUser.avatarTone]}>
                  {viewingUser.profileImage ? (
                    <img
                      className="admin-suite-avatar-image"
                      src={viewingUser.profileImage}
                      alt={viewingUser.name}
                    />
                  ) : (
                    getInitials(viewingUser.name)
                  )}
                </span>
                <div>
                  <strong>{viewingUser.name}</strong>
                  <span>{viewingUser.email}</span>
                  <span>{viewingUser.id}</span>
                </div>
              </div>

              <div className="admin-user-view-info">
                <div><span>Role</span><strong>{viewingUser.role}</strong></div>
                <div><span>Status</span><strong>{viewingUser.status}</strong></div>
                <div><span>Last active</span><strong>{viewingUser.lastActive}</strong></div>
                <div><span>Verified</span><strong>{viewingUser.isVerified ? 'Yes' : 'No'}</strong></div>
                <div className="admin-user-view-access">
                  <span>Access</span>
                  <div className="admin-suite-pill-group">
                    {viewingUser.access.map((item) => (
                      <span className="admin-suite-pill" key={item.label} style={toneBadgeStyles[item.tone]}>
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span>Last admin action</span>
                  <strong>{viewingUser.lastAdminAction}</strong>
                </div>
              </div>
            </div>

            <div className="admin-user-modal-actions">
              <Button variant="ghost" onClick={handleCloseView}>Close</Button>
              <Button
                onClick={() => {
                  handleCloseView();
                  handleOpenEdit(viewingUser);
                }}
              >
                Edit account
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {draftUser ? (
        <div
          className="admin-user-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-user-edit-title"
          onClick={handleCloseEdit}
        >
          <div className="admin-user-modal admin-user-modal--wide ui-card" onClick={(event) => event.stopPropagation()}>
            <div className="admin-user-modal-head">
              <div>
                <div className="admin-suite-kicker">User editor</div>
                <h2 className="admin-suite-table-title" id="admin-user-edit-title">
                  Edit {draftUser.name}
                </h2>
              </div>
              <Button variant="ghost" onClick={handleCloseEdit}>Close</Button>
            </div>

            <div className="admin-user-editor-content">
              <div className="admin-user-editor-preview">
                <div className="admin-user-view-profile">
                  <span className="admin-suite-avatar" style={toneAvatarStyles[draftUser.avatarTone]}>
                    {draftUser.profileImage ? (
                      <img
                        className="admin-suite-avatar-image"
                        src={draftUser.profileImage}
                        alt={draftUser.name}
                      />
                    ) : (
                      getInitials(draftUser.name)
                    )}
                  </span>
                  <div>
                    <strong>{draftUser.name}</strong>
                    <span>{draftUser.email}</span>
                    <span>{draftUser.id}</span>
                  </div>
                </div>
                <div className="admin-user-editor-preview-meta">
                  <span>{draftUser.role}</span>
                  <span>{getStatusLabel(draftUser.statusTone)}</span>
                  <span>{draftUser.isVerified ? 'Verified' : 'Unverified'}</span>
                  <span>{draftUser.lastActive}</span>
                </div>
              </div>

              <div className="admin-user-editor-form-wrap">
                <div className="admin-user-editor-form">
                  <FormField label="Full name" htmlFor="admin-user-edit-name">
                    <input
                      className="ui-input"
                      id="admin-user-edit-name"
                      value={draftUser.name}
                      onChange={(event) => handleDraftChange('name', event.target.value)}
                    />
                  </FormField>

                  <FormField label="Email" htmlFor="admin-user-edit-email">
                    <input
                      className="ui-input"
                      id="admin-user-edit-email"
                      type="email"
                      value={draftUser.email}
                      onChange={(event) => handleDraftChange('email', event.target.value)}
                    />
                  </FormField>

                  <FormField label="Role" htmlFor="admin-user-edit-role">
                    <select
                      className="ui-select"
                      id="admin-user-edit-role"
                      value={draftUser.roleKey}
                      onChange={(event) => {
                        const nextRoleKey = event.target.value;
                        handleDraftChange('roleKey', nextRoleKey);
                        handleDraftChange('role', getRoleLabel(nextRoleKey));
                      }}
                    >
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Status" htmlFor="admin-user-edit-status">
                    <select
                      className="ui-select"
                      id="admin-user-edit-status"
                      value={draftUser.statusTone}
                      onChange={(event) => {
                        const nextStatus = event.target.value;
                        handleDraftChange('statusTone', nextStatus);
                        handleDraftChange('status', getStatusLabel(nextStatus));
                      }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Profile picture URL" htmlFor="admin-user-edit-profile-image">
                    <input
                      className="ui-input"
                      id="admin-user-edit-profile-image"
                      value={draftUser.profileImage || ''}
                      onChange={(event) => handleDraftChange('profileImage', event.target.value)}
                      placeholder="https://..."
                    />
                  </FormField>

                  <FormField label="Last active label" htmlFor="admin-user-edit-last-active">
                    <input
                      className="ui-input"
                      id="admin-user-edit-last-active"
                      value={draftUser.lastActive}
                      onChange={(event) => handleDraftChange('lastActive', event.target.value)}
                    />
                  </FormField>

                  <FormField label="Access labels (comma separated)" htmlFor="admin-user-edit-access">
                    <input
                      className="ui-input"
                      id="admin-user-edit-access"
                      value={draftUser.accessInput}
                      onChange={(event) => handleDraftChange('accessInput', event.target.value)}
                    />
                  </FormField>

                  <FormField label="Account notes" htmlFor="admin-user-edit-notes">
                    <textarea
                      className="ui-textarea"
                      id="admin-user-edit-notes"
                      value={draftUser.accountNotes}
                      onChange={(event) => handleDraftChange('accountNotes', event.target.value)}
                    />
                  </FormField>
                </div>

                <div className="admin-user-admin-strip">
                  <div className="admin-user-admin-strip-head">
                    <strong>Admin actions</strong>
                    <label className="admin-user-verify-toggle">
                      <input
                        type="checkbox"
                        checked={draftUser.isVerified}
                        onChange={() => handleAdminAction('verify-toggle')}
                      />
                      <span>{draftUser.isVerified ? 'Verified account' : 'Unverified account'}</span>
                    </label>
                  </div>
                  <div className="admin-user-admin-actions">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        handleDraftChange('profileImage', '');
                        setAdminMessage('Profile picture removed. Default avatar restored.');
                      }}
                    >
                      Remove profile picture
                    </Button>
                    <Button variant="secondary" onClick={() => handleAdminAction('reset-password')}>
                      Send reset link
                    </Button>
                    <Button variant="secondary" onClick={() => handleAdminAction('force-sign-out')}>
                      Force sign-out
                    </Button>
                    {draftUser.statusTone === 'crimson' ? (
                      <Button variant="secondary" onClick={() => handleAdminAction('reactivate')}>
                        Reactivate account
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={() => handleAdminAction('suspend')}>
                        Suspend account
                      </Button>
                    )}
                  </div>
                  {adminMessage ? <p className="admin-user-admin-message">{adminMessage}</p> : null}
                </div>
              </div>
            </div>

            <div className="admin-user-modal-actions">
              <Button variant="ghost" onClick={handleCloseEdit}>Cancel</Button>
              <Button onClick={handleSaveUser}>Save account</Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminSuiteLayout>
  );
};

export default ManageUsers;
