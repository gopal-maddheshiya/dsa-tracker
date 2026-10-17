const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth.middleware');
const {
  createAttempt,
  getAttempts,
  updateAttempt,
  deleteAttempt,
} = require('../controllers/attempt.controller');

// All attempt routes require authentication
router.use(requireAuth);

router.route('/')
  .post(createAttempt)
  .get(getAttempts);

router.route('/:attemptId')
  .put(updateAttempt)
  .delete(deleteAttempt);

module.exports = router;
