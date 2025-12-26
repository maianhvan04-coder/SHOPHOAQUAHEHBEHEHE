const router = require("express").Router()
const controller = require("./product.controller");


router.get("/me/top-new", controller.getTopNewProducts);
router.get("/me/:slug", controller.getProductBySlug);
router.get("/me/", controller.getAllProducts);
router.get("/me/cat/:id", controller.getProductByCategory);


module.exports = router;
