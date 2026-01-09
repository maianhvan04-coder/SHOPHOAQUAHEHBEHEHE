const VALIDATORS = {
  PASSWORD_STRONG: {
    // >=8, có HOA, có số, có ký tự đặc biệt, tối đa 30
    regex: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/,
    message:
      "Mật khẩu phải dài 8-30 ký tự, gồm ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@$!%*#?&)",
  },
  PHONE_VN: {
    regex: /^0\d{9}$/,
    message: "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)",
  },
  SLUG: {
    regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    message: "Slug chỉ gồm chữ thường, số và dấu gạch ngang",
  },
  COUPON_CODE: {
    regex: /^[A-Z0-9]{4,12}$/,
    message: "Mã giảm giá chỉ gồm chữ in hoa và số (4-12 ký tự)",
  },
  MONGO_OBJECT_ID: {
    regex: /^[0-9a-fA-F]{24}$/,
    message: "ID không hợp lệ",
  },
};

// helper: tự gắn pattern + message
const applyPattern = (joiString, rule) =>
  joiString.pattern(rule.regex).messages({
    "string.pattern.base": rule.message,
  });

module.exports = { VALIDATORS, applyPattern };
