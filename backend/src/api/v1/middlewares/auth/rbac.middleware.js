const ApiError = require("../../../../core/ApiError");
const httpStatus = require("../../../../core/httpStatus");

// Role OR
exports.requireRole = (...roles) => (req, res, next) => {
  const userRoles = req.user?.roles;

  if (!Array.isArray(userRoles)) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthenticated"));
  }

  const ok = roles.some((r) => userRoles.includes(r));
  if (!ok) return next(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
  return next();
};

// Permission OR
exports.requireAnyPermission = (...permissions) => (req, res, next) => {
  const granted = req.user?.permissions;

  if (!Array.isArray(granted)) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthenticated"));
  }

  const ok = permissions.some((p) => granted.includes(p));
  if (!ok) return next(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
  return next();
};

// Permission AND
exports.requireAllPermissions = (...permissions) => (req, res, next) => {
  const granted = req.user?.permissions;

  if (!Array.isArray(granted)) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthenticated"));
  }

  const ok = permissions.every((p) => granted.includes(p));
  if (!ok) return next(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
  return next();
};
