const orderService = require("../order.service");
module.exports.getAllOrders = async (req, res) => {
  try {
   
    const orders = await orderService.getAllOrdersAdmin(req.query);
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công.",
      data: orders,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách đơn hàng.",
    });
  }
};

module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const updatedOrder = await orderService.updateOrderStatusAdmin(id, req.body);
    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công!",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật trạng thái đơn hàng.",
    });
  }
};