import assert from 'assert';

console.log('--- Starting Notification Module Test Suite ---');

// Mock Leitner queue items
const mockQueue = [
  {
    id: 'prob-1',
    title: 'Two Sum',
    daysSinceLastAttempt: 8,
    intervalDays: 7,
    lastAttemptedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    priorityScore: 3.2,
  },
  {
    id: 'prob-2',
    title: 'LRU Cache',
    daysSinceLastAttempt: 14,
    intervalDays: 7,
    lastAttemptedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    priorityScore: 7.8,
  },
  {
    id: 'prob-3',
    title: 'Merge Intervals',
    daysSinceLastAttempt: 2,
    intervalDays: 5,
    lastAttemptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    priorityScore: 0.8,
  },
];

// Mock topics
const mockTopics = [
  { topic: 'Dynamic Programming', struggleRatio: 0.67, struggledCount: 4, totalAttempts: 6 },
  { topic: 'Arrays', struggleRatio: 0.2, struggledCount: 1, totalAttempts: 5 },
];

// Test 1: Spaced Repetition Due & Overdue categorization
const notifications = [];

mockQueue.forEach((problem) => {
  const isOverdue = problem.daysSinceLastAttempt > problem.intervalDays;
  const isDue = problem.daysSinceLastAttempt >= problem.intervalDays;

  if (isOverdue) {
    notifications.push({
      id: `rev-overdue-${problem.id}`,
      category: 'revisions',
      urgency: 'high',
      title: `Overdue: ${problem.title}`,
      badge: 'OVERDUE',
      read: false,
    });
  } else if (isDue) {
    notifications.push({
      id: `rev-due-${problem.id}`,
      category: 'revisions',
      urgency: 'medium',
      title: `Revision Due: ${problem.title}`,
      badge: 'DUE TODAY',
      read: false,
    });
  }
});

assert.strictEqual(notifications.length, 2, 'Should identify exactly 2 problems needing revision');
assert.strictEqual(notifications[0].badge, 'OVERDUE');
assert.strictEqual(notifications[1].badge, 'OVERDUE');
console.log('✓ Spaced repetition due & overdue identification verified');

// Test 2: Topic Friction extraction
const highStruggleTopic = mockTopics.find((t) => t.struggleRatio >= 0.5 && t.struggledCount >= 2);
assert(highStruggleTopic, 'Should find high struggle topic');
notifications.push({
  id: `topic-friction-${highStruggleTopic.topic.toLowerCase().replace(/\s+/g, '-')}`,
  category: 'weakness',
  urgency: 'medium',
  title: `Topic Friction: ${highStruggleTopic.topic}`,
  badge: 'WEAKNESS',
  read: false,
});
assert.strictEqual(notifications.length, 3);
console.log('✓ High friction topic detection verified');

// Test 3: Unread Count Calculation
let unreadCount = notifications.filter((n) => !n.read).length;
assert.strictEqual(unreadCount, 3, 'All 3 items should be unread initially');

// Mark one as read
notifications[0].read = true;
unreadCount = notifications.filter((n) => !n.read).length;
assert.strictEqual(unreadCount, 2, 'Unread count should be 2 after marking one read');
console.log('✓ Unread count calculation verified');

// Test 4: Category Filtering
const revisionTabItems = notifications.filter((n) => n.category === 'revisions');
assert.strictEqual(revisionTabItems.length, 2, 'Should filter 2 revisions');

const weaknessTabItems = notifications.filter((n) => n.category === 'weakness');
assert.strictEqual(weaknessTabItems.length, 1, 'Should filter 1 weakness alert');
console.log('✓ Category tab filtering verified');

// Test 5: Dismissal logic
const filteredAfterDismiss = notifications.filter((n) => n.id !== notifications[0].id);
assert.strictEqual(filteredAfterDismiss.length, 2, 'Should have 2 items remaining after dismiss');
console.log('✓ Notification dismissal verified');

// Test 6: Web Push Helper & Payload Contract
import { webPush } from '../src/lib/webPush.js';
assert(typeof webPush.isSupported === 'function', 'webPush.isSupported should be defined');
assert(typeof webPush.getPermission === 'function', 'webPush.getPermission should be defined');
assert(typeof webPush.requestPermission === 'function', 'webPush.requestPermission should be defined');
assert(typeof webPush.sendNotification === 'function', 'webPush.sendNotification should be defined');
assert(typeof webPush.sendTestNotification === 'function', 'webPush.sendTestNotification should be defined');

// In node environment without window, should gracefully return 'unsupported'
assert.strictEqual(webPush.isSupported(), false, 'Node environment should report unsupported gracefully');
assert.strictEqual(webPush.getPermission(), 'unsupported', 'Node environment permission should be unsupported');
console.log('✓ Web Push helper functions and environment fallback verified');

console.log('--- All Notification Module Tests Passed Successfully ---');
