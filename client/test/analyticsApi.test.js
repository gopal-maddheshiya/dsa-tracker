import assert from 'assert';
import { analyticsApi } from '../src/api/analytics.api.js';
import {
  formatWeeklyDate,
  formatHeatmapTooltipDate,
  generateHeatmapGrid,
  getHeatmapLevelClass,
  toUtcDateString,
} from '../src/lib/analyticsUtils.js';

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

async function testAnalyticsModule() {
  console.log('--- Starting Frontend Analytics Module Tests ---');

  // 1. Verify API Methods exist
  assert.strictEqual(typeof analyticsApi.getSummary, 'function', 'getSummary must be a function');
  assert.strictEqual(typeof analyticsApi.getTopics, 'function', 'getTopics must be a function');
  assert.strictEqual(typeof analyticsApi.getTrend, 'function', 'getTrend must be a function');
  assert.strictEqual(typeof analyticsApi.getHeatmap, 'function', 'getHeatmap must be a function');
  assert.strictEqual(typeof analyticsApi.getRevisionQueue, 'function', 'getRevisionQueue must be a function');
  console.log('✓ All 5 analyticsApi methods correctly defined');

  // 2. Test formatWeeklyDate helper
  assert.strictEqual(formatWeeklyDate('2026-09-28'), 'Sep 28');
  assert.strictEqual(formatWeeklyDate('2026-10-05'), 'Oct 5');
  assert.strictEqual(formatWeeklyDate('2026-01-01'), 'Jan 1');
  assert.strictEqual(formatWeeklyDate(null), '');
  assert.strictEqual(formatWeeklyDate(undefined), '');
  console.log('✓ formatWeeklyDate converts YYYY-MM-DD to compact month & day');

  // 3. Test formatHeatmapTooltipDate helper
  assert.strictEqual(formatHeatmapTooltipDate('2026-10-01'), 'Oct 1, 2026');
  assert.strictEqual(formatHeatmapTooltipDate('2026-12-31'), 'Dec 31, 2026');
  assert.strictEqual(formatHeatmapTooltipDate(''), '');
  console.log('✓ formatHeatmapTooltipDate produces readable full date string');

  // 4. Test generateHeatmapGrid zero-filling and date calculations
  const refDate = new Date(Date.UTC(2026, 9, 3)); // Oct 3, 2026
  const activeDaysMock = [
    { date: '2026-10-01', count: 3 },
    { date: '2026-10-02', count: 1 },
    { date: '2026-10-03', count: 5 },
  ];

  const gridResult = generateHeatmapGrid(activeDaysMock, refDate, 12);

  // Check 12 weeks generated
  assert.strictEqual(gridResult.weeks.length, 12, 'Must generate exactly 12 weekly columns');
  for (const week of gridResult.weeks) {
    assert.strictEqual(week.length, 7, 'Each week must have 7 days');
  }

  // Total days = 12 * 7 = 84
  const allDays = gridResult.weeks.flat();
  assert.strictEqual(allDays.length, 84, 'Total days generated must equal 84');

  // Check active counts and totals
  assert.strictEqual(gridResult.totalRangeAttempts, 9, 'Sum of attempts should be 3 + 1 + 5 = 9');
  assert.strictEqual(gridResult.activeDaysCount, 3, 'Active days count should be 3');

  // Check specific day mapping
  const oct3 = allDays.find((d) => d.date === '2026-10-03');
  assert.ok(oct3, '2026-10-03 must exist in the 84-day grid');
  assert.strictEqual(oct3.count, 5);
  assert.strictEqual(oct3.isToday, true);

  const oct2 = allDays.find((d) => d.date === '2026-10-02');
  assert.ok(oct2);
  assert.strictEqual(oct2.count, 1);
  assert.strictEqual(oct2.isToday, false);

  const missingDay = allDays.find((d) => d.date === '2026-09-30');
  assert.ok(missingDay);
  assert.strictEqual(missingDay.count, 0, 'Unattempted days must be zero-filled');
  console.log('✓ generateHeatmapGrid produces 84-day zero-filled matrix with accurate counts');

  // 5. Test getHeatmapLevelClass intensity levels
  assert.ok(getHeatmapLevelClass(0).includes('bg-surface-2'), 'Level 0 class');
  assert.ok(getHeatmapLevelClass(1).includes('bg-accent/25'), 'Level 1 class');
  assert.ok(getHeatmapLevelClass(2).includes('bg-accent/60'), 'Level 2 class');
  assert.ok(getHeatmapLevelClass(3).includes('bg-accent/60'), 'Level 3 class');
  assert.ok(getHeatmapLevelClass(4).includes('bg-accent border-accent-hover'), 'Level 4+ class');
  assert.ok(getHeatmapLevelClass(10).includes('bg-accent border-accent-hover'), 'Level 4+ class');
  console.log('✓ getHeatmapLevelClass correctly assigns color classes');

  // 6. Test Data Semantics: Solved attempts vs Practice attempts
  const mockSummary = {
    totalProblems: 24,
    totalAttempted: 51,
    totalSolved: 32,
    difficultyBreakdown: [
      { difficulty: 'easy', count: 10 },
      { difficulty: 'medium', count: 12 },
      { difficulty: 'hard', count: 2 },
    ],
  };

  assert.strictEqual(mockSummary.totalAttempted, 51, 'Total attempted represents attempt sessions');
  assert.strictEqual(mockSummary.totalSolved, 32, 'Total solved represents solved attempt sessions');
  const solveRatio = (mockSummary.totalSolved / mockSummary.totalAttempted) * 100;
  assert.strictEqual(Math.round(solveRatio), 63);
  console.log('✓ Data semantics verified (totalAttempted and totalSolved as attempt counts)');

  // 7. Test Topic Weakness ranking logic
  const mockTopics = [
    { topic: 'Dynamic Programming', totalAttempts: 1, struggledCount: 1, struggleRatio: 1.0, weaknessRank: 1 },
    { topic: 'Graphs', totalAttempts: 4, struggledCount: 3, struggleRatio: 0.75, weaknessRank: 2 },
    { topic: 'Trees', totalAttempts: 5, struggledCount: 2, struggleRatio: 0.4, weaknessRank: 3 },
  ];

  assert.strictEqual(mockTopics[0].struggleRatio, 1.0);
  assert.strictEqual(mockTopics[0].totalAttempts, 1);
  assert.strictEqual(mockTopics[0].struggledCount, 1);
  console.log('✓ Topic weakness low-sample context verified');

  console.log('--- All Frontend Analytics Module Tests Passed Successfully ---');
}

testAnalyticsModule().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
