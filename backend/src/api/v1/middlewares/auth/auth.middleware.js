const ApiError = require("../../../../core/apiError");
const httpStatus = require("../../../../core/httpStatus");
const { verifyAccessToken } = require("../../../../helpers/jwt.auth");

const User = require("../../modules/user/user.model");
const authzCache = require("./authzCache");
const rbacService = require("../../modules/rbac/rbac.service");

exports.auth = async (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Missing Bearer token"));
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token); // đã check type=access ở helper

    const userId = payload.sub;
    if (!userId) return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid token payload"));

    const u = await User.findById(userId)
      .select("_id authzVersion isActive isDeleted")
      .lean();

    if (!u || u.isDeleted) return next(new ApiError(httpStatus.UNAUTHORIZED, "User not found"));
    if (u.isActive === false) return next(new ApiError(httpStatus.UNAUTHORIZED, "User locked"));

    const cacheKey = `${userId}:${u.authzVersion || 0}`;
    let authz = authzCache.get(cacheKey);

    if (!authz) {
      authz = await rbacService.buildAuthz(userId);
      if (!authz) return next(new ApiError(httpStatus.UNAUTHORIZED, "Authz not found"));
      authzCache.set(cacheKey, authz);
    }

    req.user = {
      sub: userId,
      roles: authz.roles || [],
      permissions: authz.permissions || [],
      type: authz.type || "user",
      authzVersion: u.authzVersion || 0,
    };

    return next();
  } catch {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Access token invalid/expired"));
  }
};
