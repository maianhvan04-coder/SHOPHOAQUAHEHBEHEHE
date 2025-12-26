const router = require("express").Router();
const controller = require("./category.controller");

router.get("/me/:id", controller.getCategoryDetails);
router.get("/me/", controller.getAllCategories);

module.exports = router;
