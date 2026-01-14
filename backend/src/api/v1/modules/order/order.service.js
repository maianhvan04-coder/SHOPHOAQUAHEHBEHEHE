const mongoose = require("mongoose");
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

  const query = {
    user: userId
  };

  if (status) {
    query["status.orderStatus"] = status;
  }
  const orders = await Order.find(query)
  .populate("staff", "fullName phone")
  .sort({createdAt: -1 });
  return orders;
};
module.exports.getOrderDetailService = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId
  })
  .populate("staff", "fullName phone");
  if (!order) {
    throw new Error(
      "Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này."
    );
  }
  return order;
};
module.exports.cancelOrderService = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

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
  const {
    orderStatus,
    shopNote
  } = statusData;

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
      // ✅ CHẶN: đơn chưa có staff thì không cho Delivered
      if (!order.staff) {
        throw new Error("Đơn chưa có staff (chưa claim), không thể đánh dấu Delivered.");
      }

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
          filter: {
            _id: pid
          },
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
  const {
    status,
    limit = 10,
    page = 1,
    orderId
  } = query;
  const filter = {};
  if (status) filter["status.orderStatus"] = status;
  if (orderId && orderId.trim().length > 0) {
    const searchStr = orderId.trim().toLowerCase();
    const allOrders = await Order.find(
      status ? {
        "status.orderStatus": status
      } : {}
    ).select("_id");
    const matchedIds = allOrders
      .filter((order) => order._id.toString().toLowerCase().includes(searchStr))
      .map((order) => order._id);

    filter["_id"] = {
      $in: matchedIds
    };
  }
  const totalItems = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("user", "fullName phone")
    .populate("staff", "fullName phone")
    .sort({
      createdAt: -1
    })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  return {
    orders,
    totalItems
  };
};

//xem đơn
module.exports.getMyStaffOrdersService = async (staffId, query) => {
  if (!staffId) throw new Error("staffId là bắt buộc.");

  const filter = { staff: staffId };

  if (query && query.status) filter["status.orderStatus"] = query.status;

  if (query && query.month) {
    const [y, m] = query.month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    filter.createdAt = { $gte: start, $lt: end };
  }

  return Order.find(filter).sort({ createdAt: -1 });
};

//staff nhận đơn chưa có staff

module.exports.claimOrderService = async (orderId, staffId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error("orderId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    const err = new Error("staffId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const updated = await Order.findOneAndUpdate(
    {
      _id: orderId,
      "status.orderStatus": "Pending",
      $or: [{ staff: null }, { staff: { $exists: false } }],
    },
    {
      $set: { staff: staffId, staffAssignedAt: new Date() }, // staffAssignedAt optional
    },
    { new: true }
  );

  if (!updated) {
    // check tồn tại để trả mã đúng
    const exists = await Order.exists({ _id: orderId });
    if (!exists) {
      const err = new Error("Không tìm thấy đơn hàng");
      err.statusCode = 404;
      throw err;
    }

    const err = new Error("Đơn không Pending hoặc đã được staff khác nhận");
    err.statusCode = 409;
    throw err;
  }

  return updated;
};

//dashboard
function monthToRange(month) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return {
    start,
    end
  };
}

module.exports.getDashboardMonthService = async ({
  month,
  roles,      // ✅ array: ["ADMIN","STAFF",...]
  userId,
  staffId,
  compare,
}) => {
  if (!month) throw new Error("month is required (YYYY-MM)");

  const { start, end } = monthToRange(month);

  const isAdmin = Array.isArray(roles) && roles.includes("ADMIN");
  const isStaff = Array.isArray(roles) && roles.includes("STAFF");
  const isCompare = isAdmin && compare === "1";

  // ✅ scope theo quyền
  let scopeStaff = null;

  if (isAdmin) {
    if (staffId) {
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        throw new Error("staffId không hợp lệ");
      }
      scopeStaff = new mongoose.Types.ObjectId(staffId);
    }
  } else if (isStaff) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("userId không hợp lệ");
    }
    scopeStaff = new mongoose.Types.ObjectId(userId); // staff chỉ xem của mình
  } else {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  const match = {
    createdAt: { $gte: start, $lt: end },
    ...(scopeStaff ? { staff: scopeStaff } : {}),
  };

  // ✅ success rule theo schema bạn:
  // COD => Delivered, non-COD => isPaid
  const successExpr = {
    $cond: [{
        $eq: ["$paymentMethod", "COD"]
      },
      {
        $eq: ["$status.orderStatus", "Delivered"]
      },
      {
        $eq: ["$status.isPaid", true]
      },
    ],
  };

  const cancelledExpr = {
    $eq: ["$status.orderStatus", "Cancelled"]
  };

  const pipeline = [{
      $match: match
    },
    {
      $facet: {
        kpi: [{
            $group: {
              _id: null,
              revenue: {
                $sum: {
                  $cond: [successExpr, "$totalPrice", 0]
                }
              },
              ordersTotal: {
                $sum: 1
              },
              ordersCancelled: {
                $sum: {
                  $cond: [cancelledExpr, 1, 0]
                }
              },
              ordersSuccess: {
                $sum: {
                  $cond: [successExpr, 1, 0]
                }
              },
              customers: {
                $addToSet: "$user"
              },
            },
          },
          {
            $project: {
              _id: 0,
              revenue: 1,
              ordersTotal: 1,
              ordersCancelled: 1,
              ordersValid: {
                $subtract: ["$ordersTotal", "$ordersCancelled"]
              },
              ordersSuccess: 1,
              aov: {
                $cond: [{
                    $gt: ["$ordersSuccess", 0]
                  },
                  {
                    $divide: ["$revenue", "$ordersSuccess"]
                  },
                  0,
                ],
              },
              uniqueCustomers: {
                $size: "$customers"
              },
            },
          },
        ],

        revenueByDay: [{
            $group: {
              _id: {
                day: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: "Asia/Ho_Chi_Minh",
                  },
                },
              },
              revenue: {
                $sum: {
                  $cond: [successExpr, "$totalPrice", 0]
                }
              },
              ordersSuccess: {
                $sum: {
                  $cond: [successExpr, 1, 0]
                }
              },
            },
          },
          {
            $project: {
              _id: 0,
              day: "$_id.day",
              revenue: 1,
              ordersSuccess: 1
            }
          },
          {
            $sort: {
              day: 1
            }
          },
        ],

        ordersByStatus: [{
            $group: {
              _id: "$status.orderStatus",
              count: {
                $sum: 1
              }
            }
          },
          {
            $project: {
              _id: 0,
              status: "$_id",
              count: 1
            }
          },
          {
            $sort: {      
              count: -1
            }
          },
        ],

        compareByStaff: isCompare ?
          [{
              $match: {
                staff: {
                  $exists: true,
                  $ne: null
                }
              }
            },
            {
              $group: {
                _id: "$staff",
                revenue: {
                  $sum: {
                    $cond: [successExpr, "$totalPrice", 0]
                  }
                },
                ordersSuccess: {
                  $sum: {
                    $cond: [successExpr, 1, 0]
                  }
                },
              },
            },

            // ✅ lấy info staff (tên collection thường là "users")
            {
              $lookup: {
                from: "users", // nếu bạn đặt collection khác thì đổi
                localField: "_id",
                foreignField: "_id",
                as: "staff",
              },
            },
            {
              $unwind: {
                path: "$staff",
                preserveNullAndEmptyArrays: true
              }
            },

            {
              $project: {
                _id: 0,
                staffId: "$_id",
                staffName: "$staff.fullName",
                staffPhone: "$staff.phone",
                revenue: 1,
                ordersSuccess: 1,
              },
            },

            {
              $sort: {
                revenue: -1
              }
            },
          ] :
          [],

      },
    },
  ];

  const [result] = await Order.aggregate(pipeline);

return {
  range: { start, end },
  kpi: (result && result.kpi && result.kpi[0]) || {
    revenue: 0,
    ordersTotal: 0,
    ordersCancelled: 0,
    ordersValid: 0,
    ordersSuccess: 0,
    aov: 0,
    uniqueCustomers: 0,
  },
  revenueByDay: (result && result.revenueByDay) || [],
  ordersByStatus: (result && result.ordersByStatus) || [],
  compareByStaff: (result && result.compareByStaff) || [],
};
};

// staff xem danh sách đơn chưa có staff (inbox)
module.exports.getUnassignedOrdersService = async (query = {}) => {
  const filter = {
    $or: [{ staff: null }, { staff: { $exists: false } }],
  };

  // mặc định inbox là Pending
  const status = (query.status || "Pending").trim();
  if (status) filter["status.orderStatus"] = status;

  return Order.find(filter).sort({ createdAt: -1 }).limit(50);
};

