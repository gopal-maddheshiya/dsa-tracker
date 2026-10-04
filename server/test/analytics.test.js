const assert = require('assert');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test_secret_for_analytics_integration_12345';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');
const { generateToken } = require('../src/utils/token');
const { calculatePriorityScore } = require('../src/utils/priorityScore');

/**
 * Phase 7 Analytics Engine Integration Test Suite
 * Tests all 5 endpoints: summary, topics, trend, heatmap, revision-queue
 * Validates exact mathematics, user isolation, empty states, and ranking.
 */
async function runAnalyticsTests() {
  console.log('--- Starting Phase 7 Analytics Engine Test Suite ---');

  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const authFetch = (url, options = {}, token = null) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  try {
    // 0. Priority Score Unit Calculation Verification
    console.log('--- Testing calculatePriorityScore Utility ---');
    const refDate = new Date('2026-10-05T12:00:00.000Z');
    
    // Struggled 4 days ago -> (4 / 2) + 2 = 4
    const scoreStruggled = calculatePriorityScore('struggled', '2026-10-01T12:00:00.000Z', refDate);
    assert.strictEqual(scoreStruggled.daysSinceLastAttempt, 4);
    assert.strictEqual(scoreStruggled.intervalDays, 2);
    assert.strictEqual(scoreStruggled.struggleWeight, 2);
    assert.strictEqual(scoreStruggled.priorityScore, 4);

    // Solved 14 days ago -> (14 / 14) + 0 = 1
    const scoreSolved = calculatePriorityScore('solved', '2026-09-21T12:00:00.000Z', refDate);
    assert.strictEqual(scoreSolved.daysSinceLastAttempt, 14);
    assert.strictEqual(scoreSolved.intervalDays, 14);
    assert.strictEqual(scoreSolved.struggleWeight, 0);
    assert.strictEqual(scoreSolved.priorityScore, 1);

    // Revisit needed 5 days ago -> (5 / 5) + 1 = 2
    const scoreRevisit = calculatePriorityScore('revisit_needed', '2026-09-30T12:00:00.000Z', refDate);
    assert.strictEqual(scoreRevisit.daysSinceLastAttempt, 5);
    assert.strictEqual(scoreRevisit.intervalDays, 5);
    assert.strictEqual(scoreRevisit.struggleWeight, 1);
    assert.strictEqual(scoreRevisit.priorityScore, 2);
    console.log('✓ Priority score Leitner formula math verified');

    // Create User A, User B, and User Empty
    const userA = await User.create({ name: 'User A', email: 'userA_analytics@example.com', passwordHash: 'hashA' });
    const tokenA = generateToken(userA._id.toString());

    const userB = await User.create({ name: 'User B', email: 'userB_analytics@example.com', passwordHash: 'hashB' });
    const tokenB = generateToken(userB._id.toString());

    const userEmpty = await User.create({ name: 'Empty User', email: 'empty_analytics@example.com', passwordHash: 'hashEmpty' });
    const tokenEmpty = generateToken(userEmpty._id.toString());

    // =========================================================================
    // 1–5: AUTHENTICATION ENFORCEMENT (401 on missing auth)
    // =========================================================================
    const unauthEndpoints = ['/summary', '/topics', '/trend', '/heatmap', '/revision-queue'];
    for (const ep of unauthEndpoints) {
      const res = await fetch(`${baseUrl}/api/analytics${ep}`);
      assert.strictEqual(res.status, 401, `Unauthenticated ${ep} must return 401`);
    }
    console.log('✓ 1–5. Authentication enforcement verified (401 on unauthenticated calls)');

    // =========================================================================
    // 6–10: EMPTY DATASET HANDLING
    // =========================================================================
    const emptySummaryRes = await authFetch(`${baseUrl}/api/analytics/summary`, {}, tokenEmpty);
    assert.strictEqual(emptySummaryRes.status, 200);
    const emptySummary = (await emptySummaryRes.json()).data;
    assert.strictEqual(emptySummary.totalProblems, 0);
    assert.strictEqual(emptySummary.totalAttempted, 0);
    assert.strictEqual(emptySummary.totalSolved, 0);
    assert.deepStrictEqual(emptySummary.difficultyBreakdown, [
      { difficulty: 'easy', count: 0 },
      { difficulty: 'medium', count: 0 },
      { difficulty: 'hard', count: 0 },
    ]);

    const emptyTopics = (await (await authFetch(`${baseUrl}/api/analytics/topics`, {}, tokenEmpty)).json()).data;
    assert.deepStrictEqual(emptyTopics.topics, []);

    const emptyTrend = (await (await authFetch(`${baseUrl}/api/analytics/trend`, {}, tokenEmpty)).json()).data;
    assert.deepStrictEqual(emptyTrend.trend, []);

    const emptyHeatmap = (await (await authFetch(`${baseUrl}/api/analytics/heatmap`, {}, tokenEmpty)).json()).data;
    assert.deepStrictEqual(emptyHeatmap.heatmap, []);

    const emptyQueue = (await (await authFetch(`${baseUrl}/api/analytics/revision-queue`, {}, tokenEmpty)).json()).data;
    assert.deepStrictEqual(emptyQueue.queue, []);
    console.log('✓ 6–10. Empty dataset handling across all 5 endpoints verified');

    // =========================================================================
    // SEED DETERMINISTIC DATASET
    // =========================================================================
    // User A Problems
    const p1A = await Problem.create({
      userId: userA._id,
      title: 'Two Sum',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/two-sum/',
      topics: ['Array', 'Hash Table'],
      difficulty: 'easy',
    });
    const p2A = await Problem.create({
      userId: userA._id,
      title: 'Binary Search',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/binary-search/',
      topics: ['Array', 'Binary Search'],
      difficulty: 'medium',
    });
    const p3A = await Problem.create({
      userId: userA._id,
      title: 'Median of Two Sorted Arrays',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
      topics: ['Binary Search'],
      difficulty: 'hard',
    });
    const p4A = await Problem.create({
      userId: userA._id,
      title: 'Valid Palindrome',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/valid-palindrome/',
      topics: ['Two Pointer'],
      difficulty: 'easy',
    });

    // User A Attempts
    // P1: Attempt 1 (struggled), Attempt 2 (solved)
    await Attempt.create({
      problemId: p1A._id,
      userId: userA._id,
      status: 'struggled',
      timeTakenMinutes: 30,
      attemptedAt: new Date('2026-10-01T10:00:00.000Z'),
    });
    await Attempt.create({
      problemId: p1A._id,
      userId: userA._id,
      status: 'solved',
      timeTakenMinutes: 15,
      attemptedAt: new Date('2026-10-04T10:00:00.000Z'),
    });

    // P2: Attempt 1 (struggled)
    await Attempt.create({
      problemId: p2A._id,
      userId: userA._id,
      status: 'struggled',
      timeTakenMinutes: 40,
      attemptedAt: new Date('2026-10-02T10:00:00.000Z'),
    });

    // P3: Attempt 1 (solved)
    await Attempt.create({
      problemId: p3A._id,
      userId: userA._id,
      status: 'solved',
      timeTakenMinutes: 45,
      attemptedAt: new Date('2026-10-03T10:00:00.000Z'),
    });

    // P4 has 0 attempts

    // User B Data (Isolation testing)
    const p1B = await Problem.create({
      userId: userB._id,
      title: 'Climbing Stairs',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/climbing-stairs/',
      topics: ['Dynamic Programming'],
      difficulty: 'easy',
    });
    await Attempt.create({
      problemId: p1B._id,
      userId: userB._id,
      status: 'struggled',
      timeTakenMinutes: 20,
      attemptedAt: new Date('2026-10-01T10:00:00.000Z'),
    });
    await Attempt.create({
      problemId: p1B._id,
      userId: userB._id,
      status: 'solved',
      timeTakenMinutes: 10,
      attemptedAt: new Date('2026-10-02T10:00:00.000Z'),
    });

    // =========================================================================
    // 11–15: SUMMARY ENDPOINT VERIFICATION & ISOLATION
    // =========================================================================
    const sumResA = await authFetch(`${baseUrl}/api/analytics/summary`, {}, tokenA);
    assert.strictEqual(sumResA.status, 200);
    const sumA = (await sumResA.json()).data;
    assert.strictEqual(sumA.totalProblems, 4, 'User A should own 4 problems');
    assert.strictEqual(sumA.totalAttempted, 4, 'User A should have 4 total attempts');
    assert.strictEqual(sumA.totalSolved, 2, 'User A should have 2 solved attempts');
    assert.deepStrictEqual(sumA.difficultyBreakdown, [
      { difficulty: 'easy', count: 2 },
      { difficulty: 'medium', count: 1 },
      { difficulty: 'hard', count: 1 },
    ]);

    // User B Summary Isolation
    const sumResB = await authFetch(`${baseUrl}/api/analytics/summary`, {}, tokenB);
    const sumB = (await sumResB.json()).data;
    assert.strictEqual(sumB.totalProblems, 1);
    assert.strictEqual(sumB.totalAttempted, 2);
    assert.strictEqual(sumB.totalSolved, 1);
    assert.deepStrictEqual(sumB.difficultyBreakdown, [
      { difficulty: 'easy', count: 1 },
      { difficulty: 'medium', count: 0 },
      { difficulty: 'hard', count: 0 },
    ]);
    console.log('✓ 11–15. Summary endpoint & difficulty breakdown mathematics and isolation verified');

    // =========================================================================
    // 16–20: TOPIC WEAKNESS RANKING & STRUGGLE RATIO
    // =========================================================================
    const topResA = await authFetch(`${baseUrl}/api/analytics/topics`, {}, tokenA);
    assert.strictEqual(topResA.status, 200);
    const topicsA = (await topResA.json()).data.topics;

    // Expected topics:
    // Array: 3 attempts (P1: 2, P2: 1), 2 struggled (P1 att 1, P2 att 1) -> 2/3 ≈ 0.6667
    // Binary Search: 2 attempts (P2: 1, P3: 1), 1 struggled (P2 att 1) -> 1/2 = 0.5
    // Hash Table: 2 attempts (P1: 2), 1 struggled (P1 att 1) -> 1/2 = 0.5
    // Two Pointer: 0 attempts -> excluded
    // Dynamic Programming (User B) -> must NOT be present
    assert.strictEqual(topicsA.length, 3);
    
    assert.strictEqual(topicsA[0].topic, 'Array');
    assert.strictEqual(topicsA[0].totalAttempts, 3);
    assert.strictEqual(topicsA[0].struggledCount, 2);
    assert.strictEqual(topicsA[0].struggleRatio, 0.6667);
    assert.strictEqual(topicsA[0].weaknessRank, 1);

    // Tie between Binary Search and Hash Table (0.5 ratio, 2 attempts each).
    // Alphabetical tie-breaker: 'Binary Search' < 'Hash Table'
    assert.strictEqual(topicsA[1].topic, 'Binary Search');
    assert.strictEqual(topicsA[1].totalAttempts, 2);
    assert.strictEqual(topicsA[1].struggledCount, 1);
    assert.strictEqual(topicsA[1].struggleRatio, 0.5);
    assert.strictEqual(topicsA[1].weaknessRank, 2);

    assert.strictEqual(topicsA[2].topic, 'Hash Table');
    assert.strictEqual(topicsA[2].totalAttempts, 2);
    assert.strictEqual(topicsA[2].struggledCount, 1);
    assert.strictEqual(topicsA[2].struggleRatio, 0.5);
    assert.strictEqual(topicsA[2].weaknessRank, 3);

    // Confirm User B topics isolation
    const topResB = await authFetch(`${baseUrl}/api/analytics/topics`, {}, tokenB);
    const topicsB = (await topResB.json()).data.topics;
    assert.strictEqual(topicsB.length, 1);
    assert.strictEqual(topicsB[0].topic, 'Dynamic Programming');
    assert.strictEqual(topicsB[0].struggleRatio, 0.5);
    console.log('✓ 16–20. Topic weakness struggleRatio math, ranking, deterministic tie-breaking, and isolation verified');

    // =========================================================================
    // 21–24: TREND ANALYTICS (Weekly Solved Attempts)
    // =========================================================================
    const trendResA = await authFetch(`${baseUrl}/api/analytics/trend`, {}, tokenA);
    assert.strictEqual(trendResA.status, 200);
    const trendA = (await trendResA.json()).data.trend;

    // User A has 2 solved attempts: 2026-10-03 and 2026-10-04.
    // In UTC, Monday of that week is 2026-09-28. Both fall in 2026-09-28.
    assert.strictEqual(trendA.length, 1);
    assert.strictEqual(trendA[0].date, '2026-09-28');
    assert.strictEqual(trendA[0].count, 2);

    // User B trend should show 1 solved attempt
    const trendResB = await authFetch(`${baseUrl}/api/analytics/trend`, {}, tokenB);
    const trendB = (await trendResB.json()).data.trend;
    assert.strictEqual(trendB.length, 1);
    assert.strictEqual(trendB[0].date, '2026-09-28');
    assert.strictEqual(trendB[0].count, 1);
    console.log('✓ 21–24. Practice trend weekly aggregation and solved-only filtering verified');

    // =========================================================================
    // 25–28: HEATMAP ANALYTICS (Daily Attempt Intensity)
    // =========================================================================
    const heatResA = await authFetch(`${baseUrl}/api/analytics/heatmap`, {}, tokenA);
    assert.strictEqual(heatResA.status, 200);
    const heatA = (await heatResA.json()).data.heatmap;

    // User A logged 1 attempt each on 2026-10-01, 2026-10-02, 2026-10-03, 2026-10-04
    assert.strictEqual(heatA.length, 4);
    assert.deepStrictEqual(heatA, [
      { date: '2026-10-01', count: 1 },
      { date: '2026-10-02', count: 1 },
      { date: '2026-10-03', count: 1 },
      { date: '2026-10-04', count: 1 },
    ]);

    // User B heatmap should only show User B attempts (1 on 10-01, 1 on 10-02)
    const heatResB = await authFetch(`${baseUrl}/api/analytics/heatmap`, {}, tokenB);
    const heatB = (await heatResB.json()).data.heatmap;
    assert.strictEqual(heatB.length, 2);
    assert.deepStrictEqual(heatB, [
      { date: '2026-10-01', count: 1 },
      { date: '2026-10-02', count: 1 },
    ]);
    console.log('✓ 25–28. Daily activity heatmap counts, chronological order, and isolation verified');

    // =========================================================================
    // 29–35: REVISION QUEUE & LEITNER FORMULA VERIFICATION
    // =========================================================================
    // Inject deterministic reference time: 2026-10-05T12:00:00.000Z
    const testNow = '2026-10-05T12:00:00.000Z';
    const queueResA = await authFetch(`${baseUrl}/api/analytics/revision-queue?now=${encodeURIComponent(testNow)}`, {}, tokenA);
    assert.strictEqual(queueResA.status, 200);
    const queueA = (await queueResA.json()).data.queue;

    // Expected queue for User A:
    // P4 (Valid Palindrome) has 0 attempts -> must be excluded!
    assert.strictEqual(queueA.length, 3, 'Problems with 0 attempts must be excluded from revision queue');

    // Rank 1: Binary Search (P2)
    // latest status = 'struggled' on 2026-10-02T10:00:00.000Z
    // days since: 3.08
    // score = (3.0833 / 2) + 2 ≈ 3.5417
    assert.strictEqual(queueA[0].title, 'Binary Search');
    assert.strictEqual(queueA[0].latestStatus, 'struggled');
    assert.strictEqual(queueA[0].intervalDays, 2);
    assert.strictEqual(queueA[0].struggleWeight, 2);
    assert.strictEqual(queueA[0].daysSinceLastAttempt, 3.08);
    assert.strictEqual(queueA[0].priorityScore, 3.5417);

    // Rank 2: Median of Two Sorted Arrays (P3)
    // latest status = 'solved' on 2026-10-03T10:00:00.000Z
    // days since: 2.08
    // score = (2.0833 / 14) + 0 ≈ 0.1488
    assert.strictEqual(queueA[1].title, 'Median of Two Sorted Arrays');
    assert.strictEqual(queueA[1].latestStatus, 'solved');
    assert.strictEqual(queueA[1].intervalDays, 14);
    assert.strictEqual(queueA[1].struggleWeight, 0);
    assert.strictEqual(queueA[1].daysSinceLastAttempt, 2.08);
    assert.strictEqual(queueA[1].priorityScore, 0.1488);

    // Rank 3: Two Sum (P1)
    // Note: P1 had attempt 1 = struggled, attempt 2 = solved.
    // Latest status must be 'solved' (not struggled, and not an average!)
    assert.strictEqual(queueA[2].title, 'Two Sum');
    assert.strictEqual(queueA[2].latestStatus, 'solved');
    assert.strictEqual(queueA[2].intervalDays, 14);
    assert.strictEqual(queueA[2].struggleWeight, 0);
    assert.strictEqual(queueA[2].daysSinceLastAttempt, 1.08);
    assert.strictEqual(queueA[2].priorityScore, 0.0774);

    // User B Revision Queue Isolation
    const queueResB = await authFetch(`${baseUrl}/api/analytics/revision-queue?now=${encodeURIComponent(testNow)}`, {}, tokenB);
    const queueB = (await queueResB.json()).data.queue;
    assert.strictEqual(queueB.length, 1);
    assert.strictEqual(queueB[0].title, 'Climbing Stairs');
    console.log('✓ 29–35. Revision queue latest-attempt extraction, zero-attempt exclusion, score ranking, and isolation verified');

    console.log('--- All 35 Phase 7 Analytics Engine Tests Passed Successfully ---');
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

runAnalyticsTests().catch((err) => {
  console.error('Analytics test execution failed:', err);
  process.exit(1);
});
