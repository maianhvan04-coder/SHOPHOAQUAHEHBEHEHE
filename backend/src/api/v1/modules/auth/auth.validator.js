const Joi = require('joi')

const { VALIDATORS: V, applyPattern } = require("../../../../constants/validators");
module.exports.login = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: true } })
        .required(),
    //     .messages({
    //   "string.email": "Email không hợp lệ",
    //   "string.empty": "Email không được để trống",
    //   "any.required": "Email không được để trống",
    // }),

    password: Joi.string()
        .trim()
        .required()
    //     .messages({
    //   "string.empty": "Mật khẩu không được để trống",
    //   "any.required": "Mật khẩu không được để trống",
    // }),
})

module.exports.register = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.base": "Họ tên phải là chuỗi",
      "string.empty": "Họ tên không được để trống",
      "string.min": "Họ tên tối thiểu 2 ký tự",
      "string.max": "Họ tên tối đa 50 ký tự",
      "any.required": "Họ tên không được để trống",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .replace(/\s+/g, "") // ✅ sửa regex (bạn đang để string)
    .email({ tlds: { allow: true } })
    .required()
    .messages({
      "string.email": "Email không hợp lệ",
      "string.empty": "Email không được để trống",
      "any.required": "Email không được để trống",
    }),

  password: applyPattern(
    Joi.string()
      .trim()
      .min(8) // ✅ theo rule bạn yêu cầu
      .max(30)
      .required()
      .messages({
        "string.empty": "Mật khẩu không được để trống",
        "string.min": "Mật khẩu phải có ít nhất 8 ký tự",
        "string.max": "Mật khẩu tối đa 30 ký tự",
        "any.required": "Mật khẩu không được để trống",
      }),
    V.PASSWORD_STRONG,
    "Mật khẩu phải gồm ít nhất 8 ký tự, 1 chữ hoa, 1 số và 1 ký tự đặc biệt"
  ),
});

// ===== FORGOT PASSWORD =====
module.exports.forgotPassword = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .replace(/\s+/g, "")
    .email({ tlds: { allow: true } })
    .messages({
      "string.email": "Email không hợp lệ",
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{9,15}$/)
    .messages({
      "string.pattern.base": "Số điện thoại không hợp lệ",
    }),
})
  .or("email", "phone")
  .messages({
    "object.missing": "Vui lòng nhập email hoặc số điện thoại",
  });

// ===== RESET PASSWORD =====
module.exports.resetPassword = Joi.object({
  token: Joi.string().trim().required().messages({
    "string.empty": "Thiếu token đặt lại mật khẩu",
    "any.required": "Thiếu token đặt lại mật khẩu",
  }),

  newPassword: applyPattern(
    Joi.string()
      .trim()
      .min(8)
      .max(30)
      .required()
      .messages({
        "string.empty": "Mật khẩu mới không được để trống",
        "string.min": "Mật khẩu mới phải có ít nhất 8 ký tự",
        "string.max": "Mật khẩu mới tối đa 30 ký tự",
        "any.required": "Mật khẩu mới không được để trống",
      }),
    V.PASSWORD_STRONG,
    "Mật khẩu mới phải gồm ít nhất 8 ký tự, 1 chữ hoa, 1 số và 1 ký tự đặc biệt"
  ),

  confirmPassword: Joi.string()
    .trim()
    .required()
    .valid(Joi.ref("newPassword"))
    .messages({
      "string.empty": "Xác nhận mật khẩu không được để trống",
      "any.required": "Xác nhận mật khẩu không được để trống",
      "any.only": "Xác nhận mật khẩu không khớp",
    }),
});