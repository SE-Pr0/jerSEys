const requiredVariables = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"];

const isPlaceholder = (value) => /^(replace|change|example|your[_-])/i.test(value);

const validateEnvironment = () => {
  const missing = requiredVariables.filter((name) => !String(process.env[name] || "").trim());

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const jwtSecret = process.env.JWT_SECRET.trim();
  if (jwtSecret.length < 32 || isPlaceholder(jwtSecret)) {
    throw new Error("JWT_SECRET must be a non-placeholder value with at least 32 characters.");
  }

  const hasEmailUser = Boolean(process.env.EMAIL_USER);
  const hasEmailPass = Boolean(process.env.EMAIL_PASS);
  if (hasEmailUser !== hasEmailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured together.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    !process.env.CORS_ORIGINS &&
    !process.env.FRONTEND_URL
  ) {
    throw new Error("CORS_ORIGINS or FRONTEND_URL is required in production.");
  }
};

module.exports = { validateEnvironment };
