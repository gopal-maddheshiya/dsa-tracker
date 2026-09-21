const express = require('express');
const router = express.Router();
const {
  getSyncStatus,
  connectPlatform,
  disconnectPlatform,
  syncPlatform,
  syncAllPlatforms,
} = require('../controllers/sync.controller');
const { protect } = require('../middleware/authMiddleware');

// All sync routes require authentication
router.use(protect);

router.get('/status', getSyncStatus);
router.post('/connect', connectPlatform);
router.post('/disconnect', disconnectPlatform);
router.post('/all', syncAllPlatforms);
router.post('/:platform', syncPlatform);

module.exports = router;
