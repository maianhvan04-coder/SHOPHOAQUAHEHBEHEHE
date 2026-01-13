const express = require("express");
const dashboardController = require("../controllers/order.dashboard.controller");
const { auth, requireRole } = require("../../../middlewares/auth"); // hoặc file đúng của bạn

const router = express.Router();

router.use(auth, requireRole("ADMIN", "STAFF")); // ✅ bật
router.get("/month", dashboardController.getDashboardMonth);

module.exports = router;
