module.exports = {
    redis: require("./redis/redis.client"),
    queue: require("./queue/anomaly.queue"),
    geo: require("./geo/geo.service"),
    rateLimit: require("./rate-limit/rate-limit.service"),
};
