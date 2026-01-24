// modules/dashboard/controller/dashboardAdmin.controller.js

const { rebuildDashboardFromOrders } = require("../service/dashboardRebuild.service");

module.exports.rebuildDashboardController = async (req, res, next) => {
  try {
    const r = await rebuildDashboardFromOrders();
    res.json(r);
  } catch (e) {
    next(e);
  }
};
