const crypto = require("crypto");

// nên đặt env: REFRESH_PEPPER="some_long_random_secret"
const pepper = process.env.REFRESH_PEPPER || "dev_pepper_change_me";

exports.hashRefreshToken = (token) => {
  return crypto.createHmac("sha256", pepper).update(token).digest("hex");
};

exports.safeEqualHex = (hexA, hexB) => {
  const a = Buffer.from(hexA, "hex");
  const b = Buffer.from(hexB, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};
