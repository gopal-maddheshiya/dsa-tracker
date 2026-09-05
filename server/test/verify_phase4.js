const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'dsa_tracker_phase4_secret_test_key_888';

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');
const {
  getSummary,
  getTopics,
  getTrend,
  getHeatmap,
  getRevisionQueue,
} = require('../src/controllers/analytics.controller');
const { protect } = require('../src/middleware/authMiddleware');

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

async function runTests() {
  console.log('--- STARTING PHASE 4 ANALYTICS & REVISION ENGINE VERIFICATION ---');
  let mongod;
  const results = [];

  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory MongoDB');

    // TEST 1: Unauthenticated request -> 401
    const unauthReq = { headers: {} };
    const unauthRes = mockResponse();
    let unauthNext = false;
    await protect(unauthReq, unauthRes, () => { unauthNext = true; });
    results.push({
      test: '1. Unauthenticated request returns 401',
      passed: unauthRes.statusCode === 401 && !unauthNext,
    });

    // Setup Test Users: User A, User B, and Empty User C
    const hash = await bcrypt.hash('password123', 10);
    const userA = await User.create({ name: 'User A', email: 'userA@example.com', passwordHash: hash });
    const userB = await User.create({ name: 'User B', email: 'userB@example.com', passwordHash: hash });
    const userEmpty = await User.create({ name: 'User Empty', email: 'empty@example.com', passwordHash: hash });

    // TEST 24: Empty database behavior for user with 0 problems / attempts
    const emptySummaryRes = mockResponse();
    await getSummary({ user: userEmpty }, emptySummaryRes, (err) => { throw err; });
    const emptySummaryData = emptySummaryRes.body.data;

    const emptyTopicsRes = mockResponse();
    await getTopics({ user: userEmpty }, emptyTopicsRes, (err) => { throw err; });

    const emptyTrendRes = mockResponse();
    await getTrend({ user: userEmpty }, emptyTrendRes, (err) => { throw err; });

    const emptyHeatmapRes = mockResponse();
    await getHeatmap({ user: userEmpty }, emptyHeatmapRes, (err) => { throw err; });

    const emptyQueueRes = mockResponse();
    await getRevisionQueue({ user: userEmpty }, emptyQueueRes, (err) => { throw err; });

    const emptyPassed =
      emptySummaryData.totalProblems === 0 &&
      emptySummaryData.totalAttempts === 0 &&
      emptySummaryData.solvedProblems === 0 &&
      emptySummaryData.solvedAttempts === 0 &&
      Array.isArray(emptyTopicsRes.body.data) && emptyTopicsRes.body.data.length === 0 &&
      Array.isArray(emptyTrendRes.body.data) && emptyTrendRes.body.data.length === 0 &&
      Array.isArray(emptyHeatmapRes.body.data) && emptyHeatmapRes.body.data.length === 0 &&
      Array.isArray(emptyQueueRes.body.data) && emptyQueueRes.body.data.length === 0;

    results.push({
      test: '24. Empty database behavior returns valid zeroed structures and empty arrays without crashing',
      passed: emptyPassed,
    });

    // Populate deterministic data for User A:
    const p1 = await Problem.create({
      userId: userA._id,
      title: 'Two Sum',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/two-sum',
      topics: ['Array', 'Hash Table'],
      difficulty: 'easy',
    });

    const p2 = await Problem.create({
      userId: userA._id,
      title: 'Course Schedule',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/course-schedule',
      topics: ['Graph', 'DFS'],
      difficulty: 'medium',
    });

    const p3 = await Problem.create({
      userId: userA._id,
      title: 'Word Ladder',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/word-ladder',
      topics: ['Graph', 'BFS'],
      difficulty: 'hard',
    });

    const p4Unattempted = await Problem.create({
      userId: userA._id,
      title: 'Implement Trie',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/implement-trie',
      topics: ['Trie'],
      difficulty: 'medium',
    });

    // User B problem and attempts (to test cross-user isolation)
    const pB = await Problem.create({
      userId: userB._id,
      title: 'User B Problem',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/user-b',
      topics: ['Graph'],
      difficulty: 'hard',
    });
    await Attempt.create({
      problemId: pB._id,
      userId: userB._id,
      status: 'solved',
      attemptedAt: new Date('2026-08-01T10:00:00Z'),
    });

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // P1 attempts:
    // Attempt 1: 10 days ago (struggled)
    await Attempt.create({
      problemId: p1._id,
      userId: userA._id,
      status: 'struggled',
      attemptedAt: new Date(now - 10 * dayMs),
    });
    // Attempt 2: 5 days ago (solved) - LATEST for P1
    await Attempt.create({
      problemId: p1._id,
      userId: userA._id,
      status: 'solved',
      attemptedAt: new Date(now - 5 * dayMs),
    });

    // P2 attempts:
    // Attempt 1: 8 days ago (solved)
    await Attempt.create({
      problemId: p2._id,
      userId: userA._id,
      status: 'solved',
      attemptedAt: new Date(now - 8 * dayMs),
    });
    // Attempt 2: 2 days ago (struggled) - LATEST for P2
    await Attempt.create({
      problemId: p2._id,
      userId: userA._id,
      status: 'struggled',
      attemptedAt: new Date(now - 2 * dayMs),
    });

    // P3 attempts:
    // Attempt 1: 15 days ago (revisit_needed)
    await Attempt.create({
      problemId: p3._id,
      userId: userA._id,
      status: 'revisit_needed',
      attemptedAt: new Date(now - 15 * dayMs),
    });
    // Attempt 2: 1 day in the FUTURE (revisit_needed) - tests future date clamping to 0!
    await Attempt.create({
      problemId: p3._id,
      userId: userA._id,
      status: 'revisit_needed',
      attemptedAt: new Date(now + 1 * dayMs),
    });

    // TEST SUMMARY ENDPOINT
    const summaryRes = mockResponse();
    await getSummary({ user: userA }, summaryRes, (err) => { throw err; });
    const sData = summaryRes.body.data;

    results.push({
      test: '2. summary totalProblems is 4 for user A',
      passed: sData.totalProblems === 4,
    });

    results.push({
      test: '3. summary totalAttempts is 6 for user A',
      passed: sData.totalAttempts === 6,
    });

    results.push({
      test: '4. unique solvedProblems counts unique problems solved (exactly 2: P1 and P2)',
      passed: sData.solvedProblems === 2,
    });

    results.push({
      test: '5. solvedAttempts counts total solved attempts (exactly 2)',
      passed: sData.solvedAttempts === 2,
    });

    const diffMap = {};
    sData.difficultyBreakdown.forEach((d) => { diffMap[d.difficulty] = d.count; });
    results.push({
      test: '6. difficultyBreakdown maps easy:1, medium:2, hard:1',
      passed: diffMap.easy === 1 && diffMap.medium === 2 && diffMap.hard === 1,
    });

    // TEST 23: Cross-user analytics isolation
    results.push({
      test: '23. Cross-user analytics isolation: User B data excluded from User A summary',
      passed: sData.totalProblems === 4 && sData.totalAttempts === 6, // If User B leaked, would be 5 and 7
    });

    // TEST TOPICS ENDPOINT
    const topicsRes = mockResponse();
    await getTopics({ user: userA }, topicsRes, (err) => { throw err; });
    const tData = topicsRes.body.data;

    // Find topic "Graph"
    const graphTopic = tData.find((t) => t.topic === 'Graph');
    results.push({
      test: '7. topic totalAttempts correctly aggregated (Graph has 4 attempts)',
      passed: graphTopic && graphTopic.totalAttempts === 4,
    });

    results.push({
      test: '8. topic struggledAttempts correctly counted (Graph has 1 struggled attempt from P2)',
      passed: graphTopic && graphTopic.struggledAttempts === 1,
    });

    results.push({
      test: '9. topic struggleRatio correctly calculated (Graph ratio = 1/4 = 0.25)',
      passed: graphTopic && Math.abs(graphTopic.struggleRatio - 0.25) < 0.001,
    });

    // Topics ranking: Topics with 0.5 ratio should have higher weaknessRank than 0.25
    const arrayTopic = tData.find((t) => t.topic === 'Array');
    results.push({
      test: '10. topic weakness ranking sorted descending by struggleRatio',
      passed: arrayTopic.struggleRatio > graphTopic.struggleRatio && arrayTopic.weaknessRank < graphTopic.weaknessRank,
    });

    // TEST TREND ENDPOINT
    const trendRes = mockResponse();
    await getTrend({ user: userA }, trendRes, (err) => { throw err; });
    const trData = trendRes.body.data;

    // Trend should only include the 2 solved attempts
    const totalSolvedInTrend = trData.reduce((acc, curr) => acc + curr.solved, 0);
    results.push({
      test: '11. trend contains solved attempts only (sum of solved equals 2)',
      passed: totalSolvedInTrend === 2,
    });

    // Trend chronological ordering (ascending dates)
    const isAscending = trData.every((item, idx) => idx === 0 || item.date >= trData[idx - 1].date);
    results.push({
      test: '12. trend is sorted chronologically ascending',
      passed: isAscending && trData.length >= 1,
    });

    // TEST HEATMAP ENDPOINT
    const heatmapRes = mockResponse();
    await getHeatmap({ user: userA }, heatmapRes, (err) => { throw err; });
    const hmData = heatmapRes.body.data;
    const totalHeatmapCount = hmData.reduce((acc, curr) => acc + curr.count, 0);

    results.push({
      test: '13. heatmap groups all attempts by calendar day (total count = 6)',
      passed: totalHeatmapCount === 6 && hmData.every((h) => typeof h.date === 'string' && h.count > 0),
    });

    // TEST REVISION QUEUE
    const queueRes = mockResponse();
    await getRevisionQueue({ user: userA }, queueRes, (err) => { throw err; });
    const qData = queueRes.body.data;

    // 20. problems with no attempts excluded
    const unattemptedInQueue = qData.some((item) => item.problemId === p4Unattempted._id.toString());
    results.push({
      test: '20. problems with no attempts excluded from revision queue',
      passed: !unattemptedInQueue && qData.length === 3,
    });

    const qItemP1 = qData.find((item) => item.problemId === p1._id.toString());
    const qItemP2 = qData.find((item) => item.problemId === p2._id.toString());
    const qItemP3 = qData.find((item) => item.problemId === p3._id.toString());

    // 21. latest attempt selected by attemptedAt (P2 latest is struggled, not solved)
    results.push({
      test: '21. latest attempt selected by attemptedAt descending (P2 latest is struggled)',
      passed: qItemP2 && qItemP2.latestStatus === 'struggled',
    });

    // 22. future attemptedAt clamped to 0 days (P3 is in future -> daysSinceLastAttempt = 0)
    results.push({
      test: '22. future attemptedAt clamped to zero days elapsed',
      passed: qItemP3 && qItemP3.daysSinceLastAttempt === 0,
    });

    // 14. revision solved interval = 14
    // 17. revision struggle weights: solved weight = 0
    // P1: days ≈ 5, interval = 14, weight = 0 -> score ≈ 5/14 ≈ 0.357
    const expectedP1Score = (qItemP1.daysSinceLastAttempt / 14) + 0;
    results.push({
      test: '14 & 17. revision solved interval = 14 and weight = 0',
      passed: Math.abs(qItemP1.priorityScore - expectedP1Score) < 0.05,
    });

    // 16. revision struggled interval = 2 and weight = 2
    // P2: days ≈ 2, interval = 2, weight = 2 -> score ≈ 2/2 + 2 = 3.0
    const expectedP2Score = (qItemP2.daysSinceLastAttempt / 2) + 2;
    results.push({
      test: '16 & 17. revision struggled interval = 2 and weight = 2',
      passed: Math.abs(qItemP2.priorityScore - expectedP2Score) < 0.05,
    });

    // 15. revision revisit_needed interval = 5 and weight = 1
    // P3: days = 0, interval = 5, weight = 1 -> score = (0/5) + 1 = 1.0
    results.push({
      test: '15 & 17. revision revisit_needed interval = 5 and weight = 1 (score = 1.0)',
      passed: Math.abs(qItemP3.priorityScore - 1.0) < 0.05,
    });

    // 18. priorityScore formula
    results.push({
      test: '18. revision priorityScore formula accurately reflects (days / interval) + weight',
      passed: qItemP2.priorityScore >= 2.9 && qItemP3.priorityScore === 1.0,
    });

    // 19. priority ordering (descending priorityScore: P2 (~3.0) > P3 (1.0) > P1 (~0.36))
    const isQueueOrdered = qData[0].problemId === p2._id.toString() &&
      qData[1].problemId === p3._id.toString() &&
      qData[2].problemId === p1._id.toString();
    results.push({
      test: '19. priority ordering sorts descending by priorityScore',
      passed: isQueueOrdered,
    });

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  let allPassed = true;
  for (const r of results) {
    console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.test}`);
    if (!r.passed) allPassed = false;
  }
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL PHASE 4 TESTS PASSED' : 'SOME TESTS FAILED'}`);
  process.exit(allPassed ? 0 : 1);
}

runTests();
