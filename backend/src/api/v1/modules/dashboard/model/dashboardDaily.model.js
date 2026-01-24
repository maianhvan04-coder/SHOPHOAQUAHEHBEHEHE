// dashboard/model/dashboardDaily.model.js

const mongoose = require("mongoose");

const ordersByStatusSchema = new mongoose.Schema(
  {
    Pending: { type: Number, default: 0 },
    Confirmed: { type: Number, default: 0 },
    Shipped: { type: Number, default: 0 },
    Delivered: { type: Number, default: 0 },
    Cancelled: { type: Number, default: 0 },
  },
  { _id: false }
);

// dashboard_daily: 1 doc / ngày / scope (staffId hoặc null)
const dashboardDailySchema = new mongoose.Schema(
  {
    // YYYY-MM-DD theo Asia/Ho_Chi_Minh
    date: { type: String, required: true, index: true },

    // null = toàn shop
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ===== KPI theo paidAt =====
    revenue: { type: Number, default: 0 },
    ordersSuccess: { type: Number, default: 0 },
    uniqueCustomers: { type: Number, default: 0 },

    // ===== KPI theo createdAt =====
    ordersTotal: { type: Number, default: 0 },
    ordersCancelled: { type: Number, default: 0 },

    ordersByStatus: {
      type: ordersByStatusSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    collection: "dashboard_daily",
  }
);

// 1 ngày chỉ có 1 doc cho 1 staffId (hoặc null cho toàn shop)
dashboardDailySchema.index({ date: 1, staffId: 1 }, { unique: true });

module.exports = mongoose.model("DashboardDaily", dashboardDailySchema);
