const { auth } = require("./auth.middleware");
const { guard } = require("./guard");
const {
    requireRole,
    requireAnyPermission,
    requireAllPermissions,
} = require("./rbac.middleware");

module.exports = {
    auth,
    guard,
    requireRole,
    requireAnyPermission,
    requireAllPermissions,
};
