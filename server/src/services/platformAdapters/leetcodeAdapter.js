/**
 * LeetCode Platform Adapter
 * Interacts with public LeetCode GraphQL API to verify users and extract accepted submissions.
 */

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://leetcode.com',
};

/**
 * Verifies if a LeetCode username exists and returns user statistics.
 * @param {string} username 
 * @returns {Promise<{ isValid: boolean, username?: string, stats?: object, error?: string }>}
 */
async function verifyUser(username) {
  try {
    const cleanUsername = String(username || '').trim();
    if (!cleanUsername) {
      return { isValid: false, error: 'Username is required' };
    }

    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            userAvatar
            realName
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        query,
        variables: { username: cleanUsername },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { isValid: false, error: `LeetCode API responded with HTTP ${response.status}` };
    }

    const data = await response.json();
    const matchedUser = data?.data?.matchedUser;

    if (!matchedUser || !matchedUser.username) {
      return { isValid: false, error: 'LeetCode user not found' };
    }

    const acStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    const stats = {
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      ranking: matchedUser.profile?.ranking || null,
      avatar: matchedUser.profile?.userAvatar || null,
    };

    for (const item of acStats) {
      const diff = String(item.difficulty || '').toLowerCase();
      const count = Number(item.count) || 0;
      if (diff === 'all') stats.totalSolved = count;
      else if (diff === 'easy') stats.easy = count;
      else if (diff === 'medium') stats.medium = count;
      else if (diff === 'hard') stats.hard = count;
    }

    return {
      isValid: true,
      username: matchedUser.username,
      stats,
    };
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return {
      isValid: false,
      error: isTimeout ? 'LeetCode connection timed out. Please retry.' : err.message,
    };
  }
}

/**
 * Fetches question details (difficulty and topicTags) for a problem slug.
 * Cached in-memory to avoid redundant queries.
 */
const questionDetailsCache = new Map();

async function fetchQuestionDetails(titleSlug) {
  if (questionDetailsCache.has(titleSlug)) {
    return questionDetailsCache.get(titleSlug);
  }

  try {
    const query = `
      query getQuestionDetails($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionFrontendId
          title
          difficulty
          topicTags {
            name
          }
        }
      }
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ query, variables: { titleSlug } }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      const q = json?.data?.question;
      if (q) {
        const details = {
          frontendId: q.questionFrontendId,
          title: q.title,
          difficulty: String(q.difficulty || 'medium').toLowerCase(),
          topics: Array.isArray(q.topicTags) ? q.topicTags.map((t) => t.name) : [],
        };
        questionDetailsCache.set(titleSlug, details);
        return details;
      }
    }
  } catch {
    // Graceful fallback to null
  }

  return null;
}

/**
 * Fetches accepted problems solved by the user on LeetCode.
 * @param {string} username 
 * @param {number} limit 
 * @returns {Promise<{ success: boolean, problems: Array, stats: object, error?: string }>}
 */
async function fetchSolvedProblems(username, limit = 50) {
  try {
    // 1. Verify user and get overall stats
    const verification = await verifyUser(username);
    if (!verification.isValid) {
      return { success: false, problems: [], stats: {}, error: verification.error };
    }

    // 2. Fetch both recent AC submissions and general recent submissions
    const query = `
      query getRecentSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
        }
        recentSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          statusDisplay
        }
      }
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        query,
        variables: { username, limit: Math.min(limit, 50) },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        problems: [],
        stats: verification.stats,
        error: `Failed to fetch recent submissions (HTTP ${response.status})`,
      };
    }

    const data = await response.json();
    const rawAcList = data?.data?.recentAcSubmissionList || [];
    const rawGeneralList = (data?.data?.recentSubmissionList || []).filter(
      (item) => String(item.statusDisplay || '').toLowerCase() === 'accepted'
    );

    // Deduplicate submissions by titleSlug (merging both sources)
    const slugMap = new Map();
    for (const item of [...rawAcList, ...rawGeneralList]) {
      if (!item.titleSlug) continue;
      if (!slugMap.has(item.titleSlug)) {
        slugMap.set(item.titleSlug, item);
      }
    }

    // Enrich with difficulty & topic tags
    const normalizedProblems = [];
    for (const [titleSlug, item] of slugMap.entries()) {
      const details = await fetchQuestionDetails(titleSlug);

      const timestampNum = Number(item.timestamp);
      const submittedAt = timestampNum > 0 ? new Date(timestampNum * 1000) : new Date();

      const title = details?.title || item.title || titleSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      const difficulty = details?.difficulty || 'medium';
      const topics = details?.topics || [];

      normalizedProblems.push({
        title,
        platform: 'leetcode',
        link: `https://leetcode.com/problems/${titleSlug}/`,
        difficulty,
        topics,
        submittedAt,
        rawSlug: titleSlug,
      });
    }

    return {
      success: true,
      problems: normalizedProblems,
      stats: verification.stats,
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

/**
 * Enriches a batch list of problem slugs or URLs into fully formed Problem objects.
 * Useful for 1-click importing of complete historical problem lists (e.g. 50+ problems).
 * @param {string[]} items - Array of slugs or URLs
 * @returns {Promise<Array>}
 */
async function fetchProblemsBySlugs(items = []) {
  const normalizedProblems = [];
  const processedSlugs = new Set();

  for (const raw of items) {
    if (!raw) continue;
    let clean = String(raw).trim();

    // Extract slug from URL if pasted (e.g. https://leetcode.com/problems/two-sum/)
    if (clean.includes('/problems/')) {
      const parts = clean.split('/problems/')[1]?.split('/')[0];
      if (parts) clean = parts;
    }
    clean = clean.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    if (!clean || processedSlugs.has(clean)) continue;
    processedSlugs.add(clean);

    const details = await fetchQuestionDetails(clean);
    const title = details?.title || clean.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const difficulty = details?.difficulty || 'medium';
    const topics = details?.topics || [];

    normalizedProblems.push({
      title,
      platform: 'leetcode',
      link: `https://leetcode.com/problems/${clean}/`,
      difficulty,
      topics,
      submittedAt: new Date(),
      rawSlug: clean,
    });
  }

  return normalizedProblems;
}

module.exports = {
  verifyUser,
  fetchSolvedProblems,
  fetchProblemsBySlugs,
};
