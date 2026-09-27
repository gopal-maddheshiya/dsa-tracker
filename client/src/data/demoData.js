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
  totalProblems: 10,
  catalogProblems: 10,
  solvedProblems: 5,
  totalAttempts: 22,
  currentStreak: 5,
  difficultyBreakdown: [
    { difficulty: 'easy', solved: 3, total: 3 },
    { difficulty: 'medium', solved: 1, total: 3 },
    { difficulty: 'hard', solved: 1, total: 4 },
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

// ── Pre-Computed 7-Day Cognitive Retrospective for Demo ─────────────
export const DEMO_WEEKLY_REVIEW = {
  source: 'demo',
  headline: 'Solid 5-Day Practice Rhythm: Hash Tables Solidified, DP Invariants Need Focus',
  weeklySummary: 'You completed 22 attempts across 10 problems this week, sustaining a 5-day active streak. Recall intervals for Prefix Sum and Sliding Window are stabilizing, while Dynamic Programming state transitions remain your highest-friction hurdle.',
  strongestSignal: 'Zero regression on Hash Table prefix sum lookups across 3 consecutive timed recall attempts.',
  biggestGap: 'Repeated friction formulating 2D recurrence relations under timed 25-minute test pressure.',
  recommendedFocus: 'Practice manual state-transition tracing for 1D/2D DP before jumping into code editor.',
  actionPlan: [
    {
      action: 'Trace DP state table on paper for Coin Change & Subarray Sum',
      reason: 'Directly validates base case handling and boundary conditions before implementation.',
      minutes: 20,
    },
    {
      action: 'Solve 1 Medium Spaced Revision item (Subarray Sum Equals K) without IDE autocompletion',
      reason: 'Reinforces prefix frequency map invariant under deliberate interview conditions.',
      minutes: 25,
    },
    {
      action: 'Complete 1 timed Sliding Window variation (Minimum Window Substring)',
      reason: 'Sharpens window expansion/shrinkage edge condition composure.',
      minutes: 30,
    },
  ],
  encouragement: 'Your active streak is building compounding pattern intuition. Keep deliberate friction high.',
  sampleSize: {
    dataConfidence: 'high',
    isLowSample: false,
  },
  topicEvidence: {
    strongest: { topic: 'Hash Table', solved: 4, attempts: 5, evidenceLevel: 'high' },
    weakest: { topic: 'Dynamic Programming', struggled: 3, attempts: 4, evidenceLevel: 'high' },
  },
};

// ── Spaced Repetition Due Queue ─────────────────────────────────────
export const DEMO_REVISION_QUEUE = [
  {
    problemId: 'demo-p-3',
    id: 'demo-p-3',
    _id: 'demo-p-3',
    title: 'Minimum Window Substring',
    difficulty: 'hard',
    platform: 'leetcode',
    topics: ['Hash Table', 'Sliding Window', 'String'],
    link: 'https://leetcode.com/problems/minimum-window-substring/',
    nextRevisionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceLastAttempt: 12,
    priorityScore: 8.00,
    latestStatus: 'struggled',
    lastAttemptStatus: 'struggled',
    stage: 3,
    status: 'struggled',
  },
  {
    problemId: 'demo-p-1',
    id: 'demo-p-1',
    _id: 'demo-p-1',
    title: 'Subarray Sum Equals K',
    difficulty: 'medium',
    platform: 'leetcode',
    topics: ['Hash Table', 'Prefix Sum'],
    link: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    nextRevisionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceLastAttempt: 8,
    priorityScore: 6.00,
    latestStatus: 'struggled',
    lastAttemptStatus: 'struggled',
    stage: 2,
    status: 'struggled',
  },
  {
    problemId: 'demo-p-10',
    id: 'demo-p-10',
    _id: 'demo-p-10',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    platform: 'leetcode',
    topics: ['Array', 'Two Pointers', 'Stack'],
    link: 'https://leetcode.com/problems/trapping-rain-water/',
    nextRevisionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceLastAttempt: 6,
    priorityScore: 5.00,
    latestStatus: 'struggled',
    lastAttemptStatus: 'struggled',
    stage: 1,
    status: 'struggled',
  },
  {
    problemId: 'demo-p-2',
    id: 'demo-p-2',
    _id: 'demo-p-2',
    title: 'Course Schedule II',
    difficulty: 'medium',
    platform: 'leetcode',
    topics: ['Graph', 'Topological Sort', 'BFS'],
    link: 'https://leetcode.com/problems/course-schedule-ii/',
    nextRevisionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceLastAttempt: 5,
    priorityScore: 4.50,
    latestStatus: 'struggled',
    lastAttemptStatus: 'struggled',
    stage: 1,
    status: 'struggled',
  },
  {
    problemId: 'demo-p-4',
    id: 'demo-p-4',
    _id: 'demo-p-4',
    title: 'Word Ladder',
    difficulty: 'hard',
    platform: 'leetcode',
    topics: ['Graph', 'BFS', 'Hash Table'],
    link: 'https://leetcode.com/problems/word-ladder/',
    nextRevisionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceLastAttempt: 3,
    priorityScore: 1.60,
    latestStatus: 'revisit_needed',
    lastAttemptStatus: 'revisit_needed',
    stage: 2,
    status: 'revisit_needed',
  },
  {
    problemId: 'demo-p-6',
    id: 'demo-p-6',
    _id: 'demo-p-6',
    title: 'Longest Increasing Subsequence',
    difficulty: 'medium',
    platform: 'leetcode',
    topics: ['Dynamic Programming', 'Binary Search'],
    link: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    nextRevisionDate: new Date().toISOString(),
    daysSinceLastAttempt: 14,
    priorityScore: 1.00,
    latestStatus: 'solved',
    lastAttemptStatus: 'solved',
    stage: 4,
    status: 'solved',
  },
  {
    problemId: 'demo-p-5',
    id: 'demo-p-5',
    _id: 'demo-p-5',
    title: 'Merge k Sorted Lists',
    difficulty: 'hard',
    platform: 'leetcode',
    topics: ['Linked List', 'Heap', 'Divide and Conquer'],
    link: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    nextRevisionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceLastAttempt: 4,
    priorityScore: 0.29,
    latestStatus: 'solved',
    lastAttemptStatus: 'solved',
    stage: 2,
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
    link: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    problemUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    topics: ['Hash Table', 'Prefix Sum'],
    status: 'struggled',
    latestAttempt: {
      status: 'struggled',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 3,
    attemptCount: 3,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    attempts: [
      {
        _id: 'att-1-3',
        id: 'att-1-3',
        status: 'struggled',
        timeTakenMinutes: 25,
        attemptedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Prefix Sum + Hash Map',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        notes: 'Got correct O(N) solution with frequency hash map. Initialized map with (0, 1). Negative numbers require map counts rather than two-pointer sliding window.',
      },
      {
        _id: 'att-1-2',
        id: 'att-1-2',
        status: 'revisit_needed',
        timeTakenMinutes: 38,
        attemptedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Prefix Sum without Hash Map',
        timeComplexity: 'O(N^2)',
        spaceComplexity: 'O(N)',
        notes: 'Constructed prefix sum array and tested all subarray pairs in O(N^2). Realized hash map can query (sum - k) in O(1).',
      },
      {
        _id: 'att-1-1',
        id: 'att-1-1',
        status: 'struggled',
        timeTakenMinutes: 45,
        attemptedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Brute Force Subarrays',
        timeComplexity: 'O(N^2)',
        spaceComplexity: 'O(1)',
        notes: 'Nested loops calculating subarray sums directly. Timed out on 10^5 element test cases.',
      },
    ],
  },
  {
    _id: 'demo-p-2',
    id: 'demo-p-2',
    title: 'Course Schedule II',
    difficulty: 'medium',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/course-schedule-ii/',
    problemUrl: 'https://leetcode.com/problems/course-schedule-ii/',
    topics: ['Graph', 'Topological Sort', 'BFS'],
    status: 'struggled',
    latestAttempt: {
      status: 'struggled',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 2,
    attemptCount: 2,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
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
    attempts: [
      {
        _id: 'att-2-2',
        id: 'att-2-2',
        status: 'struggled',
        timeTakenMinutes: 35,
        attemptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        approach: "Kahn's BFS In-degree Queue",
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        notes: "Implemented Kahn's algorithm with in-degree tracking array. Return empty array if processed count < numCourses (cycle).",
      },
      {
        _id: 'att-2-1',
        id: 'att-2-1',
        status: 'struggled',
        timeTakenMinutes: 50,
        attemptedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'DFS 3-State Cycle Detection',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        notes: 'Struggled with back-edge detection using 3 states (unvisited, visiting, visited) during recursive DFS traversal.',
      },
    ],
  },
  {
    _id: 'demo-p-3',
    id: 'demo-p-3',
    title: 'Minimum Window Substring',
    difficulty: 'hard',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/minimum-window-substring/',
    problemUrl: 'https://leetcode.com/problems/minimum-window-substring/',
    topics: ['Hash Table', 'Sliding Window', 'String'],
    status: 'struggled',
    latestAttempt: {
      status: 'struggled',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 4,
    attemptCount: 4,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
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
    attempts: [
      {
        _id: 'att-3-4',
        id: 'att-3-4',
        status: 'struggled',
        timeTakenMinutes: 28,
        attemptedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Two-Pointer Sliding Window',
        timeComplexity: 'O(m + n)',
        spaceComplexity: 'O(1)',
        notes: 'Expanded right pointer until all characters matched, then shrunk left pointer to minimize window. Handled duplicate characters.',
      },
      {
        _id: 'att-3-3',
        id: 'att-3-3',
        status: 'revisit_needed',
        timeTakenMinutes: 35,
        attemptedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Sliding Window + ASCII Frequency Array',
        timeComplexity: 'O(m + n)',
        spaceComplexity: 'O(1)',
        notes: 'Replaced Map<Character, Integer> with int[128] frequency array. Improved cache locality and avoided autoboxing.',
      },
      {
        _id: 'att-3-2',
        id: 'att-3-2',
        status: 'revisit_needed',
        timeTakenMinutes: 45,
        attemptedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Sliding Window with Hash Map',
        timeComplexity: 'O(m + n)',
        spaceComplexity: 'O(k)',
        notes: 'Sliding window logic worked for simple cases, but had edge case bug with duplicate letters in target like "AAB".',
      },
      {
        _id: 'att-3-1',
        id: 'att-3-1',
        status: 'struggled',
        timeTakenMinutes: 55,
        attemptedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Brute Force Substrings',
        timeComplexity: 'O(m^2 * n)',
        spaceComplexity: 'O(n)',
        notes: 'Generated all substrings and checked character inclusion. Hit Time Limit Exceeded immediately on LeetCode test cases.',
      },
    ],
  },
  {
    _id: 'demo-p-4',
    id: 'demo-p-4',
    title: 'Word Ladder',
    difficulty: 'hard',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/word-ladder/',
    problemUrl: 'https://leetcode.com/problems/word-ladder/',
    topics: ['Graph', 'BFS', 'Hash Table'],
    status: 'revisit_needed',
    latestAttempt: {
      status: 'revisit_needed',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 2,
    attemptCount: 2,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    description: 'A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words such that adjacent words differ by exactly one letter.',
    timeComplexity: 'O(M^2 * N)',
    spaceComplexity: 'O(M^2 * N)',
    notes: 'Breadth-first search using level-by-level queue exploration for shortest transformation path.',
    attempts: [
      {
        _id: 'att-4-2',
        id: 'att-4-2',
        status: 'revisit_needed',
        timeTakenMinutes: 32,
        attemptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'BFS Level-by-Level with Word Set',
        timeComplexity: 'O(M^2 * N)',
        spaceComplexity: 'O(M^2 * N)',
        notes: 'Used HashSet for dictionary lookup and mutated each character across 26 letters. Bidirectional BFS would improve constant factor.',
      },
      {
        _id: 'att-4-1',
        id: 'att-4-1',
        status: 'struggled',
        timeTakenMinutes: 48,
        attemptedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Naive BFS Graph Construction',
        timeComplexity: 'O(N^2 * M)',
        spaceComplexity: 'O(N^2)',
        notes: 'Tried to build full adjacency graph for word list before running BFS. Ran out of memory on large word sets.',
      },
    ],
  },
  {
    _id: 'demo-p-5',
    id: 'demo-p-5',
    title: 'Merge k Sorted Lists',
    difficulty: 'hard',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    problemUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    topics: ['Linked List', 'Heap', 'Divide and Conquer'],
    status: 'solved',
    latestAttempt: {
      status: 'solved',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 3,
    attemptCount: 3,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastPracticed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    timeComplexity: 'O(N log k)',
    spaceComplexity: 'O(k)',
    notes: 'Use a min-heap (PriorityQueue) of size k containing heads of each list, or divide-and-conquer pair merges.',
    attempts: [
      {
        _id: 'att-5-3',
        id: 'att-5-3',
        status: 'solved',
        timeTakenMinutes: 22,
        attemptedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Min-Heap PriorityQueue',
        timeComplexity: 'O(N log k)',
        spaceComplexity: 'O(k)',
        notes: 'PriorityQueue of size k containing active node heads. Extracted min and pushed next pointer.',
      },
      {
        _id: 'att-5-2',
        id: 'att-5-2',
        status: 'solved',
        timeTakenMinutes: 28,
        attemptedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Divide and Conquer Pair Merges',
        timeComplexity: 'O(N log k)',
        spaceComplexity: 'O(1)',
        notes: 'Merged lists in pairs iteratively like bottom-up merge sort. Space optimal.',
      },
      {
        _id: 'att-5-1',
        id: 'att-5-1',
        status: 'revisit_needed',
        timeTakenMinutes: 40,
        attemptedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Sequential 2-List Merge',
        timeComplexity: 'O(k * N)',
        spaceComplexity: 'O(1)',
        notes: 'Merged each list sequentially into accumulated result. Worked but asymptotically sub-optimal.',
      },
    ],
  },
  {
    _id: 'demo-p-6',
    id: 'demo-p-6',
    title: 'Longest Increasing Subsequence',
    difficulty: 'medium',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    problemUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    topics: ['Dynamic Programming', 'Binary Search'],
    status: 'solved',
    latestAttempt: {
      status: 'solved',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 2,
    attemptCount: 2,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastPracticed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    notes: 'Patience sorting technique using binary search on tail elements array gives optimal O(N log N).',
    attempts: [
      {
        _id: 'att-6-2',
        id: 'att-6-2',
        status: 'solved',
        timeTakenMinutes: 20,
        attemptedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Patience Sorting + Binary Search',
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(N)',
        notes: 'Maintained tails array representing smallest tail of all increasing subsequences. Binary search replacement.',
      },
      {
        _id: 'att-6-1',
        id: 'att-6-1',
        status: 'revisit_needed',
        timeTakenMinutes: 35,
        attemptedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'O(N^2) Dynamic Programming',
        timeComplexity: 'O(N^2)',
        spaceComplexity: 'O(N)',
        notes: 'dp[i] = max(dp[j]) + 1 for j < i and nums[j] < nums[i]. Clean DP concept, but O(N^2) runtime.',
      },
    ],
  },
  {
    _id: 'demo-p-7',
    id: 'demo-p-7',
    title: 'Two Sum',
    difficulty: 'easy',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/two-sum/',
    problemUrl: 'https://leetcode.com/problems/two-sum/',
    topics: ['Array', 'Hash Table'],
    status: 'solved',
    latestAttempt: {
      status: 'solved',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 1,
    attemptCount: 1,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    lastPracticed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    notes: 'Single-pass hash table checking (target - num) complement before inserting current index.',
    attempts: [
      {
        _id: 'att-7-1',
        id: 'att-7-1',
        status: 'solved',
        timeTakenMinutes: 12,
        attemptedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'One-Pass Hash Map',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        notes: 'Stored complement (target - num) in hash table for instant O(1) lookup in single pass.',
      },
    ],
  },
  {
    _id: 'demo-p-8',
    id: 'demo-p-8',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/valid-parentheses/',
    problemUrl: 'https://leetcode.com/problems/valid-parentheses/',
    topics: ['Stack', 'String'],
    status: 'solved',
    latestAttempt: {
      status: 'solved',
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 1,
    attemptCount: 1,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastPracticed: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    notes: 'Push matching closing brace onto stack for every open bracket; pop and compare on closing bracket.',
    attempts: [
      {
        _id: 'att-8-1',
        id: 'att-8-1',
        status: 'solved',
        timeTakenMinutes: 15,
        attemptedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Stack Matching',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        notes: 'Pushed matching closing bracket onto stack for every open bracket; popped and compared on closing bracket. Verified stack empty at end.',
      },
    ],
  },
  {
    _id: 'demo-p-9',
    id: 'demo-p-9',
    title: 'Invert Binary Tree',
    difficulty: 'easy',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/invert-binary-tree/',
    problemUrl: 'https://leetcode.com/problems/invert-binary-tree/',
    topics: ['Tree', 'Recursion', 'DFS'],
    status: 'solved',
    latestAttempt: {
      status: 'solved',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 1,
    attemptCount: 1,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    lastPracticed: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    notes: 'Simple post-order or pre-order recursive swap of left and right child pointers.',
    attempts: [
      {
        _id: 'att-9-1',
        id: 'att-9-1',
        status: 'solved',
        timeTakenMinutes: 8,
        attemptedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Recursive DFS Swap',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(H)',
        notes: 'Simple post-order or pre-order recursive swap of left and right child pointers.',
      },
    ],
  },
  {
    _id: 'demo-p-10',
    id: 'demo-p-10',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    platform: 'leetcode',
    link: 'https://leetcode.com/problems/trapping-rain-water/',
    problemUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    topics: ['Array', 'Two Pointers', 'Stack'],
    status: 'struggled',
    latestAttempt: {
      status: 'struggled',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    attemptsCount: 3,
    attemptCount: 3,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    lastPracticed: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    nextRevisionDate: new Date().toISOString(),
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    notes: 'Two-pointer approach tracking leftMax and rightMax shrinks the bottleneck boundary in O(1) extra space.',
    attempts: [
      {
        _id: 'att-10-3',
        id: 'att-10-3',
        status: 'struggled',
        timeTakenMinutes: 26,
        attemptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Two Pointers Shrinking Boundary',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        notes: 'O(1) extra space two pointers shrinking from outer bounds tracking leftMax and rightMax.',
      },
      {
        _id: 'att-10-2',
        id: 'att-10-2',
        status: 'revisit_needed',
        timeTakenMinutes: 35,
        attemptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Monotonic Decreasing Stack',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        notes: 'Tracked bounded water basins horizontally using a monotonic decreasing stack.',
      },
      {
        _id: 'att-10-1',
        id: 'att-10-1',
        status: 'struggled',
        timeTakenMinutes: 45,
        attemptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        approach: 'Precomputed Left & Right Max Arrays',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        notes: 'Calculated leftMax[i] and rightMax[i] prefix/suffix arrays. Correct water trapped = min(leftMax, rightMax) - height[i].',
      },
    ],
  },
];

/**
 * Returns a demo problem by ID or fallback to the primary focus
 */
export const getDemoProblemById = (id) => {
  return DEMO_PROBLEMS.find((p) => p._id === id || p.id === id) || null;
};
