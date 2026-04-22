import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  FormField,
  PageHeader,
  PageShell,
  StateBlock,
} from '../components/ui';
import '../styles/auth.css';
import '../styles/forgotpassword.css';

const CODE_LENGTH = 6;
const PASSWORD_REQUIREMENTS =
  'Use at least 8 characters, including 1 uppercase, 1 lowercase, 1 number, and 1 special character from .!@#$%^&*.';
const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[.!@#$%^&*]).{8,}$';

const createVerificationCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const createEmptyCode = () => Array.from({ length: CODE_LENGTH }, () => '');

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

const getPasswordError = (password) => {
  if (!password) {
    return 'Password is required.';
  }

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[.!@#$%^&*]/.test(password)
  ) {
    return PASSWORD_REQUIREMENTS;
  }

  return '';
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

const CodeNoticeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 9 4 12l4 3" />
    <path d="M16 9l4 3-4 3" />
    <path d="M14 6 10 18" />
  </svg>
);

const SuccessIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5.5" />
  </svg>
);

const ForgotPassword = () => {
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  const codeInputRefs = useRef([]);
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeDigits, setCodeDigits] = useState(createEmptyCode);
  const [codeError, setCodeError] = useState('');
  const [passwordValues, setPasswordValues] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [notification, setNotification] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  useEffect(() => {
    if (step === 'email') {
      emailInputRef.current?.focus();
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const firstEmptyIndex = codeDigits.findIndex((digit) => !digit);
      const targetIndex = firstEmptyIndex === -1 ? CODE_LENGTH - 1 : firstEmptyIndex;
      codeInputRefs.current[targetIndex]?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [codeDigits, step]);

  useEffect(() => {
    if (!isPasswordUpdated) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [isPasswordUpdated, navigate]);

  const resetCodeStep = (nextCode = generatedCode) => {
    setGeneratedCode(nextCode);
    setCodeDigits(createEmptyCode());
    setCodeError('');
    setIsVerified(false);
    setIsPasswordUpdated(false);
    setNotification({
      title: 'Verification code ready',
      description: `This is a demo in-page notification for now. Your 6-digit code is ${nextCode}.`,
    });
    setStep('code');
  };

  const handleEmailSubmit = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Email address is required.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    resetCodeStep(createVerificationCode());
  };

  const handleCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);

    setCodeDigits((currentDigits) => {
      const nextDigits = [...currentDigits];
      nextDigits[index] = digit;
      return nextDigits;
    });

    setCodeError('');

    if (digit && index < CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !codeDigits[index] && index > 0) {
      event.preventDefault();
      setCodeDigits((currentDigits) => {
        const nextDigits = [...currentDigits];
        nextDigits[index - 1] = '';
        return nextDigits;
      });
      codeInputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      codeInputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      event.preventDefault();
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (event, index) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '');

    if (!pastedDigits) {
      return;
    }

    setCodeDigits((currentDigits) => {
      const nextDigits = [...currentDigits];

      pastedDigits
        .slice(0, CODE_LENGTH - index)
        .split('')
        .forEach((digit, offset) => {
          nextDigits[index + offset] = digit;
        });

      return nextDigits;
    });

    const nextIndex = Math.min(index + pastedDigits.length, CODE_LENGTH - 1);
    codeInputRefs.current[nextIndex]?.focus();
  };

  const handleCodeSubmit = (event) => {
    event.preventDefault();

    const enteredCode = codeDigits.join('');

    if (enteredCode.length !== CODE_LENGTH) {
      setCodeError('Enter the 6-digit verification code.');
      return;
    }

    if (enteredCode !== generatedCode) {
      setCodeError('That code does not match the demo notification.');
      return;
    }

    setCodeError('');
    setIsVerified(true);
    setStep('password');
    setNotification({
      title: 'Verification complete',
      description: 'The code matched. Now create your new password and confirm it below.',
    });
  };

  const handleResendCode = () => {
    resetCodeStep(createVerificationCode());
  };

  const handleChangeEmail = () => {
    setStep('email');
    setCodeDigits(createEmptyCode());
    setCodeError('');
    setNotification(null);
    setIsVerified(false);
    setIsPasswordUpdated(false);
    setGeneratedCode('');
    setPasswordValues({
      password: '',
      confirmPassword: '',
    });
    setPasswordErrors({});
    setShowPasswords(false);
    window.setTimeout(() => emailInputRef.current?.focus(), 0);
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setPasswordErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const validatePasswordStep = () => {
    const nextErrors = {};

    const passwordError = getPasswordError(passwordValues.password);
    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (!passwordValues.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (passwordValues.confirmPassword !== passwordValues.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validatePasswordStep();
    setPasswordErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsPasswordUpdated(true);
  };

  if (isPasswordUpdated) {
    return (
      <PageShell narrow className="auth-page forgot-password-page">
        <Card className="auth-card forgot-password-card">
          <div className="forgot-password-success-screen">
            <StateBlock
              centered
              icon={<SuccessIcon />}
              title="Password successfully updated"
              description="Redirecting to login"
            />
          </div>
        </Card>
      </PageShell>
    );
  }

  if (isVerified) {
    return (
      <PageShell narrow className="auth-page forgot-password-page">
        <Card className="auth-card forgot-password-card">
          <PageHeader
            title="Forgot Password"
            description="Your code has been verified. Create a new password to finish the reset process."
          />

          <form className="ui-form" onSubmit={handlePasswordSubmit} noValidate>
            <FormField
              label="Password"
              htmlFor="password"
              error={passwordErrors.password}
            >
              <div className="auth-password-field">
                <input
                  id="password"
                  name="password"
                  type={showPasswords ? 'text' : 'password'}
                  className="ui-input auth-password-input"
                  placeholder="Enter password"
                  value={passwordValues.password}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  minLength={8}
                  pattern={PASSWORD_PATTERN}
                  title={PASSWORD_REQUIREMENTS}
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
              error={passwordErrors.confirmPassword}
            >
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                className="ui-input"
                placeholder="Confirm password"
                value={passwordValues.confirmPassword}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                minLength={8}
                pattern={PASSWORD_PATTERN}
                title={PASSWORD_REQUIREMENTS}
              />
            </FormField>

            <div className="forgot-password-step-actions">
              <Button type="submit" block>
                Update Password
              </Button>
              <div className="ui-inline-stack forgot-password-inline-actions">
                <Button variant="ghost" onClick={handleChangeEmail}>
                  Start Over
                </Button>
                <Button to="/login" variant="ghost">
                  Back to Login
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell narrow className="auth-page forgot-password-page">
      <Card className="auth-card forgot-password-card">
        <PageHeader
          title="Forgot Password"
          description="Enter your email first, then verify the 6-digit code shown in the in-page notification to continue the reset flow."
        />

        {notification ? (
          <div className="forgot-password-notice" aria-live="polite">
            <StateBlock
              icon={<CodeNoticeIcon />}
              title={notification.title}
              description={notification.description}
            />
          </div>
        ) : null}

        <form className="ui-form" onSubmit={step === 'email' ? handleEmailSubmit : handleCodeSubmit} noValidate>
          {step === 'email' ? (
            <FormField
              label="Email"
              htmlFor="forgot-password-email"
              error={emailError}
              hint="We will show the demo verification code right here on the page."
            >
              <input
                ref={emailInputRef}
                id="forgot-password-email"
                name="email"
                type="email"
                className="ui-input"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) {
                    setEmailError('');
                  }
                }}
                autoComplete="email"
              />
            </FormField>
          ) : (
            <>
              <FormField
                label="Verification Code"
                htmlFor="code-0"
                error={codeError}
                hint={`We sent a demo code to ${email.trim()}. Enter the 6 digits below.`}
              >
                <div className="forgot-password-code-grid" role="group" aria-label="6 digit verification code">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={`code-${index}`}
                      ref={(element) => {
                        codeInputRefs.current[index] = element;
                      }}
                      id={`code-${index}`}
                      name={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="ui-input forgot-password-code-input"
                      value={digit}
                      onChange={(event) => handleCodeChange(index, event.target.value)}
                      onKeyDown={(event) => handleCodeKeyDown(event, index)}
                      onPaste={(event) => handleCodePaste(event, index)}
                      aria-label={`Verification code digit ${index + 1}`}
                    />
                  ))}
                </div>
              </FormField>

              <div className="forgot-password-step-actions">
                <Button type="submit" block>
                  Verify Code
                </Button>
                <div className="ui-inline-stack forgot-password-inline-actions">
                  <Button variant="ghost" onClick={handleResendCode}>
                    Resend Demo Code
                  </Button>
                  <Button variant="ghost" onClick={handleChangeEmail}>
                    Change Email
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 'email' ? (
            <div className="forgot-password-step-actions">
              <Button type="submit" block>
                Send Verification Code
              </Button>
              <div className="ui-inline-stack forgot-password-inline-actions">
                <Button to="/login" variant="ghost">
                  Back to Login
                </Button>
              </div>
            </div>
          ) : null}
        </form>

        {step === 'email' ? (
          <div className="forgot-password-footer-link">
            <Button to="/register" variant="ghost">
              Need a new account? Register
            </Button>
          </div>
        ) : null}
      </Card>
    </PageShell>
  );
};

export default ForgotPassword;
