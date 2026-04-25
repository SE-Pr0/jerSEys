const { pool } = require("../config/db");

const PRODUCT_BASE_COLUMNS = ["id", "name", "description", "price", "stock", "category", "created_at"];
const OPTIONAL_PRODUCT_COLUMNS = ["team", "sport", "size", "image_url"];
const ALLOWED_SORTS = {
  newest: "p.created_at DESC",
  oldest: "p.created_at ASC",
  price_asc: "p.price ASC",
  price_desc: "p.price DESC",
  name_asc: "p.name ASC",
  name_desc: "p.name DESC"
};

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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

const normalizePrice = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw createError("Price must be a valid number greater than or equal to 0", 400);
  }

  return numericValue;
};

const normalizeStock = (value) => {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 0) {
    throw createError("Stock must be a valid integer greater than or equal to 0", 400);
  }

  return numericValue;
};

const parseProductId = (value) => {
  const productId = Number(value);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw createError("Product ID must be a positive integer", 400);
  }

  return productId;
};

const getProductTableColumns = async () => {
  const [columns] = await pool.query("SHOW COLUMNS FROM products");
  return new Set(columns.map((column) => column.Field));
};

const hasProductImagesTable = async () => {
  const [tables] = await pool.query("SHOW TABLES LIKE 'product_images'");
  return tables.length > 0;
};

const getSelectableColumns = (productColumns) => {
  const selectableColumns = [...PRODUCT_BASE_COLUMNS];

  OPTIONAL_PRODUCT_COLUMNS.forEach((column) => {
    if (productColumns.has(column)) {
      selectableColumns.push(column);
    }
  });

  return selectableColumns;
};

const buildProductResponse = (product, productColumns, productImages = null) => {
  const response = {};

  getSelectableColumns(productColumns).forEach((column) => {
    response[column] = product[column] ?? null;
  });

  if (productImages) {
    response.images = productImages;
  }

  return response;
};

const listProducts = async (req, res, next) => {
  try {
    const productColumns = await getProductTableColumns();
    const selectableColumns = getSelectableColumns(productColumns)
      .map((column) => `p.${column}`)
      .join(", ");

    const whereClauses = [];
    const params = [];
    const { search, category, team, sport, minPrice, maxPrice, sort } = req.query;

    if (search) {
      const searchTerm = `%${search.trim()}%`;
      whereClauses.push("(p.name LIKE ? OR p.description LIKE ?)");
      params.push(searchTerm, searchTerm);
    }

    if (category) {
      whereClauses.push("LOWER(p.category) = LOWER(?)");
      params.push(category.trim());
    }

    if (team && productColumns.has("team")) {
      whereClauses.push("LOWER(p.team) = LOWER(?)");
      params.push(team.trim());
    }

    if (sport && productColumns.has("sport")) {
      whereClauses.push("LOWER(p.sport) = LOWER(?)");
      params.push(sport.trim());
    }

    if (minPrice !== undefined) {
      const normalizedMinPrice = Number(minPrice);

      if (!Number.isFinite(normalizedMinPrice) || normalizedMinPrice < 0) {
        return next(createError("minPrice must be a valid number greater than or equal to 0", 400));
      }

      whereClauses.push("p.price >= ?");
      params.push(normalizedMinPrice);
    }

    if (maxPrice !== undefined) {
      const normalizedMaxPrice = Number(maxPrice);

      if (!Number.isFinite(normalizedMaxPrice) || normalizedMaxPrice < 0) {
        return next(createError("maxPrice must be a valid number greater than or equal to 0", 400));
      }

      whereClauses.push("p.price <= ?");
      params.push(normalizedMaxPrice);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const orderBy = ALLOWED_SORTS[sort] || ALLOWED_SORTS.newest;

    const [products] = await pool.execute(
      `SELECT ${selectableColumns}
       FROM products p
       ${whereSql}
       ORDER BY ${orderBy}`,
      params
    );

    res.status(200).json({
      success: true,
      data: products.map((product) => buildProductResponse(product, productColumns))
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const productId = parseProductId(req.params.id);
    const productColumns = await getProductTableColumns();
    const selectableColumns = getSelectableColumns(productColumns)
      .map((column) => `p.${column}`)
      .join(", ");

    const [products] = await pool.execute(
      `SELECT ${selectableColumns}
       FROM products p
       WHERE p.id = ?
       LIMIT 1`,
      [productId]
    );

    if (products.length === 0) {
      return next(createError("Product not found", 404));
    }

    let productImages = null;

    if (await hasProductImagesTable()) {
      const [images] = await pool.execute(
        `SELECT id, image_url, alt_text, is_primary, sort_order
         FROM product_images
         WHERE product_id = ?
         ORDER BY is_primary DESC, sort_order ASC, id ASC`,
        [productId]
      );

      productImages = images;
    }

    res.status(200).json({
      success: true,
      data: buildProductResponse(products[0], productColumns, productImages)
    });
  } catch (error) {
    next(error);
  }
};

const syncPrimaryProductImage = async (productId, imageUrl, productImagesTableExists) => {
  if (!productImagesTableExists || !imageUrl) {
    return;
  }

  const [existingImages] = await pool.execute(
    `SELECT id
     FROM product_images
     WHERE product_id = ? AND is_primary = TRUE
     ORDER BY id ASC
     LIMIT 1`,
    [productId]
  );

  if (existingImages.length > 0) {
    await pool.execute(
      `UPDATE product_images
       SET image_url = ?, alt_text = ?, sort_order = 0
       WHERE id = ?`,
      [imageUrl, "Primary product image", existingImages[0].id]
    );
    return;
  }

  await pool.execute(
    `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
     VALUES (?, ?, ?, TRUE, 0)`,
    [productId, imageUrl, "Primary product image"]
  );
};

const buildWritableProductFields = (body, productColumns, { stockOnly = false } = {}) => {
  const writableFields = {};

  if (stockOnly) {
    writableFields.stock = normalizeStock(body.stock);
    return writableFields;
  }

  writableFields.name = normalizeRequiredString(body.name, "name");
  writableFields.description = normalizeOptionalString(body.description);
  writableFields.price = normalizePrice(body.price);
  writableFields.stock = normalizeStock(body.stock);
  writableFields.category = normalizeRequiredString(body.category, "category");

  if (productColumns.has("team")) {
    writableFields.team = normalizeOptionalString(body.team);
  }

  if (productColumns.has("sport")) {
    writableFields.sport = normalizeOptionalString(body.sport);
  }

  if (productColumns.has("size")) {
    writableFields.size = normalizeOptionalString(body.size);
  }

  if (productColumns.has("image_url")) {
    writableFields.image_url = normalizeOptionalString(body.image_url);
  }

  return writableFields;
};

const createProduct = async (req, res, next) => {
  try {
    const productColumns = await getProductTableColumns();
    const productImagesTableExists = await hasProductImagesTable();
    const productData = buildWritableProductFields(req.body, productColumns);
    const fieldNames = Object.keys(productData);
    const placeholders = fieldNames.map(() => "?").join(", ");
    const values = fieldNames.map((fieldName) => productData[fieldName]);

    const [result] = await pool.execute(
      `INSERT INTO products (${fieldNames.join(", ")})
       VALUES (${placeholders})`,
      values
    );

    await syncPrimaryProductImage(result.insertId, normalizeOptionalString(req.body.image_url), productImagesTableExists);
    const selectableColumns = getSelectableColumns(productColumns)
      .map((column) => `p.${column}`)
      .join(", ");
    const [products] = await pool.execute(
      `SELECT ${selectableColumns}
       FROM products p
       WHERE p.id = ?
       LIMIT 1`,
      [result.insertId]
    );

    let productImages = null;

    if (productImagesTableExists) {
      const [images] = await pool.execute(
        `SELECT id, image_url, alt_text, is_primary, sort_order
         FROM product_images
         WHERE product_id = ?
         ORDER BY is_primary DESC, sort_order ASC, id ASC`,
        [result.insertId]
      );

      productImages = images;
    }

    res.status(201).json({
      success: true,
      data: buildProductResponse(products[0], productColumns, productImages)
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = parseProductId(req.params.id);
    const productColumns = await getProductTableColumns();
    const productImagesTableExists = await hasProductImagesTable();
    const productData = buildWritableProductFields(req.body, productColumns);
    const updateAssignments = Object.keys(productData).map((fieldName) => `${fieldName} = ?`);
    const updateValues = Object.keys(productData).map((fieldName) => productData[fieldName]);

    const [result] = await pool.execute(
      `UPDATE products
       SET ${updateAssignments.join(", ")}
       WHERE id = ?`,
      [...updateValues, productId]
    );

    if (result.affectedRows === 0) {
      return next(createError("Product not found", 404));
    }

    await syncPrimaryProductImage(productId, normalizeOptionalString(req.body.image_url), productImagesTableExists);

    return getProductById(req, res, next);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseProductId(req.params.id);
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [productId]);

    if (result.affectedRows === 0) {
      return next(createError("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: productId
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProductStock = async (req, res, next) => {
  try {
    const productId = parseProductId(req.params.id);
    const productData = buildWritableProductFields(req.body, new Set(), { stockOnly: true });

    const [result] = await pool.execute(
      `UPDATE products
       SET stock = ?
       WHERE id = ?`,
      [productData.stock, productId]
    );

    if (result.affectedRows === 0) {
      return next(createError("Product not found", 404));
    }

    return getProductById(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock
};
