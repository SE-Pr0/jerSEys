import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  FormField,
  PageHeader,
  PageShell,
} from '../components/ui';
import '../styles/auth.css';
import { getStoredUser, setStoredUser } from '../utils/auth';

const initialValues = {
  identity: '',
  password: '',
};

const PasswordVisibilityIcon = ({ isVisible }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {isVisible ? (
      <>
        <path d="M2 12s3.75-6 10-6 10 6 10 6-3.75 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.75" />
      </>
    ) : (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.58 10.58A2 2 0 0 0 10 12a2 2 0 0 0 3.42 1.42" />
        <path d="M9.88 5.09A11.4 11.4 0 0 1 12 4.9c6.25 0 10 6.1 10 6.1a18.46 18.46 0 0 1-3.04 3.8" />
        <path d="M6.61 6.63A18.7 18.7 0 0 0 2 12s3.75 6 10 6a11.5 11.5 0 0 0 2.76-.32" />
      </>
    )}
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!values.identity.trim()) {
      nextErrors.identity = 'Username or email is required.';
    }

    if (!values.password) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const existingUser = getStoredUser();
    const typedIdentity = values.identity.trim();
    const usernameFromEmail = typedIdentity.includes('@')
      ? typedIdentity.split('@')[0]
      : typedIdentity;

    setStoredUser({
      username: existingUser?.username || usernameFromEmail,
      email: existingUser?.email || (typedIdentity.includes('@') ? typedIdentity : ''),
    });

    navigate('/shop');
  };

  return (
    <PageShell narrow className="auth-page">
      <Card className="auth-card">
        <PageHeader
          title="Login"
          description="Sign in to your jerSEys account to keep shopping, save your progress, and move through checkout faster."
        />
        <form className="ui-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Username or Email"
            htmlFor="identity"
            error={errors.identity}
          >
            <input
              id="identity"
              name="identity"
              type="text"
              className="ui-input"
              placeholder="Enter username or email"
              value={values.identity}
              onChange={handleChange}
              autoComplete="username"
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password}
          >
            <div className="auth-password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="ui-input auth-password-input"
                placeholder="Enter password"
                value={values.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <PasswordVisibilityIcon isVisible={showPassword} />
              </button>
            </div>
          </FormField>

          <div className="ui-inline-stack">
            <Button type="submit" block>
              Sign In
            </Button>
          </div>

          <div className="auth-alt-link">
            <Button to="/forgot-password" variant="ghost">
              Forgot your password?
            </Button>
          </div>

          <div className="auth-alt-link">
            <Button to="/register" variant="ghost">
              Need an account? Register
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
};

export default Login;
