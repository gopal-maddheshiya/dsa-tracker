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

/**
 * @desc    Get in-depth analytics not shown on the main dashboard:
 *          speed/time-to-solve, platform distribution, first-try accuracy,
 *          day-of-week productivity rhythm, retention rate, and comprehensive topic mastery.
 * @route   GET /api/analytics/advanced
 * @access  Private (requireAuth)
 */
const getAdvancedAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const scope = req.query.scope || 'all'; // '30d', '90d', 'all'

    let dateMatch = {};
    if (scope === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      dateMatch = { attemptedAt: { $gte: d } };
    } else if (scope === '90d') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      dateMatch = { attemptedAt: { $gte: d } };
    }

    // 1. Fetch user problems with basic info
    const problems = await Problem.find({ userId }).lean();
    const problemMap = new Map();
    problems.forEach((p) => problemMap.set(p._id.toString(), p));

    // 2. Fetch attempts in scope
    const attempts = await Attempt.find({ userId, ...dateMatch }).sort({ attemptedAt: 1 }).lean();

    // 3. Time-to-solve stats
    const attemptsWithTime = attempts.filter((a) => typeof a.timeTakenMinutes === 'number' && a.timeTakenMinutes > 0);
    const totalTimeMinutes = attemptsWithTime.reduce((sum, a) => sum + a.timeTakenMinutes, 0);
    const avgTimeMinutes = attemptsWithTime.length > 0 ? Math.round(totalTimeMinutes / attemptsWithTime.length) : 0;

    // Time by difficulty
    const diffTimeMap = { easy: [], medium: [], hard: [] };
    const solvedWithTime = attemptsWithTime.filter((a) => a.status === 'solved');
    solvedWithTime.forEach((a) => {
      const p = problemMap.get(a.problemId?.toString());
      if (p && p.difficulty && diffTimeMap[p.difficulty.toLowerCase()]) {
        diffTimeMap[p.difficulty.toLowerCase()].push(a.timeTakenMinutes);
      }
    });

    const avgTimeByDifficulty = {
      easy: diffTimeMap.easy.length > 0 ? Math.round(diffTimeMap.easy.reduce((s, v) => s + v, 0) / diffTimeMap.easy.length) : 0,
      medium: diffTimeMap.medium.length > 0 ? Math.round(diffTimeMap.medium.reduce((s, v) => s + v, 0) / diffTimeMap.medium.length) : 0,
      hard: diffTimeMap.hard.length > 0 ? Math.round(diffTimeMap.hard.reduce((s, v) => s + v, 0) / diffTimeMap.hard.length) : 0,
    };

    const fastestSolveMinutes = solvedWithTime.length > 0 ? Math.min(...solvedWithTime.map((a) => a.timeTakenMinutes)) : null;

    // 4. Platform breakdown (group problems by platform)
    const platformMap = {};
    problems.forEach((p) => {
      const plat = (p.platform || 'other').toLowerCase();
      platformMap[plat] = (platformMap[plat] || 0) + 1;
    });

    const platformDistribution = Object.entries(platformMap)
      .map(([platform, count]) => ({
        platform,
        count,
        percentage: problems.length > 0 ? Math.round((count / problems.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 5. First-try vs repeat accuracy & recall
    const problemAttemptsMap = new Map();
    attempts.forEach((a) => {
      const pid = a.problemId.toString();
      if (!problemAttemptsMap.has(pid)) {
        problemAttemptsMap.set(pid, []);
      }
      problemAttemptsMap.get(pid).push(a);
    });

    let firstTryCount = 0;
    let repeatSolvedCount = 0;
    let stillStrugglingCount = 0;
    let totalAttemptedProblems = problemAttemptsMap.size;
    let repeatAttemptsTotal = 0;
    let repeatAttemptsSolved = 0;

    problemAttemptsMap.forEach((pAttempts) => {
      const first = pAttempts[0];
      if (first.status === 'solved') {
        firstTryCount += 1;
      } else if (pAttempts.some((a) => a.status === 'solved')) {
        repeatSolvedCount += 1;
      } else {
        stillStrugglingCount += 1;
      }

      if (pAttempts.length > 1) {
        for (let i = 1; i < pAttempts.length; i++) {
          repeatAttemptsTotal += 1;
          if (pAttempts[i].status === 'solved') {
            repeatAttemptsSolved += 1;
          }
        }
      }
    });

    const firstTryAccuracyPct = totalAttemptedProblems > 0 ? Math.round((firstTryCount / totalAttemptedProblems) * 100) : 0;
    const retentionRatePct = repeatAttemptsTotal > 0 ? Math.round((repeatAttemptsSolved / repeatAttemptsTotal) * 100) : (firstTryAccuracyPct || 100);

    // 6. Day of week productivity rhythm & Streak
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    let weekdayCount = 0;
    let weekendCount = 0;

    const uniqueActiveDates = new Set();
    attempts.forEach((a) => {
      const d = new Date(a.attemptedAt);
      const dayIdx = d.getUTCDay();
      dayCounts[dayIdx] += 1;
      if (dayIdx === 0 || dayIdx === 6) {
        weekendCount += 1;
      } else {
        weekdayCount += 1;
      }
      uniqueActiveDates.add(d.toISOString().slice(0, 10));
    });

    let peakDayIdx = 0;
    let maxDayCount = -1;
    dayCounts.forEach((c, idx) => {
      if (c > maxDayCount) {
        maxDayCount = c;
        peakDayIdx = idx;
      }
    });

    const sortedDates = Array.from(uniqueActiveDates).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (sortedDates.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prev = new Date(sortedDates[i - 1]);
          const curr = new Date(sortedDates[i]);
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak += 1;
          } else {
            tempStreak = 1;
          }
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }

      const lastActive = sortedDates[sortedDates.length - 1];
      if (lastActive === todayStr || lastActive === yesterdayStr) {
        currentStreak = 1;
        for (let i = sortedDates.length - 1; i > 0; i--) {
          const curr = new Date(sortedDates[i]);
          const prev = new Date(sortedDates[i - 1]);
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak += 1;
          } else {
            break;
          }
        }
      }
    }

    // 7. Topic Mastery Matrix
    const topicStatsMap = new Map();
    problems.forEach((p) => {
      if (Array.isArray(p.topics)) {
        p.topics.forEach((t) => {
          if (!topicStatsMap.has(t)) {
            topicStatsMap.set(t, {
              topic: t,
              problemCount: 0,
              totalAttempts: 0,
              solvedAttempts: 0,
              times: [],
            });
          }
          topicStatsMap.get(t).problemCount += 1;
        });
      }
    });

    attempts.forEach((a) => {
      const p = problemMap.get(a.problemId?.toString());
      if (p && Array.isArray(p.topics)) {
        p.topics.forEach((t) => {
          const stat = topicStatsMap.get(t);
          if (stat) {
            stat.totalAttempts += 1;
            if (a.status === 'solved') stat.solvedAttempts += 1;
            if (a.timeTakenMinutes > 0) stat.times.push(a.timeTakenMinutes);
          }
        });
      }
    });

    const topicMastery = Array.from(topicStatsMap.values())
      .map((item) => {
        const solveRate = item.totalAttempts > 0 ? Math.round((item.solvedAttempts / item.totalAttempts) * 100) : 0;
        const avgTime = item.times.length > 0 ? Math.round(item.times.reduce((s, v) => s + v, 0) / item.times.length) : 0;
        let masteryTier = 'Needs Practice';
        if (solveRate >= 80 && item.totalAttempts >= 2) {
          masteryTier = 'Mastered';
        } else if (solveRate >= 50) {
          masteryTier = 'Proficient';
        }
        return {
          topic: item.topic,
          problemCount: item.problemCount,
          totalAttempts: item.totalAttempts,
          solvedAttempts: item.solvedAttempts,
          solveRate,
          avgTimeMinutes: avgTime,
          masteryTier,
        };
      })
      .sort((a, b) => b.totalAttempts - a.totalAttempts);

    return res.status(200).json({
      success: true,
      data: {
        scope,
        timeStats: {
          avgTimeMinutes,
          avgSolveTimeMinutes: avgTimeMinutes,
          totalTimeMinutes,
          totalMinutes: totalTimeMinutes,
          totalHours: (totalTimeMinutes / 60).toFixed(1),
          avgTimeByDifficulty,
          timeByDifficulty: {
            Easy: avgTimeByDifficulty.easy,
            Medium: avgTimeByDifficulty.medium,
            Hard: avgTimeByDifficulty.hard,
          },
          fastestSolveMinutes: fastestSolveMinutes ?? avgTimeMinutes,
        },
        platformDistribution: platformDistribution.map((p) => ({
          platform:
            p.platform === 'leetcode'
              ? 'LeetCode'
              : p.platform === 'gfg'
              ? 'GeeksforGeeks'
              : p.platform === 'codeforces'
              ? 'Codeforces'
              : p.platform === 'hackerrank'
              ? 'HackerRank'
              : p.platform === 'codechef'
              ? 'CodeChef'
              : p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
          count: p.count,
          percentage: p.percentage,
        })),
        accuracyMetrics: {
          totalAttempted: totalAttemptedProblems,
          totalAttemptedProblems,
          firstTrySolves: firstTryCount,
          firstTryCount,
          multiAttemptSolves: repeatSolvedCount,
          repeatSolvedCount,
          strugglingSolves: stillStrugglingCount,
          stillStrugglingCount,
          firstTryAccuracyPct,
          retentionRatePct,
        },
        rhythmMetrics: {
          daysOfWeek: daysOfWeek.map((label, idx) => ({
            day: label,
            count: dayCounts[idx],
          })),
          dayOfWeekActivity: daysOfWeek.map((label, idx) => ({
            day: label,
            count: dayCounts[idx],
          })),
          peakDay: daysOfWeek[peakDayIdx],
          peakProductivityDay: daysOfWeek[peakDayIdx],
          weekdayCount,
          weekendCount,
          currentStreak,
          longestStreak: Math.max(longestStreak, currentStreak),
        },
        topicMastery: topicMastery.map((item) => ({
          ...item,
          solvedCount: item.solvedAttempts,
          totalProblems: item.problemCount,
          successRate: item.solveRate,
          confidenceScore: Math.min(100, Math.round(item.solveRate * 0.7 + Math.min(item.totalAttempts * 5, 30))),
        })),
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
  getAdvancedAnalytics,
};
