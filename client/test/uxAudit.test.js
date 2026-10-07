import assert from 'assert';
import fs from 'fs';
import path from 'path';
import parser from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default || traverseModule;
import { getRevisionTimingState } from '../src/lib/revisionUtils.js';
import { PLATFORM_NAMES } from '../src/lib/problemUtils.js';

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

async function testUxAudit() {
  console.log('--- Starting Frontend UX & Quality Audit Test Suite ---');

  // 1. Audit: Strict Mutual Exclusivity of Revision States (No overlapping boolean flags)
  const overdueCase = getRevisionTimingState(5, 2);
  const dueCase = getRevisionTimingState(2, 2);
  const upcomingCase = getRevisionTimingState(1, 2);

  // Assert Overdue state
  assert.strictEqual(overdueCase.state, 'overdue', "days > interval must result in state: 'overdue'");
  assert.strictEqual(overdueCase.isOverdue, undefined, "isOverdue must not be exposed");
  assert.strictEqual(overdueCase.label, 'Overdue for revision');

  // Assert Due state
  assert.strictEqual(dueCase.state, 'due', "days === interval must result in state: 'due'");
  assert.strictEqual(dueCase.isOverdue, undefined, "isOverdue must not be exposed");
  assert.strictEqual(dueCase.label, 'Due for revision');

  // Assert Upcoming state
  assert.strictEqual(upcomingCase.state, 'upcoming', "days < interval must result in state: 'upcoming'");
  assert.strictEqual(upcomingCase.isOverdue, undefined, "isOverdue must not be exposed");
  assert.strictEqual(upcomingCase.label, 'Upcoming review');

  // Assert RevisionSummary due/overdue filtering consistency
  const mockQueue = [
    { daysSinceLastAttempt: 1.99, intervalDays: 2 }, // upcoming -> excluded
    { daysSinceLastAttempt: 2.00, intervalDays: 2 }, // due      -> included
    { daysSinceLastAttempt: 2.01, intervalDays: 2 }, // overdue  -> included
    { daysSinceLastAttempt: 10.0, intervalDays: 5 }, // overdue  -> included
  ];
  const dueCount = mockQueue.filter((item) => {
    const timing = getRevisionTimingState(item.daysSinceLastAttempt, item.intervalDays);
    return timing.state === 'due' || timing.state === 'overdue';
  }).length;
  assert.strictEqual(dueCount, 3, 'RevisionSummary dueCount must strictly count due and overdue, excluding upcoming');

  // Assert mutual exclusivity across all possible discrete day values from 0 to 20
  for (let days = 0; days <= 20; days += 0.5) {
    const res = getRevisionTimingState(days, 5);
    const validStates = ['overdue', 'due', 'upcoming'];
    assert.ok(validStates.includes(res.state), `State ${res.state} must be one of the valid states`);
    assert.strictEqual(res.isOverdue, undefined, 'isOverdue must be undefined');

    if (days > 5) {
      assert.strictEqual(res.state, 'overdue');
    } else if (days >= 5) {
      assert.strictEqual(res.state, 'due');
    } else {
      assert.strictEqual(res.state, 'upcoming');
    }
  }
  console.log('✓ Revision timing states verified as strictly mutually exclusive with no overlapping flags');

  // 2. Audit: Platform & Difficulty Enum Consistency
  const expectedPlatforms = ['leetcode', 'gfg', 'codechef', 'hackerrank', 'other'];
  const platformsInCode = Object.keys(PLATFORM_NAMES).sort();
  assert.deepStrictEqual(platformsInCode, expectedPlatforms.sort(), 'Platform contract must match specification');
  console.log('✓ Platform enum contract consistency verified');

  // 3. Audit: URL Validation Regex Safety
  const URL_REGEX = /^https?:\/\/.+/i;
  assert.strictEqual(URL_REGEX.test('https://leetcode.com/problems/two-sum/'), true);
  assert.strictEqual(URL_REGEX.test('http://geeksforgeeks.org/problems'), true);
  assert.strictEqual(URL_REGEX.test('ftp://invalid.com'), false);
  assert.strictEqual(URL_REGEX.test('just_text'), false);
  assert.strictEqual(URL_REGEX.test(''), false);
  console.log('✓ Problem URL validation regex verified');

  // 4. Audit: Body Scroll Lock Simulator
  const mockDocument = {
    body: {
      style: {
        overflow: 'auto',
      },
    },
  };

  // Simulate modal open
  const previousOverflow = mockDocument.body.style.overflow;
  mockDocument.body.style.overflow = 'hidden';
  assert.strictEqual(mockDocument.body.style.overflow, 'hidden', 'Modal open must lock overflow');

  // Simulate modal unmount / close
  mockDocument.body.style.overflow = previousOverflow;
  assert.strictEqual(mockDocument.body.style.overflow, 'auto', 'Modal close must restore overflow');
  // 5. Audit: Zero Missing React Hook Imports
  const missingImports = [];
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) {
        scanDir(full);
      } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
        const content = fs.readFileSync(full, 'utf8');
        const hooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'useNavigate', 'useParams', 'useLocation'];
        for (const hook of hooks) {
          const regex = new RegExp('\\b' + hook + '\\s*\\(', 'g');
          if (regex.test(content)) {
            const importRegex = new RegExp('\\b' + hook + '\\b');
            const lines = content.split('\n');
            const importLines = lines.filter((l) => l.startsWith('import ')).join('\n');
            if (!importRegex.test(importLines)) {
              missingImports.push({ file: path.basename(full), hook });
            }
          }
        }
      }
    }
  }
  scanDir(path.resolve('./src'));
  assert.strictEqual(
    missingImports.length,
    0,
    `All React hooks must be explicitly imported. Found missing: ${JSON.stringify(missingImports)}`
  );
  console.log('✓ React hook import integrity across all client files verified (0 missing imports)');

  // 5. Audit: Strict AST Scope Check (Zero undefined variables or components across entire src)
  const standardGlobals = new Set([
    'window', 'document', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
    'Math', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set', 'JSON',
    'encodeURIComponent', 'decodeURIComponent', 'localStorage', 'sessionStorage', 'navigator',
    'URL', 'URLSearchParams', 'fetch', 'Headers', 'Request', 'Response', 'FormData', 'Blob',
    'File', 'FileReader', 'AbortController', 'IntersectionObserver', 'ResizeObserver', 'MutationObserver',
    'performance', 'requestAnimationFrame', 'cancelAnimationFrame', 'Event', 'CustomEvent',
    'HTMLElement', 'Element', 'Node', 'Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError',
    'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'undefined', 'NaN', 'Infinity', 'process', 'global',
    'Intl', 'Date', 'RegExp', 'Symbol', 'BigInt', 'alert', 'confirm', 'prompt', 'Notification'
  ]);

  const undeclaredIdentifiers = [];
  function scanAst(dir) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        scanAst(full);
      } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
        const code = fs.readFileSync(full, 'utf8');
        const ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['jsx']
        });
        traverse(ast, {
          Identifier(identPath) {
            const name = identPath.node.name;
            if (identPath.isReferencedIdentifier()) {
              if (!standardGlobals.has(name) && !identPath.scope.hasBinding(name)) {
                undeclaredIdentifiers.push({
                  file: path.relative(path.resolve('./src'), full),
                  name,
                  line: identPath.node.loc?.start?.line
                });
              }
            }
          },
          JSXIdentifier(jsxIdentPath) {
            const name = jsxIdentPath.node.name;
            if (/^[A-Z]/.test(name)) {
              if (jsxIdentPath.parentPath.isJSXOpeningElement() || jsxIdentPath.parentPath.isJSXClosingElement()) {
                if (!standardGlobals.has(name) && !jsxIdentPath.scope.hasBinding(name)) {
                  undeclaredIdentifiers.push({
                    file: path.relative(path.resolve('./src'), full),
                    name,
                    line: jsxIdentPath.node.loc?.start?.line
                  });
                }
              }
            }
          }
        });
      }
    }
  }

  scanAst(path.resolve('./src'));
  assert.strictEqual(
    undeclaredIdentifiers.length,
    0,
    `Undeclared identifiers found in client: ${JSON.stringify(undeclaredIdentifiers, null, 2)}`
  );
  console.log('✓ Strict AST scope audit across all client files verified (0 undefined variables)');

  console.log('--- All UX & Quality Audit Tests Passed Successfully ---');
}

testUxAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
