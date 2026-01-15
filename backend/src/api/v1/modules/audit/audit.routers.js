const router = require("express").Router()
const { guard } = require("../../middlewares/auth");
const { PERMISSIONS } = require("../../../../constants/permissions.js");

const controller = require("./audit.controller.js");

// router.get("/product/:id", ...guard({ any: [PERMISSIONS.AUDIT_PRODUCT_READ] }), controller.getProductAudit)
// GET /api/v1/admin/product/:id/history
router.get(
    "/product/:id/history",
    ...guard({ any: [PERMISSIONS.AUDIT_PRODUCT_READ] }),
    controller.getProductHistory
);


// GET /api/v1/admin/audit/product
router.get(
    "/product",
    ...guard({ any: [PERMISSIONS.AUDIT_PRODUCT_READ] }),
    controller.getProductAuditList
);

// GET /api/v1/admin/audit/products/:auditId
router.get(
    "/products/:auditId",
    ...guard({ any: [PERMISSIONS.AUDIT_PRODUCT_READ] }),
    controller.getProductAuditDetail
);


module.exports = router;
