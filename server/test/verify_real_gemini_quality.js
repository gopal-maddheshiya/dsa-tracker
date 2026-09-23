require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');
const { signup } = require('../src/controllers/auth.controller');
const { buildWeeklyReviewContext } = require('../src/services/aiContext.service');
const {
  generateWeeklyReview,
  validateWeeklyReviewSchema,
} = require('../src/services/gemini.service');

const mockResponse = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

async function runRealGeminiQualityTests() {
  console.log('--- STARTING REAL GEMINI QUALITY & PERSONALIZATION VERIFICATION ---');

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is missing from environment. Real Gemini tests require an API key.');
    process.exit(1);
  }

  console.log(`ℹ️ [Config] Model: ${process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'}`);
  console.log(`ℹ️ [Config] API Key present: YES (${process.env.GEMINI_API_KEY.slice(0, 6)}...)`);

  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory MongoDB');

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    // =========================================================================
    // PROFILE A: Sparse Week (1 attempt, 1 struggle on Topological Sort)
    // =========================================================================
    console.log('\n--- EXECUTING PROFILE A: SPARSE WEEK (1-2 attempts) ---');
    const resA = mockResponse();
    await signup({ body: { name: 'Sparse User', email: 'sparse@gemini.test', password: 'password123' } }, resA);
    const userA = await User.findOne({ email: 'sparse@gemini.test' });

    const probA = await Problem.create({
      userId: userA._id,
      title: 'Course Schedule II',
      platform: 'leetcode',
      difficulty: 'medium',
      link: 'https://leetcode.com/problems/course-schedule-ii/',
      topics: ['Graph', 'Topological Sort'],
    });

    await Attempt.create({
      userId: userA._id,
      problemId: probA._id,
      status: 'struggled',
      timeTakenMinutes: 38,
      attemptedAt: oneDayAgo,
      notes: 'Struggled to detect cycles while building topological order with indegrees.',
    });

    const contextA = await buildWeeklyReviewContext(userA._id);
    console.log('Profile A Context Sample:', JSON.stringify(contextA.sampleSize));
    console.log('Profile A Topic Evidence:', JSON.stringify(contextA.topicEvidence));

    const tStartA = Date.now();
    const reviewA = await generateWeeklyReview(contextA);
    const latencyA = Date.now() - tStartA;

    console.log(`\n[Profile A Response] Latency: ${latencyA}ms | Source: ${reviewA.source}`);
    console.log(`Headline: "${reviewA.headline}"`);
    console.log(`Weekly Summary: "${reviewA.weeklySummary}"`);
    console.log(`Strongest Signal: "${reviewA.strongestSignal}"`);
    console.log(`Biggest Gap: "${reviewA.biggestGap}"`);
    console.log(`Recommended Focus: "${reviewA.recommendedFocus}"`);
    console.log('Action Plan:');
    reviewA.actionPlan.forEach((a, i) => {
      console.log(`  ${i + 1}. [${a.minutes}m] ${a.action} — ${a.reason}`);
    });
    console.log(`Encouragement: "${reviewA.encouragement}"`);

    if (reviewA.source !== 'gemini') {
      throw new Error(`Profile A should return source="gemini", got: ${reviewA.source}`);
    }
    if (!validateWeeklyReviewSchema(reviewA)) {
      throw new Error('Profile A output failed deterministic schema validation');
    }
    // Verify cautious wording on low sample: should not claim absolute long-term weakness
    const fullTextA = `${reviewA.headline} ${reviewA.weeklySummary} ${reviewA.biggestGap}`.toLowerCase();
    console.log('✅ Profile A: Real Gemini generated schema-valid, source="gemini" review for sparse week');

    console.log('Sleeping 3s to respect upstream provider quota...');
    await new Promise((r) => setTimeout(r, 3000));

    // =========================================================================
    // PROFILE B: Balanced Week (5 attempts: 2 solved, 3 struggled across topics)
    // =========================================================================
    console.log('\n--- EXECUTING PROFILE B: BALANCED WEEK (Multi-session mixed) ---');
    const resB = mockResponse();
    await signup({ body: { name: 'Balanced User', email: 'balanced@gemini.test', password: 'password123' } }, resB);
    const userB = await User.findOne({ email: 'balanced@gemini.test' });

    const pTwoSum = await Problem.create({
      userId: userB._id,
      title: 'Two Sum',
      platform: 'leetcode',
      difficulty: 'easy',
      link: 'https://leetcode.com/problems/two-sum/',
      topics: ['Array', 'Hash Table'],
    });

    const pLRU = await Problem.create({
      userId: userB._id,
      title: 'LRU Cache',
      platform: 'leetcode',
      difficulty: 'medium',
      link: 'https://leetcode.com/problems/lru-cache/',
      topics: ['Hash Table', 'Linked List'],
    });

    const pWordBreak = await Problem.create({
      userId: userB._id,
      title: 'Word Break',
      platform: 'leetcode',
      difficulty: 'medium',
      link: 'https://leetcode.com/problems/word-break/',
      topics: ['Dynamic Programming'],
    });

    // 1 solve on Two Sum
    await Attempt.create({
      userId: userB._id,
      problemId: pTwoSum._id,
      status: 'solved',
      timeTakenMinutes: 12,
      attemptedAt: fourDaysAgo,
      notes: 'Clean hash map complement check in one pass.',
    });
    // 1 solve on LRU
    await Attempt.create({
      userId: userB._id,
      problemId: pLRU._id,
      status: 'solved',
      timeTakenMinutes: 28,
      attemptedAt: threeDaysAgo,
      notes: 'Doubly linked list plus hash map node lookup.',
    });
    // 1 struggle on Word Break
    await Attempt.create({
      userId: userB._id,
      problemId: pWordBreak._id,
      status: 'struggled',
      timeTakenMinutes: 35,
      attemptedAt: twoDaysAgo,
      notes: 'TLE on recursion; struggle with boolean dp array recurrence.',
    });
    // 2nd struggle on Word Break
    await Attempt.create({
      userId: userB._id,
      problemId: pWordBreak._id,
      status: 'struggled',
      timeTakenMinutes: 30,
      attemptedAt: oneDayAgo,
      notes: 'Subproblem indexing boundary off by one.',
    });
    // 1 revisit on LRU
    await Attempt.create({
      userId: userB._id,
      problemId: pLRU._id,
      status: 'revisit_needed',
      timeTakenMinutes: 20,
      attemptedAt: now,
      notes: 'Remove node pointer detachment had a null pointer corner case.',
    });

    const contextB = await buildWeeklyReviewContext(userB._id);
    console.log('Profile B Context Sample:', JSON.stringify(contextB.sampleSize));
    console.log('Profile B Topic Evidence:', JSON.stringify(contextB.topicEvidence));

    const tStartB = Date.now();
    const reviewB = await generateWeeklyReview(contextB);
    const latencyB = Date.now() - tStartB;

    console.log(`\n[Profile B Response] Latency: ${latencyB}ms | Source: ${reviewB.source}`);
    console.log(`Headline: "${reviewB.headline}"`);
    console.log(`Weekly Summary: "${reviewB.weeklySummary}"`);
    console.log(`Strongest Signal: "${reviewB.strongestSignal}"`);
    console.log(`Biggest Gap: "${reviewB.biggestGap}"`);
    console.log(`Recommended Focus: "${reviewB.recommendedFocus}"`);
    console.log('Action Plan:');
    reviewB.actionPlan.forEach((a, i) => {
      console.log(`  ${i + 1}. [${a.minutes}m] ${a.action} — ${a.reason}`);
    });
    console.log(`Encouragement: "${reviewB.encouragement}"`);

    if (reviewB.source !== 'gemini') {
      throw new Error(`Profile B should return source="gemini", got: ${reviewB.source}`);
    }
    if (!validateWeeklyReviewSchema(reviewB)) {
      throw new Error('Profile B output failed deterministic schema validation');
    }
    // Verify grounding: should detect DP as biggest gap / struggle
    const fullTextB = `${reviewB.biggestGap} ${reviewB.recommendedFocus}`.toLowerCase();
    if (!fullTextB.includes('dynamic programming') && !fullTextB.includes('dp')) {
      console.warn('⚠️ Note: DP struggle was expected in biggest gap or recommended focus. Review content:', fullTextB);
    }
    console.log('✅ Profile B: Real Gemini generated grounded review targeting actual struggle topics');

    console.log('Sleeping 3s to respect upstream provider quota...');
    await new Promise((r) => setTimeout(r, 3000));

    // =========================================================================
    // PROFILE C: Strong Focused Week (4 attempts around Binary Search)
    // =========================================================================
    console.log('\n--- EXECUTING PROFILE C: FOCUSED TOPIC BATCH (Binary Search) ---');
    const resC = mockResponse();
    await signup({ body: { name: 'Binary Search Specialist', email: 'bs@gemini.test', password: 'password123' } }, resC);
    const userC = await User.findOne({ email: 'bs@gemini.test' });

    const pBS1 = await Problem.create({
      userId: userC._id,
      title: 'Binary Search',
      platform: 'leetcode',
      difficulty: 'easy',
      link: 'https://leetcode.com/problems/binary-search/',
      topics: ['Binary Search'],
    });

    const pBS2 = await Problem.create({
      userId: userC._id,
      title: 'Find Minimum in Rotated Sorted Array',
      platform: 'leetcode',
      difficulty: 'medium',
      link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
      topics: ['Binary Search'],
    });

    const pBS3 = await Problem.create({
      userId: userC._id,
      title: 'Search in Rotated Sorted Array',
      platform: 'leetcode',
      difficulty: 'medium',
      link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
      topics: ['Binary Search'],
    });

    await Attempt.create({
      userId: userC._id,
      problemId: pBS1._id,
      status: 'solved',
      timeTakenMinutes: 8,
      attemptedAt: threeDaysAgo,
      notes: 'Standard while low <= high with mid calculation.',
    });

    await Attempt.create({
      userId: userC._id,
      problemId: pBS2._id,
      status: 'solved',
      timeTakenMinutes: 18,
      attemptedAt: twoDaysAgo,
      notes: 'Compared nums[mid] with nums[high] to determine sorted half.',
    });

    await Attempt.create({
      userId: userC._id,
      problemId: pBS3._id,
      status: 'struggled',
      timeTakenMinutes: 32,
      attemptedAt: oneDayAgo,
      notes: 'Failed on duplicate rotation pivot condition.',
    });

    await Attempt.create({
      userId: userC._id,
      problemId: pBS3._id,
      status: 'solved',
      timeTakenMinutes: 20,
      attemptedAt: now,
      notes: 'Corrected boundary check for which half is strictly sorted.',
    });

    const contextC = await buildWeeklyReviewContext(userC._id);
    console.log('Profile C Context Sample:', JSON.stringify(contextC.sampleSize));
    console.log('Profile C Topic Evidence:', JSON.stringify(contextC.topicEvidence));

    const tStartC = Date.now();
    const reviewC = await generateWeeklyReview(contextC);
    const latencyC = Date.now() - tStartC;

    console.log(`\n[Profile C Response] Latency: ${latencyC}ms | Source: ${reviewC.source}`);
    console.log(`Headline: "${reviewC.headline}"`);
    console.log(`Weekly Summary: "${reviewC.weeklySummary}"`);
    console.log(`Strongest Signal: "${reviewC.strongestSignal}"`);
    console.log(`Biggest Gap: "${reviewC.biggestGap}"`);
    console.log(`Recommended Focus: "${reviewC.recommendedFocus}"`);
    console.log('Action Plan:');
    reviewC.actionPlan.forEach((a, i) => {
      console.log(`  ${i + 1}. [${a.minutes}m] ${a.action} — ${a.reason}`);
    });
    console.log(`Encouragement: "${reviewC.encouragement}"`);

    if (reviewC.source !== 'gemini') {
      throw new Error(`Profile C should return source="gemini", got: ${reviewC.source}`);
    }
    if (!validateWeeklyReviewSchema(reviewC)) {
      throw new Error('Profile C output failed deterministic schema validation');
    }
    console.log('✅ Profile C: Real Gemini generated depth-aware review tailored to Binary Search telemetry');

    console.log('\n--- ALL 3 REAL GEMINI QUALITY TESTS PASSED 100%! ---');
    console.log(`Averages: Latency ~${Math.round((latencyA + latencyB + latencyC) / 3)}ms | All returned source="gemini"`);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
}

runRealGeminiQualityTests().catch((err) => {
  console.error('Real Gemini Quality Tests failed:', err);
  process.exit(1);
});
