const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');

const VALID_PLATFORMS = ['leetcode', 'gfg', 'codechef', 'hackerrank', 'other'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * Normalizes topics by trimming, removing empty strings, and deduplicating
 */
const normalizeTopics = (topics) => {
  if (!topics) return [];
  const rawArray = Array.isArray(topics)
    ? topics
    : typeof topics === 'string'
    ? topics.split(',')
    : [];

  return Array.from(
    new Set(
      rawArray
        .map((t) => String(t).trim())
        .filter((t) => t.length > 0)
    )
  );
};

/**
 * @route   GET /api/problems
 * @desc    Get all problems for the authenticated user with optional filters and derived latest attempt status
 * @access  Private
 */
const getProblems = async (req, res, next) => {
  try {
    const { topic, difficulty, status, search } = req.query;

    const query = { userId: req.user._id };

    // Filter by difficulty
    if (difficulty && VALID_DIFFICULTIES.includes(difficulty.toLowerCase())) {
      query.difficulty = difficulty.toLowerCase();
    }

    // Filter by topic
    if (topic && topic.trim()) {
      query.topics = { $regex: new RegExp(topic.trim(), 'i') };
    }

    // Search by title or topic
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ title: searchRegex }, { topics: searchRegex }];
    }

    // Fetch matching problems
    const problems = await Problem.find(query).sort({ createdAt: -1 });

    if (problems.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Derive latest attempt for each problem to support status filter and UI badges
    const problemIds = problems.map((p) => p._id);
    const attempts = await Attempt.find({
      userId: req.user._id,
      problemId: { $in: problemIds },
    }).sort({ attemptedAt: -1 });

    // Map the most recent attempt to each problem
    const latestAttemptMap = new Map();
    for (const attempt of attempts) {
      const pIdStr = attempt.problemId.toString();
      if (!latestAttemptMap.has(pIdStr)) {
        latestAttemptMap.set(pIdStr, attempt);
      }
    }

    // Enrich problems with derived latest attempt
    let enrichedProblems = problems.map((p) => {
      const json = p.toJSON();
      const latest = latestAttemptMap.get(json.id);
      return {
        ...json,
        latestAttempt: latest ? latest.toJSON() : null,
        attemptCount: attempts.filter((a) => a.problemId.toString() === json.id).length,
      };
    });

    // Filter by derived status if requested
    if (status && status.trim()) {
      const targetStatus = status.trim().toLowerCase();
      if (targetStatus === 'unattempted') {
        enrichedProblems = enrichedProblems.filter((p) => !p.latestAttempt);
      } else {
        enrichedProblems = enrichedProblems.filter(
          (p) => p.latestAttempt && p.latestAttempt.status === targetStatus
        );
      }
    }

    return res.status(200).json({
      success: true,
      count: enrichedProblems.length,
      data: enrichedProblems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/problems
 * @desc    Create a new problem owned by the authenticated user
 * @access  Private
 */
const createProblem = async (req, res, next) => {
  try {
    const { title, platform, link, topics, difficulty } = req.body;

    // Validation: Title
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Problem title is required',
      });
    }

    // Validation: Platform
    if (!platform || !VALID_PLATFORMS.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Platform is required and must be one of: ${VALID_PLATFORMS.join(', ')}`,
      });
    }

    // Validation: Link
    if (!link || typeof link !== 'string' || !link.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Problem link is required',
      });
    }

    // Validation: Difficulty
    if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Difficulty is required and must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
      });
    }

    const normalizedTopicList = normalizeTopics(topics);

    const problem = await Problem.create({
      userId: req.user._id,
      title: title.trim(),
      platform: platform.toLowerCase().trim(),
      link: link.trim(),
      topics: normalizedTopicList,
      difficulty: difficulty.toLowerCase().trim(),
    });

    return res.status(201).json({
      success: true,
      data: problem.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/problems/:id
 * @desc    Get a single problem and its attempt history (scoped to authenticated user)
 * @access  Private
 */
const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const problem = await Problem.findOne({ _id: id, userId: req.user._id });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Fetch related attempts sorted newest first
    const attempts = await Attempt.find({
      problemId: id,
      userId: req.user._id,
    }).sort({ attemptedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        ...problem.toJSON(),
        attempts: attempts.map((a) => a.toJSON()),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/problems/:id
 * @desc    Update problem details (cannot change ownership userId)
 * @access  Private
 */
const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const problem = await Problem.findOne({ _id: id, userId: req.user._id });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const { title, platform, link, topics, difficulty } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      problem.title = title.trim();
    }

    if (platform !== undefined) {
      if (!VALID_PLATFORMS.includes(platform.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
        });
      }
      problem.platform = platform.toLowerCase().trim();
    }

    if (link !== undefined) {
      if (typeof link !== 'string' || !link.trim()) {
        return res.status(400).json({ success: false, message: 'Link cannot be empty' });
      }
      problem.link = link.trim();
    }

    if (topics !== undefined) {
      problem.topics = normalizeTopics(topics);
    }

    if (difficulty !== undefined) {
      if (!VALID_DIFFICULTIES.includes(difficulty.toLowerCase())) {
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
      data: problem.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/problems/:id
 * @desc    Delete a problem and cascade delete all associated attempts
 * @access  Private
 */
const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const problem = await Problem.findOne({ _id: id, userId: req.user._id });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Delete problem document
    await Problem.deleteOne({ _id: id, userId: req.user._id });

    // Cascade delete all related attempts to ensure zero orphaned records
    await Attempt.deleteMany({ problemId: id, userId: req.user._id });

    return res.status(200).json({
      success: true,
      message: 'Problem and associated attempt history deleted successfully',
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
