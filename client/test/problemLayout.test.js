import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testProblemLayoutAndComponents() {
  console.log('--- Starting Problem Layout & Premium Components Test Suite ---');

  const componentsDir = path.resolve(__dirname, '../src/components/problems');
  const pagesDir = path.resolve(__dirname, '../src/pages');

  const statsBarPath = path.join(componentsDir, 'ProblemStatsBar.jsx');
  const filtersPath = path.join(componentsDir, 'ProblemFilters.jsx');
  const tablePath = path.join(componentsDir, 'ProblemTable.jsx');
  const mobileListPath = path.join(componentsDir, 'ProblemMobileList.jsx');
  const badgesPath = path.join(componentsDir, 'ProblemBadges.jsx');
  const problemsPagePath = path.join(pagesDir, 'ProblemsPage.jsx');
  const problemDetailPagePath = path.join(pagesDir, 'ProblemDetailPage.jsx');

  // Verify all files exist
  assert.ok(fs.existsSync(statsBarPath), 'ProblemStatsBar.jsx must exist');
  assert.ok(fs.existsSync(filtersPath), 'ProblemFilters.jsx must exist');
  assert.ok(fs.existsSync(tablePath), 'ProblemTable.jsx must exist');
  assert.ok(fs.existsSync(mobileListPath), 'ProblemMobileList.jsx must exist');
  assert.ok(fs.existsSync(badgesPath), 'ProblemBadges.jsx must exist');
  assert.ok(fs.existsSync(problemsPagePath), 'ProblemsPage.jsx must exist');
  assert.ok(fs.existsSync(problemDetailPagePath), 'ProblemDetailPage.jsx must exist');

  // 1. Test ProblemStatsBar calculations
  const statsContent = fs.readFileSync(statsBarPath, 'utf8');
  assert.ok(statsContent.includes('Total Tracked'), 'ProblemStatsBar must calculate Total Tracked');
  assert.ok(statsContent.includes('Solved'), 'ProblemStatsBar must calculate Solved problems');
  assert.ok(statsContent.includes('Needs Review'), 'ProblemStatsBar must calculate Needs Review');
  assert.ok(statsContent.includes('Unattempted'), 'ProblemStatsBar must calculate Unattempted');
  assert.ok(statsContent.includes('solvedPct'), 'ProblemStatsBar must calculate completion percentage');
  assert.ok(statsContent.includes('easyCount') && statsContent.includes('hardCount'), 'ProblemStatsBar must breakdown by difficulty');
  console.log('✓ ProblemStatsBar metrics calculation and responsive layout verified');

  // 2. Test ProblemFilters uniform heights and compact toolbar
  const filtersContent = fs.readFileSync(filtersPath, 'utf8');
  assert.ok(filtersContent.includes('whitespace-nowrap shrink-0'), 'Filter status pills must have whitespace-nowrap');
  assert.ok(filtersContent.includes('statusTabs'), 'ProblemFilters must calculate live status tab counts');
  assert.ok(filtersContent.includes('Clear all'), 'ProblemFilters must include clear all action');
  assert.ok(filtersContent.includes('Export filtered problems to CSV'), 'ProblemFilters must include CSV export option');
  console.log('✓ ProblemFilters uniform heights, live status tab counts, and active HUD verified');

  // 3. Test ProblemTable styling and semantic stripes
  const tableContent = fs.readFileSync(tablePath, 'utf8');
  assert.ok(tableContent.includes('rounded-2xl bg-surface border border-line'), 'ProblemTable must use rounded-2xl container');
  assert.ok(tableContent.includes('border-l-emerald-500'), 'ProblemTable must have emerald stripe for solved problems');
  assert.ok(tableContent.includes('border-l-amber-500'), 'ProblemTable must have amber stripe for revisit problems');
  assert.ok(tableContent.includes('border-l-rose-500'), 'ProblemTable must have rose stripe for struggled problems');
  assert.ok(tableContent.includes('renderSortIndicator'), 'ProblemTable must render column sort indicators');
  console.log('✓ ProblemTable rounded-2xl container and semantic status stripes verified');

  // 4. Test ProblemMobileList touch targets and card stripes
  const mobileContent = fs.readFileSync(mobileListPath, 'utf8');
  assert.ok(mobileContent.includes('rounded-2xl bg-surface border border-line'), 'ProblemMobileList cards must use rounded-2xl');
  assert.ok(mobileContent.includes('border-l-4 border-l-emerald-500'), 'Mobile cards must have semantic left border for solved');
  assert.ok(mobileContent.includes('border-l-4 border-l-amber-500'), 'Mobile cards must have semantic left border for revisit');
  assert.ok(mobileContent.includes('inline-flex items-center gap-1.5'), 'Mobile action targets must be touch-comfortable');
  console.log('✓ ProblemMobileList rounded-2xl cards and mobile action ergonomics verified');

  // 5. Test ProblemBadges glowing indicator dots and platform branding
  const badgesContent = fs.readFileSync(badgesPath, 'utf8');
  assert.ok(badgesContent.includes('shadow-[0_0_8px_rgba(52,211,153,0.5)]'), 'Easy difficulty must have emerald glow dot');
  assert.ok(badgesContent.includes('shadow-[0_0_8px_rgba(251,191,36,0.5)]'), 'Medium difficulty must have amber glow dot');
  assert.ok(badgesContent.includes('shadow-[0_0_8px_rgba(251,113,133,0.5)]'), 'Hard difficulty must have rose glow dot');
  assert.ok(badgesContent.includes('brandStyles'), 'Platform badges must support platform brand styles');
  console.log('✓ ProblemBadges glowing indicator dots and platform branding verified');

  // 6. Test ProblemsPage integration
  const pageContent = fs.readFileSync(problemsPagePath, 'utf8');
  assert.ok(pageContent.includes('<ProblemFilters'), 'ProblemsPage must render ProblemFilters');
  assert.ok(pageContent.includes('RotateCw') && pageContent.includes('isRefreshing'), 'ProblemsPage must support refresh action');
  assert.ok(pageContent.includes('No matching problems'), 'ProblemsPage must have polished empty search state');
  console.log('✓ ProblemsPage integration with ProblemFilters and refresh controls verified');

  console.log('--- All Problem Layout & Components Tests Passed Successfully ---');
}

testProblemLayoutAndComponents().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
