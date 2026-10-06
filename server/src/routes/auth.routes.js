const express = require('express');
const router = express.Router();

const { signup, login, getMe, updateProfile } = require('../controllers/auth.controller');
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
