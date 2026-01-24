const mongoose = require("mongoose");
const Order = require("./order.model");
const Product = require("../product/models/product.model");

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
    .sort({
      createdAt: -1
    });
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


module.exports.updateOrderStatusAdmin = async (orderId, statusData = {}) => {
  const { orderStatus, shopNote } = statusData;

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng.");

  const current = order.status?.orderStatus ?? "Pending";

  // Stop nếu end-state
  if (current === "Delivered") throw new Error("Đơn hàng đã hoàn thành, không thể cập nhật thêm.");
  if (current === "Cancelled") throw new Error("Đơn hàng đã bị hủy, không thể cập nhật.");

  if (typeof shopNote === "string") order.shopNote = shopNote;

  // Không truyền orderStatus thì chỉ update shopNote
  if (!orderStatus) return await order.save();

  // Chặn chuyển trạng thái sai luồng
  const allowedNext = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
    Delivered: [],
    Cancelled: [],
  };

  if (!allowedNext[current]?.includes(orderStatus)) {
    throw new Error(`Không thể chuyển từ ${current} sang ${orderStatus}.`);
  }

  // Rule chung: muốn ship/deliver thì phải có staff + đã confirmed
  if (orderStatus === "Shipped" || orderStatus === "Delivered") {
    if (!order.staff) throw new Error("Đơn chưa có staff (chưa claim), không thể giao.");
    if (!order.status?.confirmedAt) throw new Error("Đơn chưa Confirmed, không thể giao.");
  }

  // ✅ Update trạng thái (sau khi pass validate)
  order.status ??= {};
  const now = new Date();

  order.status.orderStatus = orderStatus;

  // set confirmedAt khi chuyển Confirmed
  if (orderStatus === "Confirmed" && !order.status.confirmedAt) {
    order.status.confirmedAt = now;
  }

  // chỉ làm “trừ kho / đánh dấu delivered/paid” khi Delivered
  if (orderStatus === "Delivered") {
    if (order.status.isDelivered) {
      throw new Error("Đơn hàng đã được đánh dấu Delivered trước đó.");
    }

    // gom qty theo product
    const qtyByProduct = new Map();
    for (const item of order.orderItems || []) {
      const pid = String(item.product);
      const q = Number(item.quantity || 0);
      if (!pid || q <= 0) continue;
      qtyByProduct.set(pid, (qtyByProduct.get(pid) || 0) + q);
    }

    // update Product.sold += qty, stock -= qty
    const ops = Array.from(qtyByProduct.entries()).map(([pid, qty]) => ({
      updateOne: {
        filter: { _id: pid },
        update: { $inc: { sold: qty, stock: -qty } },
      },
    }));
    if (ops.length) await Product.bulkWrite(ops);

    // flags delivered
    order.status.isDelivered = true;
    order.status.deliveredAt = now;

    // ✅ chỉ auto-paid nếu COD và chưa paid
    if (order.paymentMethod === "COD" && !order.status.isPaid) {
      order.status.isPaid = true;
      order.status.paidAt = now;
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

  const filter = {
    staff: staffId
  };

  if (query && query.status) filter["status.orderStatus"] = query.status;

  if (query && query.month) {
    const [y, m] = query.month.split("-").map(Number);
    const offsetMs = 7 * 60 * 60 * 1000;
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0) - offsetMs);
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0) - offsetMs);
    filter.createdAt = {
      $gte: start,
      $lt: end
    };
  }

  return Order.find(filter).sort({
    createdAt: -1
  });
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

  const now = new Date();

  const updated = await Order.findOneAndUpdate(
    {
      _id: orderId,
      "status.orderStatus": "Pending",
      $or: [{ staff: null }, { staff: { $exists: false } }],
    },
    {
      $set: {
        staff: staffId,
        "status.orderStatus": "Confirmed",
        "status.confirmedAt": now,
      },
    },
    { new: true }
  );

  if (!updated) {
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
function monthToRangeVN(month) {
  const [y, m] = String(month).split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) throw new Error("month is required (YYYY-MM)");

  const offsetMs = 7 * 60 * 60 * 1000; // VN = UTC+7

  // 00:00 ngày 1 theo giờ VN -> UTC = trừ 7 tiếng
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0) - offsetMs);
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0) - offsetMs);

  return {
    start,
    end
  };
}

module.exports.getDashboardMonthService = async ({
  month,
  roles, // ✅ array: ["ADMIN","STAFF",...]
  userId,
  staffId,
  compare,
}) => {
  if (!month) throw new Error("month is required (YYYY-MM)");

  const {
    start,
    end
  } = monthToRangeVN(month);

  const isAdmin =
    Array.isArray(roles) && (roles.includes("ADMIN") || roles.includes("ROLE_ADMIN"));
  const isStaff =
    Array.isArray(roles) && (roles.includes("STAFF") || roles.includes("ROLE_STAFF"));

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
    createdAt: {
      $gte: start,
      $lt: end
    },
    ...(scopeStaff ? {
      staff: scopeStaff
    } : {}),
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

      compareByStaff: isCompare ? [{
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
          _id: "$_id", // ✅ FE đang dùng x._id
          staffId: "$_id", // (giữ thêm cho rõ)
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
      ] : [],

    },
  },
  ];

  const [result] = await Order.aggregate(pipeline);

  return {
    range: {
      start,
      end
    },
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

// ===== dashboard year =====
function yearToRangeVN(year) {
  // Asia/Ho_Chi_Minh = UTC+7, không DST
  const y = Number(year);
  if (!Number.isFinite(y) || y < 2000 || y > 2100) {
    throw new Error("year is required (YYYY)");
  }

  const offsetMs = 7 * 60 * 60 * 1000;

  // local 00:00 (VN) -> UTC = -7h
  const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0) - offsetMs);
  const end = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0) - offsetMs);

  return {
    start,
    end,
    year: String(y)
  };
}

function monthsOfYear(yearStr) {
  return Array.from({
    length: 12
  }, (_, i) => {
    const mm = String(i + 1).padStart(2, "0");
    return `${yearStr}-${mm}`;
  });
}

module.exports.getDashboardYearService = async ({
  year, // "2026"
  roles, // ["ADMIN","STAFF",...]
  userId,
  staffId, // optional for admin
}) => {
  const {
    start,
    end,
    year: yStr
  } = yearToRangeVN(year);

  const isAdmin =
    Array.isArray(roles) && (roles.includes("ADMIN") || roles.includes("ROLE_ADMIN"));
  const isStaff =
    Array.isArray(roles) && (roles.includes("STAFF") || roles.includes("ROLE_STAFF"));

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
    createdAt: {
      $gte: start,
      $lt: end
    },
    ...(scopeStaff ? {
      staff: scopeStaff
    } : {}),
  };

  // ✅ success rule: COD => Delivered, non-COD => isPaid
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

  const rows = await Order.aggregate([{
    $match: match
  },
  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m",
          date: "$createdAt",
          timezone: "Asia/Ho_Chi_Minh",
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
      month: "$_id",
      revenue: 1,
      ordersSuccess: 1,
    },
  },
  {
    $sort: {
      month: 1
    }
  },
  ]);

  // ✅ fill đủ 12 tháng (tháng nào không có thì 0)
  const map = new Map(rows.map((r) => [String(r.month), r]));
  const revenueByMonth = monthsOfYear(yStr).map((m) => {
    const hit = map.get(m);
    return {
      month: m,
      revenue: hit ? Number(hit.revenue || 0) : 0,
      ordersSuccess: hit ? Number(hit.ordersSuccess || 0) : 0,
    };
  });

  const totalRevenue = revenueByMonth.reduce((s, x) => s + (Number(x.revenue) || 0), 0);

  return {
    year: yStr,
    range: {
      start,
      end
    },
    totalRevenue,
    revenueByMonth, // ✅ FE vẽ chart từ mảng này
  };
};


// staff xem danh sách đơn chưa có staff (inbox)
module.exports.getUnassignedOrdersService = async (query = {}) => {
  const status = String(query.status || "Pending").trim();

  return Order.find({
    "status.orderStatus": status,
    $or: [{ staff: null }, { staff: { $exists: false } }],
  })
    .sort({ createdAt: -1 })
    .limit(50);
};

