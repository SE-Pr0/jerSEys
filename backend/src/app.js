const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/health", healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
