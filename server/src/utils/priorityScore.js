/**
 * Revision Intervals and Struggle Weights for Leitner-inspired spaced repetition.
 */
const REVISION_CONFIG = {
  solved: {
    intervalDays: 14,
    struggleWeight: 0,
  },
  revisit_needed: {
    intervalDays: 5,
    struggleWeight: 1,
  },
  struggled: {
    intervalDays: 2,
    struggleWeight: 2,
  },
};

/**
 * Calculates priority score for spaced-repetition revision.
 * Formula: priorityScore = (daysSinceLastAttempt / intervalForStatus) + struggleWeight
 *
 * @param {string} latestStatus - 'solved' | 'revisit_needed' | 'struggled'
 * @param {Date | string} lastAttemptedAt - Timestamp of the most recent practice attempt
 * @param {Date | string} [referenceTime=new Date()] - Reference timestamp for elapsed calculation
 * @returns {{
 *   daysSinceLastAttempt: number,
 *   intervalDays: number,
 *   struggleWeight: number,
 *   priorityScore: number
 * }}
 */
function calculatePriorityScore(latestStatus, lastAttemptedAt, referenceTime = new Date()) {
  const normStatus = (latestStatus || 'revisit_needed').toLowerCase();
  const config = REVISION_CONFIG[normStatus] || REVISION_CONFIG.revisit_needed;

  const now = new Date(referenceTime);
  const attemptedAt = new Date(lastAttemptedAt);

  // Elapsed milliseconds between reference time and attempt timestamp
  const diffMs = now.getTime() - attemptedAt.getTime();

  // Safely clamp to 0 if future historical date was supplied
  const rawDays = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
  const daysSinceLastAttempt = Math.round(rawDays * 100) / 100;

  // Compute exact priority score
  const rawScore = (rawDays / config.intervalDays) + config.struggleWeight;
  const priorityScore = Math.round(rawScore * 10000) / 10000;

  return {
    daysSinceLastAttempt,
    intervalDays: config.intervalDays,
    struggleWeight: config.struggleWeight,
    priorityScore,
  };
}

module.exports = {
  REVISION_CONFIG,
  calculatePriorityScore,
};
