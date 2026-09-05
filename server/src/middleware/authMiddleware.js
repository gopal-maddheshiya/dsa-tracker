const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protects routes by requiring and validating a valid Bearer JWT token
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token missing',
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server authentication configuration error',
      });
    }

    const decoded = jwt.verify(token, secret);

    // Fetch user without passwordHash
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // Return safe 401 response without leaking library/stack details
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired',
    });
  }
};

module.exports = { protect };
