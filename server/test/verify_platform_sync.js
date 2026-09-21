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
} = require('../src/controllers/sync.controller');
const leetcodeAdapter = require('../src/services/platformAdapters/leetcodeAdapter');
const codeforcesAdapter = require('../src/services/platformAdapters/codeforcesAdapter');

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
  console.log('--- STARTING PLATFORM SYNC INTEGRATION TESTS ---');
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
    if (resStatus.statusCode !== 200 || !resStatus.body.data.leetcode || !resStatus.body.data.codeforces) {
      throw new Error(`getSyncStatus failed: ${JSON.stringify(resStatus.body)}`);
    }
    console.log('✅ 1. getSyncStatus returned proper platform schemas');

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

    // 4. Test syncPlatform for Codeforces (live sync with real deduplication test)
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

    // 6. Test disconnectPlatform
    const reqDisconnect = { user: testUser, body: { platform: 'codeforces' } };
    const resDisconnect = mockResponse();
    await disconnectPlatform(reqDisconnect, resDisconnect);
    if (resDisconnect.statusCode !== 200 || resDisconnect.body.data.isConnected !== false) {
      throw new Error('disconnectPlatform failed');
    }
    console.log('✅ 7. disconnectPlatform successfully unlinked platform');

    // 7. Test LeetCode connection & sync with lee215
    const reqConnectLc = { user: testUser, body: { platform: 'leetcode', handle: 'lee215' } };
    const resConnectLc = mockResponse();
    await connectPlatform(reqConnectLc, resConnectLc);
    if (resConnectLc.statusCode !== 200 || !resConnectLc.body.data.isConnected) {
      throw new Error(`connectPlatform for LeetCode failed: ${JSON.stringify(resConnectLc.body)}`);
    }
    console.log('✅ 8. connectPlatform connected LeetCode lee215 account');

    const reqSyncLc = { user: testUser, params: { platform: 'leetcode' } };
    const resSyncLc = mockResponse();
    await syncPlatform(reqSyncLc, resSyncLc);
    if (resSyncLc.statusCode !== 200) {
      throw new Error(`syncPlatform for LeetCode failed: ${JSON.stringify(resSyncLc.body)}`);
    }
    console.log(`✅ 9. syncPlatform synced ${resSyncLc.body.data.syncedCount} problems from LeetCode lee215`);

    console.log('--- ALL PLATFORM SYNC TESTS PASSED SUCCESSFULLY! ---');
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
