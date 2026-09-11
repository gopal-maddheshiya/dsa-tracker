/**
 * High-performance sliding-window in-memory rate limiter middleware.
 * Protects auth endpoints against credential stuffing and brute-force attacks.
 */
const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 20, // Max requests per window
  message = 'Too many requests from this IP address. Please try again later.',
} = {}) => {
  const hits = new Map();

  // Periodic garbage collection every 5 minutes to prevent memory growth
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (now - record.startTime > windowMs) {
        hits.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref(); // .unref() so it doesn't block server shutdown/tests

  return (req, res, next) => {
    // Determine client IP
    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    let record = hits.get(clientIp);

    if (!record || now - record.startTime > windowMs) {
      record = {
        count: 1,
        startTime: now,
      };
      hits.set(clientIp, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetTime = Math.ceil((record.startTime + windowMs) / 1000);

    // Standard rate limit headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetTime);

    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((record.startTime + windowMs - now) / 1000));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
};

module.exports = { createRateLimiter };
