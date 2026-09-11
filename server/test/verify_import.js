const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'dsa_tracker_super_secret_test_jwt_key_98765';

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');
const { signup } = require('../src/controllers/auth.controller');
const { importProblems } = require('../src/controllers/problem.controller');

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
  console.log('--- STARTING BULK DATA IMPORT VERIFICATION ---');
  let mongod;
  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory MongoDB');

    // 1. Create a user
    const resSignup = mockResponse();
    await signup(
      { body: { name: 'Import Tester', email: 'importer@test.com', password: 'password123' } },
      resSignup
    );
    const user = await User.findOne({ email: 'importer@test.com' });

    // 2. Import 3 problems with 1 duplicate title
    const batch1 = [
      {
        title: 'Two Sum',
        platform: 'leetcode',
        link: 'https://leetcode.com/problems/two-sum/',
        topics: ['Array', 'Hash Table'],
        difficulty: 'easy',
        attempts: [{ status: 'solved', timeTakenMinutes: 15, notes: 'Used hash map' }],
      },
      {
        title: 'Merge K Sorted Lists',
        platform: 'leetcode',
        link: 'https://leetcode.com/problems/merge-k-sorted-lists/',
        topics: ['Linked List', 'Heap'],
        difficulty: 'hard',
      },
      {
        title: 'Two Sum', // Duplicate within batch
        platform: 'leetcode',
        link: 'https://leetcode.com/problems/two-sum/',
        topics: ['Array'],
        difficulty: 'easy',
      },
    ];

    const reqImport1 = { user, body: { problems: batch1 } };
    const resImport1 = mockResponse();
    await importProblems(reqImport1, resImport1);

    if (resImport1.statusCode !== 200) {
      throw new Error(`Import failed with status ${resImport1.statusCode}: ${JSON.stringify(resImport1.body)}`);
    }

    if (resImport1.body.count !== 2 || resImport1.body.skipped !== 1) {
      throw new Error(`Expected count=2, skipped=1, got: ${JSON.stringify(resImport1.body)}`);
    }
    console.log('✅ 1. Batch import created 2 problems and skipped 1 internal duplicate');

    // Verify attempt restored
    const twoSum = await Problem.findOne({ userId: user._id, title: 'Two Sum' });
    const attempts = await Attempt.find({ problemId: twoSum._id });
    if (attempts.length !== 1 || attempts[0].status !== 'solved') {
      throw new Error('Attempt was not restored properly for Two Sum');
    }
    console.log('✅ 2. Nested attempt was restored for Two Sum');

    // 3. Second import with identical problem should skip it as already existing
    const batch2 = [
      {
        title: 'Two Sum',
        platform: 'leetcode',
        link: 'https://leetcode.com/problems/two-sum/',
        difficulty: 'easy',
      },
      {
        title: 'Invert Binary Tree',
        platform: 'leetcode',
        link: 'https://leetcode.com/problems/invert-binary-tree/',
        topics: ['Tree', 'DFS'],
        difficulty: 'easy',
      },
    ];
    const reqImport2 = { user, body: { problems: batch2 } };
    const resImport2 = mockResponse();
    await importProblems(reqImport2, resImport2);

    if (resImport2.body.count !== 1 || resImport2.body.skipped !== 1) {
      throw new Error(`Expected count=1, skipped=1, got: ${JSON.stringify(resImport2.body)}`);
    }
    console.log('✅ 3. Second import properly skipped existing database record and imported 1 new');

    console.log('\n🎉 ALL BULK DATA IMPORT TESTS PASSED!');
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
