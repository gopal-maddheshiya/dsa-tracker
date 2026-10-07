import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Starting Revision Layout & Filter Alignment Test Suite ---');

const revisionPagePath = path.resolve(__dirname, '../src/pages/RevisionPage.jsx');
const revisionCardPath = path.resolve(__dirname, '../src/components/revision/RevisionCard.jsx');

const revisionContent = fs.readFileSync(revisionPagePath, 'utf8');
const cardContent = fs.readFileSync(revisionCardPath, 'utf8');

// Test 1: Uniform urgency button heights & whitespace-nowrap
assert(
  revisionContent.includes('whitespace-nowrap shrink-0 h-8 px-3 rounded-lg'),
  'Urgency buttons must have whitespace-nowrap, shrink-0, and uniform height h-8 to prevent jagged heights and word wrapping'
);
console.log('✓ Urgency filter buttons uniform height and whitespace-nowrap verified');

// Test 2: Dedicated topic row separation
assert(
  revisionContent.includes('pt-2 border-t border-line/60 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none'),
  'Topics must be isolated in a dedicated sub-row to prevent clashing and vertical misalignment with status tabs'
);
assert(
  revisionContent.includes('whitespace-nowrap shrink-0 h-6 px-2.5 rounded-full'),
  'Topic chips must have whitespace-nowrap, shrink-0, and uniform height h-6'
);
console.log('✓ Topic chip isolation and consistent alignment verified');

// Test 3: Search bar integration
assert(
  revisionContent.includes('placeholder="Filter queue by title or tag..."'),
  'Revision page must provide real-time search input for problem titles and topics'
);
console.log('✓ Problem search input verified');

// Test 4: Active filters bar and reset
assert(
  revisionContent.includes('hasActiveFilters'),
  'Revision page must compute hasActiveFilters to provide clear filter feedback'
);
assert(
  revisionContent.includes('Clear all filters'),
  'Revision page must provide a one-click Clear all filters button'
);
console.log('✓ Active filter indicators and clear button verified');

// Test 5: RevisionCard rank and border refinements
assert(
  cardContent.includes('border-l-accent ring-1 ring-accent/25 bg-surface/95'),
  'Rank #1 problem card must have premium gold/accent highlight border and shadow'
);
assert(
  cardContent.includes('border-l-rose-500/80'),
  'Overdue problem cards must have distinct semantic border'
);
console.log('✓ RevisionCard rank and semantic border refinements verified');

console.log('--- All Revision Layout Tests Passed Successfully ---');
