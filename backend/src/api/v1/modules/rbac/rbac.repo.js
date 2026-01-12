const Role = require("./model/role.model.js");
const Permission = require("./model/permission.model.js");
const RolePermission = require("./model/rolePermission.model.js");
const UserRole = require("./model/UserRole.model.js");
const UserPermissionOverride = require("./model/userPermissionOverride.model.js");
const User = require("../user/user.model.js");



// ===== User =====
exports.findUserAuthMeta = (userId) =>
    User.findById(userId).select("_id authzVersion isActive isDeleted").lean();


exports.countUsersByRoleId = async (roleId, { onlyActive = false } = {}) => {
    const pipeline = [
        { $match: { roleId } },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            }
        },
        { $unwind: "$user" },
        { $match: { "user.isDeleted": false } },
    ]

    if (onlyActive) pipeline.push({ $match: { "user.isActive": true } });
    pipeline.push({ $count: "total" });

    const res = await UserRole.aggregate(pipeline)

    return res?.[0]?.total || 0;

}

exports.bumpUsersAuthzVersion = (userIds) => {
    if (!userIds?.length) return Promise.resolve({ matchedCount: 0, modifiedCount: 0 });
    return User.updateMany({ _id: { $in: userIds } }, { $inc: { authzVersion: 1 } });
};

exports.bumpUserAuthzVersion = (userId) =>
    User.findByIdAndUpdate(userId, { $inc: { authzVersion: 1 } });

// ===== Role =====
exports.findRoleByCode = (code) => Role.findOne({ code, isActive: true }).lean();
exports.findRolesByCodes = (codes) => Role.find({ code: { $in: codes }, isActive: true }).lean();
exports.findRolesByIds = (ids) => Role.find({ _id: { $in: ids }, isActive: true }).select("_id code type priority").lean();
exports.findAllRoles = () => Role.find({ isDeleted: false }).sort({ code: 1 }).lean();

// ===== Permission =====
exports.findAllPermissions = () => Permission.find({}).sort({ group: 1, key: 1 }).lean();
exports.findAllActivePermissionIds = () => Permission.find({ isActive: true }).select("_id").lean();
exports.findPermissionsByKeys = (keys) => Permission.find({ key: { $in: keys }, isActive: true }).lean();
exports.findPermissionsByIds = (ids) => Permission.find({ _id: { $in: ids }, isActive: true }).lean();
exports.findPermissionByKey = (key) => Permission.findOne({ key, isActive: true }).lean();

// rbac.repo.js
exports.replaceRolePermissions = async (roleId, permissionDocs) => {
    await RolePermission.deleteMany({ roleId });

    if (permissionDocs.length) {
        await RolePermission.insertMany(
            permissionDocs.map((p) => ({
                roleId,
                permissionKey: p.permissionKey,
                scope: p.scope || "all",
                field: p.scope === "own" ? p.field || "createdBy" : null,
            }))
        );
    }
};


// ===== RolePermission (thêm) =====
exports.findRolePermissionIdsByRoleId = async (roleId) => {
    return RolePermission.find({ roleId }).lean()
};


exports.findRolePermissionLinksByRoleIds = (roleIds) =>
    RolePermission.find({ roleId: { $in: roleIds } }).lean();

// ===== UserRole =====
exports.findUserRoleLinks = (userId) => UserRole.find({ userId }).lean();
exports.findUserRoleLinksByRoleId = (roleId) => UserRole.find({ roleId }).lean();

exports.replaceUserRoles = async (userId, roleIds) => {
    await UserRole.deleteMany({ userId });
    if (!roleIds?.length) return;
    await UserRole.insertMany(roleIds.map((roleId) => ({ userId, roleId })));
};

// ===== Overrides =====
exports.findOverridesByUserId = (userId) => UserPermissionOverride.find({ userId }).lean();

exports.upsertUserOverride = (userId, permissionId, effect) =>
    UserPermissionOverride.findOneAndUpdate(
        { userId, permissionId },
        { $set: { userId, permissionId, effect } },
        { upsert: true, new: true }
    );

exports.deleteUserOverride = (userId, permissionId) =>
    UserPermissionOverride.deleteOne({ userId, permissionId });




