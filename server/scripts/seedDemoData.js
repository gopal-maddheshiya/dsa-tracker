/**
 * Seed Script: Realistic Demo Dataset for DSA Tracker
 * 
 * Safety Guarantee:
 * - Strictly isolated to 'demo@dsa-tracker.local'.
 * - NEVER touches or deletes data from other user accounts.
 * - Intended for development and portfolio demonstration only.
 * 
 * Usage:
 *   cd server && npm run seed:demo
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');
const Problem = require('../src/models/Problem');
const Attempt = require('../src/models/Attempt');

const DEMO_USER = {
  name: 'Demo Developer',
  email: 'demo@dsa-tracker.local',
  password: 'DemoPassword123!',
};

// 35 realistic, well-known problems
const DEMO_PROBLEMS = [
  // Arrays & Hash Table
  {
    title: 'Two Sum',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'easy',
    topics: ['Array', 'Hash Table'],
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    difficulty: 'easy',
    topics: ['Array', 'Dynamic Programming'],
  },
  {
    title: 'Contains Duplicate',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/contains-duplicate/',
    difficulty: 'easy',
    topics: ['Array', 'Hash Table'],
  },
  {
    title: 'Product of Array Except Self',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/product-of-array-except-self/',
    difficulty: 'medium',
    topics: ['Array', 'Prefix Sum'],
  },
  {
    title: 'Maximum Subarray (Kadane\'s)',
    platform: 'gfg',
    link: 'https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/',
    difficulty: 'medium',
    topics: ['Array', 'Dynamic Programming'],
  },
  {
    title: 'Subarray Sum Equals K',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    difficulty: 'medium',
    topics: ['Array', 'Hash Table', 'Prefix Sum'],
  },

  // Two Pointers & Sliding Window
  {
    title: 'Valid Palindrome',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/valid-palindrome/',
    difficulty: 'easy',
    topics: ['Two Pointer'],
  },
  {
    title: '3Sum',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/3sum/',
    difficulty: 'medium',
    topics: ['Array', 'Two Pointer'],
  },
  {
    title: 'Container With Most Water',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/container-with-most-water/',
    difficulty: 'medium',
    topics: ['Array', 'Two Pointer', 'Greedy'],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    difficulty: 'medium',
    topics: ['Hash Table', 'Sliding Window'],
  },
  {
    title: 'Minimum Window Substring',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/minimum-window-substring/',
    difficulty: 'hard',
    topics: ['Hash Table', 'Sliding Window'],
  },
  {
    title: 'Trapping Rain Water',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/trapping-rain-water/',
    difficulty: 'hard',
    topics: ['Array', 'Two Pointer', 'Stack'],
  },

  // Binary Search
  {
    title: 'Binary Search',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/binary-search/',
    difficulty: 'easy',
    topics: ['Binary Search', 'Array'],
  },
  {
    title: 'Search in Rotated Sorted Array',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    difficulty: 'medium',
    topics: ['Array', 'Binary Search'],
  },
  {
    title: 'Find Minimum in Rotated Sorted Array',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
    difficulty: 'medium',
    topics: ['Array', 'Binary Search'],
  },
  {
    title: 'Median of Two Sorted Arrays',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    difficulty: 'hard',
    topics: ['Array', 'Binary Search'],
  },

  // Linked Lists
  {
    title: 'Reverse Linked List',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/reverse-linked-list/',
    difficulty: 'easy',
    topics: ['Linked List'],
  },
  {
    title: 'Merge Two Sorted Lists',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    difficulty: 'easy',
    topics: ['Linked List'],
  },
  {
    title: 'Linked List Cycle',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/linked-list-cycle/',
    difficulty: 'easy',
    topics: ['Linked List', 'Two Pointer'],
  },
  {
    title: 'LRU Cache',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/lru-cache/',
    difficulty: 'medium',
    topics: ['Hash Table', 'Linked List'],
  },
  {
    title: 'Merge k Sorted Lists',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    difficulty: 'hard',
    topics: ['Linked List', 'Heap'],
  },

  // Trees & BST
  {
    title: 'Maximum Depth of Binary Tree',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    difficulty: 'easy',
    topics: ['Tree', 'Binary Tree', 'DFS'],
  },
  {
    title: 'Invert Binary Tree',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/invert-binary-tree/',
    difficulty: 'easy',
    topics: ['Tree', 'Binary Tree'],
  },
  {
    title: 'Validate Binary Search Tree',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/validate-binary-search-tree/',
    difficulty: 'medium',
    topics: ['Tree', 'BST', 'DFS'],
  },
  {
    title: 'Lowest Common Ancestor of a BST',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
    difficulty: 'medium',
    topics: ['Tree', 'BST'],
  },
  {
    title: 'Binary Tree Maximum Path Sum',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
    difficulty: 'hard',
    topics: ['Tree', 'Binary Tree', 'Dynamic Programming', 'DFS'],
  },

  // Graphs
  {
    title: 'Number of Islands',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/number-of-islands/',
    difficulty: 'medium',
    topics: ['Graph', 'BFS', 'DFS'],
  },
  {
    title: 'Clone Graph',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/clone-graph/',
    difficulty: 'medium',
    topics: ['Graph', 'BFS', 'DFS', 'Hash Table'],
  },
  {
    title: 'Course Schedule',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/course-schedule/',
    difficulty: 'medium',
    topics: ['Graph', 'BFS', 'DFS'],
  },
  {
    title: 'Word Ladder',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/word-ladder/',
    difficulty: 'hard',
    topics: ['Graph', 'BFS', 'Hash Table'],
  },

  // Dynamic Programming
  {
    title: 'Climbing Stairs',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/climbing-stairs/',
    difficulty: 'easy',
    topics: ['Dynamic Programming'],
  },
  {
    title: 'Coin Change',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/coin-change/',
    difficulty: 'medium',
    topics: ['Dynamic Programming', 'BFS'],
  },
  {
    title: 'Longest Increasing Subsequence',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    difficulty: 'medium',
    topics: ['Array', 'Binary Search', 'Dynamic Programming'],
  },
  {
    title: '0-1 Knapsack Problem',
    platform: 'gfg',
    link: 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/',
    difficulty: 'medium',
    topics: ['Dynamic Programming'],
  },
  {
    title: 'Edit Distance',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/edit-distance/',
    difficulty: 'hard',
    topics: ['Dynamic Programming'],
  },
];

// Helper to compute ISO timestamp offset by days in past
const daysAgo = (days, hour = 14, minute = 30) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
};

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ Error: MONGO_URI is not defined in server/.env');
    process.exit(1);
  }

  console.log('--- STARTING DEMO DATA SEEDING ---');
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB Atlas');

  // 1. Safety Isolation: Clean up only previous demo user data
  const existingUser = await User.findOne({ email: DEMO_USER.email });
  if (existingUser) {
    console.log(`Cleaning up existing demo user (${DEMO_USER.email})...`);
    await Attempt.deleteMany({ userId: existingUser._id });
    await Problem.deleteMany({ userId: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
    console.log('✅ Cleaned up old demo data cleanly.');
  }

  // 2. Create Demo User
  console.log(`Creating demo user: ${DEMO_USER.name} <${DEMO_USER.email}>...`);
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(DEMO_USER.password, salt);

  const user = await User.create({
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    passwordHash,
  });
  console.log(`✅ Demo user created with ID: ${user._id}`);

  // 3. Create Problems
  console.log(`Creating ${DEMO_PROBLEMS.length} problem records...`);
  const problemDocs = [];
  for (const p of DEMO_PROBLEMS) {
    const doc = await Problem.create({
      ...p,
      userId: user._id,
      createdAt: daysAgo(75),
    });
    problemDocs.push(doc);
  }
  console.log(`✅ Created ${problemDocs.length} problems.`);

  // Map problems by title for easy attempt targeting
  const pMap = {};
  problemDocs.forEach((p) => {
    pMap[p.title] = p;
  });

  // 4. Create 68 Practice Attempts spread across 90 days
  // Believable distribution with multi-attempts, struggles in DP & Graph, and urgent revision items.
  const attemptsToInsert = [
    // Problem 1: Two Sum (2 attempts: solved long ago, solved again recently)
    { p: 'Two Sum', status: 'solved', time: 15, notes: 'Brute force approach O(N^2)', date: daysAgo(70, 10, 0) },
    { p: 'Two Sum', status: 'solved', time: 8, notes: 'Optimal one-pass hash map O(N)', date: daysAgo(3, 11, 0) },

    // Problem 2: Best Time to Buy and Sell Stock (2 attempts)
    { p: 'Best Time to Buy and Sell Stock', status: 'solved', time: 12, notes: 'Single pass tracking minimum price', date: daysAgo(68, 14, 0) },
    { p: 'Best Time to Buy and Sell Stock', status: 'solved', time: 7, notes: 'Quick recall; easy kadane variant', date: daysAgo(18, 16, 0) },

    // Problem 3: Contains Duplicate (1 attempt)
    { p: 'Contains Duplicate', status: 'solved', time: 5, notes: 'Used HashSet for O(N) lookup', date: daysAgo(65, 10, 0) },

    // Problem 4: Product of Array Except Self (2 attempts: struggled first, then solved)
    { p: 'Product of Array Except Self', status: 'struggled', time: 45, notes: 'Attempted with division operator; struggled with O(1) space requirement', date: daysAgo(55, 15, 0) },
    { p: 'Product of Array Except Self', status: 'solved', time: 25, notes: 'Prefix and suffix product passes cleanly implemented', date: daysAgo(12, 17, 0) },

    // Problem 5: Maximum Subarray (2 attempts)
    { p: 'Maximum Subarray (Kadane\'s)', status: 'solved', time: 20, notes: 'Standard Kadanes algorithm implementation', date: daysAgo(50, 11, 0) },
    { p: 'Maximum Subarray (Kadane\'s)', status: 'solved', time: 10, notes: 'Fast recall on DP state transitions', date: daysAgo(14, 18, 0) },

    // Problem 6: Subarray Sum Equals K (3 attempts: revisit needed, struggled, latest struggled)
    { p: 'Subarray Sum Equals K', status: 'struggled', time: 40, notes: 'Prefix sum hashmap logic missed the initial sum 0 condition', date: daysAgo(42, 14, 0) },
    { p: 'Subarray Sum Equals K', status: 'revisit_needed', time: 30, notes: 'Got the prefix frequency map right but slow to formulate', date: daysAgo(20, 15, 0) },
    { p: 'Subarray Sum Equals K', status: 'struggled', time: 35, notes: 'Struggled with negative numbers edge case in prefix sum array', date: daysAgo(2, 19, 0) },

    // Problem 7: Valid Palindrome (1 attempt)
    { p: 'Valid Palindrome', status: 'solved', time: 10, notes: 'Two pointer inward traversal skipping non-alphanumeric', date: daysAgo(60, 12, 0) },

    // Problem 8: 3Sum (3 attempts: struggled, revisit, solved)
    { p: '3Sum', status: 'struggled', time: 45, notes: 'Struggled with skipping duplicate triplets', date: daysAgo(52, 16, 0) },
    { p: '3Sum', status: 'revisit_needed', time: 35, notes: 'Sorted array + two pointers, still missed second duplicate skip', date: daysAgo(28, 14, 0) },
    { p: '3Sum', status: 'solved', time: 22, notes: 'Clean two-pointer implementation with duplicates properly skipped', date: daysAgo(8, 11, 0) },

    // Problem 9: Container With Most Water (2 attempts)
    { p: 'Container With Most Water', status: 'solved', time: 18, notes: 'Two pointers greedy shrinking from both ends', date: daysAgo(48, 15, 0) },
    { p: 'Container With Most Water', status: 'solved', time: 10, notes: 'Quick recall of moving shorter pointer', date: daysAgo(10, 16, 0) },

    // Problem 10: Longest Substring Without Repeating Characters (2 attempts)
    { p: 'Longest Substring Without Repeating Characters', status: 'revisit_needed', time: 35, notes: 'Sliding window with map, off-by-one index update bug', date: daysAgo(45, 10, 0) },
    { p: 'Longest Substring Without Repeating Characters', status: 'solved', time: 18, notes: 'Sliding window tracking last seen index', date: daysAgo(7, 12, 0) },

    // Problem 11: Minimum Window Substring (2 attempts: struggled)
    { p: 'Minimum Window Substring', status: 'struggled', time: 55, notes: 'Complex two-pointer expansion and contraction logic', date: daysAgo(35, 14, 0) },
    { p: 'Minimum Window Substring', status: 'struggled', time: 50, notes: 'Character frequency matching edge cases caused multiple failed tests', date: daysAgo(1, 18, 0) },

    // Problem 12: Trapping Rain Water (2 attempts: revisit needed)
    { p: 'Trapping Rain Water', status: 'struggled', time: 50, notes: 'Tried monotonic stack; confused left/right bound heights', date: daysAgo(38, 16, 0) },
    { p: 'Trapping Rain Water', status: 'revisit_needed', time: 32, notes: 'Two pointer approach with leftMax and rightMax works cleaner', date: daysAgo(4, 15, 0) },

    // Problem 13: Binary Search (1 attempt)
    { p: 'Binary Search', status: 'solved', time: 5, notes: 'Basic iterative binary search with mid calculation', date: daysAgo(62, 11, 0) },

    // Problem 14: Search in Rotated Sorted Array (2 attempts)
    { p: 'Search in Rotated Sorted Array', status: 'revisit_needed', time: 30, notes: 'Determining which half is sorted had boundary condition bug', date: daysAgo(40, 13, 0) },
    { p: 'Search in Rotated Sorted Array', status: 'solved', time: 18, notes: 'Checked sorted half first, then binary search', date: daysAgo(11, 14, 0) },

    // Problem 15: Find Minimum in Rotated Sorted Array (2 attempts)
    { p: 'Find Minimum in Rotated Sorted Array', status: 'solved', time: 15, notes: 'Compared nums[mid] with nums[right]', date: daysAgo(41, 17, 0) },
    { p: 'Find Minimum in Rotated Sorted Array', status: 'solved', time: 8, notes: 'Quick recall', date: daysAgo(15, 10, 0) },

    // Problem 16: Median of Two Sorted Arrays (2 attempts: struggled)
    { p: 'Median of Two Sorted Arrays', status: 'struggled', time: 60, notes: 'Binary search on smaller array partitions is very tricky', date: daysAgo(32, 15, 0) },
    { p: 'Median of Two Sorted Arrays', status: 'struggled', time: 55, notes: 'Odd vs even total length partition handling took too long', date: daysAgo(3, 14, 0) },

    // Problem 17: Reverse Linked List (2 attempts)
    { p: 'Reverse Linked List', status: 'solved', time: 10, notes: 'Iterative 3-pointer swap (prev, curr, next)', date: daysAgo(58, 9, 0) },
    { p: 'Reverse Linked List', status: 'solved', time: 5, notes: 'Solved recursively in under 5 minutes', date: daysAgo(22, 10, 0) },

    // Problem 18: Merge Two Sorted Lists (1 attempt)
    { p: 'Merge Two Sorted Lists', status: 'solved', time: 8, notes: 'Dummy head pointer technique', date: daysAgo(56, 14, 0) },

    // Problem 19: Linked List Cycle (1 attempt)
    { p: 'Linked List Cycle', status: 'solved', time: 6, notes: 'Floyd cycle detection (fast and slow pointer)', date: daysAgo(54, 11, 0) },

    // Problem 20: LRU Cache (3 attempts)
    { p: 'LRU Cache', status: 'struggled', time: 50, notes: 'Doubly linked list pointer updates had memory leaks', date: daysAgo(36, 17, 0) },
    { p: 'LRU Cache', status: 'revisit_needed', time: 35, notes: 'Used dummy head and tail nodes to simplify insertions', date: daysAgo(19, 13, 0) },
    { p: 'LRU Cache', status: 'solved', time: 24, notes: 'Hashmap + Doubly Linked List implemented cleanly', date: daysAgo(5, 12, 0) },

    // Problem 21: Merge k Sorted Lists (2 attempts)
    { p: 'Merge k Sorted Lists', status: 'struggled', time: 45, notes: 'PriorityQueue comparator syntax in JavaScript', date: daysAgo(34, 16, 0) },
    { p: 'Merge k Sorted Lists', status: 'revisit_needed', time: 28, notes: 'Divide and conquer list merging is cleaner than min-heap', date: daysAgo(6, 14, 0) },

    // Problem 22: Maximum Depth of Binary Tree (1 attempt)
    { p: 'Maximum Depth of Binary Tree', status: 'solved', time: 5, notes: 'Simple DFS recursion (1 + max(left, right))', date: daysAgo(48, 10, 0) },

    // Problem 23: Invert Binary Tree (1 attempt)
    { p: 'Invert Binary Tree', status: 'solved', time: 5, notes: 'Recursive swap of left and right child subtrees', date: daysAgo(47, 11, 0) },

    // Problem 24: Validate Binary Search Tree (2 attempts)
    { p: 'Validate Binary Search Tree', status: 'revisit_needed', time: 25, notes: 'Must carry min and max bounds down recursion, not just local parent', date: daysAgo(30, 15, 0) },
    { p: 'Validate Binary Search Tree', status: 'solved', time: 14, notes: 'Inorder traversal check (prev < curr)', date: daysAgo(9, 16, 0) },

    // Problem 25: Lowest Common Ancestor of a BST (1 attempt)
    { p: 'Lowest Common Ancestor of a BST', status: 'solved', time: 12, notes: 'Leveraged BST property: split point is LCA', date: daysAgo(29, 10, 0) },

    // Problem 26: Binary Tree Maximum Path Sum (2 attempts: struggled)
    { p: 'Binary Tree Maximum Path Sum', status: 'struggled', time: 50, notes: 'Postorder traversal; returning one branch vs updating global max', date: daysAgo(25, 17, 0) },
    { p: 'Binary Tree Maximum Path Sum', status: 'struggled', time: 42, notes: 'Handling negative branch sums by ignoring them (Math.max(0, val))', date: daysAgo(4, 18, 0) },

    // Problem 27: Number of Islands (2 attempts)
    { p: 'Number of Islands', status: 'solved', time: 22, notes: 'BFS queue-based traversal marking visited in-place', date: daysAgo(27, 11, 0) },
    { p: 'Number of Islands', status: 'solved', time: 14, notes: 'DFS recursive grid traversal', date: daysAgo(13, 15, 0) },

    // Problem 28: Clone Graph (3 attempts)
    { p: 'Clone Graph', status: 'struggled', time: 45, notes: 'Cycle in graph caused infinite recursion stack overflow', date: daysAgo(33, 14, 0) },
    { p: 'Clone Graph', status: 'revisit_needed', time: 30, notes: 'Map old node to new node before traversing neighbors', date: daysAgo(16, 17, 0) },
    { p: 'Clone Graph', status: 'solved', time: 20, notes: 'BFS with hash map visited tracking', date: daysAgo(5, 16, 0) },

    // Problem 29: Course Schedule (3 attempts: struggled)
    { p: 'Course Schedule', status: 'struggled', time: 45, notes: 'Kahns algorithm indegree array setup', date: daysAgo(31, 12, 0) },
    { p: 'Course Schedule', status: 'struggled', time: 40, notes: 'DFS cycle detection using 3-color states (unvisited, visiting, visited)', date: daysAgo(17, 13, 0) },
    { p: 'Course Schedule', status: 'revisit_needed', time: 30, notes: 'Indegree topological sort worked, but took 30 mins to write', date: daysAgo(2, 16, 0) },

    // Problem 30: Word Ladder (2 attempts: struggled)
    { p: 'Word Ladder', status: 'struggled', time: 55, notes: 'Bidirectional BFS vs Standard BFS state generation', date: daysAgo(21, 18, 0) },
    { p: 'Word Ladder', status: 'struggled', time: 48, notes: 'Generating next words took O(26 * L), hit time limit initially', date: daysAgo(1, 14, 0) },

    // Problem 31: Climbing Stairs (2 attempts)
    { p: 'Climbing Stairs', status: 'solved', time: 8, notes: 'Fibonacci DP sequence', date: daysAgo(44, 10, 0) },
    { p: 'Climbing Stairs', status: 'solved', time: 4, notes: 'Space optimized O(1) two variables', date: daysAgo(20, 11, 0) },

    // Problem 32: Coin Change (3 attempts: struggled)
    { p: 'Coin Change', status: 'struggled', time: 45, notes: 'Greedy approach failed; realized unbounded knapsack DP needed', date: daysAgo(26, 14, 0) },
    { p: 'Coin Change', status: 'revisit_needed', time: 35, notes: '1D DP array initialized to Infinity, off-by-one base case', date: daysAgo(15, 12, 0) },
    { p: 'Coin Change', status: 'struggled', time: 30, notes: 'Struggled to optimize bottom-up inner loop', date: daysAgo(3, 17, 0) },

    // Problem 33: Longest Increasing Subsequence (2 attempts: struggled)
    { p: 'Longest Increasing Subsequence', status: 'struggled', time: 45, notes: 'O(N^2) DP was slow; struggled with O(N log N) patience sort', date: daysAgo(24, 15, 0) },
    { p: 'Longest Increasing Subsequence', status: 'revisit_needed', time: 32, notes: 'Implemented tails array with binary search (bisect_left)', date: daysAgo(6, 11, 0) },

    // Problem 34: 0-1 Knapsack Problem (2 attempts)
    { p: '0-1 Knapsack Problem', status: 'struggled', time: 40, notes: '2D DP table formulation, weight vs value indexing', date: daysAgo(23, 16, 0) },
    { p: '0-1 Knapsack Problem', status: 'solved', time: 25, notes: 'Space-optimized 1D reverse iteration from W down to weight[i]', date: daysAgo(7, 15, 0) },

    // Problem 35: Edit Distance (2 attempts: struggled)
    { p: 'Edit Distance', status: 'struggled', time: 55, notes: 'Insertion, deletion, replacement DP matrix transitions', date: daysAgo(18, 14, 0) },
    { p: 'Edit Distance', status: 'struggled', time: 45, notes: 'Boundary initialization for empty string prefixes', date: daysAgo(1, 17, 0) },
  ];

  console.log(`Inserting ${attemptsToInsert.length} practice attempts across historical timeline...`);

  // To demonstrate that latest attempt logic uses attemptedAt and NOT insertion order,
  // we intentionally shuffle / reverse some attempts before inserting into MongoDB!
  const shuffledAttempts = [...attemptsToInsert].reverse();

  let insertedCount = 0;
  for (const item of shuffledAttempts) {
    const prob = pMap[item.p];
    if (!prob) {
      console.warn(`Problem not found for attempt: ${item.p}`);
      continue;
    }

    await Attempt.create({
      problemId: prob._id,
      userId: user._id,
      status: item.status,
      timeTakenMinutes: item.time,
      notes: item.notes,
      attemptedAt: item.date,
    });
    insertedCount++;
  }

  console.log(`✅ Successfully inserted ${insertedCount} practice attempts.`);

  // 5. Summary Statistics Calculation for Reporting
  const totalProblems = problemDocs.length;
  const totalAttempts = insertedCount;
  const solvedAttempts = attemptsToInsert.filter((a) => a.status === 'solved').length;
  const struggledAttempts = attemptsToInsert.filter((a) => a.status === 'struggled').length;
  const revisitAttempts = attemptsToInsert.filter((a) => a.status === 'revisit_needed').length;

  console.log('\n==================================================');
  console.log('🎉 DEMO DATA SEEDING COMPLETE');
  console.log('==================================================');
  console.log(`👤 User Account:       ${DEMO_USER.email}`);
  console.log(`🔑 Demo Password:      ${DEMO_USER.password}`);
  console.log(`📚 Total Problems:     ${totalProblems}`);
  console.log(`📝 Total Attempts:     ${totalAttempts}`);
  console.log(`   - Solved:           ${solvedAttempts}`);
  console.log(`   - Struggled:        ${struggledAttempts}`);
  console.log(`   - Revisit Needed:   ${revisitAttempts}`);
  console.log('📅 Timeline Range:     Past 70 days (rich heatmap & trend)');
  console.log('==================================================\n');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Done.');
}

seed().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
