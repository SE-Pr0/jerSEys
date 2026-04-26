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

const getNotifications = async (req, res, next) => {
  try {
    const [notifications] = await pool.execute(
      `SELECT id, user_id, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const notificationId = parsePositiveInteger(req.params.id, "id");

    const [result] = await pool.execute(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = ? AND user_id = ?`,
      [notificationId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return next(createError("Notification not found", 404));
    }

    const [notifications] = await pool.execute(
      `SELECT id, user_id, message, is_read, created_at
       FROM notifications
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [notificationId, req.user.id]
    );

    res.status(200).json({
      success: true,
      data: notifications[0]
    });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = ? AND is_read = FALSE`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: {
        updatedCount: result.affectedRows
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notificationId = parsePositiveInteger(req.params.id, "id");

    const [result] = await pool.execute(
      `DELETE FROM notifications
       WHERE id = ? AND user_id = ?`,
      [notificationId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return next(createError("Notification not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: notificationId
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};
