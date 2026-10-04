const jwt = require('jsonwebtoken');

/**
 * Retrieves the JWT secret from environment variables.
 * Throws a descriptive error if missing to prevent insecure operation.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }
  return secret;
};

/**
 * Generates a signed JWT for an authenticated user.
 * @param {string|mongoose.Types.ObjectId} userId - User identifier
 * @param {string} expiresIn - Token expiration window (defaults to 7 days)
 * @returns {string} Signed JWT
 */
const generateToken = (userId, expiresIn = '7d') => {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      userId: userId.toString(),
    },
    secret,
    {
      expiresIn,
    }
  );
};

/**
 * Verifies a JWT and returns the decoded payload.
 * Throws if the token is invalid or expired.
 * @param {string} token - Bearer JWT string
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
