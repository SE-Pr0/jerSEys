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

const listingSelect = `
  SELECT
    tl.id,
    tl.user_id,
    tl.title,
    tl.description,
    tl.status,
    tl.created_at,
    u.name AS owner_name,
    u.email AS owner_email
  FROM trade_listings tl
  INNER JOIN users u ON u.id = tl.user_id
`;

const requestSelect = `
  SELECT
    tr.id,
    tr.listing_id,
    tr.sender_id,
    tr.status,
    tr.created_at,
    tl.title AS listing_title,
    tl.description AS listing_description,
    tl.status AS listing_status,
    tl.user_id AS listing_owner_id,
    owner.name AS listing_owner_name,
    owner.email AS listing_owner_email,
    sender.name AS sender_name,
    sender.email AS sender_email
  FROM trade_requests tr
  INNER JOIN trade_listings tl ON tl.id = tr.listing_id
  INNER JOIN users owner ON owner.id = tl.user_id
  INNER JOIN users sender ON sender.id = tr.sender_id
`;

const getListingById = async (executor, listingId, options = {}) => {
  const conditions = ["tl.id = ?"];
  const params = [listingId];

  if (options.approvedOnly) {
    conditions.push("tl.status = 'approved'");
  }

  const [rows] = await executor.execute(
    `${listingSelect}
     WHERE ${conditions.join(" AND ")}
     LIMIT 1`,
    params
  );

  return rows[0] || null;
};

const getTradeRequestById = async (executor, requestId) => {
  const [rows] = await executor.execute(
    `${requestSelect}
     WHERE tr.id = ?
     LIMIT 1`,
    [requestId]
  );

  return rows[0] || null;
};

const createTradeListing = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return next(createError("Title and description are required", 400));
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      return next(createError("Title and description are required", 400));
    }

    const [result] = await pool.execute(
      `INSERT INTO trade_listings (user_id, title, description, status)
       VALUES (?, ?, ?, 'pending')`,
      [req.user.id, trimmedTitle, trimmedDescription]
    );

    const listing = await getListingById(pool, result.insertId);

    res.status(201).json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

const getApprovedTradeListings = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `${listingSelect}
       WHERE tl.status = 'approved'
       ORDER BY tl.created_at DESC, tl.id DESC`
    );

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const getMyTradeListings = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `${listingSelect}
       WHERE tl.user_id = ?
       ORDER BY tl.created_at DESC, tl.id DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const getTradeListingById = async (req, res, next) => {
  try {
    const listingId = parsePositiveInteger(req.params.id, "id");
    const listing = await getListingById(pool, listingId, { approvedOnly: true });

    if (!listing) {
      return next(createError("Trade listing not found", 404));
    }

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

const createTradeRequest = async (req, res, next) => {
  try {
    const listingId = parsePositiveInteger(req.params.id, "id");

    const [listings] = await pool.execute(
      `SELECT id, user_id, status
       FROM trade_listings
       WHERE id = ?
       LIMIT 1`,
      [listingId]
    );

    if (listings.length === 0) {
      return next(createError("Trade listing not found", 404));
    }

    const listing = listings[0];

    if (listing.user_id === req.user.id) {
      return next(createError("You cannot request your own listing", 400));
    }

    if (listing.status !== "approved") {
      return next(createError("Trade requests can only be sent to approved listings", 400));
    }

    const [existingRequests] = await pool.execute(
      `SELECT id
       FROM trade_requests
       WHERE listing_id = ? AND sender_id = ? AND status = 'pending'
       LIMIT 1`,
      [listingId, req.user.id]
    );

    if (existingRequests.length > 0) {
      return next(createError("You already have a pending request for this listing", 409));
    }

    const [result] = await pool.execute(
      `INSERT INTO trade_requests (listing_id, sender_id, status)
       VALUES (?, ?, 'pending')`,
      [listingId, req.user.id]
    );

    const tradeRequest = await getTradeRequestById(pool, result.insertId);

    res.status(201).json({
      success: true,
      data: tradeRequest
    });
  } catch (error) {
    next(error);
  }
};

const getReceivedTradeRequests = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `${requestSelect}
       WHERE tl.user_id = ?
       ORDER BY tr.created_at DESC, tr.id DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const getSentTradeRequests = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `${requestSelect}
       WHERE tr.sender_id = ?
       ORDER BY tr.created_at DESC, tr.id DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const acceptTradeRequest = async (req, res, next) => {
  let connection;

  try {
    const requestId = parsePositiveInteger(req.params.requestId, "requestId");

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `${requestSelect}
       WHERE tr.id = ?
       LIMIT 1
       FOR UPDATE`,
      [requestId]
    );

    if (rows.length === 0) {
      throw createError("Trade request not found", 404);
    }

    const tradeRequest = rows[0];

    if (tradeRequest.listing_owner_id !== req.user.id) {
      throw createError("Not authorized to accept this trade request", 403);
    }

    if (tradeRequest.status !== "pending") {
      throw createError("Only pending trade requests can be accepted", 400);
    }

    if (tradeRequest.listing_status !== "approved") {
      throw createError("Only approved listings can accept trade requests", 400);
    }

    await connection.execute(
      `UPDATE trade_requests
       SET status = 'accepted'
       WHERE id = ?`,
      [requestId]
    );

    await connection.execute(
      `UPDATE trade_listings
       SET status = 'closed'
       WHERE id = ?`,
      [tradeRequest.listing_id]
    );

    await connection.execute(
      `UPDATE trade_requests
       SET status = 'rejected'
       WHERE listing_id = ? AND id <> ? AND status = 'pending'`,
      [tradeRequest.listing_id, requestId]
    );

    await connection.commit();

    const updatedRequest = await getTradeRequestById(pool, requestId);

    res.status(200).json({
      success: true,
      data: updatedRequest
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

const rejectTradeRequest = async (req, res, next) => {
  try {
    const requestId = parsePositiveInteger(req.params.requestId, "requestId");
    const tradeRequest = await getTradeRequestById(pool, requestId);

    if (!tradeRequest) {
      return next(createError("Trade request not found", 404));
    }

    if (tradeRequest.listing_owner_id !== req.user.id) {
      return next(createError("Not authorized to reject this trade request", 403));
    }

    if (tradeRequest.status !== "pending") {
      return next(createError("Only pending trade requests can be rejected", 400));
    }

    await pool.execute(
      `UPDATE trade_requests
       SET status = 'rejected'
       WHERE id = ?`,
      [requestId]
    );

    const updatedRequest = await getTradeRequestById(pool, requestId);

    res.status(200).json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTradeListing,
  getApprovedTradeListings,
  getMyTradeListings,
  getTradeListingById,
  createTradeRequest,
  getReceivedTradeRequests,
  getSentTradeRequests,
  acceptTradeRequest,
  rejectTradeRequest
};
