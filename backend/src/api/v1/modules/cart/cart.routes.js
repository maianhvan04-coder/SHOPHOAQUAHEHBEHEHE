const express = require("express");
const router = express.Router();
const controller = require("./cart.controller");
const {auth} = require("../../middlewares/auth/auth.middleware");
router.get("/",auth, controller.getCart);
router.post("/add",auth, controller.addToCart);
router.patch("/update",auth, controller.updateQuantityCart);
router.delete("/delete/:productId",auth, controller.deleteFromCart);
module.exports = router;
