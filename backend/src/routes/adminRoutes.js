const express = require("express");

const {
  getDashboard,
  getUsers,
  deleteUser,
  getOrders,
  updateOrderStatus,
  getTrades,
  approveTrade,
  rejectTrade
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.get("/orders", getOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/trades", getTrades);
router.patch("/trades/:id/approve", approveTrade);
router.patch("/trades/:id/reject", rejectTrade);

module.exports = router;
