// src/api/v1/modules/auth/auth.service.js
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

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
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const remainingSec = (expiresAt) => {
  const sec = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  return Math.max(1, sec);
};

const buildLoginResult = async (user, req) => {
  const authz = await rbacService.buildAuthz(user._id);
  console.log(authz)
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
  //  tìm auth provider local

  const auth = await authRepo.findLocalAuthByEmail(email);

  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Sai Email hoặc mật khẩu");
  }

  //  so sánh password
  const ok = await comparePassword(password, auth.passwordHash);
  if (!ok) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Sai Email hoặc mật khẩu");
  }

  // load user
  const user = await authRepo.findUserById(auth.userId);
  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");
  }

  return buildLoginResult(user, req);
};

// ===== GOOGLE LOGIN SERVICE =====
exports.googleLogin = async ({ credential }, req) => {
  if (!credential) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Thiếu Google credential");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { sub: googleId, email, name, picture } = ticket.getPayload();
  if (!email) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Google account không có email");
  }

  // 1️⃣ tìm google auth
  let auth = await authRepo.findGoogleAuthByProviderId(googleId);
  let user;

  if (auth) {
    user = await userRepo.findById(auth.userId);
  } else {
    // 2️⃣ tìm user theo email
    user = await userRepo.findByEmail(email);

    if (!user) {
      user = await userRepo.createOne({
        email,
        fullName: name,
        emailVerified: true,
        image: { url: picture || "" },
      });
    }

    if (user.emailVerified === false) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Email chưa được xác thực"
      );
    }

    await authRepo.createAuthProvider({
      userId: user._id,
      provider: "google",
      providerId: googleId,
      email,
    });
  }

  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  }
  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");
  }

  // ✅ CHỈ DÙNG CHUNG HÀM NÀY
  return buildLoginResult(user, req);
};




// REGISTER
exports.register = async ({ fullName, email, password }, req) => {
  let user = await authRepo.findUserByEmail(email);
  if (user && !user.isDeleted) {
    throw new ApiError(httpStatus.CONFLICT, "Email đã tồn tại");
  }

  const passwordHash = await hashPassword(password);

  if (!user) {
    user = await authRepo.createUser({
      fullName,
      email,
      isActive: true,
      isDeleted: false,
    });
  } else {
    user.fullName = fullName;
    user.isDeleted = false;
    user.isActive = true;
    await user.save();
  }

  await authRepo.createAuthProvider({
    userId: user._id,
    provider: "local",
    providerId: email,
    email,
    passwordHash,
  });

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
      type: user.type,
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

  const user = await authRepo.findUserById(payload.sub);
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
  const user = await authRepo.findUserByEmail(email);
  if (!user || user.isDeleted || !user.isActive) return { ok: true };

  const auth = await authRepo.findLocalAuthByEmail(email);
  if (!auth) return { ok: true }; // Google user → bỏ qua

  const rawToken = crypto.randomBytes(32).toString("hex");

  auth.passwordResetTokenHash = sha256(rawToken);
  auth.passwordResetExpires = new Date(Date.now() + RESET_MS);
  await auth.save();

  const resetUrl = `${baseClientUrl()}/reset-password?token=${rawToken}`;
  await sendResetPasswordEmail({ to: email, resetUrl });

  return { ok: true };
};


// ===== RESET PASSWORD =====
exports.resetPassword = async (token, newPassword) => {
  const tokenHash = sha256(token);

  const auth = await authRepo.findLocalByResetTokenHash(tokenHash);
  if (!auth) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Token không hợp lệ hoặc đã hết hạn",
      "INVALID_RESET_TOKEN"
    );
  }

  const user = await authRepo.findUserById(auth.userId);
  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  }

  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");
  }

  // cập nhật password
  auth.passwordHash = await hashPassword(newPassword);
  auth.passwordResetTokenHash = null;
  auth.passwordResetExpires = null;
  await auth.save();

  // revoke tất cả session
  await Session.updateMany(
    { userId: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );

  // bump authzVersion
  user.authzVersion = (user.authzVersion || 0) + 1;
  await user.save();

  return { ok: true };
};

