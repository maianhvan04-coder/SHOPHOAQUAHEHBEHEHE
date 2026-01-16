const redis = require("../redis/redis.client");

exports.incrWithTTL = async (key, ttlSeconds) => {
    const count = await redis.incr(key);
    if (count === 1) {
        await redis.expire(key, ttlSeconds);
    }
    return count;
};

exports.isBlocked = async (blockKey) => {
    return Boolean(await redis.get(blockKey));
};

exports.block = async (blockKey, seconds) => {
    await redis.set(blockKey, "1", "EX", seconds);
};
