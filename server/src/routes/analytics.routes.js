const express = require('express');
const {
  getSummary,
  getTopicAnalytics,
  getTrend,
  getHeatmap,
  getRevisionQueue,
} = require('../controllers/analytics.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// All analytics endpoints require authentication
router.use(requireAuth);

router.get('/summary', getSummary);
router.get('/topics', getTopicAnalytics);
router.get('/trend', getTrend);
router.get('/heatmap', getHeatmap);
router.get('/revision-queue', getRevisionQueue);

module.exports = router;
