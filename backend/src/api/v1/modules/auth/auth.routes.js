const router = require("express").Router()
const controller = require("./auth.controller")
const { loginLimiter, loginSlowDown } = require("../../middlewares/limited/index");
const schema = require("./auth.validator");
const { validate } = require("../../middlewares/validate.middleware")
const { auth } = require("../../middlewares/auth/auth.middleware")
router.post("/login", loginSlowDown, loginLimiter, validate(schema.login), controller.login)

router.get("/me", auth, controller.me);
router.post("/register", loginSlowDown, loginLimiter, validate(schema.register), controller.register)
router.post("/refresh-token", controller.refreshToken)
router.post("/logout", controller.logout)
module.exports = router