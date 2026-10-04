const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');

const VALID_PLATFORMS = ['leetcode', 'gfg', 'codechef', 'hackerrank', 'other'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const URL_REGEX = /^https?:\/\/.+/i;

// Helper to escape regex special characters
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * @desc    Get all problems for the authenticated user with filtering & search
 * @route   GET /api/problems
 * @access  Private
 */
const getProblems = async (req, res, next) => {
  try {
    const { topic, difficulty, status, search } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Initial match stage for Problem fields
    const matchStage = { userId };

    if (difficulty && typeof difficulty === 'string') {
      matchStage.difficulty = difficulty.toLowerCase().trim();
    }

    if (topic && typeof topic === 'string' && topic.trim()) {
      matchStage.topics = {
        $in: [new RegExp(`^${escapeRegex(topic.trim())}$`, 'i')],
      };
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      matchStage.$or = [{ title: searchRegex }, { topics: searchRegex }];
    }

    const pipeline = [
      { $match: matchStage },
      // Lookup latest attempt for each problem
      {
        $lookup: {
          from: 'attempts',
          let: { pId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$problemId', '$$pId'] } } },
            { $sort: { attemptedAt: -1, _id: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                id: '$_id',
                status: 1,
                timeTakenMinutes: 1,
                notes: 1,
                attemptedAt: 1,
              },
            },
          ],
          as: 'latestAttemptArray',
        },
      },
      {
        $addFields: {
          latestAttempt: {
            $ifNull: [{ $arrayElemAt: ['$latestAttemptArray', 0] }, null],
          },
        },
      },
    ];

    // Status filter: Filter based on the MOST RECENT attempt status
    if (status && typeof status === 'string' && status.trim()) {
      pipeline.push({
        $match: {
          'latestAttempt.status': status.toLowerCase().trim(),
        },
      });
    }

    // Sort newest problems first
    pipeline.push({ $sort: { createdAt: -1, _id: -1 } });

    // Project clean client response shape
    pipeline.push({
      $project: {
        _id: 0,
        id: '$_id',
        title: 1,
        platform: 1,
        link: 1,
        topics: 1,
        difficulty: 1,
        createdAt: 1,
        latestAttempt: 1,
      },
    });

    const problems = await Problem.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: {
        problems,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new problem owned by authenticated user
 * @route   POST /api/problems
 * @access  Private
 */
const createProblem = async (req, res, next) => {
  try {
    const { title, platform, link, topics, difficulty } = req.body;

    // 1. Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Problem title is required and cannot be empty',
      });
    }

    if (
      !platform ||
      typeof platform !== 'string' ||
      !VALID_PLATFORMS.includes(platform.toLowerCase().trim())
    ) {
      return res.status(400).json({
        success: false,
        message: `Platform is required and must be one of: ${VALID_PLATFORMS.join(', ')}`,
      });
    }

    if (!link || typeof link !== 'string' || !URL_REGEX.test(link.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Problem link must be a valid URL starting with http:// or https://',
      });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topics must be a non-empty array of strings',
      });
    }

    // Trim and deduplicate topics within the problem while preserving capitalization
    const cleanedTopics = [];
    const seenTopics = new Set();
    for (const t of topics) {
      if (typeof t !== 'string' || !t.trim()) {
        return res.status(400).json({
          success: false,
          message: 'All topics must be non-empty strings',
        });
      }
      const trimmed = t.trim();
      const lowerKey = trimmed.toLowerCase();
      if (!seenTopics.has(lowerKey)) {
        seenTopics.add(lowerKey);
        cleanedTopics.push(trimmed);
      }
    }

    if (cleanedTopics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid topic is required',
      });
    }

    if (
      !difficulty ||
      typeof difficulty !== 'string' ||
      !VALID_DIFFICULTIES.includes(difficulty.toLowerCase().trim())
    ) {
      return res.status(400).json({
        success: false,
        message: `Difficulty is required and must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
      });
    }

    // 2. Create Problem strictly scoped to req.user.userId
    const problem = await Problem.create({
      userId: req.user.userId,
      title: title.trim(),
      platform: platform.toLowerCase().trim(),
      link: link.trim(),
      topics: cleanedTopics,
      difficulty: difficulty.toLowerCase().trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: {
        problem: {
          id: problem._id.toString(),
          title: problem.title,
          platform: problem.platform,
          link: problem.link,
          topics: problem.topics,
          difficulty: problem.difficulty,
          createdAt: problem.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single problem by ID with full attempt history
 * @route   GET /api/problems/:id
 * @access  Private
 */
const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID format',
      });
    }

    // Must match both _id and userId to enforce strict ownership
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

    // Fetch attempts for this problem sorted newest first
    const attempts = await Attempt.find({
      problemId: id,
      userId: req.user.userId,
    }).sort({ attemptedAt: -1, _id: -1 });

    return res.status(200).json({
      success: true,
      data: {
        problem: {
          id: problem._id.toString(),
          title: problem.title,
          platform: problem.platform,
          link: problem.link,
          topics: problem.topics,
          difficulty: problem.difficulty,
          createdAt: problem.createdAt,
        },
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

/**
 * @desc    Update problem details (partial update)
 * @route   PUT /api/problems/:id
 * @access  Private
 */
const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID format',
      });
    }

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

    const { title, platform, link, topics, difficulty } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }
      problem.title = title.trim();
    }

    if (platform !== undefined) {
      if (
        typeof platform !== 'string' ||
        !VALID_PLATFORMS.includes(platform.toLowerCase().trim())
      ) {
        return res.status(400).json({
          success: false,
          message: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
        });
      }
      problem.platform = platform.toLowerCase().trim();
    }

    if (link !== undefined) {
      if (typeof link !== 'string' || !URL_REGEX.test(link.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Link must be a valid URL starting with http:// or https://',
        });
      }
      problem.link = link.trim();
    }

    if (topics !== undefined) {
      if (!Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Topics must be a non-empty array of strings',
        });
      }
      const cleaned = [];
      const seen = new Set();
      for (const t of topics) {
        if (typeof t !== 'string' || !t.trim()) {
          return res.status(400).json({
            success: false,
            message: 'All topics must be non-empty strings',
          });
        }
        const trimmed = t.trim();
        const key = trimmed.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          cleaned.push(trimmed);
        }
      }
      problem.topics = cleaned;
    }

    if (difficulty !== undefined) {
      if (
        typeof difficulty !== 'string' ||
        !VALID_DIFFICULTIES.includes(difficulty.toLowerCase().trim())
      ) {
        return res.status(400).json({
          success: false,
          message: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
        });
      }
      problem.difficulty = difficulty.toLowerCase().trim();
    }

    await problem.save();

    return res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      data: {
        problem: {
          id: problem._id.toString(),
          title: problem.title,
          platform: problem.platform,
          link: problem.link,
          topics: problem.topics,
          difficulty: problem.difficulty,
          createdAt: problem.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete problem and cascade delete all associated attempts
 * @route   DELETE /api/problems/:id
 * @access  Private
 */
const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem ID format',
      });
    }

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

    // 1. Delete Problem
    await Problem.deleteOne({ _id: id });

    // 2. Cascade delete all associated attempts to prevent orphans
    await Attempt.deleteMany({ problemId: id });

    return res.status(200).json({
      success: true,
      message: 'Problem and associated attempts deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProblems,
  createProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
};
