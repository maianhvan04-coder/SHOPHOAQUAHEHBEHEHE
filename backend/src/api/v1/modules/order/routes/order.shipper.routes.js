const router = require("express").Router();
const orderCtrl = require("../controllers/order.shipper.controller");
const { guard } = require("../../../middlewares/auth");
const { PERMISSIONS } = require("../../../../../constants/permissions");

// GET /api/v1/shipper/order/inbox
router.get(
  "/inbox",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_INBOX_READ] }),
  orderCtrl.getShipperInbox
);

// PATCH /api/v1/shipper/order/:id/claim
router.patch(
  "/:id/claim",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_CLAIM] }),
  orderCtrl.shipperClaimOrder
);

// GET /api/v1/shipper/order/my
router.get(
  "/my",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_MY_READ] }),
  orderCtrl.getMyShipperOrders
);

// PATCH /api/v1/shipper/order/:id/delivered
router.post(
  "/delivered/:id",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_DELIVER] }),
  orderCtrl.shipperMarkDelivered
);

// PATCH /api/v1/shipper/order/:id/cancel
router.post(
  "/cancel/:id",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_CANCEL] }),
  orderCtrl.shipperCancelOrder
);

module.exports = router;
