const express = require("express");

const {
  createCustomJersey,
  getCustomJerseys,
  getCustomJerseyById,
  updateCustomJersey,
  deleteCustomJersey
} = require("../controllers/customJerseyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createCustomJersey);
router.get("/", getCustomJerseys);
router.get("/:id", getCustomJerseyById);
router.put("/:id", updateCustomJersey);
router.delete("/:id", deleteCustomJersey);

module.exports = router;
