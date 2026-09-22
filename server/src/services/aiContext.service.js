const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');

const REVISION_CONFIG = {
  solved: { interval: 14, weight: 0 },
  revisit_needed: { interval: 5, weight: 1 },
  struggled: { interval: 2, weight: 2 },
};

/**
 * Builds a strictly minimized, verified practice telemetry context for the authenticated user and target problem.
 *
 * CRITICAL PRIVACY & SECURITY RULES:
 * - NO user credentials (password, hash, resetCode)
 * - NO authorization tokens (JWT, OAuth)
 * - NO user email, private profile metadata, or billing info
 * - NO third-party platform API keys or credentials
 *
 * @param {string|mongoose.Types.ObjectId} userId - Authenticated user's ObjectId
 * @param {string|mongoose.Types.ObjectId} problemId - Target problem's ObjectId
 * @returns {Promise<Object>} Verified practice context for AI coaching
 */
const buildAIContext = async (userId, problemId) => {
  // 1. Fetch the problem belonging strictly to this user
  const problem = await Problem.findOne({ _id: problemId, userId }).lean();
  if (!problem) {
    return null;
  }

  // 2. Fetch attempts, aggregate topic stats, and recent attempts in parallel
  const [problemAttempts, topicStats, recentAttempts] = await Promise.all([
    Attempt.find({ problemId, userId })
      .sort({ attemptedAt: -1 })
      .select('status attemptedAt timeTakenMinutes notes')
      .lean(),
    Attempt.aggregate([
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
      { $unwind: '$problem.topics' },
      {
        $group: {
          _id: { $toLower: '$problem.topics' },
          totalAttempts: { $sum: 1 },
          struggledAttempts: {
            $sum: { $cond: [{ $in: ['$status', ['struggled', 'revisit_needed']] }, 1, 0] },
          },
          solvedAttempts: {
            $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          totalAttempts: 1,
          struggledAttempts: 1,
          solvedAttempts: 1,
          struggleRatio: {
            $cond: [
              { $gt: ['$totalAttempts', 0] },
              { $divide: ['$struggledAttempts', '$totalAttempts'] },
              0,
            ],
          },
        },
      },
      { $sort: { struggleRatio: -1, totalAttempts: -1, topic: 1 } },
      { $limit: 5 },
    ]),
    Attempt.find({ userId })
      .sort({ attemptedAt: -1 })
      .limit(10)
      .select('status attemptedAt')
      .lean(),
  ]);

  const latestAttempt = problemAttempts.length > 0 ? problemAttempts[0] : null;

  // 3. Compute deterministic spaced-repetition metrics
  const now = Date.now();
  let daysSinceLastAttempt = null;
  let priorityScore = null;
  let revisionIntervalDays = null;

  if (latestAttempt && latestAttempt.attemptedAt) {
    const attemptedTime = new Date(latestAttempt.attemptedAt).getTime();
    const validTime = !isNaN(attemptedTime) ? attemptedTime : now;
    daysSinceLastAttempt = Math.max(0, (now - validTime) / (1000 * 60 * 60 * 24));

    const cfg = REVISION_CONFIG[latestAttempt.status] || REVISION_CONFIG.revisit_needed;
    revisionIntervalDays = cfg.interval;
    priorityScore = (daysSinceLastAttempt / cfg.interval) + cfg.weight;
  }

  const recentSolved = recentAttempts.filter((a) => a.status === 'solved').length;
  const recentStruggled = recentAttempts.filter((a) => a.status !== 'solved').length;

  // 4. Build and return sanitized context
  return {
    problem: {
      id: String(problem._id),
      title: problem.title,
      platform: problem.platform,
      difficulty: problem.difficulty,
      topics: problem.topics || [],
    },
    revision: {
      latestStatus: latestAttempt ? latestAttempt.status : 'not_started',
      daysSinceLastAttempt: daysSinceLastAttempt !== null ? Number(daysSinceLastAttempt.toFixed(1)) : null,
      latestAttemptTimestamp: latestAttempt && latestAttempt.attemptedAt ? new Date(latestAttempt.attemptedAt).getTime() : 0,
      revisionIntervalDays,
      priorityScore: priorityScore !== null ? Number(priorityScore.toFixed(2)) : null,
      totalAttemptsForProblem: problemAttempts.length,
      recentNotesSnippet: latestAttempt?.notes ? latestAttempt.notes.slice(0, 150) : '',
    },
    userWeakTopics: topicStats.map((t) => ({
      topic: t.topic,
      totalAttempts: t.totalAttempts,
      struggledAttempts: t.struggledAttempts,
      struggleRatio: Number(t.struggleRatio.toFixed(2)),
    })),
    recentActivity: {
      recentAttemptsCount: recentAttempts.length,
      recentSolvedCount: recentSolved,
      recentStruggledCount: recentStruggled,
    },
  };
};

/**
 * Builds a strictly sanitized context for synthesizing a post-attempt takeaway.
 *
 * CRITICAL PRIVACY & SECURITY RULES:
 * - NO user credentials (password, hash, resetCode)
 * - NO authorization tokens (JWT, OAuth)
 * - NO user email, private profile metadata, or billing info
 * - NO third-party platform API keys or credentials
 * - Raw user notes are treated strictly as data to summarize
 *
 * @param {string|mongoose.Types.ObjectId} userId - Authenticated user's ObjectId
 * @param {string|mongoose.Types.ObjectId} attemptId - Target attempt's ObjectId
 * @returns {Promise<Object|null>} Sanitized takeaway context or null if not found/unauthorized
 */
const buildTakeawayContext = async (userId, attemptId) => {
  // 1. Fetch attempt strictly belonging to this user
  const attempt = await Attempt.findOne({ _id: attemptId, userId }).lean();
  if (!attempt) {
    return null;
  }

  // 2. Fetch associated problem and total attempt count concurrently
  const [problem, totalAttempts] = await Promise.all([
    Problem.findOne({ _id: attempt.problemId, userId }).lean(),
    Attempt.countDocuments({ problemId: attempt.problemId, userId }),
  ]);
  if (!problem) {
    return null;
  }

  return {
    problem: {
      id: String(problem._id),
      title: problem.title,
      platform: problem.platform,
      difficulty: problem.difficulty,
      topics: problem.topics || [],
    },
    attempt: {
      id: String(attempt._id),
      status: attempt.status,
      timeTakenMinutes: attempt.timeTakenMinutes,
      notes: attempt.notes ? attempt.notes.trim() : '',
      approach: attempt.approach ? attempt.approach.trim() : '',
      timeComplexity: attempt.timeComplexity ? attempt.timeComplexity.trim() : '',
      spaceComplexity: attempt.spaceComplexity ? attempt.spaceComplexity.trim() : '',
      attemptedAt: attempt.attemptedAt,
      attemptTimestamp: attempt.attemptedAt ? new Date(attempt.attemptedAt).getTime() : 0,
    },
    telemetry: {
      totalAttemptsForProblem: totalAttempts,
    },
  };
};

module.exports = {
  buildAIContext,
  buildTakeawayContext,
};
