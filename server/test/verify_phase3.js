const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'dsa_tracker_phase3_test_secret_key_12345';

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');
const {
  getProblems,
  createProblem,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require('../src/controllers/problem.controller');
const {
  createAttempt,
  getAttemptsForProblem,
} = require('../src/controllers/attempt.controller');
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
  console.log('--- STARTING PHASE 3 PROBLEM + ATTEMPT CRUD VERIFICATION ---');
  let mongod;
  const results = [];

  try {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('✅ Connected to in-memory MongoDB');

    // Setup Test Users: User A and User B
    const hash = await bcrypt.hash('password123', 10);
    const userA = await User.create({
      name: 'User Alpha',
      email: 'alpha@example.com',
      passwordHash: hash,
    });
    const userB = await User.create({
      name: 'User Beta',
      email: 'beta@example.com',
      passwordHash: hash,
    });

    const tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const tokenB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // TEST 1: Unauthenticated GET /api/problems -> 401
    const unauthReq = { headers: {} };
    const unauthRes = mockResponse();
    let unauthNextCalled = false;
    await protect(unauthReq, unauthRes, () => { unauthNextCalled = true; });
    results.push({
      test: '1. Unauthenticated GET /api/problems returns 401',
      passed: unauthRes.statusCode === 401 && !unauthNextCalled,
    });

    // TEST 2: Authenticated user A creates a problem
    const createReq = {
      user: userA,
      body: {
        title: 'Two Sum',
        platform: 'leetcode',
        link: 'https://leetcode.com/problems/two-sum/',
        topics: ['Array', 'Hash Table', 'Array'], // duplicated tag test
        difficulty: 'easy',
      },
    };
    const createRes = mockResponse();
    await createProblem(createReq, createRes, (err) => { throw err; });
    const problemA = createRes.body.data;
    const createPassed =
      createRes.statusCode === 201 &&
      problemA.title === 'Two Sum' &&
      problemA.platform === 'leetcode' &&
      problemA.difficulty === 'easy' &&
      problemA.topics.length === 2 && // deduplicated
      problemA.userId.toString() === userA._id.toString();
    results.push({
      test: '2. Authenticated user can create a problem with normalized topics',
      passed: createPassed,
    });

    // TEST 3: User A lists only their own problems
    const listReqA = { user: userA, query: {} };
    const listResA = mockResponse();
    await getProblems(listReqA, listResA, (err) => { throw err; });
    results.push({
      test: '3. Authenticated user lists only their own problems',
      passed: listResA.statusCode === 200 && listResA.body.data.length === 1 && listResA.body.data[0].id === problemA.id,
    });

    // User B lists their problems (should be empty)
    const listReqB = { user: userB, query: {} };
    const listResB = mockResponse();
    await getProblems(listReqB, listResB, (err) => { throw err; });
    results.push({
      test: '3b. User B sees 0 problems initially',
      passed: listResB.statusCode === 200 && listResB.body.data.length === 0,
    });

    // TEST 4: User A gets their own problem by id
    const getReq = { user: userA, params: { id: problemA.id } };
    const getRes = mockResponse();
    await getProblemById(getReq, getRes, (err) => { throw err; });
    results.push({
      test: '4. User can retrieve their own problem with attempt array',
      passed: getRes.statusCode === 200 && getRes.body.data.id === problemA.id && Array.isArray(getRes.body.data.attempts),
    });

    // TEST 5: User A updates their own problem
    const updateReq = {
      user: userA,
      params: { id: problemA.id },
      body: { difficulty: 'medium', topics: ['Array', 'Hash Map'] },
    };
    const updateRes = mockResponse();
    await updateProblem(updateReq, updateRes, (err) => { throw err; });
    results.push({
      test: '5. User can update their own problem fields',
      passed: updateRes.statusCode === 200 && updateRes.body.data.difficulty === 'medium' && updateRes.body.data.topics.includes('Hash Map'),
    });

    // TEST 7: User A logs an attempt for their own problem
    const attemptReq = {
      user: userA,
      params: { id: problemA.id },
      body: {
        status: 'struggled',
        timeTakenMinutes: 35,
        notes: 'Had difficulty with edge cases',
        attemptedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    };
    const attemptRes = mockResponse();
    await createAttempt(attemptReq, attemptRes, (err) => { throw err; });
    const attempt1 = attemptRes.body.data;
    results.push({
      test: '7. User can create an attempt for their own problem',
      passed: attemptRes.statusCode === 201 && attempt1.status === 'struggled' && attempt1.timeTakenMinutes === 35,
    });

    // Log a second attempt: 'solved'
    const attemptReq2 = {
      user: userA,
      params: { id: problemA.id },
      body: {
        status: 'solved',
        timeTakenMinutes: 15,
        notes: 'Solved cleanly using map lookup',
      },
    };
    const attemptRes2 = mockResponse();
    await createAttempt(attemptReq2, attemptRes2, (err) => { throw err; });
    const attempt2 = attemptRes2.body.data;

    // TEST 8: User A retrieves attempt history for problem (sorted newest first)
    const getAttemptsReq = { user: userA, params: { id: problemA.id } };
    const getAttemptsRes = mockResponse();
    await getAttemptsForProblem(getAttemptsReq, getAttemptsRes, (err) => { throw err; });
    const attemptsList = getAttemptsRes.body.data;
    results.push({
      test: '8. User can retrieve attempts for problem, sorted newest first',
      passed: getAttemptsRes.statusCode === 200 &&
        attemptsList.length === 2 &&
        attemptsList[0].id === attempt2.id && // newest first
        attemptsList[1].id === attempt1.id,
    });

    // TEST Derived Status Filter on GET /api/problems?status=solved
    const statusFilterReq = { user: userA, query: { status: 'solved' } };
    const statusFilterRes = mockResponse();
    await getProblems(statusFilterReq, statusFilterRes, (err) => { throw err; });
    results.push({
      test: 'Status Filter: filters correctly by derived latest attempt',
      passed: statusFilterRes.statusCode === 200 && statusFilterRes.body.data.length === 1 && statusFilterRes.body.data[0].latestAttempt.status === 'solved',
    });

    // TEST 9: User B CANNOT access User A's problem
    const crossGetReq = { user: userB, params: { id: problemA.id } };
    const crossGetRes = mockResponse();
    await getProblemById(crossGetReq, crossGetRes, (err) => { throw err; });
    results.push({
      test: "9. Cross-user isolation: User B cannot access User A's problem (404)",
      passed: crossGetRes.statusCode === 404,
    });

    // TEST 10: User B CANNOT update User A's problem
    const crossUpdateReq = { user: userB, params: { id: problemA.id }, body: { title: 'Hacked Title' } };
    const crossUpdateRes = mockResponse();
    await updateProblem(crossUpdateReq, crossUpdateRes, (err) => { throw err; });
    results.push({
      test: "10. Cross-user isolation: User B cannot update User A's problem (404)",
      passed: crossUpdateRes.statusCode === 404,
    });

    // TEST 12: User B CANNOT log an attempt for User A's problem
    const crossAttemptReq = { user: userB, params: { id: problemA.id }, body: { status: 'solved' } };
    const crossAttemptRes = mockResponse();
    await createAttempt(crossAttemptReq, crossAttemptRes, (err) => { throw err; });
    results.push({
      test: "12. Cross-user isolation: User B cannot add attempt to User A's problem (404)",
      passed: crossAttemptRes.statusCode === 404,
    });

    // TEST 11: User B CANNOT delete User A's problem
    const crossDeleteReq = { user: userB, params: { id: problemA.id } };
    const crossDeleteRes = mockResponse();
    await deleteProblem(crossDeleteReq, crossDeleteRes, (err) => { throw err; });
    results.push({
      test: "11. Cross-user isolation: User B cannot delete User A's problem (404)",
      passed: crossDeleteRes.statusCode === 404,
    });

    // TEST 14: Invalid ObjectIds handled safely
    const invalidIdReq = { user: userA, params: { id: 'invalid-non-hex-id-123' } };
    const invalidIdRes = mockResponse();
    await getProblemById(invalidIdReq, invalidIdRes, (err) => { throw err; });
    results.push({
      test: '14. Invalid ObjectId handled safely with 404',
      passed: invalidIdRes.statusCode === 404,
    });

    // TEST 15: Missing required fields return 400
    const missingReq = { user: userA, body: { title: '' } };
    const missingRes = mockResponse();
    await createProblem(missingReq, missingRes, (err) => { throw err; });
    results.push({
      test: '15. Missing required fields in Problem creation return 400',
      passed: missingRes.statusCode === 400,
    });

    // TEST 16: Negative timeTakenMinutes is rejected with 400
    const negTimeReq = { user: userA, params: { id: problemA.id }, body: { status: 'solved', timeTakenMinutes: -10 } };
    const negTimeRes = mockResponse();
    await createAttempt(negTimeReq, negTimeRes, (err) => { throw err; });
    results.push({
      test: '16. Negative timeTakenMinutes is rejected with 400',
      passed: negTimeRes.statusCode === 400,
    });

    // TEST 6 & 13: User A deletes problem and CASCADE deletes all its attempts
    const deleteReq = { user: userA, params: { id: problemA.id } };
    const deleteRes = mockResponse();
    await deleteProblem(deleteReq, deleteRes, (err) => { throw err; });
    const remainingAttempts = await Attempt.find({ problemId: problemA.id });
    const problemRecord = await Problem.findById(problemA.id);
    results.push({
      test: '6 & 13. Cascade deletion: deleting problem deletes all related attempts',
      passed: deleteRes.statusCode === 200 && problemRecord === null && remainingAttempts.length === 0,
    });

  } catch (err) {
    console.error('Test execution exception:', err);
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
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL PHASE 3 TESTS PASSED' : 'SOME TESTS FAILED'}`);
  process.exit(allPassed ? 0 : 1);
}

runTests();
