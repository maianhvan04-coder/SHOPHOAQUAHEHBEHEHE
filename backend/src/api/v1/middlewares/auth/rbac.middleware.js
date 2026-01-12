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
exports.requireAnyPermission = (...permissionKeys) => (req, res, next) => {
  const perms = req.user?.permissions;
  if (!perms || typeof perms !== "object") {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthenticated"));
  }

  const matchedKey = permissionKeys.find((k) => perms[k])

  // console.log("NEED:", permissions);
  // console.log("HAVE:", req.user?.permissions);
  // console.log("ROLES:", req.user?.roles);


  if (!matchedKey) {
    return next(
      new ApiError(httpStatus.FORBIDDEN, "Forbidden")
    );
  }
  // gắn authz cho controller nếu cần
  req.authz = perms[matchedKey];

  return next();
};


// Permission AND
exports.requireAllPermissions = (...permissionKeys) => (req, res, next) => {
  const perms = req.user?.permissions;

  if (!perms || typeof perms !== "object") {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthenticated"));
  }

  const ok = permissionKeys.every((p) => perms[p]);
  if (!ok) return next(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
  return next();
};

// middlewares/auth/requirePermission.js
exports.requirePermission = (permissionKey) => {
  return (req, res, next) => {
    const perms = req.user?.permissions;

    if (!perms || !perms[permissionKey]) {
      return next(
        new ApiError(httpStatus.FORBIDDEN, "Forbidden")
      );
    }

    // gắn scope cho controller
    req.authz = perms[permissionKey];
    next();
  };
};

