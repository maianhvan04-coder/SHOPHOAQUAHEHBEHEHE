const express = require("express");
const router = express.Router();
const feedbackController = require("./feedback.controller");
const { auth } = require("../../middlewares/auth/auth.middleware");

// private
router.post("/", auth, feedbackController.createFeedback);
router.put("/:id", auth, feedbackController.updateFeedback);
router.get("/check", auth, feedbackController.getFeedbackByOrderAndProduct);

// public
router.get("/product/:productId", feedbackController.getFeedbacksByProduct);
router.get(
  "/product/:productId/summary",
  feedbackController.getProductRatingSummary
);

module.exports = router;
