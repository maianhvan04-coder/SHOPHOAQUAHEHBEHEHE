// src/api/v1/modules/auth/auth.controller.js
const asyncHandler = require("../../../../core/asyncHandler");
const authService = require("./auth.service");
const { OAuth2Client } = require("google-auth-library");
const {
  generateAccessToken,
  signRefreshToken,
} = require("../../../../helpers/jwt.auth");
const COOKIE_PATH = "/api/v1/auth";
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

exports.googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Thiếu Google credential");
    }

    // 1️⃣ Verify token từ Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      picture,
    } = payload;

    if (!email) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Google account không có email");
    }

    // 2️⃣ Tìm user theo email
    let user = await User.findOne({ email });

    // 3️⃣ Chưa có user → tạo mới
    if (!user) {
      user = await User.create({
        email,
        fullName: name,
        googleId,
        provider: "google",
        passwordHash: null,
        image: {
          url: picture || "",
        },
      });
    }

    // 4️⃣ Có user local → link Google
    if (user.provider === "local") {
      user.googleId = googleId;
      user.provider = "google";
      if (!user.image?.url && picture) {
        user.image = { url: picture };
      }
      await user.save();
    }

    // 5️⃣ Kiểm tra trạng thái user
    if (user.isDeleted) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
    }

    if (user.isActive === false) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");
    }

    // 6️⃣ Generate JWT
    const sid = Date.now(); // hoặc uuid
    const accessToken = generateAccessToken(user, sid);
    const refreshToken = signRefreshToken({
      sub: user._id,
      sid,
      expiresIn: "7d",
    });

    return res.json({
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          image: user.image?.url,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

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
  console.log(data)
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

module.exports.forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);

  // ✅ luôn trả chung để tránh lộ email tồn tại hay không
  res.json({
    data: { message: "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." },
  });
});

module.exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  await authService.resetPassword(token, newPassword);

  // ✅ nếu user đang có refresh cookie (trên device này) thì clear luôn
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: COOKIE_PATH,
  });

  // tuỳ chọn: dọn các path cũ
  res.clearCookie("refresh_token", { path: "/api/v1/auth/refresh-token" });
  res.clearCookie("refresh_token", { path: "/" });

  res.json({ data: { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." } });
});
