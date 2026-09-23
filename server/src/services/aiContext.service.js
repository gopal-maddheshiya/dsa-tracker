const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');
const { calculatePriorityScore } = require('../utils/revisionRules');

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

/**
 * Builds a strictly minimized, verified weekly practice telemetry context for the authenticated user.
 * Covers the previous 7 days (and compares with the preceding 7-day period for trend).
 *
 * CRITICAL PRIVACY & SECURITY RULES:
 * - NO user credentials (password, hash, resetCode)
 * - NO authorization tokens (JWT, OAuth)
 * - NO user email, private profile metadata, or billing info
 * - NO third-party platform API keys or credentials
 * - NO full attempt histories or solution code
 *
 * @param {string|mongoose.Types.ObjectId} userId - Authenticated user's ObjectId
 * @returns {Promise<Object>} Minimized weekly telemetry context
 */
const buildWeeklyReviewContext = async (userId) => {
  const now = new Date();
  const end = now;
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Parallelize the 4 required analytical queries safely
  const [currentAttempts, prevAttempts, topicAgg, revisionQueueProblems] = await Promise.all([
    // 1. Attempts in the past 7 days
    Attempt.find({
      userId,
      attemptedAt: { $gte: start, $lte: end },
    })
      .sort({ attemptedAt: -1 })
      .select('problemId status attemptedAt timeTakenMinutes notes')
      .lean(),

    // 2. Attempts in the preceding 7 days (for trend)
    Attempt.find({
      userId,
      attemptedAt: { $gte: prevStart, $lt: start },
    })
      .select('status')
      .lean(),

    // 3. Topic performance over the past 7 days
    Attempt.aggregate([
      { $match: { userId, attemptedAt: { $gte: start, $lte: end } } },
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
    ]),

    // 4. Revision queue status for canonical spaced-repetition pressure
    Problem.aggregate([
      { $match: { userId, inRevisionQueue: { $ne: false } } },
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
      { $match: { 'latestAttemptArray.0': { $exists: true } } },
      {
        $project: {
          _id: 0,
          problemId: '$_id',
          title: 1,
          latestAttempt: { $arrayElemAt: ['$latestAttemptArray', 0] },
        },
      },
    ]),
  ]);

  // Aggregate activity
  const totalAttempts = currentAttempts.length;
  const solved = currentAttempts.filter((a) => a.status === 'solved').length;
  const struggled = currentAttempts.filter((a) => a.status === 'struggled').length;
  const revisitNeeded = currentAttempts.filter((a) => a.status === 'revisit_needed').length;

  const uniqueProblemSet = new Set(
    currentAttempts
      .map((a) => a.problemId?.toString())
      .filter(Boolean)
  );
  const uniqueProblems = uniqueProblemSet.size;

  // Active days in the 7-day period
  const activeDaysSet = new Set();
  currentAttempts.forEach((a) => {
    if (a.attemptedAt) {
      try {
        const d = new Date(a.attemptedAt).toISOString().slice(0, 10);
        activeDaysSet.add(d);
      } catch (_) {}
    }
  });
  const activeDays = activeDaysSet.size;

  // Trend
  const currentSolved = solved;
  const prevSolved = prevAttempts.filter((a) => a.status === 'solved').length;

  // Topics: strongest and weakest with deterministic tie-breaking
  let strongestTopic = null;
  let weakestTopic = null;
  let strongestTopicData = null;
  let weakestTopicData = null;

  if (topicAgg.length > 0) {
    const sortedByWeakness = [...topicAgg].sort((a, b) => {
      if (b.struggleRatio !== a.struggleRatio) return b.struggleRatio - a.struggleRatio;
      if (b.totalAttempts !== a.totalAttempts) return b.totalAttempts - a.totalAttempts;
      return String(a.topic).localeCompare(String(b.topic));
    });
    const weakest = sortedByWeakness.find((t) => t.struggledAttempts > 0) || null;
    if (weakest) {
      weakestTopic = `${weakest.topic} (${weakest.struggledAttempts} struggled of ${weakest.totalAttempts})`;
      weakestTopicData = {
        topic: weakest.topic,
        attempts: weakest.totalAttempts,
        struggled: weakest.struggledAttempts,
        struggleRatio: weakest.struggleRatio,
        evidenceLevel: weakest.totalAttempts <= 1 ? 'sparse' : (weakest.totalAttempts <= 4 ? 'moderate' : 'strong'),
      };
    }

    const sortedByStrength = [...topicAgg].sort((a, b) => {
      if (b.solvedAttempts !== a.solvedAttempts) return b.solvedAttempts - a.solvedAttempts;
      if (a.struggleRatio !== b.struggleRatio) return a.struggleRatio - b.struggleRatio;
      return String(a.topic).localeCompare(String(b.topic));
    });
    const strongest = sortedByStrength.find((t) => t.solvedAttempts > 0) || null;
    if (strongest) {
      strongestTopic = `${strongest.topic} (${strongest.solvedAttempts} solved of ${strongest.totalAttempts})`;
      strongestTopicData = {
        topic: strongest.topic,
        attempts: strongest.totalAttempts,
        solved: strongest.solvedAttempts,
        evidenceLevel: strongest.totalAttempts <= 1 ? 'sparse' : (strongest.totalAttempts <= 4 ? 'moderate' : 'strong'),
      };
    }
  }

  // Revision queue pressure
  const nowMs = now.getTime();
  let dueCount = 0;
  let overdueCount = 0;

  revisionQueueProblems.forEach((p) => {
    if (p.latestAttempt && p.latestAttempt.attemptedAt) {
      const attTime = new Date(p.latestAttempt.attemptedAt).getTime();
      const elapsed = Math.max(0, (nowMs - (isNaN(attTime) ? nowMs : attTime)) / (1000 * 60 * 60 * 24));
      const { priorityScore, interval } = calculatePriorityScore(p.latestAttempt.status, elapsed);
      if (priorityScore >= 1.0) dueCount++;
      if (elapsed >= interval) overdueCount++;
    }
  });

  // Recent notes snippets (at most 2 notes, bounded to 120 chars each, untrusted data)
  const recentNotes = currentAttempts
    .filter((a) => a.notes && typeof a.notes === 'string' && a.notes.trim().length > 0)
    .slice(0, 2)
    .map((a) => a.notes.trim().slice(0, 120));

  // Sample size & evidence awareness (does not alter canonical calculations)
  const isLowSample = totalAttempts <= 2 || activeDays <= 1;
  const dataConfidence =
    totalAttempts === 0
      ? 'none'
      : (totalAttempts <= 2 || activeDays <= 1
          ? 'low'
          : (totalAttempts <= 5 ? 'moderate' : 'high'));

  const sampleSize = {
    attempts: totalAttempts,
    uniqueProblems,
    activeDays,
    isLowSample,
    dataConfidence,
  };

  const topicEvidence = {
    strongest: strongestTopicData,
    weakest: weakestTopicData,
  };

  return {
    period: {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      days: 7,
    },
    activity: {
      attempts: totalAttempts,
      solved,
      struggled,
      revisitNeeded,
      uniqueProblems,
    },
    sampleSize,
    topicEvidence,
    topics: {
      strongest: strongestTopic,
      weakest: weakestTopic,
    },
    trend: {
      current: currentSolved,
      previous: prevSolved,
    },
    revision: {
      dueCount,
      overdueCount,
    },
    consistency: {
      activeDays,
    },
    reflections: recentNotes,
  };
};

module.exports = {
  buildAIContext,
  buildTakeawayContext,
  buildWeeklyReviewContext,
};
