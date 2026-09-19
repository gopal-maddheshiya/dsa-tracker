import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flame, Cpu, Terminal, Sparkles } from 'lucide-react';
import { colors } from '../../theme/colors';
import SlidingWindowViz from './cube-visuals/SlidingWindowViz';
import RevisionLadderViz from './cube-visuals/RevisionLadderViz';
import TopicRadarViz from './cube-visuals/TopicRadarViz';
import HeatmapViz from './cube-visuals/HeatmapViz';

/**
 * Clean Stage Metadata for the 4 Cube Stages.
 * Synchronized with the 4 live face visualizations.
 */
const CUBE_STAGES = [
  {
    id: 0,
    stageLabel: 'Solves',
    accentColor: colors.easy,
    terminal: {
      tag: 'RUNTIME BOUND',
      pill: 'O(N) Time',
      message: 'Sliding window maintains maximum sum across size-3 subarray in a single pass.',
      subLeft: 'Window Size',
      subRight: 'k = 3',
      subRightDot: 'bg-easy text-easy',
    },
    insight: {
      tag: 'ALGORITHM PATTERN',
      pill: 'Two Pointers',
      title: 'Sliding Window Technique',
      sub: 'Reuses previous subarray sum by adding right and removing left',
      footerLeft: 'Time Complexity',
      footerRight: 'O(N) Runtime',
      tagColor: 'text-easy',
    },
  },
  {
    id: 1,
    stageLabel: 'Spaced',
    accentColor: colors.accent,
    terminal: {
      tag: 'SPACED RECALL',
      pill: '2d / 5d / 14d',
      message: 'Adaptive intervals: 2-day recall for struggled, 5-day for review, 14-day for solved.',
      subLeft: 'Schedule Rule',
      subRight: 'Active Intervals',
      subRightDot: 'bg-accent text-accent',
    },
    insight: {
      tag: 'REVISION LADDER',
      pill: 'Due Engine',
      title: 'Outcome-Based Scheduling',
      sub: 'Next review date dynamically scales based on attempt performance',
      footerLeft: 'Interval Tiers',
      footerRight: '2d · 5d · 14d',
      tagColor: 'text-accent',
    },
  },
  {
    id: 2,
    stageLabel: 'Topics',
    accentColor: colors.medium,
    terminal: {
      tag: 'TOPIC RADAR',
      pill: 'Radar Scan',
      message: 'Topic analysis ranks categories by struggle ratio to target high-priority revision.',
      subLeft: 'Focus Priority',
      subRight: 'Dynamic Prog',
      subRightDot: 'bg-danger text-danger',
    },
    insight: {
      tag: 'TOPIC MATRIX',
      pill: 'Multi-Axis',
      title: '6-Axis Struggle Ratio',
      sub: 'Surfaces highest friction topics so you spend practice time effectively',
      footerLeft: 'Weakest Category',
      footerRight: 'DP (0.80)',
      tagColor: 'text-medium',
    },
  },
  {
    id: 3,
    stageLabel: 'Velocity',
    accentColor: colors.easy,
    terminal: {
      tag: 'PRACTICE CADENCE',
      pill: '140 Days',
      message: 'Heatmap visualization tracks 20 weeks of practice consistency across daily sessions.',
      subLeft: 'Cadence Window',
      subRight: '20 Weeks',
      subRightDot: 'bg-easy text-easy',
    },
    insight: {
      tag: 'ACTIVITY LOG',
      pill: 'Consistency',
      title: 'Daily Engineering Cadence',
      sub: 'Persistent daily problem solving builds durable pattern recognition',
      footerLeft: 'Cadence View',
      footerRight: 'Active Streak',
      tagColor: 'text-easy',
    },
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
      className="relative w-full max-w-[660px] flex flex-col items-center select-none py-2 [--s:clamp(180px,48vw,220px)] sm:[--s:clamp(180px,23vw,220px)]"
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
            {/* 4 Lateral Faces: each hosts its own dedicated visualization */}
            {[0, 1, 2, 3].map((i) => {
              const isFaceActive = activeStage === i;
              return (
                <div
                  key={i}
                  className="absolute inset-0 rounded-xl p-2.5 sm:p-3 overflow-hidden select-none bg-surface border border-line shadow-card"
                  style={{
                    transform: `rotateY(${i * 90}deg) translateZ(calc(var(--s) / 2))`,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {i === 0 && <SlidingWindowViz active={isFaceActive} reducedMotion={reducedMotion} />}
                  {i === 1 && <RevisionLadderViz active={isFaceActive} reducedMotion={reducedMotion} />}
                  {i === 2 && <TopicRadarViz active={isFaceActive} reducedMotion={reducedMotion} />}
                  {i === 3 && <HeatmapViz active={isFaceActive} reducedMotion={reducedMotion} />}
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
