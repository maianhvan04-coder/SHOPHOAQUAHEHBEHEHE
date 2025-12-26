const slowDown = require("express-slow-down");

exports.loginSlowDown = slowDown({
  windowMs: 10 * 60 * 1000, // 10 phút
  delayAfter: 5,            // sau 5 lần / 10 phút bắt đầu delay
  delayMs: () => 500,       // mỗi lần sau đó chậm thêm 500ms
  maxDelayMs: 10_000,       // delay tối đa 10s
});
