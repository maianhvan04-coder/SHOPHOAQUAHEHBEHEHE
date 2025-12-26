require('dotenv').config(); 
const redis = require('redis');

if (!process.env.REDIS_HOST) {
    console.error("❌ LỖI: Không tìm thấy cấu hình trong file .env!");
    
}

console.log("🚀 Đang thử kết nối tới Redis Host:", process.env.REDIS_HOST);

const redisClient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT), 
        connectTimeout: 10000, 
    }
});

redisClient.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        console.error('❌ Kết nối bị từ chối. Kiểm tra lại Host/Port hoặc Internet!');
    } else {
        console.error('❌ Redis Error:', err.message);
    }
});

const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('✅ Đã kết nối tới Redis Cloud (Singapore)');
        }
    } catch (error) {
        console.error('❌ Lỗi khi thực hiện connect():', error.message);
    }
};

connectRedis();

module.exports = redisClient;