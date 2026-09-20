import React from 'react';
import { Brain } from 'lucide-react';
import { useTicker } from './useTicker';
import { hard, medium, easy, line, surface2, text, textSecondary, muted } from '../../../theme/colors';

/**
 * Real Spaced Repetition Revision Intervals:
 * Sourced directly from:
 * - server/src/controllers/problem.controller.js (lines 716-745: REVISION_INTERVALS = { solved: 14, revisit_needed: 5, struggled: 2 })
 * - server/src/controllers/analytics.controller.js (lines 5-15: REVISION_INTERVALS)
 */
const LANES = [
  { key: 'struggled', label: 'Struggled', days: 2, badge: '2d', color: hard, textColor: 'text-hard', bgTint: 'rgba(255, 55, 95, 0.15)' },
  { key: 'revisit', label: 'Revisit', days: 5, badge: '5d', color: medium, textColor: 'text-medium', bgTint: 'rgba(255, 192, 30, 0.15)' },
  { key: 'solved', label: 'Solved', days: 14, badge: '14d', color: easy, textColor: 'text-easy', bgTint: 'rgba(0, 184, 163, 0.15)' },
];

const MAX_DAYS = 16;
const TICKS = [0, 2, 5, 8, 11, 14, 16];

const RevisionLadderViz = ({ active, reducedMotion }) => {
  // 17 discrete step increments (Day 0 to Day 16) + pause at end
  const currentDayStep = useTicker({
    active,
    intervalMs: 110,
    totalSteps: 17,
    pauseAtEndMs: 1300,
    reducedMotion,
  });

  const currentDay = reducedMotion ? MAX_DAYS : currentDayStep;

  // Geometry: SVG 200 x 95
  const timelineX0 = 38;
  const timelineX1 = 188;
  const timelineW = timelineX1 - timelineX0;

  const dayToX = (d) => timelineX0 + (d / MAX_DAYS) * timelineW;

  const laneY = [22, 47, 72];

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between border-b border-line pb-1 sm:pb-1.5 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 sm:gap-1.5 text-accent whitespace-nowrap shrink-0">
          <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-accent" />
          SPACED RECALL
        </span>
        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary border border-line whitespace-nowrap shrink-0">
          2d · 5d · 14d
        </span>
      </div>

      {/* 2. Main Visualization Area (>= 60% of face) */}
      <div className="flex-1 flex flex-col justify-center py-1 min-h-0">
        <svg
          viewBox="0 0 200 88"
          className="w-full h-auto max-h-[92px] overflow-visible"
          aria-hidden="true"
        >
          {/* Background Grid Ticks along Timeline */}
          {TICKS.map((t) => {
            const x = dayToX(t);
            return (
              <g key={t}>
                <line
                  x1={x}
                  y1={12}
                  x2={x}
                  y2={80}
                  stroke={line}
                  strokeWidth={0.7}
                  strokeDasharray="2 3"
                />
                <text
                  x={x}
                  y={8}
                  textAnchor="middle"
                  fill={muted}
                  fontSize={7.5}
                  fontFamily="monospace"
                >
                  {t}d
                </text>
              </g>
            );
          })}

          {/* 3 Horizontal Lanes */}
          {LANES.map((lane, idx) => {
            const y = laneY[idx];
            const targetX = dayToX(lane.days);
            const markerDay = Math.min(currentDay, lane.days);
            const markerX = dayToX(markerDay);
            const isDue = currentDay >= lane.days;

            return (
              <g key={lane.key}>
                {/* Lane Label */}
                <text
                  x={2}
                  y={y + 3.5}
                  fill={lane.color}
                  fontSize={8.5}
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {lane.label}
                </text>

                {/* Base Track Line */}
                <line
                  x1={timelineX0}
                  y1={y}
                  x2={timelineX1}
                  y2={y}
                  stroke={surface2}
                  strokeWidth={3}
                  strokeLinecap="round"
                />

                {/* Active Progress Line */}
                <line
                  x1={timelineX0}
                  y1={y}
                  x2={markerX}
                  y2={y}
                  stroke={lane.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  className="transition-all duration-100 ease-linear"
                />

                {/* Target Due Tick Marker */}
                <circle
                  cx={targetX}
                  cy={y}
                  r={isDue ? 4.5 : 3}
                  fill={isDue ? lane.color : surface2}
                  stroke={lane.color}
                  strokeWidth={1.2}
                  className={isDue && !reducedMotion ? 'animate-pulse' : ''}
                />

                {/* Target Interval Label Tag */}
                <text
                  x={targetX}
                  y={y - 6}
                  textAnchor="middle"
                  fill={isDue ? lane.color : muted}
                  fontSize={7.5}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {lane.badge}
                </text>

                {/* Sliding Head Marker */}
                <circle
                  cx={markerX}
                  cy={y}
                  r={isDue ? 4.5 : 3.5}
                  fill={lane.color}
                  className="transition-all duration-100 ease-linear"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. One-line Caption */}
      <p className="text-[8.5px] sm:text-[10px] text-text-secondary text-center truncate pt-1 border-t border-line/60">
        Next review depends on your outcome
      </p>

      {/* 4. Small Verdict / Status Chip at Bottom */}
      <div className="mt-1 flex items-center justify-center">
        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-accent/12 text-accent border border-accent/25 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Due-date engine
        </span>
      </div>
    </div>
  );
};

export default React.memo(RevisionLadderViz);
