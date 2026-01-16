// src/api/v1/modules/security/security.middleware.js
const ApiError = require("../../../../core/apiError");
const asyncHandler = require("../../../../core/asyncHandler");
const { rateLimit } = require("../../../../infra");

exports.blockedIpGuard = asyncHandler(async (req, res, next) => {
    if (
        process.env.NODE_ENV === "development" &&
        (req.ip === "127.0.0.1" || req.ip === "::1")
    ) {
        return next();
    }

    const blockKey = `login:block:ip:${req.ip}`;

    const blocked = await rateLimit.isBlocked(blockKey);
    if (blocked) {
        throw new ApiError(429, "IP bị chặn tạm thời");
    }

    next();
});

