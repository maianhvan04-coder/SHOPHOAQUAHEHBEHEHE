// modules/order/controllers/order.dashboard.controller.js
const orderService = require("../order.service");

function normalizeRoles(req) {
  return (req.user?.roles || []).map((r) => String(r).toUpperCase());
}
function hasRole(roles, code) {
  const up = String(code).toUpperCase();
  return roles.includes(up) || roles.includes(`ROLE_${up}`);
}

module.exports.getDashboardMonth = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập." });

    const roles = normalizeRoles(req);
    const role = hasRole(roles, "ADMIN") ? "ADMIN" : hasRole(roles, "STAFF") ? "STAFF" : "USER";

    const { month, staffId, compare } = req.query;

    const data = await orderService.getDashboardMonthService({
      month,
      role,
      userId,
      staffId,
      compare,
    });

    return res.status(200).json({ success: true, data });
  } catch (e) {
    const status = e.statusCode || (e.message === "Forbidden" ? 403 : 400);
    return res.status(status).json({ success: false, message: e.message });
  }
};
