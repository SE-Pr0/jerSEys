const { pool } = require("../config/db");

const createNotification = async (userId, message, executor = pool) => {
  await executor.execute(
    `INSERT INTO notifications (user_id, message)
     VALUES (?, ?)`,
    [userId, message]
  );
};

module.exports = createNotification;
