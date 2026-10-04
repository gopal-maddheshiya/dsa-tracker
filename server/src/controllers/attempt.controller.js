const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');

const VALID_STATUSES = ['solved', 'struggled', 'revisit_needed'];

/**
 * @desc    Log a new attempt for a problem
 * @route   POST /api/problems/:id/attempts
 * @access  Private
 */
const createAttempt = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID format',
      });
    }

    // 1. Verify problem exists and belongs to authenticated user
    const problem = await Problem.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const { status, timeTakenMinutes, notes, attemptedAt } = req.body;

    // 2. Validation
    if (
      !status ||
      typeof status !== 'string' ||
      !VALID_STATUSES.includes(status.toLowerCase().trim())
    ) {
      return res.status(400).json({
        success: false,
        message: `Status is required and must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    let parsedTime = null;
    if (timeTakenMinutes !== undefined && timeTakenMinutes !== null) {
      const num = Number(timeTakenMinutes);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({
          success: false,
          message: 'Time taken must be a non-negative number',
        });
      }
      parsedTime = num;
    }

    let parsedDate = new Date();
    if (attemptedAt) {
      const d = new Date(attemptedAt);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid attemptedAt date format',
        });
      }
      parsedDate = d;
    }

    // 3. Create Attempt
    const attempt = await Attempt.create({
      problemId: problem._id,
      userId: req.user.userId,
      status: status.toLowerCase().trim(),
      timeTakenMinutes: parsedTime,
      notes: typeof notes === 'string' ? notes.trim() : '',
      attemptedAt: parsedDate,
    });

    return res.status(201).json({
      success: true,
      message: 'Attempt logged successfully',
      data: {
        attempt: {
          id: attempt._id.toString(),
          problemId: attempt.problemId.toString(),
          status: attempt.status,
          timeTakenMinutes: attempt.timeTakenMinutes,
          notes: attempt.notes,
          attemptedAt: attempt.attemptedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all attempts for a given problem
 * @route   GET /api/problems/:id/attempts
 * @access  Private
 */
const getAttempts = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID format',
      });
    }

    // Must verify problem ownership
    const problem = await Problem.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const attempts = await Attempt.find({
      problemId: id,
      userId: req.user.userId,
    }).sort({ attemptedAt: -1, _id: -1 });

    return res.status(200).json({
      success: true,
      data: {
        attempts: attempts.map((a) => ({
          id: a._id.toString(),
          status: a.status,
          timeTakenMinutes: a.timeTakenMinutes,
          notes: a.notes,
          attemptedAt: a.attemptedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAttempt,
  getAttempts,
};
