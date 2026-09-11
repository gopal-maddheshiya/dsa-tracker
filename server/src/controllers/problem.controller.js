const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');

const VALID_PLATFORMS = ['leetcode', 'gfg', 'codechef', 'hackerrank', 'codeforces', 'atcoder', 'other'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * Normalizes topics by trimming, removing empty strings, and deduplicating
 */
const normalizeTopics = (topics) => {
  if (!topics) return [];
  const rawArray = Array.isArray(topics)
    ? topics
    : typeof topics === 'string'
    ? topics.split(',')
    : [];

  return Array.from(
    new Set(
      rawArray
        .map((t) => String(t).trim())
        .filter((t) => t.length > 0)
    )
  );
};

/**
 * @route   GET /api/problems
 * @desc    Get all problems for the authenticated user with optional filters and derived latest attempt status
 * @access  Private
 */
const getProblems = async (req, res, next) => {
  try {
    const { topic, difficulty, status, search } = req.query;

    const query = { userId: req.user._id };

    // Filter by difficulty
    if (difficulty && VALID_DIFFICULTIES.includes(difficulty.toLowerCase())) {
      query.difficulty = difficulty.toLowerCase();
    }

    // Filter by topic
    if (topic && topic.trim()) {
      query.topics = { $regex: new RegExp(topic.trim(), 'i') };
    }

    // Search by title or topic
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ title: searchRegex }, { topics: searchRegex }];
    }

    // Fetch matching problems
    const problems = await Problem.find(query).sort({ createdAt: -1 });

    if (problems.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Derive latest attempt for each problem to support status filter and UI badges
    const problemIds = problems.map((p) => p._id);
    const attempts = await Attempt.find({
      userId: req.user._id,
      problemId: { $in: problemIds },
    }).sort({ attemptedAt: -1 });

    // Map the most recent attempt to each problem
    const latestAttemptMap = new Map();
    for (const attempt of attempts) {
      const pIdStr = attempt.problemId.toString();
      if (!latestAttemptMap.has(pIdStr)) {
        latestAttemptMap.set(pIdStr, attempt);
      }
    }

    // Enrich problems with derived latest attempt
    let enrichedProblems = problems.map((p) => {
      const json = p.toJSON();
      const latest = latestAttemptMap.get(json.id);
      return {
        ...json,
        latestAttempt: latest ? latest.toJSON() : null,
        attemptCount: attempts.filter((a) => a.problemId.toString() === json.id).length,
      };
    });

    // Filter by derived status if requested
    if (status && status.trim()) {
      const targetStatus = status.trim().toLowerCase();
      if (targetStatus === 'unattempted') {
        enrichedProblems = enrichedProblems.filter((p) => !p.latestAttempt);
      } else {
        enrichedProblems = enrichedProblems.filter(
          (p) => p.latestAttempt && p.latestAttempt.status === targetStatus
        );
      }
    }

    return res.status(200).json({
      success: true,
      count: enrichedProblems.length,
      data: enrichedProblems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/problems
 * @desc    Create a new problem owned by the authenticated user
 * @access  Private
 */
const createProblem = async (req, res, next) => {
  try {
    const { title, platform, link, topics, difficulty, solutionCode, solutionLanguage } = req.body;

    // Validation: Title
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Problem title is required',
      });
    }

    // Validation: Platform
    if (!platform || !VALID_PLATFORMS.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Platform is required and must be one of: ${VALID_PLATFORMS.join(', ')}`,
      });
    }

    // Validation: Link
    if (!link || typeof link !== 'string' || !link.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Problem link is required',
      });
    }

    // Validation: Difficulty
    if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Difficulty is required and must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
      });
    }

    const normalizedTopicList = normalizeTopics(topics);

    const problem = await Problem.create({
      userId: req.user._id,
      title: title.trim(),
      platform: platform.toLowerCase().trim(),
      link: link.trim(),
      topics: normalizedTopicList,
      difficulty: difficulty.toLowerCase().trim(),
      solutionCode: typeof solutionCode === 'string' ? solutionCode : '',
      solutionLanguage: typeof solutionLanguage === 'string' ? solutionLanguage.toLowerCase().trim() : 'cpp',
    });

    return res.status(201).json({
      success: true,
      data: problem.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/problems/:id
 * @desc    Get a single problem and its attempt history (scoped to authenticated user)
 * @access  Private
 */
const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const problem = await Problem.findOne({ _id: id, userId: req.user._id });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Fetch related attempts sorted newest first
    const attempts = await Attempt.find({
      problemId: id,
      userId: req.user._id,
    }).sort({ attemptedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        ...problem.toJSON(),
        attempts: attempts.map((a) => a.toJSON()),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/problems/:id
 * @desc    Update problem details (cannot change ownership userId)
 * @access  Private
 */
const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const problem = await Problem.findOne({ _id: id, userId: req.user._id });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const { title, platform, link, topics, difficulty, solutionCode, solutionLanguage } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      problem.title = title.trim();
    }

    if (platform !== undefined) {
      if (!VALID_PLATFORMS.includes(platform.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
        });
      }
      problem.platform = platform.toLowerCase().trim();
    }

    if (link !== undefined) {
      if (typeof link !== 'string' || !link.trim()) {
        return res.status(400).json({ success: false, message: 'Link cannot be empty' });
      }
      problem.link = link.trim();
    }

    if (topics !== undefined) {
      problem.topics = normalizeTopics(topics);
    }

    if (difficulty !== undefined) {
      if (!VALID_DIFFICULTIES.includes(difficulty.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
        });
      }
      problem.difficulty = difficulty.toLowerCase().trim();
    }

    if (solutionCode !== undefined) {
      problem.solutionCode = typeof solutionCode === 'string' ? solutionCode : '';
    }

    if (solutionLanguage !== undefined) {
      problem.solutionLanguage = typeof solutionLanguage === 'string' ? solutionLanguage.toLowerCase().trim() : 'cpp';
    }

    await problem.save();

    return res.status(200).json({
      success: true,
      data: problem.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/problems/:id
 * @desc    Delete a problem and cascade delete all associated attempts
 * @access  Private
 */
const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const problem = await Problem.findOne({ _id: id, userId: req.user._id });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Delete problem document
    await Problem.deleteOne({ _id: id, userId: req.user._id });

    // Cascade delete all related attempts to ensure zero orphaned records
    await Attempt.deleteMany({ problemId: id, userId: req.user._id });

    return res.status(200).json({
      success: true,
      message: 'Problem and associated attempt history deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/problems/import
 * @desc    Bulk import problems (and optional attempts) for authenticated user
 * @access  Private
 */
const importProblems = async (req, res, next) => {
  try {
    const { problems } = req.body;

    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Problems array is required and cannot be empty',
      });
    }

    if (problems.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Import limit exceeded. Maximum 1000 problems per batch.',
      });
    }

    // Fetch existing problems for this user to detect duplicates by title or link
    const existingProblems = await Problem.find({ userId: req.user._id });
    const existingTitles = new Set(existingProblems.map((p) => p.title.trim().toLowerCase()));
    const existingLinks = new Set(existingProblems.map((p) => p.link.trim().toLowerCase()));

    let importedCount = 0;
    let skippedCount = 0;

    for (const item of problems) {
      if (!item || typeof item !== 'object') {
        skippedCount++;
        continue;
      }

      const rawTitle = typeof item.title === 'string' ? item.title.trim() : '';
      if (!rawTitle) {
        skippedCount++;
        continue;
      }

      const rawLink = typeof item.link === 'string' && item.link.trim()
        ? item.link.trim()
        : `https://example.com/problem/${encodeURIComponent(rawTitle.toLowerCase().replace(/\s+/g, '-'))}`;

      // Duplicate check
      if (existingTitles.has(rawTitle.toLowerCase()) || (rawLink && existingLinks.has(rawLink.toLowerCase()))) {
        skippedCount++;
        continue;
      }

      // Sanitize platform
      let rawPlatform = typeof item.platform === 'string' ? item.platform.toLowerCase().trim() : 'other';
      if (!VALID_PLATFORMS.includes(rawPlatform)) {
        rawPlatform = 'other';
      }

      // Sanitize difficulty
      let rawDiff = typeof item.difficulty === 'string' ? item.difficulty.toLowerCase().trim() : 'medium';
      if (!VALID_DIFFICULTIES.includes(rawDiff)) {
        rawDiff = 'medium';
      }

      // Sanitize topics
      const normalizedTopicList = normalizeTopics(item.topics);

      const newProblem = await Problem.create({
        userId: req.user._id,
        title: rawTitle,
        platform: rawPlatform,
        link: rawLink,
        topics: normalizedTopicList,
        difficulty: rawDiff,
        solutionCode: typeof item.solutionCode === 'string' ? item.solutionCode : '',
        solutionLanguage: typeof item.solutionLanguage === 'string' ? item.solutionLanguage.toLowerCase().trim() : 'cpp',
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      });

      existingTitles.add(rawTitle.toLowerCase());
      existingLinks.add(rawLink.toLowerCase());
      importedCount++;

      // If item has attempts array, restore attempts as well
      if (Array.isArray(item.attempts) && item.attempts.length > 0) {
        for (const att of item.attempts) {
          const status = ['solved', 'struggled', 'revisit_needed'].includes(att.status) ? att.status : 'solved';
          await Attempt.create({
            problemId: newProblem._id,
            userId: req.user._id,
            status,
            timeTakenMinutes: typeof att.timeTakenMinutes === 'number' && att.timeTakenMinutes >= 0 ? att.timeTakenMinutes : null,
            notes: typeof att.notes === 'string' ? att.notes.trim() : '',
            attemptedAt: att.attemptedAt ? new Date(att.attemptedAt) : new Date(),
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: importedCount,
      skipped: skippedCount,
      message: `Successfully imported ${importedCount} problems (${skippedCount} duplicates skipped).`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Extracts a LeetCode problem slug from a URL or raw string
 */
const extractLeetCodeSlug = (input) => {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/leetcode\.com\/problems\/([^/?#]+)/i);
  if (match) return match[1].toLowerCase();
  if (/^[a-z0-9-]+$/i.test(trimmed) && !trimmed.includes('.')) {
    return trimmed.toLowerCase();
  }
  return null;
};

/**
 * @route   POST /api/problems/resolve-metadata
 * @desc    Auto-resolve problem metadata (title, difficulty, topics, platform) from URL
 * @access  Private
 */
const resolveProblemMetadata = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A problem URL or slug is required.',
      });
    }

    const trimmedUrl = url.trim();

    // 1. Detect if it's a LeetCode problem
    const leetcodeSlug = extractLeetCodeSlug(trimmedUrl);
    if (leetcodeSlug) {
      try {
        const query = `query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionFrontendId
            title
            difficulty
            topicTags {
              name
            }
          }
        }`;

        const lcResponse = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://leetcode.com',
          },
          body: JSON.stringify({
            query,
            variables: { titleSlug: leetcodeSlug },
          }),
        });

        const lcJson = await lcResponse.json();
        const question = lcJson?.data?.question;

        if (question && question.title) {
          return res.status(200).json({
            success: true,
            data: {
              platform: 'leetcode',
              title: `${question.questionFrontendId ? `${question.questionFrontendId}. ` : ''}${question.title}`,
              rawTitle: question.title,
              frontendId: question.questionFrontendId,
              difficulty: (question.difficulty || 'Medium').toLowerCase(),
              topics: Array.isArray(question.topicTags) ? question.topicTags.map((t) => t.name) : [],
              link: trimmedUrl.startsWith('http') ? trimmedUrl : `https://leetcode.com/problems/${leetcodeSlug}/`,
            },
          });
        }
      } catch (lcErr) {
        console.warn('LeetCode GraphQL fetch failed, falling back to slug parsing:', lcErr.message);
      }

      // Fallback if GraphQL was blocked or timed out
      const formattedTitle = leetcodeSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      return res.status(200).json({
        success: true,
        data: {
          platform: 'leetcode',
          title: formattedTitle,
          difficulty: 'medium',
          topics: [],
          link: trimmedUrl.startsWith('http') ? trimmedUrl : `https://leetcode.com/problems/${leetcodeSlug}/`,
        },
      });
    }

    // 2. Detect GeeksforGeeks
    if (/geeksforgeeks\.org/i.test(trimmedUrl)) {
      const gfgMatch = trimmedUrl.match(/geeksforgeeks\.org\/problems\/([^/?#]+)/i);
      const rawSlug = gfgMatch ? gfgMatch[1] : '';
      const cleanSlug = rawSlug.replace(/-\d+$/, '').replace(/-/g, ' ');
      const title = cleanSlug
        ? cleanSlug
            .split(' ')
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        : 'GeeksforGeeks Problem';

      return res.status(200).json({
        success: true,
        data: {
          platform: 'gfg',
          title,
          difficulty: 'medium',
          topics: [],
          link: trimmedUrl,
        },
      });
    }

    // 3. Detect Codeforces
    if (/codeforces\.com/i.test(trimmedUrl)) {
      return res.status(200).json({
        success: true,
        data: {
          platform: 'codeforces',
          title: 'Codeforces Problem',
          difficulty: 'medium',
          topics: [],
          link: trimmedUrl,
        },
      });
    }

    // 4. Detect HackerRank
    if (/hackerrank\.com/i.test(trimmedUrl)) {
      const hrMatch = trimmedUrl.match(/challenges\/([^/?#]+)/i);
      const title = hrMatch
        ? hrMatch[1]
            .split('-')
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        : 'HackerRank Challenge';

      return res.status(200).json({
        success: true,
        data: {
          platform: 'hackerrank',
          title,
          difficulty: 'medium',
          topics: [],
          link: trimmedUrl,
        },
      });
    }

    // Default unknown / generic URL
    return res.status(200).json({
      success: true,
      data: {
        platform: 'other',
        title: '',
        difficulty: 'medium',
        topics: [],
        link: trimmedUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/problems/recommendations
 * @desc    Intelligent recommendations: Spaced repetition, Weakest topic drills, and Daily Focus
 * @access  Private
 */
const getProblemRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    // Fetch user problems and attempts
    const [problems, attempts] = await Promise.all([
      Problem.find({ userId }).lean(),
      Attempt.find({ userId }).sort({ attemptedAt: -1 }).lean(),
    ]);

    if (!problems.length) {
      return res.status(200).json({
        success: true,
        data: {
          dailyFocus: null,
          spacedRepetition: [],
          weaknessDrill: [],
          unattemptedBacklog: [],
          weakestTopics: [],
          totalCataloged: 0,
        },
      });
    }

    // Map attempts per problem
    const attemptsByProblem = new Map();
    attempts.forEach((a) => {
      const pId = a.problemId.toString();
      if (!attemptsByProblem.has(pId)) {
        attemptsByProblem.set(pId, []);
      }
      attemptsByProblem.get(pId).push(a);
    });

    // Topic struggle metrics
    const topicStats = {};
    problems.forEach((p) => {
      const pAttempts = attemptsByProblem.get(p._id.toString()) || [];
      const pTopics = p.topics || [];

      pTopics.forEach((topic) => {
        const t = topic.trim();
        if (!t) return;
        if (!topicStats[t]) {
          topicStats[t] = { topic: t, totalAttempts: 0, struggledAttempts: 0, solvedCount: 0 };
        }
        pAttempts.forEach((att) => {
          topicStats[t].totalAttempts++;
          if (att.status === 'struggled') topicStats[t].struggledAttempts++;
          if (att.status === 'solved') topicStats[t].solvedCount++;
        });
      });
    });

    // Rank weakest topics by struggle ratio
    const weakestTopics = Object.values(topicStats)
      .filter((ts) => ts.totalAttempts >= 1)
      .map((ts) => ({
        topic: ts.topic,
        struggleRatio: ts.struggledAttempts / (ts.totalAttempts || 1),
        totalAttempts: ts.totalAttempts,
        struggledAttempts: ts.struggledAttempts,
      }))
      .sort((a, b) => b.struggleRatio - a.struggleRatio || b.totalAttempts - a.totalAttempts);

    const primaryWeakTopic = weakestTopics[0]?.topic?.toLowerCase() || null;

    const now = Date.now();
    const REVISION_INTERVALS = { solved: 14, revisit_needed: 5, struggled: 2 };
    const STRUGGLE_WEIGHTS = { solved: 0, revisit_needed: 1, struggled: 2.5 };

    const spacedList = [];
    const weaknessList = [];
    const unattemptedList = [];

    problems.forEach((prob) => {
      const pId = prob._id.toString();
      const pAttempts = attemptsByProblem.get(pId) || [];
      const latestAttempt = pAttempts[0] || null;

      const probSummary = {
        id: pId,
        title: prob.title,
        platform: prob.platform,
        difficulty: prob.difficulty,
        topics: prob.topics || [],
        link: prob.link,
        latestStatus: latestAttempt ? latestAttempt.status : 'unattempted',
        lastAttemptedAt: latestAttempt ? latestAttempt.attemptedAt : null,
      };

      if (!latestAttempt) {
        unattemptedList.push(probSummary);
      } else {
        const daysElapsed = Math.max(0, (now - new Date(latestAttempt.attemptedAt).getTime()) / (1000 * 60 * 60 * 24));
        const interval = REVISION_INTERVALS[latestAttempt.status] || 14;
        const weight = STRUGGLE_WEIGHTS[latestAttempt.status] || 0;
        const urgencyScore = (daysElapsed / interval) + weight;

        const withScore = {
          ...probSummary,
          daysSinceLastAttempt: Math.round(daysElapsed),
          urgencyScore: Number(urgencyScore.toFixed(2)),
        };

        if (latestAttempt.status !== 'solved' || urgencyScore >= 1.0) {
          spacedList.push(withScore);
        }

        // If in weakest topic and either struggled or revisit_needed
        if (
          primaryWeakTopic &&
          prob.topics.some((t) => t.toLowerCase().includes(primaryWeakTopic)) &&
          latestAttempt.status !== 'solved'
        ) {
          weaknessList.push(withScore);
        }
      }
    });

    // Also if weakness list is short, add unattempted problems that match weakest topic
    if (primaryWeakTopic && weaknessList.length < 3) {
      unattemptedList.forEach((prob) => {
        if (prob.topics.some((t) => t.toLowerCase().includes(primaryWeakTopic))) {
          if (!weaknessList.some((w) => w.id === prob.id)) {
            weaknessList.push(prob);
          }
        }
      });
    }

    // Sort spaced repetition by highest urgency
    spacedList.sort((a, b) => b.urgencyScore - a.urgencyScore);

    // Determine Daily Focus (The single highest priority problem for today)
    let dailyFocus = null;
    if (spacedList.length > 0 && spacedList[0].urgencyScore >= 1.2) {
      const top = spacedList[0];
      dailyFocus = {
        ...top,
        badge: 'Critical Revision',
        rationale: `You ${top.latestStatus === 'struggled' ? 'struggled with' : 'flagged'} this problem ${top.daysSinceLastAttempt} days ago. Strengthen this pattern before it fades.`,
      };
    } else if (weaknessList.length > 0) {
      const top = weaknessList[0];
      dailyFocus = {
        ...top,
        badge: 'Weak Spot Drill',
        rationale: `Topic drill: "${primaryWeakTopic}" is currently your highest struggle area (${Math.round((weakestTopics[0]?.struggleRatio || 0) * 100)}% struggle rate). Tackle this to boost confidence.`,
      };
    } else if (unattemptedList.length > 0) {
      // Pick a medium if available, else first unattempted
      const chosen = unattemptedList.find((p) => p.difficulty === 'medium') || unattemptedList[0];
      dailyFocus = {
        ...chosen,
        badge: 'New Frontier',
        rationale: `Fresh cataloged challenge to keep your daily solving momentum active!`,
      };
    } else if (problems.length > 0) {
      const chosen = problems[0];
      dailyFocus = {
        id: chosen._id.toString(),
        title: chosen.title,
        platform: chosen.platform,
        difficulty: chosen.difficulty,
        topics: chosen.topics || [],
        link: chosen.link,
        badge: 'Daily Warmup',
        rationale: 'Review and refine your optimal solution to keep your problem-solving reflex sharp.',
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        dailyFocus,
        spacedRepetition: spacedList.slice(0, 5),
        weaknessDrill: weaknessList.slice(0, 5),
        unattemptedBacklog: unattemptedList.slice(0, 5),
        weakestTopics: weakestTopics.slice(0, 3),
        totalCataloged: problems.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProblems,
  createProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
  importProblems,
  resolveProblemMetadata,
  getProblemRecommendations,
};

