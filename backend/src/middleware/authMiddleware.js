const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Not authorized, token missing");
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    error.statusCode = 401;
    error.message = "Not authorized, token invalid";
    next(error);
  }
};

const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Not authorized, token missing");
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.execute(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [decoded.id]
    );

    if (users.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error);
    }

    if (users[0].role !== "admin") {
      const error = new Error("Not authorized as admin");
      error.statusCode = 403;
      return next(error);
    }

    req.user = {
      ...decoded,
      role: users[0].role
    };
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    error.message = error.message || "Not authorized, token invalid";
    next(error);
  }
};

module.exports = {
  protect,
  protectAdmin
};
