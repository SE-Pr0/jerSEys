const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const customJerseyRoutes = require("./routes/customJerseyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

const app = express();
const REQUEST_BODY_LIMIT = "10mb";

app.use(cors());
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/custom-jerseys", customJerseyRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
