const ApiError = require("../../../../core/apiError");

module.exports = function assertOwnership({
    scope,
    entity,
    userId,
    field = "createdBy",
}) {
    if (scope !== "own") return;

    if (!entity[field] || String(entity[field]) !== String(userId)) {
        throw new ApiError(403, "Forbidden (own scope)");
    }
};
