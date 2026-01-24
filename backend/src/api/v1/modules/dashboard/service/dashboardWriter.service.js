// modules/dashboard/service/dashboardWriter.service.js
const mongoose = require("mongoose");

const DashboardDaily = require("../model/dashboardDaily.model");
const DashboardDailyCustomer = require("../model/dashboardDailyCustomer.model");
const DashboardAppliedEvent = require("../model/dashboardAppliedEvent.model");

// ====================== TIMEZONE (VN) ======================
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

// yyyy-mm-dd theo giờ VN (không phụ thuộc server timezone)
function vnDateYYYYMMDD(date = new Date()) {
  const d = new Date(date.getTime() + VN_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ====================== STATUS ======================
const STATUS_LIST = Object.freeze([
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
]);

function normalizeStatus(st) {
  if (!st) return "Pending";
  const s = String(st);
  return STATUS_LIST.includes(s) ? s : "Pending";
}

// ====================== EVENT DEDUP ======================
function evKey(orderId, type, at) {
  return `${String(orderId)}:${String(type)}:${new Date(at).toISOString()}`;
}

async function markApplied({ key, orderId, type, at, session }) {
  try {
    await DashboardAppliedEvent.create([{ key, orderId, type, at }], { session });
    return true;
  } catch (e) {
    // duplicate => đã apply rồi
    if (e?.code === 11000) return false;
    throw e;
  }
}

// ====================== CORE WRITERS ======================
/**
 * IMPORTANT:
 * - KHÔNG được $setOnInsert các field số liệu (ordersTotal, ordersByStatus...)
 *   nếu trong cùng câu update còn $inc vào chính các field đó => sẽ bị Mongo conflict.
 * - Chỉ $setOnInsert các field "khóa": date, staffId (và để schema default tự fill).
 */
async function upsertDaily({ date, staffId, inc = {}, session }) {
  const sid = staffId ? new mongoose.Types.ObjectId(staffId) : null;

  // lọc $inc
  const $inc = {};
  for (const [k, v] of Object.entries(inc || {})) {
    if (v === 0 || v === null || v === undefined) continue;
    $inc[k] = v;
  }
  if (!Object.keys($inc).length) return;

  await DashboardDaily.updateOne(
    { date, staffId: sid },
    {
      $setOnInsert: { date, staffId: sid },
      $inc,
    },
    {
      upsert: true,
      session,
      // nếu schema có default, bật để insert tự ăn default
      setDefaultsOnInsert: true,
    }
  );
}

async function touchUniqueCustomer({ date, staffId, customerId, session }) {
  const sid = staffId ? new mongoose.Types.ObjectId(staffId) : null;
  const cid = new mongoose.Types.ObjectId(customerId);

  const r = await DashboardDailyCustomer.updateOne(
    { date, staffId: sid, customerId: cid },
    { $setOnInsert: { date, staffId: sid, customerId: cid } },
    { upsert: true, session }
  );

  return (r?.upsertedCount || 0) > 0;
}

async function applyStatusMove({ createdDay, staffId, from, to, session }) {
  const f = normalizeStatus(from);
  const t = normalizeStatus(to);
  if (!f || !t || f === t) return;

  const inc = {
    [`ordersByStatus.${f}`]: -1,
    [`ordersByStatus.${t}`]: 1,
  };

  // “ordersCancelled” hiểu là số đơn bị cancel (đếm theo event)
  if (t === "Cancelled") inc.ordersCancelled = 1;

  await upsertDaily({ date: createdDay, staffId, inc, session });
}

// ====================== PUBLIC API ======================
/**
 * CREATE ORDER:
 * - Global (staffId null): ordersTotal +1, ordersByStatus.<status> +1
 * - Nếu order tạo ra đã có staff (hiếm): staff cũng +1 tương tự
 */
module.exports.applyCreate = async ({ order, at = new Date(), session }) => {
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date(at);
  const createdDay = vnDateYYYYMMDD(createdAt);
  const key = evKey(order._id, "CREATE", at);

  const ok = await markApplied({
    key,
    orderId: order._id,
    type: "CREATE",
    at,
    session,
  });
  if (!ok) return;

  const st = normalizeStatus(order?.status?.orderStatus);

  // GLOBAL
  await upsertDaily({
    date: createdDay,
    staffId: null,
    inc: { ordersTotal: 1, [`ordersByStatus.${st}`]: 1 },
    session,
  });

  // STAFF (nếu có sẵn)
  if (order.staff) {
    await upsertDaily({
      date: createdDay,
      staffId: order.staff,
      inc: { ordersTotal: 1, [`ordersByStatus.${st}`]: 1 },
      session,
    });
  }
};

/**
 * ASSIGN/CLAIM ORDER (gán staff):
 * - KHÔNG hardcode Pending->Confirmed ở đây nữa (tránh double-count).
 * - Chỉ ghi nhận “đơn thuộc staff” lần đầu:
 *   staff daily: ordersTotal +1, ordersByStatus.<currentStatus> +1
 *
 * Nếu bạn muốn claim đồng thời đổi status, hãy gọi thêm applyStatusChange ở chỗ update status.
 */
module.exports.applyClaim = async ({ order, at = new Date(), session }) => {
  const createdDay = vnDateYYYYMMDD(new Date(order.createdAt || at));
  const staffId = order.staff;
  if (!staffId) return;

  const key = evKey(order._id, "CLAIM", at);
  const ok = await markApplied({ key, orderId: order._id, type: "CLAIM", at, session });
  if (!ok) return;

  const st = normalizeStatus(order?.status?.orderStatus);

  // chỉ cộng cho STAFF (global đã cộng ở CREATE)
  await upsertDaily({
    date: createdDay,
    staffId,
    inc: { ordersTotal: 1, [`ordersByStatus.${st}`]: 1 },
    session,
  });
};

/**
 * STATUS CHANGE:
 * - Dùng cho mọi chuyển trạng thái (Pending->Confirmed, Confirmed->Shipped, ...)
 * - Ghi theo createdDay (cohort theo ngày tạo đơn)
 * - Apply cả GLOBAL và STAFF (nếu có staff)
 */
module.exports.applyStatusChange = async ({
  order,
  type = "STATUS",
  at = new Date(),
  fromStatus,
  toStatus,
  session,
}) => {
  const createdDay = vnDateYYYYMMDD(new Date(order.createdAt || at));
  const staffId = order.staff || null;

  const key = evKey(order._id, type, at);
  const ok = await markApplied({ key, orderId: order._id, type, at, session });
  if (!ok) return;

  // GLOBAL
  await applyStatusMove({
    createdDay,
    staffId: null,
    from: fromStatus,
    to: toStatus,
    session,
  });

  // STAFF
  if (staffId) {
    await applyStatusMove({
      createdDay,
      staffId,
      from: fromStatus,
      to: toStatus,
      session,
    });
  }
};

/**
 * PAY (ghi nhận doanh thu):
 * - Ghi theo paidDay (ngày thanh toán)
 * - GLOBAL: revenue +amount, ordersSuccess +1, uniqueCustomers +1 (nếu lần đầu trong ngày)
 * - STAFF (nếu có staff): tương tự
 *
 * NOTE: aov thường tính ở read-service: aov = revenue / ordersSuccess
 */
module.exports.applyPay = async ({ order, at = new Date(), session }) => {
  const paidAt = order?.status?.paidAt ? new Date(order.status.paidAt) : new Date(at);
  const paidDay = vnDateYYYYMMDD(paidAt);
  const staffId = order.staff || null;

  const key = evKey(order._id, "PAY", paidAt);
  const ok = await markApplied({
    key,
    orderId: order._id,
    type: "PAY",
    at: paidAt,
    session,
  });
  if (!ok) return;

  const amount = Number(order.totalPrice || 0);
  const customerId = order.user;

  // GLOBAL
  await upsertDaily({
    date: paidDay,
    staffId: null,
    inc: { revenue: amount, ordersSuccess: 1 },
    session,
  });

  const isNewGlobalCustomer = await touchUniqueCustomer({
    date: paidDay,
    staffId: null,
    customerId,
    session,
  });

  if (isNewGlobalCustomer) {
    await upsertDaily({
      date: paidDay,
      staffId: null,
      inc: { uniqueCustomers: 1 },
      session,
    });
  }

  // STAFF
  if (staffId) {
    await upsertDaily({
      date: paidDay,
      staffId,
      inc: { revenue: amount, ordersSuccess: 1 },
      session,
    });

    const isNewStaffCustomer = await touchUniqueCustomer({
      date: paidDay,
      staffId,
      customerId,
      session,
    });

    if (isNewStaffCustomer) {
      await upsertDaily({
        date: paidDay,
        staffId,
        inc: { uniqueCustomers: 1 },
        session,
      });
    }
  }
};
