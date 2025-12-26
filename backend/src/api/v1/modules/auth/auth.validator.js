const Joi = require('joi')

const { VALIDATORS: V, applyPattern } = require("../../../../constants/validators");
module.exports.login = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: true } })
        .required(),

    password: Joi.string()
        .trim()
        .required()


})

module.exports.register = Joi.object({
    fullName: Joi.string()
        .trim()
        .required()
        .min(2)
        .max(50)
        .messages({
            "string.base": "Họ tên phải là chuỗi",
            "string.empty": "Họ tên không được để trống",
            "string.min": "Họ tên tối thiểu 2 ký tự",
            "string.max": "Họ tên tối đa 50 ký tự",
            "any.required": "Họ tên không được để trống",
        })
    ,
    email: Joi.string()
        .trim()
        .lowercase()
        .replace("/\s+/g", "")
        .required()
        .email({ tlds: { allow: true } })
        .messages({
            "string.email": "Email không hợp lệ",
            "string.empty": "Email không được để trống",
            "any.required": "Email không được để trống",
        }),
    password: applyPattern(Joi.string()
        .trim()
        .min(6)
        .max(30)

        .required()
        , V.PASSWORD_STRONG)

})