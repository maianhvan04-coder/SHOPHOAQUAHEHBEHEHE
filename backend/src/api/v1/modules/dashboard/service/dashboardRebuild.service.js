// modules/dashboard/service/dashboardRebuild.service.js

const mongoose = require("mongoose");
const Order = require("../../order/order.model");

const DashboardDaily = require("../model/dashboardDaily.model");
const DashboardDailyCustomer = require("../model/dashboardDailyCustomer.model");
const DashboardAppliedEvent = require("../model/dashboardAppliedEvent.model");

const dashboardWriter = require("./dashboardWriter.service");

function sortTimeline(tl = []) {
  return [...tl].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

module.exports.rebuildDashboardFromOrders = async () => {
  // XÓA CACHE CŨ
  await DashboardAppliedEvent.deleteMany({});
  await DashboardDailyCustomer.deleteMany({});
  await DashboardDaily.deleteMany({});

  // Replay lại theo thời gian tạo đơn
  const cursor = Order.find({}).sort({ createdAt: 1 }).cursor();

  for await (const order of cursor) {
    const tl = sortTimeline(order.timeline || []);
    const createAt = tl.find((e) => e.type === "CREATE")?.at || order.createdAt;

    // replay per-order trong transaction để writer dùng session
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await dashboardWriter.applyCreate({ order, at: createAt, session });

      let currentStatus = "Pending";

      for (const ev of tl) {
        if (ev.type === "CLAIM") {
          await dashboardWriter.applyClaim({ order, at: ev.at, session });
          currentStatus = "Confirmed";
          continue;
        }

        if (ev.type === "CONFIRM" && currentStatus !== "Confirmed") {
          await dashboardWriter.applyStatusChange({
            order,
            type: "CONFIRM",
            at: ev.at,
            fromStatus: currentStatus,
            toStatus: "Confirmed",
            session,
          });
          currentStatus = "Confirmed";
          continue;
        }

        if (ev.type === "SHIP" && currentStatus !== "Shipped") {
          await dashboardWriter.applyStatusChange({
            order,
            type: "SHIP",
            at: ev.at,
            fromStatus: currentStatus,
            toStatus: "Shipped",
            session,
          });
          currentStatus = "Shipped";
          continue;
        }

        if (ev.type === "DELIVER" && currentStatus !== "Delivered") {
          await dashboardWriter.applyStatusChange({
            order,
            type: "DELIVER",
            at: ev.at,
            fromStatus: currentStatus,
            toStatus: "Delivered",
            session,
          });
          currentStatus = "Delivered";
          continue;
        }

        if (ev.type === "CANCEL" && currentStatus !== "Cancelled") {
          await dashboardWriter.applyStatusChange({
            order,
            type: "CANCEL",
            at: ev.at,
            fromStatus: currentStatus,
            toStatus: "Cancelled",
            session,
          });
          currentStatus = "Cancelled";
          continue;
        }

        if (ev.type === "PAY") {
          // applyPay dùng order.status.paidAt nếu có; nhưng mình truyền ev.at cho chắc
          await dashboardWriter.applyPay({ order, at: ev.at, session });
        }
      }

      // Nếu đơn isPaid nhưng thiếu PAY event -> applyPay 1 lần
      if (order.status?.isPaid) {
        const hasPayEvent = tl.some((e) => e.type === "PAY");
        if (!hasPayEvent) {
          await dashboardWriter.applyPay({ order, at: order.status.paidAt || order.updatedAt, session });
        }
      }

      await session.commitTransaction();
      session.endSession();
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  }

  return { ok: true };
};
