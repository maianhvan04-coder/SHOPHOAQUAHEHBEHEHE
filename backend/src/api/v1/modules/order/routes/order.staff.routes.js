const express = require("express");
const staffController = require("../controllers/order.staff.controller");
// const { auth, requireRole } = require("../middlewares/auth"); // tuỳ bạn đang đặt tên middleware

const router = express.Router();

// router.use(auth, requireRole("STAFF"));
router.get("/", staffController.getMyStaffOrders);
router.patch("/:id/claim", staffController.claimOrder);

module.exports = router;
