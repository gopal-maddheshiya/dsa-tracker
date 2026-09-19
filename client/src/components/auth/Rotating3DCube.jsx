import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flame, Brain, CheckCircle2, Target, Sparkles, Trophy, GitCommit, Cpu, Terminal } from 'lucide-react';
import { colors } from '../../theme/colors';

/**
 * Authentic DSA Concept Data for the 4 Interactive Cube Stages.
 * Every stage represents a core capability of the DSA Tracker platform.
 */
const CUBE_STAGES = [
  {
    id: 0,
    faceTitle: 'RECENT SOLVES • LEETCODE',
    badge: 'OPTIMAL O(1)',
    badgeColor: 'text-easy bg-easy/12 border-easy/25',
    accentColor: colors.easy,
    stageLabel: 'Solves',
    hero: {
      kicker: 'LEETCODE VERIFIED',
      kickerIcon: CheckCircle2,
      kickerColor: 'text-easy',
      statusText: '3 SOLVED',
      statusColor: 'text-easy',
      num: '146',
      title: 'LRU Cache Design',
      sub: 'Doubly-Linked List + Hash Map',
      pill: 'Optimal O(1)',
      pillColor: 'bg-easy/12 text-easy',
      company: 'Amazon SDE-2',
      tag: 'DESIGN',
    },
    terminal: {
      tag: 'RUNTIME BOUND',
      pill: 'O(1) Access',
      message: 'Verifying LRU Cache: Doubly-linked list achieves guaranteed O(1) eviction.',
      subLeft: 'Live Queue',
      subRight: 'Active Recall',
      subRightDot: 'bg-easy text-easy',
    },
    insight: {
      tag: 'ALGORITHM PATTERN',
      pill: '98.4% Efficiency',
      title: 'Sliding Window & Pointers',
      sub: 'Verified across 35 LeetCode test suites',
      footerLeft: 'Pattern Verified',
      footerRight: 'O(1) Aux Space',
      tagColor: 'text-easy',
    },
    problems: [
      { title: '146. LRU Cache', platform: 'Doubly-Linked + HashMap', diff: 'Med', time: '18m', color: 'text-medium bg-medium/12 border-medium/25' },
      { title: '42. Trapping Rain Water', platform: 'Two Pointers Optimal', diff: 'Hard', time: '32m', color: 'text-hard bg-hard/12 border-hard/25' },
      { title: '23. Merge k Sorted Lists', platform: 'Min-Heap Priority Queue', diff: 'Hard', time: '25m', color: 'text-hard bg-hard/12 border-hard/25' },
    ],
    footer: 'Amortized O(1) runtime verified without locks',
  },
  {
    id: 1,
    faceTitle: 'SPACED REPETITION ENGINE',
    badge: 'R = e^(-t/S)',
    badgeColor: 'text-accent bg-accent/12 border-accent/25',
    accentColor: colors.accent,
    stageLabel: 'Spaced',
    hero: {
      kicker: 'ACTIVE RECALL QUEUE',
      kickerIcon: Brain,
      kickerColor: 'text-accent',
      statusText: 'DUE TODAY',
      statusColor: 'text-accent',
      num: '210',
      title: 'Course Schedule II',
      sub: "Kahn's Topological Sort (DAG)",
      pill: 'Recall: 24h',
      pillColor: 'bg-accent/12 text-accent',
      company: 'Uber Technologies',
      tag: 'GRAPH',
    },
    terminal: {
      tag: 'FORGETTING CURVE',
      pill: 'R = e^(-t/S)',
      message: 'Forgetting curve active: Escalating Course Schedule II interval to 3-day recall.',
      subLeft: 'Recall Interval',
      subRight: '94.2% Retention',
      subRightDot: 'bg-accent text-accent',
    },
    insight: {
      tag: 'DETERMINISTIC QUEUE',
      pill: '18 Scheduled',
      title: 'Adaptive Decay Scheduling',
      sub: 'Dynamically scales revision intervals',
      footerLeft: 'Queue Health',
      footerRight: 'Zero Guesswork',
      tagColor: 'text-accent',
    },
    problems: [
      { title: '210. Course Schedule II', platform: "Kahn's Topological Sort", diff: 'Due: 24h', time: 'Recall', color: 'text-accent bg-accent/12 border-accent/25' },
      { title: '139. Word Break', platform: 'Dynamic Programming', diff: 'Due: 3d', time: 'Recall', color: 'text-medium bg-medium/12 border-medium/25' },
      { title: '4. Median of Two Arrays', platform: 'Binary Search Partition', diff: 'Due: 7d', time: 'Review', color: 'text-hard bg-hard/12 border-hard/25' },
    ],
    footer: 'Active recall scheduling via forgetting curve',
  },
  {
    id: 2,
    faceTitle: 'TOPIC WEAKNESS MATRIX',
    badge: 'ANALYTICS',
    badgeColor: 'text-medium bg-medium/12 border-medium/25',
    accentColor: colors.medium,
    stageLabel: 'Topics',
    hero: {
      kicker: 'WEAKNESS RADAR SCAN',
      kickerIcon: Target,
      kickerColor: 'text-medium',
      statusText: '42% GAP',
      statusColor: 'text-danger',
      num: 'DP',
      title: 'Dynamic Programming',
      sub: '0/1 Knapsack & Subproblems',
      pill: 'Priority #1',
      pillColor: 'bg-danger/12 text-danger',
      company: 'Google Core',
      tag: 'ALGO',
    },
    terminal: {
      tag: 'TOPIC MATRIX',
      pill: 'Gap: 42%',
      message: 'Topic matrix alert: Dynamic Programming struggle at 42% - Knapsack prioritized.',
      subLeft: 'Weakness Radar',
      subRight: 'Radar Active',
      subRightDot: 'bg-danger text-danger',
    },
    insight: {
      tag: 'SYLLABUS RADAR',
      pill: 'Realtime Scan',
      title: 'Knapsack & Subproblems',
      sub: 'Aggregation pipelines mapping readiness',
      footerLeft: 'Focus Area',
      footerRight: 'High Priority',
      tagColor: 'text-medium',
    },
    problems: [
      { title: 'Dynamic Programming', platform: '14 Recorded Solves', diff: '42% Gap', time: 'Rank #1', color: 'text-hard bg-hard/12 border-hard/25' },
      { title: 'Graph Traversal (BFS/DFS)', platform: '12 Recorded Solves', diff: '28% Gap', time: 'Rank #2', color: 'text-medium bg-medium/12 border-medium/25' },
      { title: 'Binary Search Trees', platform: '18 Recorded Solves', diff: '92% Rate', time: 'Mastered', color: 'text-easy bg-easy/12 border-easy/25' },
    ],
    footer: 'MongoDB aggregation groups attempts by struggle ratio',
  },
  {
    id: 3,
    faceTitle: 'PREPARATION VELOCITY',
    badge: '365D HEATMAP',
    badgeColor: 'text-easy bg-easy/12 border-easy/25',
    accentColor: colors.easy,
    stageLabel: 'Velocity',
    hero: {
      kicker: 'VELOCITY PULSE 365D',
      kickerIcon: Flame,
      kickerColor: 'text-accent',
      statusText: 'TOP 3.8%',
      statusColor: 'text-accent',
      num: '36d',
      title: '36-Day Streak',
      sub: 'Daily Engineering Cadence',
      pill: '2.4 / Day',
      pillColor: 'bg-accent/12 text-accent',
      company: 'Meta Platforms',
      tag: 'CADENCE',
    },
    terminal: {
      tag: 'VELOCITY CADENCE',
      pill: 'Top 3.8%',
      message: 'Velocity pulse: 36-day streak with 2.4 daily solves in top tier consistency bracket.',
      subLeft: 'Active Days',
      subRight: '55 / 140d Logged',
      subRightDot: 'bg-accent text-accent',
    },
    insight: {
      tag: 'PRACTICE MOMENTUM',
      pill: '96.7% Consistency',
      title: '35 Problems Solved',
      sub: 'High consistency matches 94% pass rate',
      footerLeft: 'Benchmark',
      footerRight: 'Blind 75 Ready',
      tagColor: 'text-easy',
    },
    problems: [
      { title: '30-Day Activity Cadence', platform: 'Daily Timestamp Log', diff: '29 Active', time: '96.7%', color: 'text-easy bg-easy/12 border-easy/25' },
      { title: 'Tier Mix (11E / 17M / 7H)', platform: '35 Total Problems', diff: 'Balanced', time: 'Optimal', color: 'text-accent bg-accent/12 border-accent/25' },
      { title: 'Target Benchmark', platform: 'Blind 75 & NeetCode 150', diff: 'On Track', time: 'Top Tier', color: 'text-accent bg-accent/12 border-accent/25' },
    ],
    footer: 'Contribution grid and daily velocity tracker',
  },
];

const Rotating3DCube = () => {
  const [currentFace, setCurrentFace] = useState(0);
  const [animationState, setAnimationState] = useState('emerged');
  const [rollId, setRollId] = useState(0);

  // Synchronized typewriter state
  const [typedText, setTypedText] = useState('');
  const typingTimerRef = useRef(null);
  const cycleTimeoutRef = useRef(null);
  const animTimeoutRef = useRef(null);

  const triggerRollTo = useCallback((nextFace) => {
    if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);

    setAnimationState('collapsing');

    animTimeoutRef.current = setTimeout(() => {
      setRollId((prev) => prev + 1);
      setAnimationState('rolling');

      animTimeoutRef.current = setTimeout(() => {
        setCurrentFace(nextFace);
        setAnimationState('emerged');
      }, 1050);
    }, 150);
  }, []);

  const rotateToFace = (targetFace) => {
    if (currentFace === targetFace && animationState === 'emerged') return;
    triggerRollTo(targetFace);
  };

  // Automatic cycle through stages (every 5.8s after emerging)
  useEffect(() => {
    if (animationState !== 'emerged') return;

    cycleTimeoutRef.current = setTimeout(() => {
      triggerRollTo((currentFace + 1) % CUBE_STAGES.length);
    }, 5800);

    return () => {
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
    };
  }, [currentFace, animationState, triggerRollTo]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  // Typewriter effect synchronized directly with the active stage
  useEffect(() => {
    const targetMessage = CUBE_STAGES[currentFace].terminal.message;
    setTypedText('');
    let charIdx = 0;

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      if (charIdx < targetMessage.length) {
        setTypedText(targetMessage.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(typingTimerRef.current);
      }
    }, 18);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [currentFace]);

  const stage = CUBE_STAGES[currentFace];
  const isEmerged = animationState === 'emerged';
  const isRolling = animationState === 'rolling';

  return (
    <div className="relative w-full max-w-[660px] flex flex-col items-center select-none py-2">
      {/* Subtle Radial Glow Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div
          className="w-72 h-72 rounded-full opacity-20 blur-3xl transition-all duration-1000"
          style={{ background: stage.accentColor }}
        />
      </div>

      {/* ── 3D STAGE CONTAINER (GUARANTEED ZERO-OVERLAP GEOMETRY) ── */}
      <div className="relative w-full h-[370px] flex items-center justify-center">

        {/* ── CARD 1 (TOP-LEFT): SYNCHRONIZED RUNTIME TERMINAL ── */}
        <div
          className="absolute top-2 left-0 z-20 w-[205px] transition-all duration-500 ease-out"
          style={{
            transform: isEmerged ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
            opacity: isEmerged ? 1 : 0.45,
            filter: isRolling ? 'blur(0.5px)' : 'none',
          }}
        >
          <div className="p-3 rounded-xl border border-line bg-surface/90 backdrop-blur-sm shadow-card hover:border-line transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 text-accent">
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                {stage.terminal.tag}
              </span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-line">
                {stage.terminal.pill}
              </span>
            </div>

            <div className="min-h-[44px] flex items-start">
              <p className="text-xs font-mono text-text leading-snug break-words">
                <span>{typedText}</span>
                <span className="inline-block w-1 h-3 bg-accent ml-0.5 animate-pulse shrink-0 align-middle" />
              </p>
            </div>

            <div className="mt-2 pt-1.5 border-t border-line flex items-center justify-between text-xs text-text-secondary">
              <span>{stage.terminal.subLeft}</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-2 border border-line flex items-center gap-1 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${stage.terminal.subRightDot.split(' ')[0]}`} />
                <span className={stage.terminal.subRightDot.split(' ')[1]}>{stage.terminal.subRight}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── CARD 2 (BOTTOM-RIGHT): ALGORITHM PATTERN & INSIGHT ── */}
        <div
          className="absolute bottom-2 right-0 z-20 w-[205px] transition-all duration-500 ease-out"
          style={{
            transform: isEmerged ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
            opacity: isEmerged ? 1 : 0.45,
            filter: isRolling ? 'blur(0.5px)' : 'none',
          }}
        >
          <div className="p-3 rounded-xl border border-line bg-surface/90 backdrop-blur-sm shadow-card hover:border-line transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 ${stage.insight.tagColor}`}>
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                {stage.insight.tag}
              </span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-surface-2 border border-line text-text-secondary">
                {stage.insight.pill}
              </span>
            </div>

            <h4 className="text-xs font-semibold text-text tracking-tight leading-snug">
              {stage.insight.title}
            </h4>
            <p className="text-xs text-text-secondary mt-0.5 leading-snug">
              {stage.insight.sub}
            </p>

            <div className="mt-2 pt-1.5 border-t border-line flex items-center justify-between text-xs text-text-secondary">
              <span>{stage.insight.footerLeft}</span>
              <span className="text-easy font-medium text-xs">
                {stage.insight.footerRight}
              </span>
            </div>
          </div>
        </div>

        {/* ── CENTRAL 3D CUBE STAGE ── */}
        <div
          className="relative flex items-center justify-center z-10"
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

              // Active front-facing card: Render dynamic stage hero!
              if (offset === 0) {
                const HeroIcon = face.hero.kickerIcon;
                return (
                  <div
                    key={`${face.id}-front`}
                    className="absolute inset-0 rounded-xl p-3 flex flex-col justify-between overflow-hidden select-none bg-surface border border-line shadow-card"
                    style={{
                      transform: faceRotations[0],
                      backfaceVisibility: 'visible',
                    }}
                  >
                    {/* Top Status Header */}
                    <div className="flex items-center justify-between border-b border-line pb-1.5">
                      <span className={`text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${face.hero.kickerColor}`}>
                        <HeroIcon className="w-3.5 h-3.5 shrink-0" />
                        {face.hero.kicker}
                      </span>
                      <span className={`text-[11px] font-bold font-mono ${face.hero.statusColor}`}>
                        {face.hero.statusText}
                      </span>
                    </div>

                    {/* Middle Problem Box */}
                    <div className="p-2.5 rounded-lg bg-surface-2 border border-line flex flex-col justify-between my-1 flex-1">
                      {/* Top Row: Number & Pill */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-surface border border-line text-text font-mono font-bold text-xs">
                          #{face.hero.num}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${face.hero.pillColor}`}>
                          {face.hero.pill}
                        </span>
                      </div>

                      {/* Middle Row: Full Problem Title & Subtitle - Zero Truncation */}
                      <div className="my-1">
                        <h4 className="text-xs font-bold text-text tracking-tight leading-snug">
                          {face.hero.title}
                        </h4>
                        <p className="text-[11px] text-text-secondary leading-snug mt-0.5">
                          {face.hero.sub}
                        </p>
                      </div>

                      {/* Bottom Row: Company & Domain Tag */}
                      <div className="pt-1.5 border-t border-line/60 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-text-secondary font-mono">
                          <Terminal className="w-3 h-3 text-accent shrink-0" />
                          {face.hero.company}
                        </span>
                        <span className="text-[10px] font-bold text-accent font-mono tracking-wider">
                          {face.hero.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Other 3 lateral faces: Render detailed problem lists
              return (
                <div
                  key={`${face.id}-${offset}`}
                  className="absolute inset-0 rounded-xl p-3 flex flex-col justify-between overflow-hidden select-none bg-surface border border-line"
                  style={{
                    transform: faceRotations[offset],
                    backfaceVisibility: 'visible',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-line pb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text truncate max-w-[125px]">
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
                        <div className="min-w-0 pr-1.5">
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

                  <div className="pt-1.5 text-xs text-text-secondary border-t border-line truncate flex items-center justify-between">
                    <span className="truncate">{face.footer}</span>
                    <span className="text-muted ml-1 shrink-0">●●●</span>
                  </div>
                </div>
              );
            })}

            {/* Top Face */}
            <div
              className="absolute inset-0 rounded-xl p-3.5 flex flex-col items-center justify-center overflow-hidden select-none bg-surface border border-line"
              style={{
                transform: 'rotateX(90deg) translateZ(110px)',
                backfaceVisibility: 'visible',
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-surface-2 border border-line flex items-center justify-center">
                <Cpu className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-semibold tracking-wide text-text uppercase mt-2">
                DSA ENGINE CORE
              </span>
              <span className="text-xs text-easy mt-0.5 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-easy" />
                ACTIVE PIPELINE
              </span>
            </div>

            {/* Bottom Face */}
            <div
              className="absolute inset-0 rounded-xl p-3.5 flex flex-col items-center justify-center overflow-hidden select-none bg-surface border border-line"
              style={{
                transform: 'rotateX(-90deg) translateZ(110px)',
                backfaceVisibility: 'visible',
              }}
            >
              <div className="w-10 h-10 rounded-full border border-accent/30 flex items-center justify-center bg-accent/12">
                <Flame className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-semibold tracking-wide text-text-secondary uppercase mt-2 font-mono">
                REVISION QUEUE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE STAGE SWITCHER CONTROLS ── */}
      <div className="mt-2 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line shadow-sm">
        {CUBE_STAGES.map((s, idx) => {
          const isActive = currentFace === idx;
          return (
            <button
              key={s.id}
              onClick={() => rotateToFace(idx)}
              type="button"
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-surface-2 text-text border border-line shadow-xs font-semibold'
                  : 'text-text-secondary hover:text-text hover:bg-surface-2/60 border border-transparent'
              }`}
              title={`Switch to ${s.stageLabel}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isActive ? 'bg-accent' : 'bg-muted'
                }`}
              />
              <span>{idx + 1} {s.stageLabel}</span>
            </button>
          );
        })}
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
          animation: pureSmooth2sTumble 1.6s cubic-bezier(0.35, 0.05, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Rotating3DCube;
