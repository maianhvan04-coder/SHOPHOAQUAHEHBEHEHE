const Joi = require("joi");
const { VALIDATORS: V, applyPattern } = require("../../../../constants/validators");

// -----------------------------------------------------------
// 1. Dành cho USER (Khách hàng đặt đơn)
// -----------------------------------------------------------
exports.createOrder = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
        // Validate ID sản phẩm phải đúng định dạng MongoDB
        product: applyPattern(Joi.string().required(), V.MONGO_OBJECT_ID),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),

  shippingAddress: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    // Validate số điện thoại chuẩn Việt Nam (10 số, bắt đầu bằng 0)
    phone: applyPattern(Joi.string().required(), V.PHONE_VN),
    addressDetails: Joi.string().required(),
  }).required(),

  paymentMethod: Joi.string().valid("COD", "Paypal").default("COD"),
  customerNote: Joi.string().allow("").max(500).optional(),
  shippingPrice: Joi.number().min(0).optional(),
});

// -----------------------------------------------------------
// 2. Dành cho ADMIN (Cập nhật trạng thái đơn)
// -----------------------------------------------------------
exports.changeStatus = Joi.object({
  orderStatus: Joi.string()
    .valid("Pending", "Confirmed", "Shipped", "Delivered", "Cancelled")
    .required(),
  shopNote: Joi.string().allow("").max(500).optional(),
});