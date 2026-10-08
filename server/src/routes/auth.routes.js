const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', authLimiter, signup);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return token
 * @access  Public
 */
router.post('/login', authLimiter, login);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google ID token
 * @access  Public
 */
router.post('/google', authLimiter, googleLogin);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Initiate password reset
 * @access  Public
 */
router.post('/forgot-password', authLimiter, forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using recovery token
 * @access  Public
 */
router.post('/reset-password', authLimiter, resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get('/me', requireAuth, getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile or credentials
 * @access  Private
 */
router.put('/profile', requireAuth, updateProfile);

module.exports = router;

