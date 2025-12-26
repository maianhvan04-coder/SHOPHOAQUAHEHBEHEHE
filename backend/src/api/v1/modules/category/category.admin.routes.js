const router = require("express").Router();
const controller = require("./category.controller");
const validator = require("./category.validator");

const { guard } = require("../../middlewares/auth");
const { PERMISSIONS } = require("../../../../constants/permissions.js");

const { validate } = require("../../middlewares/validate.middleware");

// GET /api/v1/admin/category
router.get("/", ...guard({ any: [PERMISSIONS.CATEGORY_READ] }), controller.adminList);

// GET /api/v1/admin/category/:id
router.get("/:id", ...guard({ any: [PERMISSIONS.CATEGORY_READ] }), controller.adminGetById);

// POST /api/v1/admin/category/create
router.post(
    "/create",
    ...guard({ any: [PERMISSIONS.CATEGORY_WRITE] }),
    validate(validator.create),
    controller.create
);

// PATCH /api/v1/admin/category/:id
router.patch(
    "/:id",
    ...guard({ any: [PERMISSIONS.CATEGORY_WRITE] }),
    validate(validator.update),
    controller.update
);

// PATCH /api/v1/admin/category/:id/status
router.patch(
    "/:id/status",
    ...guard({ any: [PERMISSIONS.CATEGORY_WRITE] }),
    validate(validator.changeStatus),
    controller.changeStatus
);

// DELETE /api/v1/admin/category/:id  (soft)
router.delete(
    "/:id",
    ...guard({ any: [PERMISSIONS.CATEGORY_WRITE] }),
    controller.softDelete
);

module.exports = router;
