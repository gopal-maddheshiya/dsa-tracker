const express = require('express');
const router = express.Router();
const {
  getSummary,
  getTopics,
  getTrend,
  getHeatmap,
  getRevisionQueue,
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(protect);

router.get('/summary', getSummary);
router.get('/topics', getTopics);
router.get('/trend', getTrend);
router.get('/heatmap', getHeatmap);
router.get('/revision-queue', getRevisionQueue);

module.exports = router;
