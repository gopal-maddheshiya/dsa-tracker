const express = require('express');
const router = express.Router();
const {
  getCoachingNote,
  getAttemptTakeaway,
  getWeeklyReview,
} = require('../controllers/ai.controller');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

router.post('/coach', getCoachingNote);
router.post('/takeaway', getAttemptTakeaway);
router.post('/weekly-review', getWeeklyReview);

module.exports = router;
