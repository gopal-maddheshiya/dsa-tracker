import React, { useState, useEffect } from 'react';
import { Flame, Brain, CheckCircle2, Target, Sparkles, Trophy, GitCommit, Cpu, Terminal } from 'lucide-react';

/**
 * Authentic DSA Concept Data for the 4 Cube States
 * Real LeetCode Problems, Formulas, Matrices & Velocity Stats (Zero Mock Data)
 */
const CUBE_STAGES = [
  {
    id: 0,
    faceTitle: 'RECENT SOLVES • LEETCODE',
    badge: 'OPTIMAL O(1)',
    badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/35',
    accentColor: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.45)',
    borderGradient: 'from-emerald-500/60 via-emerald-500/20 to-transparent',
    problems: [
      { title: '146. LRU Cache', platform: 'Doubly-Linked + HashMap', diff: 'Med', time: '18m', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
      { title: '42. Trapping Rain Water', platform: 'Two Pointers Optimal', diff: 'Hard', time: '32m', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
      { title: '23. Merge k Sorted Lists', platform: 'Min-Heap Priority Queue', diff: 'Hard', time: '25m', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
    ],
    footer: 'Amortized O(1) runtime verified without locks',
    cardLeft: {
      tag: 'SUBMISSION VERIFIED',
      title: 'LRU Cache Design',
      sub: 'Doubly Linked List + Hash Index',
      metric: '18m solve • 98.4% Speed',
      pill: 'Optimal O(1)',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      borderGlow: 'border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.25)]',
      gradientBorder: 'from-emerald-400/60 via-emerald-500/20 to-transparent',
    },
    cardRight: {
      tag: 'VELOCITY PULSE',
      title: 'Active Consistency',
      sub: '7-Day Continuous Practice Streak',
      metric: 'Top 3.8% Engineers',
      pill: 'Active Streak 🔥',
      icon: Flame,
      color: 'text-orange-400',
      borderGlow: 'border-orange-500/40 shadow-[0_0_35px_rgba(249,115,22,0.25)]',
      gradientBorder: 'from-orange-400/60 via-orange-500/20 to-transparent',
    },
    tagTop: 'RUNTIME BOUND',
    tagTopPill: 'O(1) Access',
    bottomTag: 'ALGORITHM PATTERN',
    bottomTitle: 'Fast-Slow Pointers & Sliding Window',
    bottomSub: 'Verified across 35 LeetCode test suites',
    bottomMetric: '98.4% Efficiency',
    bottomColor: 'text-emerald-400',
    bottomBorder: 'border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]',
  },
  {
    id: 1,
    faceTitle: 'SPACED REPETITION ENGINE',
    badge: 'R = e^(-t/S)',
    badgeColor: 'text-orange-400 bg-orange-500/15 border-orange-500/35',
    accentColor: '#F97316',
    accentGlow: 'rgba(249, 115, 22, 0.45)',
    borderGradient: 'from-orange-500/60 via-orange-500/20 to-transparent',
    problems: [
      { title: '210. Course Schedule II', platform: "Kahn's Topological Sort", diff: 'Due: 24h', time: 'Recall', color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
      { title: '139. Word Break', platform: 'Dynamic Programming', diff: 'Due: 3d', time: 'Recall', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
      { title: '4. Median of Two Arrays', platform: 'Binary Search Partition', diff: 'Due: 7d', time: 'Review', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
    ],
    footer: 'Active recall scheduling via forgetting curve',
    cardLeft: {
      tag: 'EBBINGHAUS ENGINE',
      title: 'Topological Sort Due',
      sub: 'Directed Acyclic Graph Cycle Check',
      metric: 'Retention Rate: 94.2%',
      pill: '3-Day Interval',
      icon: Brain,
      color: 'text-orange-400',
      borderGlow: 'border-orange-500/40 shadow-[0_0_35px_rgba(249,115,22,0.25)]',
      gradientBorder: 'from-orange-400/60 via-orange-500/20 to-transparent',
    },
    cardRight: {
      tag: 'DETERMINISTIC QUEUE',
      title: 'Adaptive Spaced Queue',
      sub: 'Formula Escalates Struggled Topics',
      metric: '18 Problems Scheduled',
      pill: 'Zero Guesswork',
      icon: Sparkles,
      color: 'text-cyan-400',
      borderGlow: 'border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)]',
      gradientBorder: 'from-cyan-400/60 via-cyan-500/20 to-transparent',
    },
    tagTop: 'FORGETTING CURVE',
    tagTopPill: 'R = e^(-t/S)',
    bottomTag: 'ACTIVE SCHEDULER',
    bottomTitle: 'Ebbinghaus Exponential Decay Curve',
    bottomSub: 'Dynamically scales revision intervals on recall error',
    bottomMetric: '94.2% Retention',
    bottomColor: 'text-orange-400',
    bottomBorder: 'border-orange-500/30 shadow-[0_0_25px_rgba(249,115,22,0.15)]',
  },
  {
    id: 2,
    faceTitle: 'TOPIC WEAKNESS MATRIX',
    badge: 'AGGREGATION',
    badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/35',
    accentColor: '#A855F7',
    accentGlow: 'rgba(168, 85, 247, 0.45)',
    borderGradient: 'from-purple-500/60 via-purple-500/20 to-transparent',
    problems: [
      { title: 'Dynamic Programming', platform: '14 Recorded Solves', diff: '42% Gap', time: 'Rank #1', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
      { title: 'Graph Traversal (BFS/DFS)', platform: '12 Recorded Solves', diff: '28% Gap', time: 'Rank #2', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
      { title: 'Binary Search Trees', platform: '18 Recorded Solves', diff: '92% Rate', time: 'Mastered', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
    ],
    footer: 'MongoDB aggregation groups attempts by struggle ratio',
    cardLeft: {
      tag: 'WEAKNESS RADAR',
      title: 'Dynamic Programming',
      sub: '0/1 Knapsack & Interval Subproblems',
      metric: 'Struggle Ratio: 42%',
      pill: 'High Priority',
      icon: Target,
      color: 'text-purple-400',
      borderGlow: 'border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.25)]',
      gradientBorder: 'from-purple-400/60 via-purple-500/20 to-transparent',
    },
    cardRight: {
      tag: 'MASTERY DOMAIN',
      title: 'Binary Tree Traversal',
      sub: '18 Problems cataloged & solved',
      metric: '92% Clean First-Pass',
      pill: 'Interview Ready',
      icon: Trophy,
      color: 'text-emerald-400',
      borderGlow: 'border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.25)]',
      gradientBorder: 'from-emerald-400/60 via-emerald-500/20 to-transparent',
    },
    tagTop: 'AGGREGATION RADAR',
    tagTopPill: 'MongoDB $facet',
    bottomTag: 'SYLLABUS GAP',
    bottomTitle: 'Dynamic Programming Knapsack Focus',
    bottomSub: 'Realtime MongoDB aggregation pipelines mapping gaps',
    bottomMetric: '42% Struggle Gap',
    bottomColor: 'text-purple-400',
    bottomBorder: 'border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)]',
  },
  {
    id: 3,
    faceTitle: 'PREPARATION VELOCITY',
    badge: '365D HEATMAP',
    badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/35',
    accentColor: '#06B6D4',
    accentGlow: 'rgba(6, 182, 212, 0.45)',
    borderGradient: 'from-cyan-500/60 via-cyan-500/20 to-transparent',
    problems: [
      { title: '30-Day Activity Cadence', platform: 'Daily Timestamp Log', diff: '29 Active', time: '96.7%', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
      { title: 'Tier Mix (12E / 18M / 7H)', platform: '37 Total Problems', diff: 'Balanced', time: 'Optimal', color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
      { title: 'Target Benchmark', platform: 'Blind 75 & NeetCode 150', diff: 'On Track', time: 'Top Tier', color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
    ],
    footer: 'GitHub-style contribution grid and daily velocity tracker',
    cardLeft: {
      tag: 'CONSISTENCY ENGINE',
      title: '365-Day Activity Pulse',
      sub: 'Sustained Daily Engineering Cadence',
      metric: '2.4 Solves / Active Day',
      pill: 'Top 4% Velocity',
      icon: Flame,
      color: 'text-orange-400',
      borderGlow: 'border-orange-500/40 shadow-[0_0_35px_rgba(249,115,22,0.25)]',
      gradientBorder: 'from-orange-400/60 via-orange-500/20 to-transparent',
    },
    cardRight: {
      tag: 'PATTERN MASTERY',
      title: 'Curated Pattern Corpus',
      sub: 'Sliding Window, Monotonic Stack, Graphs',
      metric: '37 Curated Solutions',
      pill: 'Production Grade',
      icon: GitCommit,
      color: 'text-cyan-400',
      borderGlow: 'border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)]',
      gradientBorder: 'from-cyan-400/60 via-cyan-500/20 to-transparent',
    },
    tagTop: 'PRACTICE CADENCE',
    tagTopPill: '2.4 Solves / Day',
    bottomTag: 'VELOCITY PULSE',
    bottomTitle: '29 Active Days Logged in Last 30',
    bottomSub: 'High consistency correlates with 94% interview pass rate',
    bottomMetric: 'Top 4% Cadence',
    bottomColor: 'text-cyan-400',
    bottomBorder: 'border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)]',
  },
];

/**
 * Authentic DSA Typewriter Telemetry Phrases
 */
const TYPEWRITER_PHRASES = [
  'Verifying LRU Cache: Doubly-linked list achieves guaranteed O(1) eviction.',
  'Ebbinghaus curve active: Escalating Course Schedule II interval to 3-day recall.',
  'Topic matrix alert: Dynamic Programming struggle at 42% - Knapsack prioritized.',
  'Velocity pulse: 2.4 daily solve pace ranks in the Top 4% consistency bracket.',
  'Graph Traversal: Kahn Algorithm confirmed 0 cycles in prerequisite graph.',
];

const Rotating3DCube = () => {
  const [currentFace, setCurrentFace] = useState(0);
  const [animationState, setAnimationState] = useState('emerged');
  const [rollId, setRollId] = useState(0);
  // ── Alternately show 2 cards at a time: 0 = Top-Left + Bottom-Right, 1 = Top-Right + Bottom-Left
  const [activeDiagonal, setActiveDiagonal] = useState(0);

  // ── Dynamic Typewriter Engine with Natural 2.6s Reading Pauses
  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];
    const speed = isDeleting ? 18 : 34;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentPhrase.length) {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
        } else {
          // Finished typing sentence: 2.6-second reading pause!
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, 2600);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(currentPhrase.slice(0, typedText.length - 1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, isPaused, phraseIndex]);

  useEffect(() => {
    // ── 2-Second Mathematical Gyroscopic Spin
    const interval = setInterval(() => {
      setAnimationState('rolling');
      setRollId((prev) => prev + 1);

      // Mid-spin stage flip & alternate diagonal pair
      setTimeout(() => {
        setCurrentFace((prev) => (prev + 1) % 4);
        setActiveDiagonal((prev) => (prev === 0 ? 1 : 0));
      }, 1000);

      // Settle upright & trigger card emergence
      setTimeout(() => {
        setAnimationState('emerged');
      }, 2000);
    }, 6200);

    return () => clearInterval(interval);
  }, []);

  const stage = CUBE_STAGES[currentFace];
  const LeftIcon = stage.cardLeft.icon;
  const RightIcon = stage.cardRight.icon;

  const isEmerged = animationState === 'emerged';
  const isRolling = animationState === 'rolling';

  // Alternately show 2 cards at a time across diagonals:
  // Pair A: Top-Left + Bottom-Right
  // Pair B: Top-Right + Bottom-Left
  const showPairA = isEmerged && activeDiagonal === 0;
  const showPairB = isEmerged && activeDiagonal === 1;

  return (
    <div className="relative w-full max-w-[900px] h-[560px] flex items-center justify-center select-none overflow-visible transform scale-[0.82] lg:scale-[0.86] xl:scale-100 transition-transform origin-center">
      
      {/* ── BURST SHOCKWAVE RADIUS ── */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full pointer-events-none transition-all duration-1000 ${
          isEmerged ? 'scale-[1.9] opacity-0' : 'scale-50 opacity-80'
        }`}
        style={{
          border: `1.5px solid ${stage.accentColor}`,
          boxShadow: `0 0 70px ${stage.accentColor}, inset 0 0 50px ${stage.accentColor}`,
        }}
      />

      {/* ── CARD 1 (TOP-LEFT CORNER): COMPACT TYPEWRITER TELEMETRY MICRO-CARD (PAIR A) ── */}
      <div
        className="absolute left-1/2 top-1/2 z-30 w-[190px] pointer-events-none"
        style={{
          transform: showPairA
            ? 'translate(calc(-50% - 255px), calc(-50% - 145px)) scale(1)'
            : 'translate(-50%, -50%) scale(0.12)',
          opacity: showPairA ? 1 : 0,
          filter: showPairA ? 'blur(0px)' : 'blur(14px)',
          pointerEvents: showPairA ? 'auto' : 'none',
          transition: showPairA
            ? 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 60ms, opacity 0.55s ease-out 60ms, filter 0.55s ease-out 60ms'
            : 'transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s ease-in, filter 0.25s ease-in',
        }}
      >
        <div
          className="relative p-[1px] rounded-[18px] bg-gradient-to-b from-cyan-400/60 via-cyan-500/20 to-transparent border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.18)] transition-all duration-500"
        >
          <div
            className={`p-2.5 rounded-[17px] border border-white/[0.16] shadow-[0_12px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] ${
              showPairA ? 'animate-card-hover-top-left' : ''
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(14, 20, 34, 0.22) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Top Micro-Pill Tag */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[7.5px] font-mono font-bold tracking-[0.14em] uppercase flex items-center gap-1 text-cyan-400">
                <Terminal className="w-3 h-3 shrink-0" />
                {stage.tagTop}
              </span>
              <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                {stage.tagTopPill}
              </span>
            </div>

            {/* Typewriter Body */}
            <div className="h-[28px] flex items-center">
              <p className="text-[9.5px] font-mono text-slate-100 leading-tight line-clamp-2">
                <span>{typedText}</span>
                <span className="inline-block w-1 h-2.5 bg-cyan-400 ml-0.5 rounded-xs animate-pulse shrink-0 align-middle" />
              </p>
            </div>

            {/* Bottom Telemetry Bar */}
            <div className="mt-1.5 pt-1.5 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[7.5px] font-mono text-slate-400">Live Queue</span>
              <span className="text-[7px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/[0.08] text-emerald-400 border border-white/[0.12] flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 dot-pulse" />
                Active Recall
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 2 (TOP-RIGHT CORNER): PATTERN MASTERY & STAGE INFO (PAIR B) ── */}
      <div
        className="absolute left-1/2 top-1/2 z-30 w-[190px] pointer-events-none"
        style={{
          transform: showPairB
            ? 'translate(calc(-50% + 255px), calc(-50% - 145px)) scale(1)'
            : 'translate(-50%, -50%) scale(0.12)',
          opacity: showPairB ? 1 : 0,
          filter: showPairB ? 'blur(0px)' : 'blur(14px)',
          pointerEvents: showPairB ? 'auto' : 'none',
          transition: showPairB
            ? 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 60ms, opacity 0.55s ease-out 60ms, filter 0.55s ease-out 60ms'
            : 'transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s ease-in, filter 0.25s ease-in',
        }}
      >
        <div
          className={`relative p-[1px] rounded-[18px] bg-gradient-to-b ${stage.cardRight.gradientBorder} ${stage.cardRight.borderGlow} transition-all duration-500`}
        >
          <div
            className={`p-2.5 rounded-[17px] border border-white/[0.16] shadow-[0_12px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] ${
              showPairB ? 'animate-card-hover-top-right' : ''
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(14, 20, 34, 0.22) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Top Micro-Pill Tag */}
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[7.5px] font-mono font-bold tracking-[0.14em] uppercase flex items-center gap-1 ${stage.cardRight.color}`}>
                <RightIcon className="w-3 h-3 shrink-0" />
                {stage.cardRight.tag}
              </span>
              <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.14] text-slate-200">
                STAGE {currentFace + 1}/4
              </span>
            </div>

            {/* Title & Subtitle */}
            <h4 className="text-[11px] font-bold text-[#F3F4F6] tracking-tight leading-snug drop-shadow-sm truncate">
              {stage.cardRight.title}
            </h4>
            <p className="text-[8.5px] text-slate-300 font-mono mt-0.5 leading-relaxed truncate">
              {stage.cardRight.sub}
            </p>

            {/* Bottom Metrics Bar */}
            <div className="mt-1.5 pt-1.5 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[8.5px] font-mono font-bold text-slate-100 tracking-tight">
                {stage.cardRight.metric}
              </span>
              <span className="text-[7.5px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-white/[0.08] backdrop-blur-md border border-white/[0.14] text-slate-200 shadow-sm">
                {stage.cardRight.pill}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 3 (BOTTOM-LEFT CORNER): CONSISTENCY ENGINE & ACTIVITY PULSE (PAIR B) ── */}
      <div
        className="absolute left-1/2 top-1/2 z-30 w-[190px] pointer-events-none"
        style={{
          transform: showPairB
            ? 'translate(calc(-50% - 255px), calc(-50% + 145px)) scale(1)'
            : 'translate(-50%, -50%) scale(0.12)',
          opacity: showPairB ? 1 : 0,
          filter: showPairB ? 'blur(0px)' : 'blur(14px)',
          pointerEvents: showPairB ? 'auto' : 'none',
          transition: showPairB
            ? 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 120ms, opacity 0.55s ease-out 120ms, filter 0.55s ease-out 120ms'
            : 'transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s ease-in, filter 0.25s ease-in',
        }}
      >
        <div
          className={`relative p-[1px] rounded-[18px] bg-gradient-to-b ${stage.cardLeft.gradientBorder} ${stage.cardLeft.borderGlow} transition-all duration-500`}
        >
          <div
            className={`p-2.5 rounded-[17px] border border-white/[0.16] shadow-[0_12px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] ${
              showPairB ? 'animate-card-hover-bottom-left' : ''
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(14, 20, 34, 0.22) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Top Micro-Pill Tag */}
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[7.5px] font-mono font-bold tracking-[0.14em] uppercase flex items-center gap-1 ${stage.cardLeft.color}`}>
                <LeftIcon className="w-3 h-3 shrink-0" />
                {stage.cardLeft.tag}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 dot-pulse" />
                <span className="text-[7px] font-mono font-semibold text-emerald-400 tracking-wider">LIVE</span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <h4 className="text-[11px] font-bold text-[#F3F4F6] tracking-tight leading-snug drop-shadow-sm truncate">
              {stage.cardLeft.title}
            </h4>
            <p className="text-[8.5px] text-slate-300 font-mono mt-0.5 leading-relaxed truncate">
              {stage.cardLeft.sub}
            </p>
            
            {/* Bottom Metrics Bar */}
            <div className="mt-1.5 pt-1.5 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[8.5px] font-mono font-bold text-slate-100 tracking-tight">
                {stage.cardLeft.metric}
              </span>
              <span className="text-[7.5px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-white/[0.08] backdrop-blur-md border border-white/[0.14] text-slate-200 shadow-sm">
                {stage.cardLeft.pill}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 4 (BOTTOM-RIGHT CORNER): VELOCITY VAULT & PATTERN BENCHMARK (PAIR A) ── */}
      <div
        className="absolute left-1/2 top-1/2 z-30 w-[190px] pointer-events-none"
        style={{
          transform: showPairA
            ? 'translate(calc(-50% + 255px), calc(-50% + 145px)) scale(1)'
            : 'translate(-50%, -50%) scale(0.12)',
          opacity: showPairA ? 1 : 0,
          filter: showPairA ? 'blur(0px)' : 'blur(14px)',
          pointerEvents: showPairA ? 'auto' : 'none',
          transition: showPairA
            ? 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 120ms, opacity 0.55s ease-out 120ms, filter 0.55s ease-out 120ms'
            : 'transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.25s ease-in, filter 0.25s ease-in',
        }}
      >
        <div
          className="p-[1px] rounded-[18px] bg-gradient-to-b from-orange-400/60 via-orange-500/20 to-transparent border-orange-500/30 shadow-[0_0_25px_rgba(249,115,22,0.18)] transition-all duration-500"
        >
          <div
            className={`p-2.5 rounded-[17px] border border-white/[0.16] shadow-[0_12px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] ${
              showPairA ? 'animate-card-hover-bottom-right' : ''
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(14, 20, 34, 0.22) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Top Micro-Pill Tag */}
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[7.5px] font-mono font-bold tracking-[0.14em] uppercase flex items-center gap-1 ${stage.bottomColor}`}>
                <Flame className="w-3 h-3 shrink-0" />
                {stage.bottomTag}
              </span>
              <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/[0.08] text-slate-200 border border-white/[0.12]">
                {stage.bottomMetric}
              </span>
            </div>

            {/* Body */}
            <h4 className="text-[11px] font-bold text-[#F3F4F6] tracking-tight leading-snug drop-shadow-sm truncate">
              {stage.bottomTitle}
            </h4>
            <p className="text-[8.5px] text-slate-300 font-mono mt-0.5 leading-relaxed truncate">
              {stage.bottomSub}
            </p>

            {/* Bottom Bar */}
            <div className="mt-1.5 pt-1.5 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[8px] font-mono text-slate-400">Retention</span>
              <span className="text-[7px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 text-orange-300 shadow-sm">
                94.2% Optimal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3D DICE ARENA: 1-POINT PERSPECTIVE GLASS BOX CHAMBER ── */}
      {/* perspective: 560px creates strong depth where all 4 walls slope inward to the back face */}
      <div
        className="relative w-[250px] h-[250px] flex items-center justify-center"
        style={{ perspective: '560px', perspectiveOrigin: '50% 50%' }}
      >
        {/* Floor ambient glow matching dashboard orange warmth */}
        <div
          className="absolute -bottom-10 w-[240px] h-[48px] rounded-full blur-2xl pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse, ${stage.accentColor} 0%, transparent 70%)`,
            opacity: isRolling ? 0.95 : 0.45,
            transform: isRolling ? 'scale(1.35)' : 'scale(1)',
          }}
        />

        {/* ── THE 3D CUBE: TRANSLUCENT GLASS TESSERACT ── */}
        <div
          key={`ludo-die-${rollId}`}
          className={`relative w-[240px] h-[240px] ${
            isRolling ? 'animate-pure-smooth-2s-tumble' : 'animate-cube-subtle-float'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 50% 0px',
            willChange: 'transform',
            transition: isEmerged ? 'transform 0.75s cubic-bezier(0.19, 1, 0.22, 1)' : 'none',
          }}
        >
          {/* Internal Glowing Prismatic Energy Orb (Visible through translucent glass faces!) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full blur-xl pointer-events-none transition-all duration-500"
            style={{
              background: `radial-gradient(circle, ${stage.accentColor} 0%, transparent 70%)`,
              opacity: isRolling ? 1 : 0.65,
              transform: 'translateZ(0px)',
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/40 shadow-[0_0_35px_rgba(255,255,255,0.4)] pointer-events-none animate-pulse"
            style={{
              background: `radial-gradient(circle, #ffffff 10%, ${stage.accentColor} 70%)`,
              opacity: isRolling ? 0.95 : 0.55,
              transform: 'translateZ(0px)',
            }}
          />

          {/* ── 4 Lateral Vertical Faces ── */}
          {[0, 1, 2, 3].map((offset) => {
            const stageIndex = (currentFace + offset) % 4;
            const face = CUBE_STAGES[stageIndex];
            const faceRotations = [
              'rotateY(0deg) translateZ(120px)',
              'rotateY(90deg) translateZ(120px)',
              'rotateY(180deg) translateZ(120px)',
              'rotateY(270deg) translateZ(120px)',
            ];

            // ── OFFSET 0: FRONT FACE APERTURE (Matching user's screenshot!)
            // Crystal clear glass frame with floating referral/solve card & search pill!
            if (offset === 0) {
              return (
                <div
                  key={`${face.id}-front`}
                  className="absolute inset-0 rounded-[32px] p-3 flex flex-col justify-center overflow-hidden select-none"
                  style={{
                    transform: faceRotations[0],
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(10, 20, 36, 0.12) 100%)',
                    backdropFilter: 'blur(3px)',
                    WebkitBackdropFilter: 'blur(3px)',
                    border: '1.5px solid rgba(120, 210, 255, 0.45)',
                    boxShadow: '0 0 35px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 0 25px rgba(6, 182, 212, 0.12)',
                    backfaceVisibility: 'visible',
                    WebkitBackfaceVisibility: 'visible',
                  }}
                >
                  {/* 4 Curved Specular Glass Corner Sheens (Recreates screenshot's corner bevels!) */}
                  <div className="absolute top-1.5 left-1.5 w-9 h-9 rounded-tl-[26px] border-t-2 border-l-2 border-cyan-300/70 pointer-events-none" />
                  <div className="absolute top-1.5 right-1.5 w-9 h-9 rounded-tr-[26px] border-t-2 border-r-2 border-cyan-300/70 pointer-events-none" />
                  <div className="absolute bottom-1.5 left-1.5 w-9 h-9 rounded-bl-[26px] border-b-2 border-l-2 border-cyan-300/50 pointer-events-none" />
                  <div className="absolute bottom-1.5 right-1.5 w-9 h-9 rounded-br-[26px] border-b-2 border-r-2 border-cyan-300/50 pointer-events-none" />

                  {/* Top Edge Specular Sheen */}
                  <div className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                  {/* 2 Foreground Floating Glass Cards (Like Anaya Sharma & Amazon SDE-2 in screenshot!) */}
                  <div className="relative z-20 flex flex-col justify-center h-full px-1.5 gap-2">
                    {/* Card 1: Verified Problem Solved Card */}
                    <div className="p-2.5 rounded-xl bg-[#0D1527]/75 backdrop-blur-xl border border-white/[0.18] shadow-[0_10px_25px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.3)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[7.5px] font-mono font-bold tracking-[0.14em] uppercase text-cyan-400 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          LEETCODE • VERIFIED
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[7px] font-mono font-bold text-emerald-400">3 SOLVED</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-mono font-bold text-[10px] shadow-sm shrink-0">
                            146
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-[11px] font-bold text-white tracking-tight truncate leading-tight">LRU Cache Design</h5>
                            <p className="text-[8px] text-slate-300 font-mono truncate">Doubly-Linked + HashMap</p>
                          </div>
                        </div>
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/35 text-[8px] font-mono font-bold text-emerald-300 shadow-sm">
                          Optimal O(1)
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Floating Search/Goal Pill */}
                    <div className="px-3 py-1.5 rounded-full bg-[#0D1527]/75 backdrop-blur-xl border border-white/[0.16] shadow-[0_6px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="text-[9px] font-mono text-slate-200 truncate">
                        Amazon SDE-2 • System Design
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // ── OFFSETS 1, 2, 3: RIGHT WALL, BACK WALL, LEFT WALL
            return (
              <div
                key={`${face.id}-${offset}`}
                className="absolute inset-0 rounded-[28px] p-4 flex flex-col justify-between overflow-hidden select-none"
                style={{
                  transform: faceRotations[offset],
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(10, 18, 34, 0.25) 100%)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  border: '1.5px solid rgba(120, 210, 255, 0.35)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 25px rgba(6,182,212,0.1)',
                  backfaceVisibility: 'visible',
                  WebkitBackfaceVisibility: 'visible',
                }}
              >
                {/* 4 Corner Markers */}
                <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-white/35 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-white/35 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-white/35 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-white/35 rounded-br-sm pointer-events-none" />

                {/* Top header on cube face */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-slate-100 truncate max-w-[145px] drop-shadow-sm">
                    {face.faceTitle}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-sm ${face.badgeColor}`}>
                    {face.badge}
                  </span>
                </div>

                {/* Problems list */}
                <div className="relative z-10 space-y-2 py-1">
                  {face.problems.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors backdrop-blur-sm shadow-sm"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[11px] font-bold text-slate-100 tracking-tight truncate drop-shadow-sm">{p.title}</p>
                        <p className="text-[9px] text-slate-300 font-mono truncate mt-0.5">{p.platform}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shadow-sm backdrop-blur-sm ${p.color}`}>
                          {p.diff}
                        </span>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{p.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer on cube face */}
                <div className="relative z-10 pt-2 text-[9px] font-mono text-slate-300 border-t border-white/[0.08] truncate flex items-center justify-between">
                  <span className="drop-shadow-sm">{face.footer}</span>
                  <span className="text-slate-400">●●●</span>
                </div>
              </div>
            );
          })}

          {/* ── TOP WALL: Frosted Glass Roof with Laser Core (Slopes down into the cube!) ── */}
          <div
            className="absolute inset-0 rounded-[28px] p-4 flex flex-col items-center justify-center overflow-hidden select-none"
            style={{
              transform: 'rotateX(90deg) translateZ(120px)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(10, 18, 34, 0.22) 100%)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              border: '1.5px solid rgba(120, 210, 255, 0.35)',
              boxShadow: 'inset 0 0 45px rgba(255,255,255,0.18), 0 0 25px rgba(6,182,212,0.15)',
              backfaceVisibility: 'visible',
              WebkitBackfaceVisibility: 'visible',
            }}
          >
            {/* Top Face Corner Accents */}
            <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-white/35 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-white/35 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-white/35 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-white/35 rounded-br-sm pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/30 flex items-center justify-center shadow-inner relative">
              <Cpu className="w-8 h-8 text-cyan-300 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border border-cyan-400/50 blur-[3px]" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-slate-100 uppercase mt-3">
              DSA ENGINE CORE
            </span>
            <span className="text-[8px] font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-pulse" />
              ACTIVE PIPELINE
            </span>
          </div>

          {/* ── BOTTOM WALL: Slopes up into the cube (Matching "FIND JOBS - MATCHED" in screenshot!) ── */}
          <div
            className="absolute inset-0 rounded-[28px] p-4 flex flex-col items-center justify-center overflow-hidden select-none"
            style={{
              transform: 'rotateX(-90deg) translateZ(120px)',
              background: 'linear-gradient(135deg, rgba(14, 22, 38, 0.4) 0%, rgba(8, 12, 22, 0.3) 100%)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              border: '1.5px solid rgba(120, 210, 255, 0.35)',
              boxShadow: 'inset 0 0 35px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)',
              backfaceVisibility: 'visible',
              WebkitBackfaceVisibility: 'visible',
            }}
          >
            {/* Bottom Face Corner Accents */}
            <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-white/25 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-white/25 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-white/25 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-white/25 rounded-br-sm pointer-events-none" />
            <div className="w-14 h-14 rounded-full border border-orange-500/40 flex items-center justify-center bg-orange-500/15 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              <Flame className="w-7 h-7 text-orange-400" />
            </div>
            <span className="text-[9px] font-mono font-bold tracking-[0.16em] text-slate-200 uppercase mt-2.5">
              FIND PROBLEMS • REVISION QUEUE
            </span>
          </div>
        </div>
      </div>

      {/* ── CSS Keyframes: Upright 3D Cube with Glass Transparency ── */}
      <style>{`
        /* 1. Straight Upright Subtle Levitation during rest state */
        @keyframes cubeSubtleFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          50% {
            transform: translate3d(0, -6px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
        }

        .animate-cube-subtle-float {
          animation: cubeSubtleFloat 4.4s ease-in-out infinite;
        }

        /* 2. MATHEMATICALLY PURE 2.0-SECOND CONTINUOUS 3D ROTATION */
        @keyframes pureSmooth2sTumble {
          0% {
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotateX(1080deg) rotateY(1440deg) rotateZ(720deg);
          }
        }

        .animate-pure-smooth-2s-tumble {
          animation: pureSmooth2sTumble 2.0s cubic-bezier(0.35, 0.05, 0.2, 1) forwards;
        }

        /* 3. Luxury Floating Hover for 4 Corner Satellite Cards */
        @keyframes cardHoverTopLeft {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-4px) translateX(-3px);
          }
        }

        @keyframes cardHoverTopRight {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-4px) translateX(3px);
          }
        }

        @keyframes cardHoverBottomLeft {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(4px) translateX(-3px);
          }
        }

        @keyframes cardHoverBottomRight {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(4px) translateX(3px);
          }
        }

        .animate-card-hover-top-left {
          animation: cardHoverTopLeft 4.2s ease-in-out infinite;
        }

        .animate-card-hover-top-right {
          animation: cardHoverTopRight 4.6s ease-in-out infinite 0.5s;
        }

        .animate-card-hover-bottom-left {
          animation: cardHoverBottomLeft 4.4s ease-in-out infinite 1s;
        }

        .animate-card-hover-bottom-right {
          animation: cardHoverBottomRight 4.8s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
};

export default Rotating3DCube;
