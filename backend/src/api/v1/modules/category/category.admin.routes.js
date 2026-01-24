const router = require("express").Router();
const controller = require("./category.controller");
const validator = require("./category.validator");

const { guard } = require("../../middlewares/auth");
const { PERMISSIONS } = require("../../../../constants/permissions.js");
const { validate } = require("../../middlewares/validate.middleware");

// GET /api/v1/admin/category?tab=active|deleted
router.get("/", ...guard({ any: [PERMISSIONS.CATEGORY_READ] }), controller.adminList);

// POST /api/v1/admin/category/create
router.post(
  "/create",
  ...guard({ any: [PERMISSIONS.CATEGORY_CREATE] }),
  validate(validator.create),
  controller.create
);

// PATCH /api/v1/admin/category/:id/status
router.patch(
  "/:id/status",
  ...guard({ any: [PERMISSIONS.CATEGORY_UPDATE] }),
  validate(validator.changeStatus),
  controller.changeStatus
);

// ✅ restore (chỉ tab deleted dùng)
router.patch(
  "/:id/restore",
  ...guard({ any: [PERMISSIONS.CATEGORY_UPDATE] }),
  controller.restore
);

// ✅ hard delete (xóa vĩnh viễn) - chỉ cho isDeleted=true
router.delete(
  "/:id/hard",
  ...guard({ any: [PERMISSIONS.CATEGORY_DELETE] }),
  controller.hardDelete
);

// GET /api/v1/admin/category/:id
router.get("/:id", ...guard({ any: [PERMISSIONS.CATEGORY_READ] }), controller.adminGetById);

// PATCH /api/v1/admin/category/:id
router.patch(
  "/:id",
  ...guard({ any: [PERMISSIONS.CATEGORY_UPDATE] }),
  validate(validator.update),
  controller.update
);

// DELETE /api/v1/admin/category/:id (soft)
router.delete(
  "/:id",
  ...guard({ any: [PERMISSIONS.CATEGORY_DELETE] }),
  controller.softDelete
);
router.get("/product/for-product", controller.getCategoriesForProduct);
module.exports = router;
