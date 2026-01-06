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

  // Lấy thông tin sản phẩm và chốt giá tại thời điểm đặt hàng
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
      image: product.image?.url || "",
      quantity: item.quantity,
      price: currentPrice,
    });
  }

  const totalPrice = itemsPrice + shippingPrice;

  // Lưu đơn hàng với cấu trúc địa chỉ mới
  const newOrder = await Order.create({
    user: userId,
    orderItems: processedItems,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      province: shippingAddress.province,
      ward: shippingAddress.ward,
      addressDetails: shippingAddress.addressDetails,
    },
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

  // Chặn cập nhật nếu đã Delivered/Cancelled
  if (order.status.orderStatus === "Delivered") {
    throw new Error("Đơn hàng đã hoàn thành, không thể cập nhật thêm.");
  }
  if (order.status.orderStatus === "Cancelled") {
    throw new Error("Đơn hàng đã bị hủy, không thể cập nhật.");
  }

  if (typeof shopNote === "string") order.shopNote = shopNote;

  if (orderStatus) {
    order.status.orderStatus = orderStatus;


    if (orderStatus === "Delivered") {


      if (order.status.isDelivered) {
        throw new Error("Đơn hàng đã được đánh dấu Delivered trước đó.");
      }



      const qtyByProduct = new Map();
      for (const item of order.orderItems || []) {
        const pid = String(item.product);
        const q = Number(item.quantity || 0);
        if (!pid || q <= 0) continue;
        qtyByProduct.set(pid, (qtyByProduct.get(pid) || 0) + q);
      }

      // 2) update hàng loạt Product.sold += qty
      const ops = Array.from(qtyByProduct.entries()).map(([pid, qty]) => ({
        updateOne: {
          filter: { _id: pid },
          update: {
            $inc: {
              sold: qty,
              stock: -qty,
            },
          },
        },
      }));

      if (ops.length) {
        await Product.bulkWrite(ops);
      }

      // 3) set flags cho order
      order.status.isDelivered = true;
      order.status.deliveredAt = Date.now();

      order.status.isPaid = true;
      order.status.paidAt = Date.now();
    }
  }

  return await order.save();
};




module.exports.getAllOrdersAdmin = async (query) => {
  const { status, limit = 10, page = 1, orderId } = query;
  const filter = {};
  if (status) filter["status.orderStatus"] = status;
  if (orderId && orderId.trim().length > 0) {
    const searchStr = orderId.trim().toLowerCase();
    const allOrders = await Order.find(
      status ? { "status.orderStatus": status } : {}
    ).select("_id");
    const matchedIds = allOrders
      .filter((order) => order._id.toString().toLowerCase().includes(searchStr))
      .map((order) => order._id);

    filter["_id"] = { $in: matchedIds };
  }
  const totalItems = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("user", "fullName phone")
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  return { orders, totalItems };
};
