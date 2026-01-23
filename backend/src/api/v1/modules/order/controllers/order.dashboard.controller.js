// modules/order/controllers/order.dashboard.controller.js
const orderService = require("../order.service");

function normalizeRoles(req) {
  return (req.user?.roles || []).map((r) => String(r).toUpperCase());
}
// function hasRole(roles, code) {
//   const up = String(code).toUpperCase();
//   return roles.includes(up) || roles.includes(`ROLE_${up}`);
// }

//dashboarh day
module.exports.getDashboardDay = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Bạn cần đăng nhập." });
    }

    const roles = normalizeRoles(req);
    const { date, staffId } = req.query; // date optional

    const data = await orderService.getDashboardDayService({
      date,
      roles,
      userId,
      staffId,
    });

    return res.status(200).json({ success: true, data });
  } catch (e) {
    const status = e.statusCode || 400;
    return res.status(status).json({ success: false, message: e.message });
  }
};


// dashboard tháng
module.exports.getDashboardMonth = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Bạn cần đăng nhập." });
    }

    const roles = normalizeRoles(req);
    const { month, staffId, compare } = req.query;

    const data = await orderService.getDashboardMonthService({
      month,
      roles,     // ✅ truyền mảng roles
      userId,
      staffId,
      compare,
    });

    return res.status(200).json({ success: true, data });
  } catch (e) {
    const status = e.statusCode || 400;
    return res.status(status).json({ success: false, message: e.message });
  }
};


// dashboard năm
module.exports.getDashboardYear = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Bạn cần đăng nhập." });
    }

    const roles = normalizeRoles(req);
    const { year, staffId } = req.query;

    const data = await orderService.getDashboardYearService({
      year,
      roles,
      userId,
      staffId,
    });

    return res.status(200).json({ success: true, data });
  } catch (e) {
    const status = e.statusCode || 400;
    return res.status(status).json({ success: false, message: e.message });
  }
};

