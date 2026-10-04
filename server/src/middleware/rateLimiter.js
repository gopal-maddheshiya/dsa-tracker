/**
 * Lightweight In-Memory Rate Limiting Middleware
 * Zero external dependencies. Enforces request limits per IP over a sliding window.
 * Automatically bypassed during automated test runs (NODE_ENV === 'test').
 */

/**
 * Creates an in-memory rate limiting middleware
 * @param {Object} options
 * @param {number} [options.windowMs=900000] - Window duration in milliseconds (default: 15 minutes)
 * @param {number} [options.max=30] - Max requests allowed per window per IP
 * @param {string} [options.message='Too many requests. Please try again later.'] - Error message on 429
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 mins default
  const max = options.max || 30;
  const message = options.message || 'Too many authentication attempts. Please try again later.';

  // Map of ip -> Array<timestamp>
  const hits = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, valid);
      }
    }
  }, 5 * 60 * 1000);

  // Allow Node process to exit even if timer is active
  if (interval.unref) {
    interval.unref();
  }

  return (req, res, next) => {
    // 1. Bypass during test execution to ensure fast, deterministic tests
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const timestamps = hits.get(ip) || [];
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= max) {
      const retryAfterSec = Math.ceil((validTimestamps[0] + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec > 0 ? retryAfterSec : 1);
      return res.status(429).json({
        success: false,
        message,
      });
    }

    validTimestamps.push(now);
    hits.set(ip, validTimestamps);
    next();
  };
};

// Default rate limiter for sensitive authentication endpoints (30 attempts / 15 mins)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

module.exports = {
  createRateLimiter,
  authLimiter,
};
