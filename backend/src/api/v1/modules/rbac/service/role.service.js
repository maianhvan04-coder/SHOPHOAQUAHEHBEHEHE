// service/role.service.js
const httpStatus = require("../../../../../core/httpStatus")
const ApiError = require("../../../../../core/apiError");
const roleRepo = require("../repo/role.repo");
const { toRoleCode, deriveTypeFromCode, derivePriorityFromType } = require("../utils/role.util");

exports.createRole = async (payload) => {
    const { name, description = "", code, type, priority, isActive } = payload;

    if (!name?.trim()) throw new ApiError(httpStatus.BAD_REQUEST, "Thiếu name");

    const finalCode = code?.trim() ? code.trim().toUpperCase() : toRoleCode(name);
    const finalType = type || deriveTypeFromCode(finalCode);
    const finalPriority =
        typeof priority === "number" ? priority : derivePriorityFromType(finalType);

    const exists = await roleRepo.existsByCode(finalCode);
    if (exists) throw new ApiError(httpStatus.CONFLICT, "Role code đã tồn tại");

    const role = await roleRepo.create({
        code: finalCode,
        name: name.trim(),
        description: String(description || "").trim(),
        type: finalType,
        priority: finalPriority,
        isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return role;
};

exports.updateRole = async (id, payload) => {
    const { name, description, code, type, priority, isActive } = payload;

    const role = await roleRepo.findById(id);
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role không tồn tại");

    // đổi code → check unique
    if (code && code.trim().toUpperCase() !== role.code) {
        const newCode = code.trim().toUpperCase();
        const exists = await roleRepo.existsByCodeExceptId(newCode, id);
        if (exists) throw new ApiError(httpStatus.CONFLICT, "Role code đã tồn tại");
        role.code = newCode;

        // auto type theo code nếu client không gửi type
        if (!type) role.type = deriveTypeFromCode(newCode);
    }

    if (name != null) role.name = String(name).trim();
    if (description != null) role.description = String(description).trim();
    if (type != null) role.type = type;
    if (typeof priority === "number") role.priority = priority;
    if (typeof isActive === "boolean") role.isActive = isActive;

    await role.save();
    return role;
};

exports.deleteRole = async (id) => {

    const role = await roleRepo.findById(id);
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role không tồn tại");

    await roleRepo.deleteById(id);
    return true;
};


exports.toggleStatus = async (id) => {
    const role = await roleRepo.findById(id);
    if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role không tồn tại");

    // chặn ADMIN nếu muốn
    if (role.code === "ADMIN") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Không được tắt ADMIN");
    }

    role.isActive = !role.isActive;
    await role.save();
    return role;
};
