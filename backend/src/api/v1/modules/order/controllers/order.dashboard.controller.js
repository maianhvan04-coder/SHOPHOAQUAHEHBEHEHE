const orderService = require("../order.service");

module.exports.getDashboardMonth = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const role = req.user?.role; // "ADMIN" | "STAFF" ...
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
    return res.status(400).json({ success: false, message: e.message });
  }
};
