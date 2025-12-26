const { auth } = require("./auth.middleware");
const {
    requireRole,
    requireAnyPermission,
    requireAllPermissions,
} = require("./rbac.middleware");

/**
 * guard({ roles: [], any: [], all: [] })
 * - roles: role OR (có 1 trong roles là pass)
 * - any: permission OR
 * - all: permission AND
 */
function guard(options = {}) {
    const m = [auth];

    if (options.roles?.length) m.push(requireRole(...options.roles));
    if (options.any?.length) m.push(requireAnyPermission(...options.any));
    if (options.all?.length) m.push(requireAllPermissions(...options.all));

    return m;
}

module.exports = { guard };
