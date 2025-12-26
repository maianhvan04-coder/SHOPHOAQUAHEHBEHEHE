const rateLimit = require("./rateLimit.middleware");
const slowLimit = require("./slowDown.middleware");

module.exports = {
  loginLimiter:rateLimit.loginLimiter,
  loginSlowDown:slowLimit.loginSlowDown
};
