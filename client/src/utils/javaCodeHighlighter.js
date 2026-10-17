/**
 * HTML Escaping helper to ensure safety before applying syntax highlights
 */
export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Tokenize and highlight Java code into vibrant syntax-highlighted HTML spans.
 * Matches LeetCode / VS Code Dark Plus color themes.
 */
export function highlightJavaCode(rawCode) {
  if (!rawCode) return '';

  // Regex matching Java tokens in priority order
  const JAVA_TOKEN_REGEX =
    /(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(@[A-Za-z_]\w*)|(\b(?:abstract|assert|break|case|catch|class|const|continue|default|do|else|enum|extends|final|finally|for|goto|if|implements|import|instanceof|interface|native|new|package|private|protected|public|return|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b)|(\b(?:boolean|byte|char|double|float|int|long|short|String|StringBuilder|StringBuffer|Integer|Long|Double|Float|Boolean|Character|Byte|Short|Void|Object|List|ArrayList|LinkedList|Map|HashMap|TreeMap|LinkedHashMap|Set|HashSet|TreeSet|Queue|Deque|ArrayDeque|PriorityQueue|Stack|Vector|Arrays|Collections|Math|Scanner|System|TreeNode|ListNode|Node|Pair|Comparator|Comparable)\b)|(\b(?:true|false|null)\b)|(\b(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFdDlL]?)\b)|(\b[a-zA-Z_]\w*(?=\s*\())/g;

  let lastIndex = 0;
  let match;
  let result = '';

  while ((match = JAVA_TOKEN_REGEX.exec(rawCode)) !== null) {
    // Unmatched preceding text
    if (match.index > lastIndex) {
      result += escapeHtml(rawCode.slice(lastIndex, match.index));
    }

    const [
      full,
      comment,
      stringLit,
      annotation,
      keyword,
      typeIdent,
      booleanNull,
      numberLit,
      methodName,
    ] = match;

    if (comment) {
      result += `<span class="text-slate-400/90 italic">${escapeHtml(comment)}</span>`;
    } else if (stringLit) {
      result += `<span class="text-emerald-400">${escapeHtml(stringLit)}</span>`;
    } else if (annotation) {
      result += `<span class="text-amber-400 font-semibold">${escapeHtml(annotation)}</span>`;
    } else if (keyword) {
      result += `<span class="text-purple-400 font-semibold">${escapeHtml(keyword)}</span>`;
    } else if (typeIdent) {
      result += `<span class="text-sky-400 font-medium">${escapeHtml(typeIdent)}</span>`;
    } else if (booleanNull) {
      result += `<span class="text-rose-400 font-semibold">${escapeHtml(booleanNull)}</span>`;
    } else if (numberLit) {
      result += `<span class="text-amber-300 font-mono">${escapeHtml(numberLit)}</span>`;
    } else if (methodName) {
      result += `<span class="text-indigo-300">${escapeHtml(methodName)}</span>`;
    } else {
      result += escapeHtml(full);
    }

    lastIndex = JAVA_TOKEN_REGEX.lastIndex;
  }

  // Any remaining text
  if (lastIndex < rawCode.length) {
    result += escapeHtml(rawCode.slice(lastIndex));
  }

  return result;
}

/**
 * Standard Java boilerplate template for quick insertion
 */
export const DEFAULT_JAVA_TEMPLATE = `class Solution {
    public int[] solve(int[] nums) {
        // Write your solution here
        
        return new int[]{};
    }
}`;

/**
 * Approach metadata options
 */
export const APPROACH_OPTIONS = [
  {
    value: 'optimal',
    label: 'Optimal Solution',
    shortLabel: 'Optimal',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    description: 'Best time/space complexity (e.g. O(N) Hash Table, Two Pointers)',
  },
  {
    value: 'better',
    label: 'Better / Improved',
    shortLabel: 'Better',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    dotClass: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]',
    description: 'Sub-optimal improvement (e.g. O(N log N) Sorting or O(N) Extra Space)',
  },
  {
    value: 'brute_force',
    label: 'Brute Force',
    shortLabel: 'Brute Force',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    description: 'Initial naive approach (e.g. Nested Loops O(N^2), Recursion without Memo)',
  },
  {
    value: 'other',
    label: 'Other / Notes',
    shortLabel: 'Other',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dotClass: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]',
    description: 'Alternative variation, recursive walkthrough, or edge-case script',
  },
];
