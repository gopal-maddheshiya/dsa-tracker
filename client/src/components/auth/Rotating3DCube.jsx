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
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  // In-flight active face for visuals during drag (discrete updates only)
  const [dragActiveStage, setDragActiveStage] = useState(null);

  // Accessible reduced motion detection
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Fine pointer / hover capability detection
  const [canHover, setCanHover] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  });

  const stageRef = useRef(null);
  const parallaxRef = useRef(null);
  const cubeRef = useRef(null);
  const parallaxRafRef = useRef(null);

  const dragInfoRef = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentDragAngle: 0,
    history: [],
    cubeWidth: 200,
    rafId: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => setReducedMotion(e.matches);
    mediaQueryMotion.addEventListener('change', handleMotionChange);

    const mediaQueryHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handleHoverChange = (e) => setCanHover(e.matches);
    mediaQueryHover.addEventListener('change', handleHoverChange);

    return () => {
      mediaQueryMotion.removeEventListener('change', handleMotionChange);
      mediaQueryHover.removeEventListener('change', handleHoverChange);
    };
  }, []);

  // Listen to document visibility changes to pause/resume auto-rotation
  useEffect(() => {
    const handleVisibility = () => {
      setIsDocHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Compute active stage index
  const activeStage = dragActiveStage !== null
    ? dragActiveStage
    : ((step % 4) + 4) % 4;

  // Rotation callback using shortest path for buttons and keyboard
  const rotateToStage = useCallback((targetStage) => {
    const current = ((step % 4) + 4) % 4;
    if (targetStage === current) return;
    const delta = getShortestDelta(targetStage, current);
    setStep((prev) => prev + delta);
  }, [step]);

  // Auto-advance every ~5800ms unless paused by hover, focus, tab hidden, dragging or reduced motion
  useEffect(() => {
    if (reducedMotion || isHovered || isFocused || isDocHidden || isDragging) {
      return;
    }

    const timer = setInterval(() => {
      setStep((prev) => prev + 1);
    }, 5800);

    return () => clearInterval(timer);
  }, [step, reducedMotion, isHovered, isFocused, isDocHidden, isDragging]);

  // ── Mouse Parallax Handlers (Fine pointers only, rAF-driven) ──
  const handleParallaxMove = useCallback((e) => {
    if (!stageRef.current || !parallaxRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nx = (e.clientX - cx) / (rect.width / 2);
    const ny = (e.clientY - cy) / (rect.height / 2);

    const clampedX = Math.max(-1, Math.min(1, nx));
    const clampedY = Math.max(-1, Math.min(1, ny));

    const targetRotY = clampedX * 8; // +/- 8 deg on Y
    const targetRotX = -clampedY * 6; // +/- 6 deg on X

    if (parallaxRafRef.current) cancelAnimationFrame(parallaxRafRef.current);
    parallaxRafRef.current = requestAnimationFrame(() => {
      if (parallaxRef.current) {
        parallaxRef.current.style.setProperty('--px', `${targetRotX.toFixed(2)}deg`);
        parallaxRef.current.style.setProperty('--py', `${targetRotY.toFixed(2)}deg`);
      }
      parallaxRafRef.current = null;
    });
  }, []);

  const resetParallax = useCallback(() => {
    if (parallaxRafRef.current) {
      cancelAnimationFrame(parallaxRafRef.current);
      parallaxRafRef.current = null;
    }
    if (parallaxRef.current) {
      parallaxRef.current.style.setProperty('--px', '0deg');
      parallaxRef.current.style.setProperty('--py', '0deg');
    }
  }, []);

  // ── Drag Gesture Handlers (Pointer Events) ──
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('button') || e.target.closest('a')) return;

    const cubeEl = cubeRef.current;
    const width = cubeEl ? cubeEl.offsetWidth || 200 : 200;

    dragInfoRef.current = {
      isDown: true,
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      currentDragAngle: 0,
      history: [{ x: e.clientX, t: performance.now() }],
      cubeWidth: width,
      rafId: null,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e) => {
    const d = dragInfoRef.current;

    // Handle Parallax Tilt when idle (desktop fine pointer only)
    if (canHover && !d.isDragging && !reducedMotion && stageRef.current) {
      handleParallaxMove(e);
    }

    if (!d.isDown) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    // 6px threshold check
    if (!d.isDragging) {
      if (Math.abs(dx) > 6) {
        d.isDragging = true;
        setIsDragging(true);
        resetParallax();
      } else if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        // Vertical page scroll priority on mobile touch
        d.isDown = false;
        return;
      } else {
        return;
      }
    }

    // Record point in rolling velocity history buffer
    const now = performance.now();
    d.history.push({ x: e.clientX, t: now });
    d.history = d.history.filter((p) => now - p.t < 120);

    // Continuous drag angle: dx / cubeWidth * 90 * 1.1
    const dragAngle = (dx / d.cubeWidth) * 90 * 1.1;
    d.currentDragAngle = dragAngle;

    if (!d.rafId) {
      d.rafId = requestAnimationFrame(() => {
        if (cubeRef.current) {
          cubeRef.current.style.setProperty('--drag', `${d.currentDragAngle}deg`);
        }
        d.rafId = null;
      });
    }

    // In-flight active face for visuals (discrete updates only)
    const projectedStep = Math.round(step - dragAngle / 90);
    const projectedStage = ((projectedStep % 4) + 4) % 4;
    setDragActiveStage((prev) => (prev !== projectedStage ? projectedStage : prev));
  };

  const handlePointerUp = (e) => {
    const d = dragInfoRef.current;
    if (!d.isDown) return;
    d.isDown = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    if (d.rafId) {
      cancelAnimationFrame(d.rafId);
      d.rafId = null;
    }

    if (!d.isDragging) {
      return;
    }

    d.isDragging = false;
    setIsDragging(false);
    setHasDragged(true);

    // Calculate release velocity in px/ms
    let velocity = 0;
    if (d.history.length >= 2) {
      const first = d.history[0];
      const last = d.history[d.history.length - 1];
      const dt = last.t - first.t;
      if (dt > 10) {
        velocity = (last.x - first.x) / dt;
      }
    }

    const totalDx = e.clientX - d.startX;
    // Project final target using velocity (120ms inertia projection)
    const projectedDx = totalDx + velocity * 120;
    const projectedAngle = (projectedDx / d.cubeWidth) * 90 * 1.1;

    // Snap to nearest 90-degree step, clamped to at most +/- 2 faces
    let stepDelta = -Math.round(projectedAngle / 90);
    stepDelta = Math.max(-2, Math.min(2, stepDelta));

    const finalStep = step + stepDelta;

    // Clear --drag property so CSS transition smoothly completes to finalStep
    if (cubeRef.current) {
      cubeRef.current.style.removeProperty('--drag');
    }
    setStep(finalStep);
    setDragActiveStage(null);
  };

  // Exploded view state
  const isExploded = canHover && isHovered && !isDragging && !reducedMotion;

  const stage = CUBE_STAGES[activeStage];

  return (
    <div
      className="relative w-full max-w-[660px] flex flex-col items-center select-none py-2 [--s:clamp(180px,48vw,220px)] sm:[--s:clamp(180px,23vw,220px)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        resetParallax();
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
    >
      {/* ── 3D STAGE CONTAINER (DECORATIVE & INTERACTIVE) ── */}
      <div
        ref={stageRef}
        className={`relative w-full flex items-center justify-center overflow-visible select-none ${
          isDragging ? 'cursor-grabbing' : canHover ? 'cursor-grab' : 'cursor-default'
        }`}
        style={{
          height: 'calc(var(--s) * 1.65)',
          touchAction: 'pan-y',
        }}
        aria-hidden="true"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* ── CARD 1 (TOP-LEFT): SYNCHRONIZED RUNTIME TERMINAL ── */}
        <div
          className="hidden sm:block absolute top-2 left-0 z-20 transition-all duration-300 ease-out pointer-events-none"
          style={{ width: 'calc(var(--s) * 0.93)' }}
        >
          <div className="p-3 rounded-xl border border-line bg-surface shadow-card transition-colors pointer-events-auto">
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
          className="hidden sm:block absolute bottom-2 right-0 z-20 transition-all duration-300 ease-out pointer-events-none"
          style={{ width: 'calc(var(--s) * 0.93)' }}
        >
          <div className="p-3 rounded-xl border border-line bg-surface shadow-card transition-colors pointer-events-auto">
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

        {/* ── LAYER 1: OUTER FLOAT WRAPPER (IDLE FLOAT ANIMATION) ── */}
        <div
          className={`relative flex items-center justify-center z-10 ${
            reducedMotion ? '' : 'animate-cube-subtle-float'
          }`}
        >
          {/* Soft Floor Shadow (stays centered under cube, scales in sync with float) */}
          <div
            className={`absolute -bottom-6 w-[calc(var(--s)*0.82)] h-3 rounded-[100%] bg-black/40 blur-md pointer-events-none transition-opacity duration-300 ${
              reducedMotion ? 'opacity-30' : 'animate-cube-shadow'
            }`}
          />

          {/* ── LAYER 2: PARALLAX WRAPPER (MOUSE TILT, 150ms EASE-OUT) ── */}
          <div
            ref={parallaxRef}
            className="relative"
            style={{
              perspective: '1100px',
              transformStyle: 'preserve-3d',
              transform: 'rotateX(var(--px, 0deg)) rotateY(var(--py, 0deg))',
              transition: isDragging ? 'none' : 'transform 150ms ease-out',
            }}
          >
            {/* ── LAYER 3: CUBE INNER (STATE ROTATION + DRAG OFFSET) ── */}
            <div
              ref={cubeRef}
              className="relative"
              style={{
                width: 'var(--s)',
                height: 'var(--s)',
                transformStyle: 'preserve-3d',
                transformOrigin: '50% 50% 0px',
                transform: `rotateX(-14deg) rotateY(calc(-90deg * ${step} + var(--drag, 0deg)))`,
                transition: isDragging
                  ? 'none'
                  : reducedMotion
                  ? 'none'
                  : 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform',
                '--gap': isExploded ? 'calc(var(--s) * 0.14)' : '0px',
              }}
            >
              {/* 4 Lateral Faces */}
              {[0, 1, 2, 3].map((i) => {
                const isFaceActive = activeStage === i;
                return (
                  <div
                    key={i}
                    className={`absolute inset-0 rounded-xl p-2.5 sm:p-3 overflow-hidden select-none bg-surface transition-all duration-400 ease-out shadow-card ${
                      isFaceActive ? 'border border-accent/80' : 'border border-line'
                    }`}
                    style={{
                      transform: `rotateY(${i * 90}deg) translateZ(calc(var(--s) / 2 + var(--gap, 0px)))`,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transition: reducedMotion
                        ? 'none'
                        : 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), border-color 300ms ease-out',
                    }}
                  >
                    {i === 0 && <SlidingWindowViz active={isFaceActive} reducedMotion={reducedMotion} />}
                    {i === 1 && <RevisionLadderViz active={isFaceActive} reducedMotion={reducedMotion} />}
                    {i === 2 && <TopicRadarViz active={isFaceActive} reducedMotion={reducedMotion} />}
                    {i === 3 && <HeatmapViz active={isFaceActive} reducedMotion={reducedMotion} />}

                    {/* Face lighting: Subtle dark overlay on inactive faces for 3D depth */}
                    <div
                      className={`absolute inset-0 bg-black/22 pointer-events-none transition-opacity duration-300 ${
                        isFaceActive ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                  </div>
                );
              })}

              {/* Top Face - elevated brightness */}
              <div
                className="absolute inset-0 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center overflow-hidden select-none bg-surface brightness-110 border border-line"
                style={{
                  transform: 'rotateX(90deg) translateZ(calc(var(--s) / 2 + var(--gap, 0px)))',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transition: reducedMotion
                    ? 'none'
                    : 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
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

              {/* Bottom Face - shaded brightness */}
              <div
                className="absolute inset-0 rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-center overflow-hidden select-none bg-surface brightness-90 border border-line"
                style={{
                  transform: 'rotateX(-90deg) translateZ(calc(var(--s) / 2 + var(--gap, 0px)))',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transition: reducedMotion
                    ? 'none'
                    : 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
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
      </div>

      {/* ── INTERACTIVE STAGE SWITCHER CONTROLS ── */}
      <div
        role="group"
        aria-label="3D Cube Stage Controls"
        className="mt-3 flex flex-col items-center select-none"
      >
        <div
          className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line shadow-sm"
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

        {/* Auto-Advance Progress Indicator Line */}
        {!reducedMotion && (
          <div className="w-28 h-0.5 mt-1.5 bg-surface-2/80 rounded-full overflow-hidden border border-line/40">
            <div
              key={step}
              className="h-full bg-accent rounded-full animate-advance-progress"
              style={{
                animationPlayState:
                  isHovered || isFocused || isDocHidden || isDragging
                    ? 'paused'
                    : 'running',
              }}
            />
          </div>
        )}

        {/* Cursor / Gesture Hint */}
        <div
          className={`text-[10px] text-muted font-mono mt-1 text-center transition-opacity duration-500 select-none ${
            hasDragged ? 'opacity-0 pointer-events-none h-0 mt-0 overflow-hidden' : 'opacity-80'
          }`}
        >
          {isTouchDevice ? 'Swipe to rotate' : 'Drag to rotate'}
        </div>
      </div>

      <p className="text-[11px] text-muted text-center mt-1 select-none">
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

        @keyframes cubeShadowPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(0.85);
            opacity: 0.20;
          }
        }

        @keyframes advanceProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-cube-subtle-float {
          animation: cubeSubtleFloat 4.4s ease-in-out infinite;
        }

        .animate-cube-shadow {
          animation: cubeShadowPulse 4.4s ease-in-out infinite;
        }

        .animate-advance-progress {
          animation: advanceProgress 5800ms linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Rotating3DCube;
