/**
 * Standard HTTP Security Headers Middleware
 * Protects against XSS, clickjacking, MIME-sniffing, and server fingerprinting.
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking / frame embedding
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS protection filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Restrict referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Strip Express fingerprinting
  res.removeHeader('X-Powered-By');

  next();
};

module.exports = { securityHeaders };
