import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  FormField,
  PageHeader,
  PageShell,
} from '../components/ui';
import '../styles/auth.css';
import { setStoredUser } from '../utils/auth';

const initialValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
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

const Register = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);

  const passwordHint = useMemo(() => {
    if (!values.password) {
      return 'Use at least 8 characters for a secure password.';
    }

    return values.password.length >= 8
      ? 'Strong start. Confirm it below to finish creating your account.'
      : 'Password should be at least 8 characters long.';
  }, [values.password]);

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

  const validate = () => {
    const nextErrors = {};

    if (!values.username.trim()) {
      nextErrors.username = 'Username is required.';
    }

    if (!values.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!values.password) {
      nextErrors.password = 'Password is required.';
    } else if (values.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStoredUser({
      username: values.username.trim(),
      email: values.email.trim(),
    });

    navigate('/shop');
  };

  return (
    <PageShell narrow className="auth-page">
      <Card className="auth-card">
        <PageHeader
          title="Register"
          description="Create your jerSEys account to save your details and move faster through checkout."
        />
        <form className="ui-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Username"
            htmlFor="username"
            error={errors.username}
          >
            <input
              id="username"
              name="username"
              type="text"
              className="ui-input"
              placeholder="Enter username"
              value={values.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email}
          >
            <input
              id="email"
              name="email"
              type="email"
              className="ui-input"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            hint={!errors.password ? passwordHint : undefined}
            error={errors.password}
          >
            <div className="auth-password-field">
              <input
                id="password"
                name="password"
                type={showPasswords ? 'text' : 'password'}
                className="ui-input auth-password-input"
                placeholder="Enter password"
                value={values.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPasswords((current) => !current)}
                aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                aria-pressed={showPasswords}
              >
                <PasswordVisibilityIcon isVisible={showPasswords} />
              </button>
            </div>
          </FormField>

          <FormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword}
          >
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords ? 'text' : 'password'}
              className="ui-input"
              placeholder="Confirm password"
              value={values.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </FormField>

          <div className="ui-inline-stack">
            <Button type="submit" block>
              Register
            </Button>
          </div>

          <div className="auth-alt-link">
            <Button to="/login" variant="ghost">
              Already have an account? Login
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
};

export default Register;
