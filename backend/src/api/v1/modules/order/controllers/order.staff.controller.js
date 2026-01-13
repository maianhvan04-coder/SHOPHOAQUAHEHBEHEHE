const orderService = require("../order.service");

// STAFF xem đơn của mình
module.exports.getMyStaffOrders = async (req, res) => {
  try {
    const staffId = req.user?.sub;
    if (!staffId) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập." });

    const orders = await orderService.getMyStaffOrdersService(staffId, req.query);
    return res.status(200).json({ success: true, data: orders });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

// STAFF nhận đơn chưa có staff (claim)
module.exports.claimOrder = async (req, res) => {
  try {
    const staffId = req.user?.sub;
    const { id } = req.params;

    const updated = await orderService.claimOrderService(id, staffId);
    return res.status(200).json({ success: true, message: "Nhận đơn thành công!", data: updated });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

module.exports.getUnassignedOrders = async (req, res) => {
  try {
    const orders = await orderService.getUnassignedOrdersService(req.query);
    return res.status(200).json({ success: true, data: orders });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};
