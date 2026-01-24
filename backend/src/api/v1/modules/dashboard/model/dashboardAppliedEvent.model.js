// dashboard/model/dashboardAppliedEvent.model.js
const mongoose = require("mongoose");

// dashboard_applied_events: chống cộng trùng khi update KPI
const dashboardAppliedEventSchema = new mongoose.Schema(
  {
    // key ổn định: <orderId>:<type>:<isoTime>
    key: { type: String, required: true, unique: true, index: true },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      // ✅ thêm CONFIRM để không lỗi khi update status Confirmed
      enum: ["CREATE", "CLAIM", "CONFIRM", "SHIP", "DELIVER", "CANCEL", "PAY"],
      index: true,
    },

    at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "dashboard_applied_events",
  }
);

module.exports = mongoose.model("DashboardAppliedEvent", dashboardAppliedEventSchema);
