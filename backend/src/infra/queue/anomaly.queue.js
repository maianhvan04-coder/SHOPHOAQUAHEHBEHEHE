const { Queue } = require("bullmq");
const redis = require("../redis/redis.client");

const anomalyQueue = new Queue("login-anomaly", {
    connection: redis,
});

exports.enqueueLoginAnomaly = (payload) =>
    anomalyQueue.add("analyze", payload, {
        removeOnComplete: true,
        attempts: 3,
    });
