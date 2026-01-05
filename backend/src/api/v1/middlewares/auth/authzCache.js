const cache = new Map();

const DEFAULT_TTL_MS = 60 * 1000;
const MAX_SIZE = 5000;
const CLEANUP_INTERVAL_MS = 30 * 1000;

const now = () => Date.now();

function pruneExpired() {
  const t = now();
  for (const [k, v] of cache) {
    if (t > v.exp) cache.delete(k);
  }
}

setInterval(pruneExpired, CLEANUP_INTERVAL_MS).unref?.();

exports.get = (key) => {
  const hit = cache.get(key);
  if (!hit) return null;

  if (now() > hit.exp) {
    cache.delete(key);
    return null;
  }
  return hit.data;
};

exports.set = (key, data, ttlMs = DEFAULT_TTL_MS) => {
  if (cache.size >= MAX_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, { data, exp: now() + ttlMs });
};

exports.del = (key) => cache.delete(key);
exports.clear = () => cache.clear();
exports.size = () => cache.size;
