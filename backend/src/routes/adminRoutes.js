const express = require("express");

const {
  getAdminTradeListings,
  updateAdminTradeListingStatus
} = require("../controllers/tradeController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/trades", protectAdmin, getAdminTradeListings);
router.patch("/trades/:id/approve", protectAdmin, (req, res, next) => {
  req.params.action = "approve";
  updateAdminTradeListingStatus(req, res, next);
});
router.patch("/trades/:id/reject", protectAdmin, (req, res, next) => {
  req.params.action = "reject";
  updateAdminTradeListingStatus(req, res, next);
});

module.exports = router;
