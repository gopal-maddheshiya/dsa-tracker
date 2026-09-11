const express = require('express');
const router = express.Router();
const { signup, login, googleAuth, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

module.exports = router;
