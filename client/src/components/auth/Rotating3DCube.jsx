import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flame, Brain, CheckCircle2, Target, Sparkles, Cpu, Terminal } from 'lucide-react';
import { colors } from '../../theme/colors';

/**
 * Clean DSA Stage Data for the 4 Cube Stages.
 * All metrics clearly formatted with honest labels and real spaced-repetition intervals.
 */
const CUBE_STAGES = [
  {
    id: 0,
    faceTitle: 'RECENT SOLVES • SAMPLE',
    badge: 'DESIGN',
    badgeColor: 'text-easy bg-easy/12 border-easy/25',
    accentColor: colors.easy,
    stageLabel: 'Solves',
    hero: {
      kicker: 'SYSTEM DESIGN',
      kickerIcon: CheckCircle2,
      kickerColor: 'text-easy',
      statusText: 'SAMPLE',
      statusColor: 'text-easy',
      num: '146',
      title: 'LRU Cache Design',
      sub: 'Doubly-Linked List + Hash Map',
      pill: 'Optimal O(1)',
      pillColor: 'bg-easy/12 text-easy',
      company: 'System Architecture',
      tag: 'DESIGN',
    },
    terminal: {
      tag: 'RUNTIME BOUND',
      pill: 'O(1) Access',
      message: 'Sample verification: Doubly-linked list achieves O(1) eviction for LRU cache.',
      subLeft: 'Sample Queue',
      subRight: 'Active',
      subRightDot: 'bg-easy text-easy',
    },
    insight: {
      tag: 'ALGORITHM PATTERN',
      pill: 'Sample',
      title: 'Sliding Window & Pointers',
      sub: 'Sample benchmark across problem sets',
      footerLeft: 'Pattern Category',
      footerRight: 'O(1) Aux Space',
      tagColor: 'text-easy',
    },
    problems: [
      { title: '146. LRU Cache', platform: 'Doubly-Linked + HashMap', diff: 'Med', time: 'Sample', color: 'text-medium bg-medium/12 border-medium/25' },
      { title: '42. Trapping Rain Water', platform: 'Two Pointers Optimal', diff: 'Hard', time: 'Sample', color: 'text-hard bg-hard/12 border-hard/25' },
      { title: '23. Merge k Sorted Lists', platform: 'Min-Heap Priority Queue', diff: 'Hard', time: 'Sample', color: 'text-hard bg-hard/12 border-hard/25' },
    ],
    footer: 'Sample problems illustrating LRU cache design',
  },
  {
    id: 1,
    faceTitle: 'SPACED REPETITION ENGINE',
    badge: 'INTERVALS',
    badgeColor: 'text-accent bg-accent/12 border-accent/25',
    accentColor: colors.accent,
    stageLabel: 'Spaced',
    hero: {
      kicker: 'REVISION INTERVALS',
      kickerIcon: Brain,
      kickerColor: 'text-accent',
      statusText: '2d • 5d • 14d',
      statusColor: 'text-accent',
      num: '210',
      title: 'Course Schedule II',
      sub: "Kahn's Topological Sort (DAG)",
      pill: 'Due in 2d',
      pillColor: 'bg-accent/12 text-accent',
      company: 'Graph Algorithms',
      tag: 'GRAPH',
    },
    terminal: {
      tag: 'SPACED RECALL',
      pill: '2d / 5d / 14d',
      message: 'Adaptive queue: 2-day interval for struggled, 5-day for review, 14-day for solved.',
      subLeft: 'Revision Cadence',
      subRight: 'Active Queue',
      subRightDot: 'bg-accent text-accent',
    },
    insight: {
      tag: 'SCHEDULE MATRIX',
      pill: 'Sample Queue',
      title: 'Adaptive Revision Scheduling',
      sub: 'Urgency scored by days elapsed divided by status interval',
      footerLeft: 'Schedule Rule',
      footerRight: '2d • 5d • 14d',
      tagColor: 'text-accent',
    },
    problems: [
      { title: '210. Course Schedule II', platform: 'Struggled Attempt', diff: '2d Interval', time: 'Sample', color: 'text-accent bg-accent/12 border-accent/25' },
      { title: '139. Word Break', platform: 'Revisit Needed', diff: '5d Interval', time: 'Sample', color: 'text-medium bg-medium/12 border-medium/25' },
      { title: '146. LRU Cache', platform: 'Solved Attempt', diff: '14d Interval', time: 'Sample', color: 'text-easy bg-easy/12 border-easy/25' },
    ],
    footer: 'Real server intervals: 2d struggled, 5d review, 14d solved',
  },
  {
    id: 2,
    faceTitle: 'TOPIC WEAKNESS MATRIX',
    badge: 'ANALYTICS',
    badgeColor: 'text-medium bg-medium/12 border-medium/25',
    accentColor: colors.medium,
    stageLabel: 'Topics',
    hero: {
      kicker: 'WEAKNESS RADAR',
      kickerIcon: Target,
      kickerColor: 'text-medium',
      statusText: 'SAMPLE GAP',
      statusColor: 'text-danger',
      num: 'DP',
      title: 'Dynamic Programming',
      sub: '0/1 Knapsack & Subproblems',
      pill: 'Sample Focus',
      pillColor: 'bg-danger/12 text-danger',
      company: 'Memoization & DP',
      tag: 'DP',
    },
    terminal: {
      tag: 'TOPIC MATRIX',
      pill: 'Sample Scan',
      message: 'Topic matrix scan: Identifies struggle ratio by topic to prioritize problem queues.',
      subLeft: 'Topic Priority',
      subRight: 'Sample Active',
      subRightDot: 'bg-danger text-danger',
    },
    insight: {
      tag: 'TOPIC BREAKDOWN',
      pill: 'Sample',
      title: 'Subproblem Analysis',
      sub: 'Aggregates attempts to highlight areas needing extra practice',
      footerLeft: 'Priority Area',
      footerRight: 'Sample Focus',
      tagColor: 'text-medium',
    },
    problems: [
      { title: 'Dynamic Programming', platform: 'Sample Topic', diff: 'Focus #1', time: 'Sample', color: 'text-hard bg-hard/12 border-hard/25' },
      { title: 'Graph Traversal', platform: 'Sample Topic', diff: 'Focus #2', time: 'Sample', color: 'text-medium bg-medium/12 border-medium/25' },
      { title: 'Binary Search Trees', platform: 'Sample Topic', diff: 'Mastered', time: 'Sample', color: 'text-easy bg-easy/12 border-easy/25' },
    ],
    footer: 'Aggregation groups problem attempts by topic struggle ratio',
  },
  {
    id: 3,
    faceTitle: 'PREPARATION CADENCE',
    badge: 'SAMPLE HEATMAP',
    badgeColor: 'text-easy bg-easy/12 border-easy/25',
    accentColor: colors.easy,
    stageLabel: 'Velocity',
    hero: {
      kicker: 'CADENCE PULSE',
      kickerIcon: Flame,
      kickerColor: 'text-accent',
      statusText: 'SAMPLE',
      statusColor: 'text-accent',
      num: '30d',
      title: 'Activity Cadence',
      sub: 'Daily Practice Consistency',
      pill: 'Sample Trend',
      pillColor: 'bg-accent/12 text-accent',
      company: 'Practice Cadence',
      tag: 'CADENCE',
    },
    terminal: {
      tag: 'ACTIVITY LOG',
      pill: 'Sample',
      message: 'Cadence monitor: Tracks daily practice sessions and streaks across problem categories.',
      subLeft: 'Consistency',
      subRight: 'Sample Log',
      subRightDot: 'bg-accent text-accent',
    },
    insight: {
      tag: 'PRACTICE CADENCE',
      pill: 'Sample',
      title: 'Consistency Tracking',
      sub: 'Regular daily cadence builds long-term algorithmic recall',
      footerLeft: 'Practice Focus',
      footerRight: 'Curated Set',
      tagColor: 'text-easy',
    },
    problems: [
      { title: '30-Day Activity Log', platform: 'Sample Calendar', diff: 'Daily Log', time: 'Sample', color: 'text-easy bg-easy/12 border-easy/25' },
      { title: 'Difficulty Distribution', platform: 'Sample Problem Mix', diff: 'Balanced', time: 'Sample', color: 'text-accent bg-accent/12 border-accent/25' },
      { title: 'Curated Topic Roadmap', platform: 'Sample Progress', diff: 'In Progress', time: 'Sample', color: 'text-accent bg-accent/12 border-accent/25' },
    ],
    footer: 'Activity heatmap and daily problem solving cadence',
  },
];

/**
 * Isolated memoized typewriter component to prevent full-tree re-renders every 18ms.
 */
const TypewriterText = React.memo(({ text, reducedMotion }) => {
  const [displayed, setDisplayed] = useState(reducedMotion ? text : '');

  useEffect(() => {
    if (reducedMotion) {
      setDisplayed(text);
      return;
    }

    setDisplayed('');
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < text.length) {
        setDisplayed(text.slice(0, idx + 1));
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 18);

    return () => clearInterval(timer);
  }, [text, reducedMotion]);

  return (
    <span>
      {displayed}
      {!reducedMotion && (
        <span className="inline-block w-1 h-3 bg-accent ml-0.5 animate-pulse shrink-0 align-middle" />
      )}
    </span>
  );
});
TypewriterText.displayName = 'TypewriterText';

/**
 * Helper to compute the shortest rotation delta (-1, +1, or +2)
 */
const getShortestDelta = (target, current) => {
  let delta = ((target - current + 6) % 4) - 2;
  if (delta === -2) delta = 2;
  return delta;
};

const Rotating3DCube = () => {
  const [step, setStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDocHidden, setIsDocHidden] = useState(false);

  // Accessible reduced motion detection
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen to document visibility changes to pause/resume auto-rotation
  useEffect(() => {
    const handleVisibility = () => {
      setIsDocHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const activeStage = ((step % 4) + 4) % 4;

  // Rotation callback using shortest path
  const rotateToStage = useCallback((targetStage) => {
    const current = ((step % 4) + 4) % 4;
    if (targetStage === current) return;
    const delta = getShortestDelta(targetStage, current);
    setStep((prev) => prev + delta);
  }, [step]);

  // Auto-advance every ~5800ms unless paused by hover, focus, tab hidden or reduced motion
  useEffect(() => {
    if (reducedMotion || isHovered || isFocused || isDocHidden) {
      return;
    }

    const timer = setInterval(() => {
      setStep((prev) => prev + 1);
    }, 5800);

    return () => clearInterval(timer);
  }, [step, reducedMotion, isHovered, isFocused, isDocHidden]);

  const stage = CUBE_STAGES[activeStage];

  return (
    <div
      className="relative w-full max-w-[660px] flex flex-col items-center select-none py-2"
      style={{ '--s': 'clamp(150px, 22vw, 210px)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
    >
      {/* ── 3D STAGE CONTAINER (DECORATIVE) ── */}
      <div
        className="relative w-full flex items-center justify-center overflow-visible"
        style={{ height: 'calc(var(--s) * 1.65)' }}
        aria-hidden="true"
      >
        {/* ── CARD 1 (TOP-LEFT): SYNCHRONIZED RUNTIME TERMINAL ── */}
        <div
          className="hidden sm:block absolute top-2 left-0 z-20 transition-all duration-300 ease-out"
          style={{ width: 'calc(var(--s) * 0.93)' }}
        >
          <div className="p-3 rounded-xl border border-line bg-surface shadow-card transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 text-accent">
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                {stage.terminal.tag}
              </span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-line">
                {stage.terminal.pill}
              </span>
            </div>

            <div className="min-h-[46px] flex items-start">
              <p className="text-xs font-mono text-text leading-snug break-words">
                <TypewriterText text={stage.terminal.message} reducedMotion={reducedMotion} />
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
          className="hidden sm:block absolute bottom-2 right-0 z-20 transition-all duration-300 ease-out"
          style={{ width: 'calc(var(--s) * 0.93)' }}
        >
          <div className="p-3 rounded-xl border border-line bg-surface shadow-card transition-colors">
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
          className={`relative flex items-center justify-center z-10 ${
            reducedMotion ? '' : 'animate-cube-subtle-float'
          }`}
          style={{ perspective: '1100px' }}
        >
          <div
            className="relative"
            style={{
              width: 'var(--s)',
              height: 'var(--s)',
              transformStyle: 'preserve-3d',
              transformOrigin: '50% 50% 0px',
              transform: `rotateX(-14deg) rotateY(${-90 * step}deg)`,
              transition: reducedMotion ? 'none' : 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
            }}
          >
            {/* 4 Lateral Faces: fixed content, rotateY(i*90deg) translateZ(var(--s)/2) */}
            {[0, 1, 2, 3].map((i) => {
              const face = CUBE_STAGES[i];
              const HeroIcon = face.hero.kickerIcon;
              return (
                <div
                  key={face.id}
                  className="absolute inset-0 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden select-none bg-surface border border-line shadow-card"
                  style={{
                    transform: `rotateY(${i * 90}deg) translateZ(calc(var(--s) / 2))`,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* Top Status Header */}
                  <div className="flex items-center justify-between border-b border-line pb-1 sm:pb-1.5">
                    <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 sm:gap-1.5 ${face.hero.kickerColor}`}>
                      <HeroIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      {face.hero.kicker}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-bold font-mono ${face.hero.statusColor}`}>
                      {face.hero.statusText}
                    </span>
                  </div>

                  {/* Middle Problem Box */}
                  <div className="p-2 sm:p-2.5 rounded-lg bg-surface-2 border border-line flex flex-col justify-between my-1 flex-1">
                    {/* Top Row: Number & Pill */}
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-surface border border-line text-text font-mono font-bold text-[11px] sm:text-xs">
                        #{face.hero.num}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold font-mono ${face.hero.pillColor}`}>
                        {face.hero.pill}
                      </span>
                    </div>

                    {/* Middle Row: Full Problem Title & Subtitle - Zero Truncation */}
                    <div className="my-0.5">
                      <h4 className="text-[11px] sm:text-xs font-bold text-text tracking-tight leading-snug">
                        {face.hero.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-text-secondary leading-snug mt-0.5">
                        {face.hero.sub}
                      </p>
                    </div>

                    {/* Bottom Row: Company & Domain Tag */}
                    <div className="pt-1.5 border-t border-line/60 flex items-center justify-between text-[10px] sm:text-[11px]">
                      <span className="flex items-center gap-1.5 text-text-secondary font-mono truncate">
                        <Terminal className="w-3 h-3 text-accent shrink-0" />
                        {face.hero.company}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-accent font-mono tracking-wider shrink-0">
                        {face.hero.tag}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Top Face - visible due to -14deg rotateX tilt */}
            <div
              className="absolute inset-0 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center overflow-hidden select-none bg-surface border border-line"
              style={{
                transform: 'rotateX(90deg) translateZ(calc(var(--s) / 2))',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line flex items-center justify-center">
                <Cpu className="w-4 h-4 text-accent" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold tracking-wide text-text uppercase mt-1.5 text-center">
                DSA Engine Core
              </span>
              <span className="text-[9px] sm:text-[10px] text-easy mt-0.5 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-easy" />
                Active Pipeline
              </span>
            </div>

            {/* Bottom Face */}
            <div
              className="absolute inset-0 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center overflow-hidden select-none bg-surface border border-line"
              style={{
                transform: 'rotateX(-90deg) translateZ(calc(var(--s) / 2))',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div className="w-8 h-8 rounded-full border border-accent/30 flex items-center justify-center bg-accent/12">
                <Flame className="w-4 h-4 text-accent" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold tracking-wide text-text-secondary uppercase mt-1.5 font-mono text-center">
                Revision Queue
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE STAGE SWITCHER CONTROLS ── */}
      <div
        role="group"
        aria-label="3D Cube Stage Controls"
        className="mt-3 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line shadow-sm"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            rotateToStage((activeStage + 3) % 4);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            rotateToStage((activeStage + 1) % 4);
          }
        }}
      >
        {CUBE_STAGES.map((s, idx) => {
          const isActive = activeStage === idx;
          return (
            <button
              key={s.id}
              onClick={() => rotateToStage(idx)}
              type="button"
              aria-pressed={isActive}
              aria-label={`Switch to stage ${idx + 1}: ${s.stageLabel}`}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-surface-2 text-text border border-line shadow-xs font-semibold'
                  : 'text-text-secondary hover:text-text hover:bg-surface-2/60 border border-transparent'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isActive ? 'bg-accent' : 'bg-muted'
                }`}
                aria-hidden="true"
              />
              <span>{idx + 1} {s.stageLabel}</span>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted text-center mt-1.5 select-none">
        Sample data
      </p>

      <style>{`
        @keyframes cubeSubtleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .animate-cube-subtle-float {
          animation: cubeSubtleFloat 4.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Rotating3DCube;
