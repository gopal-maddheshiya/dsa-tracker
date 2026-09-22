/**
 * Canonical Spaced Repetition Constants & Utilities
 * 
 * Shared across /api/analytics/revision-queue and /api/problems/recommendations.
 * Guarantees mathematical consistency and eliminates rank inversion bugs.
 */

const REVISION_INTERVALS = Object.freeze({
  solved: 14,
  revisit_needed: 5,
  struggled: 2,
});

const STRUGGLE_WEIGHTS = Object.freeze({
  solved: 0,
  revisit_needed: 1,
  struggled: 2, // Canonical struggle weight is strictly +2.0 (never 2.5)
});

// Solved items ceiling: historical solved items (>30d ago) are clamped to 30 days
// to prevent ancient solved problems from flooding the revision queue.
const SOLVED_MAX_ELAPSED_DAYS = 30;

/**
 * Calculates deterministic revision priority score.
 * 
 * Rules:
 * - solved: effectiveDays clamped to min(daysSinceLastAttempt, 30)
 * - struggled: effectiveDays = daysSinceLastAttempt (unclamped)
 * - revisit_needed: effectiveDays = daysSinceLastAttempt (unclamped)
 * 
 * Formula:
 * PriorityScore = (effectiveDays / intervalForStatus) + struggleWeight
 * 
 * @param {string} status - 'solved' | 'struggled' | 'revisit_needed'
 * @param {number} daysSinceLastAttempt - Non-negative number of days elapsed
 * @returns {{ priorityScore: number, effectiveDays: number, interval: number, weight: number }}
 */
function calculatePriorityScore(status, daysSinceLastAttempt) {
  const normStatus = (status || 'solved').toLowerCase().trim();
  const rawDays = Math.max(0, Number(daysSinceLastAttempt) || 0);

  const interval = REVISION_INTERVALS[normStatus] || REVISION_INTERVALS.solved;
  const weight = STRUGGLE_WEIGHTS[normStatus] ?? STRUGGLE_WEIGHTS.solved;

  // Defensive ceiling for solved problems only (prevent ancient solved problems from dominating)
  const effectiveDays = normStatus === 'solved'
    ? Math.min(rawDays, SOLVED_MAX_ELAPSED_DAYS)
    : rawDays;

  const priorityScore = (effectiveDays / interval) + weight;

  return {
    priorityScore,
    effectiveDays,
    interval,
    weight,
  };
}

module.exports = {
  REVISION_INTERVALS,
  STRUGGLE_WEIGHTS,
  SOLVED_MAX_ELAPSED_DAYS,
  calculatePriorityScore,
};
