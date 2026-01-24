// modules/dashboard/routers/dashboard.route.js

const express = require("express");
const router = express.Router();

const { rebuildDashboardController } = require("../controllers/dashboardAdmin.controller");

const { guard } = require("../../../middlewares/auth");
const { PERMISSIONS } = require("../../../../../constants/permissions");

/**
 * File này được mount tại:
 *   app.use("/api/v1/admin/dashboard", dashboardAdminRoute)
 *
 * => endpoint:
 *   POST /api/v1/admin/dashboard/rebuild
 */

router.post(
  "/rebuild",
  ...guard({ any: [PERMISSIONS.ORDER_DASHBOARD_REBUILD, PERMISSIONS.RBAC_MANAGE] }),
  rebuildDashboardController
);

module.exports = router;
