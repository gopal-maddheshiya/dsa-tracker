const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  googleAuth,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getUserGoals,
  updateUserGoals,
} = require('../controllers/auth.controller');
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
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Target goals & practice countdown routes
router.get('/goals', protect, getUserGoals);
router.put('/goals', protect, updateUserGoals);

module.exports = router;
