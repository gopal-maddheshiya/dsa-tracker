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

    // Calculate practice streaks
    const allAttemptDates = await Attempt.find({ userId }).select('createdAt').lean();
    const daySet = new Set();
    allAttemptDates.forEach((a) => {
      if (a.createdAt) daySet.add(new Date(a.createdAt).toISOString().slice(0, 10));
    });
    const sortedDays = [...daySet].sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diffDays = Math.round((curr - prev) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    const lastDay = sortedDays[sortedDays.length - 1];
    if (lastDay === todayStr || lastDay === yesterdayStr) {
      currentStreak = 1;
      for (let i = sortedDays.length - 2; i >= 0; i--) {
        const next = new Date(sortedDays[i + 1]);
        const curr = new Date(sortedDays[i]);
        const diffDays = Math.round((next - curr) / 86400000);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalProblems,
        totalAttempts,
        solvedProblems,
        solvedAttempts,
        difficultyBreakdown,
        currentStreak,
        longestStreak,
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

/**
 * @route   GET /api/analytics/profile
 * @desc    Full profile stats: streak, milestones, best day, totals
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // ── All attempt dates (chronological) ─────────────────────────
    const allAttempts = await Attempt.find({ userId }, 'attemptedAt status').sort({ attemptedAt: 1 });

    // ── Unique active days ─────────────────────────────────────────
    const daySet = new Set();
    const dayCountMap = {};
    for (const a of allAttempts) {
      const d = a.attemptedAt.toISOString().slice(0, 10);
      daySet.add(d);
      dayCountMap[d] = (dayCountMap[d] || 0) + 1;
    }
    const sortedDays = [...daySet].sort();

    // ── Streak computation ─────────────────────────────────────────
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diffDays = Math.round((curr - prev) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    // Current streak: count consecutive days ending today or yesterday
    const lastDay = sortedDays[sortedDays.length - 1];
    if (lastDay === todayStr || lastDay === yesterdayStr) {
      currentStreak = 1;
      for (let i = sortedDays.length - 2; i >= 0; i--) {
        const next = new Date(sortedDays[i + 1]);
        const curr = new Date(sortedDays[i]);
        const diffDays = Math.round((next - curr) / 86400000);
        if (diffDays === 1) { currentStreak++; } else { break; }
      }
    }

    // ── Best day (most attempts in one day) ────────────────────────
    let bestDay = null;
    let bestDayCount = 0;
    for (const [d, c] of Object.entries(dayCountMap)) {
      if (c > bestDayCount) { bestDayCount = c; bestDay = d; }
    }

    // ── Solved problems by difficulty ──────────────────────────────
    const solvedByDiff = await Attempt.aggregate([
      { $match: { userId, status: 'solved' } },
      { $group: { _id: '$problemId' } },
      {
        $lookup: {
          from: 'problems', localField: '_id',
          foreignField: '_id', as: 'p',
        },
      },
      { $unwind: '$p' },
      { $group: { _id: '$p.difficulty', count: { $sum: 1 } } },
    ]);
    const diffSolved = { easy: 0, medium: 0, hard: 0 };
    solvedByDiff.forEach(d => { if (diffSolved[d._id] !== undefined) diffSolved[d._id] = d.count; });

    // ── Totals ─────────────────────────────────────────────────────
    const totalProblems = await Problem.countDocuments({ userId });
    const totalAttempts = allAttempts.length;
    const totalSolved = diffSolved.easy + diffSolved.medium + diffSolved.hard;
    const activeDays = daySet.size;

    // ── Milestones / Badges ────────────────────────────────────────
    const badges = [];
    if (totalSolved >= 1)   badges.push({ id: 'first_step',   icon: '🌱', label: 'First Step',     desc: 'Solved your first problem' });
    if (totalSolved >= 10)  badges.push({ id: 'getting_warm', icon: '🔥', label: 'Getting Warm',   desc: '10 problems solved' });
    if (totalSolved >= 50)  badges.push({ id: 'half_century', icon: '⚡', label: 'Half Century',   desc: '50 problems solved' });
    if (totalSolved >= 100) badges.push({ id: 'century',      icon: '💯', label: 'Century',        desc: '100 problems solved' });
    if (totalSolved >= 250) badges.push({ id: 'elite',        icon: '🏆', label: 'Elite Coder',    desc: '250 problems solved' });
    if (diffSolved.hard >= 1)  badges.push({ id: 'hard_first', icon: '🧠', label: 'Deep Thinker',  desc: 'First Hard solved' });
    if (diffSolved.hard >= 10) badges.push({ id: 'hard_ten',  icon: '💎', label: 'Diamond Mind',   desc: '10 Hard problems solved' });
    if (currentStreak >= 7)  badges.push({ id: 'streak_7',   icon: '📅', label: 'On a Roll',      desc: '7-day streak' });
    if (currentStreak >= 30) badges.push({ id: 'streak_30',  icon: '🎯', label: 'Consistent',     desc: '30-day streak' });
    if (activeDays >= 1)    badges.push({ id: 'day_one',     icon: '🚀', label: 'Day One',         desc: 'First practice session' });

    return res.status(200).json({
      success: true,
      data: {
        totalProblems,
        totalAttempts,
        totalSolved,
        activeDays,
        currentStreak,
        longestStreak,
        bestDay,
        bestDayCount,
        solvedByDifficulty: diffSolved,
        badges,
      },
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
  getProfile,
};
