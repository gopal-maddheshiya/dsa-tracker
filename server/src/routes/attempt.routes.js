const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createAttempt,
  getAttemptsForProblem,
  updateAttempt,
  deleteAttempt,
} = require('../controllers/attempt.controller');
const { protect } = require('../middleware/authMiddleware');

// All attempt routes require authentication
router.use(protect);

router.route('/')
  .post(createAttempt)
  .get(getAttemptsForProblem);

router.route('/:attemptId')
  .put(updateAttempt)
  .delete(deleteAttempt);

module.exports = router;
