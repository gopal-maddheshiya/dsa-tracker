const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');

const {
  REVISION_INTERVALS,
  STRUGGLE_WEIGHTS,
  SOLVED_MAX_ELAPSED_DAYS,
  calculatePriorityScore,
} = require('../src/utils/revisionRules');

const {
  getRevisionQueue,
  getSummary,
  getHeatmap,
  getTopics,
} = require('../src/controllers/analytics.controller');

const {
  getProblemRecommendations,
  createProblem,
} = require('../src/controllers/problem.controller');

const {
  createAttempt,
} = require('../src/controllers/attempt.controller');

const {
  batchImportProblems,
} = require('../src/controllers/sync.controller');

const {
  runMigration,
} = require('../scripts/migrateProblemSources');

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
  console.log('\n==================================================');
  console.log('🧪 STARTING PHASE 1A REVISION ENGINE & SYNC SEMANTICS TESTS');
  console.log('==================================================\n');

  let mongod;
  const results = [];

  const recordResult = (name, passed, detail = '') => {
    results.push({ name, passed, detail });
    if (passed) {
      console.log(`✅ PASS: ${name}`);
    } else {
      console.error(`❌ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
    }
  };

  try {
    // ----------------------------------------------------
    // SECTION 1: CANONICAL CONSTANTS & FORMULA VERIFICATION
    // ----------------------------------------------------
    console.log('--- SECTION 1: CANONICAL REVISION RULES & WEIGHTS ---');

    // 1. Canonical struggled weight = +2.0
    recordResult(
      '1. Canonical struggled weight is strictly 2.0',
      STRUGGLE_WEIGHTS.struggled === 2
    );

    // 2. No +2.5 revision weight remains
    recordResult(
      '2. No +2.5 revision weight remains in STRUGGLE_WEIGHTS',
      STRUGGLE_WEIGHTS.struggled !== 2.5 && !Object.values(STRUGGLE_WEIGHTS).includes(2.5)
    );

    // 3. solved interval = 14
    recordResult(
      '3. Solved interval is 14 days',
      REVISION_INTERVALS.solved === 14
    );

    // 4. revisit_needed interval = 5
    recordResult(
      '4. Revisit_needed interval is 5 days',
      REVISION_INTERVALS.revisit_needed === 5
    );

    // 5. struggled interval = 2
    recordResult(
      '5. Struggled interval is 2 days',
      REVISION_INTERVALS.struggled === 2
    );

    // 6. Solved elapsed days are capped at 30
    const solvedClamped = calculatePriorityScore('solved', 90);
    recordResult(
      '6. Solved elapsed days capped at 30 days (90 days -> 30 effective days)',
      solvedClamped.effectiveDays === 30 && Math.abs(solvedClamped.priorityScore - (30 / 14)) < 0.001
    );

    // 7. Struggled elapsed days are NOT capped
    const struggledUnclamped = calculatePriorityScore('struggled', 45);
    recordResult(
      '7. Struggled elapsed days are NOT capped (45 days -> 45 effective days)',
      struggledUnclamped.effectiveDays === 45 && Math.abs(struggledUnclamped.priorityScore - (45 / 2 + 2)) < 0.001
    );

    // 8. Revisit elapsed days are NOT capped
    const revisitUnclamped = calculatePriorityScore('revisit_needed', 50);
    recordResult(
      '8. Revisit elapsed days are NOT capped (50 days -> 50 effective days)',
      revisitUnclamped.effectiveDays === 50 && Math.abs(revisitUnclamped.priorityScore - (50 / 5 + 1)) < 0.001
    );

    // ----------------------------------------------------
    // SECTION 2: RANK INVERSION BUG PROOF & REGRESSION TEST
    // ----------------------------------------------------
    console.log('\n--- SECTION 2: RANK INVERSION REGRESSION VERIFICATION ---');
    // Problem A: struggled, 1 day old
    // Problem B: revisit_needed, 8.5 days old
    const scoreA = calculatePriorityScore('struggled', 1).priorityScore; // 1/2 + 2 = 2.5
    const scoreB = calculatePriorityScore('revisit_needed', 8.5).priorityScore; // 8.5/5 + 1 = 2.7

    recordResult(
      'Rank Inversion Elimination: Problem B (revisit, 8.5d, score=2.7) ranks ABOVE Problem A (struggled, 1d, score=2.5)',
      scoreB > scoreA && scoreA === 2.5 && scoreB === 2.7,
      `scoreA=${scoreA}, scoreB=${scoreB}`
    );

    // ----------------------------------------------------
    // SECTION 3: IN-MEMORY DATABASE & ENDPOINT INTEGRATION
    // ----------------------------------------------------
    console.log('\n--- SECTION 3: IN-MEMORY DATABASE & WORKFLOW INTEGRATION ---');

    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoMemoryServer at:', uri);

    const hash = await bcrypt.hash('TestPassword123!', 10);
    const user1 = await User.create({
      name: 'User One',
      email: 'user1@example.com',
      passwordHash: hash,
    });
    const user2 = await User.create({
      name: 'User Two',
      email: 'user2@example.com',
      passwordHash: hash,
    });

    // 9. Synced problem defaults to inRevisionQueue=false
    // 10. Manual problem defaults to inRevisionQueue=true
    const manualProb = await Problem.create({
      userId: user1._id,
      title: 'Manual Two Sum',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'easy',
      topics: ['Array'],
    });

    recordResult(
      '10. Manual problem creation defaults source="manual" and inRevisionQueue=true',
      manualProb.source === 'manual' && manualProb.inRevisionQueue === true
    );

    // Create a manual attempt for manualProb (1 day old, struggled -> score 2.5)
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    await Attempt.create({
      problemId: manualProb._id,
      userId: user1._id,
      status: 'struggled',
      attemptedAt: oneDayAgo,
      notes: 'Initial practice',
    });

    // Create second manual problem (8.5 days old, revisit_needed -> score 2.7)
    const manualProbB = await Problem.create({
      userId: user1._id,
      title: 'Manual LRU Cache',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/lru-cache/',
      difficulty: 'medium',
      topics: ['Hash Table', 'Linked List'],
    });
    const eightPointFiveDaysAgo = new Date(Date.now() - 8.5 * 24 * 60 * 60 * 1000);
    await Attempt.create({
      problemId: manualProbB._id,
      userId: user1._id,
      status: 'revisit_needed',
      attemptedAt: eightPointFiveDaysAgo,
      notes: 'Pointer logic tricky',
    });

    // Create a synced historical problem (300 days old, solved)
    const threeHundredDaysAgo = new Date(Date.now() - 300 * 24 * 60 * 60 * 1000);
    const syncedProb = await Problem.create({
      userId: user1._id,
      title: 'Ancient Codeforces Problem',
      platform: 'codeforces',
      link: 'https://codeforces.com/problemset/problem/1/A',
      difficulty: 'easy',
      topics: ['Math'],
      source: 'sync',
      inRevisionQueue: false,
      createdAt: threeHundredDaysAgo,
    });

    recordResult(
      '9. Synced problem correctly initialized with source="sync" and inRevisionQueue=false',
      syncedProb.source === 'sync' && syncedProb.inRevisionQueue === false
    );

    await Attempt.create({
      problemId: syncedProb._id,
      userId: user1._id,
      status: 'solved',
      attemptedAt: threeHundredDaysAgo,
      notes: 'Synced from CODEFORCES',
    });

    // 11. Revision queue excludes synced historical problems
    const queueRes = mockResponse();
    await getRevisionQueue({ user: user1 }, queueRes, (err) => { throw err; });
    const queueData = queueRes.body.data;

    const syncedInQueue = queueData.some((q) => q.problemId === syncedProb._id.toString());
    recordResult(
      '11. Revision queue excludes synced historical problems (inRevisionQueue=false)',
      !syncedInQueue && queueData.length === 2
    );

    // Verify ranking consistency between Problem B (2.7) and Problem A (2.5) in revision queue
    recordResult(
      'Revision Queue Ranking: Problem B (2.7) ranks #1, Problem A (2.5) ranks #2',
      queueData[0].problemId === manualProbB._id.toString() &&
      queueData[1].problemId === manualProb._id.toString()
    );

    // 12. Dashboard Today's Focus excludes synced historical problems
    const recRes = mockResponse();
    await getProblemRecommendations({ user: user1 }, recRes, (err) => { throw err; });
    const recData = recRes.body.data;

    const dailyFocusIsSynced = recData.dailyFocus && recData.dailyFocus.id === syncedProb._id.toString();
    const spacedListHasSynced = recData.spacedRepetition.some((s) => s.id === syncedProb._id.toString());
    recordResult(
      '12. Dashboard Today\'s Focus and Spaced Repetition list exclude synced historical problems',
      !dailyFocusIsSynced && !spacedListHasSynced && recData.dailyFocus !== null
    );

    // Verify Dashboard ranking consistency: Spaced list order matches Revision Queue order
    recordResult(
      'Dashboard vs Revision Queue consistency: Both agree Problem B ranks above Problem A',
      recData.spacedRepetition[0].id === manualProbB._id.toString() &&
      recData.spacedRepetition[1].id === manualProb._id.toString()
    );

    // 13. Manually practicing a synced problem activates it
    const practiceAttemptReq = {
      params: { id: syncedProb._id.toString() },
      user: user1,
      body: {
        status: 'struggled',
        notes: 'Decided to practice this ancient CF problem manually',
        timeTakenMinutes: 30,
      },
    };
    const practiceAttemptRes = mockResponse();
    await createAttempt(practiceAttemptReq, practiceAttemptRes, (err) => { throw err; });

    const updatedSyncedProb = await Problem.findById(syncedProb._id);
    recordResult(
      '13. Manually practicing a synced problem sets inRevisionQueue=true while source remains "sync"',
      updatedSyncedProb.source === 'sync' && updatedSyncedProb.inRevisionQueue === true
    );

    // Now synced problem should participate in the revision queue
    const queueResAfterPractice = mockResponse();
    await getRevisionQueue({ user: user1 }, queueResAfterPractice, (err) => { throw err; });
    const queueDataAfter = queueResAfterPractice.body.data;
    const syncedNowInQueue = queueDataAfter.some((q) => q.problemId === syncedProb._id.toString());
    recordResult(
      'Activated synced problem now participates in Revision Queue',
      syncedNowInQueue && queueDataAfter.length === 3
    );

    // 14. Sync ingestion does not activate imported history
    const leetcodeAdapter = require('../src/services/platformAdapters/leetcodeAdapter');
    const originalFetch = leetcodeAdapter.fetchProblemsBySlugs;
    leetcodeAdapter.fetchProblemsBySlugs = async () => [
      {
        title: 'Imported Roman to Integer',
        link: 'https://leetcode.com/problems/roman-to-integer/',
        difficulty: 'easy',
        topics: ['Math', 'String'],
        platform: 'leetcode',
        submittedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      },
    ];

    const batchImportReq = {
      user: user1,
      body: {
        platform: 'leetcode',
        items: ['roman-to-integer'],
      },
    };
    const batchImportRes = mockResponse();
    await batchImportProblems(batchImportReq, batchImportRes, (err) => { throw err; });
    leetcodeAdapter.fetchProblemsBySlugs = originalFetch;

    const importedProb = await Problem.findOne({ title: 'Imported Roman to Integer', userId: user1._id });
    recordResult(
      '14. Sync ingestion sets source="sync" and inRevisionQueue=false (does not activate)',
      importedProb && importedProb.source === 'sync' && importedProb.inRevisionQueue === false
    );

    // 15. User isolation still works
    const user2QueueRes = mockResponse();
    await getRevisionQueue({ user: user2 }, user2QueueRes, (err) => { throw err; });
    recordResult(
      '15. User isolation: User 2 has 0 problems in revision queue',
      user2QueueRes.body.data.length === 0
    );

    const user2PracticeReq = {
      params: { id: manualProb._id.toString() }, // User 1's problem
      user: user2,
      body: { status: 'solved' },
    };
    const user2PracticeRes = mockResponse();
    await createAttempt(user2PracticeReq, user2PracticeRes, (err) => { throw err; });
    recordResult(
      'User 2 cannot log an attempt on User 1\'s problem (returns 404)',
      user2PracticeRes.statusCode === 404
    );

    // ----------------------------------------------------
    // SECTION 4: ANALYTICS PRESERVATION
    // ----------------------------------------------------
    console.log('\n--- SECTION 4: ANALYTICS HISTORICAL PRESERVATION ---');

    // Verify analytics summary includes all problems (manual + synced)
    const summaryRes = mockResponse();
    await getSummary({ user: user1 }, summaryRes, (err) => { throw err; });
    const summaryData = summaryRes.body.data;
    recordResult(
      'Analytics preservation: totalProblems includes both manual and synced problems',
      summaryData.totalProblems === 4 // manualProb, manualProbB, syncedProb, importedProb
    );

    // Verify heatmap includes all attempts
    const heatmapRes = mockResponse();
    await getHeatmap({ user: user1 }, heatmapRes, (err) => { throw err; });
    const totalHeatmapEntries = heatmapRes.body.data.reduce((sum, h) => sum + h.count, 0);
    recordResult(
      'Analytics preservation: heatmap includes historical synced attempts',
      totalHeatmapEntries >= 4
    );

    // ----------------------------------------------------
    // SECTION 5: MIGRATION SCRIPT DRY-RUN
    // ----------------------------------------------------
    console.log('\n--- SECTION 5: MIGRATION SCRIPT DRY-RUN ---');

    // Create an un-migrated legacy problem without source/inRevisionQueue
    const legacyProb = await Problem.collection.insertOne({
      userId: user1._id,
      title: 'Legacy Synced Problem',
      platform: 'codeforces',
      link: 'https://codeforces.com/problemset/problem/4/A',
      difficulty: 'easy',
      topics: ['Math'],
      createdAt: new Date(),
    });
    const legacyProbId = legacyProb.insertedId;

    await Attempt.create({
      problemId: legacyProbId,
      userId: user1._id,
      status: 'solved',
      notes: 'Synced from CODEFORCES',
      attemptedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
    });

    const dryRunReport = await runMigration({
      isDryRun: true,
      mongoUri: uri,
    });

    recordResult(
      'Migration Dry-Run: Classifies legacy record as sync and identifies it for deactivation',
      dryRunReport.problemsClassifiedSync >= 3 && dryRunReport.recordsThatWouldChange >= 1
    );

    // Verify dry run did NOT mutate the DB
    const afterDryRunProb = await Problem.collection.findOne({ _id: legacyProbId });
    recordResult(
      'Migration Dry-Run: Database is NOT modified in dry-run mode',
      afterDryRunProb.source === undefined && afterDryRunProb.inRevisionQueue === undefined
    );

    // Clean up in-memory DB
    await mongoose.disconnect();
    await mongod.stop();
    console.log('✅ In-memory MongoDB stopped cleanly.');

  } catch (err) {
    console.error('Fatal test execution error:', err);
    recordResult('Execution without unhandled exception', false, err.message);
  }

  // Final Summary
  console.log('\n==================================================');
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('==================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Total Assertions: ${results.length}`);
  console.log(`Passed:           ${passedCount}`);
  console.log(`Failed:           ${failedCount}`);

  if (failedCount > 0) {
    console.error('\n❌ SOME PHASE 1A TESTS FAILED!');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 1A TESTS PASSED PERFECTLY!');
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
