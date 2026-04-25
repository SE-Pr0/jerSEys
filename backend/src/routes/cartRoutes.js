const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", deleteCartItem);
router.delete("/", clearCart);

module.exports = router;
