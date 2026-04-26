const { pool } = require("../config/db");
const createNotification = require("../utils/createNotification");

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

const getOrderByIdForUser = async (executor, orderId, userId) => {
  const [orders] = await executor.execute(
    `SELECT id, user_id, total_price, status, created_at
     FROM orders
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [orderId, userId]
  );

  if (orders.length === 0) {
    return null;
  }

  const [items] = await executor.execute(
    `SELECT
       oi.id,
       oi.product_id,
       p.name,
       p.image_url,
       oi.quantity,
       oi.price
     FROM order_items oi
     INNER JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC`,
    [orderId]
  );

  return {
    ...orders[0],
    items
  };
};

const createOrder = async (req, res, next) => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [cartItems] = await connection.execute(
      `SELECT
         ci.id,
         ci.product_id,
         ci.quantity,
         p.name,
         p.price,
         p.stock,
         p.image_url
       FROM cart_items ci
       INNER JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.id ASC
       FOR UPDATE`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      throw createError("Cart is empty", 400);
    }

    let totalPrice = 0;

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        throw createError(`Insufficient stock for product: ${item.name}`, 400);
      }

      totalPrice += Number(item.price) * item.quantity;
    }

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (user_id, total_price, status)
       VALUES (?, ?, 'pending')`,
      [req.user.id, totalPrice.toFixed(2)]
    );

    for (const item of cartItems) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderResult.insertId, item.product_id, item.quantity, item.price]
      );

      await connection.execute(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.execute(
      `DELETE FROM cart_items
       WHERE user_id = ?`,
      [req.user.id]
    );

    await connection.commit();
    await createNotification(req.user.id, "Your order has been placed successfully.");

    const order = await getOrderByIdForUser(pool, orderResult.insertId, req.user.id);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getOrders = async (req, res, next) => {
  try {
    const [orders] = await pool.execute(
      `SELECT id, user_id, total_price, status, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const orderId = parsePositiveInteger(req.params.id, "id");
    const order = await getOrderByIdForUser(pool, orderId, req.user.id);

    if (!order) {
      return next(createError("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  let connection;

  try {
    const orderId = parsePositiveInteger(req.params.id, "id");
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orders] = await connection.execute(
      `SELECT id, user_id, total_price, status, created_at
       FROM orders
       WHERE id = ? AND user_id = ?
       LIMIT 1
       FOR UPDATE`,
      [orderId, req.user.id]
    );

    if (orders.length === 0) {
      throw createError("Order not found", 404);
    }

    if (orders[0].status !== "pending") {
      throw createError("Only pending orders can be cancelled", 400);
    }

    const [orderItems] = await connection.execute(
      `SELECT id, product_id, quantity, price
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [orderId]
    );

    for (const item of orderItems) {
      await connection.execute(
        `UPDATE products
         SET stock = stock + ?
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.execute(
      `UPDATE orders
       SET status = 'cancelled'
       WHERE id = ? AND user_id = ?`,
      [orderId, req.user.id]
    );

    await connection.commit();

    const order = await getOrderByIdForUser(pool, orderId, req.user.id);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder
};
