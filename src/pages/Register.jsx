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

const Register = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

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
            <input
              id="password"
              name="password"
              type="password"
              className="ui-input"
              placeholder="Enter password"
              value={values.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </FormField>

          <FormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword}
          >
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
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
