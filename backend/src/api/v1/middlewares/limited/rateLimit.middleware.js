const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 15,                  // tối đa 15 lần/10 phút/IP
  message: {
    error: { message: "Bạn thử đăng nhập quá nhiều lần. Vui lòng thử lại sau." }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
