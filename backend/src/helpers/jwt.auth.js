const jwt = require("jsonwebtoken");
const ApiError = require("../core/apiError");
const httpStatus = require("../core/httpStatus");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
/**
 * Generate access token
 */
exports.generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

/**
 * Generate refresh token
 */
exports.signRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

/**
 * Verify access token
 */
exports.verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Access token không hợp lệ hoặc đã hết hạn"
    );
  }
};

/**
 * Verify refresh token
 */
exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Refresh token không hợp lệ hoặc đã hết hạn"
    );
  }
};
