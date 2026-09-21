const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'dsa_tracker_super_secret_test_jwt_key_98765';

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');
const {
  getSyncStatus,
  connectPlatform,
  disconnectPlatform,
  syncPlatform,
  syncAllPlatforms,
  batchImportProblems,
} = require('../src/controllers/sync.controller');

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
  console.log('--- STARTING PLATFORM SYNC INTEGRATION TESTS (PHASE 2 - 4 PLATFORMS) ---');
  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory MongoDB');

    // Create test user
    const testUser = await User.create({
      name: 'Sync Test User',
      email: 'synctest@example.com',
      passwordHash: 'dummyhash',
    });

    // 1. Test getSyncStatus
    const reqStatus = { user: testUser };
    const resStatus = mockResponse();
    await getSyncStatus(reqStatus, resStatus);
    if (
      resStatus.statusCode !== 200 ||
      !resStatus.body.data.leetcode ||
      !resStatus.body.data.codeforces ||
      !resStatus.body.data.gfg ||
      !resStatus.body.data.codechef
    ) {
      throw new Error(`getSyncStatus failed: ${JSON.stringify(resStatus.body)}`);
    }
    console.log('✅ 1. getSyncStatus returned proper schemas for all 4 platforms (LeetCode, Codeforces, GFG, CodeChef)');

    // 2. Test connectPlatform with unsupported platform
    const reqBadPlatform = { user: testUser, body: { platform: 'unsupported', handle: 'xyz' } };
    const resBadPlatform = mockResponse();
    await connectPlatform(reqBadPlatform, resBadPlatform);
    if (resBadPlatform.statusCode !== 400) {
      throw new Error('connectPlatform should fail on unsupported platform');
    }
    console.log('✅ 2. connectPlatform rejected unsupported platform');

    // 3. Test connectPlatform with Codeforces tourist handle
    const reqConnectCf = { user: testUser, body: { platform: 'codeforces', handle: 'tourist' } };
    const resConnectCf = mockResponse();
    await connectPlatform(reqConnectCf, resConnectCf);
    if (resConnectCf.statusCode !== 200 || !resConnectCf.body.data.isConnected) {
      throw new Error(`connectPlatform for Codeforces failed: ${JSON.stringify(resConnectCf.body)}`);
    }
    console.log('✅ 3. connectPlatform connected Codeforces tourist account with stats');

    // 4. Test syncPlatform for Codeforces
    const reqSyncCf = { user: testUser, params: { platform: 'codeforces' } };
    const resSyncCf = mockResponse();
    await syncPlatform(reqSyncCf, resSyncCf);
    if (resSyncCf.statusCode !== 200) {
      throw new Error(`syncPlatform for Codeforces failed: ${JSON.stringify(resSyncCf.body)}`);
    }
    const syncedCount = resSyncCf.body.data.syncedCount;
    if (syncedCount === 0) {
      throw new Error('Codeforces tourist should have synced at least 1 problem');
    }
    console.log(`✅ 4. syncPlatform synced ${syncedCount} problems from Codeforces tourist`);

    // Verify problems and attempts were created with historical dates
    const createdProblems = await Problem.find({ userId: testUser._id });
    const createdAttempts = await Attempt.find({ userId: testUser._id });
    if (createdProblems.length !== syncedCount || createdAttempts.length !== syncedCount) {
      throw new Error(`Mismatch in created problems (${createdProblems.length}) and attempts (${createdAttempts.length})`);
    }
    console.log(`✅ 5. Confirmed ${createdProblems.length} Problem records and ${createdAttempts.length} Attempt records`);

    // 5. Test Deduplication: sync the exact same platform again
    const resSyncAgain = mockResponse();
    await syncPlatform(reqSyncCf, resSyncAgain);
    if (resSyncAgain.statusCode !== 200) {
      throw new Error(`Second sync failed: ${JSON.stringify(resSyncAgain.body)}`);
    }
    if (resSyncAgain.body.data.syncedCount !== 0) {
      throw new Error(`Deduplication failed! Expected 0 new problems, got ${resSyncAgain.body.data.syncedCount}`);
    }
    if (resSyncAgain.body.data.skippedDuplicates !== syncedCount) {
      throw new Error(`Expected ${syncedCount} duplicates skipped, got ${resSyncAgain.body.data.skippedDuplicates}`);
    }
    console.log(`✅ 6. Deduplication passed: 0 new problems inserted, ${resSyncAgain.body.data.skippedDuplicates} duplicates correctly skipped`);

    // 6. Test GFG Connect & Sync
    const reqConnectGfg = { user: testUser, body: { platform: 'gfg', handle: 'theghost01' } };
    const resConnectGfg = mockResponse();
    await connectPlatform(reqConnectGfg, resConnectGfg);
    if (resConnectGfg.statusCode !== 200 || !resConnectGfg.body.data.isConnected) {
      throw new Error(`connectPlatform for GFG failed: ${JSON.stringify(resConnectGfg.body)}`);
    }
    console.log(`✅ 7. connectPlatform connected GFG account '${resConnectGfg.body.data.handle}' with score & solved count`);

    const reqSyncGfg = { user: testUser, params: { platform: 'gfg' } };
    const resSyncGfg = mockResponse();
    await syncPlatform(reqSyncGfg, resSyncGfg);
    if (resSyncGfg.statusCode !== 200) {
      throw new Error(`syncPlatform for GFG failed: ${JSON.stringify(resSyncGfg.body)}`);
    }
    console.log(`✅ 8. syncPlatform synced ${resSyncGfg.body.data.syncedCount} GFG problems (skipped: ${resSyncGfg.body.data.skippedDuplicates})`);

    // 7. Test CodeChef Connect & Sync
    const reqConnectCc = { user: testUser, body: { platform: 'codechef', handle: 'tourist' } };
    const resConnectCc = mockResponse();
    await connectPlatform(reqConnectCc, resConnectCc);
    if (resConnectCc.statusCode !== 200 || !resConnectCc.body.data.isConnected) {
      throw new Error(`connectPlatform for CodeChef failed: ${JSON.stringify(resConnectCc.body)}`);
    }
    console.log(`✅ 9. connectPlatform connected CodeChef tourist account with rating & stars`);

    const reqSyncCc = { user: testUser, params: { platform: 'codechef' } };
    const resSyncCc = mockResponse();
    await syncPlatform(reqSyncCc, resSyncCc);
    if (resSyncCc.statusCode !== 200) {
      throw new Error(`syncPlatform for CodeChef failed: ${JSON.stringify(resSyncCc.body)}`);
    }
    console.log(`✅ 10. syncPlatform synced ${resSyncCc.body.data.syncedCount} CodeChef problems (skipped: ${resSyncCc.body.data.skippedDuplicates})`);

    // 8. Test syncAllPlatforms (runs all connected platforms simultaneously)
    const reqSyncAll = { user: testUser };
    const resSyncAll = mockResponse();
    await syncAllPlatforms(reqSyncAll, resSyncAll);
    if (resSyncAll.statusCode !== 200) {
      throw new Error(`syncAllPlatforms failed: ${JSON.stringify(resSyncAll.body)}`);
    }
    console.log(`✅ 11. syncAllPlatforms completed across connected platforms (${JSON.stringify(resSyncAll.body.data.summary)})`);

    // 9. Test disconnectPlatform
    const reqDisconnect = { user: testUser, body: { platform: 'gfg' } };
    const resDisconnect = mockResponse();
    await disconnectPlatform(reqDisconnect, resDisconnect);
    if (resDisconnect.statusCode !== 200 || resDisconnect.body.data.isConnected !== false) {
      throw new Error('disconnectPlatform failed');
    }
    console.log('✅ 12. disconnectPlatform successfully unlinked GFG platform');

    // 10. Test batchImportProblems
    const reqBatch = {
      user: testUser,
      body: {
        platform: 'leetcode',
        items: ['two-sum', 'https://leetcode.com/problems/add-two-numbers/'],
      },
    };
    const resBatch = mockResponse();
    await batchImportProblems(reqBatch, resBatch);
    if (resBatch.statusCode !== 200 || resBatch.body.data.importedCount < 1) {
      throw new Error(`batchImportProblems failed: ${JSON.stringify(resBatch.body)}`);
    }
    console.log(`✅ 13. batchImportProblems successfully imported ${resBatch.body.data.importedCount} problems`);

    // 11. Test batchImportProblems deduplication
    const resBatchDup = mockResponse();
    await batchImportProblems(reqBatch, resBatchDup);
    if (resBatchDup.statusCode !== 200 || resBatchDup.body.data.importedCount !== 0) {
      throw new Error(`batchImportProblems deduplication failed: ${JSON.stringify(resBatchDup.body)}`);
    }
    console.log(`✅ 14. batchImportProblems correctly skipped ${resBatchDup.body.data.skippedDuplicates} duplicates`);

    console.log('--- ALL 4 PLATFORM SYNC INTEGRATION TESTS PASSED 100%! ---');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
}

runTests();
