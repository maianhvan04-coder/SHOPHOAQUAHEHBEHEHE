
const asyncHandler = require("../../../../core/asyncHandler");

const rbacService = require("./rbac.service");

const { PERMISSIONS, PERMISSION_GROUPS, ADMIN_SCREENS, PERMISSION_META } = require("../../../../constants/permissions")

exports.listRoles = asyncHandler(async (req, res) => {
    const data = await rbacService.listRoles();
    res.json({ data });
});


exports.getRbacCatalog = asyncHandler(async (req, res) => {
    res.json({
        data: {
            groups: Object.values(PERMISSION_GROUPS),
            screens: Object.values(ADMIN_SCREENS),
            permissionMeta: Object.values(PERMISSION_META)
        }
    })

})


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
    return res.json({ data })
})