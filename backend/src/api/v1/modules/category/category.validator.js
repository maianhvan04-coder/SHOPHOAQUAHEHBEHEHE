// category.validator.js
const Joi = require("joi");

exports.create = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().allow("").max(500).optional(),
  type: Joi.string().trim().valid("single", "mix").default("single"),
  isActive: Joi.boolean().optional(),
});

exports.update = Joi.object({
  name: Joi.string().trim().min(3).max(100).optional(),
  description: Joi.string().allow("").max(500).optional(),
  type: Joi.string().trim().valid("single", "mix").optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

exports.changeStatus = Joi.object({
  isActive: Joi.boolean().required(),
});
