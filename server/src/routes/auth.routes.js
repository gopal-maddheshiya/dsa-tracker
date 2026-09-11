const express = require('express');
const router = express.Router();
const { signup, login, googleAuth, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Rate limiter for authentication endpoints (25 requests per 15 minutes per IP)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.get('/me', protect, getMe);

module.exports = router;
