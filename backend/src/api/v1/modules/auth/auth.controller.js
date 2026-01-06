// src/api/v1/modules/auth/auth.controller.js
const asyncHandler = require("../../../../core/asyncHandler");
const authService = require("./auth.service");

const COOKIE_PATH = "/api/v1/auth"; // ✅ rộng
const isProd = process.env.NODE_ENV === "production";

function setRefreshCookie(res, refreshToken, maxAgeMs) {
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: Math.max(0, maxAgeMs),
  });
}

module.exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req);
  setRefreshCookie(res, result.refreshToken, 7 * 24 * 60 * 60 * 1000);

  delete result.refreshToken;
  res.json({ data: result });
});

module.exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, req);
  setRefreshCookie(res, result.refreshToken, 7 * 24 * 60 * 60 * 1000);

  delete result.refreshToken;
  res.json({ data: result });
});

module.exports.refreshToken = asyncHandler(async (req, res) => {
  const { accessToken, newRefreshToken, session } = await authService.refreshToken(req);

  const remainingMs = Math.max(0, session.expiresAt.getTime() - Date.now());
  setRefreshCookie(res, newRefreshToken, remainingMs);

  return res.status(200).json({ accessToken });
});

module.exports.me = asyncHandler(async (req, res) => {
  const userId = req.user?.sub;
  const data = await authService.getMe(userId, req.user);
  res.json({ data });
});

module.exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req);

  // ✅ clear cookie theo path đang set
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: COOKIE_PATH,
  });

  // (tuỳ chọn) dọn cookie cũ nếu trước đây bạn set path khác
  res.clearCookie("refresh_token", { path: "/api/v1/auth/refresh-token" });
  res.clearCookie("refresh_token", { path: "/" });

  return res.status(200).json({ message: "Logout thành công" });
});
