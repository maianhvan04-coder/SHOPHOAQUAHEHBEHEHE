const mongoose = require("mongoose");
const User = require("./user.model");
const Role = require("../rbac/model/role.model");
const UserRole = require("../rbac/model/UserRole.model");

const normEmail = (email = "") => String(email).trim().toLowerCase();


const normalizeIds = (ids = []) => {
  if (!Array.isArray(ids)) return [];
  const uniq = [...new Set(ids)].filter(Boolean);

  return uniq
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
};


exports.findById = (id, opts = {}) => {
  const q = User.findById(id);
  if (opts.session) q.session(opts.session);
  return q;
};
exports.findManyByIds = (ids, opts = {}) => {
  const q = User.find({ _id: { $in: ids } });
  if (opts.session) q.session(opts.session);
  return q;
};

exports.restoreById = (id, opts = {}) => {
  const update = {
    $set: {
      isDeleted: false,
      isActive: true, // restore thường bật lại
    },
  };

  return User.updateOne({ _id: id }, update, { session: opts.session });
};

exports.restoreManyByIds = (ids, opts = {}) => {
  const update = {
    $set: {
      isDeleted: false,
      isActive: true,
    },
  };

  return User.updateMany({ _id: { $in: ids } }, update, { session: opts.session });
};


exports.findPublicById = (id) =>
  User.findById(id)
    .select("_id fullName email image phone isActive isDeleted authzVersion createdAt updatedAt")
    .lean();

exports.findByEmail = (email, { session } = {}) =>
  User.findOne({ email: normEmail(email), isDeleted: false }).session(session || null);

exports.findByPhone = (phone, { session } = {}) =>
  User.findOne({ phone: phone, isDeleted: false }).session(session || null);

exports.createOne = (data, { session } = {}) =>
  User.create([data], { session }).then((arr) => arr[0]);

exports.updateById = (id, data, { session } = {}) =>
  User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, session: session || null }
  )
    .select("-passwordHash")
    .lean();


exports.findByPhone = (phone, { session } = {}) =>
  User.findOne({ phone, isDeleted: false })
    .select("_id phone")
    .session(session || null)
    .lean();

/**
 * Gán roles theo roleCodes (replace toàn bộ role hiện tại của user)
 */
exports.replaceUserRolesByCodes = async ({ userId, roleCodes }, { session } = {}) => {
  const roles = await Role.find({
    code: { $in: roleCodes },
    isActive: true,
  }).session(session || null);

  if (!roles.length) throw new Error("Role not found");

  // xóa hết role cũ
  await UserRole.deleteMany({ userId }).session(session || null);

  // insert role mới
  await UserRole.insertMany(
    roles.map((r) => ({ userId, roleId: r._id })),
    { session }
  );

  return roles;
};


exports.bumpAuthzVersion = (id, { session } = {}) =>
  User.updateOne({ _id: id }, { $inc: { authzVersion: 1 } }).session(session || null);

/**
 * Lấy user + roles[] (format đúng FE đang render: roles: [{code,...}])
 */
exports.findUserWithRolesById = async (userId) => {
  const rows = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "userroles",
        localField: "_id",
        foreignField: "userId",
        as: "userRoles",
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "userRoles.roleId",
        foreignField: "_id",
        as: "roles",
      },
    },
    {
      $project: {
        passwordHash: 0,
        userRoles: 0,
      },
    },
  ]);

  const u = rows?.[0];
  if (!u) return null;

  // map roles shape
  u.roles = (u.roles || []).map((r) => ({
    _id: r._id,
    code: r.code,
    name: r.name,
    type: r.type,
    priority: r.priority,
    isActive: r.isActive,
  }));

  return u;
};

/**
 * List users + filter search, isActive, roleCode
 * Trả về { items, pagination }
 */
exports.findUsers = async ({ page = 1, limit = 10, search = "", role = "", isActive, isDeleted }) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const skip = (page - 1) * limit;



  const parseBool = (v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      if (s === "true") return true;
      if (s === "false") return false;
    }
    return undefined;
  };

  const deletedBool = parseBool(isDeleted);
  const activeBool = parseBool(isActive);

  // ✅ default: chỉ lấy chưa deleted nếu client không truyền
  const match = { isDeleted: deletedBool ?? false };

  if (activeBool !== undefined) match.isActive = activeBool;
  if (search) {
    match.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  // pipeline chung: match + lookup roles
  const base = [
    { $match: match },
    {
      $lookup: {
        from: "userroles",
        localField: "_id",
        foreignField: "userId",
        as: "userRoles",
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "userRoles.roleId",
        foreignField: "_id",
        as: "roles",
      },
    },
    ...(role ? [{ $match: { "roles.code": role } }] : []),
  ];

  const dataPipeline = [
    ...base,
    { $sort: { createdAt: -1 } },
    {
      $project: {
        passwordHash: 0,
        userRoles: 0,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ];

  const countPipeline = [...base, { $count: "total" }];

  const [items, totalRows] = await Promise.all([
    User.aggregate(dataPipeline),
    User.aggregate(countPipeline),
  ]);

  const total = totalRows?.[0]?.total || 0;

  const users = (items || []).map((u) => ({
    ...u,
    roles: (u.roles || []).map((r) => ({
      _id: r._id,
      code: r.code,
      name: r.name,
      type: r.type,
      priority: r.priority,
    })),
  }));

  return { users, total };
};

exports.findUsersDeleted = async ({ page = 1, limit = 10, search = "", role = "", isActive }) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const skip = (page - 1) * limit;

  const match = { isDeleted: true };
  if (typeof isActive !== "undefined") match.isActive = !!isActive;

  if (search) {
    match.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  // pipeline chung: match + lookup roles
  const base = [
    { $match: match },
    {
      $lookup: {
        from: "userroles",
        localField: "_id",
        foreignField: "userId",
        as: "userRoles",
      },
    },
    {
      $lookup: {
        from: "roles",
        localField: "userRoles.roleId",
        foreignField: "_id",
        as: "roles",
      },
    },
    ...(role ? [{ $match: { "roles.code": role } }] : []),
  ];

  const dataPipeline = [
    ...base,
    { $sort: { createdAt: -1 } },
    {
      $project: {
        passwordHash: 0,
        userRoles: 0,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ];

  const countPipeline = [...base, { $count: "total" }];

  const [items, totalRows] = await Promise.all([
    User.aggregate(dataPipeline),
    User.aggregate(countPipeline),
  ]);

  const total = totalRows?.[0]?.total || 0;

  const users = (items || []).map((u) => ({
    ...u,
    roles: (u.roles || []).map((r) => ({
      _id: r._id,
      code: r.code,
      name: r.name,
      type: r.type,
      priority: r.priority,
    })),
  }));

  return { users, total };
};
exports.getAdminUserIdsInList = async (userIds) => {
  // userIds: ObjectId[]
  if (!userIds?.length) return [];

  const adminRole = await Role.findOne({
    code: "ADMIN",
    isDeleted: false,
    // isActive: true, // nếu muốn chỉ chặn admin role đang active
  })
    .select("_id")
    .lean();

  if (!adminRole?._id) return []; // hệ thống không có ADMIN role => khỏi chặn

  const adminUserRoles = await UserRole.find({
    userId: { $in: userIds },
    roleId: adminRole._id,
  })
    .select("userId")
    .lean();

  return adminUserRoles.map((x) => x.userId);
};

exports.setActiveMany = async (ids, isActive) => {
  const userIds = normalizeIds(ids);
  if (!userIds.length) return { matchedCount: 0, modifiedCount: 0 };

  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const adminUserIds = await getAdminUserIdsInList(userIds, session);

      // chỉ cho phép update các user KHÔNG phải admin
      const allowUserIds = userIds.filter(
        (id) => !adminUserIds.some((a) => String(a) === String(id))
      );

      if (!allowUserIds.length) {
        return { matchedCount: 0, modifiedCount: 0 };
      }

      const result = await User.updateMany(
        { _id: { $in: allowUserIds }, isDeleted: false }, // user đã xoá mềm thì thôi
        { $set: { isActive: !!isActive } }
      ).session(session);

      return {
        matchedCount: result.matchedCount ?? result.n ?? 0,
        modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
      };
    });
  } finally {
    session.endSession();
  }
};

exports.softDeleteMany = async (ids) => {
  const userIds = normalizeIds(ids);
  if (!userIds.length) return { matchedCount: 0, modifiedCount: 0 };

  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const adminUserIds = await getAdminUserIdsInList(userIds, session);

      // chỉ xử lý các user không phải admin
      const allowUserIds = userIds.filter(
        (id) => !adminUserIds.some((a) => String(a) === String(id))
      );

      if (!allowUserIds.length) {
        return { matchedCount: 0, modifiedCount: 0 };
      }

      // 1) soft delete user
      const u = await User.updateMany(
        { _id: { $in: allowUserIds }, isDeleted: false },
        { $set: { isDeleted: true, isActive: false } }
      ).session(session);

      // 2) soft delete userRole mappings
      await UserRole.updateMany(
        { userId: { $in: allowUserIds }, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      ).session(session);

      return {
        matchedCount: u.matchedCount ?? u.n ?? 0,
        modifiedCount: u.modifiedCount ?? u.nModified ?? 0,
      };
    });
  } finally {
    session.endSession();
  }
};


exports.softDeleteById = async (id, opts = {}) =>
  User.updateOne({ _id: id, isDeleted: false }, { $set: { isDeleted: true, isActive: false } })
    .session(opts.session || null);


// user.repo.js
exports.findByIdWithPassword = (id, opts = {}) => {
  const q = User.findOne({ _id: id, isDeleted: false }).select("+passwordHash");
  if (opts.session) q.session(opts.session);
  return q;
};
