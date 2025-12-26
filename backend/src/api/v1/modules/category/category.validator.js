const Joi = require("joi")
const { VALIDATORS: V, applyPattern } = require("../../../../constants/validators");
exports.create = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    slug: applyPattern(
        Joi.string().trim().allow("").optional(),
        V.SLUG
    ),
    description: Joi.string().allow("").max(500).optional(),
    isActive: Joi.boolean().optional(),
});


exports.update = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    slug: applyPattern(Joi.string()
        .trim()
        .min(6)
        .max(30)

        .required()
        , V.SLUG),
    description: Joi.string().allow("").max(500).optional(),
    isActive: Joi.boolean().optional(),
})

exports.changeStatus = Joi.object({
    isActive: Joi.boolean().required(),
});