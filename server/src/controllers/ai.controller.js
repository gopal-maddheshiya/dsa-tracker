const mongoose = require('mongoose');
const {
  buildAIContext,
  buildTakeawayContext,
  buildWeeklyReviewContext,
} = require('../services/aiContext.service');
const {
  generateCoachingNote,
  generateTakeaway,
  generateWeeklyReview,
  generateDeterministicWeeklyReviewFallback,
} = require('../services/gemini.service');

// Process-local in-memory caches
// coachCache: `${userId}:${problemId}:${attemptTimestamp}`
// takeawayCache: `${userId}:takeaway:${attemptId}:${attemptTimestamp}:${notesHash}`
// weeklyReviewCache: `${userId}:weekly-review:${weekStart}:${analyticsFingerprint}`
const coachCache = new Map();
const takeawayCache = new Map();
const weeklyReviewCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Process-local in-memory rate limiter (shared across AI endpoints)
// Key: userId
// Value: [timestamp1, timestamp2, ...]
const userRateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 AI requests per 15 min per user

/**
 * Checks and updates rate limit for the user.
 * @param {string} userId
 * @returns {boolean} True if allowed, false if limit exceeded
 */
const checkRateLimit = (userId) => {
  const now = Date.now();
  const timestamps = userRateLimits.get(userId) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    userRateLimits.set(userId, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  userRateLimits.set(userId, validTimestamps);
  return true;
};

/**
 * Resets rate limit and caches (used in tests or administrative resets).
 */
const clearCoachCacheAndRateLimits = () => {
  coachCache.clear();
  takeawayCache.clear();
  weeklyReviewCache.clear();
  userRateLimits.clear();
};

/**
 * Computes a quick deterministic fingerprint of notes string for cache invalidation.
 * @param {string} str
 * @returns {string} Fingerprint
 */
const hashNotes = (str) => {
  if (!str) return 'empty';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
};

/**
 * @route   POST /api/ai/coach
 * @desc    Generate a grounded, structured coaching note for Today's Focus problem
 * @access  Private (Authenticated users only)
 */
const getCoachingNote = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.body;

    // 1. Validate problemId format
    if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid problemId is required',
      });
    }

    // 2. Build verified telemetry context (enforcing strict user ownership)
    const context = await buildAIContext(userId, problemId);
    if (!context) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found or unauthorized',
      });
    }

    // 3. Check process-local cache first (deduplication)
    const attemptStamp = context.revision?.latestAttemptTimestamp || 'no_attempt';
    const cacheKey = `${userId.toString()}:${problemId.toString()}:${attemptStamp}`;
    const cachedEntry = coachCache.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.cachedAt < CACHE_TTL_MS) {
      return res.status(200).json({
        success: true,
        data: cachedEntry.data,
      });
    }

    // 4. Check shared user rate limiting (only consumes quota on cache misses)
    const isAllowed = checkRateLimit(userId.toString());
    if (!isAllowed) {
      return res.status(429).json({
        success: false,
        message: 'Coaching request limit reached (5 requests per 15 minutes). Please try again shortly.',
      });
    }

    // 5. Generate coaching note via Gemini (or deterministic fallback)
    const coachingData = await generateCoachingNote(context);

    // 6. Cache the successful result
    coachCache.set(cacheKey, {
      data: coachingData,
      cachedAt: Date.now(),
    });

    return res.status(200).json({
      success: true,
      data: coachingData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/ai/takeaway
 * @desc    Synthesize a post-attempt reflection into a concise takeaway (preview only, no DB write)
 * @access  Private (Authenticated users only)
 */
const getAttemptTakeaway = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { attemptId } = req.body;

    // 1. Validate attemptId format
    if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid attemptId is required',
      });
    }

    // 2. Build verified telemetry context (enforcing strict attempt & problem ownership)
    const context = await buildTakeawayContext(userId, attemptId);
    if (!context) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found or unauthorized',
      });
    }

    // 3. Check process-local cache (keyed on attemptId + timestamp + notes hash)
    const notesFingerprint = hashNotes(context.attempt.notes);
    const cacheKey = `${userId.toString()}:takeaway:${attemptId.toString()}:${context.attempt.attemptTimestamp}:${notesFingerprint}`;
    const cachedEntry = takeawayCache.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.cachedAt < CACHE_TTL_MS) {
      return res.status(200).json({
        success: true,
        data: cachedEntry.data,
      });
    }

    // 4. Check shared user rate limiting (only consumes quota on cache misses)
    const isAllowed = checkRateLimit(userId.toString());
    if (!isAllowed) {
      return res.status(429).json({
        success: false,
        message: 'AI request limit reached (5 requests per 15 minutes). Please try again shortly.',
      });
    }

    // 5. Generate takeaway via Gemini (or deterministic fallback)
    const takeawayData = await generateTakeaway(context);

    // 6. Cache the successful result
    takeawayCache.set(cacheKey, {
      data: takeawayData,
      cachedAt: Date.now(),
    });

    return res.status(200).json({
      success: true,
      data: takeawayData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/ai/weekly-review
 * @desc    Generate a grounded, structured 7-day progress review
 * @access  Private (Authenticated users only)
 */
const getWeeklyReview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Build verified weekly telemetry context
    const context = await buildWeeklyReviewContext(userId);

    // 2. Empty-week behavior: If user has 0 attempts in the 7 days,
    // return useful deterministic response immediately without invoking Gemini or consuming rate limit
    if (!context.activity || context.activity.attempts === 0) {
      const fallbackData = generateDeterministicWeeklyReviewFallback(context);
      return res.status(200).json({
        success: true,
        data: fallbackData,
      });
    }

    // 3. Check process-local cache with weekly fingerprint
    const weekStart = context.period.start;
    const analyticsFingerprint = `${context.activity.attempts}_${context.activity.solved}_${context.activity.struggled}_${context.activity.revisitNeeded}_${context.activity.uniqueProblems}_${context.consistency.activeDays}_${context.revision.dueCount}_${context.topics.weakest || 'none'}`;
    const cacheKey = `${userId.toString()}:weekly-review:${weekStart}:${analyticsFingerprint}`;
    const cachedEntry = weeklyReviewCache.get(cacheKey);

    if (cachedEntry && Date.now() - cachedEntry.cachedAt < CACHE_TTL_MS) {
      return res.status(200).json({
        success: true,
        data: cachedEntry.data,
      });
    }

    // 4. Check shared user rate limiting (only consumes quota on cache misses)
    const isAllowed = checkRateLimit(userId.toString());
    if (!isAllowed) {
      return res.status(429).json({
        success: false,
        message: 'AI request limit reached (5 requests per 15 minutes). Please try again shortly.',
      });
    }

    // 5. Generate weekly review via Gemini (or deterministic fallback)
    const weeklyReviewData = await generateWeeklyReview(context);

    // 6. Cache the successful result
    weeklyReviewCache.set(cacheKey, {
      data: weeklyReviewData,
      cachedAt: Date.now(),
    });

    return res.status(200).json({
      success: true,
      data: weeklyReviewData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoachingNote,
  getAttemptTakeaway,
  getWeeklyReview,
  clearCoachCacheAndRateLimits,
};
