const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT containing user ID
 * @param {string} userId - Mongoose user _id
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
