const router = require("express").Router();
const controller = require("./user.controller");
const userValidator = require("./user.validator");

const { guard } = require("../../middlewares/auth");
const { PERMISSIONS } = require("../../../../constants/permissions.js");
const { validate } = require("../../middlewares/validate.middleware");

// GET /api/v1/admin/user
router.get(
    "/",
    ...guard({ any: [PERMISSIONS.USER_READ] }),
    controller.getAllUsers
);

// POST /api/v1/admin/user/create
router.post(
    "/create",
    ...guard({ any: [PERMISSIONS.USER_CREATE] }),
    validate(userValidator.create),
    controller.createUser
);
router.patch(
    "/:id",
    ...guard({ any: [PERMISSIONS.USER_UPDATE] }),
    validate(userValidator.update),
    controller.updateUserAdmin
);

// // PATCH /api/v1/admin/user/:id/status  (đổi trạng thái 1 user)
// router.patch(
//   "/:id/status",
//   ...guard({ any: [PERMISSIONS.USER_CHANGE_STATUS] }),
//   validate(userValidator.bulkStatus), 
//   controller.changeStatusOne          
// );

// DELETE /api/v1/admin/user/:id  (soft delete 1 user)
router.delete(
    "/:id",
    ...guard({ any: [PERMISSIONS.USER_DELETE] }),
    controller.delete
);

// PATCH /api/v1/admin/user/bulk/status
router.patch(
    "/bulk/status",
    ...guard({ any: [PERMISSIONS.USER_UPDATE] }),
    validate(userValidator.bulkStatus),
    controller.changeStatusMany
);

// PATCH /api/v1/admin/user/bulk/delete
router.patch(
    "/bulk/delete",
    ...guard({ any: [PERMISSIONS.USER_DELETE] }),
    validate(userValidator.bulkDelete),
    controller.softDeleteManyUsers
);

router.get(
    "/assignable-roles",
    ...guard({ any: [PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_SET_ROLES] }),
    controller.getAssignableRoles
);
router.post(
    "/:id/roles",
    ...guard({ any: [PERMISSIONS.USER_SET_ROLES] }),
    validate(userValidator.setUserRoles),
    controller.setUserRoles
);



// GET /api/v1/admin/user
router.get(
    "/alldeleted",
    ...guard({ any: [PERMISSIONS.USER_READ] }),
    controller.getAllUsersDeleted
);

router.patch("/bulk/restore", ...guard({ any: [PERMISSIONS.USER_UPDATE] }), controller.restoreUsersMany);
router.patch("/:id/restore", ...guard({ any: [PERMISSIONS.USER_UPDATE] }), controller.restoreUser);
module.exports = router;
