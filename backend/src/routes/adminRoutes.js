const express = require("express");

const {
  getAdminTradeListings,
  updateAdminTradeListingStatus
} = require("../controllers/tradeController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/trades", protectAdmin, getAdminTradeListings);
router.patch("/trades/:id/approve", protectAdmin, updateAdminTradeListingStatus);
router.patch("/trades/:id/reject", protectAdmin, updateAdminTradeListingStatus);

module.exports = router;
