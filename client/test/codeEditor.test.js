import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  highlightJavaCode,
  APPROACH_OPTIONS,
} from '../src/utils/javaCodeHighlighter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testCodeEditorAndIntegration() {
  console.log('--- Starting Java Code Editor & Practice Log Integration Test Suite ---');

  const editorPath = path.resolve(__dirname, '../src/components/common/JavaCodeEditor.jsx');
  const modalPath = path.resolve(__dirname, '../src/components/problems/AttemptFormModal.jsx');
  const detailPagePath = path.resolve(__dirname, '../src/pages/ProblemDetailPage.jsx');

  // Verify all files exist
  assert.ok(fs.existsSync(editorPath), 'JavaCodeEditor.jsx must exist');
  assert.ok(fs.existsSync(modalPath), 'AttemptFormModal.jsx must exist');
  assert.ok(fs.existsSync(detailPagePath), 'ProblemDetailPage.jsx must exist');

  // 1. Test highlightJavaCode syntax tokenizer
  const sampleJavaCode = `
// Solution to Two Sum
public class Solution {
    @Override
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        String status = "optimal";
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                return new int[]{map.get(comp), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}
`;

  const highlighted = highlightJavaCode(sampleJavaCode);

  // Check keyword highlighting
  assert.ok(
    highlighted.includes('text-purple-400 font-semibold') && highlighted.includes('public'),
    'Java keywords (public, class, return) must be highlighted with purple class'
  );

  // Check type highlighting
  assert.ok(
    highlighted.includes('text-sky-400 font-medium') && highlighted.includes('Map'),
    'Java types (Map, HashMap, String, int) must be highlighted with sky class'
  );

  // Check string literal highlighting
  assert.ok(
    highlighted.includes('text-emerald-400') && highlighted.includes('optimal'),
    'String literals must be highlighted with emerald class'
  );

  // Check comment highlighting
  assert.ok(
    highlighted.includes('text-slate-400/90 italic') &&
      highlighted.includes('Solution to Two Sum'),
    'Comments must be highlighted with italic slate class'
  );

  // Check annotation highlighting
  assert.ok(
    highlighted.includes('text-amber-400 font-semibold') &&
      highlighted.includes('@Override'),
    'Annotations (@Override) must be highlighted with amber class'
  );

  // Check HTML escaping for generics (e.g. Map<Integer, Integer>)
  assert.ok(
    highlighted.includes('&lt;') && highlighted.includes('&gt;'),
    'Generics angle brackets (< and >) must be safely HTML escaped'
  );
  assert.ok(
    !highlighted.includes('<Integer>'),
    'Raw angle brackets must never be unescaped inside HTML'
  );

  console.log('✓ Java syntax tokenizer and HTML safety verified');

  // 2. Test Approach Options
  const expectedApproaches = ['optimal', 'better', 'brute_force', 'other'];
  const actualApproaches = APPROACH_OPTIONS.map((o) => o.value);
  assert.deepStrictEqual(
    actualApproaches,
    expectedApproaches,
    'APPROACH_OPTIONS must define optimal, better, brute_force, other'
  );

  APPROACH_OPTIONS.forEach((opt) => {
    assert.ok(opt.label, `Approach ${opt.value} must have a label`);
    assert.ok(opt.shortLabel, `Approach ${opt.value} must have a shortLabel`);
    assert.ok(opt.badgeClass, `Approach ${opt.value} must have a badgeClass`);
    assert.ok(opt.dotClass, `Approach ${opt.value} must have a dotClass`);
  });
  console.log('✓ Approach metadata options (optimal, better, brute_force, other) verified');

  // 3. Test AttemptFormModal Integration
  const modalContent = fs.readFileSync(modalPath, 'utf8');
  assert.ok(
    modalContent.includes('import JavaCodeEditor'),
    'AttemptFormModal must import JavaCodeEditor'
  );
  assert.ok(
    modalContent.includes("approach: 'optimal'") && modalContent.includes("code: ''"),
    'AttemptFormModal must initialize approach and code state'
  );
  assert.ok(
    modalContent.includes('approach: formData.approach') &&
      modalContent.includes('code: formData.code.trim() ? formData.code : undefined'),
    'AttemptFormModal must submit approach and code in payload'
  );
  assert.ok(
    modalContent.includes('<JavaCodeEditor'),
    'AttemptFormModal must render the JavaCodeEditor component'
  );
  assert.ok(
    modalContent.includes('overflow-y-auto min-h-0'),
    'AttemptFormModal must include min-h-0 and overflow-y-auto for scroll containment'
  );
  console.log('✓ AttemptFormModal state, payload, scroll containment, and JavaCodeEditor embedding verified');

  // 4. Test ProblemDetailPage Integration
  const detailContent = fs.readFileSync(detailPagePath, 'utf8');
  assert.ok(
    detailContent.includes('import JavaCodeEditor'),
    'ProblemDetailPage must import JavaCodeEditor'
  );
  assert.ok(
    detailContent.includes('AttemptCodeViewer'),
    'ProblemDetailPage must define AttemptCodeViewer component'
  );
  assert.ok(
    detailContent.includes('attempt.approach'),
    'ProblemDetailPage must render approach badge in practice timeline'
  );
  assert.ok(
    detailContent.includes('attempt.code'),
    'ProblemDetailPage must render Java code solution in practice timeline'
  );
  assert.ok(
    detailContent.includes('brute_force') && detailContent.includes('optimal'),
    'ProblemDetailPage must style brute_force and optimal badges'
  );
  console.log('✓ ProblemDetailPage timeline approach badge and code viewer verified');

  // 5. Test ViewLogModal and Multi-Page Code Viewing Integration
  const viewLogModalPath = path.resolve(__dirname, '../src/components/problems/ViewLogModal.jsx');
  const problemsPagePath = path.resolve(__dirname, '../src/pages/ProblemsPage.jsx');
  const revisionPagePath = path.resolve(__dirname, '../src/pages/RevisionPage.jsx');
  const tablePath = path.resolve(__dirname, '../src/components/problems/ProblemTable.jsx');
  const mobileListPath = path.resolve(__dirname, '../src/components/problems/ProblemMobileList.jsx');

  assert.ok(fs.existsSync(viewLogModalPath), 'ViewLogModal.jsx must exist');
  const viewLogModalContent = fs.readFileSync(viewLogModalPath, 'utf8');
  assert.ok(
    viewLogModalContent.includes('getAttempts'),
    'ViewLogModal must load all attempts via problemsApi.getAttempts'
  );
  assert.ok(
    viewLogModalContent.includes('JavaCodeEditor'),
    'ViewLogModal must render JavaCodeEditor'
  );
  assert.ok(
    viewLogModalContent.includes('selectedAttemptIndex'),
    'ViewLogModal must support attempt tab switching'
  );

  const tableContent = fs.readFileSync(tablePath, 'utf8');
  assert.ok(
    tableContent.includes('onViewLogs'),
    'ProblemTable must accept onViewLogs prop'
  );
  assert.ok(
    tableContent.includes('onViewLogs?.(problem)'),
    'ProblemTable must provide button to trigger onViewLogs'
  );

  const mobileContent = fs.readFileSync(mobileListPath, 'utf8');
  assert.ok(
    mobileContent.includes('onViewLogs'),
    'ProblemMobileList must accept onViewLogs prop'
  );

  const problemsPageContent = fs.readFileSync(problemsPagePath, 'utf8');
  assert.ok(
    problemsPageContent.includes('ViewLogModal'),
    'ProblemsPage must render ViewLogModal'
  );
  assert.ok(
    problemsPageContent.includes('viewingLogProblem'),
    'ProblemsPage must maintain viewingLogProblem state'
  );

  const revisionPageContent = fs.readFileSync(revisionPagePath, 'utf8');
  assert.ok(
    revisionPageContent.includes('ViewLogModal'),
    'RevisionPage must render ViewLogModal'
  );

  console.log('✓ ViewLogModal, Problems table, mobile list, and revision integration verified');

  console.log('--- All Java Code Editor & Practice Log Integration Tests Passed Successfully ---');
}

testCodeEditorAndIntegration().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
