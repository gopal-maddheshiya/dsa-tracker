import React, { useState, useMemo, useEffect } from 'react';
import {
  generateHeatmapGrid,
  getHeatmapLevelClass,
  formatHeatmapTooltipDate,
} from '../../lib/analyticsUtils.js';

const DAY_LABELS = [
  { dayIndex: 1, label: 'Mon' },
  { dayIndex: 3, label: 'Wed' },
  { dayIndex: 5, label: 'Fri' },
];

/**
 * HeatmapGrid: 12-week (84-day) developer practice activity calendar.
 * Renders zero-filled matrix with contained mobile horizontal scroll and restrained indigo scale.
 */
export default function HeatmapGrid({
  data = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Compute 12-week calendar matrix
  const { weeks, monthHeaders, totalRangeAttempts, activeDaysCount } = useMemo(() => {
    return generateHeatmapGrid(data, new Date(), 12);
  }, [data]);

  // Touch tooltip dismissal: dismiss tooltip on outside tap or scroll without affecting hover/keyboard
  useEffect(() => {
    if (!hoveredCell) return;
    const handleOutsideDismiss = (e) => {
      if (!e.target?.closest || !e.target.closest('[data-heatmap-cell="true"]')) {
        setHoveredCell(null);
      }
    };
    window.addEventListener('pointerdown', handleOutsideDismiss, { passive: true });
    window.addEventListener('scroll', handleOutsideDismiss, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleOutsideDismiss);
      window.removeEventListener('scroll', handleOutsideDismiss);
    };
  }, [hoveredCell]);

  return (
    <div className="p-4 sm:p-4.5 rounded-xl bg-surface border border-line shadow-xs flex flex-col justify-between">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 border-b border-line-subtle pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text tracking-tight">
              Activity heatmap
            </h2>
            <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-line">
              12 weeks
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Daily practice sessions across all problems
          </p>
        </div>

        {/* Range Summary Badges */}
        <div className="flex items-center gap-3 font-mono text-xs text-muted">
          <div>
            <span className="text-text font-semibold">{totalRangeAttempts}</span>{' '}
            <span>{totalRangeAttempts === 1 ? 'attempt' : 'attempts'}</span>
          </div>
          <span className="text-line">|</span>
          <div>
            <span className="text-text font-semibold">{activeDaysCount}</span>{' '}
            <span>active {activeDaysCount === 1 ? 'day' : 'days'}</span>
          </div>
        </div>
      </div>

      {/* Main Heatmap Container with Contained Horizontal Scroll on Mobile */}
      <div className="relative min-h-[160px]">
        {loading ? (
          <div className="h-40 w-full animate-pulse flex flex-col justify-center gap-2 p-2">
            <div className="h-3 bg-surface-2 rounded w-48 mb-2" />
            <div className="grid grid-cols-12 gap-2 h-28 bg-surface-2/40 rounded p-3" />
          </div>
        ) : error ? (
          <div className="h-40 border border-line-subtle rounded-lg flex flex-col items-center justify-center p-4 text-center bg-bg/40">
            <p className="text-xs text-text-secondary font-medium">
              Couldn't load activity heatmap
            </p>
            <p className="text-[11px] text-muted mt-0.5 max-w-xs">
              {error.message || 'Unable to load daily practice matrix.'}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2.5 px-3 py-1 text-xs font-mono text-accent hover:text-accent-hover border border-line hover:border-accent/40 rounded transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Section: 12-Week (84-Day) Calendar Grid */}
            <div className="lg:col-span-8 overflow-x-auto pb-2 scrollbar-thin">
              <div className="inline-block select-none min-w-[340px]">
                {/* Month Headers */}
                <div className="flex text-[10px] font-mono text-muted mb-2 pl-7">
                  {weeks.map((_, weekIdx) => {
                    const header = monthHeaders.find((h) => h.weekIndex === weekIdx);
                    return (
                      <div
                        key={`month-hdr-${weekIdx}`}
                        className="w-5 sm:w-6 mr-1.5 sm:mr-2 text-left truncate text-[10px]"
                      >
                        {header ? header.label : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Grid: 7 Rows (Days) x 12 Columns (Weeks) */}
                <div className="flex">
                  {/* Day of Week Labels (Mon, Wed, Fri) */}
                  <div className="flex flex-col justify-between pr-2 text-[9px] font-mono text-muted h-[154px] sm:h-[182px]">
                    <span className="h-5 sm:h-6 leading-none"></span>
                    <span className="h-5 sm:h-6 leading-none">Mon</span>
                    <span className="h-5 sm:h-6 leading-none"></span>
                    <span className="h-5 sm:h-6 leading-none">Wed</span>
                    <span className="h-5 sm:h-6 leading-none"></span>
                    <span className="h-5 sm:h-6 leading-none">Fri</span>
                    <span className="h-5 sm:h-6 leading-none"></span>
                  </div>

                  {/* Week Columns */}
                  <div className="flex gap-1.5 sm:gap-2">
                    {weeks.map((week, weekIdx) => (
                      <div
                        key={`week-${weekIdx}`}
                        className="flex flex-col gap-1.5 sm:gap-2"
                      >
                        {week.map((day) => {
                          const levelClass = getHeatmapLevelClass(day.count);
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
                              onFocus={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredCell({
                                  ...day,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                });
                              }}
                              onBlur={() => setHoveredCell(null)}
                              tabIndex={0}
                              role="button"
                              data-heatmap-cell="true"
                              aria-label={`${formatHeatmapTooltipDate(day.date)}: ${day.count} attempts`}
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-[3px] border transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:z-10 ${levelClass} ${
                                isHovered ? 'ring-1 ring-accent z-10' : ''
                              } ${
                                day.isToday
                                  ? 'relative after:content-[""] after:absolute after:inset-[-2px] after:rounded-[4px] after:border after:border-accent/60'
                                  : ''
                              }`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Practice Consistency & Frequency HUD */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-3 p-4 rounded-lg bg-surface-2/40 border border-line-subtle h-full">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-2">
                  Practice Consistency HUD
                </span>

                <div className="space-y-3">
                  {/* Metric 1: Consistency Ratio */}
                  <div className="p-2.5 rounded-md bg-surface border border-line">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-secondary font-medium">Active Days</span>
                      <span className="font-mono text-text font-semibold">
                        {activeDaysCount} <span className="text-muted font-normal">/ 84</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((activeDaysCount / 84) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted mt-1 block">
                      {Math.round((activeDaysCount / 84) * 100)}% consistency over 12 weeks
                    </span>
                  </div>

                  {/* Metric 2: Weekly Velocity */}
                  <div className="p-2.5 rounded-md bg-surface border border-line">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary font-medium">Weekly Velocity</span>
                      <span className="font-mono text-text font-semibold">
                        {(totalRangeAttempts / 12).toFixed(1)} <span className="text-muted text-[10px]">att/wk</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-muted mt-1 block">
                      Based on {totalRangeAttempts} recorded practice attempts
                    </span>
                  </div>
                </div>
              </div>

              {/* Intensity Legend */}
              <div className="pt-2 border-t border-line-subtle flex items-center justify-between text-[10px] font-mono text-muted">
                <span>Less</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-[2px] bg-surface-2/60 border border-line/50" title="0 attempts" />
                  <div className="w-3 h-3 rounded-[2px] bg-accent/25 border border-accent/40" title="1 attempt" />
                  <div className="w-3 h-3 rounded-[2px] bg-accent/60 border border-accent/80" title="2-3 attempts" />
                  <div className="w-3 h-3 rounded-[2px] bg-accent border border-accent-hover" title="4+ attempts" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 bg-surface-2 border border-line text-text text-xs font-mono rounded-md px-2.5 py-1.5 shadow-elevated"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
          }}
        >
          <div className="font-medium text-text text-[11px]">
            {formatHeatmapTooltipDate(hoveredCell.date)}
          </div>
          <div className="text-muted text-[10px] mt-0.5 flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                hoveredCell.count > 0 ? 'bg-accent' : 'bg-muted'
              }`}
            />
            <span>
              {hoveredCell.count === 0
                ? 'No practice attempts'
                : `${hoveredCell.count} practice ${
                    hoveredCell.count === 1 ? 'attempt' : 'attempts'
                  }`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
