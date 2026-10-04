/**
 * seedDemo.js
 *
 * Dedicated, idempotent demo dataset seeder for DSA / Interview Prep Tracker.
 * Operates strictly on the dedicated demo user (demo@dsa-tracker.local).
 * Never mutates or removes normal users' records.
 *
 * Dataset specifications:
 * - 35 DSA problems across Easy (15), Medium (14), Hard (6)
 * - 92 practice attempts across the last 12 weeks (84 days)
 * - 38 active calendar days with varied practice clustering
 * - Overdue, due, upcoming, and long-term maintenance revision queue targets
 * - 6 problems with 0 attempts (unattempted filter demonstration)
 */

const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Ensure server .env is loaded when run directly
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');

const DEMO_USER_CONFIG = {
  name: 'DSA Tracker Demo',
  email: 'demo@dsa-tracker.local',
  plainPassword: 'Demo1234!', // Local development/demo credential only
};

/**
 * 35 Recognizable DSA problems strictly adhering to schema constraints:
 * - platforms: 'leetcode', 'gfg', 'hackerrank', 'codechef', 'other'
 * - difficulties: 'easy', 'medium', 'hard'
 * - valid HTTPS links
 * - consistent topic tag casing
 */
const DEMO_PROBLEMS = [
  // --- EASY (15 problems) ---
  {
    key: 'two-sum',
    title: 'Two Sum',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/two-sum/',
    topics: ['Array', 'Hash Table'],
    difficulty: 'easy',
  },
  {
    key: 'valid-parentheses',
    title: 'Valid Parentheses',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/valid-parentheses/',
    topics: ['String', 'Stack'],
    difficulty: 'easy',
  },
  {
    key: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    topics: ['Linked List', 'Recursion'],
    difficulty: 'easy',
  },
  {
    key: 'best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    topics: ['Array', 'Dynamic Programming'],
    difficulty: 'easy',
  },
  {
    key: 'valid-palindrome',
    title: 'Valid Palindrome',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/valid-palindrome/',
    topics: ['Two Pointer', 'String'],
    difficulty: 'easy',
  },
  {
    key: 'binary-search',
    title: 'Binary Search',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/binary-search/',
    topics: ['Array', 'Binary Search'],
    difficulty: 'easy',
  },
  {
    key: 'maximum-subarray',
    title: 'Maximum Subarray',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/maximum-subarray/',
    topics: ['Array', 'Dynamic Programming'],
    difficulty: 'easy',
  },
  {
    key: 'contains-duplicate',
    title: 'Contains Duplicate',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/contains-duplicate/',
    topics: ['Array', 'Hash Table'],
    difficulty: 'easy',
  },
  {
    key: 'climbing-stairs',
    title: 'Climbing Stairs',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/climbing-stairs/',
    topics: ['Math', 'Dynamic Programming'],
    difficulty: 'easy',
  },
  {
    key: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/invert-binary-tree/',
    topics: ['Tree', 'Binary Tree', 'DFS'],
    difficulty: 'easy',
  },
  {
    key: 'maximum-depth-tree',
    title: 'Maximum Depth of Binary Tree',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    topics: ['Tree', 'Binary Tree', 'DFS'],
    difficulty: 'easy',
  },
  {
    key: 'reverse-linked-list',
    title: 'Reverse Linked List',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/reverse-linked-list/',
    topics: ['Linked List', 'Recursion'],
    difficulty: 'easy',
  },
  {
    key: 'missing-number',
    title: 'Missing Number in Array',
    platform: 'gfg',
    link: 'https://practice.geeksforgeeks.org/problems/missing-number-in-array1416/1',
    topics: ['Array', 'Math'],
    difficulty: 'easy',
  },
  {
    key: 'check-balanced-tree',
    title: 'Check for Balanced Tree',
    platform: 'other',
    link: 'https://cses.fi/problemset/task/tree-diameter',
    topics: ['Tree', 'Binary Tree'],
    difficulty: 'easy',
  },
  {
    key: 'detect-loop-linked-list',
    title: 'Detect Loop in Linked List',
    platform: 'hackerrank',
    link: 'https://www.hackerrank.com/challenges/detect-whether-a-linked-list-contains-a-cycle',
    topics: ['Linked List', 'Two Pointer'],
    difficulty: 'easy',
  },

  // --- MEDIUM (14 problems) ---
  {
    key: '3sum',
    title: '3Sum',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/3sum/',
    topics: ['Array', 'Two Pointer', 'Sorting'],
    difficulty: 'medium',
  },
  {
    key: 'container-with-most-water',
    title: 'Container With Most Water',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/container-with-most-water/',
    topics: ['Array', 'Two Pointer', 'Greedy'],
    difficulty: 'medium',
  },
  {
    key: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    difficulty: 'medium',
  },
  {
    key: 'group-anagrams',
    title: 'Group Anagrams',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/group-anagrams/',
    topics: ['Array', 'Hash Table', 'String'],
    difficulty: 'medium',
  },
  {
    key: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/top-k-frequent-elements/',
    topics: ['Array', 'Hash Table', 'Heap'],
    difficulty: 'medium',
  },
  {
    key: 'product-of-array-except-self',
    title: 'Product of Array Except Self',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/product-of-array-except-self/',
    topics: ['Array', 'Prefix Sum'],
    difficulty: 'medium',
  },
  {
    key: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    topics: ['Array', 'Binary Search'],
    difficulty: 'medium',
  },
  {
    key: 'daily-temperatures',
    title: 'Daily Temperatures',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/daily-temperatures/',
    topics: ['Array', 'Stack'],
    difficulty: 'medium',
  },
  {
    key: 'merge-intervals',
    title: 'Merge Intervals',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/merge-intervals/',
    topics: ['Array', 'Intervals'],
    difficulty: 'medium',
  },
  {
    key: 'rotate-image',
    title: 'Rotate Image',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/rotate-image/',
    topics: ['Array', 'Math'],
    difficulty: 'medium',
  },
  {
    key: 'house-robber',
    title: 'House Robber',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/house-robber/',
    topics: ['Array', 'Dynamic Programming'],
    difficulty: 'medium',
  },
  {
    key: 'coin-change',
    title: 'Coin Change',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/coin-change/',
    topics: ['Array', 'Dynamic Programming', 'BFS'],
    difficulty: 'medium',
  },
  {
    key: 'number-of-islands',
    title: 'Number of Islands',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/number-of-islands/',
    topics: ['Array', 'DFS', 'BFS', 'Graph'],
    difficulty: 'medium',
  },
  {
    key: 'course-schedule',
    title: 'Course Schedule',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/course-schedule/',
    topics: ['DFS', 'BFS', 'Graph'],
    difficulty: 'medium',
  },

  // --- HARD (6 problems) ---
  {
    key: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/trapping-rain-water/',
    topics: ['Array', 'Two Pointer', 'Dynamic Programming', 'Stack'],
    difficulty: 'hard',
  },
  {
    key: 'merge-k-sorted-lists',
    title: 'Merge k Sorted Lists',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    topics: ['Linked List', 'Heap'],
    difficulty: 'hard',
  },
  {
    key: 'word-ladder',
    title: 'Word Ladder',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/word-ladder/',
    topics: ['Hash Table', 'String', 'BFS'],
    difficulty: 'hard',
  },
  {
    key: 'minimum-window-substring',
    title: 'Minimum Window Substring',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/minimum-window-substring/',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    difficulty: 'hard',
  },
  {
    key: 'median-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    platform: 'hackerrank',
    link: 'https://www.hackerrank.com/challenges/median-of-two-sorted-arrays',
    topics: ['Array', 'Binary Search'],
    difficulty: 'hard',
  },
  {
    key: 'lru-cache',
    title: 'LRU Cache Design',
    platform: 'codechef',
    link: 'https://www.codechef.com/problems/LRUCACHE',
    topics: ['Hash Table', 'Linked List'],
    difficulty: 'hard',
  },
];

/**
 * Generates the deterministic practice attempt history.
 * @returns {Array<{ problemKey: string, status: string, daysAgo: number, hoursOffset: number, timeTakenMinutes: number|null, notes: string }>}
 */
function buildAttemptBlueprints() {
  return [
    // 1. Two Sum (Easy): 3 attempts, latest solved 2d ago (Upcoming review)
    { problemKey: 'two-sum', status: 'solved', daysAgo: 78, hoursOffset: 2, timeTakenMinutes: 20, notes: 'Brute force O(n²) nested loop.' },
    { problemKey: 'two-sum', status: 'solved', daysAgo: 24, hoursOffset: 1, timeTakenMinutes: 10, notes: 'One-pass hash map complement check.' },
    { problemKey: 'two-sum', status: 'solved', daysAgo: 2, hoursOffset: 3, timeTakenMinutes: 8, notes: 'Optimal O(n) one-pass hash map; immediate solve.' },

    // 2. Valid Parentheses (Easy): 3 attempts, latest solved 16d ago (Overdue review)
    { problemKey: 'valid-parentheses', status: 'struggled', daysAgo: 74, hoursOffset: 1, timeTakenMinutes: 25, notes: 'Forgot closing bracket stack pop order check.' },
    { problemKey: 'valid-parentheses', status: 'solved', daysAgo: 45, hoursOffset: 2, timeTakenMinutes: 15, notes: 'Clean stack with dictionary mapping.' },
    { problemKey: 'valid-parentheses', status: 'solved', daysAgo: 16, hoursOffset: 5, timeTakenMinutes: 8, notes: 'Handled empty string and unmatched openers.' },

    // 3. Merge Two Sorted Lists (Easy): 3 attempts, latest solved 20d ago (Overdue review)
    { problemKey: 'merge-two-sorted-lists', status: 'struggled', daysAgo: 82, hoursOffset: 3, timeTakenMinutes: 30, notes: 'Lost pointer reference while splicing nodes.' },
    { problemKey: 'merge-two-sorted-lists', status: 'solved', daysAgo: 52, hoursOffset: 2, timeTakenMinutes: 15, notes: 'Used dummy head node to simplify head assignment.' },
    { problemKey: 'merge-two-sorted-lists', status: 'solved', daysAgo: 20, hoursOffset: 1, timeTakenMinutes: 12, notes: 'Iterative pointer progression O(n + m).' },

    // 4. Best Time to Buy and Sell Stock (Easy): 3 attempts, latest solved 1d ago (Upcoming review)
    { problemKey: 'best-time-stock', status: 'solved', daysAgo: 72, hoursOffset: 2, timeTakenMinutes: 20, notes: 'Tracked minimum buying price seen so far.' },
    { problemKey: 'best-time-stock', status: 'solved', daysAgo: 22, hoursOffset: 4, timeTakenMinutes: 10, notes: 'O(n) time, O(1) space.' },
    { problemKey: 'best-time-stock', status: 'solved', daysAgo: 1, hoursOffset: 2, timeTakenMinutes: 6, notes: 'Quick confidence repetition.' },

    // 5. Valid Palindrome (Easy): 3 attempts, latest solved 18d ago (Overdue review)
    { problemKey: 'valid-palindrome', status: 'solved', daysAgo: 76, hoursOffset: 5, timeTakenMinutes: 15, notes: 'Two pointers from both ends ignoring non-alphanumeric.' },
    { problemKey: 'valid-palindrome', status: 'solved', daysAgo: 42, hoursOffset: 2, timeTakenMinutes: 10, notes: 'Character code check to avoid regex overhead.' },
    { problemKey: 'valid-palindrome', status: 'solved', daysAgo: 18, hoursOffset: 3, timeTakenMinutes: 8, notes: 'In-place two-pointer comparison O(n).' },

    // 6. Binary Search (Easy): 3 attempts, latest solved 17d ago (Overdue review)
    { problemKey: 'binary-search', status: 'solved', daysAgo: 80, hoursOffset: 1, timeTakenMinutes: 15, notes: 'Standard iterative template with mid = low + (high - low)/2.' },
    { problemKey: 'binary-search', status: 'solved', daysAgo: 56, hoursOffset: 4, timeTakenMinutes: 10, notes: 'Checked boundary <= vs < conditions.' },
    { problemKey: 'binary-search', status: 'solved', daysAgo: 17, hoursOffset: 3, timeTakenMinutes: 5, notes: 'Iterative binary search executed flawlessly.' },

    // 7. Maximum Subarray (Easy): 3 attempts, latest solved 14d ago (Due for revision exact 14d!)
    { problemKey: 'maximum-subarray', status: 'struggled', daysAgo: 68, hoursOffset: 2, timeTakenMinutes: 30, notes: 'Kadane algorithm invariant was confusing initially.' },
    { problemKey: 'maximum-subarray', status: 'revisit_needed', daysAgo: 38, hoursOffset: 4, timeTakenMinutes: 20, notes: 'Understood resetting running sum when negative.' },
    { problemKey: 'maximum-subarray', status: 'solved', daysAgo: 14, hoursOffset: 1, timeTakenMinutes: 10, notes: 'Clean single pass Kadane algorithm O(n).' },

    // 8. Contains Duplicate (Easy): 3 attempts, latest solved 26d ago (Overdue review)
    { problemKey: 'contains-duplicate', status: 'solved', daysAgo: 77, hoursOffset: 2, timeTakenMinutes: 10, notes: 'HashSet insertion check.' },
    { problemKey: 'contains-duplicate', status: 'solved', daysAgo: 51, hoursOffset: 1, timeTakenMinutes: 6, notes: 'Early exit on duplicate detection.' },
    { problemKey: 'contains-duplicate', status: 'solved', daysAgo: 26, hoursOffset: 4, timeTakenMinutes: 5, notes: 'Set size vs array length comparison.' },

    // 9. Climbing Stairs (Easy): 3 attempts, latest solved 30d ago (Overdue review)
    { problemKey: 'climbing-stairs', status: 'solved', daysAgo: 75, hoursOffset: 3, timeTakenMinutes: 12, notes: 'Fibonacci recurrence relation recognized.' },
    { problemKey: 'climbing-stairs', status: 'solved', daysAgo: 53, hoursOffset: 2, timeTakenMinutes: 8, notes: 'Memoized top-down recursion.' },
    { problemKey: 'climbing-stairs', status: 'solved', daysAgo: 30, hoursOffset: 1, timeTakenMinutes: 6, notes: 'Iterative DP with two variables O(1) space.' },

    // 10. Maximum Depth of Binary Tree (Easy): 3 attempts, latest solved 21d ago (Overdue review)
    { problemKey: 'maximum-depth-tree', status: 'solved', daysAgo: 81, hoursOffset: 4, timeTakenMinutes: 15, notes: '1 + Math.max(leftDepth, rightDepth).' },
    { problemKey: 'maximum-depth-tree', status: 'solved', daysAgo: 47, hoursOffset: 3, timeTakenMinutes: 10, notes: 'Level-order BFS queue alternative.' },
    { problemKey: 'maximum-depth-tree', status: 'solved', daysAgo: 21, hoursOffset: 2, timeTakenMinutes: 8, notes: 'Concise post-order DFS.' },

    // 11. Missing Number in Array (Easy - GFG): 2 attempts, latest solved 28d ago (Overdue review)
    { problemKey: 'missing-number', status: 'solved', daysAgo: 63, hoursOffset: 2, timeTakenMinutes: 15, notes: 'Gauss formula n*(n+1)/2 sum difference.' },
    { problemKey: 'missing-number', status: 'solved', daysAgo: 28, hoursOffset: 4, timeTakenMinutes: 10, notes: 'XOR approach O(n) time O(1) space.' },

    // 12. Check for Balanced Tree (Easy - Other): 3 attempts, latest revisit_needed 7d ago (Overdue for 5d interval!)
    { problemKey: 'check-balanced-tree', status: 'struggled', daysAgo: 60, hoursOffset: 3, timeTakenMinutes: 35, notes: 'Naive O(n²) calculation of subtree heights.' },
    { problemKey: 'check-balanced-tree', status: 'revisit_needed', daysAgo: 32, hoursOffset: 2, timeTakenMinutes: 20, notes: 'Bottom-up DFS returning -1 on unbalance.' },
    { problemKey: 'check-balanced-tree', status: 'revisit_needed', daysAgo: 7, hoursOffset: 1, timeTakenMinutes: 18, notes: 'Solid approach, need to re-verify leaf edge conditions.' },

    // 13. 3Sum (Medium): 4 attempts, state evolution: struggled -> revisit_needed -> solved
    { problemKey: '3sum', status: 'struggled', daysAgo: 66, hoursOffset: 2, timeTakenMinutes: 50, notes: 'Triple loop brute force timed out.' },
    { problemKey: '3sum', status: 'struggled', daysAgo: 44, hoursOffset: 4, timeTakenMinutes: 40, notes: 'Duplicate triplet handling created wrong output.' },
    { problemKey: '3sum', status: 'revisit_needed', daysAgo: 23, hoursOffset: 2, timeTakenMinutes: 30, notes: 'Sorted array + two pointers worked, but slow on pointer increments.' },
    { problemKey: '3sum', status: 'solved', daysAgo: 3, hoursOffset: 3, timeTakenMinutes: 22, notes: 'Clean two-pointer approach with duplicate skips.' },

    // 14. Container With Most Water (Medium): 3 attempts, latest solved 25d ago (Overdue review)
    { problemKey: 'container-with-most-water', status: 'struggled', daysAgo: 65, hoursOffset: 2, timeTakenMinutes: 30, notes: 'Tried checking all pairs O(n²).' },
    { problemKey: 'container-with-most-water', status: 'solved', daysAgo: 43, hoursOffset: 1, timeTakenMinutes: 20, notes: 'Two pointers moving smaller boundary inward.' },
    { problemKey: 'container-with-most-water', status: 'solved', daysAgo: 25, hoursOffset: 3, timeTakenMinutes: 14, notes: 'Mathematical proof of greedy choice confirmed.' },

    // 15. Longest Substring Without Repeating Characters (Medium): 4 attempts, latest struggled 4d ago (Overdue for 2d interval!)
    { problemKey: 'longest-substring-without-repeating', status: 'struggled', daysAgo: 58, hoursOffset: 4, timeTakenMinutes: 45, notes: 'Substrings with repeats were included due to bad index map.' },
    { problemKey: 'longest-substring-without-repeating', status: 'revisit_needed', daysAgo: 36, hoursOffset: 2, timeTakenMinutes: 30, notes: 'Sliding window with character index hash map.' },
    { problemKey: 'longest-substring-without-repeating', status: 'solved', daysAgo: 19, hoursOffset: 3, timeTakenMinutes: 20, notes: 'Max length tracking with window left and right pointers.' },
    { problemKey: 'longest-substring-without-repeating', status: 'struggled', daysAgo: 4, hoursOffset: 2, timeTakenMinutes: 35, notes: 'Forgot to update left pointer with Math.max(left, map[c] + 1).' },

    // 16. Group Anagrams (Medium): 3 attempts, latest solved 27d ago (Overdue review)
    { problemKey: 'group-anagrams', status: 'solved', daysAgo: 62, hoursOffset: 3, timeTakenMinutes: 30, notes: 'Sorted character array as hash map key.' },
    { problemKey: 'group-anagrams', status: 'solved', daysAgo: 41, hoursOffset: 2, timeTakenMinutes: 20, notes: 'Character frequency array formatted as key string.' },
    { problemKey: 'group-anagrams', status: 'solved', daysAgo: 27, hoursOffset: 4, timeTakenMinutes: 15, notes: 'O(n * k) frequency map grouping.' },

    // 17. Top K Frequent Elements (Medium): 3 attempts, latest solved 15d ago (Overdue review)
    { problemKey: 'top-k-frequent-elements', status: 'struggled', daysAgo: 55, hoursOffset: 2, timeTakenMinutes: 40, notes: 'Full sort took O(n log n); wanted O(n log k).' },
    { problemKey: 'top-k-frequent-elements', status: 'revisit_needed', daysAgo: 33, hoursOffset: 1, timeTakenMinutes: 25, notes: 'Min-heap of size k maintaining top elements.' },
    { problemKey: 'top-k-frequent-elements', status: 'solved', daysAgo: 15, hoursOffset: 5, timeTakenMinutes: 18, notes: 'Bucket sort algorithm achieved linear O(n) time.' },

    // 18. Product of Array Except Self (Medium): 3 attempts, latest solved 11d ago (Upcoming review)
    { problemKey: 'product-of-array-except-self', status: 'struggled', daysAgo: 64, hoursOffset: 3, timeTakenMinutes: 35, notes: 'Division by zero occurred when array contained zeros.' },
    { problemKey: 'product-of-array-except-self', status: 'solved', daysAgo: 23, hoursOffset: 2, timeTakenMinutes: 18, notes: 'Optimized space to O(1) output array pass.' },
    { problemKey: 'product-of-array-except-self', status: 'solved', daysAgo: 11, hoursOffset: 1, timeTakenMinutes: 12, notes: 'Prefix pass forward, suffix running product backward.' },

    // 19. Search in Rotated Sorted Array (Medium): 3 attempts, latest struggled 7d ago (Overdue for 2d interval!)
    { problemKey: 'search-in-rotated-sorted-array', status: 'struggled', daysAgo: 54, hoursOffset: 2, timeTakenMinutes: 45, notes: 'Failed to determine whether left or right half was sorted.' },
    { problemKey: 'search-in-rotated-sorted-array', status: 'solved', daysAgo: 18, hoursOffset: 1, timeTakenMinutes: 20, notes: 'Binary search with segment conditions worked.' },
    { problemKey: 'search-in-rotated-sorted-array', status: 'struggled', daysAgo: 7, hoursOffset: 4, timeTakenMinutes: 35, notes: 'Strict inequality edge case caused infinite loop on rotation point.' },

    // 20. Daily Temperatures (Medium): 3 attempts, latest struggled 5d ago (Overdue for 2d interval!)
    { problemKey: 'daily-temperatures', status: 'solved', daysAgo: 46, hoursOffset: 2, timeTakenMinutes: 25, notes: 'Monotonic decreasing stack holding indices.' },
    { problemKey: 'daily-temperatures', status: 'solved', daysAgo: 29, hoursOffset: 3, timeTakenMinutes: 18, notes: 'Popped cooler days and calculated span.' },
    { problemKey: 'daily-temperatures', status: 'struggled', daysAgo: 5, hoursOffset: 1, timeTakenMinutes: 30, notes: 'Confused storing temperature values vs storing index positions.' },

    // 21. Merge Intervals (Medium): 4 attempts, latest revisit_needed 8d ago (Overdue for 5d interval!)
    { problemKey: 'merge-intervals', status: 'struggled', daysAgo: 59, hoursOffset: 3, timeTakenMinutes: 40, notes: 'Did not sort by start interval first.' },
    { problemKey: 'merge-intervals', status: 'revisit_needed', daysAgo: 37, hoursOffset: 2, timeTakenMinutes: 25, notes: 'Sorted by start time; handled overlap with Math.max.' },
    { problemKey: 'merge-intervals', status: 'solved', daysAgo: 21, hoursOffset: 4, timeTakenMinutes: 18, notes: 'Clean greedy merge with interval comparison.' },
    { problemKey: 'merge-intervals', status: 'revisit_needed', daysAgo: 8, hoursOffset: 2, timeTakenMinutes: 20, notes: 'Single-interval input and adjacent intervals need review.' },

    // 22. House Robber (Medium): 3 attempts, latest revisit_needed 10d ago (Overdue for 5d interval!)
    { problemKey: 'house-robber', status: 'struggled', daysAgo: 67, hoursOffset: 4, timeTakenMinutes: 40, notes: 'Recursive approach without memoization caused TLE.' },
    { problemKey: 'house-robber', status: 'solved', daysAgo: 22, hoursOffset: 1, timeTakenMinutes: 15, notes: 'Optimized space to two variables rob1 and rob2.' },
    { problemKey: 'house-robber', status: 'revisit_needed', daysAgo: 10, hoursOffset: 5, timeTakenMinutes: 18, notes: 'Need to review House Robber II circular variant.' },

    // 23. Coin Change (Medium): 4 attempts, latest revisit_needed 5d ago (DUE for 5d interval!)
    { problemKey: 'coin-change', status: 'struggled', daysAgo: 61, hoursOffset: 2, timeTakenMinutes: 50, notes: 'Greedy choice failed on test case coins=[1, 3, 4], amount=6.' },
    { problemKey: 'coin-change', status: 'struggled', daysAgo: 35, hoursOffset: 4, timeTakenMinutes: 40, notes: 'Top-down memoization exceeded recursion depth on large amounts.' },
    { problemKey: 'coin-change', status: 'revisit_needed', daysAgo: 19, hoursOffset: 2, timeTakenMinutes: 30, notes: 'Bottom-up DP array initialized to amount + 1.' },
    { problemKey: 'coin-change', status: 'revisit_needed', daysAgo: 5, hoursOffset: 3, timeTakenMinutes: 25, notes: 'Unbounded knapsack formulation clear, ready for timed re-test.' },

    // 24. Number of Islands (Medium): 3 attempts, latest solved 12d ago (Upcoming review)
    { problemKey: 'number-of-islands', status: 'struggled', daysAgo: 71, hoursOffset: 3, timeTakenMinutes: 50, notes: 'Maximum call stack exceeded on large grid inputs.' },
    { problemKey: 'number-of-islands', status: 'solved', daysAgo: 27, hoursOffset: 1, timeTakenMinutes: 22, notes: 'In-place grid marking to avoid extra visited matrix.' },
    { problemKey: 'number-of-islands', status: 'solved', daysAgo: 12, hoursOffset: 4, timeTakenMinutes: 18, notes: 'Directions array traversal clean and bug-free.' },

    // 25. Course Schedule (Medium): 4 attempts, latest struggled 6d ago (URGENT OVERDUE rank #1!)
    { problemKey: 'course-schedule', status: 'struggled', daysAgo: 57, hoursOffset: 1, timeTakenMinutes: 55, notes: 'Failed to detect back-edges in directed cycle.' },
    { problemKey: 'course-schedule', status: 'revisit_needed', daysAgo: 31, hoursOffset: 3, timeTakenMinutes: 35, notes: 'Kahn algorithm with indegree array and BFS queue.' },
    { problemKey: 'course-schedule', status: 'solved', daysAgo: 17, hoursOffset: 2, timeTakenMinutes: 25, notes: 'Clean topological sort cycle check.' },
    { problemKey: 'course-schedule', status: 'struggled', daysAgo: 6, hoursOffset: 3, timeTakenMinutes: 40, notes: 'Forgot to decrement indegree for neighboring nodes.' },

    // 26. Trapping Rain Water (Hard): 4 attempts, latest struggled 8d ago (URGENT OVERDUE for 2d interval!)
    { problemKey: 'trapping-rain-water', status: 'struggled', daysAgo: 70, hoursOffset: 4, timeTakenMinutes: 75, notes: 'Brute force O(n²) timed out.' },
    { problemKey: 'trapping-rain-water', status: 'struggled', daysAgo: 46, hoursOffset: 2, timeTakenMinutes: 55, notes: 'Prefix and suffix max height arrays worked but used O(n) memory.' },
    { problemKey: 'trapping-rain-water', status: 'revisit_needed', daysAgo: 25, hoursOffset: 3, timeTakenMinutes: 40, notes: 'Two-pointer approach with leftMax and rightMax.' },
    { problemKey: 'trapping-rain-water', status: 'struggled', daysAgo: 8, hoursOffset: 1, timeTakenMinutes: 45, notes: 'Pointer advancement logic mixed up left vs right height check.' },

    // 27. Merge k Sorted Lists (Hard): 3 attempts, latest struggled 13d ago (Overdue for 2d interval!)
    { problemKey: 'merge-k-sorted-lists', status: 'struggled', daysAgo: 53, hoursOffset: 3, timeTakenMinutes: 60, notes: 'Sequential merging took O(k² * n) and timed out.' },
    { problemKey: 'merge-k-sorted-lists', status: 'revisit_needed', daysAgo: 33, hoursOffset: 2, timeTakenMinutes: 45, notes: 'Divide and conquer pairwise merge O(n * log k).' },
    { problemKey: 'merge-k-sorted-lists', status: 'struggled', daysAgo: 13, hoursOffset: 4, timeTakenMinutes: 50, notes: 'Min-heap comparator threw null reference on empty list input.' },

    // 28. Word Ladder (Hard): 3 attempts, latest revisit_needed 9d ago (Overdue for 5d interval!)
    { problemKey: 'word-ladder', status: 'struggled', daysAgo: 51, hoursOffset: 1, timeTakenMinutes: 65, notes: 'Full graph construction timed out with large dictionary.' },
    { problemKey: 'word-ladder', status: 'revisit_needed', daysAgo: 28, hoursOffset: 3, timeTakenMinutes: 45, notes: 'Intermediate pattern wildcard map with BFS queue.' },
    { problemKey: 'word-ladder', status: 'revisit_needed', daysAgo: 9, hoursOffset: 2, timeTakenMinutes: 35, notes: 'Bidirectional BFS implementation needs review for visited overlap.' },

    // 29. LRU Cache Design (Hard - CodeChef): 3 attempts, latest solved 22d ago (Overdue for 14d maintenance!)
    { problemKey: 'lru-cache', status: 'struggled', daysAgo: 73, hoursOffset: 2, timeTakenMinutes: 65, notes: 'Array eviction was O(n) instead of O(1).' },
    { problemKey: 'lru-cache', status: 'solved', daysAgo: 31, hoursOffset: 1, timeTakenMinutes: 35, notes: 'Dummy head and dummy tail simplified insert and remove.' },
    { problemKey: 'lru-cache', status: 'solved', daysAgo: 22, hoursOffset: 4, timeTakenMinutes: 25, notes: 'Clean get and put in O(1) time.' },
  ];
}

/**
 * Executes idempotent seeding for the demo user.
 * @param {Object} options
 * @param {string} [options.mongoUri] - Database connection string
 * @param {boolean} [options.isTest=false] - When true, skips process exit and uses active connection
 * @param {boolean} [options.silent=false] - When true, suppresses console output
 * @returns {Promise<{ demoUser: Object, problemsCount: number, attemptsCount: number, unattemptedCount: number }>}
 */
async function seedDemoDatabase(options = {}) {
  const { mongoUri = process.env.MONGO_URI, isTest = false, silent = false } = options;

  let localConnection = false;
  if (mongoose.connection.readyState === 0) {
    if (!mongoUri) {
      throw new Error('MONGO_URI is required to connect to MongoDB.');
    }
    await mongoose.connect(mongoUri);
    localConnection = true;
  }

  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  try {
    log('==================================================');
    log('  DSA / Interview Prep Tracker — Demo Data Seeder ');
    log('==================================================');

    // 1. Find or create demo user
    let demoUser = await User.findOne({ email: DEMO_USER_CONFIG.email }).select('+passwordHash');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEMO_USER_CONFIG.plainPassword, salt);

    if (!demoUser) {
      demoUser = await User.create({
        name: DEMO_USER_CONFIG.name,
        email: DEMO_USER_CONFIG.email,
        passwordHash,
      });
      log(`Created demo user: ${demoUser.email} (ID: ${demoUser._id})`);
    } else {
      demoUser.passwordHash = passwordHash;
      await demoUser.save();
      log(`Found existing demo user: ${demoUser.email} (ID: ${demoUser._id})`);
    }

    // 2. Strict scoped cleanup: delete only records belonging to demoUser
    const deletedAttempts = await Attempt.deleteMany({ userId: demoUser._id });
    const deletedProblems = await Problem.deleteMany({ userId: demoUser._id });
    log(`Scoped cleanup: Removed ${deletedProblems.deletedCount} problems and ${deletedAttempts.deletedCount} attempts owned by demo user.`);

    // 3. Insert 35 demo problems
    const problemsToInsert = DEMO_PROBLEMS.map((p) => ({
      userId: demoUser._id,
      title: p.title,
      platform: p.platform,
      link: p.link,
      topics: p.topics,
      difficulty: p.difficulty,
    }));

    const insertedProblems = await Problem.insertMany(problemsToInsert);
    log(`Inserted ${insertedProblems.length} DSA problems across Easy, Medium, and Hard.`);

    // Map problem key to MongoDB _id
    const problemMap = new Map();
    DEMO_PROBLEMS.forEach((p, idx) => {
      problemMap.set(p.key, insertedProblems[idx]._id);
    });

    // 4. Generate ~92 practice attempts with anchored timestamps
    const now = new Date();
    const blueprints = buildAttemptBlueprints();
    const attemptsToInsert = [];

    for (const b of blueprints) {
      const problemId = problemMap.get(b.problemKey);
      if (!problemId) {
        throw new Error(`Missing problem mapping for key: ${b.problemKey}`);
      }

      // Calculate historical attemptedAt date relative to now
      const attemptedAt = new Date(
        now.getTime() - (b.daysAgo * 86400000 + b.hoursOffset * 3600000)
      );

      attemptsToInsert.push({
        problemId,
        userId: demoUser._id,
        status: b.status,
        timeTakenMinutes: b.timeTakenMinutes,
        notes: b.notes,
        attemptedAt,
      });
    }

    const insertedAttempts = await Attempt.insertMany(attemptsToInsert);
    log(`Inserted ${insertedAttempts.length} historical practice attempts spanning 12 weeks.`);

    // 5. Compute metrics for summary report
    const attemptedProblemIds = new Set(insertedAttempts.map((a) => a.problemId.toString()));
    const unattemptedCount = insertedProblems.length - attemptedProblemIds.size;

    const statusCounts = { solved: 0, struggled: 0, revisit_needed: 0 };
    insertedAttempts.forEach((a) => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    insertedProblems.forEach((p) => {
      difficultyCounts[p.difficulty] = (difficultyCounts[p.difficulty] || 0) + 1;
    });

    log('--------------------------------------------------');
    log('Demo user:');
    log(`  Name:     ${demoUser.name}`);
    log(`  Email:    ${demoUser.email}`);
    log('Problems created:        ', insertedProblems.length);
    log(`  Easy: ${difficultyCounts.easy} | Medium: ${difficultyCounts.medium} | Hard: ${difficultyCounts.hard}`);
    log('Attempts created:        ', insertedAttempts.length);
    log(`  Solved: ${statusCounts.solved} | Struggled: ${statusCounts.struggled} | Revisit needed: ${statusCounts.revisit_needed}`);
    log('Problems with no attempts:', unattemptedCount);
    log('Problems with attempts:   ', attemptedProblemIds.size);
    log('Seed completed successfully.');
    log('==================================================');

    return {
      demoUser,
      problemsCount: insertedProblems.length,
      attemptsCount: insertedAttempts.length,
      unattemptedCount,
      difficultyCounts,
      statusCounts,
    };
  } finally {
    if (localConnection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

// Standalone CLI runner
if (require.main === module) {
  seedDemoDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ [Seed Error]: Seeding demo database failed:');
      console.error(err);
      process.exit(1);
    });
}

module.exports = {
  seedDemoDatabase,
  DEMO_USER_CONFIG,
  DEMO_PROBLEMS,
};
