const { pool } = require("../config/db");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parsePositiveInteger = (value, fieldName) => {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw createError(`${fieldName} must be a positive integer`, 400);
  }

  return numericValue;
};

const getDashboard = async (req, res, next) => {
  try {
    const [[userRows], [productRows], [orderRows], [salesRows]] = await Promise.all([
      pool.execute("SELECT COUNT(*) AS total_users FROM users"),
      pool.execute("SELECT COUNT(*) AS total_products FROM products"),
      pool.execute("SELECT COUNT(*) AS total_orders FROM orders"),
      pool.execute("SELECT COALESCE(SUM(total_price), 0) AS total_sales FROM orders")
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_users: userRows[0].total_users,
        total_products: productRows[0].total_products,
        total_orders: orderRows[0].total_orders,
        total_sales: salesRows[0].total_sales
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, role, is_verified, created_at
       FROM users
       ORDER BY created_at DESC, id DESC`
    );

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = parsePositiveInteger(req.params.id, "id");

    if (userId === Number(req.user.id)) {
      return next(createError("Admins cannot delete their own account", 400));
    }

    const [result] = await pool.execute(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return next(createError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const [orders] = await pool.execute(
      `SELECT
         o.id,
         o.user_id,
         u.name AS user_name,
         u.email AS user_email,
         u.role AS user_role,
         o.total_price,
         o.status,
         o.created_at
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC, o.id DESC`
    );

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = parsePositiveInteger(req.params.id, "id");
    const normalizedStatus = req.body.status?.trim().toLowerCase();
    const allowedStatuses = ["pending", "completed", "cancelled"];

    if (!normalizedStatus || !allowedStatuses.includes(normalizedStatus)) {
      return next(createError("Status must be one of: pending, completed, cancelled", 400));
    }

    const [result] = await pool.execute(
      `UPDATE orders
       SET status = ?
       WHERE id = ?`,
      [normalizedStatus, orderId]
    );

    if (result.affectedRows === 0) {
      return next(createError("Order not found", 404));
    }

    const [orders] = await pool.execute(
      `SELECT
         o.id,
         o.user_id,
         u.name AS user_name,
         u.email AS user_email,
         u.role AS user_role,
         o.total_price,
         o.status,
         o.created_at
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       WHERE o.id = ?
       LIMIT 1`,
      [orderId]
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: orders[0]
    });
  } catch (error) {
    next(error);
  }
};

const getTrades = async (req, res, next) => {
  try {
    const [trades] = await pool.execute(
      `SELECT
         tl.id,
         tl.user_id,
         u.name AS owner_name,
         u.email AS owner_email,
         tl.title,
         tl.description,
         tl.status,
         tl.created_at
       FROM trade_listings tl
       INNER JOIN users u ON u.id = tl.user_id
       ORDER BY tl.created_at DESC, tl.id DESC`
    );

    res.status(200).json({
      success: true,
      data: trades
    });
  } catch (error) {
    next(error);
  }
};

const updateTradeStatus = async (listingId, status) => {
  const [result] = await pool.execute(
    `UPDATE trade_listings
     SET status = ?
     WHERE id = ?`,
    [status, listingId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.execute(
    `SELECT
       tl.id,
       tl.user_id,
       u.name AS owner_name,
       u.email AS owner_email,
       tl.title,
       tl.description,
       tl.status,
       tl.created_at
     FROM trade_listings tl
     INNER JOIN users u ON u.id = tl.user_id
     WHERE tl.id = ?
     LIMIT 1`,
    [listingId]
  );

  return rows[0];
};

const approveTrade = async (req, res, next) => {
  try {
    const listingId = parsePositiveInteger(req.params.id, "id");
    const trade = await updateTradeStatus(listingId, "approved");

    if (!trade) {
      return next(createError("Trade listing not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Trade listing approved successfully",
      data: trade
    });
  } catch (error) {
    next(error);
  }
};

const rejectTrade = async (req, res, next) => {
  try {
    const listingId = parsePositiveInteger(req.params.id, "id");
    const trade = await updateTradeStatus(listingId, "rejected");

    if (!trade) {
      return next(createError("Trade listing not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Trade listing rejected successfully",
      data: trade
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  deleteUser,
  getOrders,
  updateOrderStatus,
  getTrades,
  approveTrade,
  rejectTrade
};
