import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Lock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  Zap,
  Layers,
  GitBranch,
  Trophy,
  Flame,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * NeetCode 150 / Striver A2Z inspired DSA Skill Tree Tracks
 */
export const SKILL_TREE_TRACKS = [
  {
    id: 'linear',
    tier: 'Tier 1',
    title: 'Linear Foundations',
    shortTitle: 'Linear',
    description: 'Contiguous memory, pointer coordination, prefix aggregates & monotonic stacks',
    icon: Layers,
    color: 'emerald',
    nodes: [
      {
        id: 'arrays-hashing',
        title: 'Arrays & Hashing',
        shortName: 'Arrays & Hash Map',
        trackId: 'linear',
        matchKeywords: ['array', 'arrays', 'hash table', 'hash map', 'prefix sum'],
        techniques: ['Frequency Hash Maps', 'Prefix Sum Accumulation', 'Prefix-Suffix Products'],
        defaultSolved: 28,
        defaultTotal: 32,
        complexity: 'O(N) Time · O(N) Space',
        keyProblems: ['Two Sum', 'Subarray Sum Equals K', 'Product of Array Except Self'],
      },
      {
        id: 'two-pointers',
        title: 'Two Pointers',
        shortName: 'Two Pointers',
        trackId: 'linear',
        matchKeywords: ['two pointers', 'two pointer'],
        techniques: ['Opposite Ends (Sorted Arrays)', 'Fast & Slow Runners', 'In-Place Partitioning'],
        defaultSolved: 18,
        defaultTotal: 22,
        complexity: 'O(N) Time · O(1) Space',
        keyProblems: ['3Sum', 'Container With Most Water', 'Trapping Rain Water'],
      },
      {
        id: 'sliding-window',
        title: 'Sliding Window',
        shortName: 'Sliding Window',
        trackId: 'linear',
        matchKeywords: ['sliding window'],
        techniques: ['Fixed Window (Length K)', 'Dynamic Window (Condition Check)', 'Frequency Match Window'],
        defaultSolved: 14,
        defaultTotal: 20,
        complexity: 'O(N) Time · O(K) Space',
        keyProblems: ['Longest Substring Without Repeating', 'Minimum Window Substring'],
      },
      {
        id: 'stack-queue',
        title: 'Stack & Monotonic Queue',
        shortName: 'Stack & Queue',
        trackId: 'linear',
        matchKeywords: ['stack', 'queue', 'monotonic stack'],
        techniques: ['Parentheses Matching', 'Monotonic Increasing / Decreasing Stack', 'Sliding Window Maximum'],
        defaultSolved: 16,
        defaultTotal: 22,
        complexity: 'O(N) Time · O(N) Space',
        keyProblems: ['Valid Parentheses', 'Daily Temperatures', 'Largest Rectangle in Histogram'],
      },
    ],
  },
  {
    id: 'hierarchical',
    tier: 'Tier 2',
    title: 'Hierarchical & Graphs',
    shortTitle: 'Trees & Graphs',
    description: 'Tree structures, state spaces, and graph search algorithms',
    icon: GitBranch,
    color: 'amber',
    nodes: [
      {
        id: 'binary-search',
        title: 'Binary Search',
        shortName: 'Binary Search',
        trackId: 'hierarchical',
        matchKeywords: ['binary search'],
        techniques: ['Sorted Array Partition', 'Search in Rotated Array', 'Monotonic Predicate (Search on Answer)'],
        defaultSolved: 15,
        defaultTotal: 20,
        complexity: 'O(log N) Time · O(1) Space',
        keyProblems: ['Binary Search', 'Search in Rotated Sorted Array', 'Koko Eating Bananas'],
      },
      {
        id: 'trees-bst',
        title: 'Trees & Binary Search Trees',
        shortName: 'Trees & BST',
        trackId: 'hierarchical',
        matchKeywords: ['tree', 'trees', 'binary tree', 'bst'],
        techniques: ['Preorder / Inorder / Postorder DFS', 'Level Order BFS', 'LCA & Subtree Validation'],
        defaultSolved: 24,
        defaultTotal: 36,
        complexity: 'O(N) Time · O(H) Space',
        keyProblems: ['Invert Binary Tree', 'Lowest Common Ancestor', 'Validate BST'],
      },
      {
        id: 'heaps',
        title: 'Heap & Priority Queue',
        shortName: 'Heaps & PQ',
        trackId: 'hierarchical',
        matchKeywords: ['heap', 'priority queue'],
        techniques: ['Top K Frequent Elements', 'Two Heaps (Median Finder)', 'K-Way Merge'],
        defaultSolved: 10,
        defaultTotal: 18,
        complexity: 'O(N log K) Time',
        keyProblems: ['Kth Largest Element', 'Find Median from Data Stream', 'Merge k Sorted Lists'],
      },
      {
        id: 'graphs-bfs-dfs',
        title: 'Graphs & BFS / DFS',
        shortName: 'Graphs & BFS/DFS',
        trackId: 'hierarchical',
        matchKeywords: ['graph', 'graphs', 'bfs', 'dfs', 'topological sort'],
        techniques: ['Connected Components', 'Topological Sort (Kahn / DFS)', 'Cycle Detection (Directed/Undirected)'],
        defaultSolved: 22,
        defaultTotal: 38,
        complexity: 'O(V + E) Time · O(V) Space',
        keyProblems: ['Number of Islands', 'Course Schedule II', 'Rotting Oranges'],
      },
    ],
  },
  {
    id: 'optimization',
    tier: 'Tier 3',
    title: 'Optimization & Dynamic Programming',
    shortTitle: 'Optimization & DP',
    description: 'Overlapping subproblems, state transitions, and optimal substructure',
    icon: Zap,
    color: 'blue',
    nodes: [
      {
        id: '1d-dp',
        title: '1-D Dynamic Programming',
        shortName: '1-D DP',
        trackId: 'optimization',
        matchKeywords: ['dynamic programming', 'dp', '1d dp'],
        techniques: ['Bottom-Up Tabulation', 'Memoization Recursion', 'Space Optimization (Two Variables)'],
        defaultSolved: 14,
        defaultTotal: 25,
        complexity: 'O(N) Time · O(1) to O(N) Space',
        keyProblems: ['Climbing Stairs', 'House Robber', 'Longest Increasing Subsequence'],
      },
      {
        id: '2d-dp',
        title: '2-D Dynamic Programming',
        shortName: '2-D DP',
        trackId: 'optimization',
        matchKeywords: ['2d dp', 'knapsack', 'lcs', 'matrix dp'],
        techniques: ['Grid Path Finding', 'LCS & Edit Distance', '0/1 Knapsack & Unbounded Knapsack'],
        defaultSolved: 9,
        defaultTotal: 22,
        complexity: 'O(M * N) Time · O(M * N) Space',
        keyProblems: ['Unique Paths', 'Longest Common Subsequence', 'Target Sum'],
      },
      {
        id: 'greedy-intervals',
        title: 'Greedy & Interval Scheduling',
        shortName: 'Greedy / Intervals',
        trackId: 'optimization',
        matchKeywords: ['greedy', 'intervals', 'interval'],
        techniques: ['Sort by End Time', 'Interval Merge & Overlap Detection', 'Local Optimal Choice Proof'],
        defaultSolved: 12,
        defaultTotal: 18,
        complexity: 'O(N log N) Time',
        keyProblems: ['Merge Intervals', 'Non-overlapping Intervals', 'Gas Station'],
      },
    ],
  },
  {
    id: 'advanced',
    tier: 'Tier 4',
    title: 'Advanced Mastery',
    shortTitle: 'Advanced',
    description: 'Exhaustive constraint search, disjoint sets, and advanced graph flows',
    icon: Trophy,
    color: 'purple',
    nodes: [
      {
        id: 'backtracking',
        title: 'Backtracking & Pruning',
        shortName: 'Backtracking',
        trackId: 'advanced',
        matchKeywords: ['backtracking', 'recursion'],
        techniques: ['State Space Tree Exploration', 'Pruning Branches', 'Permutations & Subsets'],
        defaultSolved: 8,
        defaultTotal: 16,
        complexity: 'O(2^N) or O(N!) Time',
        keyProblems: ['Subsets', 'Combination Sum', 'N-Queens'],
      },
      {
        id: 'tries',
        title: 'Tries (Prefix Trees)',
        shortName: 'Tries',
        trackId: 'advanced',
        matchKeywords: ['trie', 'tries', 'prefix tree'],
        techniques: ['Prefix Insertion & Search', 'Wildcard Search', 'Bitwise Trie for Max XOR'],
        defaultSolved: 5,
        defaultTotal: 12,
        complexity: 'O(L) Time per word',
        keyProblems: ['Implement Trie', 'Word Search II'],
      },
      {
        id: 'union-find-adv',
        title: 'Union Find & Advanced Graphs',
        shortName: 'Union Find & Graphs',
        trackId: 'advanced',
        matchKeywords: ['union find', 'disjoint set', 'dijkstra', 'shortest path'],
        techniques: ['Disjoint Set Union by Rank', 'Path Compression', "Dijkstra's Shortest Path", "Kruskal's MST"],
        defaultSolved: 7,
        defaultTotal: 15,
        complexity: 'O(alpha(N)) Time · O(E log V)',
        keyProblems: ['Redundant Connection', 'Network Delay Time', 'Min Cost to Connect Points'],
      },
    ],
  },
];

/**
 * MasteryMilestonePath: Gamified DSA Skill Tree & Interactive Visual Roadmap.
 */
const MasteryMilestonePath = ({
  summary = null,
  topics = [],
  dailyFocus = null,
  className = '',
}) => {
  const { isAuthenticated } = useAuth();
  // Default to active tier (hierarchical) so users see their immediate in-progress 4 nodes instead of 14 cards
  const [activeTrackTab, setActiveTrackTab] = useState('hierarchical');
  const [selectedNode, setSelectedNode] = useState(null);

  // Derive Topic Solved Counts and States for Each Node
  const skillTreeState = useMemo(() => {
    // Topic lookup map from API
    const topicMap = new Map();
    (topics || []).forEach((t) => {
      const name = (t.topic || t.name || '').toLowerCase();
      topicMap.set(name, {
        solved: t.solvedCount || 0,
        attempts: t.totalAttempts || 0,
        struggle: t.struggleRatio || 0,
      });
    });

    const activeFocusTopics = Array.isArray(dailyFocus?.topics)
      ? dailyFocus.topics.map((t) => t.toLowerCase())
      : typeof dailyFocus?.topic === 'string'
      ? [dailyFocus.topic.toLowerCase()]
      : [];

    let totalNodesCount = 0;
    let masteredNodesCount = 0;

    const tracksWithState = SKILL_TREE_TRACKS.map((track) => {
      const nodesWithState = track.nodes.map((node) => {
        totalNodesCount += 1;

        let solved = node.defaultSolved;
        let total = node.defaultTotal;

        if (isAuthenticated) {
          // Calculate honest stats from topicMap
          let matchedSolved = 0;
          let matchedAttempts = 0;
          let matched = false;

          node.matchKeywords.forEach((kw) => {
            const data = topicMap.get(kw.toLowerCase());
            if (data) {
              matched = true;
              matchedSolved += data.solved;
              matchedAttempts += data.attempts;
            }
          });

          if (matched) {
            solved = matchedSolved;
            total = Math.max(matchedSolved, node.defaultTotal);
          } else {
            solved = 0;
          }
        }

        const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

        // Is this the active quest linked to today's focus?
        const isCurrentQuest =
          activeFocusTopics.some((ft) => node.matchKeywords.some((kw) => kw.toLowerCase() === ft)) ||
          node.id === 'arrays-hashing';

        // State determination
        let status = 'unlocked';
        let statusLabel = 'Unlocked';

        if (pct >= 65) {
          status = 'mastered';
          statusLabel = 'Mastered';
          masteredNodesCount += 1;
        } else if (isCurrentQuest) {
          status = 'current';
          statusLabel = 'Current Quest';
        } else if (track.id === 'advanced' && pct === 0 && !isAuthenticated) {
          status = 'locked';
          statusLabel = 'Prerequisite';
        }

        return {
          ...node,
          solved,
          total,
          pct,
          status,
          statusLabel,
          isCurrentQuest,
        };
      });

      return {
        ...track,
        nodes: nodesWithState,
      };
    });

    const overallMasteryPct =
      totalNodesCount > 0 ? Math.round((masteredNodesCount / totalNodesCount) * 100) : 0;

    return {
      tracks: tracksWithState,
      totalNodesCount,
      masteredNodesCount,
      overallMasteryPct,
    };
  }, [isAuthenticated, topics, dailyFocus]);

  // Filtered tracks based on active tab
  const displayedTracks = useMemo(() => {
    if (activeTrackTab === 'all') return skillTreeState.tracks;
    return skillTreeState.tracks.filter((t) => t.id === activeTrackTab);
  }, [skillTreeState.tracks, activeTrackTab]);

  return (
    <section
      id="skill-tree-roadmap"
      aria-label="DSA Skill Tree Roadmap"
      className={`rounded-2xl border border-line bg-surface/90 shadow-sm p-4 sm:p-5 lg:p-6 select-none transition-all ${className}`}
    >
      {/* ── TOP HEADER STRIP: Title, Stats & Filter Tabs ───────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-line">
        
        {/* Title & Eyebrow */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/25">
              INTERACTIVE ROADMAP
            </span>
            <span className="text-xs font-mono text-muted">· NeetCode / Striver Pattern Flow</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-text">
            DSA Skill Tree & Mastery Progression
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
            Click any pattern node to inspect core algorithmic techniques, benchmark problems, and targeted practice.
          </p>
        </div>

        {/* Global Skill Tree Metrics */}
        <div className="flex items-center gap-4 bg-surface-2/60 border border-line-subtle px-3.5 py-2 rounded-xl shrink-0">
          <div>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
              Tree Mastery
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-text tabular-nums">
              {skillTreeState.masteredNodesCount} / {skillTreeState.totalNodesCount} Patterns
            </span>
          </div>
          <div className="h-7 w-[1px] bg-line-subtle" />
          <div>
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
              Completion
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-accent tabular-nums">
              {skillTreeState.overallMasteryPct}%
            </span>
          </div>
        </div>

      </div>

      {/* ── TRACK SELECTOR TABS ────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 pt-3 pb-3 overflow-x-auto no-scrollbar border-b border-line-subtle/50">
        {skillTreeState.tracks.map((track) => {
          const isSelected = activeTrackTab === track.id;
          const isHierarchical = track.id === 'hierarchical';
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => setActiveTrackTab(track.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-accent/20 text-accent border border-accent/40 font-bold shadow-[0_0_12px_-2px_rgba(255,161,22,0.25)]'
                  : 'text-text-secondary hover:text-text hover:bg-surface-2 border border-transparent'
              }`}
            >
              {isHierarchical && <span className="text-accent">★</span>}
              <span>{track.shortTitle}</span>
              <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-accent' : 'text-muted'}`}>
                ({track.nodes.filter((n) => n.status === 'mastered').length}/{track.nodes.length})
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setActiveTrackTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            activeTrackTab === 'all'
              ? 'bg-accent/20 text-accent border border-accent/40 font-bold shadow-[0_0_12px_-2px_rgba(255,161,22,0.25)]'
              : 'text-text-secondary hover:text-text hover:bg-surface-2 border border-transparent'
          }`}
        >
          All Tracks (14)
        </button>
      </div>

      {/* ── SKILL TREE TRACKS & INTERACTIVE NODES ──────────────────── */}
      <div className="pt-4 space-y-6">
        {displayedTracks.map((track, trackIdx) => {
          const TrackIcon = track.icon;
          return (
            <React.Fragment key={track.id}>
              {/* Inter-Tier Curriculum Flow Connector */}
              {trackIdx > 0 && activeTrackTab === 'all' && (
                <div className="flex items-center justify-center -my-2 relative z-0 pointer-events-none select-none">
                  <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-surface-2/90 border border-line-subtle text-[9px] font-mono text-muted shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="tracking-wider uppercase font-semibold">Curriculum Flow</span>
                    <span className="text-accent">↓</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 relative">
                
                {/* Track Header Ribbon */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-surface-2 border border-line-subtle flex items-center justify-center text-accent shrink-0">
                      <TrackIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                          {track.tier}
                        </span>
                        <span className="text-muted/30">·</span>
                        <h3 className="text-xs sm:text-sm font-bold text-text">
                          {track.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] font-mono text-muted hidden sm:block">
                    {track.description}
                  </p>
                </div>

                {/* Track Nodes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 relative">
                  {track.nodes.map((node) => {
                    const isMastered = node.status === 'mastered';
                    const isCurrent = node.status === 'current';
                    const isLocked = node.status === 'locked';

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNode(node)}
                        className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative group flex flex-col justify-between space-y-2.5 min-h-[108px] ${
                          isCurrent
                            ? 'bg-gradient-to-b from-accent/15 via-surface/90 to-surface-2/70 border-accent shadow-[0_0_20px_-3px_rgba(255,161,22,0.3)] ring-1 ring-accent/40 backdrop-blur-md hover:-translate-y-0.5'
                            : isMastered
                            ? 'bg-gradient-to-b from-surface/90 via-surface-2/50 to-surface-2/30 hover:from-surface hover:to-surface-2/60 border-easy/40 hover:border-easy shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:shadow-[0_4px_16px_-4px_rgba(0,184,163,0.25)] backdrop-blur-md hover:-translate-y-0.5'
                            : isLocked
                            ? 'bg-surface-2/20 border-line-subtle/50 opacity-60 hover:opacity-85'
                            : 'bg-gradient-to-b from-surface/80 to-surface-2/40 hover:from-surface-hover hover:to-surface-2 border-line hover:border-line-hover shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md hover:-translate-y-0.5'
                        }`}
                        title={`Inspect ${node.title} pattern details`}
                      >
                        {/* Node Top Row: Status Icon & Badge */}
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                isMastered
                                  ? 'bg-easy/20 border-easy text-easy shadow-[0_0_8px_rgba(0,184,163,0.3)]'
                                  : isCurrent
                                  ? 'bg-accent/20 border-accent text-accent animate-pulse shadow-[0_0_8px_rgba(255,161,22,0.3)]'
                                  : isLocked
                                  ? 'bg-surface border-line text-muted'
                                  : 'bg-surface border-line-subtle text-muted'
                              }`}
                            >
                              {isMastered ? (
                                <Check className="w-3 h-3 stroke-[3]" />
                              ) : isCurrent ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                              ) : isLocked ? (
                                <Lock className="w-2.5 h-2.5" />
                              ) : (
                                <span className="w-1 h-1 rounded-full bg-muted" />
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                                isMastered
                                  ? 'text-easy bg-easy/10 border border-easy/25'
                                  : isCurrent
                                  ? 'text-accent bg-accent/15 border border-accent/35 shadow-xs'
                                  : 'text-muted bg-surface border border-line-subtle'
                              }`}
                            >
                              {node.statusLabel}
                            </span>
                          </div>

                          {/* Solved Ratio */}
                          <span className="text-[11px] font-mono text-muted tabular-nums font-semibold">
                            {node.solved}/{node.total}
                          </span>
                        </div>

                        {/* Node Title & Primary Sub-pattern */}
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-bold text-text group-hover:text-accent transition-colors leading-snug">
                            {node.shortName}
                          </h4>
                          <p className="text-[10px] font-mono text-muted truncate">
                            {node.techniques[0]}
                          </p>
                        </div>

                        {/* Micro Progress Track Bar */}
                        <div className="w-full bg-surface-2/80 rounded-full h-1 overflow-hidden border border-line-subtle/40">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isMastered
                                ? 'bg-gradient-to-r from-easy to-emerald-400 shadow-[0_0_6px_rgba(0,184,163,0.5)]'
                                : isCurrent
                                ? 'bg-gradient-to-r from-accent to-amber-400 shadow-[0_0_6px_rgba(255,161,22,0.5)]'
                                : 'bg-muted/40'
                            }`}
                            style={{ width: `${node.pct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── INTERACTIVE PATTERN INSPECTOR MODAL ────────────────────── */}
      {selectedNode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="glass-panel border-beam-amber relative w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 select-none animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="node-inspector-title"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-line">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/25">
                    {selectedNode.statusLabel}
                  </span>
                  <span className="text-xs font-mono text-muted">
                    {selectedNode.complexity}
                  </span>
                </div>
                <h3 id="node-inspector-title" className="text-base sm:text-lg font-black text-text">
                  {selectedNode.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                aria-label="Close pattern inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Solved Progress Overview */}
            <div className="p-3 rounded-xl bg-surface-2/50 border border-line-subtle flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-muted uppercase block">Solved Ratio</span>
                <span className="text-sm font-bold font-mono text-text tabular-nums">
                  {selectedNode.solved} / {selectedNode.total} Solved ({selectedNode.pct}%)
                </span>
              </div>
              <div className="w-32 bg-surface rounded-full h-2 overflow-hidden border border-line-subtle">
                <div
                  className={`h-full rounded-full ${
                    selectedNode.status === 'mastered' ? 'bg-easy' : 'bg-accent'
                  }`}
                  style={{ width: `${selectedNode.pct}%` }}
                />
              </div>
            </div>

            {/* Core Algorithmic Techniques */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Core Algorithmic Techniques</span>
              </span>
              <ul className="space-y-1 text-xs text-text-secondary bg-surface-2/30 p-3 rounded-xl border border-line-subtle">
                {selectedNode.techniques.map((tech, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benchmark Problems */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-text">Benchmark Target Problems</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.keyProblems.map((prob, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-1 rounded-md bg-surface-2 border border-line-subtle text-text"
                  >
                    {prob}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="btn-secondary text-xs py-2 px-3.5 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <Link
                to={`/problems?search=${encodeURIComponent(selectedNode.shortName)}`}
                onClick={() => setSelectedNode(null)}
                className="btn-primary text-xs py-2 px-4 rounded-lg font-bold inline-flex items-center gap-1.5"
              >
                <span>Practice {selectedNode.shortName} →</span>
              </Link>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

export default MasteryMilestonePath;
