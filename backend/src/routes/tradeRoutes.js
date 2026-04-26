const express = require("express");

const {
  createTradeListing,
  getApprovedTradeListings,
  getMyTradeListings,
  getTradeListingById,
  createTradeRequest,
  getReceivedTradeRequests,
  getSentTradeRequests,
  cancelTradeListing,
  acceptTradeRequest,
  rejectTradeRequest
} = require("../controllers/tradeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getApprovedTradeListings);
router.get("/my-listings", protect, getMyTradeListings);
router.get("/requests/received", protect, getReceivedTradeRequests);
router.get("/requests/sent", protect, getSentTradeRequests);
router.get("/:id", getTradeListingById);
router.post("/", protect, createTradeListing);
router.delete("/:id", protect, cancelTradeListing);
router.post("/:id/request", protect, createTradeRequest);
router.patch("/request/:requestId/accept", protect, acceptTradeRequest);
router.patch("/request/:requestId/reject", protect, rejectTradeRequest);

module.exports = router;
