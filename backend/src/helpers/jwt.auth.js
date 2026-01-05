const jwt = require("jsonwebtoken");
const ApiError = require("../core/apiError");
const httpStatus = require("../core/httpStatus");

const ACCESS_TOKEN_EXPIRES_IN = "15m";

exports.generateAccessToken = (user) => {
  return jwt.sign(
    { sub: String(user._id), role: user.role, type: "access" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

exports.signRefreshToken = ({ sub, sid, expiresIn }) => {
  return jwt.sign(
    { sub: String(sub), sid: String(sid), type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn } // seconds hoặc string
  );
};

exports.verifyAccessToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (payload?.type !== "access") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token không phải access");
    }
    return payload;
  } catch {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Access token không hợp lệ hoặc đã hết hạn"
    );
  }
};

exports.verifyRefreshToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (payload?.type !== "refresh") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token không phải refresh");
    }
    return payload;
  } catch {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Refresh token không hợp lệ hoặc đã hết hạn"
    );
  }
};
