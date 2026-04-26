const { pool } = require("../config/db");

const requireAdmin = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (users.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (users[0].role !== "admin") {
      const error = new Error("Admin access required");
      error.statusCode = 403;
      return next(error);
    }

    req.user.role = users[0].role;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireAdmin
};
