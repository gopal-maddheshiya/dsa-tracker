import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Code2,
  CalendarClock,
  Radar,
  PieChart,
  Flame,
  Sparkles,
} from 'lucide-react';
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
 * Tight, honest copy fitting in <= 2 lines on desktop and <= 3 lines on mobile.
 */
const CUBE_STAGES = [
  {
    id: 0,
    stageLabel: 'Solves',
    title: 'Sliding Window Pattern',
    description: 'Maintains running subarray state across linear sequences with dual pointers to avoid redundant passes.',
    accentColor: colors.easy,
  },
  {
    id: 1,
    stageLabel: 'Spaced',
    title: 'Adaptive Revision Ladder',
    description: 'Schedules 2-day recall for struggled problems and dynamically scales intervals up to 14 days upon mastery.',
    accentColor: colors.accent,
  },
  {
    id: 2,
    stageLabel: 'Topics',
    title: 'Topic Struggle Radar',
    description: 'Surfaces highest friction categories across data structures so practice stays focused on high-yield gaps.',
    accentColor: colors.medium,
  },
  {
    id: 3,
    stageLabel: 'Velocity',
    title: 'Practice Cadence Heatmap',
    description: 'Tracks daily problem-solving consistency across 20 weeks to build durable pattern recognition habits.',
    accentColor: colors.easy,
  },
  {
    id: 4,
    stageLabel: 'Levels',
    title: 'Curated Difficulty Curve',
    description: 'Maintains a balanced split of Easy, Medium, and Hard challenges to prevent premature plateauing.',
    accentColor: colors.medium,
  },
  {
    id: 5,
    stageLabel: 'Next up',
    title: 'Dynamic Practice Queue',
    description: 'Prioritizes scheduled reviews, weak spots, and fresh patterns based on cadence and decay signals.',
    accentColor: colors.accent,
  },
];

/**
 * Fixed deterministic tour visiting all 6 faces across all rotation axes:
 * 0 (Solves) -> 1 (Spaced) -> 2 (Topics) -> 4 (Levels) -> 3 (Velocity) -> 5 (Next up) -> 0
 */
export const TOUR_SEQUENCE = [0, 1, 2, 4, 3, 5];

/**
 * Switcher Segment Configuration matching Tour Order strictly from left to right.
 */
const TOUR_SEGMENTS = [
  { stageId: 0, label: 'Solves', icon: Code2 },
  { stageId: 1, label: 'Spaced', icon: CalendarClock },
  { stageId: 2, label: 'Topics', icon: Radar },
  { stageId: 4, label: 'Levels', icon: PieChart },
  { stageId: 3, label: 'Velocity', icon: Flame },
  { stageId: 5, label: 'Next up', icon: Sparkles },
];

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

// Slightly off-axis initial quaternion for entrance animation on first mount
const ENTRANCE_START_QUAT = {
  x: 0.08,
  y: 0.15,
  z: 0.02,
  w: 0.985,
};

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

// Global flag to ensure entrance animation triggers once per session mount
let hasCompletedEntranceOnce = false;

const Rotating3DCube = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [isStageHovered, setIsStageHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDocHidden, setIsDocHidden] = useState(false);
  const [isOffscreen, setIsOffscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // In-flight active face for visuals during drag/scrub (discrete updates only)
  const [dragActiveStage, setDragActiveStage] = useState(null);

  // Orbit ring key to restart orbit dot animation from initial point after each move ends
  const [orbitKey, setOrbitKey] = useState(0);

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

  // Entrance animation state
  const [entrancePhase, setEntrancePhase] = useState(() => {
    if (typeof window === 'undefined') return 'settled';
    return hasCompletedEntranceOnce ? 'settled' : 'starting';
  });

  const stageRef = useRef(null);
  const parallaxRef = useRef(null);
  const cubeRef = useRef(null);

  // Current cube orientation quaternion
  const currentQuatRef = useRef(
    hasCompletedEntranceOnce || reducedMotion ? CANONICAL_POSES[0] : ENTRANCE_START_QUAT
  );

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
    cubeWidth: 220,
    history: [],
    scrubCurrentStage: 0,
    scrubNextStage: 1,
    scrubPrevStage: 5,
    scrubTargetStage: 0,
    scrubProgress: 0,
    downTargetStage: null,
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

  // ── Orientation Engine: Slerp to Target Stage with Scale Dip ──
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
      setOrbitKey((k) => k + 1);
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

      // Scale dip at mid-move (scale = 1 - 0.06 * sin(pi * progress))
      const scaleDip = 1 - 0.06 * Math.sin(Math.PI * progress);

      if (cubeRef.current) {
        cubeRef.current.style.transform = `${quatToMatrix3d(q)} scale3d(${scaleDip.toFixed(4)}, ${scaleDip.toFixed(4)}, ${scaleDip.toFixed(4)})`;
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
        setOrbitKey((k) => k + 1);
        animEngineRef.current.rafId = null;
      }
    };

    animEngineRef.current.rafId = requestAnimationFrame(tick);
  }, [reducedMotion]);

  // Entrance Animation on First Mount
  useEffect(() => {
    if (hasCompletedEntranceOnce || reducedMotion) {
      setEntrancePhase('settled');
      return;
    }

    hasCompletedEntranceOnce = true;
    setEntrancePhase('entering');

    // Ease from ENTRANCE_START_QUAT to CANONICAL_POSES[0] over 1100ms
    const startTime = performance.now();
    const duration = 1100;
    const startQuat = ENTRANCE_START_QUAT;
    const targetQuat = CANONICAL_POSES[0];

    const entranceTick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedT = easeInOutCubic(progress);

      const q = slerpQuat(startQuat, targetQuat, easedT);
      currentQuatRef.current = q;

      // Scale up smoothly from 0.92 to 1.0
      const entranceScale = 0.92 + 0.08 * easedT;

      if (cubeRef.current) {
        cubeRef.current.style.transform = `${quatToMatrix3d(q)} scale3d(${entranceScale.toFixed(4)}, ${entranceScale.toFixed(4)}, ${entranceScale.toFixed(4)})`;
      }

      if (progress < 1) {
        requestAnimationFrame(entranceTick);
      } else {
        currentQuatRef.current = targetQuat;
        if (cubeRef.current) {
          cubeRef.current.style.transform = quatToMatrix3d(targetQuat);
        }
        setEntrancePhase('settled');
      }
    };

    requestAnimationFrame(entranceTick);
  }, [reducedMotion]);

  // Direct segment button click handler
  const handleStageButtonClick = useCallback((targetStage) => {
    setHasInteracted(true);
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
      isAnimating ||
      entrancePhase !== 'settled';

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
    entrancePhase,
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

    const targetRotY = clampedX * 7; // +/- 7 deg on Y
    const targetRotX = -clampedY * 5; // +/- 5 deg on X

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

    // Check if pointer hit a specific face element for tap-to-stage
    const faceEl = e.target.closest('[data-stage]');
    const downStageAttr = faceEl ? faceEl.getAttribute('data-stage') : null;
    const downStage = downStageAttr !== null ? parseInt(downStageAttr, 10) : null;

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
    const width = cubeEl ? cubeEl.offsetWidth || 220 : 220;

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
      downTargetStage: downStage,
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

    // Step 7: Tap (click without drag) on a visible non-active face brings that face to front
    if (!d.isDragging) {
      if (d.downTargetStage !== null) {
        const faceEl = e.target.closest('[data-stage]');
        const upStageAttr = faceEl ? faceEl.getAttribute('data-stage') : null;
        const upStage = upStageAttr !== null ? parseInt(upStageAttr, 10) : null;
        if (upStage !== null && upStage === d.downTargetStage && upStage !== activeStage) {
          setHasInteracted(true);
          rotateToStage(upStage);
        }
      }
      return;
    }

    d.isDragging = false;
    setIsDragging(false);
    setHasInteracted(true);

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
      commit = rawT > 0.35 || velocity < -0.3;
    } else {
      commit = rawT > 0.35 || velocity > 0.3;
    }

    const finalStage = commit ? d.scrubTargetStage : d.scrubCurrentStage;

    // Finish motion with normal slerp animation from current orientation (no jumps)
    const remainingFraction = commit ? 1 - rawT : rawT;
    const finishDuration = reducedMotion ? 0 : Math.max(250, Math.round(750 * remainingFraction));

    rotateToStage(finalStage, finishDuration);
  };

  // Keyboard navigation on segmented switcher group
  const handleKeyDown = (e) => {
    const tourIdx = TOUR_SEQUENCE.indexOf(activeStage);
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setHasInteracted(true);
      const prevIdx = (tourIdx - 1 + TOUR_SEQUENCE.length) % TOUR_SEQUENCE.length;
      rotateToStage(TOUR_SEQUENCE[prevIdx]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setHasInteracted(true);
      const nextIdx = (tourIdx + 1) % TOUR_SEQUENCE.length;
      rotateToStage(TOUR_SEQUENCE[nextIdx]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHasInteracted(true);
      // Go to Levels (stage 4); if already there, return to Solves (0)
      rotateToStage(activeStage === 4 ? 0 : 4);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHasInteracted(true);
      // Go to Next up (stage 5); if already there, return to Solves (0)
      rotateToStage(activeStage === 5 ? 0 : 5);
    }
  };

  // Effective displayed active face (drag Active stage or settled activeStage)
  const currentDisplayedStage = dragActiveStage !== null ? dragActiveStage : activeStage;
  const stage = CUBE_STAGES[currentDisplayedStage];

  // Active tour index for the segmented switcher sliding indicator
  const activeTourIdx = TOUR_SEQUENCE.indexOf(currentDisplayedStage);

  // Exploded view state: stage hover only, fine pointer only, not reduced motion, not dragging, not animating
  const isExploded = canHover && isStageHovered && !isDragging && !isAnimating && !reducedMotion;

  // Auto-advance & idle pause condition
  const isPaused =
    reducedMotion ||
    isStageHovered ||
    isFocused ||
    isDocHidden ||
    isOffscreen ||
    isDragging ||
    isAnimating;

  return (
    <div
      className="relative w-full max-w-[660px] flex flex-col items-center select-none py-1 sm:py-2 gap-4 lg:gap-6 [@media(max-height:800px)]:gap-2 [@media(max-height:800px)]:py-0 [--s:clamp(180px,48vw,220px)] sm:[--s:clamp(180px,23vw,220px)] lg:[--s:clamp(200px,26vw,264px)] [@media(max-height:800px)]:lg:[--s:clamp(165px,18vw,185px)]"
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
          height: 'calc(var(--s) * 1.42)',
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
        {/* Step 6: Faint Dot Grid Background with Radial Mask */}
        <div
          className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            maskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, black 20%, transparent 75%)',
          }}
        />

        {/* ── STEP 3: TURNTABLE ORBIT RING WITH TRAVELING ACCENT DOT ── */}
        <div
          className="absolute -bottom-8 pointer-events-none flex items-center justify-center z-0"
          style={{
            width: 'calc(var(--s) * 1.35)',
            height: 'calc(var(--s) * 1.35)',
            transform: 'rotateX(76deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Neutral Floor Shadow */}
          <div
            className={`absolute w-[68%] h-[68%] rounded-full bg-black/40 blur-md ${
              reducedMotion ? 'opacity-30' : 'animate-cube-shadow'
            }`}
          />

          {/* Hairline Turntable Orbit Ring */}
          <div className="absolute inset-0 rounded-full border border-line/45">
            {/* Traveling Orbit Dot (Auto-Advance Indicator) */}
            {!reducedMotion && (
              <div
                key={orbitKey}
                className="w-full h-full rounded-full animate-orbit-rotate"
                style={{
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(255,161,22,0.4)]" />
              </div>
            )}
          </div>
        </div>

        {/* ── LAYER 1: OUTER FLOAT WRAPPER (IDLE FLOAT ANIMATION) ── */}
        <div
          className={`relative flex items-center justify-center z-10 ${
            reducedMotion ? '' : 'animate-cube-subtle-float'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ── LAYER 1.2: IDLE YAW DRIFT (SLOW +/-2 DEGREE DRIFT) ── */}
          <div
            className={reducedMotion ? '' : 'animate-cube-yaw-drift'}
            style={{
              transformStyle: 'preserve-3d',
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
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
                    // Specific face transforms:
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
                        data-stage={i}
                        className={`absolute inset-0 rounded-2xl p-2.5 sm:p-3 overflow-hidden select-none bg-surface shadow-card ${lightingClass} ${
                          isFaceActive ? 'border border-accent' : 'border border-line'
                        }`}
                        style={{
                          transform: faceTransform,
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
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

                        {/* Step 5: Face Material Lighting Sheen & Vignette Overlay */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 60%), radial-gradient(ellipse at center, transparent 65%, rgba(0, 0, 0, 0.1) 100%)',
                          }}
                          aria-hidden="true"
                        />

                        {/* Step 5: Active Face Viewfinder Camera Corner Ticks */}
                        <div
                          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                            isFaceActive ? 'opacity-100' : 'opacity-0'
                          }`}
                          aria-hidden="true"
                        >
                          <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-accent" />
                          <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-accent" />
                          <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-accent" />
                          <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-accent" />
                        </div>

                        {/* Inactive Face Dark Overlay (tuned to ~28% black) */}
                        <div
                          className={`absolute inset-0 bg-black/28 pointer-events-none transition-opacity duration-300 ${
                            isFaceActive ? 'opacity-0' : 'opacity-100'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEP 1: ONE CENTERED CAPTION BLOCK (TIGHT, CROSS-FADING, FIXED MIN-HEIGHT) ── */}
      <div
        className="w-full max-w-[460px] px-4 min-h-[88px] sm:min-h-[96px] [@media(max-height:800px)]:min-h-[72px] flex flex-col items-center text-center justify-start select-none"
        aria-live="polite"
      >
        <div
          key={currentDisplayedStage}
          className={`flex flex-col items-center ${
            reducedMotion ? '' : 'animate-caption-fade'
          }`}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: stage.accentColor }}
              aria-hidden="true"
            />
            <span>{stage.stageLabel}</span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-text tracking-tight leading-snug">
            {stage.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-text-secondary mt-1 leading-relaxed max-w-[48ch]">
            {stage.description}
          </p>
        </div>
      </div>

      {/* ── STEP 4: PILL-SHAPED SEGMENTED CONTROL IN TOUR ORDER ── */}
      <div
        role="group"
        aria-label="3D Cube Stage Controls"
        className="flex flex-col items-center select-none w-full max-w-full px-2"
      >
        <div
          className="relative flex items-center justify-center p-1 rounded-full bg-surface border border-line shadow-sm max-w-full"
          onKeyDown={handleKeyDown}
        >
          {/* Sliding Indicator behind active segment */}
          <div
            className="absolute top-1 bottom-1 rounded-full bg-surface-2 border border-line shadow-xs pointer-events-none"
            style={{
              width: 'calc((100% - 8px) / 6)',
              left: '4px',
              transform: `translateX(${activeTourIdx * 100}%)`,
              transition: reducedMotion
                ? 'none'
                : 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Small accent dot indicator on active segment */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
          </div>

          {TOUR_SEGMENTS.map((seg, segIdx) => {
            const isActive = activeTourIdx === segIdx;
            const Icon = seg.icon;
            return (
              <button
                key={seg.stageId}
                onClick={() => handleStageButtonClick(seg.stageId)}
                type="button"
                aria-pressed={isActive}
                aria-label={`Switch to stage ${segIdx + 1}: ${seg.label}`}
                className={`relative z-10 min-w-[44px] min-h-[44px] sm:min-h-0 sm:min-w-0 px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'text-text font-semibold'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline font-sans">{seg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Step 4: Merged Microcopy Line (12px, clean, fades hint after first interaction) */}
        <p className="text-xs text-muted font-sans text-center mt-2 select-none">
          {!hasInteracted && (
            <span>{isTouchDevice ? 'Swipe to rotate · ' : 'Drag to rotate · '}</span>
          )}
          <span>Sample data</span>
        </p>
      </div>

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
            opacity: 0.40;
          }
          50% {
            transform: scale(0.85);
            opacity: 0.22;
          }
        }

        @keyframes cubeYawDrift {
          0%, 100% {
            transform: rotateY(-2deg);
          }
          50% {
            transform: rotateY(2deg);
          }
        }

        @keyframes orbitRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes captionFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        .animate-cube-subtle-float {
          animation: cubeSubtleFloat 4.4s ease-in-out infinite;
        }

        .animate-cube-shadow {
          animation: cubeShadowPulse 4.4s ease-in-out infinite;
        }

        .animate-cube-yaw-drift {
          animation: cubeYawDrift 7s ease-in-out infinite;
        }

        .animate-orbit-rotate {
          animation: orbitRotate 5800ms linear infinite;
        }

        .animate-caption-fade {
          animation: captionFade 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Rotating3DCube;
