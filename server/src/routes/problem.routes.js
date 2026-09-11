const express = require('express');
const router = express.Router();
const {
  getProblems,
  createProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
  importProblems,
} = require('../controllers/problem.controller');
const attemptRoutes = require('./attempt.routes');
const { protect } = require('../middleware/authMiddleware');

// All problem routes require authentication
router.use(protect);

// Nested attempts route: /api/problems/:id/attempts
router.use('/:id/attempts', attemptRoutes);

router.route('/')
  .get(getProblems)
  .post(createProblem);

// Bulk import endpoint (must be before /:id)
router.post('/import', importProblems);

router.route('/:id')
  .get(getProblemById)
  .put(updateProblem)
  .delete(deleteProblem);

module.exports = router;
