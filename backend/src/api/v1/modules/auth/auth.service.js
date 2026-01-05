const ApiError = require("../../../../core/apiError");
const httpStatus = require("../../../../core/httpStatus");

const authRepo = require("./auth.repo");
const userRepo = require("../user/user.repo");
const rbacService = require("../rbac/rbac.service");

const { hashPassword, comparePassword } = require("../../../../helpers/password.auth");
const { generateAccessToken, signRefreshToken, verifyRefreshToken } = require("../../../../helpers/jwt.auth");
const { hashRefreshToken, safeEqualHex } = require("../../../../helpers/tokenHash");

const Session = require("./session.model");

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_SEC = Math.floor(SESSION_MS / 1000);

const remainingSec = (expiresAt) => {
  const sec = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  return Math.max(1, sec);
};

const buildLoginResult = async (user, req) => {
  const authz = await rbacService.buildAuthz(user._id);

  const accessToken = generateAccessToken(user);

  // fixed 7 ngày
  const expiresAt = new Date(Date.now() + SESSION_MS);

  // tạo session trước để lấy sid
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
    session,
  };
};

// ===== LOGIN =====
exports.login = async ({ email, password }, req) => {
  const user = await authRepo.findByEmailForLogin(email);
  if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, "Sai Email hoặc mật khẩu");

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw new ApiError(httpStatus.UNAUTHORIZED, "Sai Email hoặc mật khẩu");

  if (user.isDeleted) throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  if (user.isActive === false) throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");

  // Nếu muốn single-session: bật dòng này
  // await Session.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });

  const result = await buildLoginResult(user, req);
  return result;
};

// ===== REGISTER (auto-login) =====
exports.register = async ({ fullName, email, password }, req) => {
  const existing = await authRepo.findAnyByEmail(email);

  if (existing && !existing.isDeleted) {
    throw new ApiError(httpStatus.CONFLICT, "Email đã tồn tại");
  }

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

  const result = await buildLoginResult(user, req);
  return result;
};

// ===== GET ME =====
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

// ===== REFRESH TOKEN =====
exports.refreshToken = async (req) => {
  const raw = req.cookies?.refresh_token;
  if (!raw) throw new ApiError(httpStatus.UNAUTHORIZED, "Không có refresh token");

  const payload = verifyRefreshToken(raw); // { sub, sid, type, exp... }

  const session = await Session.findById(payload.sid);
  if (!session) throw new ApiError(httpStatus.UNAUTHORIZED, "Session không tồn tại");
  if (session.revokedAt) throw new ApiError(httpStatus.UNAUTHORIZED, "Session bị thu hồi");
  if (session.expiresAt.getTime() < Date.now()) throw new ApiError(httpStatus.UNAUTHORIZED, "Session hết hạn");

  if (String(session.userId) !== String(payload.sub)) {
    // mismatch sid/sub: revoke session
    session.revokedAt = new Date();
    await session.save();
    throw new ApiError(httpStatus.UNAUTHORIZED, "Session mismatch");
  }

  // So sánh hash an toàn
  const incomingHash = hashRefreshToken(raw);
  const ok = safeEqualHex(session.refreshTokenHash, incomingHash);

  if (!ok) {
    // REUSE DETECTED -> revoke ALL sessions của user
    await Session.updateMany(
      { userId: session.userId, revokedAt: null },
      { revokedAt: new Date() }
    );
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token reuse detected");
  }

  const user = await authRepo.findById(payload.sub);
  if (!user || user.isDeleted) throw new ApiError(httpStatus.UNAUTHORIZED, "User không tồn tại");
  if (user.isActive === false) throw new ApiError(httpStatus.UNAUTHORIZED, "Tài khoản bị khóa");

  const accessToken = generateAccessToken(user);

  // rotate refresh nhưng không gia hạn session
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

// ===== LOGOUT =====
exports.logout = async (req) => {
  const raw = req.cookies?.refresh_token;
  if (!raw) return { ok: true };

  try {
    const payload = verifyRefreshToken(raw);
    await Session.findByIdAndUpdate(payload.sid, { revokedAt: new Date() });
  } catch {
    // ignore
  }

  return { ok: true };
};
