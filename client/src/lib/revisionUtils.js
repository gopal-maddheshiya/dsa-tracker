/**
 * Revision Utility Helpers
 * Deterministic explanation templates, timing categorizations, and score formatting.
 */

/**
 * Format elapsed days into human-readable label
 * @param {number} days
 * @returns {string}
 */
export function formatDaysElapsed(days) {
  if (days === null || days === undefined || isNaN(days)) {
    return '—';
  }
  const rounded = Math.round(days);
  if (rounded <= 0) {
    return '< 1 day ago';
  }
  if (rounded === 1) {
    return '1 day ago';
  }
  return `${rounded} days ago`;
}

/**
 * Format target revision interval
 * @param {number} intervalDays
 * @returns {string}
 */
export function formatInterval(intervalDays) {
  if (!intervalDays && intervalDays !== 0) return '—';
  return `${intervalDays}-day interval`;
}

/**
 * Categorize timing state into mutually exclusive states: Overdue vs Due vs Upcoming
 * Precedence hierarchy:
 * 1. daysSinceLastAttempt > intervalDays  -> 'overdue'
 * 2. daysSinceLastAttempt >= intervalDays -> 'due'
 * 3. else                                -> 'upcoming'
 * @param {number} daysSinceLastAttempt
 * @param {number} intervalDays
 * @returns {{ state: 'overdue' | 'due' | 'upcoming', label: string, badgeClass: string }}
 */
export function getRevisionTimingState(daysSinceLastAttempt = 0, intervalDays = 14) {
  if (daysSinceLastAttempt > intervalDays) {
    return {
      state: 'overdue',
      label: 'Overdue for revision',
      badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    };
  }

  if (daysSinceLastAttempt >= intervalDays) {
    return {
      state: 'due',
      label: 'Due for revision',
      badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };
  }

  return {
    state: 'upcoming',
    label: 'Upcoming review',
    badgeClass: 'text-text-secondary bg-surface-2 border-line',
  };
}

/**
 * Deterministic human-readable explanation template for why a problem is surfaced
 * @param {string} latestStatus - 'struggled' | 'revisit_needed' | 'solved'
 * @param {number} daysSinceLastAttempt
 * @param {number} intervalDays
 * @returns {string}
 */
export function formatRevisionReason(latestStatus, daysSinceLastAttempt, intervalDays) {
  const norm = (latestStatus || '').toLowerCase();
  const daysStr = Math.round(daysSinceLastAttempt || 0);

  if (norm === 'struggled') {
    return `You struggled with this problem previously, so its revision interval is short (${intervalDays} days) to reinforce retention.`;
  }

  if (norm === 'revisit_needed') {
    return `Marked for another pass and has reached its ${intervalDays}-day revision threshold (${daysStr} days elapsed).`;
  }

  if (norm === 'solved') {
    return `Solved previously and resurfaced after its ${intervalDays}-day interval to prevent forgetting curve decay.`;
  }

  return `Surfaced for practice based on your attempt history and ${intervalDays}-day revision interval.`;
}

/**
 * Format numerical priority score to 2 decimal places safely
 * @param {number} score
 * @returns {string}
 */
export function formatPriorityScore(score) {
  if (typeof score !== 'number' || isNaN(score)) {
    return '—';
  }
  return score.toFixed(2);
}

/**
 * Format 1-based index into padded rank (e.g. 01, 02)
 * @param {number} index
 * @returns {string}
 */
export function formatRank(index) {
  return String(index + 1).padStart(2, '0');
}
