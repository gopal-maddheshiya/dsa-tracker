import React, { useMemo, useState } from 'react';

/**
 * Formats a Date object to YYYY-MM-DD
 */
const toIsoDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns formatted string like "Aug 24, 2026"
 */
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
};

const PracticeHeatmap = ({ heatmapData = [], isLoading = false, error = null, onRetry }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate calendar grid for the past 20 weeks (140 days) ending today
  const { weeks, totalAttemptsInPeriod, activeDaysCount, maxDailyCount } = useMemo(() => {
    // Map backend array to lookup map
    const countMap = {};
    let total = 0;
    let active = 0;
    let max = 0;

    heatmapData.forEach((item) => {
      const count = Number(item.count) || 0;
      countMap[item.date] = count;
      total += count;
      if (count > 0) active += 1;
      if (count > max) max = count;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // End on current day, roll back to complete 20 weeks
    const daysToShow = 20 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (daysToShow - 1));

    // Align start to Sunday or Monday
    const startDayOfWeek = startDate.getDay(); // 0 = Sun
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const generatedWeeks = [];
    let currentWeek = [];
    const iter = new Date(startDate);

    while (iter <= today || currentWeek.length > 0) {
      const iso = toIsoDate(iter);
      const isFuture = iter > today;
      const count = countMap[iso] || 0;

      currentWeek.push({
        date: iso,
        count: isFuture ? null : count,
        isFuture,
      });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
        if (iter >= today) break;
      }

      iter.setDate(iter.getDate() + 1);
    }

    return {
      weeks: generatedWeeks,
      totalAttemptsInPeriod: total,
      activeDaysCount: active,
      maxDailyCount: max,
    };
  }, [heatmapData]);

  const getIntensityClass = (count) => {
    if (count === null || count === undefined) return 'bg-transparent border-transparent';
    if (count === 0) return 'bg-slate-800/80 border-slate-700/40';
    if (count <= 2) return 'bg-emerald-950 border-emerald-900/80 text-emerald-300';
    if (count <= 4) return 'bg-emerald-800 border-emerald-700 text-emerald-100';
    return 'bg-emerald-500 border-emerald-400 text-white';
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-4 w-32 bg-slate-800 rounded"></div>
          <div className="h-4 w-24 bg-slate-800 rounded"></div>
        </div>
        <div className="h-32 bg-slate-800/40 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-200">Practice Activity Heatmap</h3>
        <div className="h-32 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-rose-400 mb-2">Unable to load activity heatmap.</p>
          {onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg p-5 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">Practice Activity</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Daily attempt velocity over the past 20 weeks</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px]">
            <strong className="text-white">{activeDaysCount}</strong> active days
          </span>
          <span className="text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px]">
            <strong className="text-emerald-400">{totalAttemptsInPeriod}</strong> attempts
          </span>
        </div>
      </div>

      {/* Heatmap Grid container */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="min-w-[620px]">
          <div className="flex space-x-1.5 justify-start">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col space-y-1.5">
                {week.map((cell) => {
                  const isHovered = hoveredCell && hoveredCell.date === cell.date;
                  return (
                    <div
                      key={cell.date}
                      onMouseEnter={() => !cell.isFuture && setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-3.5 h-3.5 rounded-sm border transition-all ${getIntensityClass(
                        cell.count
                      )} ${isHovered ? 'ring-2 ring-emerald-400 z-10' : ''}`}
                      title={
                        !cell.isFuture
                          ? `${formatDisplayDate(cell.date)}: ${cell.count} attempt${
                              cell.count === 1 ? '' : 's'
                            }`
                          : ''
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Dynamic Legend & Active Cell Tooltip */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="font-mono text-slate-400 h-5">
          {hoveredCell && hoveredCell.count !== null ? (
            <span>
              <strong className="text-white font-sans">{formatDisplayDate(hoveredCell.date)}</strong>
              {' — '}
              <span className="text-emerald-400 font-semibold">
                {hoveredCell.count} attempt{hoveredCell.count === 1 ? '' : 's'}
              </span>
            </span>
          ) : (
            <span className="text-slate-500 font-sans">Hover over any day to inspect velocity</span>
          )}
        </div>

        {/* Intensity Scale Legend */}
        <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-400">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-slate-800/80 border border-slate-700/40"></span>
          <span className="w-3 h-3 rounded-sm bg-emerald-950 border border-emerald-900/80"></span>
          <span className="w-3 h-3 rounded-sm bg-emerald-800 border border-emerald-700"></span>
          <span className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400"></span>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default PracticeHeatmap;
