const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const {
  getProblems,
  createProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require('../controllers/problem.controller');
const attemptRoutes = require('./attempt.routes');

// All problem routes require authentication
router.use(requireAuth);

router.route('/')
  .get(getProblems)
  .post(createProblem);

router.route('/:id')
  .get(getProblemById)
  .put(updateProblem)
  .delete(deleteProblem);

// Nested routes: /api/problems/:id/attempts
router.use('/:id/attempts', attemptRoutes);

module.exports = router;
