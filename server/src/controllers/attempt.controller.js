const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');

const VALID_STATUSES = ['solved', 'struggled', 'revisit_needed'];

/**
 * @route   POST /api/problems/:id/attempts
 * @desc    Log a new attempt for a problem (strictly scoped to authenticated user)
 * @access  Private
 */
const createAttempt = async (req, res, next) => {
  try {
    const { id: problemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Verify problem exists and is owned by the requesting user
    const problem = await Problem.findOne({ _id: problemId, userId: req.user._id });
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const { status, timeTakenMinutes, notes, attemptedAt } = req.body;

    // Validate status
    if (!status || !VALID_STATUSES.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Status is required and must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    // Validate timeTakenMinutes (must not be negative)
    let parsedTime = null;
    if (timeTakenMinutes !== undefined && timeTakenMinutes !== null && timeTakenMinutes !== '') {
      parsedTime = Number(timeTakenMinutes);
      if (isNaN(parsedTime) || parsedTime < 0) {
        return res.status(400).json({
          success: false,
          message: 'Time taken in minutes must be a non-negative number',
        });
      }
    }

    // Validate attemptedAt date if supplied
    let parsedDate = Date.now();
    if (attemptedAt) {
      const d = new Date(attemptedAt);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'attemptedAt must be a valid date',
        });
      }
      parsedDate = d;
    }

    // Create attempt ensuring userId is taken solely from req.user
    const attempt = await Attempt.create({
      problemId: problem._id,
      userId: req.user._id,
      status: status.toLowerCase().trim(),
      timeTakenMinutes: parsedTime,
      notes: typeof notes === 'string' ? notes.trim() : '',
      attemptedAt: parsedDate,
    });

    return res.status(201).json({
      success: true,
      data: attempt.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/problems/:id/attempts
 * @desc    Get attempt history for a specific problem (verified against authenticated user)
 * @access  Private
 */
const getAttemptsForProblem = async (req, res, next) => {
  try {
    const { id: problemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Verify ownership of the problem
    const problem = await Problem.findOne({ _id: problemId, userId: req.user._id });
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const attempts = await Attempt.find({
      problemId: problem._id,
      userId: req.user._id,
    }).sort({ attemptedAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts.map((a) => a.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAttempt,
  getAttemptsForProblem,
};
