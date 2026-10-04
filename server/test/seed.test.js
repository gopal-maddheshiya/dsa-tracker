const assert = require('assert');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test_secret_for_seed_verification_98765';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');
const { generateToken } = require('../src/utils/token');
const { seedDemoDatabase, DEMO_USER_CONFIG } = require('../scripts/seedDemo');

/**
 * Phase 11 Automated Seed & Invariants Test Suite
 * Tests dataset generation, idempotency, strict scoping, and analytics mathematical invariants.
 */
async function runSeedTests() {
  console.log('--- Starting Phase 11 Demo Seed & Analytics Invariants Test Suite ---');

  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const authFetch = (url, token) => {
    return fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  };

  try {
    // 1. Create a third-party user to prove cross-user isolation
    const externalUser = await User.create({
      name: 'External Student',
      email: 'external@student.edu',
      passwordHash: 'external_hash_123',
    });
    const externalProblem = await Problem.create({
      userId: externalUser._id,
      title: 'External Unique Problem',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/external-unique-problem/',
      topics: ['Array'],
      difficulty: 'easy',
    });
    const externalAttempt = await Attempt.create({
      problemId: externalProblem._id,
      userId: externalUser._id,
      status: 'solved',
      attemptedAt: new Date(),
    });

    console.log('✓ Third-party user created for isolation test');

    // 2. Run seedDemoDatabase for the first time
    const seedResult1 = await seedDemoDatabase({ isTest: true, silent: true });
    assert.ok(seedResult1.demoUser, 'Demo user should be returned');
    assert.strictEqual(seedResult1.problemsCount, 35, 'Exactly 35 problems should be created');
    assert.ok(seedResult1.attemptsCount >= 60, 'At least 60 attempts should be created');
    assert.strictEqual(seedResult1.attemptsCount, 92, 'Exactly 92 attempts should be created in blueprint');
    assert.strictEqual(seedResult1.unattemptedCount, 6, 'Exactly 6 unattempted problems should exist');

    console.log('✓ 1. Initial seed run generated expected problem and attempt counts');

    // 3. Verify database records directly
    const demoUser = await User.findOne({ email: DEMO_USER_CONFIG.email });
    assert.ok(demoUser, 'Demo user must exist in database');

    const demoProblems = await Problem.find({ userId: demoUser._id });
    assert.strictEqual(demoProblems.length, 35);

    const demoAttempts = await Attempt.find({ userId: demoUser._id });
    assert.strictEqual(demoAttempts.length, 92);

    console.log('✓ 2. Database records verified for demo user');

    // 4. Verify external user records were NOT deleted or mutated
    const externalProblemStillExists = await Problem.findById(externalProblem._id);
    assert.ok(externalProblemStillExists, 'External user problem must not be deleted');
    const externalAttemptStillExists = await Attempt.findById(externalAttempt._id);
    assert.ok(externalAttemptStillExists, 'External user attempt must not be deleted');

    console.log('✓ 3. Cross-user isolation verified: external user data untouched');

    // 5. Test idempotency: Run seedDemoDatabase a second time
    const seedResult2 = await seedDemoDatabase({ isTest: true, silent: true });
    assert.strictEqual(seedResult2.problemsCount, 35, 'Second run must still have 35 problems');
    assert.strictEqual(seedResult2.attemptsCount, 92, 'Second run must still have 92 attempts');

    const totalProblemsInDb = await Problem.countDocuments();
    assert.strictEqual(totalProblemsInDb, 36, 'DB must contain 35 demo problems + 1 external problem');

    const totalAttemptsInDb = await Attempt.countDocuments();
    assert.strictEqual(totalAttemptsInDb, 93, 'DB must contain 92 demo attempts + 1 external attempt');

    console.log('✓ 4. Idempotency verified: re-running seed does not duplicate records');

    // 6. Verify Platform Enum & Difficulty constraints
    const allowedPlatforms = ['leetcode', 'gfg', 'codechef', 'hackerrank', 'other'];
    const allowedDifficulties = ['easy', 'medium', 'hard'];

    demoProblems.forEach((p) => {
      assert.ok(
        allowedPlatforms.includes(p.platform),
        `Platform ${p.platform} must be in allowed list`
      );
      assert.ok(
        allowedDifficulties.includes(p.difficulty),
        `Difficulty ${p.difficulty} must be in allowed list`
      );
      assert.ok(p.topics.length > 0, 'Problem must have non-empty topics array');
      assert.ok(/^https?:\/\//i.test(p.link), 'Problem link must be valid URL');
      assert.strictEqual(
        p.userId.toString(),
        demoUser._id.toString(),
        'Problem userId must match demo user'
      );
    });

    console.log('✓ 5. Schema constraints (platforms, difficulties, topics, URLs) verified');

    // 7. Verify Referential Integrity: zero orphan attempts
    const validProblemIds = new Set(demoProblems.map((p) => p._id.toString()));
    demoAttempts.forEach((a) => {
      assert.ok(
        validProblemIds.has(a.problemId.toString()),
        `Attempt references invalid problemId ${a.problemId}`
      );
      assert.strictEqual(
        a.userId.toString(),
        demoUser._id.toString(),
        'Attempt userId must match demo user'
      );
      assert.ok(
        ['solved', 'struggled', 'revisit_needed'].includes(a.status),
        `Attempt status ${a.status} must be valid`
      );
    });

    console.log('✓ 6. Referential integrity verified: zero orphan attempts');

    // 8. Verify Analytics Invariants via live HTTP API endpoints
    const token = generateToken(demoUser._id);

    // 8a. GET /api/analytics/summary
    const summaryRes = await authFetch(`${baseUrl}/api/analytics/summary`, token);
    assert.strictEqual(summaryRes.status, 200);
    const summary = (await summaryRes.json()).data;

    assert.strictEqual(summary.totalProblems, 35, 'Summary totalProblems must be 35');
    assert.strictEqual(summary.totalAttempted, 92, 'Summary totalAttempted must be 92');

    const solvedAttemptsCount = demoAttempts.filter((a) => a.status === 'solved').length;
    assert.strictEqual(
      summary.totalSolved,
      solvedAttemptsCount,
      'Summary totalSolved must equal count of solved attempts'
    );

    const easyCount = summary.difficultyBreakdown.find((d) => d.difficulty === 'easy').count;
    const mediumCount = summary.difficultyBreakdown.find((d) => d.difficulty === 'medium').count;
    const hardCount = summary.difficultyBreakdown.find((d) => d.difficulty === 'hard').count;

    assert.strictEqual(
      easyCount + mediumCount + hardCount,
      35,
      'Difficulty breakdown sum must equal totalProblems (35)'
    );
    assert.strictEqual(easyCount, 15, 'Easy problems must be 15');
    assert.strictEqual(mediumCount, 14, 'Medium problems must be 14');
    assert.strictEqual(hardCount, 6, 'Hard problems must be 6');

    console.log('✓ 7. Analytics summary invariants verified (problem, attempt, solved counts, difficulty breakdown)');

    // 8b. GET /api/analytics/topics
    const topicsRes = await authFetch(`${baseUrl}/api/analytics/topics`, token);
    assert.strictEqual(topicsRes.status, 200);
    const topics = (await topicsRes.json()).data.topics;

    assert.ok(topics.length >= 5, 'Topic analytics must return at least 5 topics');
    topics.forEach((t, idx) => {
      assert.ok(typeof t.topic === 'string' && t.topic.length > 0);
      assert.ok(t.totalAttempts >= t.struggledCount);
      const expectedRatio = Math.round((t.struggledCount / t.totalAttempts) * 10000) / 10000;
      assert.strictEqual(t.struggleRatio, expectedRatio, 'struggleRatio calculation must match');
      assert.strictEqual(t.weaknessRank, idx + 1, 'weaknessRank must be sequential 1-indexed');
      assert.ok(!Number.isNaN(t.struggleRatio), 'struggleRatio must not be NaN');
      assert.ok(Number.isFinite(t.struggleRatio), 'struggleRatio must be finite');
    });

    console.log('✓ 8. Topic weakness analytics invariants verified (struggleRatio, deterministic ranking)');

    // 8c. GET /api/analytics/trend
    const trendRes = await authFetch(`${baseUrl}/api/analytics/trend`, token);
    assert.strictEqual(trendRes.status, 200);
    const trend = (await trendRes.json()).data.trend;

    assert.ok(trend.length >= 5, 'Trend should have multiple weekly buckets across 12 weeks');
    const trendSum = trend.reduce((acc, curr) => acc + curr.count, 0);
    assert.strictEqual(
      trendSum,
      summary.totalSolved,
      'Sum of trend weekly counts must equal totalSolved'
    );

    console.log('✓ 9. Practice trend weekly aggregation invariants verified');

    // 8d. GET /api/analytics/heatmap
    const heatmapRes = await authFetch(`${baseUrl}/api/analytics/heatmap`, token);
    assert.strictEqual(heatmapRes.status, 200);
    const heatmap = (await heatmapRes.json()).data.heatmap;

    assert.ok(heatmap.length >= 30, 'Heatmap should have 30+ active days');
    const heatmapSum = heatmap.reduce((acc, curr) => acc + curr.count, 0);
    assert.strictEqual(
      heatmapSum,
      summary.totalAttempted,
      'Sum of daily heatmap counts must equal totalAttempted'
    );

    console.log('✓ 10. Heatmap daily activity counts invariants verified');

    // 8e. GET /api/analytics/revision-queue
    const queueRes = await authFetch(`${baseUrl}/api/analytics/revision-queue`, token);
    assert.strictEqual(queueRes.status, 200);
    const queue = (await queueRes.json()).data.queue;

    assert.ok(queue.length > 0 && queue.length <= 20, 'Queue must return between 1 and 20 items');

    // Ensure queue is sorted strictly descending by priorityScore
    for (let i = 0; i < queue.length - 1; i++) {
      assert.ok(
        queue[i].priorityScore >= queue[i + 1].priorityScore,
        'Revision queue must be ordered descending by priorityScore'
      );
    }

    // Verify that none of the 6 unattempted problems appear in the revision queue
    const unattemptedKeys = [
      'rotate-image',
      'invert-binary-tree',
      'reverse-linked-list',
      'detect-loop-linked-list',
      'minimum-window-substring',
      'median-two-sorted-arrays',
    ];
    queue.forEach((item) => {
      assert.ok(
        item.latestStatus,
        'Every revision queue candidate must have a latestStatus'
      );
      assert.ok(
        item.lastAttemptedAt,
        'Every revision queue candidate must have a lastAttemptedAt'
      );
      assert.ok(
        !unattemptedKeys.includes(item.title.toLowerCase().replace(/ /g, '-')),
        'Unattempted problems must not appear in revision queue'
      );
    });

    // Verify Course Schedule is near the top of the queue (priorityScore >= 4.0)
    const topItem = queue[0];
    assert.ok(
      topItem.priorityScore >= 4.0,
      `Top item should have high priority score, received: ${topItem.priorityScore}`
    );

    console.log('✓ 11. Revision queue Leitner scoring, descending ordering, and zero-attempt exclusion verified');

    console.log('--- All Phase 11 Demo Seed & Analytics Invariants Tests Passed Successfully ---');
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

if (require.main === module) {
  runSeedTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ [Seed Test Error]:', err);
      process.exit(1);
    });
}

module.exports = runSeedTests;
