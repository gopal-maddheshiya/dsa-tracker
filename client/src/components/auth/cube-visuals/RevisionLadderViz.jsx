import React from 'react';
import { useTicker } from './useTicker';
import { hard, medium, easy, line, surface2, muted } from '../../../theme/colors';

const LANES = [
  { key: 'struggled', label: 'Struggled', days: 2, badge: '2d', color: hard },
  { key: 'revisit', label: 'Revisit', days: 5, badge: '5d', color: medium },
  { key: 'solved', label: 'Solved', days: 14, badge: '14d', color: easy },
];

const MAX_DAYS = 16;
const TICKS = [0, 2, 5, 8, 11, 14];

const RevisionLadderViz = ({ active, reducedMotion }) => {
  const currentDayStep = useTicker({
    active,
    intervalMs: 110,
    totalSteps: 17,
    pauseAtEndMs: 1300,
    reducedMotion,
  });

  const currentDay = reducedMotion ? MAX_DAYS : currentDayStep;

  // Geometry: SVG 210 x 120
  const timelineX0 = 64;
  const timelineX1 = 196;
  const timelineW = timelineX1 - timelineX0;

  const dayToX = (d) => timelineX0 + (d / MAX_DAYS) * timelineW;
  const laneY = [24, 56, 88];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none py-1 min-h-0">
      <svg
        viewBox="0 0 210 120"
        className="w-full h-full max-h-[140px] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
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
                y2={98}
                stroke={line}
                strokeWidth={0.8}
                strokeDasharray="2 3"
              />
              {/* Timeline Axis Ticks at bottom */}
              <text
                x={x}
                y={112}
                textAnchor="middle"
                fill={muted}
                fontSize={10}
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
              {/* Lane Label (11px sans-serif bold) */}
              <text
                x={2}
                y={y + 4}
                fill={lane.color}
                fontSize={11}
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
                strokeWidth={4}
                strokeLinecap="round"
              />

              {/* Active Progress Line */}
              <line
                x1={timelineX0}
                y1={y}
                x2={markerX}
                y2={y}
                stroke={lane.color}
                strokeWidth={4}
                strokeLinecap="round"
                className="transition-all duration-100 ease-linear"
              />

              {/* Target Due Tick Marker */}
              <circle
                cx={targetX}
                cy={y}
                r={isDue ? 5 : 3.5}
                fill={isDue ? lane.color : surface2}
                stroke={lane.color}
                strokeWidth={1.5}
                className={isDue && !reducedMotion ? 'animate-pulse' : ''}
              />

              {/* Target Interval Label Tag (10px monospace bold) */}
              <text
                x={targetX}
                y={y - 8}
                textAnchor="middle"
                fill={isDue ? lane.color : muted}
                fontSize={10}
                fontWeight="bold"
                fontFamily="monospace"
              >
                {lane.badge}
              </text>

              {/* Sliding Head Marker */}
              <circle
                cx={markerX}
                cy={y}
                r={isDue ? 5 : 4}
                fill={lane.color}
                className="transition-all duration-100 ease-linear"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default React.memo(RevisionLadderViz);
