// modules/order/order.service.js
const mongoose = require("mongoose");
const Order = require("./order.model");
const Product = require("../product/models/product.model");

const dashboardReadService = require("../dashboard/service/dashboardRead.service");
const dashboardWriter = require("../dashboard/service/dashboardWriter.service");

// ====================== helpers ======================
function escapeRegex(str = "") {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isTransientTxError(err) {
  // mongodb driver thường có errorLabels hoặc hasErrorLabel
  return (
    err?.errorLabels?.includes("TransientTransactionError") ||
    err?.errorLabels?.includes("UnknownTransactionCommitResult") ||
    err?.hasErrorLabel?.("TransientTransactionError") ||
    err?.hasErrorLabel?.("UnknownTransactionCommitResult")
  );
}

async function runInTransaction(work, { maxRetry = 3 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= maxRetry; attempt++) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await work(session);
      await session.commitTransaction();
      session.endSession();
      return result;
    } catch (err) {
      lastErr = err;
      try {
        await session.abortTransaction();
      } catch (_) { }
      session.endSession();

      if (isTransientTxError(err) && attempt < maxRetry) continue;
      throw err;
    }
  }
  throw lastErr;
}

function ensureObjectId(id, name = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`${name} không hợp lệ`);
    err.statusCode = 400;
    throw err;
  }
  return new mongoose.Types.ObjectId(id);
}

function mapOrderStatusToEventType(orderStatus) {
  const typeMap = {
    Confirmed: "CONFIRM",
    Shipped: "SHIP",
    Delivered: "DELIVER",
    Cancelled: "CANCEL",
  };
  return typeMap[orderStatus] || "NOTE";
}

async function ensureStockEnough({ qtyByProduct, session }) {
  const ids = Array.from(qtyByProduct.keys()).map((id) => ensureObjectId(id, "productId"));
  const products = await Product.find({ _id: { $in: ids } })
    .select("name stock")
    .session(session)
    .lean();

  const byId = new Map(products.map((p) => [String(p._id), p]));
  for (const [pid, qty] of qtyByProduct.entries()) {
    const p = byId.get(String(pid));
    if (!p) {
      const err = new Error(`Sản phẩm ${pid} không tồn tại.`);
      err.statusCode = 404;
      throw err;
    }
    const stock = Number(p.stock || 0);
    if (stock < qty) {
      const err = new Error(`Không đủ tồn kho: ${p.name} (còn ${stock}, cần ${qty})`);
      err.statusCode = 409;
      throw err;
    }
  }
}

function buildQtyByProduct(order) {
  const qtyByProduct = new Map();
  for (const item of order.orderItems || []) {
    const pid = String(item.product);
    const q = Number(item.quantity || 0);
    if (!pid || q <= 0) continue;
    qtyByProduct.set(pid, (qtyByProduct.get(pid) || 0) + q);
  }
  return qtyByProduct;
}

// ====================== CUSTOMER ======================
module.exports.createOrderService = async (userId, data) => {
  const { orderItems, shippingAddress, paymentMethod, shippingPrice = 0, customerNote } = data;

  if (paymentMethod && paymentMethod !== "COD") {
    const err = new Error("Hiện shop chỉ hỗ trợ COD (thanh toán khi nhận hàng).");
    err.statusCode = 400;
    throw err;
  }

  if (!orderItems || orderItems.length === 0) {
    const err = new Error("Đơn hàng phải có ít nhất một sản phẩm.");
    err.statusCode = 400;
    throw err;
  }

  return runInTransaction(async (session) => {
    let itemsPrice = 0;
    const processedItems = [];

    for (const item of orderItems) {
      const qty = Number(item.quantity || 0);
      if (qty < 1) {
        const err = new Error("Số lượng sản phẩm phải >= 1.");
        err.statusCode = 400;
        throw err;
      }

      const product = await Product.findById(item.product).session(session);
      if (!product) {
        const err = new Error(`Sản phẩm ID ${item.product} không tồn tại.`);
        err.statusCode = 404;
        throw err;
      }

      const currentPrice = Number(product.price || 0);
      itemsPrice += currentPrice * qty;

      processedItems.push({
        product: product._id,
        name: product.name,
        image: product.image?.url || "",
        quantity: qty,
        price: currentPrice,
      });
    }

    const totalPrice = itemsPrice + Number(shippingPrice || 0);
    const now = new Date();

    const [newOrder] = await Order.create(
      [
        {
          user: userId,
          orderItems: processedItems,
          shippingAddress: {
            fullName: shippingAddress.fullName,
            phone: shippingAddress.phone,
            province: shippingAddress.province,
            ward: shippingAddress.ward,
            addressDetails: shippingAddress.addressDetails,
          },
          paymentMethod: "COD",
          itemsPrice,
          shippingPrice,
          totalPrice,
          customerNote,
          status: { orderStatus: "Pending", isPaid: false, isDelivered: false },
          timeline: [{ type: "CREATE", by: userId, at: now }],
        },
      ],
      { session }
    );

    // dashboard cache
    await dashboardWriter.applyCreate({ order: newOrder, at: now, session });

    return newOrder;
  });
};

module.exports.getMyOrdersService = async (userId, status) => {
  if (!userId) {
    const err = new Error("UserId là bắt buộc.");
    err.statusCode = 400;
    throw err;
  }

  const query = { user: userId };
  if (status) query["status.orderStatus"] = status;

  return Order.find(query)
    .populate("staff", "fullName phone")
    .sort({ createdAt: -1 });
};

module.exports.getOrderDetailService = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId
  })
    .populate("staff", "fullName phone");
  if (!order) {
    const err = new Error("Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này.");
    err.statusCode = 404;
    throw err;
  }
  return order;
};

module.exports.cancelOrderService = async (userId, orderId, body = {}) => {
  ensureObjectId(orderId, "orderId");
  ensureObjectId(userId, "userId");

  return runInTransaction(async (session) => {
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
      { new: true, session }
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

    await dashboardWriter.applyStatusChange({
      order: cancelled,
      type: "CANCEL",
      at: now,
      fromStatus: "Pending",
      toStatus: "Cancelled",
      session,
    });

    return cancelled;
  });
};

// ====================== ADMIN ======================
module.exports.updateOrderStatusAdmin = async (orderId, statusData = {}) => {
  const { orderStatus, shopNote, actorId } = statusData;

  const by =
    actorId && mongoose.Types.ObjectId.isValid(actorId)
      ? new mongoose.Types.ObjectId(actorId)
      : null;

  // chỉ update note (không đổi status)
  if (!orderStatus) {
    const now = new Date();
    const updated = await Order.findById(orderId);
    if (!updated) {
      const err = new Error("Không tìm thấy đơn hàng.");
      err.statusCode = 404;
      throw err;
    }

    if (typeof shopNote === "string") {
      updated.shopNote = shopNote;
      updated.timeline ??= [];
      updated.timeline.push({ type: "NOTE", by, at: now, note: shopNote });
    }
    return updated.save();
  }

  const allowedNext = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
    Delivered: [],
    Cancelled: [],
  };

  return runInTransaction(async (session) => {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      const err = new Error("Không tìm thấy đơn hàng.");
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();
    const fromStatus = order.status?.orderStatus ?? "Pending";
    const wasPaid = !!order.status?.isPaid;

    if (fromStatus === "Delivered") {
      const err = new Error("Đơn hàng đã hoàn thành, không thể cập nhật thêm.");
      err.statusCode = 409;
      throw err;
    }
    if (fromStatus === "Cancelled") {
      const err = new Error("Đơn hàng đã bị hủy, không thể cập nhật.");
      err.statusCode = 409;
      throw err;
    }
    if (!allowedNext[fromStatus]?.includes(orderStatus)) {
      const err = new Error(`Không thể chuyển từ ${fromStatus} sang ${orderStatus}.`);
      err.statusCode = 409;
      throw err;
    }

    if (typeof shopNote === "string") order.shopNote = shopNote;

    // rule: ship/deliver cần staff + confirmedAt
    if (orderStatus === "Shipped" || orderStatus === "Delivered") {
      if (!order.staff) {
        const err = new Error("Đơn chưa có staff (chưa claim), không thể giao.");
        err.statusCode = 409;
        throw err;
      }
      if (!order.status?.confirmedAt) {
        const err = new Error("Đơn chưa Confirmed, không thể giao.");
        err.statusCode = 409;
        throw err;
      }
    }

    order.status ??= {};
    order.timeline ??= [];

    order.status.orderStatus = orderStatus;

    if (orderStatus === "Confirmed") {
      order.status.confirmedAt ??= now;
      order.confirmedBy ??= by ?? order.staff ?? null;
      order.timeline.push({ type: "CONFIRM", by: by ?? order.staff ?? null, at: now });
    }

    if (orderStatus === "Shipped") {
      if (!order.shipper) {
        const err = new Error("Chưa có shipper nhận đơn, không thể chuyển Shipped.");
        err.statusCode = 409;
        throw err;
      }
      order.status.shippedAt ??= now;
      order.shippedBy ??= by ?? order.shipper ?? null;
      order.timeline.push({ type: "SHIP", by: by ?? order.shipper ?? null, at: now });
    }

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

    if (orderStatus === "Delivered") {
      if (order.status.isDelivered) {
        const err = new Error("Đơn hàng đã được đánh dấu Delivered trước đó.");
        err.statusCode = 409;
        throw err;
      }

      order.status.shippedAt ??= now;

      // ✅ CHỐNG ÂM KHO
      const qtyByProduct = buildQtyByProduct(order);
      await ensureStockEnough({ qtyByProduct, session });

      const ops = Array.from(qtyByProduct.entries()).map(([pid, qty]) => ({
        updateOne: {
          filter: { _id: pid },
          update: { $inc: { sold: qty, stock: -qty } },
        },
      }));
      if (ops.length) await Product.bulkWrite(ops, { session });

      order.status.isDelivered = true;
      order.status.deliveredAt = now;
      order.deliveredBy ??= by ?? order.shipper ?? null;

      order.timeline.push({ type: "DELIVER", by: by ?? order.shipper ?? null, at: now });

      // COD auto pay
      if (order.paymentMethod === "COD" && !order.status.isPaid) {
        order.status.isPaid = true;
        order.status.paidAt = now;
        order.paidBy ??= order.shipper ?? by ?? null;
        order.timeline.push({
          type: "PAY",
          by: order.paidBy ?? null,
          at: now,
          meta: { method: "COD", amount: order.totalPrice },
        });
      }
    }

    const saved = await order.save({ session });

    // dashboard cache: status move
    await dashboardWriter.applyStatusChange({
      order: saved,
      type: mapOrderStatusToEventType(orderStatus),
      at: now,
      fromStatus,
      toStatus: orderStatus,
      session,
    });

    // dashboard cache: pay (nếu mới phát sinh pay)
    if (
      orderStatus === "Delivered" &&
      saved.paymentMethod === "COD" &&
      !wasPaid &&
      saved.status?.isPaid
    ) {
      await dashboardWriter.applyPay({
        order: saved,
        at: saved.status.paidAt || now,
        session,
      });
    }

    return saved;
  });
};

module.exports.getAllOrdersAdmin = async (query) => {
  const { status, limit = 10, page = 1, orderId } = query;

  const filter = {};
  if (status) filter["status.orderStatus"] = status;

  // ✅ search orderId: nếu full ObjectId => match thẳng
  if (orderId && String(orderId).trim()) {
    const q = String(orderId).trim();
    if (mongoose.Types.ObjectId.isValid(q)) {
      filter._id = q;
    } else {
      // match theo chuỗi _id (không cần quét toàn bộ)
      filter.$expr = {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: escapeRegex(q),
          options: "i",
        },
      };
    }
  }

  const pageNum = Math.max(1, Number(page || 1));
  const limitNum = Math.max(1, Math.min(50, Number(limit || 10)));

  const totalItems = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("user", "fullName phone")
    .populate("staff", "fullName phone")
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum);

  return { orders, totalItems };
};

// ====================== STAFF ======================
module.exports.getMyStaffOrdersService = async (staffId, query) => {
  if (!staffId) {
    const err = new Error("staffId là bắt buộc.");
    err.statusCode = 400;
    throw err;
  }

  const filter = { staff: staffId };
  if (query?.status) filter["status.orderStatus"] = query.status;

  if (query?.month) {
    const [y, m] = query.month.split("-").map(Number);
    const offsetMs = 7 * 60 * 60 * 1000;
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0) - offsetMs);
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0) - offsetMs);
    filter.createdAt = { $gte: start, $lt: end };
  }

  return Order.find(filter).sort({ createdAt: -1 });
};

module.exports.getUnassignedOrdersService = async (query = {}) => {
  const status = String(query.status || "Pending").trim();

  return Order.find({
    "status.orderStatus": status,
    $or: [{ staff: null }, { staff: { $exists: false } }],
  })
    .sort({ createdAt: -1 })
    .limit(50);
};

module.exports.claimOrderService = async (orderId, staffId) => {
  ensureObjectId(orderId, "orderId");
  ensureObjectId(staffId, "staffId");

  return runInTransaction(async (session) => {
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
      const err = new Error(exists ? "Đơn không Pending hoặc đã được staff khác nhận" : "Không tìm thấy đơn hàng");
      err.statusCode = exists ? 409 : 404;
      throw err;
    }

    await dashboardWriter.applyClaim({ order: updated, at: now, session });

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

  // ====================== DASHBOARD READ (re-export) ======================
  module.exports.getDashboardDayService = dashboardReadService.getDashboardDayService;
  module.exports.getDashboardMonthService = dashboardReadService.getDashboardMonthService;
  module.exports.getDashboardYearService = dashboardReadService.getDashboardYearService;
