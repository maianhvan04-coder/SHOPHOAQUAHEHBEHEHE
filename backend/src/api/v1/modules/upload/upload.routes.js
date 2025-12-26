const router = require("express").Router()
const controller = require("./upload.controller")
const { guard } = require("../../middlewares/auth");
const { PERMISSIONS } = require("../../../../constants/permissions.js");


// POST /api/v1/admin/upload/signature
router.post("/signature", ...guard({ any: [PERMISSIONS.PRODUCT_WRITE] }), controller.getSignature)
module.exports = router