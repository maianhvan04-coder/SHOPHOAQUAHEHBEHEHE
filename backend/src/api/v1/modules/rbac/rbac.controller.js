
const asyncHandler = require("../../../../core/asyncHandler");

const rbacService = require("./rbac.service");

const { PERMISSIONS, PERMISSION_GROUPS, ADMIN_SCREENS, PERMISSION_META } = require("../../../../constants/permissions")

exports.listRoles = asyncHandler(async (req, res) => {
    const data = await rbacService.listRoles();
    console.log(data)
    res.json({ data });
});


exports.getRbacCatalog = asyncHandler(async (req, res) => {
    // tuỳ dự án bạn lưu permission ở đâu
    // ví dụ: req.user.permissionKeys hoặc req.auth.permissions...
    const permissions = req.user?.permissions || req.auth?.permissionKeys || {};

    const hasPermission = (key) => !!permissions[key];

    // chỉ system viewer mới thấy SYSTEM + RBAC
    const isSystemViewer = hasPermission(PERMISSIONS.RBAC_MANAGE);

    // data gốc
    let groups = Object.values(PERMISSION_GROUPS);
    let screens = Object.values(ADMIN_SCREENS);
    let permissionMeta = Object.values(PERMISSION_META);

    if (!isSystemViewer) {
        groups = groups.filter((g) => g.key !== PERMISSION_GROUPS.SYSTEM.key);

        screens = screens.filter((s) => s.group !== PERMISSION_GROUPS.SYSTEM.key);
        // hoặc chỉ loại RBAC screen:
        // screens = screens.filter((s) => s.key !== "rbac");

        permissionMeta = permissionMeta.filter((p) => p.group !== PERMISSION_GROUPS.SYSTEM.key);
        // hoặc chặt hơn: ẩn mọi thứ resource=rbac
        permissionMeta = permissionMeta.filter((p) => p.resource !== "rbac");
    }

    return res.json({
        data: { groups, screens, permissionMeta },
    });
});



exports.listPermissions = asyncHandler(async (req, res) => {
    const data = await rbacService.listPermissions();
    res.json({ data });
});

exports.syncAdminAllPermissions = asyncHandler(async (req, res) => {
    const data = await rbacService.syncAdminAllPermissions();
    res.json({ data });
});

exports.setRolePermissions = asyncHandler(async (req, res) => {

    const { roleCode, permissionKeys } = req.body;

    const data = await rbacService.setRolePermissions(roleCode, permissionKeys);
    res.json({ data });
});

exports.setUserRoles = asyncHandler(async (req, res) => {
    const { userId, roleCodes } = req.body;
    const data = await rbacService.setUserRoles(userId, roleCodes);
    res.json({ data });
});

exports.setUserOverride = asyncHandler(async (req, res) => {
    const { userId, permissionKey, effect } = req.body;
    const data = await rbacService.setUserPermissionOverride(userId, permissionKey, effect);
    res.json({ data });
});

exports.removeUserOverride = asyncHandler(async (req, res) => {
    const { userId, permissionKey } = req.body;
    const data = await rbacService.removeUserPermissionOverride(userId, permissionKey);
    res.json({ data });
});


exports.getPermissionByRole = asyncHandler(async (req, res) => {
    const { roleCode } = req.params;
    const data = await rbacService.getRolePermissions(roleCode)
    console.log(data)
    return res.json({ data })
})


// ===============ROLE================
// controller/rbac.controller.js
const roleService = require("./service/role.service");

exports.createRole = asyncHandler(async (req, res) => {


    const role = await roleService.createRole(req.body);
    res.json({ data: role });
});

exports.updateRole = asyncHandler(async (req, res) => {

    const role = await roleService.updateRole(req.params.id, req.body);
    res.json({ data: role });
});

exports.deleteRole = asyncHandler(async (req, res) => {
    console.log(req.params.id)
    await roleService.deleteRole(req.params.id);
    res.json({ data: true });
});


exports.toggleRoleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const role = await roleService.toggleStatus(id);
    res.json({ data: role });
});
