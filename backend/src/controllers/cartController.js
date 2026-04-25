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

const getCart = async (req, res, next) => {
  try {
    const [cartItems] = await pool.execute(
      `SELECT
         ci.id,
         ci.product_id,
         p.name,
         p.price,
         p.image_url,
         ci.quantity,
         p.stock
       FROM cart_items ci
       INNER JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.id ASC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: cartItems
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const productId = parsePositiveInteger(req.body.product_id, "product_id");
    const quantity = parsePositiveInteger(req.body.quantity, "quantity");

    const [products] = await pool.execute(
      `SELECT id, name, price, image_url, stock
       FROM products
       WHERE id = ?
       LIMIT 1`,
      [productId]
    );

    if (products.length === 0) {
      return next(createError("Product not found", 404));
    }

    const product = products[0];

    if (product.stock < quantity) {
      return next(createError("Insufficient stock for requested quantity", 400));
    }

    const [existingItems] = await pool.execute(
      `SELECT id, quantity
       FROM cart_items
       WHERE user_id = ? AND product_id = ?
       LIMIT 1`,
      [req.user.id, productId]
    );

    let cartItemId;

    if (existingItems.length > 0) {
      const updatedQuantity = existingItems[0].quantity + quantity;

      if (product.stock < updatedQuantity) {
        return next(createError("Insufficient stock for requested quantity", 400));
      }

      await pool.execute(
        `UPDATE cart_items
         SET quantity = ?
         WHERE id = ? AND user_id = ?`,
        [updatedQuantity, existingItems[0].id, req.user.id]
      );

      cartItemId = existingItems[0].id;
    } else {
      const [result] = await pool.execute(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [req.user.id, productId, quantity]
      );

      cartItemId = result.insertId;
    }

    const [cartItems] = await pool.execute(
      `SELECT
         ci.id,
         ci.product_id,
         p.name,
         p.price,
         p.image_url,
         ci.quantity,
         p.stock
       FROM cart_items ci
       INNER JOIN products p ON p.id = ci.product_id
       WHERE ci.id = ? AND ci.user_id = ?
       LIMIT 1`,
      [cartItemId, req.user.id]
    );

    res.status(200).json({
      success: true,
      data: cartItems[0]
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const itemId = parsePositiveInteger(req.params.itemId, "itemId");
    const quantity = parsePositiveInteger(req.body.quantity, "quantity");

    const [cartItems] = await pool.execute(
      `SELECT
         ci.id,
         ci.product_id,
         p.name,
         p.price,
         p.image_url,
         p.stock
       FROM cart_items ci
       INNER JOIN products p ON p.id = ci.product_id
       WHERE ci.id = ? AND ci.user_id = ?
       LIMIT 1`,
      [itemId, req.user.id]
    );

    if (cartItems.length === 0) {
      return next(createError("Cart item not found", 404));
    }

    if (cartItems[0].stock < quantity) {
      return next(createError("Insufficient stock for requested quantity", 400));
    }

    await pool.execute(
      `UPDATE cart_items
       SET quantity = ?
       WHERE id = ? AND user_id = ?`,
      [quantity, itemId, req.user.id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...cartItems[0],
        quantity
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteCartItem = async (req, res, next) => {
  try {
    const itemId = parsePositiveInteger(req.params.itemId, "itemId");

    const [result] = await pool.execute(
      `DELETE FROM cart_items
       WHERE id = ? AND user_id = ?`,
      [itemId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return next(createError("Cart item not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: itemId
      }
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      `DELETE FROM cart_items
       WHERE user_id = ?`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: {
        deletedCount: result.affectedRows
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
};
