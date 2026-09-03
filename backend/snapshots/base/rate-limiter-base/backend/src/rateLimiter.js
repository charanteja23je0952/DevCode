export function createRateLimiter({ limit, windowMs, now = () => Date.now() }) {
  const requests = new Map();

  return function check(key) {
    const currentTime = now();
    const cutoff = currentTime - windowMs;

    const timestamps = (requests.get(key) || []).filter(
      (timestamp) => timestamp > cutoff
    );

    if (timestamps.length >= limit) {
      requests.set(key, timestamps);

      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, timestamps[0] + windowMs - currentTime)
      };
    }

    timestamps.push(currentTime);
    requests.set(key, timestamps);

    return {
      allowed: true,
      remaining: Math.max(0, limit - timestamps.length),
      retryAfterMs: 0
    };
  };
}
