const router = require("express").Router();
const controller = require("./user.controller");
const userValidator = require("./user.validator");

const { guard } = require("../../middlewares/auth"); // auth/index.js
const { PERMISSIONS } = require("../../../../constants/permissions.js");
const { validate } = require("../../middlewares/validate.middleware");
const { uploadAvatar } = require("../../middlewares/upload/avatarUpload.middleware")
// GET /api/v1/admin/user
router.get(
    "/",
    ...guard({ any: [PERMISSIONS.USER_READ] }),
    controller.getAllUsers
);

// PATCH /api/v1/admin/user/:id/status
router.patch(
    "/:id/status",
    ...guard({ any: [PERMISSIONS.USER_WRITE] }),
    validate(userValidator.bulkStatus),
    controller.changeStatusMany
);

// DELETE /api/v1/admin/user/:id  (soft delete 1 user)
router.delete(
    "/:id",
    ...guard({ any: [PERMISSIONS.USER_WRITE] }),
    controller.delete
);

// PATCH /api/v1/admin/user/bulk/status
router.patch(
    "/bulk/status",
    ...guard({ any: [PERMISSIONS.USER_WRITE] }),
    validate(userValidator.bulkStatus),
    controller.changeStatusMany
);

// PATCH /api/v1/admin/user/bulk/delete
router.patch(
    "/bulk/delete",
    ...guard({ any: [PERMISSIONS.USER_WRITE] }),
    validate(userValidator.bulkDelete),
    controller.softDeleteManyUsers
);
router.patch(
    "/me/avatar",
    ...guard(),
    uploadAvatar("image"),
    controller.updateMyAvatar
);



module.exports = router;
