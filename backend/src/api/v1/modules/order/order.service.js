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

  // ✅ Tạm thời chỉ cho COD (giữ Paypal trong Joi nhưng chặn ở service)
  if (paymentMethod && paymentMethod !== "COD") {
    const err = new Error("Hiện shop chỉ hỗ trợ COD (thanh toán khi nhận hàng).");
    err.statusCode = 400;
    throw err;
  }

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
  const now = new Date();

const newOrder = await Order.create({
  user: userId,
  // createdBy: null, // khách tự đặt => để null (default)
  orderItems: processedItems,
  shippingAddress: {
    fullName: shippingAddress.fullName,
    phone: shippingAddress.phone,
    province: shippingAddress.province,
    ward: shippingAddress.ward,
    addressDetails: shippingAddress.addressDetails,
  },
  paymentMethod: "COD", //ép về COD
  itemsPrice,
  shippingPrice,
  totalPrice,
  customerNote,
  status: {
    orderStatus: "Pending",
    isPaid: false,
    isDelivered: false,
  },
  timeline: [{ type: "CREATE", by: userId, at: now }],
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
module.exports.cancelOrderService = async (userId, orderId, body = {}) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error("orderId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error("userId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  const cancelled = await Order.findOneAndUpdate(
    { _id: orderId, user: userId, "status.orderStatus": "Pending" },
    {
      $set: {
        "status.orderStatus": "Cancelled",
        "status.cancelledAt": now,
        cancelledBy: userId,
        ...(reason ? { shopNote: reason } : {}),
      },
      $push: {
        timeline: { type: "CANCEL", by: userId, at: now, note: reason || "User cancelled order" },
      },
    },
    { new: true }
  );

  if (!cancelled) {
    const order = await Order.findOne({ _id: orderId, user: userId }).select("status.orderStatus");
    if (!order) {
      const err = new Error("Không tìm thấy đơn hàng hoặc bạn không có quyền thực hiện.");
      err.statusCode = 404;
      throw err;
    }
    const err = new Error(`Đơn hàng đã được ${order.status?.orderStatus || "xử lý"}, không thể tự hủy lúc này.`);
    err.statusCode = 409;
    throw err;
  }

  return cancelled;
};

module.exports.updateOrderStatusAdmin = async (orderId, statusData = {}) => {
  const { orderStatus, shopNote, actorId } = statusData;

  const by =
    actorId && mongoose.Types.ObjectId.isValid(actorId)
      ? new mongoose.Types.ObjectId(actorId)
      : null;

  // Không truyền orderStatus mà chỉ update note
  if (!orderStatus) {
    const now = new Date();
    const updated = await Order.findById(orderId);
    if (!updated) throw new Error("Không tìm thấy đơn hàng.");

    if (typeof shopNote === "string") {
      updated.shopNote = shopNote;
      updated.timeline ??= [];
      updated.timeline.push({ type: "NOTE", by, at: now, note: shopNote });
    }

    return await updated.save();
  }

  // các trạng thái hợp lệ
  const allowedNext = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
    Delivered: [],
    Cancelled: [],
  };

  // ✅ nếu Delivered => transaction (vì có trừ kho)
  const needTx = orderStatus === "Delivered";

  const session = needTx ? await mongoose.startSession() : null;
  if (session) session.startTransaction();

  try {
    const order = needTx
      ? await Order.findById(orderId).session(session)
      : await Order.findById(orderId);

    if (!order) throw new Error("Không tìm thấy đơn hàng.");

    const current = order.status?.orderStatus ?? "Pending";

    // Stop nếu end-state
    if (current === "Delivered") throw new Error("Đơn hàng đã hoàn thành, không thể cập nhật thêm.");
    if (current === "Cancelled") throw new Error("Đơn hàng đã bị hủy, không thể cập nhật.");

    // Chặn chuyển trạng thái sai luồng
    if (!allowedNext[current]?.includes(orderStatus)) {
      throw new Error(`Không thể chuyển từ ${current} sang ${orderStatus}.`);
    }

    // Update note (nếu có)
    if (typeof shopNote === "string") {
      order.shopNote = shopNote;
    }

    // Rule chung: muốn ship/deliver thì phải có staff + đã confirmed
    if (orderStatus === "Shipped" || orderStatus === "Delivered") {
      if (!order.staff) throw new Error("Đơn chưa có staff (chưa claim), không thể giao.");
      if (!order.status?.confirmedAt) throw new Error("Đơn chưa Confirmed, không thể giao.");
    }

    order.status ??= {};
    order.timeline ??= [];
    const now = new Date();

    // set orderStatus
    order.status.orderStatus = orderStatus;

    // ====== CONFIRMED ======
    if (orderStatus === "Confirmed") {
      order.status.confirmedAt ??= now;
      order.confirmedBy ??= by ?? order.staff ?? null;

      order.timeline.push({
        type: "CONFIRM",
        by: by ?? order.staff ?? null,
        at: now,
      });
    }

    // ====== SHIPPED ======
    if (orderStatus === "Shipped") {
      if (!order.shipper) throw new Error("Chưa có shipper nhận đơn, không thể chuyển Shipped.");

      order.status.shippedAt ??= now;
      // shippedBy: ưu tiên người thao tác, nếu không có thì mặc định shipper
      order.shippedBy ??= by ?? order.shipper ?? null;

      order.timeline.push({
        type: "SHIP",
        by: by ?? order.shipper ?? null,
        at: now,
      });
    }

    // ====== CANCELLED ======
    if (orderStatus === "Cancelled") {
      order.status.cancelledAt ??= now;
      order.cancelledBy ??= by ?? order.staff ?? null;

      order.timeline.push({
        type: "CANCEL",
        by: by ?? order.staff ?? null,
        at: now,
        note: typeof shopNote === "string" && shopNote.trim() ? shopNote.trim() : "",
      });
    }

    // ====== DELIVERED (trừ kho + auto paid COD) ======
    if (orderStatus === "Delivered") {
      if (order.status.isDelivered) {
        throw new Error("Đơn hàng đã được đánh dấu Delivered trước đó.");
      }

      // an toàn: nếu thiếu shippedAt thì set
      order.status.shippedAt ??= now;

      // gom qty theo product
      const qtyByProduct = new Map();
      for (const item of order.orderItems || []) {
        const pid = String(item.product);
        const q = Number(item.quantity || 0);
        if (!pid || q <= 0) continue;
        qtyByProduct.set(pid, (qtyByProduct.get(pid) || 0) + q);
      }

      const ops = Array.from(qtyByProduct.entries()).map(([pid, qty]) => ({
        updateOne: {
          filter: { _id: pid },
          update: { $inc: { sold: qty, stock: -qty } },
        },
      }));

      if (ops.length) {
        await Product.bulkWrite(ops, { session });
      }

      // flags delivered
      order.status.isDelivered = true;
      order.status.deliveredAt = now;

      // ai delivered: ưu tiên actor, nếu không có thì shipper
      order.deliveredBy ??= by ?? order.shipper ?? null;

      order.timeline.push({
        type: "DELIVER",
        by: by ?? order.shipper ?? null,
        at: now,
      });

      // ✅ COD auto-paid nếu chưa paid
      if (order.paymentMethod === "COD" && !order.status.isPaid) {
        order.status.isPaid = true;
        order.status.paidAt = now;
        // ai thu tiền COD: thường là shipper, nếu không có thì actor
        order.paidBy ??= order.shipper ?? by ?? null;

        order.timeline.push({
          type: "PAY",
          by: order.paidBy ?? null,
          at: now,
          meta: { method: "COD", amount: order.totalPrice },
        });
      }
    }

    const saved = needTx ? await order.save({ session }) : await order.save();

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return saved;
  } catch (e) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw e;
  }
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

// ====================== DASHBOARD ======================
//dashboarh ngày
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

// YYYY-MM-DD theo giờ VN (không phụ thuộc timezone server)
function vnDateYYYYMMDD(date = new Date()) {
  const d = new Date(date.getTime() + VN_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function vnYesterdayYYYYMMDD() {
  const now = new Date();
  return vnDateYYYYMMDD(new Date(now.getTime() - 24 * 60 * 60 * 1000));
}

function dayToRangeVN(dateStr) {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) throw new Error("date is required (YYYY-MM-DD)");

  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - VN_OFFSET_MS);
  const end = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0) - VN_OFFSET_MS);
  return { start, end, day: dateStr };
}


// ✅ DAY: doanh thu theo paidAt, số đơn theo createdAt
module.exports.getDashboardDayService = async ({
  date, // optional: "YYYY-MM-DD" (không truyền => hôm qua)
  roles,
  userId,
  staffId,
}) => {
  const dateStr = date || vnYesterdayYYYYMMDD();
  const { start, end, day } = dayToRangeVN(dateStr);

  const isAdmin = Array.isArray(roles) && (roles.includes("ADMIN") || roles.includes("ROLE_ADMIN"));
  const isStaff = Array.isArray(roles) && (roles.includes("STAFF") || roles.includes("ROLE_STAFF"));

  let scopeStaff = null;

  if (isAdmin) {
    if (staffId) {
      if (!mongoose.Types.ObjectId.isValid(staffId)) throw new Error("staffId không hợp lệ");
      scopeStaff = new mongoose.Types.ObjectId(staffId);
    }
  } else if (isStaff) {
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("userId không hợp lệ");
    scopeStaff = new mongoose.Types.ObjectId(userId);
  } else {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  const baseMatch = {
    ...(scopeStaff ? { staff: scopeStaff } : {}),
  };

  const pipeline = [
    { $match: baseMatch },
    {
      $facet: {
        // 1) KPI doanh thu theo ngày THU TIỀN
        paidKpi: [
          { $match: { "status.isPaid": true, "status.paidAt": { $gte: start, $lt: end } } },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$totalPrice" },
              ordersSuccess: { $sum: 1 },
              customers: { $addToSet: "$user" },
            },
          },
          {
            $project: {
              _id: 0,
              revenue: 1,
              ordersSuccess: 1,
              uniqueCustomers: { $size: "$customers" },
            },
          },
        ],

        // 2) KPI số lượng đơn theo ngày TẠO ĐƠN (để có Pending/Cancelled)
        ordersKpi: [
          { $match: { createdAt: { $gte: start, $lt: end } } },
          {
            $group: {
              _id: null,
              ordersTotal: { $sum: 1 },
              ordersCancelled: {
                $sum: { $cond: [{ $eq: ["$status.orderStatus", "Cancelled"] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              ordersTotal: 1,
              ordersCancelled: 1,
              ordersValid: { $subtract: ["$ordersTotal", "$ordersCancelled"] },
            },
          },
        ],

        // 3) OrdersByStatus theo createdAt
        ordersByStatus: [
          { $match: { createdAt: { $gte: start, $lt: end } } },
          { $group: { _id: "$status.orderStatus", count: { $sum: 1 } } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
          { $sort: { count: -1 } },
        ],
      },
    },
  ];

  const [result] = await Order.aggregate(pipeline).option({ allowDiskUse: true });

  const paid = result?.paidKpi?.[0] || { revenue: 0, ordersSuccess: 0, uniqueCustomers: 0 };
  const ord = result?.ordersKpi?.[0] || { ordersTotal: 0, ordersCancelled: 0, ordersValid: 0 };

  return {
    day,
    range: { start, end },
    kpi: {
      revenue: paid.revenue,
      ordersTotal: ord.ordersTotal,
      ordersCancelled: ord.ordersCancelled,
      ordersValid: ord.ordersValid,
      ordersSuccess: paid.ordersSuccess,
      aov: paid.ordersSuccess > 0 ? paid.revenue / paid.ordersSuccess : 0,
      uniqueCustomers: paid.uniqueCustomers,
    },
    ordersByStatus: result?.ordersByStatus || [],
  };
};

//dashboard tháng
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

// ✅ MONTH: doanh thu theo paidAt, số đơn theo createdAt, revenueByDay theo paidAt
module.exports.getDashboardMonthService = async ({
  month,
  roles,
  userId,
  staffId,
  compare,
}) => {
  if (!month) throw new Error("month is required (YYYY-MM)");
  const { start, end } = monthToRangeVN(month);

  const isAdmin = Array.isArray(roles) && (roles.includes("ADMIN") || roles.includes("ROLE_ADMIN"));
  const isStaff = Array.isArray(roles) && (roles.includes("STAFF") || roles.includes("ROLE_STAFF"));
  const isCompare = isAdmin && compare === "1";

  let scopeStaff = null;

  if (isAdmin) {
    if (staffId) {
      if (!mongoose.Types.ObjectId.isValid(staffId)) throw new Error("staffId không hợp lệ");
      scopeStaff = new mongoose.Types.ObjectId(staffId);
    }
  } else if (isStaff) {
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("userId không hợp lệ");
    scopeStaff = new mongoose.Types.ObjectId(userId);
  } else {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  const baseMatch = {
    ...(scopeStaff ? { staff: scopeStaff } : {}),
  };

  const pipeline = [
    { $match: baseMatch },
    {
      $facet: {
        // 1) Doanh thu theo paidAt
        paidKpi: [
          { $match: { "status.isPaid": true, "status.paidAt": { $gte: start, $lt: end } } },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$totalPrice" },
              ordersSuccess: { $sum: 1 },
              customers: { $addToSet: "$user" },
            },
          },
          {
            $project: {
              _id: 0,
              revenue: 1,
              ordersSuccess: 1,
              aov: {
                $cond: [{ $gt: ["$ordersSuccess", 0] }, { $divide: ["$revenue", "$ordersSuccess"] }, 0],
              },
              uniqueCustomers: { $size: "$customers" },
            },
          },
        ],

        // 2) Số đơn theo createdAt (để có pending/cancelled)
        ordersCount: [
          { $match: { createdAt: { $gte: start, $lt: end } } },
          {
            $group: {
              _id: null,
              ordersTotal: { $sum: 1 },
              ordersCancelled: {
                $sum: { $cond: [{ $eq: ["$status.orderStatus", "Cancelled"] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              ordersTotal: 1,
              ordersCancelled: 1,
              ordersValid: { $subtract: ["$ordersTotal", "$ordersCancelled"] },
            },
          },
        ],

        // 3) revenueByDay theo paidAt
        revenueByDay: [
          { $match: { "status.isPaid": true, "status.paidAt": { $gte: start, $lt: end } } },
          {
            $group: {
              _id: {
                day: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$status.paidAt",
                    timezone: "Asia/Ho_Chi_Minh",
                  },
                },
              },
              revenue: { $sum: "$totalPrice" },
              ordersSuccess: { $sum: 1 },
            },
          },
          { $project: { _id: 0, day: "$_id.day", revenue: 1, ordersSuccess: 1 } },
          { $sort: { day: 1 } },
        ],

        // 4) ordersByStatus theo createdAt
        ordersByStatus: [
          { $match: { createdAt: { $gte: start, $lt: end } } },
          { $group: { _id: "$status.orderStatus", count: { $sum: 1 } } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
          { $sort: { count: -1 } },
        ],

        // 5) compareByStaff (so doanh thu theo paidAt)
        compareByStaff: isCompare
          ? [
              { $match: { "status.isPaid": true, "status.paidAt": { $gte: start, $lt: end }, staff: { $ne: null } } },
              {
                $group: {
                  _id: "$staff",
                  revenue: { $sum: "$totalPrice" },
                  ordersSuccess: { $sum: 1 },
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "_id",
                  foreignField: "_id",
                  as: "staff",
                },
              },
              { $unwind: { path: "$staff", preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: "$_id",
                  staffId: "$_id",
                  staffName: "$staff.fullName",
                  staffPhone: "$staff.phone",
                  revenue: 1,
                  ordersSuccess: 1,
                },
              },
              { $sort: { revenue: -1 } },
            ]
          : [],
      },
    },
  ];

  const [result] = await Order.aggregate(pipeline).option({ allowDiskUse: true });

  const paid = result?.paidKpi?.[0] || { revenue: 0, ordersSuccess: 0, aov: 0, uniqueCustomers: 0 };
  const oc = result?.ordersCount?.[0] || { ordersTotal: 0, ordersCancelled: 0, ordersValid: 0 };

  return {
    range: { start, end },
    kpi: {
      revenue: paid.revenue,
      ordersTotal: oc.ordersTotal,
      ordersCancelled: oc.ordersCancelled,
      ordersValid: oc.ordersValid,
      ordersSuccess: paid.ordersSuccess,
      aov: paid.aov,
      uniqueCustomers: paid.uniqueCustomers,
    },
    revenueByDay: result?.revenueByDay || [],
    ordersByStatus: result?.ordersByStatus || [],
    compareByStaff: result?.compareByStaff || [],
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

// ✅ YEAR: revenueByMonth theo paidAt + fill đủ 12 tháng, còn số đơn theo createdAt
module.exports.getDashboardYearService = async ({
  year, // "2026"
  roles,
  userId,
  staffId,
}) => {
  const { start, end, year: yStr } = yearToRangeVN(year);

  const isAdmin = Array.isArray(roles) && (roles.includes("ADMIN") || roles.includes("ROLE_ADMIN"));
  const isStaff = Array.isArray(roles) && (roles.includes("STAFF") || roles.includes("ROLE_STAFF"));

  let scopeStaff = null;

  if (isAdmin) {
    if (staffId) {
      if (!mongoose.Types.ObjectId.isValid(staffId)) throw new Error("staffId không hợp lệ");
      scopeStaff = new mongoose.Types.ObjectId(staffId);
    }
  } else if (isStaff) {
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("userId không hợp lệ");
    scopeStaff = new mongoose.Types.ObjectId(userId);
  } else {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  const baseMatch = {
    ...(scopeStaff ? { staff: scopeStaff } : {}),
  };

  const pipeline = [
    { $match: baseMatch },
    {
      $facet: {
        // 1) KPI doanh thu theo paidAt trong năm
        paidKpi: [
          { $match: { "status.isPaid": true, "status.paidAt": { $gte: start, $lt: end } } },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$totalPrice" },
              ordersSuccess: { $sum: 1 },
              customers: { $addToSet: "$user" },
            },
          },
          {
            $project: {
              _id: 0,
              revenue: 1,
              ordersSuccess: 1,
              uniqueCustomers: { $size: "$customers" },
            },
          },
        ],

        // 2) Revenue by month theo paidAt
        revenueByMonthRaw: [
          { $match: { "status.isPaid": true, "status.paidAt": { $gte: start, $lt: end } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$status.paidAt",
                  timezone: "Asia/Ho_Chi_Minh",
                },
              },
              revenue: { $sum: "$totalPrice" },
              ordersSuccess: { $sum: 1 },
            },
          },
          { $project: { _id: 0, month: "$_id", revenue: 1, ordersSuccess: 1 } },
          { $sort: { month: 1 } },
        ],

        // 3) Số đơn trong năm theo createdAt
        ordersCount: [
          { $match: { createdAt: { $gte: start, $lt: end } } },
          {
            $group: {
              _id: null,
              ordersTotal: { $sum: 1 },
              ordersCancelled: {
                $sum: { $cond: [{ $eq: ["$status.orderStatus", "Cancelled"] }, 1, 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              ordersTotal: 1,
              ordersCancelled: 1,
              ordersValid: { $subtract: ["$ordersTotal", "$ordersCancelled"] },
            },
          },
        ],

        // 4) Trạng thái theo createdAt (optional nhưng hay dùng)
        ordersByStatus: [
          { $match: { createdAt: { $gte: start, $lt: end } } },
          { $group: { _id: "$status.orderStatus", count: { $sum: 1 } } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
          { $sort: { count: -1 } },
        ],
      },
    },
  ];

  const [result] = await Order.aggregate(pipeline).option({ allowDiskUse: true });

  const paid = result?.paidKpi?.[0] || { revenue: 0, ordersSuccess: 0, uniqueCustomers: 0 };
  const oc = result?.ordersCount?.[0] || { ordersTotal: 0, ordersCancelled: 0, ordersValid: 0 };

  // ✅ fill đủ 12 tháng
  const rows = result?.revenueByMonthRaw || [];
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
    range: { start, end },

    // giữ field cũ cho FE chart
    totalRevenue,
    revenueByMonth,

    // thêm KPI đầy đủ (nếu FE cần)
    kpi: {
      revenue: paid.revenue,
      ordersTotal: oc.ordersTotal,
      ordersCancelled: oc.ordersCancelled,
      ordersValid: oc.ordersValid,
      ordersSuccess: paid.ordersSuccess,
      aov: paid.ordersSuccess > 0 ? paid.revenue / paid.ordersSuccess : 0,
      uniqueCustomers: paid.uniqueCustomers,
    },

    ordersByStatus: result?.ordersByStatus || [],
  };
};

// ====================== STAFF ======================
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
        confirmedBy: staffId,
        "status.orderStatus": "Confirmed",
        "status.confirmedAt": now,
      },
      $push: { timeline: { type: "CLAIM", by: staffId, at: now } },
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

// ====================== SHIPPER ======================
// shiper nhận đơn
module.exports.getShipperInboxService = async (query = {}) => {
  return Order.find({
    "status.orderStatus": "Confirmed",
    shipper: null, //  chưa ai nhận giao
    staff: { $ne: null },
    "status.confirmedAt": { $ne: null },
  })
    .populate("user", "fullName phone")
    .populate("staff", "fullName phone")
    .sort({ createdAt: -1 })
    .limit(50);
};

module.exports.shipperClaimOrderService = async (orderId, shipperId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error("orderId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(shipperId)) {
    const err = new Error("shipperId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();

  const updated = await Order.findOneAndUpdate(
    {
      _id: orderId,
      "status.orderStatus": "Confirmed",
      shipper: null,
      staff: { $ne: null },
      "status.confirmedAt": { $ne: null },
    },
    {
      $set: {
        shipper: shipperId,
        shippedBy: shipperId,
        "status.orderStatus": "Shipped",
        "status.shippedAt": now,
      },
      $push: { timeline: { type: "SHIP", by: shipperId, at: now } },
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
    const err = new Error("Đơn không Confirmed hoặc đã có shipper nhận");
    err.statusCode = 409;
    throw err;
  }

  return updated;
};

//đơn hàng của shipper
module.exports.getMyShipperOrdersService = async (shipperId, query = {}) => {
  if (!mongoose.Types.ObjectId.isValid(shipperId)) {
    const err = new Error("shipperId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.max(1, Math.min(50, Number(query.limit || 10)));
  const q = String(query.q || "").trim();
  const status = String(query.status || "").trim(); // Shipped/Delivered/Cancelled...

  const filter = { shipper: shipperId };

  // mặc định: đơn đã nhận (đang giao + đã giao)
  if (status) filter["status.orderStatus"] = status;
  else filter["status.orderStatus"] = { $in: ["Shipped", "Delivered"] };

  if (q) {
    if (mongoose.Types.ObjectId.isValid(q)) {
      filter._id = q;
    } else {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { "shippingAddress.fullName": rx },
        { "shippingAddress.phone": rx },
      ];
    }
  }

  const totalItems = await Order.countDocuments(filter);

  const items = await Order.find(filter)
    .populate("user", "fullName phone")
    .populate("staff", "fullName phone")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    items,
    pagination: { page, limit, totalItems, totalPages },
  };
};


// ✅ shipper giao xong => Delivered
module.exports.shipperMarkDeliveredService = async (orderId, shipperId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error("orderId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(shipperId)) {
    const err = new Error("shipperId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();

    // ✅ lock đúng điều kiện: shipper đúng + đang Shipped + chưa Delivered
    const order = await Order.findOne({
      _id: orderId,
      shipper: shipperId,
      "status.orderStatus": "Shipped",
      "status.isDelivered": { $ne: true },
    }).session(session);

    if (!order) {
      const exists = await Order.exists({ _id: orderId });
      const err = new Error(
        exists
          ? "Đơn không ở trạng thái Shipped hoặc không thuộc shipper này"
          : "Không tìm thấy đơn hàng"
      );
      err.statusCode = exists ? 409 : 404;
      throw err;
    }

    // an toàn: nếu thiếu shippedAt thì set
    order.status ??= {};
    order.status.shippedAt ??= now;

    // ✅ gom qty theo product
    const qtyByProduct = new Map();
    for (const item of order.orderItems || []) {
      const pid = String(item.product);
      const q = Number(item.quantity || 0);
      if (!pid || q <= 0) continue;
      qtyByProduct.set(pid, (qtyByProduct.get(pid) || 0) + q);
    }

    // ✅ trừ kho + tăng sold (transaction)
    const ops = Array.from(qtyByProduct.entries()).map(([pid, qty]) => ({
      updateOne: {
        filter: { _id: pid },
        update: { $inc: { sold: qty, stock: -qty } },
      },
    }));

    if (ops.length) {
      await Product.bulkWrite(ops, { session });
    }

    // ✅ update delivered
    order.status.orderStatus = "Delivered";
    order.status.isDelivered = true;
    order.status.deliveredAt = now;

    // ✅ track ai delivered
    order.deliveredBy = shipperId;

    // ✅ timeline
    order.timeline ??= [];
    order.timeline.push({ type: "DELIVER", by: shipperId, at: now });

    // ✅ COD auto-paid + track paidBy
    if (order.paymentMethod === "COD" && !order.status.isPaid) {
      order.status.isPaid = true;
      order.status.paidAt = now;
      order.paidBy = shipperId;

      order.timeline.push({
        type: "PAY",
        by: shipperId,
        at: now,
        meta: { method: "COD", amount: order.totalPrice },
      });
    }

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }
};

// ✅ shipper hủy => Cancelled (khi cần)
module.exports.shipperCancelOrderService = async (orderId, shipperId, body = {}) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error("orderId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(shipperId)) {
    const err = new Error("shipperId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  const updated = await Order.findOneAndUpdate(
    {
      _id: orderId,
      shipper: shipperId,
      "status.orderStatus": "Shipped",
      "status.isDelivered": { $ne: true },
    },
    {
      $set: {
        "status.orderStatus": "Cancelled",
        "status.cancelledAt": now,
        cancelledBy: shipperId,
        ...(reason ? { shopNote: reason } : {}),
      },
      $push: {
        timeline: {
          type: "CANCEL",
          by: shipperId,
          at: now,
          note: reason || "Shipper cancelled order",
        },
      },
    },
    { new: true }
  );

  if (!updated) {
    const exists = await Order.exists({ _id: orderId });
    const err = new Error(
      exists
        ? "Không thể huỷ: đơn không ở trạng thái Shipped hoặc không thuộc shipper này"
        : "Không tìm thấy đơn hàng"
    );
    err.statusCode = exists ? 409 : 404;
    throw err;
  }

  return updated;
};

