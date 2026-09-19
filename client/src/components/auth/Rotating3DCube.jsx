import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Sparkles } from 'lucide-react';
import { colors } from '../../theme/colors';
import SlidingWindowViz from './cube-visuals/SlidingWindowViz';
import RevisionLadderViz from './cube-visuals/RevisionLadderViz';
import TopicRadarViz from './cube-visuals/TopicRadarViz';
import HeatmapViz from './cube-visuals/HeatmapViz';
import DifficultySplitViz from './cube-visuals/DifficultySplitViz';
import NextUpViz from './cube-visuals/NextUpViz';

/**
 * 6 Stage Metadata for the 6 Cube Faces.
 * Synchronized with the 6 live face visualizations.
 * Indexes:
 * 0: Solves (Front)
 * 1: Spaced (Right)
 * 2: Topics (Back)
 * 3: Velocity (Left)
 * 4: Levels (Top)
 * 5: Next up (Bottom)
 */
const CUBE_STAGES = [
  {
    id: 0,
    stageLabel: 'Solves',
    shortLabel: 'Solv',
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
    shortLabel: 'Spac',
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
    shortLabel: 'Top',
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
    shortLabel: 'Velo',
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
  {
    id: 4,
    stageLabel: 'Levels',
    shortLabel: 'Lvls',
    accentColor: colors.medium,
    terminal: {
      tag: 'DIFFICULTY MIX',
      pill: '35 Solved',
      message: 'Current practice distribution: 11 Easy, 17 Medium, 7 Hard across target topics.',
      subLeft: 'Target Ratio',
      subRight: '30 / 50 / 20',
      subRightDot: 'bg-medium text-medium',
    },
    insight: {
      tag: 'LEVEL SPREAD',
      pill: 'Balanced',
      title: 'Curated Difficulty Curve',
      sub: 'Maintains healthy balance between core fundamentals and complex problem variants',
      footerLeft: 'Hard Ratio',
      footerRight: '20% of solves',
      tagColor: 'text-medium',
    },
  },
  {
    id: 5,
    stageLabel: 'Next up',
    shortLabel: 'Next',
    accentColor: colors.accent,
    terminal: {
      tag: 'ADAPTIVE QUEUE',
      pill: '3 Queued',
      message: 'Spaced review scheduled for Course Schedule II based on previous struggle signal.',
      subLeft: 'Queue Priority',
      subRight: 'Due Today',
      subRightDot: 'bg-accent text-accent',
    },
    insight: {
      tag: 'NEXT SOLVE',
      pill: 'Personalized',
      title: 'Dynamic Next-Up Queue',
      sub: 'Prioritizes review debt and fresh patterns based on cadence and retention decay',
      footerLeft: 'Upcoming',
      footerRight: '3 Recommendations',
      tagColor: 'text-accent',
    },
  },
];

/**
 * Fixed deterministic tour visiting all 6 faces across all rotation axes:
 * 0 (Solves) -> 1 (Spaced) -> 2 (Topics) -> 4 (Levels) -> 3 (Velocity) -> 5 (Next up) -> 0
 */
export const TOUR_SEQUENCE = [0, 1, 2, 4, 3, 5];

/**
 * 6 Canonical Upright Poses represented as Unit Quaternions [x, y, z, w].
 * In CSS coordinates (x right, y down, z out of screen):
 * - Stage 0: rotateY(0deg)   -> identity
 * - Stage 1: rotateY(-90deg) -> axis (0, 1, 0), angle -90deg
 * - Stage 2: rotateY(-180deg)-> axis (0, 1, 0), angle -180deg
 * - Stage 3: rotateY(-270deg)-> axis (0, 1, 0), angle -270deg (or +90deg)
 * - Stage 4: rotateX(-90deg) -> axis (1, 0, 0), angle -90deg (Top face upright)
 * - Stage 5: rotateX(90deg)  -> axis (1, 0, 0), angle +90deg (Bottom face upright)
 */
const SQRT1_2 = Math.SQRT1_2; // ~0.70710678

export const CANONICAL_POSES = [
  { x: 0, y: 0, z: 0, w: 1 },
  { x: 0, y: -SQRT1_2, z: 0, w: SQRT1_2 },
  { x: 0, y: -1, z: 0, w: 0 },
  { x: 0, y: SQRT1_2, z: 0, w: SQRT1_2 },
  { x: -SQRT1_2, y: 0, z: 0, w: SQRT1_2 },
  { x: SQRT1_2, y: 0, z: 0, w: SQRT1_2 },
];

/**
 * Converts a unit quaternion to a column-major CSS matrix3d() string.
 * Numerically verified to equal getComputedStyle(el).transform for all 6 canonical poses.
 */
export function quatToMatrix3d(q) {
  const { x, y, z, w } = q;
  const m00 = 1 - 2 * (y * y + z * z);
  const m01 = 2 * (x * y - z * w);
  const m02 = 2 * (x * z + y * w);

  const m10 = 2 * (x * y + z * w);
  const m11 = 1 - 2 * (x * x + z * z);
  const m12 = 2 * (y * z - x * w);

  const m20 = 2 * (x * z - y * w);
  const m21 = 2 * (y * z + x * w);
  const m22 = 1 - 2 * (x * x + y * y);

  const c0 = m00.toFixed(6);
  const c1 = m10.toFixed(6);
  const c2 = m20.toFixed(6);
  const c4 = m01.toFixed(6);
  const c5 = m11.toFixed(6);
  const c6 = m21.toFixed(6);
  const c8 = m02.toFixed(6);
  const c9 = m12.toFixed(6);
  const c10 = m22.toFixed(6);

  return `matrix3d(${c0}, ${c1}, ${c2}, 0, ${c4}, ${c5}, ${c6}, 0, ${c8}, ${c9}, ${c10}, 0, 0, 0, 0, 1)`;
}

/**
 * Normalized spherical linear interpolation (slerp) taking the shortest geodesic path.
 */
export function slerpQuat(qA, qB, t) {
  let dot = qA.x * qB.x + qA.y * qB.y + qA.z * qB.z + qA.w * qB.w;
  let bx = qB.x;
  let by = qB.y;
  let bz = qB.z;
  let bw = qB.w;

  if (dot < 0) {
    dot = -dot;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }

  if (dot > 0.9995) {
    // Linear interpolation for near-identical orientations
    const rx = qA.x + t * (bx - qA.x);
    const ry = qA.y + t * (by - qA.y);
    const rz = qA.z + t * (bz - qA.z);
    const rw = qA.w + t * (bw - qA.w);
    const len = Math.hypot(rx, ry, rz, rw) || 1;
    return { x: rx / len, y: ry / len, z: rz / len, w: rw / len };
  }

  const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
  const sinTheta = Math.sin(theta);
  const s1 = Math.sin((1 - t) * theta) / sinTheta;
  const s2 = Math.sin(t * theta) / sinTheta;

  return {
    x: s1 * qA.x + s2 * bx,
    y: s1 * qA.y + s2 * by,
    z: s1 * qA.z + s2 * bz,
    w: s1 * qA.w + s2 * bw,
  };
}

/**
 * Ease-in-out cubic timing function for ~1000ms engine transitions.
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

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

const Rotating3DCube = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [isStageHovered, setIsStageHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDocHidden, setIsDocHidden] = useState(false);
  const [isOffscreen, setIsOffscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  // In-flight active face for visuals during drag/scrub (discrete updates only)
  const [dragActiveStage, setDragActiveStage] = useState(null);

  // Key to reset the auto-advance progress bar animation on stage changes
  const [progressKey, setProgressKey] = useState(0);

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

  // Current cube orientation quaternion
  const currentQuatRef = useRef(CANONICAL_POSES[0]);

  // Animation engine state ref
  const animEngineRef = useRef({
    rafId: null,
    startQuat: CANONICAL_POSES[0],
    targetQuat: CANONICAL_POSES[0],
    startTime: 0,
    duration: 1000,
    targetStage: 0,
  });

  // Parallax rAF ref
  const parallaxRafRef = useRef(null);

  // Auto-advance timer ref
  const autoAdvanceTimerRef = useRef(null);

  // Pointer drag tracking ref
  const dragInfoRef = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    cubeWidth: 200,
    history: [],
    scrubCurrentStage: 0,
    scrubNextStage: 1,
    scrubPrevStage: 5,
    scrubTargetStage: 0,
    scrubProgress: 0,
    rafId: null,
  });

  // ── Media Queries & Visibility Listeners ──
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

  useEffect(() => {
    const handleVisibility = () => {
      setIsDocHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // IntersectionObserver to pause auto-advance when offscreen
  useEffect(() => {
    if (!stageRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOffscreen(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Orientation Engine: Slerp to Target Stage ──
  const rotateToStage = useCallback((targetStage, customDuration = 1000) => {
    if (animEngineRef.current.rafId) {
      cancelAnimationFrame(animEngineRef.current.rafId);
      animEngineRef.current.rafId = null;
    }

    const startQuat = currentQuatRef.current;
    const targetQuat = CANONICAL_POSES[targetStage];

    // Reduced motion or 0ms duration: instant arrival
    if (reducedMotion || customDuration <= 0) {
      currentQuatRef.current = targetQuat;
      if (cubeRef.current) {
        cubeRef.current.style.transform = quatToMatrix3d(targetQuat);
      }
      setActiveStage(targetStage);
      setDragActiveStage(null);
      setIsAnimating(false);
      setProgressKey((k) => k + 1);
      return;
    }

    setIsAnimating(true);
    const startTime = performance.now();
    let hasCrossedHalf = false;

    animEngineRef.current = {
      rafId: null,
      startQuat,
      targetQuat,
      startTime,
      duration: customDuration,
      targetStage,
    };

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / customDuration);
      const easedT = easeInOutCubic(progress);

      const q = slerpQuat(startQuat, targetQuat, easedT);
      currentQuatRef.current = q;

      if (cubeRef.current) {
        cubeRef.current.style.transform = quatToMatrix3d(q);
      }

      // Discrete active stage updates when animation crosses 50%
      if (!hasCrossedHalf && progress >= 0.5) {
        hasCrossedHalf = true;
        setActiveStage(targetStage);
        setDragActiveStage(null);
      }

      if (progress < 1) {
        animEngineRef.current.rafId = requestAnimationFrame(tick);
      } else {
        currentQuatRef.current = targetQuat;
        if (cubeRef.current) {
          cubeRef.current.style.transform = quatToMatrix3d(targetQuat);
        }
        setActiveStage(targetStage);
        setDragActiveStage(null);
        setIsAnimating(false);
        setProgressKey((k) => k + 1);
        animEngineRef.current.rafId = null;
      }
    };

    animEngineRef.current.rafId = requestAnimationFrame(tick);
  }, [reducedMotion]);

  // Direct button click handler: goes directly to stage and resumes tour from it
  const handleStageButtonClick = useCallback((targetStage) => {
    if (targetStage === activeStage && !isAnimating) return;
    rotateToStage(targetStage);
  }, [activeStage, isAnimating, rotateToStage]);

  // ── Auto-Advance Tour in All Directions (0 -> 1 -> 2 -> 4 -> 3 -> 5 -> 0) ──
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    const isPaused =
      reducedMotion ||
      isStageHovered ||
      isFocused ||
      isDocHidden ||
      isOffscreen ||
      isDragging ||
      isAnimating;

    if (isPaused) {
      return;
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      const currentTourIdx = TOUR_SEQUENCE.indexOf(activeStage);
      const nextTourIdx = (currentTourIdx + 1) % TOUR_SEQUENCE.length;
      const nextStage = TOUR_SEQUENCE[nextTourIdx];
      rotateToStage(nextStage);
    }, 5800);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [
    activeStage,
    reducedMotion,
    isStageHovered,
    isFocused,
    isDocHidden,
    isOffscreen,
    isDragging,
    isAnimating,
    rotateToStage,
  ]);

  // ── Mouse Parallax Handlers (Fine pointers only, rAF-driven on Parallax Wrapper) ──
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

  // ── Drag Gesture: Tour Scrubbing Engine (Pointer Events) ──
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('button') || e.target.closest('a')) return;

    // Halt any running auto-advance or active rotation animation
    if (animEngineRef.current.rafId) {
      cancelAnimationFrame(animEngineRef.current.rafId);
      animEngineRef.current.rafId = null;
      setIsAnimating(false);
    }
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    const cubeEl = cubeRef.current;
    const width = cubeEl ? cubeEl.offsetWidth || 200 : 200;

    const tourIdx = TOUR_SEQUENCE.indexOf(activeStage);
    const nextStage = TOUR_SEQUENCE[(tourIdx + 1) % TOUR_SEQUENCE.length];
    const prevStage = TOUR_SEQUENCE[(tourIdx - 1 + TOUR_SEQUENCE.length) % TOUR_SEQUENCE.length];

    dragInfoRef.current = {
      isDown: true,
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      cubeWidth: width,
      history: [{ x: e.clientX, t: performance.now() }],
      scrubCurrentStage: activeStage,
      scrubNextStage: nextStage,
      scrubPrevStage: prevStage,
      scrubTargetStage: activeStage,
      scrubProgress: 0,
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

    // Record point in rolling velocity history buffer (~100ms)
    const now = performance.now();
    d.history.push({ x: e.clientX, t: now });
    d.history = d.history.filter((p) => now - p.t < 110);

    // Scrub calculation:
    // Dragging LEFT (dx < 0) scrubs toward NEXT stage in tour
    // Dragging RIGHT (dx > 0) scrubs toward PREVIOUS stage in tour
    const scrubDist = d.cubeWidth * 1.1;
    const rawT = Math.min(1, Math.max(0, Math.abs(dx) / scrubDist));
    d.scrubProgress = rawT;

    const targetStage = dx < 0 ? d.scrubNextStage : d.scrubPrevStage;
    d.scrubTargetStage = targetStage;

    const qFrom = CANONICAL_POSES[d.scrubCurrentStage];
    const qTo = CANONICAL_POSES[targetStage];
    const interpolatedQuat = slerpQuat(qFrom, qTo, rawT);
    currentQuatRef.current = interpolatedQuat;

    // Update style.transform in requestAnimationFrame (0 setState calls!)
    if (!d.rafId) {
      d.rafId = requestAnimationFrame(() => {
        if (cubeRef.current) {
          cubeRef.current.style.transform = quatToMatrix3d(currentQuatRef.current);
        }
        d.rafId = null;
      });
    }

    // Discrete active stage projection when scrub progress crosses 0.5
    const projected = rawT >= 0.5 ? targetStage : d.scrubCurrentStage;
    setDragActiveStage((prev) => (prev !== projected ? projected : prev));
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

    const dx = e.clientX - d.startX;
    const rawT = d.scrubProgress;

    // Decision rule:
    // Commit if t > 0.35 or release velocity points in same direction above 0.3 px/ms
    let commit = false;
    if (dx < 0) {
      // Dragging left toward next
      commit = rawT > 0.35 || velocity < -0.3;
    } else {
      // Dragging right toward prev
      commit = rawT > 0.35 || velocity > 0.3;
    }

    const finalStage = commit ? d.scrubTargetStage : d.scrubCurrentStage;

    // Finish motion with normal slerp animation from current orientation (no jumps)
    const remainingFraction = commit ? 1 - rawT : rawT;
    const finishDuration = reducedMotion ? 0 : Math.max(250, Math.round(750 * remainingFraction));

    rotateToStage(finalStage, finishDuration);
  };

  // Keyboard navigation on switcher group
  const handleKeyDown = (e) => {
    const tourIdx = TOUR_SEQUENCE.indexOf(activeStage);
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (tourIdx - 1 + TOUR_SEQUENCE.length) % TOUR_SEQUENCE.length;
      rotateToStage(TOUR_SEQUENCE[prevIdx]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (tourIdx + 1) % TOUR_SEQUENCE.length;
      rotateToStage(TOUR_SEQUENCE[nextIdx]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Go to Levels (stage 4); if already there, return to Solves (0)
      rotateToStage(activeStage === 4 ? 0 : 4);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Go to Next up (stage 5); if already there, return to Solves (0)
      rotateToStage(activeStage === 5 ? 0 : 5);
    }
  };

  // Effective displayed active face (drag Active stage or settled activeStage)
  const currentDisplayedStage = dragActiveStage !== null ? dragActiveStage : activeStage;
  const stage = CUBE_STAGES[currentDisplayedStage];

  // Exploded view state: stage hover only, fine pointer only, not reduced motion, not dragging, not animating
  const isExploded = canHover && isStageHovered && !isDragging && !isAnimating && !reducedMotion;

  return (
    <div
      className="relative w-full max-w-[660px] flex flex-col items-center select-none py-2 [--s:clamp(180px,48vw,220px)] sm:[--s:clamp(180px,23vw,220px)]"
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
        onMouseEnter={() => setIsStageHovered(true)}
        onMouseLeave={() => {
          setIsStageHovered(false);
          resetParallax();
        }}
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
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Soft Floor Shadow (stays centered under cube, scales in sync with float) */}
          <div
            className={`absolute -bottom-6 w-[calc(var(--s)*0.82)] h-3 rounded-[100%] bg-black/40 blur-md pointer-events-none transition-opacity duration-300 ${
              reducedMotion ? 'opacity-30' : 'animate-cube-shadow'
            }`}
          />

          {/* ── LAYER 1.5: FIXED VIEWING TILT WRAPPER (-14deg on X) ── */}
          <div
            style={{
              transform: 'rotateX(-14deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* ── LAYER 2: PARALLAX WRAPPER (MOUSE TILT, 150ms EASE-OUT) ── */}
            <div
              ref={parallaxRef}
              style={{
                perspective: '1100px',
                transformStyle: 'preserve-3d',
                transform: 'rotateX(var(--px, 0deg)) rotateY(var(--py, 0deg))',
                transition: isDragging ? 'none' : 'transform 150ms ease-out',
              }}
            >
              {/* ── LAYER 3: CUBE ELEMENT (DRIVEN 100% BY 3D ORIENTATION ENGINE) ── */}
              <div
                ref={cubeRef}
                style={{
                  width: 'var(--s)',
                  height: 'var(--s)',
                  transformStyle: 'preserve-3d',
                  transformOrigin: '50% 50% 0px',
                  transform: quatToMatrix3d(currentQuatRef.current),
                  willChange: 'transform',
                  '--gap': isExploded ? 'calc(var(--s) * 0.14)' : '0px',
                }}
              >
                {/* 6 Faces: 4 Lateral + 1 Top + 1 Bottom */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const isFaceActive = currentDisplayedStage === i;
                  // Specific face transform:
                  // 0: rotateY(0deg), 1: rotateY(90deg), 2: rotateY(180deg), 3: rotateY(270deg)
                  // 4: rotateX(90deg) (Top face), 5: rotateX(-90deg) (Bottom face)
                  let faceTransform = '';
                  if (i < 4) {
                    faceTransform = `rotateY(${i * 90}deg) translateZ(calc(var(--s) / 2 + var(--gap, 0px)))`;
                  } else if (i === 4) {
                    faceTransform = 'rotateX(90deg) translateZ(calc(var(--s) / 2 + var(--gap, 0px)))';
                  } else {
                    faceTransform = 'rotateX(-90deg) translateZ(calc(var(--s) / 2 + var(--gap, 0px)))';
                  }

                  // Lighting filter: Top face subtle brightness, bottom face subtle shade
                  const lightingClass = i === 4 ? 'brightness-105' : i === 5 ? 'brightness-90' : '';

                  return (
                    <div
                      key={i}
                      className={`absolute inset-0 rounded-xl p-2.5 sm:p-3 overflow-hidden select-none bg-surface shadow-card ${lightingClass} ${
                        isFaceActive ? 'border border-accent/80' : 'border border-line'
                      }`}
                      style={{
                        transform: faceTransform,
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
                      {i === 4 && <DifficultySplitViz active={isFaceActive} reducedMotion={reducedMotion} />}
                      {i === 5 && <NextUpViz active={isFaceActive} reducedMotion={reducedMotion} />}

                      {/* Face lighting: Subtle dark overlay on inactive faces for 3D depth */}
                      <div
                        className={`absolute inset-0 bg-black/22 pointer-events-none transition-opacity duration-300 ${
                          isFaceActive ? 'opacity-0' : 'opacity-100'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE 6-STAGE SWITCHER CONTROLS ── */}
      <div
        role="group"
        aria-label="3D Cube Stage Controls"
        className="mt-3 flex flex-col items-center select-none w-full max-w-full px-2"
      >
        <div
          className="flex items-center justify-center flex-wrap gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-surface border border-line shadow-sm max-w-full"
          onKeyDown={handleKeyDown}
        >
          {CUBE_STAGES.map((s, idx) => {
            const isActive = currentDisplayedStage === idx;
            return (
              <button
                key={s.id}
                onClick={() => handleStageButtonClick(idx)}
                type="button"
                aria-pressed={isActive}
                aria-label={`Switch to stage ${idx + 1}: ${s.stageLabel}`}
                className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                  isActive
                    ? 'bg-surface-2 text-text border border-line shadow-xs font-semibold'
                    : 'text-text-secondary hover:text-text hover:bg-surface-2/60 border border-transparent'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors shrink-0 ${
                    isActive ? 'bg-accent' : 'bg-muted'
                  }`}
                  aria-hidden="true"
                />
                <span className="font-mono">{idx + 1}</span>
                <span className="hidden sm:inline">{s.stageLabel}</span>
                <span className="inline sm:hidden">{s.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Auto-Advance Progress Indicator Line */}
        {!reducedMotion && (
          <div className="w-28 h-0.5 mt-1.5 bg-surface-2/80 rounded-full overflow-hidden border border-line/40">
            <div
              key={progressKey}
              className="h-full bg-accent rounded-full animate-advance-progress"
              style={{
                animationPlayState:
                  isStageHovered || isFocused || isDocHidden || isOffscreen || isDragging || isAnimating
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
