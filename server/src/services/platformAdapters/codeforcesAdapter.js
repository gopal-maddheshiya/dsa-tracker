/**
 * Codeforces Platform Adapter
 * Interacts with official Codeforces REST API to verify handles and extract accepted submissions.
 */

const CF_API_BASE = 'https://codeforces.com/api';

/**
 * Maps Codeforces numerical rating to standard Easy / Medium / Hard difficulty.
 * @param {number|undefined} rating 
 * @param {string|undefined} index 
 * @returns {'easy'|'medium'|'hard'}
 */
function mapCodeforcesDifficulty(rating, index = '') {
  if (typeof rating === 'number' && rating > 0) {
    if (rating < 1200) return 'easy';
    if (rating < 1800) return 'medium';
    return 'hard';
  }

  // Fallback heuristic based on problem letter index
  const idx = String(index || '').toUpperCase();
  if (idx.startsWith('A') || idx.startsWith('B')) return 'easy';
  if (idx.startsWith('C') || idx.startsWith('D')) return 'medium';
  return 'hard';
}

/**
 * Verifies if a Codeforces handle exists and retrieves rating/rank stats.
 * @param {string} handle 
 * @returns {Promise<{ isValid: boolean, username?: string, stats?: object, error?: string }>}
 */
async function verifyUser(handle) {
  try {
    const cleanHandle = String(handle || '').trim();
    if (!cleanHandle) {
      return { isValid: false, error: 'Handle is required' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${CF_API_BASE}/user.info?handles=${encodeURIComponent(cleanHandle)}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DSA-Tracker-Sync-Engine/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { isValid: false, error: `Codeforces API returned HTTP ${response.status}` };
    }

    const data = await response.json();
    if (data.status !== 'OK' || !Array.isArray(data.result) || data.result.length === 0) {
      return { isValid: false, error: data.comment || 'Codeforces user not found' };
    }

    const user = data.result[0];
    const stats = {
      rating: typeof user.rating === 'number' ? user.rating : null,
      maxRating: typeof user.maxRating === 'number' ? user.maxRating : null,
      rank: user.rank || 'unranked',
      avatar: user.titlePhoto || user.avatar || null,
      totalSolved: 0,
    };

    return {
      isValid: true,
      username: user.handle,
      stats,
    };
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return {
      isValid: false,
      error: isTimeout ? 'Codeforces connection timed out. Please retry.' : err.message,
    };
  }
}

/**
 * Fetches solved problems by user on Codeforces.
 * @param {string} handle 
 * @param {number} limit 
 * @returns {Promise<{ success: boolean, problems: Array, stats: object, error?: string }>}
 */
async function fetchSolvedProblems(handle, limit = 500) {
  try {
    // 1. Verify user and get ranking info
    const verification = await verifyUser(handle);
    if (!verification.isValid) {
      return { success: false, problems: [], stats: {}, error: verification.error };
    }

    // 2. Fetch user submissions
    const count = Math.min(Math.max(limit, 50), 1000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `${CF_API_BASE}/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${count}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'DSA-Tracker-Sync-Engine/1.0',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        problems: [],
        stats: verification.stats,
        error: `Failed to fetch Codeforces submissions (HTTP ${response.status})`,
      };
    }

    const data = await response.json();
    if (data.status !== 'OK') {
      return {
        success: false,
        problems: [],
        stats: verification.stats,
        error: data.comment || 'Failed to retrieve Codeforces status',
      };
    }

    const rawSubmissions = data.result || [];

    // Filter only Accepted (verdict === 'OK') submissions
    // Deduplicate by problem key `${contestId}-${index}`
    const solvedMap = new Map();

    for (const sub of rawSubmissions) {
      if (sub.verdict !== 'OK') continue;
      const prob = sub.problem;
      if (!prob || !prob.name) continue;

      const contestId = prob.contestId || 'gym';
      const index = prob.index || '';
      const problemKey = `${contestId}-${index}-${prob.name}`.toLowerCase();

      // Keep the earliest or newest valid attempt
      if (!solvedMap.has(problemKey)) {
        solvedMap.set(problemKey, { sub, prob });
      }
    }

    const normalizedProblems = [];
    for (const { sub, prob } of solvedMap.values()) {
      const contestId = prob.contestId;
      const index = prob.index || '';
      const rating = prob.rating;
      const difficulty = mapCodeforcesDifficulty(rating, index);

      const link = contestId
        ? `https://codeforces.com/problemset/problem/${contestId}/${index}`
        : `https://codeforces.com/problemset`;

      const title = contestId && index
        ? `${contestId}${index}. ${prob.name}`
        : prob.name;

      const timestamp = Number(sub.creationTimeSeconds);
      const submittedAt = timestamp > 0 ? new Date(timestamp * 1000) : new Date();

      const topics = Array.isArray(prob.tags) ? prob.tags : [];

      normalizedProblems.push({
        title,
        platform: 'codeforces',
        link,
        difficulty,
        topics,
        submittedAt,
        rawSlug: `${contestId}-${index}`,
      });
    }

    const updatedStats = {
      ...verification.stats,
      totalSolved: normalizedProblems.length,
    };

    return {
      success: true,
      problems: normalizedProblems,
      stats: updatedStats,
    };
  } catch (err) {
    return {
      success: false,
      problems: [],
      stats: {},
      error: err.message,
    };
  }
}

module.exports = {
  verifyUser,
  fetchSolvedProblems,
  mapCodeforcesDifficulty,
};
