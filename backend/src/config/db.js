const mysql = require("mysql2/promise");

const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
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
