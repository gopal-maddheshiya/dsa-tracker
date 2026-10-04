const assert = require('assert');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test_secret_for_problems_integration_12345';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');
const { generateToken } = require('../src/utils/token');

/**
 * Phase 5 Integration Test Suite
 * Covers all 38 test requirements for Problem and Attempt APIs.
 */
async function runProblemsTests() {
  console.log('--- Starting Phase 5 Problem & Attempt Test Suite ---');

  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Helper function for authenticated fetch
    const authFetch = (url, options = {}, token) => {
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return fetch(url, { ...options, headers });
    };

    // Create User A and User B
    const userA = await User.create({
      name: 'User A',
      email: 'userA@example.com',
      passwordHash: 'dummy_hash_A',
    });
    const tokenA = generateToken(userA._id);

    const userB = await User.create({
      name: 'User B',
      email: 'userB@example.com',
      passwordHash: 'dummy_hash_B',
    });
    const tokenB = generateToken(userB._id);

    const userPlatform = await User.create({
      name: 'Platform Tester',
      email: 'platform@example.com',
      passwordHash: 'dummy_hash_platform',
    });
    const tokenPlatform = generateToken(userPlatform._id);

    // =========================================================================
    // 1–4: AUTHENTICATION ENFORCEMENT
    // =========================================================================
    const fakeId = new mongoose.Types.ObjectId();

    const noAuthGet = await fetch(`${baseUrl}/api/problems`);
    assert.strictEqual(noAuthGet.status, 401, '1. GET /api/problems without token should return 401');

    const noAuthPost = await fetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Two Sum' }),
    });
    assert.strictEqual(noAuthPost.status, 401, '2. POST /api/problems without token should return 401');

    const noAuthGetSingle = await fetch(`${baseUrl}/api/problems/${fakeId}`);
    assert.strictEqual(noAuthGetSingle.status, 401, '3. GET /api/problems/:id without token should return 401');

    const noAuthPostAttempt = await fetch(`${baseUrl}/api/problems/${fakeId}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'solved' }),
    });
    assert.strictEqual(noAuthPostAttempt.status, 401, '4. POST /api/problems/:id/attempts without token should return 401');
    console.log('✓ 1–4. Authentication enforcement verified (401 on unauthenticated calls)');

    // =========================================================================
    // 5–10: PROBLEM CREATION & INPUT VALIDATION
    // =========================================================================
    const validProblemPayload = {
      title: 'Two Sum',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/two-sum/',
      topics: ['Array', 'Hash Table', 'Array'], // Note: 'Array' is duplicated
      difficulty: 'easy',
    };

    const createRes = await authFetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      body: JSON.stringify(validProblemPayload),
    }, tokenA);
    assert.strictEqual(createRes.status, 201, '5. Valid problem creation must return 201');
    const createData = await createRes.json();
    assert.strictEqual(createData.success, true);
    const problemA = createData.data.problem;
    assert.strictEqual(problemA.title, 'Two Sum');
    assert.strictEqual(problemA.difficulty, 'easy');
    // Deduplication check: 'Array' duplicated in payload should be deduplicated
    assert.deepStrictEqual(problemA.topics, ['Array', 'Hash Table'], 'Duplicate topics should be deduplicated');

    // Missing title -> 400
    const badTitleRes = await authFetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      body: JSON.stringify({ ...validProblemPayload, title: '   ' }),
    }, tokenA);
    assert.strictEqual(badTitleRes.status, 400, '6. Missing title must return 400');

    // 7. Platform validation: exactly [leetcode, gfg, codechef, hackerrank, other]
    const allowedPlatforms = ['leetcode', 'gfg', 'codechef', 'hackerrank', 'other'];
    for (const validPlat of allowedPlatforms) {
      const platRes = await authFetch(`${baseUrl}/api/problems`, {
        method: 'POST',
        body: JSON.stringify({
          ...validProblemPayload,
          title: `Problem on ${validPlat}`,
          platform: validPlat,
        }),
      }, tokenPlatform);
      assert.strictEqual(platRes.status, 201, `Platform '${validPlat}' must be accepted with 201`);
    }

    // Explicitly reject codeforces -> 400
    const codeforcesRes = await authFetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      body: JSON.stringify({ ...validProblemPayload, platform: 'codeforces' }),
    }, tokenPlatform);
    assert.strictEqual(codeforcesRes.status, 400, 'Platform codeforces must be rejected with 400');

    // Explicitly reject algoexpert -> 400
    const algoexpertRes = await authFetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      body: JSON.stringify({ ...validProblemPayload, platform: 'algoexpert' }),
    }, tokenPlatform);
    assert.strictEqual(algoexpertRes.status, 400, 'Platform algoexpert must be rejected with 400');

    // Arbitrary invalid platform -> 400
    const badPlatformRes = await authFetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      body: JSON.stringify({ ...validProblemPayload, platform: 'unsupported_site' }),
    }, tokenPlatform);
    assert.strictEqual(badPlatformRes.status, 400, '7. Invalid platform must return 400');

    // Invalid difficulty -> 400
    const badDiffRes = await authFetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      body: JSON.stringify({ ...validProblemPayload, difficulty: 'expert' }),
    }, tokenA);
    assert.strictEqual(badDiffRes.status, 400, '8. Invalid difficulty must return 400');

    // Invalid topics -> 400
    const badTopicsRes = await authFetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      body: JSON.stringify({ ...validProblemPayload, topics: [] }),
    }, tokenA);
    assert.strictEqual(badTopicsRes.status, 400, '9. Empty topics array must return 400');

    // Invalid link -> 400
    const badLinkRes = await authFetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      body: JSON.stringify({ ...validProblemPayload, link: 'not-a-valid-url' }),
    }, tokenA);
    assert.strictEqual(badLinkRes.status, 400, '10. Invalid URL must return 400');
    console.log('✓ 5–10. Problem creation & validation passed');

    // =========================================================================
    // 11–16: OWNERSHIP ENFORCEMENT & CROSS-USER SECURITY
    // =========================================================================
    // 11. Created problem belongs to authenticated user
    const dbProblem = await Problem.findById(problemA.id);
    assert.strictEqual(dbProblem.userId.toString(), userA._id.toString(), '11. Problem must belong to User A');

    // 12. User B cannot access Problem A (returns 404)
    const userBGet = await authFetch(`${baseUrl}/api/problems/${problemA.id}`, {}, tokenB);
    assert.strictEqual(userBGet.status, 404, '12. Another user must receive 404');

    // 13. User B cannot update Problem A (returns 404)
    const userBUpdate = await authFetch(`${baseUrl}/api/problems/${problemA.id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: 'Hacked Title' }),
    }, tokenB);
    assert.strictEqual(userBUpdate.status, 404, '13. Another user cannot update problem (404)');

    // 14. User B cannot delete Problem A (returns 404)
    const userBDelete = await authFetch(`${baseUrl}/api/problems/${problemA.id}`, {
      method: 'DELETE',
    }, tokenB);
    assert.strictEqual(userBDelete.status, 404, '14. Another user cannot delete problem (404)');

    // 15. User B cannot log attempt against Problem A (returns 404)
    const userBAttempt = await authFetch(`${baseUrl}/api/problems/${problemA.id}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ status: 'solved' }),
    }, tokenB);
    assert.strictEqual(userBAttempt.status, 404, '15. Another user cannot log attempt on problem (404)');

    // 16. User B cannot read Problem A attempts (returns 404)
    const userBGetAttempts = await authFetch(`${baseUrl}/api/problems/${problemA.id}/attempts`, {}, tokenB);
    assert.strictEqual(userBGetAttempts.status, 404, '16. Another user cannot read problem attempts (404)');
    console.log('✓ 11–16. Ownership enforcement verified (404 on cross-user access)');

    // =========================================================================
    // 17–20: PROBLEM READ & NO-ATTEMPT HANDLING
    // =========================================================================
    // 17 & 18. Get problem returns details + attempts array
    const userAGet = await authFetch(`${baseUrl}/api/problems/${problemA.id}`, {}, tokenA);
    assert.strictEqual(userAGet.status, 200, '17. Owner can get problem details');
    const userAGetData = await userAGet.json();
    assert.strictEqual(userAGetData.data.problem.title, 'Two Sum');
    assert.deepStrictEqual(userAGetData.data.attempts, [], '18. Attempts array returned (empty currently)');

    // 19. No-attempt problem in list has latestAttempt = null
    const listRes = await authFetch(`${baseUrl}/api/problems`, {}, tokenA);
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.strictEqual(listData.data.problems.length, 1);
    assert.strictEqual(listData.data.problems[0].latestAttempt, null, '19. No-attempt problem must have latestAttempt = null');

    // 20. List returns ONLY current user's problems (User B should see 0)
    const listUserB = await authFetch(`${baseUrl}/api/problems`, {}, tokenB);
    const listUserBData = await listUserB.json();
    assert.strictEqual(listUserBData.data.problems.length, 0, "20. User B list must not include User A's problems");
    console.log('✓ 17–20. Problem reading and scoping verified');

    // =========================================================================
    // 28–32: ATTEMPTS LOGGING, ORDERING & HISTORICAL DATES
    // =========================================================================
    // 28. Valid attempt -> 201
    const attempt1Date = new Date('2026-09-01T10:00:00.000Z');
    const att1Res = await authFetch(`${baseUrl}/api/problems/${problemA.id}/attempts`, {
      method: 'POST',
      body: JSON.stringify({
        status: 'struggled',
        timeTakenMinutes: 45,
        notes: 'Initial attempt, struggled with map lookups',
        attemptedAt: attempt1Date.toISOString(),
      }),
    }, tokenA);
    assert.strictEqual(att1Res.status, 201, '28. Valid attempt creation should return 201');
    const att1Data = await att1Res.json();
    assert.strictEqual(att1Data.data.attempt.status, 'struggled');

    // 29. Invalid status -> 400
    const badStatusRes = await authFetch(`${baseUrl}/api/problems/${problemA.id}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ status: 'almost_solved' }),
    }, tokenA);
    assert.strictEqual(badStatusRes.status, 400, '29. Invalid status enum should return 400');

    // 30. Negative timeTakenMinutes -> 400
    const negTimeRes = await authFetch(`${baseUrl}/api/problems/${problemA.id}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ status: 'solved', timeTakenMinutes: -5 }),
    }, tokenA);
    assert.strictEqual(negTimeRes.status, 400, '30. Negative timeTakenMinutes must return 400');

    // 31. Valid historical attemptedAt is preserved
    assert.strictEqual(
      new Date(att1Data.data.attempt.attemptedAt).getTime(),
      attempt1Date.getTime(),
      '31. Historical attemptedAt must be preserved exactly'
    );

    // Add Attempt 2 (Day 2 - revisit_needed)
    const attempt2Date = new Date('2026-09-15T12:00:00.000Z');
    await authFetch(`${baseUrl}/api/problems/${problemA.id}/attempts`, {
      method: 'POST',
      body: JSON.stringify({
        status: 'revisit_needed',
        timeTakenMinutes: 30,
        notes: 'Tried again, still needs review',
        attemptedAt: attempt2Date.toISOString(),
      }),
    }, tokenA);

    // Add Attempt 3 (Day 3 - solved - LATEST)
    const attempt3Date = new Date('2026-10-01T15:00:00.000Z');
    await authFetch(`${baseUrl}/api/problems/${problemA.id}/attempts`, {
      method: 'POST',
      body: JSON.stringify({
        status: 'solved',
        timeTakenMinutes: 15,
        notes: 'Clean O(n) solution using single-pass hash table',
        attemptedAt: attempt3Date.toISOString(),
      }),
    }, tokenA);

    // 32. Attempt list sorted newest first
    const getAttList = await authFetch(`${baseUrl}/api/problems/${problemA.id}/attempts`, {}, tokenA);
    const getAttData = await getAttList.json();
    assert.strictEqual(getAttData.data.attempts.length, 3);
    assert.strictEqual(getAttData.data.attempts[0].status, 'solved', '32. Newest attempt should be first');
    assert.strictEqual(getAttData.data.attempts[2].status, 'struggled', '32. Oldest attempt should be last');
    console.log('✓ 28–32. Attempt creation, validation, historical dates and ordering verified');

    // =========================================================================
    // 21–27: FILTERING, SEARCH & LATEST STATUS DERIVATION
    // =========================================================================
    // Create Problem 2 for User A: 'Course Schedule', Graph, Medium
    const prob2Res = await authFetch(`${baseUrl}/api/problems`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Course Schedule',
        platform: 'leetcode',
        link: 'https://leetcode.com/problems/course-schedule/',
        topics: ['Graph', 'Topological Sort'],
        difficulty: 'medium',
      }),
    }, tokenA);
    const problem2 = (await prob2Res.json()).data.problem;

    // Log attempt on Problem 2: status = 'struggled'
    await authFetch(`${baseUrl}/api/problems/${problem2.id}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ status: 'struggled', timeTakenMinutes: 60 }),
    }, tokenA);

    // 21. Difficulty filter
    const easyList = await authFetch(`${baseUrl}/api/problems?difficulty=easy`, {}, tokenA);
    const easyData = await easyList.json();
    assert.strictEqual(easyData.data.problems.length, 1);
    assert.strictEqual(easyData.data.problems[0].title, 'Two Sum');

    const medList = await authFetch(`${baseUrl}/api/problems?difficulty=medium`, {}, tokenA);
    const medData = await medList.json();
    assert.strictEqual(medData.data.problems.length, 1);
    assert.strictEqual(medData.data.problems[0].title, 'Course Schedule');

    // 22. Topic filter
    const graphList = await authFetch(`${baseUrl}/api/problems?topic=Graph`, {}, tokenA);
    const graphData = await graphList.json();
    assert.strictEqual(graphData.data.problems.length, 1);
    assert.strictEqual(graphData.data.problems[0].title, 'Course Schedule');

    // 23. Search filter (case-insensitive title search)
    const searchRes = await authFetch(`${baseUrl}/api/problems?search=course`, {}, tokenA);
    const searchData = await searchRes.json();
    assert.strictEqual(searchData.data.problems.length, 1);
    assert.strictEqual(searchData.data.problems[0].title, 'Course Schedule');

    // 24–27. LATEST STATUS FILTERING
    // Problem 1 has attempts: struggled (old) -> revisit_needed (middle) -> solved (latest).
    // Problem 2 has attempts: struggled (latest).
    
    // Status = solved should include Problem 1 ('Two Sum'), but NOT Problem 2
    const solvedList = await authFetch(`${baseUrl}/api/problems?status=solved`, {}, tokenA);
    const solvedData = await solvedList.json();
    assert.strictEqual(solvedData.data.problems.length, 1, '26. ?status=solved should include Problem 1');
    assert.strictEqual(solvedData.data.problems[0].title, 'Two Sum');

    // Status = struggled should include Problem 2 ('Course Schedule'), but NOT Problem 1 (since Problem 1's LATEST is solved!)
    const struggledList = await authFetch(`${baseUrl}/api/problems?status=struggled`, {}, tokenA);
    const struggledData = await struggledList.json();
    assert.strictEqual(struggledData.data.problems.length, 1, '27. ?status=struggled must exclude Problem 1 because latest is solved');
    assert.strictEqual(struggledData.data.problems[0].title, 'Course Schedule');

    // Status = revisit_needed should match 0 problems (since neither problem has revisit_needed as LATEST)
    const revisitList = await authFetch(`${baseUrl}/api/problems?status=revisit_needed`, {}, tokenA);
    const revisitData = await revisitList.json();
    assert.strictEqual(revisitData.data.problems.length, 0);
    console.log('✓ 21–27. Filtering, search, and latest-attempt status resolution verified');

    // =========================================================================
    // 33–34: PROBLEM UPDATE
    // =========================================================================
    const updateRes = await authFetch(`${baseUrl}/api/problems/${problemA.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: 'Two Sum (Optimized)',
        difficulty: 'medium',
        userId: userB._id.toString(), // Attacker attempt to hijack ownership
      }),
    }, tokenA);
    assert.strictEqual(updateRes.status, 200, '33. Owner can update problem');
    const updateData = await updateRes.json();
    assert.strictEqual(updateData.data.problem.title, 'Two Sum (Optimized)');
    assert.strictEqual(updateData.data.problem.difficulty, 'medium');

    // 34. userId cannot be changed through update
    const dbProblemAfterUpdate = await Problem.findById(problemA.id);
    assert.strictEqual(
      dbProblemAfterUpdate.userId.toString(),
      userA._id.toString(),
      '34. Problem ownership (userId) must remain intact'
    );
    console.log('✓ 33–34. Problem update and immutable ownership verified');

    // =========================================================================
    // 35–38: CASCADE DELETION
    // =========================================================================
    // 35. Owner deletes problem
    const delRes = await authFetch(`${baseUrl}/api/problems/${problemA.id}`, {
      method: 'DELETE',
    }, tokenA);
    assert.strictEqual(delRes.status, 200, '35. Owner can delete problem');

    // 37. Deleted problem returns 404 afterward
    const getDeletedProb = await authFetch(`${baseUrl}/api/problems/${problemA.id}`, {}, tokenA);
    assert.strictEqual(getDeletedProb.status, 404, '37. Deleted problem returns 404');

    // 36 & 38. Cascade-deleted attempts: no attempts for problemA must exist in DB
    const orphanAttempts = await Attempt.find({ problemId: problemA.id });
    assert.strictEqual(
      orphanAttempts.length,
      0,
      '36 & 38. All associated attempts must be cascade-deleted from database'
    );
    console.log('✓ 35–38. Problem deletion and attempt cascade deletion verified');

    console.log('--- All 38 Phase 5 Integration Tests Passed Successfully ---');
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

runProblemsTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
