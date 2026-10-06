import React, { useState, useMemo, useEffect } from 'react';
import {
  generateHeatmapGrid,
  formatHeatmapTooltipDate,
} from '../../lib/analyticsUtils.js';

function getCellColor(count) {
  if (!count || count === 0) return 'bg-[#e5e5ea] dark:bg-[#1e1e21] border-line-subtle';
  if (count === 1) return 'bg-[#86efac] dark:bg-[#064e3b] border-[#4ade80] dark:border-[#047857]/60';
  if (count === 2) return 'bg-[#4ade80] dark:bg-[#059669] border-[#22c55e] dark:border-[#10b981]/70';
  if (count === 3) return 'bg-[#22c55e] dark:bg-[#10b981] border-[#16a34a] dark:border-[#34d399]/80 shadow-[0_0_6px_rgba(34,197,94,0.35)]';
  return 'bg-[#16a34a] dark:bg-[#4ade80] border-[#15803d] dark:border-[#86efac] shadow-[0_0_10px_rgba(74,222,128,0.5)]';
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
  const { weeks, monthHeaders, activeDaysCount = 0 } = useMemo(() => {
    return generateHeatmapGrid(data, new Date(), 26);
  }, [data]);

  // Calculate consistency percentage and recent 7-day solves
  const totalDays = weeks.length * 7;
  const consistencyPct = totalDays > 0 ? Math.round((activeDaysCount / totalDays) * 100) : 0;
  const recent7Days = weeks.length > 0 ? weeks[weeks.length - 1] : [];
  const recent7Solves = recent7Days.reduce((sum, d) => sum + (d.count || 0), 0);

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
      {/* Header with Title and Last 84 days filter pill (Screen 2) */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-text tracking-tight">
            Practice Consistency
          </h2>
          <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
            Your solving activity
          </p>
        </div>

        {/* Pill Button matching Screen 2 */}
        <span className="px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-[10px] sm:text-xs font-medium text-text-secondary flex items-center gap-1 shrink-0">
          <span>Last 84 days</span>
          <span className="text-muted">⌄</span>
        </span>
      </div>

      {/* Main Heatmap Container */}
      <div className="relative overflow-x-auto pb-1 scrollbar-thin w-full">
        {loading ? (
          <div className="h-28 w-full animate-pulse bg-surface-2/30 rounded-xl" />
        ) : error ? (
          <div className="h-28 border border-line rounded-xl flex items-center justify-center text-xs text-text-secondary">
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
                      <span className="absolute left-0 top-0 text-[10px] font-mono text-text-secondary leading-none whitespace-nowrap">
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
              <div className="flex flex-col gap-[3px] sm:gap-1 pr-2 text-[9px] font-mono text-text-secondary select-none shrink-0">
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
                            isHovered ? 'ring-2 ring-accent z-10 scale-125' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Less / More Legend (5 levels matching reference screenshot) */}
            <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-text-secondary mt-2.5 pr-0.5">
              <span>Less</span>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#e5e5ea] dark:bg-[#1e1e21] border border-line-subtle" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#86efac] dark:bg-[#064e3b] border border-[#4ade80] dark:border-[#047857]/60" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#4ade80] dark:bg-[#059669] border border-[#22c55e] dark:border-[#10b981]/70" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#22c55e] dark:bg-[#10b981] border border-[#16a34a] dark:border-[#34d399]/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2.5px] bg-[#16a34a] dark:bg-[#4ade80] border border-[#15803d] dark:border-[#86efac] shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              <span>More</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom 3-Metric Strip (Screen 2 Reference: Active Days, Consistency, 7-day Solves) */}
      <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-line/60">
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-2/40 border border-line-subtle text-center">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold font-mono text-text">
            <span>🔥</span>
            <span>{activeDaysCount}</span>
          </div>
          <span className="text-[10px] text-text-secondary mt-0.5 font-medium truncate">Active days</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-2/40 border border-line-subtle text-center">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold font-mono text-text">
            <span>🎯</span>
            <span>{consistencyPct}%</span>
          </div>
          <span className="text-[10px] text-text-secondary mt-0.5 font-medium truncate">Consistency</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-2/40 border border-line-subtle text-center">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold font-mono text-text">
            <span>⚡</span>
            <span>{recent7Solves}</span>
          </div>
          <span className="text-[10px] text-text-secondary mt-0.5 font-medium truncate">7-day solves</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 bg-surface/95 backdrop-blur-md border border-line text-text text-xs font-mono rounded-lg px-2.5 py-1.5 shadow-elevated"
          style={{ left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` }}
        >
          <span className="text-[10px] text-text-secondary block">
            {formatHeatmapTooltipDate(hoveredCell.date)}
          </span>
          <span className="font-bold text-text">
            {hoveredCell.count || 0} attempts
          </span>
        </div>
      )}
    </div>
  );
}
