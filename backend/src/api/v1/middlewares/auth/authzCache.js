const cache = new Map();
const TTL_MS = 60 * 1000;

exports.get = (key) => {
    const hit = cache.get(key);
    if (!hit) return null;
    if (Date.now() > hit.exp) {
        cache.delete(key);
        return null;
    }
    return hit.data;
};

exports.set = (key, data) => {
    cache.set(key, { data, exp: Date.now() + TTL_MS });
};
