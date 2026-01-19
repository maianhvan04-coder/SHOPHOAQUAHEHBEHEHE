// modules/order/routes/order.shipper.routes.js
const router = require("express").Router();
const orderCtrl = require("../controllers/order.shipper.controller"); // hoặc ../order.controller tuỳ bạn
const { guard } = require("../../../middlewares/auth");
const { PERMISSIONS } = require("../../../../../constants/permissions");


// console.log("SHIPPER_INBOX perm =", PERMISSIONS.ORDER_SHIPPER_INBOX_READ);
// console.log("SHIPPER_CLAIM perm =", PERMISSIONS.ORDER_SHIPPER_CLAIM);

// GET /api/v1/shipper/order/inbox
router.get(
  "/inbox",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_INBOX_READ] }),
  orderCtrl.getShipperInbox
);

// POST /api/v1/shipper/order/claim/:id
router.post(
  "/claim/:id",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_CLAIM] }),
  orderCtrl.shipperClaimOrder
);

// GET /api/v1/shipper/order/my
router.get(
  "/my",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_INBOX_READ] }), // dùng tạm perm này cho SH
  orderCtrl.getMyShipperOrders
);

// ✅ POST /api/v1/shipper/order/delivered/:id
router.post(
  "/delivered/:id",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_DELIVER ?? PERMISSIONS.ORDER_SHIPPER_CLAIM] }),
  orderCtrl.shipperMarkDelivered
);

// ✅ POST /api/v1/shipper/order/cancel/:id
router.post(
  "/cancel/:id",
  ...guard({ any: [PERMISSIONS.ORDER_SHIPPER_CANCEL ?? PERMISSIONS.ORDER_SHIPPER_CLAIM] }),
  orderCtrl.shipperCancelOrder
);


module.exports = router;
