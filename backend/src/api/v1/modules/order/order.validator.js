const Joi = require("joi");
const {
  VALIDATORS: V,
  applyPattern,
} = require("../../../../constants/validators");

exports.createOrder = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
    
        product: applyPattern(Joi.string().required(), V.MONGO_OBJECT_ID),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),

  shippingAddress: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),

    phone: applyPattern(Joi.string().required(), V.PHONE_VN),
    province: Joi.string().required(),
    ward: Joi.string().required(),
    addressDetails: Joi.string().required(),
  }).required(),

  paymentMethod: Joi.string().valid("COD", "Paypal").default("COD"),
  customerNote: Joi.string().allow("").max(500).optional(),
  shippingPrice: Joi.number().min(0).optional(),
});

exports.changeStatus = Joi.object({
  orderStatus: Joi.string()
    .valid("Pending", "Confirmed", "Shipped", "Delivered", "Cancelled")
    .required(),
  shopNote: Joi.string().allow("").max(500).optional(),
});
