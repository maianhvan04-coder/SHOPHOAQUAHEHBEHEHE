const mongoose = require("mongoose")
const ApiError = require("../../../../core/ApiError")
const httpStatus = require("../../../../core/httpStatus")
const rbacRepo = require("./rbac.repo")


exports.buildAuthz = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;

    const user = await rbacRepo.findUserAuthMeta(userId);
    if (!user || user.isDeleted || user.isActive === false) return null;

    // 1️⃣ load roles
    const urLinks = await rbacRepo.findUserRoleLinks(userId);
    const roleIds = urLinks.map(x => x.roleId);

    const roles = roleIds.length
        ? await rbacRepo.findRolesByIds(roleIds)
        : [];

    const activeRoles = roles.filter(r => r?.isActive !== false);
    const roleCodes = activeRoles.map(r => r.code);

    // 2️⃣ permissions từ roles
    const rpLinks = activeRoles.length
        ? await rbacRepo.findRolePermissionLinksByRoleIds(
            activeRoles.map(r => r._id)
        )
        : [];

    const permIds = [...new Set(rpLinks.map(x => x.permissionId.toString()))]
        .map(id => new mongoose.Types.ObjectId(id));

    const permsFromRoles = permIds.length
        ? await rbacRepo.findPermissionsByIds(permIds)
        : [];

    const set = new Set(permsFromRoles.map(p => p.key));

    // 3️⃣ ADMIN full permission
    if (roleCodes.includes("ADMIN")) {
        const allPerms = await rbacRepo.findAllActivePermissionIds();
        for (const p of allPerms) set.add(p.key);
    }

    // 4️⃣ overrides
    const overrides = await rbacRepo.findOverridesByUserId(userId);
    if (overrides.length) {
        const ovPerms = await rbacRepo.findPermissionsByIds(
            overrides.map(o => o.permissionId)
        );
        const mapIdToKey = new Map(
            ovPerms.map(p => [p._id.toString(), p.key])
        );

        for (const ov of overrides) {
            const key = mapIdToKey.get(ov.permissionId.toString());
            if (!key) continue;
            if (ov.effect === "ALLOW") set.add(key);
            if (ov.effect === "DENY") set.delete(key);
        }
    }

    // 5️⃣ primary role CHỈ cho UI
    const primaryRole = activeRoles.reduce((best, r) => {
        if (!best) return r;
        return (r.priority || 0) > (best.priority || 0) ? r : best;
    }, null);

    return {
        userId: user._id.toString(),
        authzVersion: user.authzVersion || 0,

        // 🔑 AUTHZ
        roles: roleCodes,
        permissions: Array.from(set),

        // 🔑 KHU VỰC – LẤY TỪ USER
        userType: user.type, // "internal" | "client"

        // 🎨 UI
        primaryRole: primaryRole
            ? { code: primaryRole.code, type: primaryRole.type }
            : null,
    };
};




// ===== Admin RBAC APIs =====

exports.listRoles = () => rbacRepo.findAllRoles();
exports.listPermissions = () => rbacRepo.findAllPermissions();

exports.syncAdminAllPermissions = async () => {
    const role = await rbacRepo.findRoleByCode("ADMIN");
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role ADMIN không tồn tại");

    const permDocs = await rbacRepo.findAllActivePermissionIds();
    const permIds = permDocs.map((p) => p._id);

    await rbacRepo.replaceRolePermissions(role._id, permIds);

    // bump authzVersion cho tất cả user đang có ADMIN role
    const ur = await rbacRepo.findUserRoleLinksByRoleId(role._id);
    const userIds = ur.map((x) => x.userId);
    await rbacRepo.bumpUsersAuthzVersion(userIds);

    return { role: "ADMIN", permissions: permIds.length };
};

exports.getRolePermissions = async (roleCode) => {
    if (!roleCode) throw new ApiError(httpStatus.BAD_REQUEST, "Thiếu roleCode");

    const role = await rbacRepo.findRoleByCode(roleCode);
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role không tồn tại");

    const permIds = await rbacRepo.findRolePermissionIdsByRoleId(role._id);

    // lọc theo isActive (repo findPermissionsByIds đã lọc isActive:true)
    const perms = permIds.length ? await rbacRepo.findPermissionsByIds(permIds) : [];


    const usersCount = await rbacRepo.countUsersByRoleId(role._id)
    return {
        role: role.code,
        usersCount,
        permissionKeys: perms.map((p) => p.key),
    };
};


exports.setRolePermissions = async (roleCode, permissionKeys) => {
    if (!roleCode) throw new ApiError(httpStatus.BAD_REQUEST, "Thiếu roleCode");

    // // khóa ADMIN: chỉ cho chỉnh trong DB
    // if (roleCode.trim().toUpperCase() === "ADMIN") {
    //     throw new ApiError(
    //         httpStatus.FORBIDDEN,
    //         "Tuổi tí được chỉnh quyền này nhé con"
    //     );
    // }

    const role = await rbacRepo.findRoleByCode(roleCode);
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role không tồn tại");

    const keys = permissionKeys || [];
    const perms = await rbacRepo.findPermissionsByKeys(keys);

    if (keys.length !== perms.length) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Có permissionKey không hợp lệ");
    }

    await rbacRepo.replaceRolePermissions(role._id, perms.map((p) => p._id));

    const ur = await rbacRepo.findUserRoleLinksByRoleId(role._id);
    const userIds = ur.map((x) => x.userId).filter(Boolean);
    await rbacRepo.bumpUsersAuthzVersion(userIds);

    return { role: role.code, permissions: perms.map((p) => p.key) };
};


exports.setUserRoles = async (userId, roleCodes) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "userId không hợp lệ");
    }

    const user = await rbacRepo.findUserAuthMeta(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User không tồn tại");

    const codes = roleCodes || [];
    const roles = await rbacRepo.findRolesByCodes(codes);

    if (codes.length !== roles.length) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Có roleCode không hợp lệ");
    }

    await rbacRepo.replaceUserRoles(userId, roles.map((r) => r._id));
    const INTERNAL_ROLE_TYPES = ["owner", "manager", "staff"];

    const hasInternalRole = roles.some((r) =>
        INTERNAL_ROLE_TYPES.includes(r.type)
    );

    if (hasInternalRole && user.type !== "internal") {
        await rbacRepo.updateUserType(userId, "internal");
    }

    if (!hasInternalRole && user.type === "internal") {
        await rbacRepo.updateUserType(userId, "client");
    }

    await rbacRepo.bumpUserAuthzVersion(userId);

    return { userId: userId.toString(), roles: roles.map((r) => r.code) };
};

exports.setUserPermissionOverride = async (userId, permissionKey, effect) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "userId không hợp lệ");
    }

    const user = await rbacRepo.findUserAuthMeta(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User không tồn tại");

    const perm = await rbacRepo.findPermissionByKey(permissionKey);
    if (!perm) throw new ApiError(httpStatus.BAD_REQUEST, "permissionKey không hợp lệ");

    if (!["ALLOW", "DENY"].includes(effect)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "effect phải là ALLOW hoặc DENY");
    }

    await rbacRepo.upsertUserOverride(userId, perm._id, effect);
    await rbacRepo.bumpUserAuthzVersion(userId);

    return { userId: userId.toString(), permission: perm.key, effect };
};

exports.removeUserPermissionOverride = async (userId, permissionKey) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "userId không hợp lệ");
    }

    const perm = await rbacRepo.findPermissionByKey(permissionKey);
    if (!perm) throw new ApiError(httpStatus.BAD_REQUEST, "permissionKey không hợp lệ");

    await rbacRepo.deleteUserOverride(userId, perm._id);
    await rbacRepo.bumpUserAuthzVersion(userId);

    return { ok: true };
};
