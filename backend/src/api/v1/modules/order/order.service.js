const Order = require("./order.model");
const Product = require("../product/product.model");

module.exports.createOrderService = async (userId, data) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    shippingPrice = 0,
    customerNote,
  } = data;

  if (!orderItems || orderItems.length === 0) {
    throw new Error("Đơn hàng phải có ít nhất một sản phẩm.");
  }

  let itemsPrice = 0;
  const processedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error(`Sản phẩm ID ${item.product} không tồn tại.`);
    }

    const currentPrice = product.price;
    itemsPrice += currentPrice * item.quantity;

    processedItems.push({
      product: product._id,
      name: product.name,
      image: product.image.url,
      quantity: item.quantity,
      price: currentPrice,
    });
  }

  const totalPrice = itemsPrice + shippingPrice;

  const newOrder = await Order.create({
    user: userId,
    orderItems: processedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    customerNote,
    status: {
      orderStatus: "Pending",
      isPaid: false,
      isDelivered: false,
    },
  });

  return newOrder;
};

module.exports.getMyOrdersService = async (userId, status) => {
  if (!userId) {
    throw new Error("UserId là bắt buộc.");
  }

  const query = { user: userId };

  if (status) {
    query["status.orderStatus"] = status;
  }
  const orders = await Order.find(query).sort({ createdAt: -1 });

  return orders;
};
module.exports.getOrderDetailService = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new Error(
      "Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này."
    );
  }
  return order;
};
module.exports.getMyOrdersService = async (userId, status) => {
  if (!userId) {
    throw new Error("UserId là bắt buộc.");
  }

  const query = { user: userId };
  if (status) {
    query["status.orderStatus"] = status;
  }
  const orders = await Order.find(query).sort({ createdAt: -1 });

  return orders;
};
module.exports.cancelOrderService = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    throw new Error(
      "Không tìm thấy đơn hàng hoặc bạn không có quyền thực hiện."
    );
  }

  if (order.status.orderStatus !== "Pending") {
    throw new Error(
      `Đơn hàng đã được ${order.status.orderStatus}, không thể tự hủy lúc này.`
    );
  }

  order.status.orderStatus = "Cancelled";

  const cancelledOrder = await order.save();

  return cancelledOrder;
};
module.exports.updateOrderStatusAdmin = async (orderId, statusData) => {
  const { orderStatus, shopNote } = statusData;

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng.");

  if (shopNote) order.shopNote = shopNote;

  if (orderStatus) {
    order.status.orderStatus = orderStatus;

    if (orderStatus === "Delivered") {
      order.status.isDelivered = true;
      order.status.deliveredAt = Date.now();
      order.status.isPaid = true;
      order.status.paidAt = Date.now();
    }
  }

  return await order.save();
};
module.exports.getAllOrdersAdmin = async (query) => {
  const { status, limit = 10, page = 1 } = query;
  
  const filter = {};
  if (status) filter["status.orderStatus"] = status;

  return await Order.find(filter)
    .populate("user", "fullName phone") 
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};