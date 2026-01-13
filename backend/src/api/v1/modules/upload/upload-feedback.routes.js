const router = require("express").Router();
const controller = require("./upload.controller");
const { auth } = require("../../middlewares/auth/auth.middleware.js");
router.post("/feedback-signature", auth, controller.getFeedbackSignature);
module.exports = router;