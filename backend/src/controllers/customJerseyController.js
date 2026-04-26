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

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
};

const normalizeRequiredString = (value, fieldName) => {
  const normalizedValue = normalizeOptionalString(value);

  if (!normalizedValue) {
    throw createError(`${fieldName} is required`, 400);
  }

  return normalizedValue;
};

const normalizeOptionalPrice = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw createError("price must be a valid number greater than or equal to 0", 400);
  }

  return numericValue;
};

const normalizeOptionalBaseProductId = async (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const baseProductId = parsePositiveInteger(value, "base_product_id");
  const [products] = await pool.execute(
    `SELECT id
     FROM products
     WHERE id = ?
     LIMIT 1`,
    [baseProductId]
  );

  if (products.length === 0) {
    throw createError("Base product not found", 404);
  }

  return baseProductId;
};

const normalizeDesignData = (value) => {
  if (value === undefined) {
    throw createError("design_data is required", 400);
  }

  let parsedValue = value;

  if (typeof value === "string") {
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      throw createError("design_data must be valid JSON", 400);
    }
  }

  if (parsedValue === null || typeof parsedValue !== "object") {
    throw createError("design_data must be a JSON object or array", 400);
  }

  return parsedValue;
};

const mapCustomJersey = (customJersey) => ({
  id: customJersey.id,
  user_id: customJersey.user_id,
  name: customJersey.name,
  base_product_id: customJersey.base_product_id,
  design_data:
    typeof customJersey.design_data === "string"
      ? JSON.parse(customJersey.design_data)
      : customJersey.design_data,
  price: customJersey.price,
  created_at: customJersey.created_at,
  updated_at: customJersey.updated_at
});

const getCustomJerseyByIdForUser = async (customJerseyId, userId) => {
  const [customJerseys] = await pool.execute(
    `SELECT
       id,
       user_id,
       name,
       base_product_id,
       design_data,
       price,
       created_at,
       updated_at
     FROM custom_jerseys
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [customJerseyId, userId]
  );

  if (customJerseys.length === 0) {
    return null;
  }

  return mapCustomJersey(customJerseys[0]);
};

const createCustomJersey = async (req, res, next) => {
  try {
    const name = normalizeRequiredString(req.body.name, "name");
    const baseProductId = await normalizeOptionalBaseProductId(req.body.base_product_id);
    const designData = normalizeDesignData(req.body.design_data);
    const price = normalizeOptionalPrice(req.body.price);

    const [result] = await pool.execute(
      `INSERT INTO custom_jerseys (user_id, name, base_product_id, design_data, price)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, name, baseProductId, JSON.stringify(designData), price]
    );

    const customJersey = await getCustomJerseyByIdForUser(result.insertId, req.user.id);

    res.status(201).json({
      success: true,
      data: customJersey
    });
  } catch (error) {
    next(error);
  }
};

const getCustomJerseys = async (req, res, next) => {
  try {
    const [customJerseys] = await pool.execute(
      `SELECT
         id,
         user_id,
         name,
         base_product_id,
         design_data,
         price,
         created_at,
         updated_at
       FROM custom_jerseys
       WHERE user_id = ?
       ORDER BY updated_at DESC, id DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: customJerseys.map(mapCustomJersey)
    });
  } catch (error) {
    next(error);
  }
};

const getCustomJerseyById = async (req, res, next) => {
  try {
    const customJerseyId = parsePositiveInteger(req.params.id, "id");
    const customJersey = await getCustomJerseyByIdForUser(customJerseyId, req.user.id);

    if (!customJersey) {
      return next(createError("Custom jersey not found", 404));
    }

    res.status(200).json({
      success: true,
      data: customJersey
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomJersey = async (req, res, next) => {
  try {
    const customJerseyId = parsePositiveInteger(req.params.id, "id");
    const existingCustomJersey = await getCustomJerseyByIdForUser(customJerseyId, req.user.id);

    if (!existingCustomJersey) {
      return next(createError("Custom jersey not found", 404));
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      updates.name = normalizeRequiredString(req.body.name, "name");
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "base_product_id")) {
      updates.base_product_id = await normalizeOptionalBaseProductId(req.body.base_product_id);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "design_data")) {
      updates.design_data = JSON.stringify(normalizeDesignData(req.body.design_data));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "price")) {
      updates.price = normalizeOptionalPrice(req.body.price);
    }

    const updateKeys = Object.keys(updates);

    if (updateKeys.length === 0) {
      return next(createError("At least one updatable field is required", 400));
    }

    const updateAssignments = updateKeys.map((fieldName) => `${fieldName} = ?`);
    const updateValues = updateKeys.map((fieldName) => updates[fieldName]);

    await pool.execute(
      `UPDATE custom_jerseys
       SET ${updateAssignments.join(", ")}
       WHERE id = ? AND user_id = ?`,
      [...updateValues, customJerseyId, req.user.id]
    );

    const updatedCustomJersey = await getCustomJerseyByIdForUser(customJerseyId, req.user.id);

    res.status(200).json({
      success: true,
      data: updatedCustomJersey
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomJersey = async (req, res, next) => {
  try {
    const customJerseyId = parsePositiveInteger(req.params.id, "id");
    const [result] = await pool.execute(
      `DELETE FROM custom_jerseys
       WHERE id = ? AND user_id = ?`,
      [customJerseyId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return next(createError("Custom jersey not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: customJerseyId
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomJersey,
  getCustomJerseys,
  getCustomJerseyById,
  updateCustomJersey,
  deleteCustomJersey
};
