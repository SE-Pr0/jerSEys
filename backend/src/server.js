require("dotenv").config();

const app = require("./app");
const { testDbConnection } = require("./config/db");

const PORT = process.env.PORT || 5000;

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

const startServer = async () => {
  try {
    await testDbConnection();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    console.error("Database connection failed with code:", error?.code);
    console.error("Database connection failed with message:", error?.message);
    console.error("Database connection failed with stack:", error?.stack);
    process.exit(1);
  }
};

startServer();
