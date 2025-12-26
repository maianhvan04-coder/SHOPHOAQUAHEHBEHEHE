const ApiError = require("../../../../core/ApiError");
const httpStatus = require("../../../../core/httpStatus");
const { verifyAccessToken } = require("../../../../helpers/jwt.auth");

const User = require("../../modules/user/user.model");
const authzCache = require("./authzCache");
const rbacService = require("../../modules/rbac/rbac.service");

exports.auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Cấm truy cập 1"));
  }

  try {
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (payload.type && payload.type !== "access") {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Cấm truy cập 2"));
    }



    const userId = payload.sub;
    if (!userId) return next(new ApiError(httpStatus.UNAUTHORIZED, "Cấm truy cập 3"));


    // lấy authzVersion để build cacheKey
    const u = await User.findById(userId)
      .select("_id authzVersion isActive isDeleted")
      .lean();


    if (!u || u.isDeleted || u.isActive === false) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Cấm truy cập 4"));
    }

    const cacheKey = `${userId}:${u.authzVersion || 0}`;

    // console.log("userId", userId)
    let authz = authzCache.get(cacheKey);

    if (!authz) {

      authz = await rbacService.buildAuthz(userId);

      if (!authz) return next(new ApiError(httpStatus.UNAUTHORIZED, "Cấm truy cập 5"));
      authzCache.set(cacheKey, authz);
    }


    req.user = {
      sub: userId,
      roles: authz.roles,
      permissions: authz.permissions,
      type: authz.type,
    };


    return next();
  } catch (e) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Cấm truy cập 6"));
  }
};
