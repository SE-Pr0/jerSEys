import React, { useMemo, useState } from 'react';
import { Button, Card, FormField } from '../../components/ui';
import AdminSuiteLayout from './AdminSuiteLayout';
import {
  adminSectionTabs,
  buildSearchBlob,
  getInitials,
  toneAvatarStyles,
  toneBadgeStyles,
  toneBarStyles,
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

const users = [
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

const roleBreakdown = [
  { label: 'Admins', count: 12, share: 14, tone: 'crimson' },
  { label: 'Managers', count: 27, share: 23, tone: 'royal' },
  { label: 'Staff', count: 58, share: 37, tone: 'orange' },
  { label: 'Customers', count: 1149, share: 26, tone: 'green' },
];

const approvalQueue = [
  {
    title: 'Florence Shaw',
    detail: 'Access review approved for catalog and order control.',
    tone: 'green',
  },
  {
    title: 'Rana Haddad',
    detail: 'Waiting on two-factor verification before promotion.',
    tone: 'orange',
  },
  {
    title: 'Karim Nasser',
    detail: 'Account suspended until payment dispute is cleared.',
    tone: 'crimson',
  },
];

const securityNotes = [
  '94% of accounts have 2FA enabled.',
  '7 user records still need phone verification.',
  'Bulk permission changes were last audited 3 days ago.',
];

const ManageUsers = () => {
  const [query, setQuery] = useState('');
  const [activeRole, setActiveRole] = useState('all');

  const filteredUsers = useMemo(() => {
    const search = normalizeText(query);

    return users.filter((user) => {
      const matchesRole = activeRole === 'all' || user.roleKey === activeRole;
      const matchesSearch = buildSearchBlob([
        user.name,
        user.email,
        user.role,
        user.lastActive,
        user.status,
        user.access.map((item) => item.label),
      ]).includes(search);

      return matchesRole && matchesSearch;
    });
  }, [activeRole, query]);

  return (
    <AdminSuiteLayout
      actions={(
        <>
          <Button to="/admin/manage-orders" variant="secondary">
            Orders
          </Button>
          <Button to="/admin/manage-inventory">
            Inventory
          </Button>
        </>
      )}
      className="admin-users-page"
      description="Review team access, approvals, and account health from one control surface."
      eyebrow="Admin Console"
      metrics={userMetrics}
      tabs={adminSectionTabs}
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

            <div className="admin-suite-filter-group">
              <Button variant="secondary">Invite user</Button>
              <Button variant="ghost">Export CSV</Button>
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
                  <tr key={user.email}>
                    <td>
                      <div className="admin-suite-name-cell">
                        <span className="admin-suite-avatar" style={toneAvatarStyles[user.avatarTone]}>
                          {getInitials(user.name)}
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
                        <Button className="admin-suite-inline-button" variant="ghost">
                          View
                        </Button>
                        <Button className="admin-suite-inline-button" variant="secondary">
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
            Showing {filteredUsers.length} of {users.length} users. Review permissions regularly to keep access clean.
          </div>
        </Card>

        <div className="admin-suite-side-stack">
          <Card className="admin-suite-side-card">
            <div className="admin-suite-side-header">
              <div>
                <div className="admin-suite-kicker">Role mix</div>
                <h2 className="admin-suite-side-title">How the account base is split.</h2>
              </div>
            </div>

            <div className="admin-suite-bars">
              {roleBreakdown.map((item) => (
                <div className="admin-suite-bar-item" key={item.label}>
                  <div className="admin-suite-side-header">
                    <strong>{item.label}</strong>
                    <span className="admin-suite-table-count">{item.count} users</span>
                  </div>
                  <div className="admin-suite-bar-track">
                    <div className="admin-suite-bar-fill" style={{ width: `${item.share}%`, ...toneBarStyles[item.tone] }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="admin-suite-side-card">
            <div className="admin-suite-side-header">
              <div>
                <div className="admin-suite-kicker">Approval queue</div>
                <h2 className="admin-suite-side-title">Waiting on review.</h2>
              </div>
            </div>

            <div className="admin-suite-list">
              {approvalQueue.map((item) => (
                <div className="admin-suite-list-item" key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                  <span className="admin-suite-pill" style={toneBadgeStyles[item.tone]}>
                    Review
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="admin-suite-side-card">
            <div className="admin-suite-side-header">
              <div>
                <div className="admin-suite-kicker">Security</div>
                <h2 className="admin-suite-side-title">Quick account health checks.</h2>
              </div>
            </div>

            <div className="admin-suite-list">
              {securityNotes.map((note) => (
                <div className="admin-suite-list-item" key={note}>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminSuiteLayout>
  );
};

export default ManageUsers;
