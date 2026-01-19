// order.shipper.controller
const orderService = require("../order.service");

exports.getShipperInbox = async (req, res, next) => {
  try {
    const data = await orderService.getShipperInboxService();
    return res.json({ data });
  } catch (e) {
    next(e);
  }
};

exports.shipperClaimOrder = async (req, res, next) => {
  try {
    const shipperId = req.user.sub;
    const orderId = req.params.id;

    const data = await orderService.shipperClaimOrderService(orderId, shipperId);
    return res.json({ data });
  } catch (e) {
    next(e);
  }
};

exports.getMyShipperOrders = async (req, res, next) => {
  try {
    const shipperId = req.user.sub;
    const data = await orderService.getMyShipperOrdersService(shipperId, req.query);
    return res.json({ data });
  } catch (e) {
    next(e);
  }
};

// ✅ giao xong => Delivered
exports.shipperMarkDelivered = async (req, res, next) => {
  try {
    const shipperId = req.user.sub;
    const orderId = req.params.id;

    const data = await orderService.shipperMarkDeliveredService(orderId, shipperId);
    return res.json({ data });
  } catch (e) {
    next(e);
  }
};

// ✅ hủy => Cancelled
exports.shipperCancelOrder = async (req, res, next) => {
  try {
    const shipperId = req.user.sub;
    const orderId = req.params.id;

    const data = await orderService.shipperCancelOrderService(orderId, shipperId, req.body);
    return res.json({ data });
  } catch (e) {
    next(e);
  }
};
