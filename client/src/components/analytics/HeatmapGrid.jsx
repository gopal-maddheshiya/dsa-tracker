import React, { useState, useMemo, useEffect } from 'react';
import {
  generateHeatmapGrid,
  formatHeatmapTooltipDate,
} from '../../lib/analyticsUtils.js';

function getCellColor(count) {
  if (!count || count === 0) return 'bg-[#111827] border-[#1e293b]/80';
  if (count === 1) return 'bg-[#064e3b] border-[#047857]/60 shadow-[0_0_4px_rgba(6,78,59,0.3)]';
  if (count === 2) return 'bg-[#059669] border-[#10b981]/70 shadow-[0_0_6px_rgba(5,150,105,0.4)]';
  if (count === 3) return 'bg-[#10b981] border-[#34d399]/80 shadow-[0_0_8px_rgba(16,185,129,0.55)]';
  return 'bg-[#4ade80] border-[#86efac] shadow-[0_0_12px_rgba(74,222,128,0.75)]';
}

/**
 * HeatmapGrid: Full-width, high-density Daily Consistency matching user reference image.
 * Fills available card width with zero empty space and radiant glowing cells.
 */
export default function HeatmapGrid({
  data = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate 26-week matrix (~6 months) to completely fill card width cleanly
  const { weeks, monthHeaders } = useMemo(() => {
    return generateHeatmapGrid(data, new Date(), 26);
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
    <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between w-full">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
          Daily Consistency
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
          Your solving activity in the last 3 months
        </p>
      </div>

      {/* Main Heatmap Container */}
      <div className="relative overflow-x-auto pb-1 scrollbar-thin w-full">
        {loading ? (
          <div className="h-28 w-full animate-pulse bg-surface-2/30 rounded-xl" />
        ) : error ? (
          <div className="h-28 border border-line rounded-xl flex items-center justify-center text-xs text-slate-400">
            Failed to load consistency heatmap
          </div>
        ) : (
          <div className="w-full select-none min-w-[340px]">
            {/* Dynamic Month Headers aligned to starting week column */}
            <div className="flex gap-[3px] sm:gap-1 pl-6 sm:pl-7 mb-1 select-none h-3.5 w-full">
              {weeks.map((week, wIdx) => {
                const m = monthHeaders.find((item) => item.weekIndex === wIdx);
                return (
                  <div key={wIdx} className="flex-1 min-w-[9px] relative">
                    {m && (
                      <span className="absolute left-0 top-0 text-[10px] font-mono text-slate-400 leading-none whitespace-nowrap">
                        {m.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Matrix (7 rows x 26 columns filling card width) */}
            <div className="flex items-start w-full">
              {/* Day Labels (Mon, Wed, Fri) aligned to 7 rows */}
              <div className="flex flex-col gap-[3px] sm:gap-1 pr-2 text-[9px] font-mono text-slate-400 select-none shrink-0">
                <span className="w-4 h-2.5 sm:h-3 flex items-center justify-end leading-none" />
                <span className="w-4 h-2.5 sm:h-3 flex items-center justify-end leading-none">Mon</span>
                <span className="w-4 h-2.5 sm:h-3 flex items-center justify-end leading-none" />
                <span className="w-4 h-2.5 sm:h-3 flex items-center justify-end leading-none">Wed</span>
                <span className="w-4 h-2.5 sm:h-3 flex items-center justify-end leading-none" />
                <span className="w-4 h-2.5 sm:h-3 flex items-center justify-end leading-none">Fri</span>
                <span className="w-4 h-2.5 sm:h-3 flex items-center justify-end leading-none" />
              </div>

              {/* Grid Columns - flex-1 across full width with no empty right gap */}
              <div className="flex gap-[3px] sm:gap-1 flex-1 w-full">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex-1 flex flex-col gap-[3px] sm:gap-1 min-w-[9px]">
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
                          className={`aspect-square w-full rounded-[2.5px] sm:rounded-[3px] border cursor-pointer transition-all duration-150 ${colorClass} ${
                            isHovered ? 'ring-2 ring-white z-10 scale-125' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Less / More Legend (5 levels matching reference screenshot) */}
            <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-slate-400 mt-2.5 pr-0.5">
              <span>Less</span>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#111827] border border-[#1e293b]/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#064e3b] border border-[#047857]/60" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#059669] border border-[#10b981]/70" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#10b981] border border-[#34d399]/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#4ade80] border border-[#86efac] shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
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
