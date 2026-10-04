const { verifyToken } = require('../utils/token');

/**
 * Authentication Middleware
 * Validates incoming HTTP requests containing a Bearer token in the Authorization header.
 * Attaches decoded user identity ({ userId }) to req.user on success.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Bearer token missing or malformed',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token || !token.trim()) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Token missing after Bearer scheme',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
};

module.exports = {
  requireAuth,
};
