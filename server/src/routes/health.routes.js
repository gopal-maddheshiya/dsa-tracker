const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    API health check status
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DSA Tracker API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
