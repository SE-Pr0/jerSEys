const bcrypt = require("bcrypt");

const { pool } = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");
const generateVerificationCode = require("../utils/generateVerificationCode");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(createError("Name, email, and password are required", 400));
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || password.length < 6) {
      return next(createError("Please provide a valid name, email, and password of at least 6 characters", 400));
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return next(createError("Email already exists", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password)
       VALUES (?, ?, ?)`,
      [trimmedName, normalizedEmail, hashedPassword]
    );

    const [users] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError("Email and password are required", 400));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      "SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return next(createError("Invalid email or password", 401));
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(createError("Invalid email or password", 401));
    }

    res.status(200).json({
      success: true,
      token: generateToken(user.id),
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (users.length === 0) {
      return next(createError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createError("Email is required", 400));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      "SELECT id, email FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return next(createError("User not found", 404));
    }

    const user = users[0];
    const code = generateVerificationCode();

    await pool.execute("DELETE FROM password_reset_codes WHERE user_id = ?", [user.id]);
    await pool.execute(
      `INSERT INTO password_reset_codes (user_id, code, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [user.id, code]
    );

    console.log(`Password reset code for ${user.email}: ${code}`);

    await sendEmail({
      to: user.email,
      subject: "Password Reset Code",
      html: `
        <h2>Password Reset Code</h2>
        <p>Your code is: <b>${code}</b></p>
        <p>This code expires in 10 minutes.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: "Password reset code sent successfully"
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return next(createError("Email, code, and newPassword are required", 400));
    }

    if (newPassword.length < 6) {
      return next(createError("New password must be at least 6 characters long", 400));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return next(createError("User not found", 404));
    }

    const user = users[0];

    const [codes] = await pool.execute(
      `SELECT id, expires_at
       FROM password_reset_codes
       WHERE user_id = ? AND code = ? AND expires_at > NOW()
       ORDER BY expires_at DESC
       LIMIT 1`,
      [user.id, code]
    );

    if (codes.length === 0) {
      return next(createError("Invalid or expired reset code", 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      user.id
    ]);

    await pool.execute("DELETE FROM password_reset_codes WHERE user_id = ?", [user.id]);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword
};
