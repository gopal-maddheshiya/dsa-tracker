/**
 * client/src/data/demoData.js
 *
 * Pure static deterministic frontend demo dataset for guest mode.
 * - Zero HTTP/network requests.
 * - Zero localStorage mutation.
 * - Zero database writes.
 * - 100% isolated, realistic, internally consistent DSA practice telemetry.
 */

export const DEMO_USER = {
  id: 'demo-coder',
  _id: 'demo-coder',
  name: 'Demo Coder',
  email: 'guest@dsa-tracker.local',
  role: 'guest',
};

// ── Summary Telemetry ───────────────────────────────────────────────
export const DEMO_SUMMARY = {
  totalProblems: 399,
  catalogProblems: 399,
  solvedProblems: 182,
  totalAttempts: 248,
  currentStreak: 5,
  difficultyBreakdown: [
    { difficulty: 'easy', solved: 68, total: 110 },
    { difficulty: 'medium', solved: 92, total: 215 },
    { difficulty: 'hard', solved: 22, total: 74 },
  ],
};

// ── Daily Deliberate Focus & Recommendations ────────────────────────
export const DEMO_RECOMMENDATIONS = {
  dailyFocus: {
    id: 'demo-p-1',
    _id: 'demo-p-1',
    title: 'Subarray Sum Equals K',
    difficulty: 'medium',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    topics: ['Hash Table', 'Prefix Sum'],
    rationale: 'Prioritized based on your forgetting curve interval to solidify algorithmic pattern retention.',
    status: 'struggled',
    revisionCount: 2,
    lastPracticed: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date().toISOString(),
  },
  weakestTopics: [
    { topic: 'Dynamic Programming', struggleRatio: 0.65, count: 14 },
    { topic: 'Graph', struggleRatio: 0.58, count: 18 },
    { topic: 'BFS', struggleRatio: 0.58, count: 12 },
    { topic: 'Sliding Window', struggleRatio: 0.45, count: 9 },
  ],
};

// ── Pre-Computed Cognitive AI Hint for Demo Focus ───────────────────
export const DEMO_AI_COACH = {
  summary: 'Prefix sum hash map pattern: maintain running cumulative sum and check if (currentSum - k) exists in the hash table to achieve O(N) time and O(N) space.',
  takeaway: 'Prefix sum hash map pattern: maintain running cumulative sum and query frequency of (currentSum - k) in O(1).',
  hints: [
    'Base Case: Initialize map with {0: 1} to handle valid subarrays that start at index 0.',
    'Frequency Map: Maintain counts rather than indices because multiple prefix sums can match (sum - k).',
    'Negative Numbers: Standard two-pointer sliding window fails when negatives exist; prefix sum hash table remains strictly optimal.',
  ],
};

// ── Spaced Repetition Due Queue ─────────────────────────────────────
export const DEMO_REVISION_QUEUE = [
  {
    problemId: 'demo-p-1',
    id: 'demo-p-1',
    _id: 'demo-p-1',
    title: 'Subarray Sum Equals K',
    difficulty: 'medium',
    platform: 'leetcode',
    topics: ['Hash Table', 'Prefix Sum'],
    nextRevisionDate: new Date().toISOString(),
    stage: 2,
    status: 'struggled',
  },
  {
    problemId: 'demo-p-2',
    id: 'demo-p-2',
    _id: 'demo-p-2',
    title: 'Course Schedule II',
    difficulty: 'medium',
    platform: 'leetcode',
    topics: ['Graph', 'Topological Sort'],
    nextRevisionDate: new Date().toISOString(),
    stage: 1,
    status: 'struggled',
  },
  {
    problemId: 'demo-p-3',
    id: 'demo-p-3',
    _id: 'demo-p-3',
    title: 'Minimum Window Substring',
    difficulty: 'hard',
    platform: 'leetcode',
    topics: ['Hash Table', 'Sliding Window'],
    nextRevisionDate: new Date().toISOString(),
    stage: 3,
    status: 'struggled',
  },
  {
    problemId: 'demo-p-4',
    id: 'demo-p-4',
    _id: 'demo-p-4',
    title: 'Word Ladder',
    difficulty: 'hard',
    platform: 'leetcode',
    topics: ['Graph', 'BFS'],
    nextRevisionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    stage: 2,
    status: 'revisit_needed',
  },
  {
    problemId: 'demo-p-5',
    id: 'demo-p-5',
    _id: 'demo-p-5',
    title: 'Merge k Sorted Lists',
    difficulty: 'hard',
    platform: 'leetcode',
    topics: ['Linked List', 'Heap'],
    nextRevisionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    stage: 2,
    status: 'solved',
  },
  {
    problemId: 'demo-p-6',
    id: 'demo-p-6',
    _id: 'demo-p-6',
    title: 'Longest Increasing Subsequence',
    difficulty: 'medium',
    platform: 'leetcode',
    topics: ['Dynamic Programming', 'Binary Search'],
    nextRevisionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    stage: 4,
    status: 'solved',
  },
];

// ── Top Algorithmic Bottlenecks ─────────────────────────────────────
export const DEMO_TOPICS = [
  { topic: 'BFS', struggleRatio: 0.58, totalAttempts: 18, failureRate: 0.58 },
  { topic: 'Graph', struggleRatio: 0.58, totalAttempts: 14, failureRate: 0.58 },
  { topic: 'Hash Table', struggleRatio: 0.48, totalAttempts: 20, failureRate: 0.48 },
  { topic: 'DFS', struggleRatio: 0.38, totalAttempts: 16, failureRate: 0.38 },
  { topic: 'Prefix Sum', struggleRatio: 0.38, totalAttempts: 8, failureRate: 0.38 },
];

// ── 52-Week Practice Heatmap Dataset ────────────────────────────────
export const DEMO_HEATMAP = (() => {
  const result = [];
  const now = new Date();
  // 52 weeks = 364 days
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday

    // Generate realistic practice clusters
    let count = 0;
    const weekIndex = Math.floor((364 - i) / 7);
    if (weekIndex > 30) {
      // Recent weeks have consistent momentum
      if (dayOfWeek !== 0) {
        count = (i % 3 === 0) ? 3 : (i % 2 === 0) ? 2 : 1;
      }
    } else if (weekIndex > 15) {
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        count = (i % 4 === 0) ? 2 : 1;
      }
    } else {
      if (i % 5 === 0) count = 1;
    }

    if (count > 0) {
      result.push({
        date: dateStr,
        count,
        level: Math.min(4, count),
      });
    }
  }
  return result;
})();

// ── Demo Curated Problems Catalog ───────────────────────────────────
export const DEMO_PROBLEMS = [
  {
    _id: 'demo-p-1',
    id: 'demo-p-1',
    title: 'Subarray Sum Equals K',
    difficulty: 'medium',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    topics: ['Hash Table', 'Prefix Sum'],
    status: 'struggled',
    attemptsCount: 3,
    lastPracticed: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date().toISOString(),
    description: 'Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.',
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2' },
      { input: 'nums = [1,2,3], k = 3', output: '2' },
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    solutionCode: `class Solution {
    public int subarraySum(int[] nums, int k) {
        int count = 0, sum = 0;
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1);
        
        for (int num : nums) {
            sum += num;
            if (map.containsKey(sum - k)) {
                count += map.get(sum - k);
            }
            map.put(sum, map.getOrDefault(sum, 0) + 1);
        }
        return count;
    }
}`,
    notes: 'Key realization: Use prefix sum hash table to record frequency of sums seen so far. Remember to initialize map.put(0, 1).',
  },
  {
    _id: 'demo-p-2',
    id: 'demo-p-2',
    title: 'Course Schedule II',
    difficulty: 'medium',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/course-schedule-ii/',
    topics: ['Graph', 'Topological Sort', 'BFS'],
    status: 'struggled',
    attemptsCount: 2,
    lastPracticed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date().toISOString(),
    description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. Return the ordering of courses you should take to finish all courses.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    solutionCode: `class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
        int[] inDegree = new int[numCourses];
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        
        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            inDegree[p[0]]++;
        }
        
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) {
            if (inDegree[i] == 0) q.offer(i);
        }
        
        int[] order = new int[numCourses];
        int idx = 0;
        while (!q.isEmpty()) {
            int curr = q.poll();
            order[idx++] = curr;
            for (int neighbor : adj.get(curr)) {
                if (--inDegree[neighbor] == 0) {
                    q.offer(neighbor);
                }
            }
        }
        return idx == numCourses ? order : new int[0];
    }
}`,
    notes: 'Kahn\'s algorithm for topological sorting using in-degrees array and queue.',
  },
  {
    _id: 'demo-p-3',
    id: 'demo-p-3',
    title: 'Minimum Window Substring',
    difficulty: 'hard',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/minimum-window-substring/',
    topics: ['Hash Table', 'Sliding Window', 'String'],
    status: 'struggled',
    attemptsCount: 4,
    lastPracticed: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date().toISOString(),
    description: 'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.',
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(1)',
    solutionCode: `class Solution {
    public String minWindow(String s, String t) {
        if (s.length() < t.length()) return "";
        int[] map = new int[128];
        for (char c : t.toCharArray()) map[c]++;
        
        int start = 0, minStart = 0, minLen = Integer.MAX_VALUE;
        int count = t.length();
        
        for (int end = 0; end < s.length(); end++) {
            if (map[s.charAt(end)]-- > 0) count--;
            
            while (count == 0) {
                if (end - start + 1 < minLen) {
                    minLen = end - start + 1;
                    minStart = start;
                }
                if (++map[s.charAt(start++)] > 0) count++;
            }
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(minStart, minStart + minLen);
    }
}`,
    notes: 'Template sliding window with two pointers and frequency table. Expand right pointer to satisfy condition, shrink left pointer to minimize.',
  },
  {
    _id: 'demo-p-4',
    id: 'demo-p-4',
    title: 'Word Ladder',
    difficulty: 'hard',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/word-ladder/',
    topics: ['Graph', 'BFS', 'Hash Table'],
    status: 'revisit_needed',
    attemptsCount: 2,
    lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    description: 'A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words such that adjacent words differ by exactly one letter.',
    timeComplexity: 'O(M^2 * N)',
    spaceComplexity: 'O(M^2 * N)',
  },
  {
    _id: 'demo-p-5',
    id: 'demo-p-5',
    title: 'Merge k Sorted Lists',
    difficulty: 'hard',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    topics: ['Linked List', 'Heap', 'Divide and Conquer'],
    status: 'solved',
    attemptsCount: 3,
    lastPracticed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    timeComplexity: 'O(N log k)',
    spaceComplexity: 'O(k)',
  },
  {
    _id: 'demo-p-6',
    id: 'demo-p-6',
    title: 'Longest Increasing Subsequence',
    difficulty: 'medium',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    topics: ['Dynamic Programming', 'Binary Search'],
    status: 'solved',
    attemptsCount: 2,
    lastPracticed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
  },
  {
    _id: 'demo-p-7',
    id: 'demo-p-7',
    title: 'Two Sum',
    difficulty: 'easy',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/two-sum/',
    topics: ['Array', 'Hash Table'],
    status: 'solved',
    attemptsCount: 1,
    lastPracticed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },
  {
    _id: 'demo-p-8',
    id: 'demo-p-8',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/valid-parentheses/',
    topics: ['Stack', 'String'],
    status: 'solved',
    attemptsCount: 1,
    lastPracticed: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },
  {
    _id: 'demo-p-9',
    id: 'demo-p-9',
    title: 'Invert Binary Tree',
    difficulty: 'easy',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/invert-binary-tree/',
    topics: ['Tree', 'Recursion', 'DFS'],
    status: 'solved',
    attemptsCount: 1,
    lastPracticed: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },
  {
    _id: 'demo-p-10',
    id: 'demo-p-10',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    platform: 'leetcode',
    problemUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    topics: ['Array', 'Two Pointers', 'Stack'],
    status: 'struggled',
    attemptsCount: 3,
    lastPracticed: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date().toISOString(),
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },
];

/**
 * Returns a demo problem by ID or fallback to the primary focus
 */
export const getDemoProblemById = (id) => {
  return DEMO_PROBLEMS.find((p) => p._id === id || p.id === id) || null;
};
