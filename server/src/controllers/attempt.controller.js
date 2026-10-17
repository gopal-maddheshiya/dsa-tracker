const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');

const VALID_STATUSES = ['solved', 'struggled', 'revisit_needed'];
const VALID_APPROACHES = ['brute_force', 'better', 'optimal', 'other'];

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

    const { status, timeTakenMinutes, notes, attemptedAt, approach, code } = req.body;

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

    let parsedApproach = 'optimal';
    if (approach !== undefined && approach !== null && approach !== '') {
      if (
        typeof approach !== 'string' ||
        !VALID_APPROACHES.includes(approach.toLowerCase().trim())
      ) {
        return res.status(400).json({
          success: false,
          message: `Approach must be one of: ${VALID_APPROACHES.join(', ')}`,
        });
      }
      parsedApproach = approach.toLowerCase().trim();
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
      approach: parsedApproach,
      code: typeof code === 'string' ? code : '',
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
          approach: attempt.approach,
          code: attempt.code,
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
          approach: a.approach || 'optimal',
          code: a.code || '',
          notes: a.notes,
          attemptedAt: a.attemptedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing attempt (e.g. edit code, approach, notes, status)
 * @route   PUT /api/problems/:id/attempts/:attemptId
 * @access  Private
 */
const updateAttempt = async (req, res, next) => {
  try {
    const { id, attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID or attempt ID format',
      });
    }

    // 1. Verify problem exists and belongs to user
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

    // 2. Find attempt
    const attempt = await Attempt.findOne({
      _id: attemptId,
      problemId: id,
      userId: req.user.userId,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }

    const { status, timeTakenMinutes, notes, attemptedAt, approach, code } = req.body;

    if (status !== undefined) {
      if (typeof status !== 'string' || !VALID_STATUSES.includes(status.toLowerCase().trim())) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      attempt.status = status.toLowerCase().trim();
    }

    if (approach !== undefined) {
      if (
        typeof approach !== 'string' ||
        !VALID_APPROACHES.includes(approach.toLowerCase().trim())
      ) {
        return res.status(400).json({
          success: false,
          message: `Approach must be one of: ${VALID_APPROACHES.join(', ')}`,
        });
      }
      attempt.approach = approach.toLowerCase().trim();
    }

    if (code !== undefined) {
      attempt.code = typeof code === 'string' ? code : '';
    }

    if (notes !== undefined) {
      attempt.notes = typeof notes === 'string' ? notes.trim() : '';
    }

    if (timeTakenMinutes !== undefined) {
      if (timeTakenMinutes === null || timeTakenMinutes === '') {
        attempt.timeTakenMinutes = null;
      } else {
        const num = Number(timeTakenMinutes);
        if (isNaN(num) || num < 0) {
          return res.status(400).json({
            success: false,
            message: 'Time taken must be a non-negative number',
          });
        }
        attempt.timeTakenMinutes = num;
      }
    }

    if (attemptedAt) {
      const d = new Date(attemptedAt);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid attemptedAt date format',
        });
      }
      attempt.attemptedAt = d;
    }

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: 'Attempt updated successfully',
      data: {
        attempt: {
          id: attempt._id.toString(),
          problemId: attempt.problemId.toString(),
          status: attempt.status,
          timeTakenMinutes: attempt.timeTakenMinutes,
          approach: attempt.approach,
          code: attempt.code,
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
 * @desc    Delete an attempt
 * @route   DELETE /api/problems/:id/attempts/:attemptId
 * @access  Private
 */
const deleteAttempt = async (req, res, next) => {
  try {
    const { id, attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID or attempt ID format',
      });
    }

    const attempt = await Attempt.findOneAndDelete({
      _id: attemptId,
      problemId: id,
      userId: req.user.userId,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Attempt deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAttempt,
  getAttempts,
  updateAttempt,
  deleteAttempt,
};
