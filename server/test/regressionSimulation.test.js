const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  ✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runRegressionSimulation() {
  console.log('====================================================');
  console.log('STARTING PHASE 14 FULL-STACK REGRESSION SIMULATION');
  console.log('====================================================\n');

  // 1. Health check
  console.log('--- 1. Health & Server Base Check ---');
  const health = await request('/health');
  assert(health.status === 200 && health.data?.success === true, 'GET /api/health returns 200 success');

  // 2. Auth Flow
  console.log('\n--- 2. Authentication Flow & Security ---');
  const uniqueSuffix = Date.now();
  const userA = {
    name: 'Regression User A',
    email: `regression_a_${uniqueSuffix}@example.com`,
    password: 'Password123!',
  };

  // Invalid signup
  const badSignup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name: '', email: 'notanemail', password: '123' }),
  });
  assert(badSignup.status === 400, 'Signup with invalid inputs rejected with 400');

  // Valid signup
  const signupRes = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userA),
  });
  assert(signupRes.status === 201 && signupRes.data?.data?.token, 'Valid signup returns 201 and token');
  assert(!signupRes.data?.data?.user?.password && !signupRes.data?.data?.user?.passwordHash, 'Signup response never exposes password or hash');

  const tokenA = signupRes.data?.data?.token;

  // Duplicate email signup
  const dupSignup = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userA),
  });
  assert(dupSignup.status === 409, 'Duplicate signup rejected with 409');

  // Valid login
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: userA.email, password: userA.password }),
  });
  assert(loginRes.status === 200 && loginRes.data?.data?.token, 'Login returns 200 and token');

  // Invalid login
  const badLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: userA.email, password: 'WrongPassword' }),
  });
  assert(badLogin.status === 401, 'Invalid login password returns 401');

  // Session verification /auth/me
  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(meRes.status === 200 && meRes.data?.data?.user?.email === userA.email.toLowerCase(), 'GET /auth/me returns user identity');
  assert(!meRes.data?.data?.user?.passwordHash, '/auth/me never exposes passwordHash');

  // Missing or bad token
  const noTokenRes = await request('/auth/me');
  assert(noTokenRes.status === 401, 'Request without token returns 401');
  const badTokenRes = await request('/auth/me', {
    headers: { Authorization: 'Bearer invalid.token.value' },
  });
  assert(badTokenRes.status === 401, 'Request with invalid token returns 401');

  // 3. Fresh Account State
  console.log('\n--- 3. Fresh Account Analytics & Problem Scoping ---');
  const freshSummary = await request('/analytics/summary', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    freshSummary.status === 200 &&
    freshSummary.data?.data?.totalProblems === 0 &&
    freshSummary.data?.data?.totalAttempted === 0,
    'Fresh account summary returns 0 problems and 0 attempts'
  );

  const freshQueue = await request('/analytics/revision-queue', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    freshQueue.status === 200 &&
    Array.isArray(freshQueue.data?.data?.queue) &&
    freshQueue.data?.data?.queue.length === 0,
    'Fresh account revision queue is empty'
  );

  const freshProblems = await request('/problems', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    freshProblems.status === 200 &&
    freshProblems.data?.data?.problems?.length === 0,
    'Fresh account problems list is empty'
  );

  // 4. Problem Creation & Validation
  console.log('\n--- 4. Problem CRUD & Constraints ---');
  // Disallowed platform
  const badPlatformRes = await request('/problems', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: 'Bad Platform',
      platform: 'codeforces',
      link: 'https://codeforces.com/problem/1',
      difficulty: 'easy',
      topics: ['Array'],
    }),
  });
  assert(badPlatformRes.status === 400, 'Creation with disallowed platform rejected with 400');

  // Create Problem 1 (leetcode, easy)
  const p1Res = await request('/problems', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: 'Two Sum',
      platform: 'leetcode',
      link: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'easy',
      topics: ['Array', 'Hash Table'],
    }),
  });
  assert(p1Res.status === 201 && p1Res.data?.data?.problem?.id, 'Problem 1 (Two Sum) created successfully');
  const p1Id = p1Res.data?.data?.problem?.id;

  // Create Problem 2 (gfg, medium)
  const p2Res = await request('/problems', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: 'Longest Increasing Subsequence',
      platform: 'gfg',
      link: 'https://geeksforgeeks.org/problems/lis',
      difficulty: 'medium',
      topics: ['Dynamic Programming'],
    }),
  });
  assert(p2Res.status === 201 && p2Res.data?.data?.problem?.id, 'Problem 2 (LIS) created successfully');
  const p2Id = p2Res.data?.data?.problem?.id;

  // Create Problem 3 (codechef, hard)
  const p3Res = await request('/problems', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: 'Shortest Path In Graph',
      platform: 'codechef',
      link: 'https://codechef.com/problems/spg',
      difficulty: 'hard',
      topics: ['Graph', 'Array'],
    }),
  });
  assert(p3Res.status === 201 && p3Res.data?.data?.problem?.id, 'Problem 3 (Graph) created successfully');
  const p3Id = p3Res.data?.data?.problem?.id;

  // Filter problems by topic: Array
  const filterArray = await request('/problems?topic=Array', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(filterArray.data?.data?.problems?.length === 2, 'Filter by topic=Array returns 2 problems');

  // Filter problems by topic with space: Dynamic Programming
  const filterDP = await request(`/problems?topic=${encodeURIComponent('Dynamic Programming')}`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(filterDP.data?.data?.problems?.length === 1 && filterDP.data?.data?.problems[0].title === 'Longest Increasing Subsequence', 'Filter by topic=Dynamic Programming returns correct problem');

  // Filter problems by search
  const searchRes = await request('/problems?search=Two', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(searchRes.data?.data?.problems?.length === 1 && searchRes.data?.data?.problems[0].title === 'Two Sum', 'Search by title matches correctly');

  // 5. Attempt Creation & Historical Dates
  console.log('\n--- 5. Attempt Creation & Revision Invariants ---');
  // Log attempt 1 for Problem 1: solved 10 days ago
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const att1Res = await request(`/problems/${p1Id}/attempts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      status: 'solved',
      timeTakenMinutes: 15,
      notes: 'Solved using hash map approach in O(n)',
      attemptedAt: tenDaysAgo,
    }),
  });
  assert(att1Res.status === 201 && att1Res.data?.data?.attempt?.id, 'Attempt logged for Problem 1 (solved, 10d ago)');

  // Log attempt 1 for Problem 2: struggled 3 days ago
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const att2Res = await request(`/problems/${p2Id}/attempts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      status: 'struggled',
      timeTakenMinutes: 45,
      notes: 'Trouble with O(n log n) patience sorting approach',
      attemptedAt: threeDaysAgo,
    }),
  });
  assert(att2Res.status === 201 && att2Res.data?.data?.attempt?.id, 'Attempt logged for Problem 2 (struggled, 3d ago)');

  // Log attempt 1 for Problem 3: revisit_needed 6 days ago
  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
  const att3Res = await request(`/problems/${p3Id}/attempts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      status: 'revisit_needed',
      timeTakenMinutes: 30,
      notes: 'Used Dijkstra, need to re-implement with 0-1 BFS',
      attemptedAt: sixDaysAgo,
    }),
  });
  assert(att3Res.status === 201 && att3Res.data?.data?.attempt?.id, 'Attempt logged for Problem 3 (revisit_needed, 6d ago)');

  // Verify Problem Detail returns problem + attempts array
  const p1Detail = await request(`/problems/${p1Id}`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    p1Detail.status === 200 &&
    p1Detail.data?.data?.problem?.title === 'Two Sum' &&
    p1Detail.data?.data?.attempts?.length === 1,
    'GET /problems/:id returns problem metadata and attempts array'
  );

  // 6. Analytics Verification with Seeded Attempts
  console.log('\n--- 6. Analytics Verification ---');
  const summaryRes = await request('/analytics/summary', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    summaryRes.data?.data?.totalProblems === 3 &&
    summaryRes.data?.data?.totalAttempted === 3 &&
    summaryRes.data?.data?.totalSolved === 1,
    'Summary metrics accurate: 3 problems, 3 attempts, 1 solved'
  );
  assert(
    summaryRes.data?.data?.difficultyBreakdown?.find(d => d.difficulty === 'easy')?.count === 1 &&
    summaryRes.data?.data?.difficultyBreakdown?.find(d => d.difficulty === 'medium')?.count === 1 &&
    summaryRes.data?.data?.difficultyBreakdown?.find(d => d.difficulty === 'hard')?.count === 1,
    'Difficulty breakdown accurate across easy/medium/hard'
  );

  const topicsRes = await request('/analytics/topics', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    topicsRes.status === 200 &&
    Array.isArray(topicsRes.data?.data?.topics) &&
    topicsRes.data?.data?.topics.length > 0,
    'Topics endpoint returns topic weakness rankings'
  );
  const dpTopic = topicsRes.data?.data?.topics.find(t => t.topic === 'Dynamic Programming');
  assert(dpTopic && dpTopic.struggleRatio === 1, 'Dynamic Programming topic has 100% struggle ratio');

  const trendRes = await request('/analytics/trend', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    trendRes.status === 200 &&
    Array.isArray(trendRes.data?.data?.trend),
    'Practice trend endpoint returns weekly buckets'
  );

  const heatmapRes = await request('/analytics/heatmap', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    heatmapRes.status === 200 &&
    Array.isArray(heatmapRes.data?.data?.heatmap) &&
    heatmapRes.data?.data?.heatmap.length === 3,
    'Heatmap returns 3 distinct practice calendar days'
  );

  // Revision Queue: Priority Score checks
  // Problem 2 (struggled 3d ago): interval=2, struggleWeight=2, priorityScore ≈ (3 / 2) + 2 = 3.5 (overdue since 3 > 2)
  // Problem 3 (revisit_needed 6d ago): interval=5, struggleWeight=1, priorityScore ≈ (6 / 5) + 1 = 2.2 (overdue since 6 > 5)
  // Problem 1 (solved 10d ago): interval=14, struggleWeight=0, priorityScore ≈ (10 / 14) + 0 = 0.7143 (upcoming since 10 < 14)
  const queueRes = await request('/analytics/revision-queue', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    queueRes.status === 200 &&
    queueRes.data?.data?.queue?.length === 3,
    'Revision queue surfaces all 3 attempted problems'
  );
  const queue = queueRes.data?.data?.queue || [];
  assert(
    queue[0].title === 'Longest Increasing Subsequence' &&
    queue[1].title === 'Shortest Path In Graph' &&
    queue[2].title === 'Two Sum',
    'Revision queue strictly ordered descending by priority score'
  );
  assert(queue[0].intervalDays === 2 && queue[0].struggleWeight === 2, 'Struggled problem has interval=2 and weight=2');
  assert(queue[1].intervalDays === 5 && queue[1].struggleWeight === 1, 'Revisit_needed problem has interval=5 and weight=1');
  assert(queue[2].intervalDays === 14 && queue[2].struggleWeight === 0, 'Solved problem has interval=14 and weight=0');

  // 7. Multi-User Isolation & Ownership Enforcement
  console.log('\n--- 7. Cross-User Security & Isolation ---');
  const userB = {
    name: 'Regression User B',
    email: `regression_b_${uniqueSuffix}@example.com`,
    password: 'Password123!',
  };
  const signupB = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userB),
  });
  const tokenB = signupB.data?.data?.token;

  // User B tries to read User A's problem
  const crossGet = await request(`/problems/${p1Id}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(crossGet.status === 404, 'Cross-user GET problem returns 404');

  // User B tries to edit User A's problem
  const crossPut = await request(`/problems/${p1Id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  assert(crossPut.status === 404, 'Cross-user PUT problem returns 404');

  // User B tries to log attempt against User A's problem
  const crossAtt = await request(`/problems/${p1Id}/attempts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ status: 'solved' }),
  });
  assert(crossAtt.status === 404, 'Cross-user attempt logging returns 404');

  // User B tries to delete User A's problem
  const crossDel = await request(`/problems/${p1Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(crossDel.status === 404, 'Cross-user DELETE problem returns 404');

  // User B's analytics remain completely isolated and empty
  const userBSummary = await request('/analytics/summary', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(userBSummary.data?.data?.totalProblems === 0, "User B's total problems is 0 (strictly isolated)");

  // 8. Problem Update & Cascade Deletion
  console.log('\n--- 8. Problem Update & Cascade Deletion ---');
  // Update Problem 1 title
  const updateRes = await request(`/problems/${p1Id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ title: 'Two Sum (Optimized)' }),
  });
  assert(updateRes.status === 200 && updateRes.data?.data?.problem?.title === 'Two Sum (Optimized)', 'Problem title successfully updated');

  // Delete Problem 1
  const deleteRes = await request(`/problems/${p1Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(deleteRes.status === 200 && deleteRes.data?.success === true, 'Problem deleted successfully');

  // Problem 1 should now return 404
  const p1Check = await request(`/problems/${p1Id}`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(p1Check.status === 404, 'Deleted problem now returns 404');

  // Verify analytics summary updated (totalProblems: 2, totalAttempted: 2)
  const afterDelSummary = await request('/analytics/summary', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    afterDelSummary.data?.data?.totalProblems === 2 &&
    afterDelSummary.data?.data?.totalAttempted === 2,
    'Analytics cascade updated after deletion (2 problems, 2 attempts)'
  );

  console.log('\n====================================================');
  console.log(`SIMULATION COMPLETE: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('====================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runRegressionSimulation().catch((err) => {
  console.error('Unexpected simulation error:', err);
  process.exit(1);
});
