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

const Login = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

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
            <input
              id="password"
              name="password"
              type="password"
              className="ui-input"
              placeholder="Enter password"
              value={values.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </FormField>

          <div className="ui-inline-stack">
            <Button type="submit" block>
              Sign In
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
