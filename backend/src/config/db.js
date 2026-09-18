const mysql = require("mysql2/promise");

const asBoolean = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
};

const sslEnabled = asBoolean(process.env.DB_SSL, process.env.NODE_ENV === "production");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslEnabled
    ? { rejectUnauthorized: asBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, true) }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testDbConnection = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    console.log("Database connection established successfully.");
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  testDbConnection
};
