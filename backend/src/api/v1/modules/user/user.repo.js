const { default: mongoose } = require("mongoose");
const User = require("./user.model");
const { ROLES } = require("../../../../constants/roles")
exports.findUsers = async ({ page, limit, search, role, isActive, isDeleted }) => {
  const filter = {
    isDeleted: false,
  };

  if (typeof isActive !== "undefined") filter.isActive = isActive;
  if (role) filter.role = role;

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  return { users, total };
};


exports.findPublicById = (id) =>
  User.findById(id)
    .select("_id fullName email image phone isActive isDeleted authzVersion createdAt updatedAt")
    .lean();


exports.findById = async (id) => {
  return User.findById(id).lean()
}

exports.softDeleteById = (id) => {
  return User.findByIdAndUpdate(
    id,
    { isDeleted: true, isActive: false }, // xoá mềm + auto inactive
    { new: true }
  );
};

exports.findMetaByIds = (ids) => {
  return User.find({
    _id: { $in: ids }

  }).select("_id role isActive ")
}


exports.setActiveMany = (ids, isActive) => {
  console.log("ids", ids)
  return User.updateMany({
    _id: { $in: ids },
    isDeleted: false,
    role: { $ne: ROLES.ADMIN },
  }, {
    $set: { isActive }
  })
}

exports.softDeleteMany = (ids) => {
  return User.updateMany(
    {
      _id: { $in: ids },
      isDeleted: false,
      role: { $ne: ROLES.ADMIN },
    },
    { $set: { isDeleted: true, isActive: false } }
  );
}

exports.updateById = (id, payload) =>
  User.findByIdAndUpdate(id, { $set: payload }, { new: true });