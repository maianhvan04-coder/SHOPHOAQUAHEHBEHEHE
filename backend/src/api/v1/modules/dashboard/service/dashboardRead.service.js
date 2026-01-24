// modules/dashboard/service/dashboardRead.service.js
const mongoose = require("mongoose");

const DashboardDaily = require("../model/dashboardDaily.model");
const DashboardDailyCustomer = require("../model/dashboardDailyCustomer.model");

// ===== helpers =====
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

function pad2(n) {
  return String(n).padStart(2, "0");
}

// YYYY-MM-DD theo giờ VN (không phụ thuộc timezone server)
function vnDateYYYYMMDD(date = new Date()) {
  const d = new Date(date.getTime() + VN_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
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

function monthToRangeVN(month) {
  const [y, m] = String(month).split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) throw new Error("month is required (YYYY-MM)");

  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0) - VN_OFFSET_MS);
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0) - VN_OFFSET_MS);
  return { start, end, y, m };
}

function yearToRangeVN(year) {
  const y = Number(year);
  if (!Number.isFinite(y) || y < 2000 || y > 2100) throw new Error("year is required (YYYY)");

  const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0) - VN_OFFSET_MS);
  const end = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0) - VN_OFFSET_MS);
  return { start, end, year: String(y), y };
}

function lastDayOfMonth(y, m) {
  // m: 1..12
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function dateRangeStrings(startStr, endStr) {
  // inclusive, both are YYYY-MM-DD
  const [sy, sm, sd] = startStr.split("-").map(Number);
  const [ey, em, ed] = endStr.split("-").map(Number);

  const out = [];
  let cur = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0));
  const end = new Date(Date.UTC(ey, em - 1, ed, 0, 0, 0));

  while (cur <= end) {
    const y = cur.getUTCFullYear();
    const m = pad2(cur.getUTCMonth() + 1);
    const d = pad2(cur.getUTCDate());
    out.push(`${y}-${m}-${d}`);
    cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
  }
  return out;
}

function normalizeRoles(roles) {
  return (roles || []).map((r) => String(r).toUpperCase());
}

function resolveScopeStaff({ roles, userId, staffId }) {
  const rs = normalizeRoles(roles);
  const isAdmin = rs.includes("ADMIN") || rs.includes("ROLE_ADMIN");
  const isStaff = rs.includes("STAFF") || rs.includes("ROLE_STAFF");

  let scopeStaff = null; // null = global (admin view)

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

  return { isAdmin, isStaff, scopeStaff };
}

function emptyDailyDoc(dateStr) {
  return {
    date: dateStr,
    staffId: null,
    revenue: 0,
    ordersSuccess: 0,
    uniqueCustomers: 0,
    ordersTotal: 0,
    ordersCancelled: 0,
    ordersByStatus: {
      Pending: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    },
  };
}

function ordersByStatusArray(ordersByStatusObj) {
  const obj = ordersByStatusObj || {};
  const rows = Object.entries(obj).map(([status, count]) => ({
    status,
    count: Number(count || 0),
  }));
  rows.sort((a, b) => b.count - a.count);
  return rows;
}

async function countDistinctCustomersInRange({ startStr, endStr, staffId }) {
  const match = {
    date: { $gte: startStr, $lte: endStr },
    staffId: staffId ?? null,
  };

  const [row] = await DashboardDailyCustomer.aggregate([
    { $match: match },
    { $group: { _id: "$customerId" } },
    { $count: "uniqueCustomers" },
  ]);

  return row?.uniqueCustomers ? Number(row.uniqueCustomers) : 0;
}

// ===== DAY =====
module.exports.getDashboardDayService = async ({ date, roles, userId, staffId }) => {
  const dateStr = date || vnYesterdayYYYYMMDD();
  const { start, end, day } = dayToRangeVN(dateStr);

  const { scopeStaff } = resolveScopeStaff({ roles, userId, staffId });

  const row =
    (await DashboardDaily.findOne({ date: day, staffId: scopeStaff ?? null }).lean()) ||
    emptyDailyDoc(day);

  const kpi = {
    revenue: Number(row.revenue || 0),
    ordersTotal: Number(row.ordersTotal || 0),
    ordersCancelled: Number(row.ordersCancelled || 0),
    ordersValid: Number(row.ordersTotal || 0) - Number(row.ordersCancelled || 0),
    ordersSuccess: Number(row.ordersSuccess || 0),
    aov: row.ordersSuccess > 0 ? Number(row.revenue || 0) / Number(row.ordersSuccess || 1) : 0,
    uniqueCustomers: Number(row.uniqueCustomers || 0),
  };

  return {
    day,
    range: { start, end },
    kpi,
    ordersByStatus: ordersByStatusArray(row.ordersByStatus),
  };
};

// ===== MONTH =====
module.exports.getDashboardMonthService = async ({
  month,
  roles,
  userId,
  staffId,
  compare,
}) => {
  if (!month) throw new Error("month is required (YYYY-MM)");

  const { start, end, y, m } = monthToRangeVN(month);
  const { isAdmin, scopeStaff } = resolveScopeStaff({ roles, userId, staffId });

  const startStr = `${y}-${pad2(m)}-01`;
  const endStr = `${y}-${pad2(m)}-${pad2(lastDayOfMonth(y, m))}`;

  // lấy tất cả daily trong tháng
  const dailies = await DashboardDaily.find({
    date: { $gte: startStr, $lte: endStr },
    staffId: scopeStaff ?? null,
  })
    .lean()
    .select("date revenue ordersSuccess ordersTotal ordersCancelled ordersByStatus");

  const mapByDate = new Map(dailies.map((d) => [d.date, d]));

  // KPI tổng tháng
  let revenue = 0;
  let ordersSuccess = 0;
  let ordersTotal = 0;
  let ordersCancelled = 0;

  const statusSum = { Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };

  for (const d of dailies) {
    revenue += Number(d.revenue || 0);
    ordersSuccess += Number(d.ordersSuccess || 0);
    ordersTotal += Number(d.ordersTotal || 0);
    ordersCancelled += Number(d.ordersCancelled || 0);

    const ob = d.ordersByStatus || {};
    for (const k of Object.keys(statusSum)) {
      statusSum[k] += Number(ob[k] || 0);
    }
  }

  // revenueByDay (fill đủ ngày)
  const days = dateRangeStrings(startStr, endStr);
  const revenueByDay = days.map((day) => {
    const hit = mapByDate.get(day);
    return {
      day,
      revenue: hit ? Number(hit.revenue || 0) : 0,
      ordersSuccess: hit ? Number(hit.ordersSuccess || 0) : 0,
    };
  });

  // uniqueCustomers THÁNG phải distinct theo range (không sum theo ngày)
  const uniqueCustomers = await countDistinctCustomersInRange({
    startStr,
    endStr,
    staffId: scopeStaff ?? null,
  });

  // compareByStaff (admin + compare=1)
  let compareByStaff = [];
  const isCompare = isAdmin && compare === "1";

  if (isCompare) {
    compareByStaff = await DashboardDaily.aggregate([
      {
        // lọc dữ liệu 
        $match: {
          date: { $gte: startStr, $lte: endStr }, // trong tháng 
          staffId: { $ne: null }, // có stafff
        },
      },
      {
        // gom nhân viên 
        $group: {
          _id: "$staffId",
          revenue: { $sum: "$revenue" }, // tổng doanh thu 
          ordersSuccess: { $sum: "$ordersSuccess" }, // Tổng đơn thành công trong tháng
        },
      },
      {
        // lấy thông tin staff
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",  
          as: "staff",
        },
      },
      { $unwind: { path: "$staff", preserveNullAndEmptyArrays: true } },
      {
        // từ lookup xuống project chuyển từ mảng qua object sau đó $project để chuẩn hóa format trả về frontend
        $project: {
          _id: 0,
          staffId: "$_id",
          staffName: "$staff.fullName",
          staffPhone: "$staff.phone",
          revenue: 1,
          ordersSuccess: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);
  }

  return {
    range: { start, end },
    kpi: {
      revenue,
      ordersTotal,
      ordersCancelled,
      ordersValid: ordersTotal - ordersCancelled,
      ordersSuccess,
      aov: ordersSuccess > 0 ? revenue / ordersSuccess : 0,
      uniqueCustomers,
    },
    revenueByDay,
    ordersByStatus: ordersByStatusArray(statusSum),
    compareByStaff,
  };
};

// ===== YEAR =====
module.exports.getDashboardYearService = async ({ year, roles, userId, staffId }) => {
  const { start, end, year: yStr, y } = yearToRangeVN(year);

  const { scopeStaff } = resolveScopeStaff({ roles, userId, staffId });

  const startStr = `${yStr}-01-01`;
  const endStr = `${yStr}-12-31`;

  // group theo month ngay trên DashboardDaily
  const revenueByMonthRaw = await DashboardDaily.aggregate([
    {
      $match: {
        date: { $gte: startStr, $lte: endStr },
        staffId: scopeStaff ?? null,
      },
    },
    {
      $group: {
        _id: { $substrBytes: ["$date", 0, 7] }, // "YYYY-MM"
        revenue: { $sum: "$revenue" },
        ordersSuccess: { $sum: "$ordersSuccess" },
      },
    },
    { $project: { _id: 0, month: "$_id", revenue: 1, ordersSuccess: 1 } },
    { $sort: { month: 1 } },
  ]);

  const mapMonth = new Map(revenueByMonthRaw.map((r) => [String(r.month), r]));

  const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
    const mm = pad2(i + 1);
    const key = `${yStr}-${mm}`;
    const hit = mapMonth.get(key);
    return {
      month: key,
      revenue: hit ? Number(hit.revenue || 0) : 0,
      ordersSuccess: hit ? Number(hit.ordersSuccess || 0) : 0,
    };
  });

  const totalRevenue = revenueByMonth.reduce((s, x) => s + Number(x.revenue || 0), 0);
  const totalOrdersSuccess = revenueByMonth.reduce((s, x) => s + Number(x.ordersSuccess || 0), 0);

  // ordersCount + ordersByStatus sum theo ngày
  const dailies = await DashboardDaily.find({
    date: { $gte: startStr, $lte: endStr },
    staffId: scopeStaff ?? null,
  })
    .lean()
    .select("ordersTotal ordersCancelled ordersByStatus");

  let ordersTotal = 0;
  let ordersCancelled = 0;
  const statusSum = { Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };

  for (const d of dailies) {
    ordersTotal += Number(d.ordersTotal || 0);
    ordersCancelled += Number(d.ordersCancelled || 0);
    const ob = d.ordersByStatus || {};
    for (const k of Object.keys(statusSum)) statusSum[k] += Number(ob[k] || 0);
  }

  const uniqueCustomers = await countDistinctCustomersInRange({
    startStr,
    endStr,
    staffId: scopeStaff ?? null,
  });

  return {
    year: yStr,
    range: { start, end },

    // giữ field cũ cho FE chart
    totalRevenue,
    revenueByMonth,

    kpi: {
      revenue: totalRevenue,
      ordersTotal,
      ordersCancelled,
      ordersValid: ordersTotal - ordersCancelled,
      ordersSuccess: totalOrdersSuccess,
      aov: totalOrdersSuccess > 0 ? totalRevenue / totalOrdersSuccess : 0,
      uniqueCustomers,
    },

    ordersByStatus: ordersByStatusArray(statusSum),
  };
};
