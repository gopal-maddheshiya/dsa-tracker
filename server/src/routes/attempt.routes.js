const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createAttempt,
  getAttemptsForProblem,
} = require('../controllers/attempt.controller');
const { protect } = require('../middleware/authMiddleware');

// All attempt routes require authentication
router.use(protect);

router.route('/')
  .post(createAttempt)
  .get(getAttemptsForProblem);

module.exports = router;
