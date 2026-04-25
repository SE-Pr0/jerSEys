const express = require("express");

const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
