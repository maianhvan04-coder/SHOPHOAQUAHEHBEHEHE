// src/api/v1/middlewares/auth/auth.middleware.js
const ApiError = require("../../../../core/apiError");
const httpStatus = require("../../../../core/httpStatus");
const { verifyAccessToken } = require("../../../../helpers/jwt.auth");

const User = require("../../modules/user/user.model");
const Session = require("../../modules/auth/session.model");
const authzCache = require("./authzCache");
const rbacService = require("../../modules/rbac/rbac.service");

exports.auth = async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Missing Bearer token"));
  }

  try {
    const token = header.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token); // { sub, sid, authzVersion, ... }

    const userId = payload?.sub;
    const sid = payload?.sid;

    if (!userId || !sid) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid token payload"));
    }

    // ✅ check session
    const session = await Session.findById(sid).select("_id userId expiresAt revokedAt").lean();
    if (!session) return next(new ApiError(httpStatus.UNAUTHORIZED, "Session not found"));
    if (session.revokedAt) return next(new ApiError(httpStatus.UNAUTHORIZED, "Session revoked"));
    if (session.expiresAt.getTime() < Date.now()) return next(new ApiError(httpStatus.UNAUTHORIZED, "Session expired"));
    if (String(session.userId) !== String(userId)) return next(new ApiError(httpStatus.UNAUTHORIZED, "Session mismatch"));

    // ✅ check user
    const u = await User.findById(userId).select("_id authzVersion isActive isDeleted").lean();
    if (!u || u.isDeleted) return next(new ApiError(httpStatus.UNAUTHORIZED, "User not found"));
    if (u.isActive === false) return next(new ApiError(httpStatus.UNAUTHORIZED, "User locked"));

    // ✅ revoke token khi authzVersion đổi
    const tokenV = Number(payload?.authzVersion ?? 0);
    const dbV = Number(u?.authzVersion ?? 0);
    if (tokenV !== dbV) return next(new ApiError(httpStatus.UNAUTHORIZED, "Token revoked"));

    // RBAC cache
    const cacheKey = `${userId}:${dbV}`;
    let authz = authzCache.get(cacheKey);
    if (!authz) {
      authz = await rbacService.buildAuthz(userId);
      if (!authz) return next(new ApiError(httpStatus.UNAUTHORIZED, "Authz not found"));
      authzCache.set(cacheKey, authz);
    }

    req.user = {
      sub: userId,
      sid,
      roles: authz.roles || [],
      permissions: authz.permissions || [],
      type: authz.type || "user",
      authzVersion: dbV,
    };

    return next();
  } catch {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Access token invalid/expired"));
  }
};
