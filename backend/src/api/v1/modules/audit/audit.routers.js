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

// GET /api/v1/admin/audit/security
router.get(
    "/security",
    ...guard({ any: [PERMISSIONS.AUDIT_SECURITY_READ] }),
    controller.getSecurityAuditList
);

// POST /api/v1/admin/audit/rollback
router.post(
    "/product/:auditId/rollback",
    ...guard({ any: [PERMISSIONS.AUDIT_PRODUCT_ROLLBACK] }),
    controller.rollback
);


module.exports = router;
