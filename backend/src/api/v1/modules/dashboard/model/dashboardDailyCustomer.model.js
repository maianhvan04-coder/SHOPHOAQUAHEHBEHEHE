// dashboard/model/dashboardDailyCustomer.model.js

const mongoose = require("mongoose");

// dashboard_daily_customers: dùng để tính uniqueCustomers chuẩn
const dashboardDailyCustomerSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // YYYY-MM-DD (VN)

    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = toàn shop
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "dashboard_daily_customers",
  }
);

// 1 khách chỉ tính 1 lần / ngày / scope
dashboardDailyCustomerSchema.index(
  { date: 1, staffId: 1, customerId: 1 },
  { unique: true }
);

module.exports = mongoose.model("DashboardDailyCustomer", dashboardDailyCustomerSchema);
