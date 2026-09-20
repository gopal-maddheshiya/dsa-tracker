import React from 'react';
import {
  CheckCircle2,
  CalendarClock,
  AlertTriangle,
  Flame,
  Sparkles,
  PieChart,
  Zap,
  TrendingUp,
  Target,
  Code2,
  Layers,
} from 'lucide-react';
import { colors } from '../../theme/colors';

/**
 * 6 Stages Satellite HUD & Telemetry Data:
 * For each stage, 3 distinct data layers emerge from the cube:
 * 1. Primary HUD Card (Floating Top-Right outside the cube)
 * 2. Algorithmic Shard (Floating Mid-Left outside the cube)
 * 3. Secondary Status Tag (Floating Bottom-Left outside the cube)
 *
 * Designed to flank the 240x240 cube with zero overlap on the core visualization,
 * bursting along the 3D Z-axis with spring dynamics.
 */
const SATELLITE_DATA = [
  // Stage 0: Solves (Sliding Window Pattern)
  {
    stageId: 0,
    accent: colors.easy,
    accentGlow: 'rgba(0, 184, 163, 0.32)',
    primary: {
      header: {
        icon: CheckCircle2,
        label: 'Accepted',
        colorClass: 'text-easy',
      },
      title: '0 ms',
      highlight: 'Beats 100%',
      highlightClass: 'text-easy',
      subtitle: 'Mem: 44.2 MB (98.4%)',
      burst: { x: 8, y: -8, z: 80 },
    },
    secondary: {
      label: 'COMPLEXITY',
      badge: 'O(k) Space',
      badgeClass: 'text-text font-bold',
      detail: 'Two Pointers',
      burst: { x: -12, y: 12, z: 75 },
    },
    shard: {
      text: 'sum += nums[r]',
      textClass: 'text-accent font-semibold',
      burst: { x: -10, y: -4, z: 70 },
    },
  },

  // Stage 1: Spaced (Adaptive Revision Ladder)
  {
    stageId: 1,
    accent: colors.accent,
    accentGlow: 'rgba(255, 161, 22, 0.32)',
    primary: {
      header: {
        icon: CalendarClock,
        label: 'SM-2 Recall',
        colorClass: 'text-accent',
      },
      title: '94.2%',
      highlight: 'Retention',
      highlightClass: 'text-accent',
      subtitle: 'Next Review: +14d',
      burst: { x: 8, y: -8, z: 80 },
    },
    secondary: {
      label: 'LADDER STATUS',
      badge: '+4.2x Scale',
      badgeClass: 'text-easy font-bold',
      detail: 'Optimal Interval',
      burst: { x: -12, y: 12, z: 75 },
    },
    shard: {
      text: 'Due: 3 Cards',
      textClass: 'text-easy font-semibold',
      burst: { x: -10, y: -4, z: 70 },
    },
  },

  // Stage 2: Topics (Topic Struggle Radar)
  {
    stageId: 2,
    accent: colors.medium,
    accentGlow: 'rgba(255, 161, 22, 0.32)',
    primary: {
      header: {
        icon: AlertTriangle,
        label: 'Struggle Alert',
        colorClass: 'text-medium',
      },
      title: 'DP & Graphs',
      highlight: '38% Fail',
      highlightClass: 'text-medium',
      subtitle: 'Need: 3 Focus Drills',
      burst: { x: 8, y: -8, z: 80 },
    },
    secondary: {
      label: 'STRONG DOMAIN',
      badge: 'Arrays: 96%',
      badgeClass: 'text-easy font-bold',
      detail: '8 Solved Fast',
      burst: { x: -12, y: 12, z: 75 },
    },
    shard: {
      text: 'Tree Depth: 82%',
      textClass: 'text-text-secondary font-semibold',
      burst: { x: -10, y: -4, z: 70 },
    },
  },

  // Stage 3: Velocity (Practice Cadence Heatmap)
  {
    stageId: 3,
    accent: colors.easy,
    accentGlow: 'rgba(0, 184, 163, 0.32)',
    primary: {
      header: {
        icon: Flame,
        label: '14-Day Streak',
        colorClass: 'text-easy',
      },
      title: 'Top 2%',
      highlight: 'Cadence 🔥',
      highlightClass: 'text-easy',
      subtitle: '42 Solves · 0 Skipped',
      burst: { x: 8, y: -8, z: 80 },
    },
    secondary: {
      label: 'DAILY CADENCE',
      badge: '3.0 Solves/Day',
      badgeClass: 'text-accent font-bold',
      detail: 'Peak Velocity',
      burst: { x: -12, y: 12, z: 75 },
    },
    shard: {
      text: 'Today: +3 Solved',
      textClass: 'text-easy font-semibold',
      burst: { x: -10, y: -4, z: 70 },
    },
  },

  // Stage 4: Levels (Curated Difficulty Split)
  {
    stageId: 4,
    accent: colors.medium,
    accentGlow: 'rgba(255, 161, 22, 0.32)',
    primary: {
      header: {
        icon: PieChart,
        label: 'Difficulty Split',
        colorClass: 'text-medium',
      },
      title: '11 · 17 · 7',
      highlight: 'Target Met',
      highlightClass: 'text-easy',
      subtitle: '31% E · 49% M · 20% H',
      burst: { x: 8, y: -8, z: 80 },
    },
    secondary: {
      label: 'BENCHMARK',
      badge: 'Hard: 20%',
      badgeClass: 'text-hard font-bold',
      detail: 'FAANG Ready',
      burst: { x: -12, y: 12, z: 75 },
    },
    shard: {
      text: 'Med: 17 Solved',
      textClass: 'text-medium font-semibold',
      burst: { x: -10, y: -4, z: 70 },
    },
  },

  // Stage 5: Next Up (Dynamic Practice Queue)
  {
    stageId: 5,
    accent: colors.accent,
    accentGlow: 'rgba(255, 161, 22, 0.32)',
    primary: {
      header: {
        icon: Sparkles,
        label: 'Queue Top',
        colorClass: 'text-accent',
      },
      title: '#210 Course II',
      highlight: 'Top 150',
      highlightClass: 'text-accent',
      subtitle: 'Topo Sort · Cycle Detect',
      burst: { x: 8, y: -8, z: 80 },
    },
    secondary: {
      label: 'ACTION QUEUE',
      badge: '⚡ Ready',
      badgeClass: 'text-easy font-bold',
      detail: 'Est. 25 mins',
      burst: { x: -12, y: 12, z: 75 },
    },
    shard: {
      text: 'Decay: 0.88 Due',
      textClass: 'text-accent font-semibold',
      burst: { x: -10, y: -4, z: 70 },
    },
  },
];

const CubeSatellites = ({
  stageId,
  active,
  settled,
  reducedMotion = false,
  isExploded = false,
}) => {
  const data = SATELLITE_DATA[stageId];
  if (!data) return null;

  const explodedZOffset = isExploded ? 24 : 0;
  const explodedX = isExploded ? 12 : 0;

  // Spring physics for natural blossom emergence from inside the cube
  const getSpringTransition = (delayMs = 0) =>
    reducedMotion
      ? 'none'
      : settled
      ? `transform 540ms cubic-bezier(0.18, 1.28, 0.32, 1) ${delayMs}ms, opacity 280ms ease-out ${delayMs}ms, filter 320ms ease-out ${delayMs}ms`
      : 'transform 190ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease-in, filter 150ms ease-in';

  // Micro-floating idle animation (active only once settled to preserve pure emergence vector)
  const floatClass1 = reducedMotion || !settled ? '' : 'animate-satellite-float-1';
  const floatClass2 = reducedMotion || !settled ? '' : 'animate-satellite-float-2';
  const floatClass3 = reducedMotion || !settled ? '' : 'animate-satellite-float-3';

  const { primary, secondary, shard } = data;
  const PrimaryIcon = primary.header.icon;

  // 1. Primary HUD Card: Blossoms diagonally outward to the right
  const primTransform =
    settled && !reducedMotion
      ? `translate3d(${explodedX}px, 0px, ${48 + explodedZOffset}px) rotateY(-8deg) rotateX(1deg) scale(1)`
      : 'translate3d(-136px, 68px, -120px) rotateY(-42deg) rotateX(15deg) scale(0.08)';

  // 2. Algorithmic Shard: Blossoms diagonally outward to upper-left
  const shardTransform =
    settled && !reducedMotion
      ? `translate3d(${-explodedX}px, 0px, ${38 + explodedZOffset}px) rotateY(8deg) rotateX(-1deg) scale(1)`
      : 'translate3d(136px, 72px, -120px) rotateY(42deg) rotateX(-15deg) scale(0.08)';

  // 3. Secondary Status Card: Blossoms diagonally outward to lower-left
  const secTransform =
    settled && !reducedMotion
      ? `translate3d(${-explodedX}px, 0px, ${38 + explodedZOffset}px) rotateY(8deg) rotateX(1deg) scale(1)`
      : 'translate3d(136px, -4px, -120px) rotateY(42deg) rotateX(15deg) scale(0.08)';

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{ transformStyle: 'preserve-3d' }}
      aria-hidden="true"
    >
      {/* ── 1. PRIMARY SATELLITE HUD CARD (ELEGANT RIGHT FLANK, BALANCED WITH CUBE) ── */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          left: '256px',
          top: '52px',
          transform: primTransform,
          opacity: settled ? 1 : 0,
          filter: settled ? 'blur(0px)' : 'blur(8px)',
          transition: getSpringTransition(0),
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="relative">
          {/* Holographic connector line pointing back to cube */}
          <div
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-[1px] pointer-events-none transition-opacity duration-300"
            style={{
              background: `linear-gradient(to right, transparent, ${data.accent}80)`,
              opacity: settled ? 0.75 : 0,
            }}
          >
            <span
              className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full shadow-sm"
              style={{
                backgroundColor: data.accent,
                boxShadow: `0 0 6px ${data.accent}`,
              }}
            />
          </div>

          <div
            className={`flex flex-col gap-1 p-2.5 rounded-xl bg-surface/92 backdrop-blur-md will-change-transform border border-line/90 max-w-[195px] ${floatClass1}`}
            style={{
              borderColor: data.accentGlow,
              boxShadow: `0 16px 36px -4px rgba(0, 0, 0, 0.72), 0 0 20px -2px ${data.accentGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
              minWidth: '150px',
            }}
          >
            {/* Header row with glowing indicator */}
            <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-line/50">
              <span
                className={`flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${primary.header.colorClass}`}
              >
                <PrimaryIcon className="w-3 h-3 shrink-0" />
                {primary.header.label}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: data.accent }}
              />
            </div>

            {/* Main metric row */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-mono font-bold text-text tabular-nums whitespace-nowrap">
                {primary.title}
              </span>
              <span
                className={`text-[10px] font-mono font-semibold whitespace-nowrap ${primary.highlightClass}`}
              >
                {primary.highlight}
              </span>
            </div>

            {/* Subtitle detail */}
            <div className="text-[9.5px] font-mono text-muted whitespace-nowrap overflow-hidden text-ellipsis">
              {primary.subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. ALGORITHMIC SHARD (UPPER-LEFT FLANK, ANCHORED UNIFORMLY) ── */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          right: '256px',
          top: '48px',
          transform: shardTransform,
          opacity: settled ? 1 : 0,
          filter: settled ? 'blur(0px)' : 'blur(8px)',
          transition: getSpringTransition(settled ? 80 : 0),
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="relative">
          {/* Holographic connector line pointing to cube */}
          <div
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-[1px] pointer-events-none transition-opacity duration-300"
            style={{
              background: `linear-gradient(to left, transparent, ${data.accent}80)`,
              opacity: settled ? 0.75 : 0,
            }}
          >
            <span
              className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full shadow-sm"
              style={{
                backgroundColor: data.accent,
                boxShadow: `0 0 6px ${data.accent}`,
              }}
            />
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/92 backdrop-blur-md will-change-transform border border-line text-[10px] font-mono whitespace-nowrap ${shard.textClass} ${floatClass3}`}
            style={{
              boxShadow: `0 10px 24px -2px rgba(0, 0, 0, 0.65), 0 0 12px -2px ${data.accentGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: data.accent }}
            />
            {shard.text}
          </div>
        </div>
      </div>

      {/* ── 3. SECONDARY STATUS CARD (LOWER-LEFT FLANK, MATCHING RIGHT-EDGE ALIGNMENT) ── */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          right: '256px',
          top: '124px',
          transform: secTransform,
          opacity: settled ? 1 : 0,
          filter: settled ? 'blur(0px)' : 'blur(8px)',
          transition: getSpringTransition(settled ? 160 : 0),
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="relative">
          {/* Holographic connector line pointing to cube */}
          <div
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-[1px] pointer-events-none transition-opacity duration-300"
            style={{
              background: `linear-gradient(to left, transparent, ${data.accent}80)`,
              opacity: settled ? 0.75 : 0,
            }}
          >
            <span
              className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full shadow-sm"
              style={{
                backgroundColor: data.accent,
                boxShadow: `0 0 6px ${data.accent}`,
              }}
            />
          </div>

          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface/92 backdrop-blur-md will-change-transform border border-line/90 whitespace-nowrap ${floatClass2}`}
            style={{
              boxShadow: '0 14px 28px -2px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase tracking-wider text-text-secondary leading-none">
                {secondary.label}
              </span>
              <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
                <span className={`text-[11px] font-mono ${secondary.badgeClass}`}>
                  {secondary.badge}
                </span>
                <span className="text-[9.5px] text-muted">·</span>
                <span className="text-[9.5px] text-text-secondary">
                  {secondary.detail}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CubeSatellites);
