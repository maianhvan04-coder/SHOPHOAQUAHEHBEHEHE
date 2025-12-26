const router = require("express").Router();
const { guard } = require("../../middlewares/auth");
const { PERMISSIONS } = require("../../../../constants/permissions.js");
const { validate } = require("../../middlewares/validate.middleware");
const controller = require("./product.controller");
const validator = require("./product.validator");

// GET /api/v1/admin/product
router.get("/", ...guard({ any: [PERMISSIONS.PRODUCT_READ] }), controller.adminList);

// POST /api/v1/admin/product
router.post(
    "/",
    ...guard({ any: [PERMISSIONS.PRODUCT_WRITE] }),
    validate(validator.create),
    controller.adminCreate
);

// PATCH /api/v1/admin/product/update/:id
router.patch(
    "/update/:id",
    ...guard({ any: [PERMISSIONS.PRODUCT_WRITE] }),
    validate(validator.update),
    controller.adminUpdate
);

// DELETE /api/v1/admin/product/delete/:id
router.delete(
    "/delete/:id",
    ...guard({ any: [PERMISSIONS.PRODUCT_WRITE] }),
    controller.softDelete
);

// GET /api/v1/admin/product/:id
router.get("/:id", ...guard({ any: [PERMISSIONS.PRODUCT_READ] }), controller.adminGetById);

// PATCH /api/v1/admin/product/:id/status
router.patch(
    "/:id/status",
    ...guard({ any: [PERMISSIONS.PRODUCT_WRITE] }),
    validate(validator.changeStatus),
    controller.changeStatus
);





module.exports = router;
