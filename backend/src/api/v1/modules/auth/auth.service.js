// src/api/v1/modules/auth/auth.service.js
const crypto = require("crypto");

const ApiError = require("../../../../core/apiError");
const httpStatus = require("../../../../core/httpStatus");

const authRepo = require("./auth.repo");
const userRepo = require("../user/user.repo");
const rbacService = require("../rbac/rbac.service");

const { hashPassword, comparePassword } = require("../../../../helpers/password.auth");
const { generateAccessToken, signRefreshToken, verifyRefreshToken } = require("../../../../helpers/jwt.auth");
const { hashRefreshToken, safeEqualHex } = require("../../../../helpers/tokenHash");
const { sendResetPasswordEmail } = require("../../../../helpers/mailer");


const Session = require("./session.model");

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_SEC = Math.floor(SESSION_MS / 1000);

const remainingSec = (expiresAt) => {
  const sec = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  return Math.max(1, sec);
};

const buildLoginResult = async (user, req) => {
  const authz = await rbacService.buildAuthz(user._id);

  const expiresAt = new Date(Date.now() + SESSION_MS);

  // ✅ tạo session trước
  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: "temp",
    expiresAt,
    userAgent: req.headers["user-agent"] || "",
    ip: req.ip || "",
  });

  const refreshToken = signRefreshToken({
    sub: user._id,
    sid: session._id,
    expiresIn: SESSION_SEC,
  });

  session.refreshTokenHash = hashRefreshToken(refreshToken);
  await session.save();

  // ✅ access token có sid
  const accessToken = generateAccessToken(user, session._id);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      type: authz?.type || "user",
      avatar: user.image?.url || "",
      avatar_hash: user.image?.publicId || "",
    },
    roles: authz?.roles || [],
    permissions: authz?.permissions || [],
    version: user.authzVersion || 0,
    accessToken,
    refreshToken,
  };
};

// LOGIN
exports.login = async ({ email, password }, req) => {
  const user = await authRepo.findByEmailForLogin(email);
  if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, "Sai Email hoặc mật khẩu");

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw new ApiError(httpStatus.UNAUTHORIZED, "Sai Email hoặc mật khẩu");

  if (user.isDeleted) throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  if (user.isActive === false) throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");

  return buildLoginResult(user, req);
};

// REGISTER
exports.register = async ({ fullName, email, password }, req) => {
  const existing = await authRepo.findAnyByEmail(email);
  if (existing && !existing.isDeleted) throw new ApiError(httpStatus.CONFLICT, "Email đã tồn tại");

  const passwordHash = await hashPassword(password);

  let user;
  if (existing && existing.isDeleted) {
    existing.fullName = fullName;
    existing.passwordHash = passwordHash;
    existing.isDeleted = false;
    existing.isActive = true;
    user = await existing.save();
  } else {
    user = await authRepo.createUser({ fullName, email, passwordHash });
  }

  return buildLoginResult(user, req);
};

// ME
exports.getMe = async (userId, authz) => {
  const user = await userRepo.findPublicById(userId);
  if (!user || user.isDeleted) throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  if (user.isActive === false) throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      image: user.image || null,
      isActive: user.isActive,
      authzVersion: user.authzVersion || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    roles: authz?.roles || [],
    permissions: authz?.permissions || [],
  };
};

// REFRESH
exports.refreshToken = async (req) => {
  const raw = req.cookies?.refresh_token;
  if (!raw) throw new ApiError(httpStatus.UNAUTHORIZED, "Không có refresh token");

  const payload = verifyRefreshToken(raw); // { sub, sid }

  const session = await Session.findById(payload.sid);
  if (!session) throw new ApiError(httpStatus.UNAUTHORIZED, "Session không tồn tại");
  if (session.revokedAt) throw new ApiError(httpStatus.UNAUTHORIZED, "Session bị thu hồi");
  if (session.expiresAt.getTime() < Date.now()) throw new ApiError(httpStatus.UNAUTHORIZED, "Session hết hạn");

  if (String(session.userId) !== String(payload.sub)) {
    session.revokedAt = new Date();
    await session.save();
    throw new ApiError(httpStatus.UNAUTHORIZED, "Session mismatch");
  }

  const incomingHash = hashRefreshToken(raw);
  const ok = safeEqualHex(session.refreshTokenHash, incomingHash);

  if (!ok) {
    await Session.updateMany({ userId: session.userId, revokedAt: null }, { revokedAt: new Date() });
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token reuse detected");
  }

  const user = await authRepo.findById(payload.sub);
  if (!user || user.isDeleted) throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  if (user.isActive === false) throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");

  // ✅ access token có sid
  const accessToken = generateAccessToken(user, session._id);

  const newRefreshToken = signRefreshToken({
    sub: user._id,
    sid: session._id,
    expiresIn: remainingSec(session.expiresAt),
  });

  session.refreshTokenHash = hashRefreshToken(newRefreshToken);
  session.lastUsedAt = new Date();
  await session.save();

  return { accessToken, newRefreshToken, session };
};

// ✅ LOGOUT theo CÁCH A: xoá session theo sid trong access token
exports.logout = async (req) => {
  const sid = req.user?.sid;
  if (sid) {
    await Session.findByIdAndDelete(sid);
    return { ok: true };
  }
  return { ok: true };
};

const RESET_MS = 15 * 60 * 1000;
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// // TODO: thay bằng nodemailer/resend
// async function sendResetEmail({ toEmail, resetUrl }) {
//   console.log("RESET URL:", resetUrl, "=> send to", toEmail);
// }

// ===== FORGOT PASSWORD =====
const baseClientUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

exports.forgotPassword = async (email) => {
  const user = await authRepo.findAnyByEmail(email);
  // ✅ luôn return ok để không lộ email tồn tại
  if (!user || user.isDeleted) return { ok: true };
  if (user.isActive === false) return { ok: true };

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetTokenHash = sha256(rawToken);
  user.passwordResetExpires = new Date(Date.now() + RESET_MS);
  await user.save();

  const resetUrl = `${baseClientUrl()}/reset-password?token=${rawToken}`;

  // ✅ gửi mail thật
  await sendResetPasswordEmail({ to: user.email, resetUrl });

  return { ok: true };
};

// ===== RESET PASSWORD =====
// ✅ đúng theo controller gọi: resetPassword(token, newPassword)
exports.resetPassword = async (token, newPassword) => {
  const tokenHash = sha256(token);

  const user = await authRepo.findByResetTokenHash(tokenHash);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Token không hợp lệ hoặc đã hết hạn", "INVALID_RESET_TOKEN");
  }
  if (user.isDeleted) throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  if (user.isActive === false) throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");

  // ✅ cập nhật mật khẩu
  user.passwordHash = await hashPassword(newPassword);

  // ✅ tăng version để access token cũ die (nếu auth middleware check)
  user.authzVersion = (user.authzVersion || 0) + 1;

  // ✅ clear reset token
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;

  await user.save();

  // ✅ revoke toàn bộ session (logout mọi thiết bị)
  await Session.updateMany(
    { userId: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );

  return { ok: true };
};
