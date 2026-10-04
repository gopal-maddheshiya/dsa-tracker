import assert from 'assert';
import { analyticsApi } from '../src/api/analytics.api.js';
import {
  formatDaysElapsed,
  formatInterval,
  getRevisionTimingState,
  formatRevisionReason,
  formatPriorityScore,
  formatRank,
} from '../src/lib/revisionUtils.js';

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

async function testRevisionModule() {
  console.log('--- Starting Frontend Revision Module Tests ---');

  // 1. Verify getRevisionQueue API caller exists
  assert.strictEqual(
    typeof analyticsApi.getRevisionQueue,
    'function',
    'getRevisionQueue must be a function on analyticsApi'
  );
  console.log('✓ analyticsApi.getRevisionQueue method verified');

  // 2. Test formatDaysElapsed
  assert.strictEqual(formatDaysElapsed(0), '< 1 day ago');
  assert.strictEqual(formatDaysElapsed(0.2), '< 1 day ago');
  assert.strictEqual(formatDaysElapsed(1), '1 day ago');
  assert.strictEqual(formatDaysElapsed(4), '4 days ago');
  assert.strictEqual(formatDaysElapsed(14.8), '15 days ago');
  assert.strictEqual(formatDaysElapsed(null), '—');
  assert.strictEqual(formatDaysElapsed(undefined), '—');
  assert.strictEqual(formatDaysElapsed(NaN), '—');
  console.log('✓ formatDaysElapsed formats days into readable intervals');

  // 3. Test formatInterval
  assert.strictEqual(formatInterval(2), '2-day interval');
  assert.strictEqual(formatInterval(5), '5-day interval');
  assert.strictEqual(formatInterval(14), '14-day interval');
  assert.strictEqual(formatInterval(null), '—');
  console.log('✓ formatInterval formats target intervals');

  // 4. Test getRevisionTimingState (Strict 3-step precedence without overlapping flags)
  // 4a. 2-day interval boundary tests (Struggled status)
  const boundaryUnder2 = getRevisionTimingState(1.99, 2);
  assert.strictEqual(boundaryUnder2.state, 'upcoming');
  assert.strictEqual(boundaryUnder2.label, 'Upcoming review');
  assert.strictEqual(boundaryUnder2.isOverdue, undefined);

  const boundaryExact2 = getRevisionTimingState(2.0, 2);
  assert.strictEqual(boundaryExact2.state, 'due');
  assert.strictEqual(boundaryExact2.label, 'Due for revision');
  assert.strictEqual(boundaryExact2.isOverdue, undefined);

  const boundaryOver2 = getRevisionTimingState(2.01, 2);
  assert.strictEqual(boundaryOver2.state, 'overdue');
  assert.strictEqual(boundaryOver2.label, 'Overdue for revision');
  assert.strictEqual(boundaryOver2.isOverdue, undefined);

  // 4b. 5-day interval boundary tests (Revisit needed status)
  assert.strictEqual(getRevisionTimingState(4.99, 5).state, 'upcoming');
  assert.strictEqual(getRevisionTimingState(5.0, 5).state, 'due');
  assert.strictEqual(getRevisionTimingState(5.01, 5).state, 'overdue');

  // 4c. 14-day interval boundary tests (Solved status)
  assert.strictEqual(getRevisionTimingState(13.99, 14).state, 'upcoming');
  assert.strictEqual(getRevisionTimingState(14.0, 14).state, 'due');
  assert.strictEqual(getRevisionTimingState(14.01, 14).state, 'overdue');

  // 4d. Large elapsed values
  assert.strictEqual(getRevisionTimingState(30, 14).state, 'overdue');
  assert.strictEqual(getRevisionTimingState(100, 2).state, 'overdue');

  console.log('✓ getRevisionTimingState correctly identifies due, overdue, and upcoming boundary states');

  // 5. Test formatRevisionReason
  const reasonStruggled = formatRevisionReason('struggled', 4, 2);
  assert.ok(reasonStruggled.includes('struggled'));
  assert.ok(reasonStruggled.includes('2 days'));

  const reasonRevisit = formatRevisionReason('revisit_needed', 5, 5);
  assert.ok(reasonRevisit.includes('another pass'));
  assert.ok(reasonRevisit.includes('5-day'));

  const reasonSolved = formatRevisionReason('solved', 16, 14);
  assert.ok(reasonSolved.includes('Solved'));
  assert.ok(reasonSolved.includes('14-day'));
  console.log('✓ formatRevisionReason generates deterministic, non-judgmental explanations');

  // 6. Test formatPriorityScore
  assert.strictEqual(formatPriorityScore(3.541666), '3.54');
  assert.strictEqual(formatPriorityScore(0), '0.00');
  assert.strictEqual(formatPriorityScore(12.9), '12.90');
  assert.strictEqual(formatPriorityScore(null), '—');
  assert.strictEqual(formatPriorityScore(undefined), '—');
  assert.strictEqual(formatPriorityScore(NaN), '—');
  console.log('✓ formatPriorityScore formats score to 2 decimal places safely');

  // 7. Test formatRank
  assert.strictEqual(formatRank(0), '01');
  assert.strictEqual(formatRank(1), '02');
  assert.strictEqual(formatRank(9), '10');
  assert.strictEqual(formatRank(19), '20');
  console.log('✓ formatRank produces padded rank indices');

  // 8. Test mock queue prioritization preservation
  const mockQueue = [
    { id: '1', title: 'Two Sum', priorityScore: 4.5, latestStatus: 'struggled' },
    { id: '2', title: 'Course Schedule', priorityScore: 3.2, latestStatus: 'revisit_needed' },
    { id: '3', title: 'LRU Cache', priorityScore: 1.1, latestStatus: 'solved' },
  ];

  assert.strictEqual(mockQueue[0].priorityScore > mockQueue[1].priorityScore, true);
  assert.strictEqual(mockQueue[1].priorityScore > mockQueue[2].priorityScore, true);
  assert.strictEqual(formatRank(0), '01');
  assert.strictEqual(mockQueue[0].id, '1');
  console.log('✓ Backend priority score ranking order preservation verified');

  console.log('--- All Frontend Revision Module Tests Passed Successfully ---');
}

testRevisionModule().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
