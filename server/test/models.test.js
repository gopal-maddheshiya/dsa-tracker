const assert = require('assert');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');

/**
 * Phase 2 Database & Model Verification Suite
 * Validates schemas, indexes, field constraints, and connection logic.
 */
async function runModelTests() {
  console.log('--- Starting Phase 2 Model & Schema Verification ---');

  // 1. Verify Model Import and Export
  assert.ok(User, 'User model should be defined and exported');
  assert.ok(Problem, 'Problem model should be defined and exported');
  assert.ok(Attempt, 'Attempt model should be defined and exported');
  console.log('✓ All models imported successfully');

  // 2. Verify Schema Path Level Configuration & Indexes
  const userEmailConfig = User.schema.path('email');
  assert.strictEqual(userEmailConfig.options.unique, true, 'User email must have unique: true');
  assert.strictEqual(userEmailConfig.options.lowercase, true, 'User email must have lowercase: true');
  assert.strictEqual(userEmailConfig.options.trim, true, 'User email must have trim: true');
  console.log('✓ User email unique index and normalization verified');

  const problemUserIdConfig = Problem.schema.path('userId');
  assert.strictEqual(problemUserIdConfig.options.index, true, 'Problem userId must have index: true');
  const problemPlatformConfig = Problem.schema.path('platform');
  assert.deepStrictEqual(
    problemPlatformConfig.options.enum.values,
    ['leetcode', 'gfg', 'codechef', 'hackerrank', 'other'],
    'Problem platform enum must strictly match [leetcode, gfg, codechef, hackerrank, other]'
  );
  console.log('✓ Problem userId index and platform enum strictly verified');

  const attemptProblemIdConfig = Attempt.schema.path('problemId');
  assert.strictEqual(attemptProblemIdConfig.options.index, true, 'Attempt problemId must have index: true');

  const attemptIndexes = Attempt.schema.indexes();
  const hasAttemptCompoundIndex = attemptIndexes.some(
    ([idx]) => idx.userId === 1 && idx.attemptedAt === 1
  );
  assert.ok(
    hasAttemptCompoundIndex,
    'Attempt schema must have a compound index on { userId: 1, attemptedAt: 1 }'
  );
  console.log('✓ Attempt problemId and compound { userId: 1, attemptedAt: 1 } indexes verified');

  // 3. Verify User passwordHash security
  const passwordHashConfig = User.schema.path('passwordHash');
  assert.strictEqual(
    passwordHashConfig.options.select,
    false,
    'User passwordHash must have select: false'
  );
  console.log('✓ User passwordHash select: false security verified');

  // 4. In-Memory Database Tests (mongodb-memory-server)
  console.log('--- Starting In-Memory Mongoose Validation Tests ---');
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  try {
    // 4.1 Test User Validation & Creation
    const validUser = new User({
      name: 'Test Engineer',
      email: 'ENGINEER@EXAMPLE.COM',
      passwordHash: 'dummy_hash_for_testing',
    });
    await validUser.validate();
    assert.strictEqual(validUser.email, 'engineer@example.com', 'User email should be lowercased');

    // Verify toJSON omits passwordHash
    const userJson = validUser.toJSON();
    assert.strictEqual(userJson.passwordHash, undefined, 'User toJSON must never expose passwordHash');
    console.log('✓ User validation, normalization & passwordHash safety passed');

    // User rejection on missing/blank fields
    const invalidUser = new User({ name: '   ', email: 'not-an-email' });
    let userValidationError = null;
    try {
      await invalidUser.validate();
    } catch (err) {
      userValidationError = err;
    }
    assert.ok(userValidationError, 'Invalid user should fail validation');
    assert.ok(userValidationError.errors.name, 'Empty name should trigger error');
    assert.ok(userValidationError.errors.email, 'Malformed email should trigger error');
    assert.ok(userValidationError.errors.passwordHash, 'Missing passwordHash should trigger error');
    console.log('✓ User invalid inputs correctly rejected');

    // 4.2 Test Problem Validation
    const testUserId = new mongoose.Types.ObjectId();
    const validProblem = new Problem({
      userId: testUserId,
      title: 'Two Sum',
      platform: 'LeetCode',
      link: 'https://leetcode.com/problems/two-sum/',
      topics: [' Array ', 'Hash Table'],
      difficulty: 'Easy',
    });
    await validProblem.validate();
    assert.strictEqual(validProblem.platform, 'leetcode', 'Problem platform should be lowercased');
    assert.strictEqual(validProblem.difficulty, 'easy', 'Problem difficulty should be lowercased');
    assert.deepStrictEqual(validProblem.topics, ['Array', 'Hash Table'], 'Problem topics should be trimmed array');
    console.log('✓ Problem validation & topic trimming passed');

    // Problem rejection on invalid enum / bad url
    const invalidProblem = new Problem({
      userId: testUserId,
      title: '',
      platform: 'unknown_site',
      link: 'not-a-valid-url',
      topics: [],
      difficulty: 'impossible',
    });
    let problemValidationError = null;
    try {
      await invalidProblem.validate();
    } catch (err) {
      problemValidationError = err;
    }
    assert.ok(problemValidationError, 'Invalid problem should fail validation');
    assert.ok(problemValidationError.errors.title, 'Empty title should fail');
    assert.ok(problemValidationError.errors.platform, 'Unknown platform should fail');
    assert.ok(problemValidationError.errors.link, 'Malformed link should fail');
    assert.ok(problemValidationError.errors.topics, 'Empty topics array should fail');
    assert.ok(problemValidationError.errors.difficulty, 'Invalid difficulty should fail');

    // Explicit test for disallowed platforms in specification: codeforces, algoexpert
    const disallowedPlatforms = ['codeforces', 'algoexpert'];
    for (const p of disallowedPlatforms) {
      const pDoc = new Problem({
        userId: testUserId,
        title: 'Disallowed Platform Test',
        platform: p,
        link: 'https://example.com/prob',
        topics: ['Array'],
        difficulty: 'easy',
      });
      let pErr = null;
      try {
        await pDoc.validate();
      } catch (err) {
        pErr = err;
      }
      assert.ok(pErr && pErr.errors.platform, `Platform ${p} must be rejected by Mongoose model`);
    }
    console.log('✓ Problem invalid inputs and disallowed platforms (codeforces, algoexpert) correctly rejected');

    // 4.3 Test Attempt Validation
    const testProblemId = new mongoose.Types.ObjectId();
    const validAttempt = new Attempt({
      problemId: testProblemId,
      userId: testUserId,
      status: 'SOLVED',
      timeTakenMinutes: 25,
      notes: 'Solved using hash map for O(n) lookup time',
    });
    await validAttempt.validate();
    assert.strictEqual(validAttempt.status, 'solved', 'Attempt status should be lowercased');
    assert.ok(validAttempt.attemptedAt instanceof Date, 'Attempt attemptedAt must default to Date');
    console.log('✓ Attempt validation passed');

    // Attempt rejection on invalid status / negative time
    const invalidAttempt = new Attempt({
      problemId: testProblemId,
      userId: testUserId,
      status: 'partially_solved',
      timeTakenMinutes: -10,
    });
    let attemptValidationError = null;
    try {
      await invalidAttempt.validate();
    } catch (err) {
      attemptValidationError = err;
    }
    assert.ok(attemptValidationError, 'Invalid attempt should fail validation');
    assert.ok(attemptValidationError.errors.status, 'Invalid status enum should fail');
    assert.ok(attemptValidationError.errors.timeTakenMinutes, 'Negative time taken should fail');
    console.log('✓ Attempt invalid inputs correctly rejected');

  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }

  // 5. Test db.js error handling when MONGO_URI is missing
  console.log('--- Testing db.js Missing URI Error Handling ---');
  const originalUri = process.env.MONGO_URI;
  delete process.env.MONGO_URI;

  let missingUriError = null;
  try {
    await connectDB();
  } catch (err) {
    missingUriError = err;
  }
  assert.ok(missingUriError, 'connectDB should throw when MONGO_URI is missing');
  assert.ok(
    missingUriError.message.includes('MONGO_URI is not defined'),
    'Error message should specify missing MONGO_URI'
  );
  process.env.MONGO_URI = originalUri;
  console.log('✓ connectDB error handling for missing URI verified');

  console.log('--- All Phase 2 Model & Schema Tests Passed Successfully ---');
}

runModelTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
