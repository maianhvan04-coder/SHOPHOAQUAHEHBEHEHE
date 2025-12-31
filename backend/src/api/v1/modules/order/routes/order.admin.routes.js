const router = require("express").Router();
const controller = require("../controllers/order.admin.controller.js");
const validator = require("../order.validator.js");

const { guard } = require("../../../middlewares/auth");
const { PERMISSIONS } = require("../../../../../constants/permissions.js");

const { validate } = require("../../../middlewares/validate.middleware");

router.get(
  "/all",
  ...guard({ any: [PERMISSIONS.ORDER_READ] }),
  controller.getAllOrders
);

router.patch(
  "/update-status/:id",
  ...guard({ any: [PERMISSIONS.ORDER_UPDATE_STATUS] }),
  validate(validator.changeStatus),
  controller.updateOrderStatus
);

module.exports = router;
