const router = require("express").Router();
const controller = require("./user.controller");
const userValidator = require("./user.validator");


const { validate } = require("../../middlewares/validate.middleware");
const { uploadAvatar } = require("../../middlewares/upload/avatarUpload.middleware")
const { auth } = require("../../middlewares/auth/auth.middleware")

router.patch(
    "/me/avatar",
    auth,
    uploadAvatar("image"),
    controller.updateMyAvatar
);

router.patch("/me/password", auth, controller.changeMyPassword);
router.patch("/me/profile", auth, controller.updateMyProfile);

module.exports = router;