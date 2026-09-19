import React from 'react';
import { Flame } from 'lucide-react';
import { accent, easy, line, surface2 } from '../../../theme/colors';

const WEEKS = 20;
const DAYS = 7;

// Color scale matching PracticeHeatmap.jsx:
// count === 0: bg-surface-2 border-line
// count === 1: bg-easy/25 border-easy/35
// count <= 2: bg-easy/45 border-easy/55
// count <= 4: bg-easy/70 border-easy/80
// count > 4: bg-easy border-easy text-bg
const COLOR_LEVELS = [
  { fill: surface2, stroke: line },
  { fill: 'rgba(0, 184, 163, 0.25)', stroke: 'rgba(0, 184, 163, 0.35)' },
  { fill: 'rgba(0, 184, 163, 0.45)', stroke: 'rgba(0, 184, 163, 0.55)' },
  { fill: 'rgba(0, 184, 163, 0.70)', stroke: 'rgba(0, 184, 163, 0.80)' },
  { fill: easy, stroke: easy },
];

// Seeded PRNG for deterministic 140 cells (no Math.random during render)
const GRID_CELLS = (() => {
  let s = 987654321;
  const nextRand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const cols = [];
  for (let col = 0; col < WEEKS; col++) {
    const days = [];
    for (let day = 0; day < DAYS; day++) {
      const r = nextRand();
      let level = 0;
      if (r > 0.86) level = 4;
      else if (r > 0.70) level = 3;
      else if (r > 0.50) level = 2;
      else if (r > 0.26) level = 1;

      // Higher density in the most recent 4 weeks to reflect active consistency
      if (col >= 15 && level === 0 && nextRand() > 0.35) {
        level = 2;
      }
      days.push(level);
    }
    cols.push(days);
  }
  // Ensure the latest cell (today) is active
  cols[WEEKS - 1][DAYS - 1] = 3;
  return cols;
})();

const HeatmapViz = ({ active, reducedMotion }) => {
  // SVG Geometry: 20 cols x 7 rows
  const cellSize = 6.2;
  const cellGap = 2.4;
  const startX = 14;
  const startY = 13;

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between border-b border-line pb-1 sm:pb-1.5 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 sm:gap-1.5 text-accent whitespace-nowrap shrink-0">
          <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-easy" />
          PRACTICE CADENCE
        </span>
        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary border border-line whitespace-nowrap shrink-0">
          140 DAYS
        </span>
      </div>

      {/* 2. Main Visualization Area (>= 60% of face) */}
      <div className="flex-1 flex flex-col justify-center py-1 min-h-0">
        <svg
          viewBox="0 0 200 85"
          className="w-full h-auto max-h-[90px] overflow-visible"
          aria-hidden="true"
        >
          {GRID_CELLS.map((colDays, colIdx) => {
            const x = startX + colIdx * (cellSize + cellGap);
            return (
              <g
                key={colIdx}
                style={{
                  animation:
                    active && !reducedMotion
                      ? `heatmapColFadeIn 320ms cubic-bezier(0.16, 1, 0.3, 1) ${colIdx * 55}ms both`
                      : 'none',
                }}
              >
                {colDays.map((level, dayIdx) => {
                  const y = startY + dayIdx * (cellSize + cellGap);
                  const isToday = colIdx === WEEKS - 1 && dayIdx === DAYS - 1;
                  const styling = COLOR_LEVELS[level] || COLOR_LEVELS[0];

                  return (
                    <rect
                      key={dayIdx}
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={1.2}
                      fill={styling.fill}
                      stroke={isToday ? accent : styling.stroke}
                      strokeWidth={isToday ? 1.2 : 0.6}
                      className="transition-colors duration-150"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. One-line Caption */}
      <p className="text-[10px] text-text-secondary text-center truncate pt-1 border-t border-line/60">
        140-day practice window · sample
      </p>

      {/* 4. Small Verdict / Status Chip at Bottom */}
      <div className="mt-1 flex items-center justify-center">
        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-easy/12 text-easy border border-easy/25 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-easy" />
          Streak view
        </span>
      </div>

      <style>{`
        @keyframes heatmapColFadeIn {
          from {
            opacity: 0;
            transform: translateY(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(HeatmapViz);
