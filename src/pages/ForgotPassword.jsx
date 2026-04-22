import React, { useEffect, useRef, useState } from 'react';
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

const createVerificationCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const createEmptyCode = () => Array.from({ length: CODE_LENGTH }, () => '');

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

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

const ForgotPassword = () => {
  const emailInputRef = useRef(null);
  const codeInputRefs = useRef([]);
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeDigits, setCodeDigits] = useState(createEmptyCode);
  const [codeError, setCodeError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [notification, setNotification] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

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

  const resetCodeStep = (nextCode = generatedCode) => {
    setGeneratedCode(nextCode);
    setCodeDigits(createEmptyCode());
    setCodeError('');
    setIsVerified(false);
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
    setNotification({
      title: 'Verification complete',
      description: 'The code matched. The reset-password step can be added next when the email service is ready.',
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
    setGeneratedCode('');
    window.setTimeout(() => emailInputRef.current?.focus(), 0);
  };

  if (isVerified) {
    return (
      <PageShell narrow className="auth-page forgot-password-page">
        <Card className="auth-card forgot-password-card">
          <PageHeader
            title="Forgot Password"
            description="Your code has been verified. We can connect this page to the real reset-password step once the email workflow is ready."
          />

          {notification ? (
            <StateBlock
              centered
              icon={<CodeNoticeIcon />}
              title={notification.title}
              description={notification.description}
            />
          ) : null}

          <div className="forgot-password-success-actions">
            <Button to="/login" block>
              Back to Login
            </Button>
            <Button variant="ghost" onClick={handleChangeEmail}>
              Start Over
            </Button>
          </div>
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
