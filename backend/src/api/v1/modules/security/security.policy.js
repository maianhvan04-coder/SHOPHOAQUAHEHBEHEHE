const { rateLimit } = require("../../../../infra");

exports.handleLoginFail = async ({ userId, ip }) => {
    // 🔢 đếm fail theo IP (TTL 5 phút)
    const ipFailCount = await rateLimit.incrWithTTL(
        `login:fail:ip:${ip}`,
        300 // 5 phút
    );

    // 🔢 đếm fail theo user
    if (userId) {
        await rateLimit.incrWithTTL(
            `login:fail:user:${userId}`,
            300
        );
    }

    // 🚫 TEST: sai 3 lần → block IP
    if (ipFailCount >= 3) {
        await rateLimit.block(
            `login:block:ip:${ip}`,
            15 * 60 // block 15 phút
        );

        return {
            blocked: true,
            ipFailCount,
        };
    }

    return {
        blocked: false,
        ipFailCount,
    };
};
