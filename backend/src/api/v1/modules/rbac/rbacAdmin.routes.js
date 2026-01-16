const router = require("express").Router();
const { guard } = require("../../middlewares/auth");
const controller = require("./rbac.controller.js");
const validator = require("./rbacAdmin.validator");
const { PERMISSIONS } = require("../../../../constants/permissions.js");
const { validate } = require("../../middlewares/validate.middleware.js");
const { auth } = require("../../middlewares/auth/auth.middleware");

// Guards
const RBAC_READ = guard({ any: [PERMISSIONS.RBAC_READ, PERMISSIONS.RBAC_MANAGE] });
const RBAC_READ_PERM = guard({ any: [PERMISSIONS.RBAC_READ_PERMISSION, PERMISSIONS.RBAC_MANAGE] });

const RBAC_SET_ROLE_PERMS = guard({ any: [PERMISSIONS.RBAC_SET_ROLE_PERMISSIONS, PERMISSIONS.RBAC_MANAGE] });
const RBAC_SET_USER_ROLES = guard({ any: [PERMISSIONS.RBAC_SET_USER_ROLES, PERMISSIONS.RBAC_MANAGE] });

const RBAC_OVERRIDE_SET = guard({ any: [PERMISSIONS.RBAC_SET_USER_OVERRIDE, PERMISSIONS.RBAC_MANAGE] });
const RBAC_OVERRIDE_REMOVE = guard({ any: [PERMISSIONS.RBAC_REMOVE_USER_OVERRIDE, PERMISSIONS.RBAC_MANAGE] });

const RBAC_SYNC_ADMIN = guard({ any: [PERMISSIONS.RBAC_SYNC_ADMIN, PERMISSIONS.RBAC_MANAGE] });

// public-ish (đã auth)
router.get("/catalog", auth, controller.getRbacCatalog);

// read
router.get("/roles", ...RBAC_READ, controller.listRoles);
router.get("/permissions", ...RBAC_READ_PERM, controller.listPermissions);
router.get("/roles/:roleCode/permissions", ...RBAC_READ_PERM, controller.getPermissionByRole);

// write
router.post(
    "/role-permissions",
    ...guard(PERMISSIONS.RBAC_READ),
    validate(validator.setRolePermissions),
    controller.setRolePermissions
);

router.post(
    "/user-roles",
    ...RBAC_SET_USER_ROLES,
    validate(validator.setUserRoles),
    controller.setUserRoles
);

router.post(
    "/user-override",
    ...RBAC_OVERRIDE_SET,
    validate(validator.setUserOverride),
    controller.setUserOverride
);

router.delete(
    "/user-override",
    ...RBAC_OVERRIDE_REMOVE,
    validate(validator.removeUserOverride),
    controller.removeUserOverride
);

router.post(
    "/roles/create",
    ...RBAC_SYNC_ADMIN,
    validate(validator.createRole),
    controller.createRole
);
router.delete(
    "/roles/:id",
    ...RBAC_SYNC_ADMIN,
    // validate(validator.createRole),
    controller.deleteRole
);
router.patch(
    "/roles/update/:id",
    ...RBAC_SYNC_ADMIN,
    validate(validator.updateRoleSchema),
    controller.updateRole
);
// sync (admin only)
router.post("/sync-admin", ...RBAC_SYNC_ADMIN, controller.syncAdminAllPermissions);

module.exports = router;
