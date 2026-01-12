const express = require("express");
const staffController = require("../controllers/order.staff.controller");
const { auth, requireRole } = require("../../../middlewares/auth"); // tuỳ bạn đang đặt tên middleware

const router = express.Router();

router.use(auth, requireRole("STAFF"));
router.get("/unassigned", staffController.getUnassignedOrders); // ✅ đặt lên trên
router.patch("/:id/claim", staffController.claimOrder);
router.get("/", staffController.getMyStaffOrders);

module.exports = router;
