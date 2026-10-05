import React, { useState, useMemo, useEffect } from 'react';
import {
  generateHeatmapGrid,
  formatHeatmapTooltipDate,
} from '../../lib/analyticsUtils.js';

function getCellColor(count) {
  if (!count || count === 0) return 'bg-[#141b2d] border-[#1e293b]';
  if (count === 1) return 'bg-[#15803d] border-[#16a34a]';
  if (count <= 3) return 'bg-[#22c55e] border-[#4ade80]';
  return 'bg-[#4ade80] border-[#86efac]';
}

/**
 * HeatmapGrid: Compact, tightly packed Daily Consistency matching reference aesthetic.
 * Eliminates artificial wide spacing and aligns day rows with mathematical precision.
 */
export default function HeatmapGrid({
  data = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate 20-week matrix for rich, dense consistency view
  const { weeks, monthHeaders } = useMemo(() => {
    return generateHeatmapGrid(data, new Date(), 20);
  }, [data]);

  useEffect(() => {
    if (!hoveredCell) return;
    const handleDismiss = () => setHoveredCell(null);
    window.addEventListener('pointerdown', handleDismiss, { passive: true });
    window.addEventListener('scroll', handleDismiss, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleDismiss);
      window.removeEventListener('scroll', handleDismiss);
    };
  }, [hoveredCell]);

  return (
    <div className="p-4 sm:p-4.5 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between">
      {/* Header */}
      <div className="mb-2.5">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
          Daily Consistency
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
          Your solving activity in the last 4 months
        </p>
      </div>

      {/* Main Heatmap Container */}
      <div className="relative overflow-x-auto pb-1 scrollbar-thin">
        {loading ? (
          <div className="h-28 w-full animate-pulse bg-surface-2/30 rounded-xl" />
        ) : error ? (
          <div className="h-28 border border-line rounded-xl flex items-center justify-center text-xs text-slate-400">
            Failed to load consistency heatmap
          </div>
        ) : (
          <div className="inline-block select-none min-w-max">
            {/* Dynamic Month Headers aligned to starting week column */}
            <div className="flex gap-1 sm:gap-1.5 pl-6 sm:pl-7 mb-1 select-none h-3.5 relative">
              {weeks.map((week, wIdx) => {
                const m = monthHeaders.find((item) => item.weekIndex === wIdx);
                return (
                  <div key={wIdx} className="w-2.5 sm:w-3 shrink-0 relative">
                    {m && (
                      <span className="absolute left-0 top-0 text-[10px] font-mono text-slate-400 leading-none">
                        {m.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Matrix (7 rows x N columns) */}
            <div className="flex items-start">
              {/* Day Labels (Mon, Wed, Fri) with exact row height alignment */}
              <div className="flex flex-col gap-1 sm:gap-1.5 pr-2 sm:pr-2.5 text-[9px] font-mono text-slate-400 select-none">
                <span className="h-2.5 sm:h-3 flex items-center justify-end leading-none" />
                <span className="h-2.5 sm:h-3 flex items-center justify-end leading-none">Mon</span>
                <span className="h-2.5 sm:h-3 flex items-center justify-end leading-none" />
                <span className="h-2.5 sm:h-3 flex items-center justify-end leading-none">Wed</span>
                <span className="h-2.5 sm:h-3 flex items-center justify-end leading-none" />
                <span className="h-2.5 sm:h-3 flex items-center justify-end leading-none">Fri</span>
                <span className="h-2.5 sm:h-3 flex items-center justify-end leading-none" />
              </div>

              {/* Grid Columns - tightly packed without artificial stretching */}
              <div className="flex gap-1 sm:gap-1.5">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1 sm:gap-1.5 shrink-0">
                    {week.map((day) => {
                      const colorClass = getCellColor(day.count);
                      const isHovered = hoveredCell?.date === day.date;

                      return (
                        <div
                          key={day.date}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({
                              ...day,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] sm:rounded-[2.5px] border cursor-pointer transition-all ${colorClass} ${
                            isHovered ? 'ring-2 ring-white z-10 scale-125' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Less / More Legend */}
            <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-slate-400 mt-2.5 pr-1">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[#141b2d] border border-[#1e293b]" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[#15803d] border border-[#16a34a]" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[#22c55e] border border-[#4ade80]" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[#4ade80] border border-[#86efac]" />
              <span>More</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 bg-[#0b0f17] border border-[#1e293b] text-white text-xs font-mono rounded-lg px-2.5 py-1 shadow-2xl"
          style={{ left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` }}
        >
          <span className="text-[10px] text-slate-400 block">
            {formatHeatmapTooltipDate(hoveredCell.date)}
          </span>
          <span className="font-bold text-white">
            {hoveredCell.count || 0} attempts
          </span>
        </div>
      )}
    </div>
  );
}
