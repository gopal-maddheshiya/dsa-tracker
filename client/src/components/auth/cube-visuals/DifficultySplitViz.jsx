import React, { useState, useEffect } from 'react';
import { PieChart } from 'lucide-react';
import { easy, medium, hard, surface2, line, text, textSecondary, muted } from '../../../theme/colors';

const TOTAL_COUNT = 35;
const EASY_COUNT = 11;
const MEDIUM_COUNT = 17;
const HARD_COUNT = 7;

// SVG Donut Geometry
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~213.628

// Calculate segment lengths
const EASY_LEN = (EASY_COUNT / TOTAL_COUNT) * CIRCUMFERENCE; // ~67.14
const MEDIUM_LEN = (MEDIUM_COUNT / TOTAL_COUNT) * CIRCUMFERENCE; // ~103.76
const HARD_LEN = (HARD_COUNT / TOTAL_COUNT) * CIRCUMFERENCE; // ~42.73

const DifficultySplitViz = ({ active, reducedMotion }) => {
  // Key state to re-trigger SVG CSS draw-in animation when active becomes true
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (active) {
      setAnimKey((prev) => prev + 1);
    }
  }, [active]);

  // Rotational start offsets:
  // Base rotation starts at top: -90deg
  // Easy arc: from 0 to EASY_LEN
  // Medium arc: starts after Easy arc
  // Hard arc: starts after Easy + Medium arcs
  const easyAngle = -90;
  const mediumAngle = -90 + (EASY_COUNT / TOTAL_COUNT) * 360;
  const hardAngle = -90 + ((EASY_COUNT + MEDIUM_COUNT) / TOTAL_COUNT) * 360;

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between border-b border-line pb-1 sm:pb-1.5 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 sm:gap-1.5 text-medium whitespace-nowrap shrink-0">
          <PieChart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-medium" />
          LEVELS · SPLIT
        </span>
        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary border border-line whitespace-nowrap shrink-0">
          DIFFICULTY
        </span>
      </div>

      {/* 2. Main Visualization Area (>= 60% of face) */}
      <div className="flex-1 flex flex-col items-center justify-center py-0.5 min-h-0">
        <div className="relative w-full flex items-center justify-center">
          <svg
            key={animKey}
            viewBox="0 0 160 96"
            className="w-full h-auto max-h-[96px] overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <style>{`
                @keyframes drawArcEasy {
                  0% { stroke-dasharray: 0 ${CIRCUMFERENCE}; }
                  100% { stroke-dasharray: ${EASY_LEN} ${CIRCUMFERENCE - EASY_LEN}; }
                }
                @keyframes drawArcMedium {
                  0% { stroke-dasharray: 0 ${CIRCUMFERENCE}; }
                  100% { stroke-dasharray: ${MEDIUM_LEN} ${CIRCUMFERENCE - MEDIUM_LEN}; }
                }
                @keyframes drawArcHard {
                  0% { stroke-dasharray: 0 ${CIRCUMFERENCE}; }
                  100% { stroke-dasharray: ${HARD_LEN} ${CIRCUMFERENCE - HARD_LEN}; }
                }
                .arc-easy-anim {
                  animation: drawArcEasy 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                .arc-medium-anim {
                  animation: drawArcMedium 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
                }
                .arc-hard-anim {
                  animation: drawArcHard 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards;
                }
              `}</style>
            </defs>

            {/* Base Background Track Circle */}
            <circle
              cx="80"
              cy="48"
              r={RADIUS}
              fill="none"
              stroke={surface2}
              strokeWidth="9"
            />

            {/* Easy Arc */}
            <circle
              cx="80"
              cy="48"
              r={RADIUS}
              fill="none"
              stroke={easy}
              strokeWidth="9"
              strokeLinecap="round"
              transform={`rotate(${easyAngle} 80 48)`}
              style={{
                strokeDasharray: reducedMotion
                  ? `${EASY_LEN} ${CIRCUMFERENCE - EASY_LEN}`
                  : active
                  ? undefined
                  : `0 ${CIRCUMFERENCE}`,
              }}
              className={active && !reducedMotion ? 'arc-easy-anim' : ''}
            />

            {/* Medium Arc */}
            <circle
              cx="80"
              cy="48"
              r={RADIUS}
              fill="none"
              stroke={medium}
              strokeWidth="9"
              strokeLinecap="round"
              transform={`rotate(${mediumAngle} 80 48)`}
              style={{
                strokeDasharray: reducedMotion
                  ? `${MEDIUM_LEN} ${CIRCUMFERENCE - MEDIUM_LEN}`
                  : active
                  ? undefined
                  : `0 ${CIRCUMFERENCE}`,
              }}
              className={active && !reducedMotion ? 'arc-medium-anim' : ''}
            />

            {/* Hard Arc */}
            <circle
              cx="80"
              cy="48"
              r={RADIUS}
              fill="none"
              stroke={hard}
              strokeWidth="9"
              strokeLinecap="round"
              transform={`rotate(${hardAngle} 80 48)`}
              style={{
                strokeDasharray: reducedMotion
                  ? `${HARD_LEN} ${CIRCUMFERENCE - HARD_LEN}`
                  : active
                  ? undefined
                  : `0 ${CIRCUMFERENCE}`,
              }}
              className={active && !reducedMotion ? 'arc-hard-anim' : ''}
            />

            {/* Center Total Count */}
            <text
              x="80"
              y="45"
              textAnchor="middle"
              fill={text}
              fontSize="16"
              fontWeight="bold"
              fontFamily="monospace"
              className="tabular-nums"
            >
              {TOTAL_COUNT}
            </text>
            <text
              x="80"
              y="57"
              textAnchor="middle"
              fill={muted}
              fontSize="8"
              fontWeight="600"
              letterSpacing="0.08em"
            >
              SOLVED
            </text>
          </svg>
        </div>

        {/* Legend Row */}
        <div className="w-full flex items-center justify-center gap-2.5 px-2 mt-1 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: easy }} />
            <span className="text-text-secondary">Easy</span>
            <span className="font-bold text-text tabular-nums">{EASY_COUNT}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: medium }} />
            <span className="text-text-secondary">Med</span>
            <span className="font-bold text-text tabular-nums">{MEDIUM_COUNT}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hard }} />
            <span className="text-text-secondary">Hard</span>
            <span className="font-bold text-text tabular-nums">{HARD_COUNT}</span>
          </div>
        </div>
      </div>

      {/* 3. One-line Caption */}
      <p className="text-[10px] text-text-secondary text-center truncate pt-1 border-t border-line/60">
        Difficulty split · sample
      </p>

      {/* 4. Small Verdict / Status Chip at Bottom */}
      <div className="mt-1 flex items-center justify-center">
        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-medium/12 text-medium border border-medium/25 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-medium" />
          Balanced mix
        </span>
      </div>
    </div>
  );
};

export default React.memo(DifficultySplitViz);
