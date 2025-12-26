const router = require("express").Router()

const { guard } = require("../../middlewares/auth");

const controller = require("./rbac.controller.js")
const validator = require("./rbacAdmin.validator");
const { PERMISSIONS } = require("../../../../constants/permissions.js");
const { validate } = require("../../middlewares/validate.middleware.js")

const { auth } = require("../../middlewares/auth/auth.middleware")
router.get("/catalog", auth, controller.getRbacCatalog)


router.get("/roles", ...guard({ any: [PERMISSIONS.USER_READ] }), controller.listRoles)

router.get("/roles/:roleCode/permissions", ...guard({ any: [PERMISSIONS.USER_READ] }), controller.getPermissionByRole)




router.post("/sync-admin", ...guard({ any: [PERMISSIONS.USER_WRITE] }), controller.syncAdminAllPermissions)
router.get(
    "/permissions",
    ...guard({ any: [PERMISSIONS.USER_READ] }),
    controller.listPermissions
);

router.post(
    "/role-permissions",
    ...guard({ any: [PERMISSIONS.USER_WRITE] }),
    validate(validator.setRolePermissions),
    controller.setRolePermissions
);

router.post(
    "/user-roles",
    ...guard({ any: [PERMISSIONS.USER_WRITE] }),
    validate(validator.setUserRoles),
    controller.setUserRoles
);

router.post(
    "/user-override",
    ...guard({ any: [PERMISSIONS.USER_WRITE] }),
    validate(validator.setUserOverride),
    controller.setUserOverride
);

router.delete(
    "/user-override",
    ...guard({ any: [PERMISSIONS.USER_WRITE] }),
    validate(validator.removeUserOverride),
    controller.removeUserOverride
);

module.exports = router