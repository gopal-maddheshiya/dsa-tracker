const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');

const REVISION_INTERVALS = {
  solved: 14,
  revisit_needed: 5,
  struggled: 2,
};

const STRUGGLE_WEIGHTS = {
  solved: 0,
  revisit_needed: 1,
  struggled: 2,
};

/**
 * @route   GET /api/analytics/summary
 * @desc    Get dashboard summary metrics (total, solved, difficulty breakdown)
 * @access  Private
 */
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Total problems owned by authenticated user
    const totalProblems = await Problem.countDocuments({ userId });

    // Total attempts logged by authenticated user
    const totalAttempts = await Attempt.countDocuments({ userId });

    // Solved attempts count
    const solvedAttempts = await Attempt.countDocuments({ userId, status: 'solved' });

    // Unique solved problems (problems with at least one 'solved' attempt)
    const solvedProblemsAgg = await Attempt.aggregate([
      { $match: { userId, status: 'solved' } },
      { $group: { _id: '$problemId' } },
      { $count: 'count' },
    ]);
    const solvedProblems = solvedProblemsAgg.length > 0 ? solvedProblemsAgg[0].count : 0;

    // Difficulty breakdown of user problems
    const diffAgg = await Problem.aggregate([
      { $match: { userId } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    const diffMap = { easy: 0, medium: 0, hard: 0 };
    diffAgg.forEach((d) => {
      if (d._id && diffMap[d._id] !== undefined) {
        diffMap[d._id] = d.count;
      }
    });

    const difficultyBreakdown = [
      { difficulty: 'easy', count: diffMap.easy },
      { difficulty: 'medium', count: diffMap.medium },
      { difficulty: 'hard', count: diffMap.hard },
    ];

    return res.status(200).json({
      success: true,
      data: {
        totalProblems,
        totalAttempts,
        solvedProblems,
        solvedAttempts,
        difficultyBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/topics
 * @desc    Analyze topic performance: totalAttempts, struggledAttempts, struggleRatio, weaknessRank
 * @access  Private
 */
const getTopics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const topicStats = await Attempt.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem',
        },
      },
      { $unwind: '$problem' },
      // Ensure the problem belongs to the authenticated user
      { $match: { 'problem.userId': userId } },
      { $unwind: '$problem.topics' },
      {
        $group: {
          _id: '$problem.topics',
          totalAttempts: { $sum: 1 },
          struggledAttempts: {
            $sum: { $cond: [{ $eq: ['$status', 'struggled'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          totalAttempts: 1,
          struggledAttempts: 1,
          struggleRatio: {
            $cond: [
              { $eq: ['$totalAttempts', 0] },
              0,
              { $divide: ['$struggledAttempts', '$totalAttempts'] },
            ],
          },
        },
      },
      { $sort: { struggleRatio: -1, totalAttempts: -1, topic: 1 } },
    ]);

    // Assign sequential weakness rank based on descending struggleRatio
    const formattedTopics = topicStats.map((item, idx) => ({
      topic: item.topic,
      totalAttempts: item.totalAttempts,
      struggledAttempts: item.struggledAttempts,
      struggleRatio: Number(item.struggleRatio.toFixed(3)),
      weaknessRank: idx + 1,
    }));

    return res.status(200).json({
      success: true,
      data: formattedTopics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/trend
 * @desc    Chronological solved attempts grouped by day using attemptedAt
 * @access  Private
 */
const getTrend = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const trend = await Attempt.aggregate([
      {
        $match: {
          userId,
          status: 'solved',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$attemptedAt' },
          },
          solved: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          solved: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/heatmap
 * @desc    All practice attempts grouped by calendar day for activity heatmaps
 * @access  Private
 */
const getHeatmap = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const heatmap = await Attempt.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$attemptedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: heatmap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/revision-queue
 * @desc    Deterministic spaced-repetition priority queue based on latest attempt status and elapsed time
 * @access  Private
 */
const getRevisionQueue = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate problems and fetch strictly the latest attempt by highest attemptedAt
    const problemsWithLatestAttempt = await Problem.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'attempts',
          let: { pId: '$_id', uId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$problemId', '$$pId'] },
                    { $eq: ['$userId', '$$uId'] },
                  ],
                },
              },
            },
            { $sort: { attemptedAt: -1 } },
            { $limit: 1 },
          ],
          as: 'latestAttemptArray',
        },
      },
      // Exclude problems with zero attempts
      { $match: { 'latestAttemptArray.0': { $exists: true } } },
      {
        $project: {
          _id: 0,
          problemId: '$_id',
          title: 1,
          platform: 1,
          difficulty: 1,
          topics: 1,
          latestAttempt: { $arrayElemAt: ['$latestAttemptArray', 0] },
        },
      },
    ]);

    const now = Date.now();

    const queueItems = problemsWithLatestAttempt.map((problem) => {
      const lastAttemptedAt = problem.latestAttempt.attemptedAt;
      const elapsedDays = (now - new Date(lastAttemptedAt).getTime()) / (1000 * 60 * 60 * 24);

      // Clamp future-dated attempts so elapsed days is never negative
      const daysSinceLastAttempt = Math.max(0, elapsedDays);

      const latestStatus = problem.latestAttempt.status;
      const intervalForStatus = REVISION_INTERVALS[latestStatus] || 14;
      const struggleWeight = STRUGGLE_WEIGHTS[latestStatus] ?? 0;

      // Deterministic priority formula
      const priorityScore = (daysSinceLastAttempt / intervalForStatus) + struggleWeight;

      return {
        problemId: problem.problemId.toString(),
        title: problem.title,
        platform: problem.platform,
        difficulty: problem.difficulty,
        topics: problem.topics || [],
        latestStatus,
        lastAttemptedAt,
        daysSinceLastAttempt: Number(daysSinceLastAttempt.toFixed(2)),
        priorityScore: Number(priorityScore.toFixed(3)),
      };
    });

    // Sort descending by priorityScore
    queueItems.sort((a, b) => b.priorityScore - a.priorityScore);

    // Return top 20 items
    const top20 = queueItems.slice(0, 20);

    return res.status(200).json({
      success: true,
      data: top20,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getTopics,
  getTrend,
  getHeatmap,
  getRevisionQueue,
};
