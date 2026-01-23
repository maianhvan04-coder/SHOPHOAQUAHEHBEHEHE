// modules/order/routes/order.dashboard.routes.js
const express = require("express");
const dashboardController = require("../controllers/order.dashboard.controller");
const { guard } = require("../../../middlewares/auth");
const { PERMISSIONS } = require("../../../../../constants/permissions");

const router = express.Router();

// ✅ Require permission dashboard
router.use(...guard({ any: [PERMISSIONS.ORDER_DASHBOARD_READ] }));

router.get("/month", dashboardController.getDashboardMonth);
router.get("/year", dashboardController.getDashboardYear);
router.get("/day", dashboardController.getDashboardDay);

module.exports = router;
