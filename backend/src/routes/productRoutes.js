const express = require("express");

const { pool } = require("../config/db");
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const requireAdmin = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (users.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (users[0].role !== "admin") {
      const error = new Error("Admin access required");
      error.statusCode = 403;
      return next(error);
    }

    req.user.role = users[0].role;
    next();
  } catch (error) {
    next(error);
  }
};

router.get("/", listProducts);
router.get("/:id", getProductById);
router.post("/", protect, requireAdmin, createProduct);
router.put("/:id", protect, requireAdmin, updateProduct);
router.delete("/:id", protect, requireAdmin, deleteProduct);
router.patch("/:id/stock", protect, requireAdmin, updateProductStock);

module.exports = router;
