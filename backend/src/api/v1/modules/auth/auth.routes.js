const router = require("express").Router();
const controller = require("./auth.controller");
const { loginLimiter, loginSlowDown } = require("../../middlewares/limited/index");
const schema = require("./auth.validator");
const { validate } = require("../../middlewares/validate.middleware");
const { auth } = require("../../middlewares/auth/auth.middleware");
const { withAudit } = require("../audit/audit.middleware.js");
const { blockedIpGuard } = require("../security/security.middleware.js")
router.post("/login", loginSlowDown, loginLimiter, validate(schema.login),
    withAudit({
        resource: "security",
        action: "login_success",
        getResourceId: (req) => req.auditUserId ?? null,
        getMeta: (req) => req.auditMeta ?? null,
    }),
    blockedIpGuard,
    controller.login);

router.post("/google-login", loginSlowDown, loginLimiter, controller.googleLogin);

router.post("/register", loginSlowDown, loginLimiter, validate(schema.register), controller.register);

router.get("/me", auth, controller.me);

// QUÊN MẬT KHẨU
router.post("/forgot-password", loginSlowDown, loginLimiter, validate(schema.forgotPassword), controller.forgotPassword);
router.post("/reset-password", loginSlowDown, loginLimiter, validate(schema.resetPassword), controller.resetPassword);

// cookie path cũng trỏ vào đây
router.post("/refresh-token", controller.refreshToken);

router.post("/logout", auth, controller.logout);

module.exports = router;
