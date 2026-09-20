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
import CubeSatellites from './CubeSatellites';

/**
 * 6 Stage Metadata for the 6 Cube Faces.
 * Synchronized with the 6 live face visualizations.
 */
const CUBE_STAGES = [
  {
    id: 0,
    stageLabel: 'Solves',
    title: 'Sliding Window Pattern',
    description: 'Maintains running subarray state across linear sequences with dual pointers to avoid redundant passes.',
    accentColor: colors.easy,
    icon: Code2,
  },
  {
    id: 1,
    stageLabel: 'Spaced',
    title: 'Adaptive Revision Ladder',
    description: 'Schedules 2-day recall for struggled problems and dynamically scales intervals up to 14 days upon mastery.',
    accentColor: colors.accent,
    icon: CalendarClock,
  },
  {
    id: 2,
    stageLabel: 'Topics',
    title: 'Topic Struggle Radar',
    description: 'Surfaces highest friction categories across data structures so practice stays focused on high-yield gaps.',
    accentColor: colors.medium,
    icon: Radar,
  },
  {
    id: 3,
    stageLabel: 'Velocity',
    title: 'Practice Cadence Heatmap',
    description: 'Tracks daily problem-solving consistency across 20 weeks to build durable pattern recognition habits.',
    accentColor: colors.easy,
    icon: Flame,
  },
  {
    id: 4,
    stageLabel: 'Levels',
    title: 'Curated Difficulty Curve',
    description: 'Maintains a balanced split of Easy, Medium, and Hard challenges to prevent premature plateauing.',
    accentColor: colors.medium,
    icon: PieChart,
  },
  {
    id: 5,
    stageLabel: 'Next up',
    title: 'Dynamic Practice Queue',
    description: 'Prioritizes scheduled reviews, weak spots, and fresh patterns based on cadence and decay signals.',
    accentColor: colors.accent,
    icon: Sparkles,
  },
];

export const DWELL_TIME_MS = 1100;
export const MOVE_DURATION_MS = 450;

/**
 * Tour sequences:
 * Forward: 0 (Solves) -> 1 (Spaced) -> 2 (Topics) -> 4 (Levels) -> 3 (Velocity) -> 5 (Next up) -> 0
 * Reverse: 0 -> 5 -> 3 -> 4 -> 2 -> 1 -> 0
 */
export const TOUR_FORWARD = [0, 1, 2, 4, 3, 5];
export const TOUR_REVERSE = [0, 5, 3, 4, 2, 1];
export const TOUR_SEQUENCE = TOUR_FORWARD;

/**
 * 6 Canonical Upright Poses represented as Unit Quaternions [x, y, z, w].
 */
const SQRT1_2 = Math.SQRT1_2; // ~0.70710678

export const CANONICAL_POSES = [
  { x: 0, y: 0, z: 0, w: 1 },
  { x: 0, y: -SQRT1_2, z: 0, w: SQRT1_2 },
  { x: 0, y: -1, z: 0, w: 0 },
  { x: 0, y: SQRT1_2, z: 0, w: SQRT1_2 },
  { x: SQRT1_2, y: 0, z: 0, w: SQRT1_2 },
  { x: -SQRT1_2, y: 0, z: 0, w: SQRT1_2 },
];

const ENTRANCE_START_QUAT = {
  x: 0.1826,
  y: -0.3473,
  z: 0.0696,
  w: 0.9172,
};

/**
 * Convert unit quaternion {x, y, z, w} to standard CSS 3D 4x4 matrix3d string.
 */
export function quatToMatrix3d(q) {
  const { x, y, z, w } = q;
  const m11 = 1 - 2 * (y * y + z * z);
  const m12 = 2 * (x * y + z * w);
  const m13 = 2 * (x * z - y * w);
  const m21 = 2 * (x * y - z * w);
  const m22 = 1 - 2 * (x * x + z * z);
  const m23 = 2 * (y * z + x * w);
  const m31 = 2 * (x * z + y * w);
  const m32 = 2 * (y * z - x * w);
  const m33 = 1 - 2 * (x * x + y * y);

  return `matrix3d(${m11.toFixed(6)}, ${m12.toFixed(6)}, ${m13.toFixed(6)}, 0, ${m21.toFixed(6)}, ${m22.toFixed(6)}, ${m23.toFixed(6)}, 0, ${m31.toFixed(6)}, ${m32.toFixed(6)}, ${m33.toFixed(6)}, 0, 0, 0, 0, 1)`;
}

/**
 * Spherical linear interpolation between two unit quaternions with shortest arc check.
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

  const theta0 = Math.acos(Math.max(-1, Math.min(1, dot)));
  const theta = theta0 * t;
  const sinTheta0 = Math.sin(theta0);
  const sinTheta = Math.sin(theta);

  const s1 = Math.cos(theta) - (dot * sinTheta) / sinTheta0;
  const s2 = sinTheta / sinTheta0;

  return {
    x: s1 * qA.x + s2 * bx,
    y: s1 * qA.y + s2 * by,
    z: s1 * qA.z + s2 * bz,
    w: s1 * qA.w + s2 * bw,
  };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let hasCompletedEntranceOnce = false;

const Rotating3DCube = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [isStageHovered, setIsStageHovered] = useState(false);
  const [isDocHidden, setIsDocHidden] = useState(false);
  const [isOffscreen, setIsOffscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Accessible reduced motion detection
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // User pause control (accessibility button; starts paused with reduced motion)
  const [isUserPaused, setIsUserPaused] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Discrete in-flight active face for drag/scrub
  const [dragActiveStage, setDragActiveStage] = useState(null);

  // Key to restart 2px progress bar fill animation
  const [progressKey, setProgressKey] = useState(0);

  // Entrance animation state
  const [entrancePhase, setEntrancePhase] = useState(() => {
    if (typeof window === 'undefined') return 'settled';
    return hasCompletedEntranceOnce ? 'settled' : 'starting';
  });

  // Current tour lap direction: 'forward' or 'reverse'
  const tourDirectionRef = useRef('forward');

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
  const currentQuatRef = useRef(
    hasCompletedEntranceOnce || reducedMotion ? CANONICAL_POSES[0] : ENTRANCE_START_QUAT
  );

  // Animation engine state ref
  const animEngineRef = useRef({
    rafId: null,
    startQuat: CANONICAL_POSES[0],
    targetQuat: CANONICAL_POSES[0],
    startTime: 0,
    duration: MOVE_DURATION_MS,
    targetStage: 0,
  });

  const parallaxRafRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);
  const entranceRafRef = useRef(null);

  // Pointer drag tracking ref
  const dragInfoRef = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    cubeWidth: 240,
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
    const handleMotionChange = (e) => {
      setReducedMotion(e.matches);
      if (e.matches) setIsUserPaused(true);
    };
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

  // IntersectionObserver to pause auto-advance when offscreen (threshold ~0.15)
  useEffect(() => {
    if (!stageRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOffscreen(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  // ── ResizeObserver for Fixed 240x240 Canvas Scaling: --k = sizePx / 240 ──
  useEffect(() => {
    if (!cubeRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          const k = width / 240;
          if (cubeRef.current) {
            cubeRef.current.style.setProperty('--k', k.toFixed(4));
          }
        }
      }
    });
    observer.observe(cubeRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Orientation Engine: Slerp to Target Stage with Scale Dip (500ms) ──
  const rotateToStage = useCallback((targetStage, customDuration = MOVE_DURATION_MS, trigger = 'auto') => {
    if (typeof window !== 'undefined') {
      window.__cubeMoves = window.__cubeMoves || [];
      window.__cubeMoves.push({
        timestamp: Date.now(),
        from: activeStage,
        to: targetStage,
        trigger,
      });
    }

    if (animEngineRef.current.rafId) {
      cancelAnimationFrame(animEngineRef.current.rafId);
      animEngineRef.current.rafId = null;
    }

    if (entranceRafRef.current) {
      cancelAnimationFrame(entranceRafRef.current);
      entranceRafRef.current = null;
      setEntrancePhase('settled');
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
        setProgressKey((k) => k + 1);
        animEngineRef.current.rafId = null;
      }
    };

    animEngineRef.current.rafId = requestAnimationFrame(tick);
  }, [activeStage, reducedMotion]);

  // Entrance Animation on First Mount
  useEffect(() => {
    if (hasCompletedEntranceOnce || reducedMotion) {
      setEntrancePhase('settled');
      return;
    }

    hasCompletedEntranceOnce = true;
    setEntrancePhase('entering');

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

      const entranceScale = 0.92 + 0.08 * easedT;

      if (cubeRef.current) {
        cubeRef.current.style.transform = `${quatToMatrix3d(q)} scale3d(${entranceScale.toFixed(4)}, ${entranceScale.toFixed(4)}, ${entranceScale.toFixed(4)})`;
      }

      if (progress < 1) {
        entranceRafRef.current = requestAnimationFrame(entranceTick);
      } else {
        entranceRafRef.current = null;
        currentQuatRef.current = targetQuat;
        if (cubeRef.current) {
          cubeRef.current.style.transform = quatToMatrix3d(targetQuat);
        }
        setEntrancePhase('settled');
      }
    };

    entranceRafRef.current = requestAnimationFrame(entranceTick);
    return () => {
      if (entranceRafRef.current) {
        cancelAnimationFrame(entranceRafRef.current);
        entranceRafRef.current = null;
      }
    };
  }, [reducedMotion]);

  // Hard STOP conditions for Auto-Advance
  const isHardPaused =
    isUserPaused ||
    isDocHidden ||
    isOffscreen ||
    isDragging ||
    reducedMotion ||
    entrancePhase !== 'settled';

  // ── Auto-Advance Tour Engine with Alternating Direction ──
  // Dwell 1200ms + Move 500ms
  const advanceTour = useCallback(() => {
    const isForward = tourDirectionRef.current === 'forward';
    const seq = isForward ? TOUR_FORWARD : TOUR_REVERSE;
    const currentIdx = seq.indexOf(activeStage);
    const nextIdx = (currentIdx + 1) % seq.length;
    const nextStage = seq[nextIdx];

    // If lap completed, switch direction for next lap
    if (nextIdx === 0) {
      tourDirectionRef.current = isForward ? 'reverse' : 'forward';
    }

    rotateToStage(nextStage, MOVE_DURATION_MS, 'auto');
  }, [activeStage, rotateToStage]);

  // Soft Delay Function: Resets dwell timer to 1800ms grace period on user interactions
  const delayTour = useCallback((graceMs = 1800) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setProgressKey((k) => k + 1);

    if (isHardPaused) return;

    autoAdvanceTimerRef.current = setTimeout(() => {
      advanceTour();
    }, graceMs);
  }, [advanceTour, isHardPaused]);

  // Standard Auto-Advance Timer Effect
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (isHardPaused || isAnimating) {
      return;
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      advanceTour();
    }, DWELL_TIME_MS);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [activeStage, isHardPaused, isAnimating, advanceTour]);

  // Expose test hooks on window for automated verification
  useEffect(() => {
    window.__setCubeStage = (st) => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      rotateToStage(st, 0, 'test');
    };
    window.__rotateToStageSmooth = (st) => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      rotateToStage(st, MOVE_DURATION_MS, 'test-smooth');
    };
    window.__pauseTour = () => {
      setIsUserPaused(true);
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
    window.__resumeTour = () => {
      setIsUserPaused(false);
    };
    window.__cubeState = {
      activeStage,
      isAnimating,
      isDragging,
    };
  }, [activeStage, isAnimating, isDragging, rotateToStage]);

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

    const targetRotY = clampedX * 6; // +/- 6 deg on Y
    const targetRotX = -clampedY * 4; // +/- 4 deg on X

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

  // ── Scrub-Drag Tracking & Tap Detection ──
  const handlePointerDown = (e) => {
    if (isAnimating) return;
    const cubeWidth = cubeRef.current ? cubeRef.current.getBoundingClientRect().width : 240;

    const clickedStageEl = e.target.closest('[data-stage]');
    const downTargetStage = clickedStageEl
      ? parseInt(clickedStageEl.getAttribute('data-stage'), 10)
      : null;

    const currentSeq = tourDirectionRef.current === 'forward' ? TOUR_FORWARD : TOUR_REVERSE;
    const curIdx = currentSeq.indexOf(activeStage);
    const nextIdx = (curIdx + 1) % currentSeq.length;
    const prevIdx = (curIdx - 1 + currentSeq.length) % currentSeq.length;

    dragInfoRef.current = {
      isDown: true,
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      cubeWidth,
      history: [{ x: e.clientX, y: e.clientY, time: performance.now() }],
      scrubCurrentStage: activeStage,
      scrubNextStage: currentSeq[nextIdx],
      scrubPrevStage: currentSeq[prevIdx],
      scrubTargetStage: activeStage,
      scrubProgress: 0,
      downTargetStage,
      rafId: null,
    };

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handlePointerMove = (e) => {
    if (canHover && !dragInfoRef.current.isDown) {
      handleParallaxMove(e);
      delayTour(4000);
    }

    if (!dragInfoRef.current.isDown) return;

    const dx = e.clientX - dragInfoRef.current.startX;
    const dy = e.clientY - dragInfoRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (!dragInfoRef.current.isDragging && dist > 5) {
      dragInfoRef.current.isDragging = true;
      setIsDragging(true);
      delayTour(4000);
    }

    if (!dragInfoRef.current.isDragging) return;

    const now = performance.now();
    dragInfoRef.current.history.push({ x: e.clientX, y: e.clientY, time: now });
    if (dragInfoRef.current.history.length > 6) {
      dragInfoRef.current.history.shift();
    }

    const { cubeWidth, scrubCurrentStage, scrubNextStage, scrubPrevStage } = dragInfoRef.current;
    const rawProgress = -dx / cubeWidth;
    const clampedProgress = Math.max(-1, Math.min(1, rawProgress));

    const targetStage = clampedProgress >= 0 ? scrubNextStage : scrubPrevStage;
    const t = Math.abs(clampedProgress);

    dragInfoRef.current.scrubTargetStage = targetStage;
    dragInfoRef.current.scrubProgress = clampedProgress;

    const startQuat = CANONICAL_POSES[scrubCurrentStage];
    const destQuat = CANONICAL_POSES[targetStage];

    if (dragInfoRef.current.rafId) cancelAnimationFrame(dragInfoRef.current.rafId);
    dragInfoRef.current.rafId = requestAnimationFrame(() => {
      const q = slerpQuat(startQuat, destQuat, t);
      currentQuatRef.current = q;
      if (cubeRef.current) {
        cubeRef.current.style.transform = quatToMatrix3d(q);
      }
      if (t >= 0.5) {
        setDragActiveStage(targetStage);
      } else {
        setDragActiveStage(scrubCurrentStage);
      }
      dragInfoRef.current.rafId = null;
    });
  };

  const handlePointerUp = (e) => {
    if (!dragInfoRef.current.isDown) return;
    const wasDragging = dragInfoRef.current.isDragging;
    const { scrubTargetStage, scrubCurrentStage, scrubProgress, downTargetStage } = dragInfoRef.current;

    dragInfoRef.current.isDown = false;
    dragInfoRef.current.isDragging = false;
    setIsDragging(false);

    if (dragInfoRef.current.rafId) {
      cancelAnimationFrame(dragInfoRef.current.rafId);
      dragInfoRef.current.rafId = null;
    }

    if (e.currentTarget.releasePointerCapture && e.pointerId !== undefined) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    // Tap on visible non-active face sliver: rotate directly to that face
    if (!wasDragging && downTargetStage !== null && downTargetStage !== activeStage) {
      delayTour(2500);
      rotateToStage(downTargetStage, MOVE_DURATION_MS, 'tap');
      return;
    }

    // Drag release resolution
    if (wasDragging) {
      delayTour(2500);
      const history = dragInfoRef.current.history;
      let flickVelocity = 0;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = last.time - first.time;
        if (dt > 10) {
          flickVelocity = -(last.x - first.x) / dt;
        }
      }

      const shouldCommit = Math.abs(scrubProgress) > 0.35 || Math.abs(flickVelocity) > 0.45;
      const finalStage = shouldCommit ? scrubTargetStage : scrubCurrentStage;

      const currentQ = currentQuatRef.current;
      const targetQ = CANONICAL_POSES[finalStage];
      const remainingDot = Math.abs(
        currentQ.x * targetQ.x + currentQ.y * targetQ.y + currentQ.z * targetQ.z + currentQ.w * targetQ.w
      );
      const angleRemaining = 2 * Math.acos(Math.max(-1, Math.min(1, remainingDot)));
      const snapDuration = Math.max(200, Math.min(MOVE_DURATION_MS, (angleRemaining / (Math.PI / 2)) * 400));

      rotateToStage(finalStage, snapDuration, 'drag');
    }
  };

  // Keyboard navigation: ArrowLeft/Right/Up/Down
  const handleKeyDown = (e) => {
    const currentSeq = tourDirectionRef.current === 'forward' ? TOUR_FORWARD : TOUR_REVERSE;
    const curIdx = currentSeq.indexOf(activeStage);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      delayTour(2500);
      const nextIdx = (curIdx + 1) % currentSeq.length;
      rotateToStage(currentSeq[nextIdx], MOVE_DURATION_MS, 'keyboard');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      delayTour(2500);
      const prevIdx = (curIdx - 1 + currentSeq.length) % currentSeq.length;
      rotateToStage(currentSeq[prevIdx], MOVE_DURATION_MS, 'keyboard');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      delayTour(2500);
      rotateToStage(activeStage === 4 ? 0 : 4, MOVE_DURATION_MS, 'keyboard');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      delayTour(2500);
      rotateToStage(activeStage === 5 ? 0 : 5, MOVE_DURATION_MS, 'keyboard');
    }
  };

  const currentDisplayedStage = dragActiveStage !== null ? dragActiveStage : activeStage;
  const stage = CUBE_STAGES[currentDisplayedStage];
  const activeTourIdx = TOUR_FORWARD.indexOf(currentDisplayedStage);

  // Exploded view state
  const isExploded = canHover && isStageHovered && !isDragging && !isAnimating && !reducedMotion;

  return (
    <div
      className="relative w-full max-w-[450px] flex flex-col items-center select-none py-1 [--s:clamp(195px,46vw,215px)] sm:[--s:clamp(210px,25vw,235px)] lg:[--s:clamp(230px,min(28vh,22vw),250px)]"
      onKeyDown={handleKeyDown}
    >
      {/* ── 3D STAGE CONTAINER ── */}
      <div
        ref={stageRef}
        className={`relative w-full flex items-center justify-center overflow-visible select-none ${
          isDragging ? 'cursor-grabbing' : canHover ? 'cursor-grab' : 'cursor-default'
        }`}
        style={{
          height: 'calc(var(--s) * 1.35)',
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
        {/* Step 4: Flat Neutral Floor Shadow directly under cube bottom */}
        <div
          className="absolute -bottom-5 pointer-events-none flex items-center justify-center z-0"
          style={{
            width: 'calc(var(--s) * 0.82)',
            height: '22px',
          }}
        >
          <div
            className={`w-full h-full rounded-[50%] bg-black/32 blur-[8px] transition-opacity duration-300 ${
              isAnimating ? 'opacity-20' : 'opacity-100'
            }`}
          />
        </div>

        {/* ── LAYER 1: OUTER FLOAT WRAPPER ── */}
        <div
          className={`relative flex items-center justify-center z-10 ${
            reducedMotion ? '' : 'animate-cube-subtle-float'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ── LAYER 1.2: IDLE YAW DRIFT (+/- 8 deg, 9s alternate) ── */}
          <div
            className={reducedMotion ? '' : 'animate-cube-yaw-drift'}
            style={{
              transformStyle: 'preserve-3d',
              animationPlayState: isDragging || isStageHovered ? 'paused' : 'running',
            }}
          >
            {/* ── LAYER 1.3: IDLE PITCH DRIFT (+/- 3 deg, 13s alternate) ── */}
            <div
              className={reducedMotion ? '' : 'animate-cube-pitch-drift'}
              style={{
                transformStyle: 'preserve-3d',
                animationPlayState: isDragging || isStageHovered ? 'paused' : 'running',
              }}
            >
              {/* ── LAYER 1.5: FIXED VIEWING TILT WRAPPER (-10deg on X) ── */}
              <div
                style={{
                  transform: 'rotateX(-10deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* ── LAYER 2: PARALLAX WRAPPER (MOUSE TILT, 150ms EASE-OUT) ── */}
                <div
                  ref={parallaxRef}
                  style={{
                    perspective: '1200px',
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(var(--px, 0deg)) rotateY(var(--py, 0deg))',
                    transition: isDragging ? 'none' : 'transform 150ms ease-out',
                  }}
                >
                  {/* ── LAYER 3: CUBE ELEMENT ── */}
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
                      const stageInfo = CUBE_STAGES[i];
                      const StageIcon = stageInfo.icon;

                      let faceTransform = '';
                      if (i < 4) {
                        faceTransform = `rotateY(${i * 90}deg) translateZ(calc(var(--s) / 2 + var(--gap, 0px)))`;
                      } else if (i === 4) {
                        faceTransform = 'rotateX(-90deg) translateZ(calc(var(--s) / 2 + var(--gap, 0px)))';
                      } else {
                        faceTransform = 'rotateX(90deg) translateZ(calc(var(--s) / 2 + var(--gap, 0px)))';
                      }

                      const lightingClass = i === 4 ? 'brightness-105' : i === 5 ? 'brightness-90' : '';

                      return (
                        <div
                          key={i}
                          data-stage={i}
                          className={`absolute inset-0 select-none ${lightingClass}`}
                          style={{
                            transform: faceTransform,
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transition: reducedMotion
                              ? 'none'
                              : 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
                          }}
                        >
                          {/* Face Base Surface with border, sheen, corner ticks, and inactive overlay */}
                          <div
                            className={`absolute inset-0 rounded-2xl bg-surface shadow-card pointer-events-none transition-colors duration-300 ${
                              isFaceActive ? 'border border-accent' : 'border border-line/60'
                            }`}
                            style={{
                              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            {/* Diagonal Sheen & Edge Vignette */}
                            <div
                              className="absolute inset-0 rounded-2xl pointer-events-none"
                              style={{
                                background:
                                  'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 60%), radial-gradient(ellipse at center, transparent 65%, rgba(0, 0, 0, 0.1) 100%)',
                              }}
                              aria-hidden="true"
                            />

                            {/* Active Face Viewfinder Camera Corner Ticks */}
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

                            {/* Inactive Face Dark Overlay (~28% black) */}
                            <div
                              className={`absolute inset-0 rounded-2xl bg-black/28 pointer-events-none transition-opacity duration-300 ${
                                isFaceActive ? 'opacity-0' : 'opacity-100'
                              }`}
                              aria-hidden="true"
                            />
                          </div>

                          {/* Inactive Face Pictogram (56px Lucide Icon at ~20% Opacity) */}
                          <div
                            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-250 ${
                              isFaceActive ? 'opacity-0 invisible' : 'opacity-100 visible'
                            }`}
                            aria-hidden="true"
                          >
                            <StageIcon className="w-14 h-14 text-text/20" />
                          </div>

                          {/* Fixed 240x240 Design Canvas (Scaled uniformly via --k = sizePx / 240 with preserve-3d) */}
                          <div
                            className={`absolute top-0 left-0 transition-opacity duration-250 ${
                              isFaceActive ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                            }`}
                            style={{
                              width: '240px',
                              height: '240px',
                              transform: 'scale(var(--k, 1))',
                              transformOrigin: '0 0',
                              transformStyle: 'preserve-3d',
                              padding: '14px',
                              display: 'grid',
                              gridTemplateRows: '28px 1fr',
                              minHeight: 0,
                              minWidth: 0,
                            }}
                          >
                            {/* Standardized 28px Header Row */}
                            <div className="flex items-center justify-between border-b border-line pb-1.5 shrink-0 overflow-hidden">
                              <span className="text-[12px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-text-secondary whitespace-nowrap shrink-0">
                                <StageIcon className="w-3.5 h-3.5 shrink-0 text-accent" />
                                {stageInfo.stageLabel}
                              </span>
                              <span className="text-[12px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-line whitespace-nowrap shrink-0">
                                Sample
                              </span>
                            </div>

                            {/* 1fr Visualization Area with preserve-3d */}
                            <div
                              className="w-full h-full min-h-0 min-w-0 flex items-center justify-center relative"
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                              {i === 0 && <SlidingWindowViz active={isFaceActive} settled={isFaceActive && !isAnimating} reducedMotion={reducedMotion} />}
                              {i === 1 && <RevisionLadderViz active={isFaceActive} settled={isFaceActive && !isAnimating} reducedMotion={reducedMotion} />}
                              {i === 2 && <TopicRadarViz active={isFaceActive} settled={isFaceActive && !isAnimating} reducedMotion={reducedMotion} />}
                              {i === 3 && <HeatmapViz active={isFaceActive} settled={isFaceActive && !isAnimating} reducedMotion={reducedMotion} />}
                              {i === 4 && <DifficultySplitViz active={isFaceActive} settled={isFaceActive && !isAnimating} reducedMotion={reducedMotion} />}
                              {i === 5 && <NextUpViz active={isFaceActive} settled={isFaceActive && !isAnimating} reducedMotion={reducedMotion} />}
                            </div>
                          </div>

                          {/* 3D Pop-Out Satellite Content Layer (Scaled uniformly via --k with preserve-3d) */}
                          <div
                            className="absolute top-0 left-0 pointer-events-none"
                            style={{
                              width: '240px',
                              height: '240px',
                              transform: 'scale(var(--k, 1))',
                              transformOrigin: '0 0',
                              transformStyle: 'preserve-3d',
                            }}
                          >
                            <CubeSatellites
                              stageId={i}
                              active={isFaceActive}
                              settled={isFaceActive && !isAnimating && !isDragging && entrancePhase === 'settled'}
                              reducedMotion={reducedMotion}
                              isExploded={isExploded}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visually hidden aria-live polite region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`${stage.title}: ${stage.description}`}
      </div>

      {/* Embedded Keyframes for Smooth Motion */}
      <style>{`
        @keyframes cubeSubtleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes cubeYawDrift {
          0% {
            transform: rotateY(-8deg);
          }
          100% {
            transform: rotateY(8deg);
          }
        }

        @keyframes cubePitchDrift {
          0% {
            transform: rotateX(-3deg);
          }
          100% {
            transform: rotateX(3deg);
          }
        }

        @keyframes dwellFill {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes titleFade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        @keyframes satelliteFloat1 {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(0.5deg);
          }
          100% {
            transform: translateY(2px) rotate(-0.5deg);
          }
        }

        @keyframes satelliteFloat2 {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(3px) rotate(-0.5deg);
          }
          100% {
            transform: translateY(-3px) rotate(0.4deg);
          }
        }

        @keyframes satelliteFloat3 {
          0% {
            transform: translateY(0px) scale(0.98);
          }
          100% {
            transform: translateY(-4px) scale(1.02);
          }
        }

        .animate-cube-subtle-float {
          animation: cubeSubtleFloat 5.4s ease-in-out infinite;
        }

        .animate-cube-yaw-drift {
          animation: cubeYawDrift 9s ease-in-out infinite alternate;
        }

        .animate-cube-pitch-drift {
          animation: cubePitchDrift 13s ease-in-out infinite alternate;
        }

        .animate-dwell-fill {
          animation: dwellFill linear forwards;
        }

        .animate-fade-in {
          animation: titleFade 250ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-satellite-float-1 {
          animation: satelliteFloat1 4.2s ease-in-out infinite alternate;
        }

        .animate-satellite-float-2 {
          animation: satelliteFloat2 4.8s ease-in-out infinite alternate;
        }

        .animate-satellite-float-3 {
          animation: satelliteFloat3 3.6s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default React.memo(Rotating3DCube);
