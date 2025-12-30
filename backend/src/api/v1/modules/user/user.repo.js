const mongoose = require("mongoose");
const User = require("./user.model");
const Role = require("../rbac/model/role.model");
const UserRole = require("../rbac/model/UserRole.model");

const normEmail = (email = "") => String(email).trim().toLowerCase();

exports.findById = (id) => User.findById(id).lean();

exports.findPublicById = (id) =>
  User.findById(id)
    .select("_id fullName email image phone isActive isDeleted authzVersion createdAt updatedAt")
    .lean();

exports.findByEmail = (email, { session } = {}) =>
  User.findOne({ email: normEmail(email), isDeleted: false }).session(session || null);

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

exports.softDeleteById = (id) =>
  User.findByIdAndUpdate(id, { isDeleted: true, isActive: false }, { new: true });

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
exports.findUsers = async ({ page = 1, limit = 10, search = "", role = "", isActive }) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const skip = (page - 1) * limit;

  const match = { isDeleted: false };
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

