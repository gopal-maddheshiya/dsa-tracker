const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth.middleware');
const {
  createAttempt,
  getAttempts,
} = require('../controllers/attempt.controller');

// All attempt routes require authentication
router.use(requireAuth);

router.route('/')
  .post(createAttempt)
  .get(getAttempts);

module.exports = router;
