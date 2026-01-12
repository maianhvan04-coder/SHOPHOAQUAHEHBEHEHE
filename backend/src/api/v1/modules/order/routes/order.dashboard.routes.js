const express = require("express");
const dashboardController = require("../controllers/order.dashboard.controller");
// const { auth } = require("../middlewares/auth");

const router = express.Router();

// router.use(auth);
router.get("/month", dashboardController.getDashboardMonth);

module.exports = router;
