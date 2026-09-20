import React from 'react';
import { accent, easy, line, surface2, textSecondary } from '../../../theme/colors';

const WEEKS = 20;
const DAYS = 7;

const COLOR_LEVELS = [
  { fill: surface2, stroke: line },
  { fill: 'rgba(0, 184, 163, 0.25)', stroke: 'rgba(0, 184, 163, 0.35)' },
  { fill: 'rgba(0, 184, 163, 0.45)', stroke: 'rgba(0, 184, 163, 0.55)' },
  { fill: 'rgba(0, 184, 163, 0.70)', stroke: 'rgba(0, 184, 163, 0.80)' },
  { fill: easy, stroke: easy },
];

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

      if (col >= 15 && level === 0 && nextRand() > 0.35) {
        level = 2;
      }
      days.push(level);
    }
    cols.push(days);
  }
  cols[WEEKS - 1][DAYS - 1] = 3;
  return cols;
})();

const HeatmapViz = ({ active, reducedMotion }) => {
  const cellSize = 7.5;
  const cellGap = 2.4;
  const startX = 6;
  const startY = 10;

  return (
    <div className="w-full h-full flex flex-col justify-between select-none py-1 min-h-0">
      {/* 1. SVG Grid Visualization */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0">
        <svg
          viewBox="0 0 210 85"
          className="w-full h-full max-h-[105px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
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
                      ? `heatmapColFadeIn 320ms cubic-bezier(0.16, 1, 0.3, 1) ${colIdx * 40}ms both`
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
                      rx={1.5}
                      fill={styling.fill}
                      stroke={isToday ? accent : styling.stroke}
                      strokeWidth={isToday ? 1.4 : 0.7}
                      className="transition-colors duration-150"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 2. Legend Row (12px HTML text) */}
      <div className="w-full flex items-center justify-between px-2 pt-1 border-t border-line/50 text-[12px] font-mono text-text-secondary shrink-0">
        <span>Cadence</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-muted">Less</span>
          {COLOR_LEVELS.map((c, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-xs shrink-0"
              style={{ backgroundColor: c.fill, border: `1px solid ${c.stroke}` }}
            />
          ))}
          <span className="text-[12px] text-muted">More</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HeatmapViz);
