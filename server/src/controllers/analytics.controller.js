const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');
const { calculatePriorityScore } = require('../utils/priorityScore');

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/analytics/summary
 * @access  Private (requireAuth)
 */
const getSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Parallel counts and aggregations
    const [totalProblems, totalAttempted, totalSolved, difficultyAggregation] =
      await Promise.all([
        Problem.countDocuments({ userId }),
        Attempt.countDocuments({ userId }),
        Attempt.countDocuments({ userId, status: 'solved' }),
        Problem.aggregate([
          { $match: { userId } },
          { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        ]),
      ]);

    // Map difficulty counts ensuring all 3 standard categories exist
    const diffMap = { easy: 0, medium: 0, hard: 0 };
    difficultyAggregation.forEach((item) => {
      const key = (item._id || '').toLowerCase();
      if (diffMap[key] !== undefined) {
        diffMap[key] = item.count;
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
        totalAttempted,
        totalSolved,
        difficultyBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get topic weakness rankings and struggle ratios
 * @route   GET /api/analytics/topics
 * @access  Private (requireAuth)
 */
const getTopicAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const pipeline = [
      // 1. Filter problems strictly owned by authenticated user
      { $match: { userId } },
      // 2. Unwind topics to evaluate each topic individually
      { $unwind: '$topics' },
      // 3. Lookup user's attempt records for each problem
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
          ],
          as: 'matchedAttempts',
        },
      },
      // 4. Unwind matched attempts
      { $unwind: '$matchedAttempts' },
      // 5. Group by topic
      {
        $group: {
          _id: '$topics',
          totalAttempts: { $sum: 1 },
          struggledCount: {
            $sum: {
              $cond: [{ $eq: ['$matchedAttempts.status', 'struggled'] }, 1, 0],
            },
          },
        },
      },
      // 6. Project clean fields with divide-by-zero safety
      {
        $project: {
          _id: 0,
          topic: '$_id',
          totalAttempts: 1,
          struggledCount: 1,
          struggleRatio: {
            $cond: [
              { $gt: ['$totalAttempts', 0] },
              { $divide: ['$struggledCount', '$totalAttempts'] },
              0,
            ],
          },
        },
      },
      // 7. Sort: struggleRatio desc, totalAttempts desc, topic asc (deterministic tie-breaker)
      {
        $sort: {
          struggleRatio: -1,
          totalAttempts: -1,
          topic: 1,
        },
      },
    ];

    const results = await Problem.aggregate(pipeline);

    // Assign weaknessRank (1, 2, 3...) and preserve precision
    const topics = results.map((item, index) => ({
      topic: item.topic,
      totalAttempts: item.totalAttempts,
      struggledCount: item.struggledCount,
      struggleRatio: Math.round(item.struggleRatio * 10000) / 10000,
      weaknessRank: index + 1,
    }));

    return res.status(200).json({
      success: true,
      data: {
        topics,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get practice trend over time (weekly solved counts)
 * @route   GET /api/analytics/trend
 * @access  Private (requireAuth)
 */
const getTrend = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const pipeline = [
      // 1. Only count solved attempts belonging to authenticated user
      {
        $match: {
          userId,
          status: 'solved',
        },
      },
      // 2. Group by weekly bucket starting Monday in UTC
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateTrunc: {
                  date: '$attemptedAt',
                  unit: 'week',
                  timezone: 'UTC',
                  startOfWeek: 'monday',
                },
              },
              timezone: 'UTC',
            },
          },
          count: { $sum: 1 },
        },
      },
      // 3. Chronological sorting
      { $sort: { _id: 1 } },
      // 4. Project clean output
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
    ];

    const trend = await Attempt.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: {
        trend,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get daily practice activity calendar (Heatmap)
 * @route   GET /api/analytics/heatmap
 * @access  Private (requireAuth)
 */
const getHeatmap = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const pipeline = [
      // 1. Filter attempts belonging strictly to authenticated user
      { $match: { userId } },
      // 2. Group by calendar date (YYYY-MM-DD) in UTC
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$attemptedAt',
              timezone: 'UTC',
            },
          },
          count: { $sum: 1 },
        },
      },
      // 3. Chronological sorting
      { $sort: { _id: 1 } },
      // 4. Project clean output
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
        },
      },
    ];

    const heatmap = await Attempt.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: {
        heatmap,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get spaced-repetition revision queue prioritized by Leitner formula
 * @route   GET /api/analytics/revision-queue
 * @access  Private (requireAuth)
 */
const getRevisionQueue = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Support injectable 'now' timestamp for deterministic unit testing
    const referenceTime = req.query.now ? new Date(req.query.now) : new Date();

    const pipeline = [
      // 1. Match problems belonging to authenticated user
      { $match: { userId } },
      // 2. Lookup single most recent attempt
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
            { $sort: { attemptedAt: -1, _id: -1 } },
            { $limit: 1 },
          ],
          as: 'latestAttemptArray',
        },
      },
      // 3. Exclude problems with zero attempts (cannot be due for revision yet)
      {
        $match: {
          'latestAttemptArray.0': { $exists: true },
        },
      },
      // 4. Project required fields and latest attempt
      {
        $project: {
          title: 1,
          difficulty: 1,
          topics: 1,
          latestAttempt: { $arrayElemAt: ['$latestAttemptArray', 0] },
        },
      },
    ];

    const problemsWithLatest = await Problem.aggregate(pipeline);

    // Compute priority score for each problem using the transparent formula
    const queue = problemsWithLatest.map((p) => {
      const latest = p.latestAttempt;
      const scoreData = calculatePriorityScore(
        latest.status,
        latest.attemptedAt,
        referenceTime
      );

      return {
        id: p._id.toString(),
        title: p.title,
        difficulty: p.difficulty,
        topics: p.topics,
        latestStatus: latest.status,
        lastAttemptedAt: latest.attemptedAt,
        daysSinceLastAttempt: scoreData.daysSinceLastAttempt,
        intervalDays: scoreData.intervalDays,
        struggleWeight: scoreData.struggleWeight,
        priorityScore: scoreData.priorityScore,
      };
    });

    // Sort descending by priorityScore, tie-break by daysSinceLastAttempt desc, then title asc
    queue.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      if (b.daysSinceLastAttempt !== a.daysSinceLastAttempt) {
        return b.daysSinceLastAttempt - a.daysSinceLastAttempt;
      }
      return a.title.localeCompare(b.title);
    });

    // Return top 20 recommendations
    const topQueue = queue.slice(0, 20);

    return res.status(200).json({
      success: true,
      data: {
        queue: topQueue,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getTopicAnalytics,
  getTrend,
  getHeatmap,
  getRevisionQueue,
};
