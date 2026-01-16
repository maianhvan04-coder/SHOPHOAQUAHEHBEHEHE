const redis = require("../infra/redis/redis.client");

async function run() {
    await redis.del("login:block:ip:127.0.0.1");
    await redis.del("login:block:ip:::1");
    console.log("✅ Localhost unblocked");
    process.exit(0);
}

run();
