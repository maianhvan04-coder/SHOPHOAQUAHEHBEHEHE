const router = require("express").Router();
const { guard } = require("../../../middlewares/auth/index.js");
const { PERMISSIONS } = require("../../../../../constants/permissions.js");
const { validate } = require("../../../middlewares/validate.middleware.js");
const controller = require("../controller/product.controller.js");
const validator = require("../validators/product.validator.js");
const { withAudit } = require("../../audit/audit.middleware.js");

const controllerCategory = require("../../category/category.controller.js");
const productRepo = require("../repositories/product.repo.js");

// =====================================================
// GET /api/v1/admin/product
// KHÔNG audit (read only)
// =====================================================
router.get(
    "/",
    ...guard({ any: [PERMISSIONS.PRODUCT_READ] }),
    controller.adminList
);

// // =====================================================
// // GET category list
// // KHÔNG audit
// // =====================================================
router.get(
    "/list-category",
    ...guard({ any: [PERMISSIONS.CATEGORY_CREATE, PERMISSIONS.PRODUCT_UPDATE] }),
    controllerCategory.adminList
);

// =====================================================
// POST /api/v1/admin/product
// AUDIT: create
// =====================================================
router.post(
    "/",
    ...guard({ any: [PERMISSIONS.PRODUCT_CREATE] }),
    validate(validator.create),

    // withAudit({
    //     resource: "product",
    //     action: "create",
    //     getResourceId: (req) => req.auditAfter?._id,
    // }),

    controller.createProduct
);

// =====================================================
// PATCH /api/v1/admin/product/update/:id
// AUDIT: update
// =====================================================
router.patch(
    "/update/:id",
    ...guard({ any: [PERMISSIONS.PRODUCT_UPDATE] }),
    validate(validator.update),

    withAudit({
        resource: "product",
        action: "update",
        getResourceId: (req) => req.params.id,
        getBefore: (req) =>
            productRepo.findByIdAdmin(req.params.id).lean(),
        getAfter: (req) =>
            productRepo.findByIdAdmin(req.params.id).lean(),
    }),

    controller.updateProduct
);

// =====================================================
// DELETE /api/v1/admin/product/delete/:id
// AUDIT: delete (soft delete)
// =====================================================
router.delete(
    "/delete/:id",
    ...guard({ any: [PERMISSIONS.PRODUCT_DELETE] }),

    withAudit({
        resource: "product",
        action: "delete",
        getResourceId: (req) => req.params.id,
        getBefore: (req) =>
            productRepo.findByIdAdmin(req.params.id).lean(),
    }),

    controller.softDelete
);

// =====================================================
// PATCH /api/v1/admin/product/:id/status
// AUDIT: status
// =====================================================
router.patch(
    "/:id/status",
    ...guard({ any: [PERMISSIONS.PRODUCT_UPDATE] }),
    validate(validator.changeStatus),

    withAudit({
        resource: "product",
        action: "status",
        getResourceId: (req) => req.params.id,
        getBefore: (req) =>
            productRepo.findByIdAdmin(req.params.id).lean(),
        getAfter: (req) =>
            productRepo.findByIdAdmin(req.params.id).lean(),
    }),

    controller.changeStatus
);


router.get(
    "/:id",
    ...guard({ any: [PERMISSIONS.PRODUCT_READ] }),
    controller.adminGetByIdForEdit
);

module.exports = router;
