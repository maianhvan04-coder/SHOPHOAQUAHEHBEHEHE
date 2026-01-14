const router = require("express").Router();
const staffController = require("../controllers/order.staff.controller");
const { guard } = require("../../../middlewares/auth");
const { PERMISSIONS } = require("../../../../../constants/permissions");

// Inbox (chưa gán)
router.get(
  "/unassigned",
  ...guard({ any: [PERMISSIONS.ORDER_STAFF_INBOX_READ] }),
  staffController.getUnassignedOrders
);

// Claim
router.patch(
  "/:id/claim",
  ...guard({ any: [PERMISSIONS.ORDER_STAFF_CLAIM] }),
  staffController.claimOrder
);

// Đơn của tôi
router.get(
  "/",
  ...guard({ any: [PERMISSIONS.ORDER_STAFF_MY_READ] }),
  staffController.getMyStaffOrders
);

module.exports = router;
