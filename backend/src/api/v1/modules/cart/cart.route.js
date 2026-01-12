const express = require("express");
const route = express.Router();

const controller = require("./cart.controller");
const { auth } = require("../../middlewares/auth/auth.middleware");
route.get("/me", auth, controller.getCart);
route.post("/me/add", auth, controller.addToCart);
route.post("/me/merge", auth, controller.mergeCart);
route.patch("/me/update", auth, controller.updateQuantity);
route.delete("/me/:productId", auth, controller.deleteItem);

module.exports = route;