import React, { useState, useEffect } from 'react';
import { Flame, Brain, CheckCircle2, Target, Sparkles, Trophy, GitCommit, Cpu, Terminal } from 'lucide-react';
import { colors } from '../../theme/colors';

/**
 * Authentic DSA Concept Data for the 4 Cube States
 */
const CUBE_STAGES = [
  {
    id: 0,
    faceTitle: 'RECENT SOLVES • LEETCODE',
    badge: 'OPTIMAL O(1)',
    badgeColor: 'text-easy bg-easy/12 border-easy/25',
    accentColor: colors.easy,
    problems: [
      { title: '146. LRU Cache', platform: 'Doubly-Linked + HashMap', diff: 'Med', time: '18m', color: 'text-medium bg-medium/12 border-medium/25' },
      { title: '42. Trapping Rain Water', platform: 'Two Pointers Optimal', diff: 'Hard', time: '32m', color: 'text-hard bg-hard/12 border-hard/25' },
      { title: '23. Merge k Sorted Lists', platform: 'Min-Heap Priority Queue', diff: 'Hard', time: '25m', color: 'text-hard bg-hard/12 border-hard/25' },
    ],
    footer: 'Amortized O(1) runtime verified without locks',
    cardLeft: {
      tag: 'SUBMISSION VERIFIED',
      title: 'LRU Cache Design',
      sub: 'Doubly Linked List + Hash Index',
      metric: '18m solve • 98.4% Speed',
      pill: 'Optimal O(1)',
      icon: CheckCircle2,
      color: 'text-easy',
    },
    cardRight: {
      tag: 'VELOCITY PULSE',
      title: 'Active Consistency',
      sub: '7-Day Continuous Practice Streak',
      metric: 'Top 3.8% Engineers',
      pill: 'Active Streak',
      icon: Flame,
      color: 'text-accent',
    },
    tagTop: 'RUNTIME BOUND',
    tagTopPill: 'O(1) Access',
    bottomTag: 'ALGORITHM PATTERN',
    bottomTitle: 'Fast-Slow Pointers & Sliding Window',
    bottomSub: 'Verified across 35 LeetCode test suites',
    bottomMetric: '98.4% Efficiency',
    bottomColor: 'text-easy',
  },
  {
    id: 1,
    faceTitle: 'SPACED REPETITION ENGINE',
    badge: 'R = e^(-t/S)',
    badgeColor: 'text-accent bg-accent/12 border-accent/25',
    accentColor: colors.accent,
    problems: [
      { title: '210. Course Schedule II', platform: "Kahn's Topological Sort", diff: 'Due: 24h', time: 'Recall', color: 'text-accent bg-accent/12 border-accent/25' },
      { title: '139. Word Break', platform: 'Dynamic Programming', diff: 'Due: 3d', time: 'Recall', color: 'text-medium bg-medium/12 border-medium/25' },
      { title: '4. Median of Two Arrays', platform: 'Binary Search Partition', diff: 'Due: 7d', time: 'Review', color: 'text-hard bg-hard/12 border-hard/25' },
    ],
    footer: 'Active recall scheduling via forgetting curve',
    cardLeft: {
      tag: 'EBBINGHAUS ENGINE',
      title: 'Topological Sort Due',
      sub: 'Directed Acyclic Graph Cycle Check',
      metric: 'Retention Rate: 94.2%',
      pill: '3-Day Interval',
      icon: Brain,
      color: 'text-accent',
    },
    cardRight: {
      tag: 'DETERMINISTIC QUEUE',
      title: 'Adaptive Spaced Queue',
      sub: 'Formula Escalates Struggled Topics',
      metric: '18 Problems Scheduled',
      pill: 'Zero Guesswork',
      icon: Sparkles,
      color: 'text-accent',
    },
    tagTop: 'FORGETTING CURVE',
    tagTopPill: 'R = e^(-t/S)',
    bottomTag: 'ACTIVE SCHEDULER',
    bottomTitle: 'Ebbinghaus Exponential Decay Curve',
    bottomSub: 'Dynamically scales revision intervals on recall error',
    bottomMetric: '94.2% Retention',
    bottomColor: 'text-accent',
  },
  {
    id: 2,
    faceTitle: 'TOPIC WEAKNESS MATRIX',
    badge: 'AGGREGATION',
    badgeColor: 'text-medium bg-medium/12 border-medium/25',
    accentColor: colors.medium,
    problems: [
      { title: 'Dynamic Programming', platform: '14 Recorded Solves', diff: '42% Gap', time: 'Rank #1', color: 'text-hard bg-hard/12 border-hard/25' },
      { title: 'Graph Traversal (BFS/DFS)', platform: '12 Recorded Solves', diff: '28% Gap', time: 'Rank #2', color: 'text-medium bg-medium/12 border-medium/25' },
      { title: 'Binary Search Trees', platform: '18 Recorded Solves', diff: '92% Rate', time: 'Mastered', color: 'text-easy bg-easy/12 border-easy/25' },
    ],
    footer: 'MongoDB aggregation groups attempts by struggle ratio',
    cardLeft: {
      tag: 'WEAKNESS RADAR',
      title: 'Dynamic Programming',
      sub: '0/1 Knapsack & Interval Subproblems',
      metric: 'Struggle Ratio: 42%',
      pill: 'High Priority',
      icon: Target,
      color: 'text-medium',
    },
    cardRight: {
      tag: 'MASTERY DOMAIN',
      title: 'Binary Tree Traversal',
      sub: '18 Problems cataloged & solved',
      metric: '92% Clean First-Pass',
      pill: 'Interview Ready',
      icon: Trophy,
      color: 'text-easy',
    },
    tagTop: 'AGGREGATION RADAR',
    tagTopPill: 'Analytics',
    bottomTag: 'SYLLABUS GAP',
    bottomTitle: 'Dynamic Programming Knapsack Focus',
    bottomSub: 'Realtime aggregation pipelines mapping gaps',
    bottomMetric: '42% Struggle Gap',
    bottomColor: 'text-medium',
  },
  {
    id: 3,
    faceTitle: 'PREPARATION VELOCITY',
    badge: '365D HEATMAP',
    badgeColor: 'text-easy bg-easy/12 border-easy/25',
    accentColor: colors.easy,
    problems: [
      { title: '30-Day Activity Cadence', platform: 'Daily Timestamp Log', diff: '29 Active', time: '96.7%', color: 'text-easy bg-easy/12 border-easy/25' },
      { title: 'Tier Mix (12E / 18M / 7H)', platform: '37 Total Problems', diff: 'Balanced', time: 'Optimal', color: 'text-accent bg-accent/12 border-accent/25' },
      { title: 'Target Benchmark', platform: 'Blind 75 & NeetCode 150', diff: 'On Track', time: 'Top Tier', color: 'text-accent bg-accent/12 border-accent/25' },
    ],
    footer: 'Contribution grid and daily velocity tracker',
    cardLeft: {
      tag: 'CONSISTENCY ENGINE',
      title: '365-Day Activity Pulse',
      sub: 'Sustained Daily Engineering Cadence',
      metric: '2.4 Solves / Active Day',
      pill: 'Top 4% Velocity',
      icon: Flame,
      color: 'text-accent',
    },
    cardRight: {
      tag: 'PATTERN MASTERY',
      title: 'Curated Pattern Corpus',
      sub: 'Sliding Window, Monotonic Stack, Graphs',
      metric: '37 Curated Solutions',
      pill: 'Production Grade',
      icon: GitCommit,
      color: 'text-easy',
    },
    tagTop: 'PRACTICE CADENCE',
    tagTopPill: '2.4 Solves / Day',
    bottomTag: 'VELOCITY PULSE',
    bottomTitle: '29 Active Days Logged in Last 30',
    bottomSub: 'High consistency correlates with 94% interview pass rate',
    bottomMetric: 'Top 4% Cadence',
    bottomColor: 'text-easy',
  },
];

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

  // Typewriter effect state
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setAnimationState('collapsing');

      setTimeout(() => {
        setRollId((prev) => prev + 1);
        setAnimationState('rolling');

        setTimeout(() => {
          setCurrentFace((prev) => (prev + 1) % 4);
          setAnimationState('emerged');
        }, 1800);
      }, 400);
    }, 7000);

    return () => clearInterval(cycleTimer);
  }, []);

  useEffect(() => {
    const fullText = TYPEWRITER_PHRASES[typewriterIndex];
    let timer;

    if (!isDeleting && typedText.length < fullText.length) {
      timer = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 30);
    } else if (!isDeleting && typedText.length === fullText.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2500);
    } else if (isDeleting && typedText.length > 0) {
      timer = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length - 1));
      }, 15);
    } else if (isDeleting && typedText.length === 0) {
      setIsDeleting(false);
      setTypewriterIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, typewriterIndex]);

  const stage = CUBE_STAGES[currentFace];
  const isEmerged = animationState === 'emerged';
  const isRolling = animationState === 'rolling';

  const showPairA = isEmerged && currentFace % 2 === 0;
  const showPairB = isEmerged && currentFace % 2 !== 0;

  const LeftIcon = stage.cardLeft.icon;
  const RightIcon = stage.cardRight.icon;

  return (
    <div className="relative w-full max-w-[500px] h-[360px] flex items-center justify-center select-none">
      {/* ── CARD 1 (TOP-LEFT CORNER): TYPEWRITER TERMINAL (PAIR A) ── */}
      <div
        className="absolute left-1/2 top-1/2 z-30 w-[200px] pointer-events-none"
        style={{
          transform: showPairA
            ? 'translate(calc(-50% - 210px), calc(-50% - 110px)) scale(1)'
            : 'translate(-50%, -50%) scale(0.12)',
          opacity: showPairA ? 1 : 0,
          pointerEvents: showPairA ? 'auto' : 'none',
          transition: showPairA
            ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out'
            : 'transform 0.3s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease-in',
        }}
      >
        <div className="p-3 rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1 text-accent">
              <Terminal className="w-3.5 h-3.5 shrink-0" />
              {stage.tagTop}
            </span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-line">
              {stage.tagTopPill}
            </span>
          </div>

          <div className="h-[36px] flex items-center">
            <p className="text-xs font-mono text-text leading-tight line-clamp-2">
              <span>{typedText}</span>
              <span className="inline-block w-1 h-3 bg-accent ml-0.5 animate-pulse shrink-0 align-middle" />
            </p>
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-line flex items-center justify-between text-xs text-text-secondary">
            <span>Live Queue</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-2 text-easy border border-line flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-easy" />
              Active Recall
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD 2 (TOP-RIGHT CORNER): PATTERN MASTERY & STAGE INFO (PAIR B) ── */}
      <div
        className="absolute left-1/2 top-1/2 z-30 w-[200px] pointer-events-none"
        style={{
          transform: showPairB
            ? 'translate(calc(-50% + 210px), calc(-50% - 110px)) scale(1)'
            : 'translate(-50%, -50%) scale(0.12)',
          opacity: showPairB ? 1 : 0,
          pointerEvents: showPairB ? 'auto' : 'none',
          transition: showPairB
            ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out'
            : 'transform 0.3s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease-in',
        }}
      >
        <div className="p-3 rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1 ${stage.cardRight.color}`}>
              <RightIcon className="w-3.5 h-3.5 shrink-0" />
              {stage.cardRight.tag}
            </span>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-surface-2 border border-line text-text-secondary">
              STAGE {currentFace + 1}/4
            </span>
          </div>

          <h4 className="text-xs font-semibold text-text tracking-tight truncate">
            {stage.cardRight.title}
          </h4>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {stage.cardRight.sub}
          </p>

          <div className="mt-1.5 pt-1.5 border-t border-line flex items-center justify-between text-xs">
            <span className="text-text font-medium">
              {stage.cardRight.metric}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-2 border border-line text-text-secondary">
              {stage.cardRight.pill}
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD 3 (BOTTOM-LEFT CORNER): CONSISTENCY ENGINE (PAIR B) ── */}
      <div
        className="absolute left-1/2 top-1/2 z-30 w-[200px] pointer-events-none"
        style={{
          transform: showPairB
            ? 'translate(calc(-50% - 210px), calc(-50% + 110px)) scale(1)'
            : 'translate(-50%, -50%) scale(0.12)',
          opacity: showPairB ? 1 : 0,
          pointerEvents: showPairB ? 'auto' : 'none',
          transition: showPairB
            ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out'
            : 'transform 0.3s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease-in',
        }}
      >
        <div className="p-3 rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1 ${stage.cardLeft.color}`}>
              <LeftIcon className="w-3.5 h-3.5 shrink-0" />
              {stage.cardLeft.tag}
            </span>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-surface-2 border border-line text-text-secondary">
              PULSE
            </span>
          </div>

          <h4 className="text-xs font-semibold text-text tracking-tight truncate">
            {stage.cardLeft.title}
          </h4>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {stage.cardLeft.sub}
          </p>

          <div className="mt-1.5 pt-1.5 border-t border-line flex items-center justify-between text-xs">
            <span className="text-text font-medium">
              {stage.cardLeft.metric}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-2 border border-line text-text-secondary">
              {stage.cardLeft.pill}
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD 4 (BOTTOM-RIGHT CORNER): ALGORITHM PATTERN (PAIR A) ── */}
      <div
        className="absolute left-1/2 top-1/2 z-30 w-[200px] pointer-events-none"
        style={{
          transform: showPairA
            ? 'translate(calc(-50% + 210px), calc(-50% + 110px)) scale(1)'
            : 'translate(-50%, -50%) scale(0.12)',
          opacity: showPairA ? 1 : 0,
          pointerEvents: showPairA ? 'auto' : 'none',
          transition: showPairA
            ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out'
            : 'transform 0.3s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease-in',
        }}
      >
        <div className="p-3 rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1 text-easy">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              {stage.bottomTag}
            </span>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-surface-2 border border-line text-text-secondary">
              {stage.bottomMetric}
            </span>
          </div>

          <h4 className="text-xs font-semibold text-text tracking-tight truncate">
            {stage.bottomTitle}
          </h4>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {stage.bottomSub}
          </p>

          <div className="mt-1.5 pt-1.5 border-t border-line flex items-center justify-between text-xs text-text-secondary">
            <span>Pattern Verified</span>
            <span className="text-easy font-medium">98.4% Efficiency</span>
          </div>
        </div>
      </div>

      {/* ── CENTRAL 3D CUBE STAGE ── */}
      <div
        className="relative flex items-center justify-center"
        style={{ perspective: '1100px' }}
      >
        <div
          key={`ludo-die-${rollId}`}
          className={`relative w-[220px] h-[220px] ${
            isRolling ? 'animate-pure-smooth-2s-tumble' : 'animate-cube-subtle-float'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 50% 0px',
            willChange: 'transform',
            transition: isEmerged ? 'transform 0.75s cubic-bezier(0.19, 1, 0.22, 1)' : 'none',
          }}
        >
          {/* 4 Lateral Faces */}
          {[0, 1, 2, 3].map((offset) => {
            const stageIndex = (currentFace + offset) % 4;
            const face = CUBE_STAGES[stageIndex];
            const faceRotations = [
              'rotateY(0deg) translateZ(110px)',
              'rotateY(90deg) translateZ(110px)',
              'rotateY(180deg) translateZ(110px)',
              'rotateY(270deg) translateZ(110px)',
            ];

            if (offset === 0) {
              return (
                <div
                  key={`${face.id}-front`}
                  className="absolute inset-0 rounded-xl p-3 flex flex-col justify-center overflow-hidden select-none bg-surface border border-line"
                  style={{
                    transform: faceRotations[0],
                    backfaceVisibility: 'visible',
                  }}
                >
                  <div className="flex flex-col justify-center h-full px-1 gap-2">
                    <div className="p-2.5 rounded-lg bg-surface-2 border border-line">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold tracking-wide uppercase text-accent flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-easy" />
                          LEETCODE • VERIFIED
                        </span>
                        <span className="text-xs font-medium text-easy">3 SOLVED</span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-surface border border-line flex items-center justify-center text-text font-mono font-semibold text-xs shrink-0">
                            146
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-text truncate">LRU Cache Design</h5>
                            <p className="text-xs text-text-secondary truncate">Doubly-Linked + HashMap</p>
                          </div>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-easy/12 text-easy text-xs font-medium">
                          Optimal O(1)
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-line flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-xs text-text truncate">
                        Amazon SDE-2 • System Design
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${face.id}-${offset}`}
                className="absolute inset-0 rounded-xl p-3.5 flex flex-col justify-between overflow-hidden select-none bg-surface border border-line"
                style={{
                  transform: faceRotations[offset],
                  backfaceVisibility: 'visible',
                }}
              >
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text truncate max-w-[130px]">
                    {face.faceTitle}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${face.badgeColor}`}>
                    {face.badge}
                  </span>
                </div>

                <div className="space-y-1.5 py-1">
                  {face.problems.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-surface-2 border border-line"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-text truncate">{p.title}</p>
                        <p className="text-xs text-text-secondary truncate">{p.platform}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${p.color}`}>
                          {p.diff}
                        </span>
                        <p className="text-xs text-muted tabular-nums mt-0.5">{p.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs text-text-secondary border-t border-line truncate flex items-center justify-between">
                  <span>{face.footer}</span>
                  <span className="text-muted">●●●</span>
                </div>
              </div>
            );
          })}

          {/* Top Face */}
          <div
            className="absolute inset-0 rounded-xl p-4 flex flex-col items-center justify-center overflow-hidden select-none bg-surface border border-line"
            style={{
              transform: 'rotateX(90deg) translateZ(110px)',
              backfaceVisibility: 'visible',
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-surface-2 border border-line flex items-center justify-center">
              <Cpu className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-text uppercase mt-2">
              DSA ENGINE CORE
            </span>
            <span className="text-xs text-easy mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-easy" />
              ACTIVE PIPELINE
            </span>
          </div>

          {/* Bottom Face */}
          <div
            className="absolute inset-0 rounded-xl p-4 flex flex-col items-center justify-center overflow-hidden select-none bg-surface border border-line"
            style={{
              transform: 'rotateX(-90deg) translateZ(110px)',
              backfaceVisibility: 'visible',
            }}
          >
            <div className="w-12 h-12 rounded-full border border-accent/30 flex items-center justify-center bg-accent/12">
              <Flame className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-text-secondary uppercase mt-2">
              REVISION QUEUE
            </span>
          </div>
        </div>
      </div>

      <style>{`
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

        @keyframes pureSmooth2sTumble {
          0% {
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotateX(1080deg) rotateY(1440deg) rotateZ(720deg);
          }
        }

        .animate-pure-smooth-2s-tumble {
          animation: pureSmooth2sTumble 1.8s cubic-bezier(0.35, 0.05, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Rotating3DCube;
