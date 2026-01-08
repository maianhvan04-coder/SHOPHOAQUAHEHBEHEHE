const router = require("express").Router();
const controller = require("./auth.controller");
const { loginLimiter, loginSlowDown } = require("../../middlewares/limited/index");
const schema = require("./auth.validator");
const { validate } = require("../../middlewares/validate.middleware");
const { auth } = require("../../middlewares/auth/auth.middleware");

router.post("/login", loginSlowDown, loginLimiter, validate(schema.login), controller.login);
router.post("/register", loginSlowDown, loginLimiter, validate(schema.register), controller.register);

router.get("/me", auth, controller.me);

// QUÊN MẬT KHẨU
router.post("/forgot-password", loginSlowDown, loginLimiter, validate(schema.forgotPassword), controller.forgotPassword);
router.post("/reset-password", loginSlowDown, loginLimiter, validate(schema.resetPassword), controller.resetPassword);

// cookie path cũng trỏ vào đây
router.post("/refresh-token", controller.refreshToken);

router.post("/logout", auth, controller.logout);

module.exports = router;
