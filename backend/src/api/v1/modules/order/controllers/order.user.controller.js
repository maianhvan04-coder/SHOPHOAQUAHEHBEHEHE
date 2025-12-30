const {
  createOrderService,
  getMyOrdersService,
  cancelOrderService,
  getOrderDetailService,
} = require("../order.service");
module.exports.createOrder = async (req, res) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để thực hiện chức năng này.",
      });
    }

    const newOrder = await createOrderService(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      data: newOrder,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Đã có lỗi xảy ra khi tạo đơn hàng.",
    });
  }
};
module.exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để xem đơn hàng.",
      });
    }

    const orders = await getMyOrdersService(userId, status);

    return res.status(200).json({
      success: true,
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách đơn hàng.",
    });
  }
};
module.exports.getOrderDetail = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const orderId = req.params.id;
    const order = await getOrderDetailService(userId, orderId);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy chi tiết đơn hàng.",
    });
  }
};
module.exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const orderId = req.params.id;
    const cancelledOrder = await cancelOrderService(userId, orderId);

    return res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công.",
      data: cancelledOrder,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi hủy đơn hàng.",
    });
  }
};
