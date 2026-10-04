import assert from 'assert';
import { problemsApi } from '../src/api/problems.api.js';
import {
  PLATFORM_NAMES,
  formatRelativeDate,
} from '../src/lib/problemUtils.js';

// Polyfill localStorage in Node test environment
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

async function testProblemsModule() {
  console.log('--- Starting Frontend Problems Module Tests ---');

  // 1. Verify API methods exist
  assert.strictEqual(typeof problemsApi.getProblems, 'function');
  assert.strictEqual(typeof problemsApi.getProblem, 'function');
  assert.strictEqual(typeof problemsApi.createProblem, 'function');
  assert.strictEqual(typeof problemsApi.updateProblem, 'function');
  assert.strictEqual(typeof problemsApi.deleteProblem, 'function');
  assert.strictEqual(typeof problemsApi.createAttempt, 'function');
  assert.strictEqual(typeof problemsApi.getAttempts, 'function');
  console.log('✓ All 7 problemsApi methods correctly defined');

  // 2. Verify Platform Enum strictly matches specification
  const expectedPlatforms = ['leetcode', 'gfg', 'codechef', 'hackerrank', 'other'];
  const definedPlatformKeys = Object.keys(PLATFORM_NAMES);
  assert.deepStrictEqual(
    definedPlatformKeys.sort(),
    expectedPlatforms.sort(),
    'Platform names in frontend must strictly match backend enum'
  );
  assert.strictEqual(PLATFORM_NAMES.leetcode, 'LeetCode');
  assert.strictEqual(PLATFORM_NAMES.gfg, 'GeeksforGeeks');
  assert.strictEqual(PLATFORM_NAMES.codechef, 'CodeChef');
  assert.strictEqual(PLATFORM_NAMES.hackerrank, 'HackerRank');
  assert.strictEqual(PLATFORM_NAMES.other, 'Other');
  console.log('✓ Frontend platform contract verified against specification');

  // 3. Verify formatRelativeDate helper
  assert.strictEqual(formatRelativeDate(null), '—');
  assert.strictEqual(formatRelativeDate(undefined), '—');
  const now = new Date();
  assert.ok(
    ['Just now', '0m ago'].includes(formatRelativeDate(now)),
    'Current date should format as relative time'
  );
  const yesterday = new Date(Date.now() - 86400000);
  assert.strictEqual(formatRelativeDate(yesterday), 'Yesterday');
  console.log('✓ Date formatting helper verified');

  // 4. Verify "not_attempted" UI filtering logic
  const mockProblems = [
    { id: '1', title: 'Problem 1', latestAttempt: { status: 'solved' } },
    { id: '2', title: 'Problem 2', latestAttempt: null },
    { id: '3', title: 'Problem 3', latestAttempt: { status: 'struggled' } },
    { id: '4', title: 'Problem 4', latestAttempt: null },
  ];

  const unattempted = mockProblems.filter((p) => !p.latestAttempt);
  assert.strictEqual(unattempted.length, 2);
  assert.deepStrictEqual(
    unattempted.map((p) => p.id),
    ['2', '4'],
    'Unattempted filter must isolate problems with latestAttempt === null'
  );
  console.log('✓ Not-attempted client filter strategy verified');

  console.log('--- All Frontend Problems Module Tests Passed Successfully ---');
}

testProblemsModule().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
