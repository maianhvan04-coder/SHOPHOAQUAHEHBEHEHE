const express = require("express");
const route = express.Router();
const controller = require("../controllers/order.user.controller");
const {auth} = require("../../../middlewares/auth/auth.middleware");
route.post("/me/create", auth, controller.createOrder);
route.get("/me/", auth, controller.getMyOrders);
route.get("/me/:id", auth, controller.getOrderDetail);
route.patch("/me/:id/cancel", auth, controller.cancelOrder);
module.exports = route;
