import React, { useMemo, useState } from 'react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = [
  { label: '', day: 0 },
  { label: 'Mon', day: 1 },
  { label: '', day: 2 },
  { label: 'Wed', day: 3 },
  { label: '', day: 4 },
  { label: 'Fri', day: 5 },
  { label: '', day: 6 },
];

/**
 * Format date for human readability in tooltip readout
 */
const formatDisplayDate = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * PracticeHeatmap: Generous Width Practice Rhythm Surface.
 *
 * Follows UI-3.3 Reference Direction (GitHub Contributions inspired):
 * - Expansive width utilizing the full workspace instrument canvas.
 * - Flat, unscaled cells (rounded-[2px]) with zero borders and zero glow.
 * - Precision month labels that never wrap or clip.
 * - Weekday guide (Mon, Wed, Fri) aligned to day rows.
 * - Live interactive scrub telemetry with tooltip readout.
 */
const PracticeHeatmap = ({
  heatmapData = [],
  isLoading = false,
  error = null,
  onRetry,
  className = '',
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate 44 weeks (~10 months) rolling activity stream
  const { weeks, activeDays, totalAttempts, todayStr } = useMemo(() => {
    const map = new Map();
    let totalAct = 0;
    let actDays = 0;

    (heatmapData || []).forEach(({ date, count }) => {
      const c = Number(count) || 0;
      if (date) {
        map.set(date, c);
        if (c > 0) {
          totalAct += c;
          actDays += 1;
        }
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);

    const WEEKS_TO_SHOW = 52;
    const totalDays = WEEKS_TO_SHOW * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Sunday anchor

    const generatedWeeks = [];
    let currentWeek = [];
    const iter = new Date(startDate);

    while (iter <= today || currentWeek.length > 0) {
      const iso = iter.toISOString().slice(0, 10);
      const isFuture = iter > today;
      const count = map.get(iso) ?? 0;

      currentWeek.push({
        date: iso,
        count: isFuture ? null : count,
        isFuture,
        month: iter.getMonth(),
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
      activeDays: actDays,
      totalAttempts: totalAct,
      todayStr: todayIso,
    };
  }, [heatmapData]);

  // Derive Month labels with column indexes (skipping adjacent duplicate labels)
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    let lastWeekIdx = -4;

    weeks.forEach((week, wIdx) => {
      const firstValidDay = week.find((d) => !d.isFuture);
      if (firstValidDay && firstValidDay.month !== lastMonth && wIdx - lastWeekIdx >= 3) {
        labels.push({ weekIndex: wIdx, name: MONTH_NAMES[firstValidDay.month] });
        lastMonth = firstValidDay.month;
        lastWeekIdx = wIdx;
      }
    });

    return labels;
  }, [weeks]);

  // Color mapping based on attempt count (restrained tonal palette)
  const getCellColor = (count) => {
    if (count === null || count === undefined || count === 0) return 'bg-surface-2/60';
    if (count === 1) return 'bg-easy/30';
    if (count === 2) return 'bg-easy/55';
    if (count <= 4) return 'bg-easy/80';
    return 'bg-easy';
  };

  if (isLoading) {
    return (
      <div className={`rounded-lg border border-line-subtle/70 bg-surface/50 p-5 sm:p-6 animate-pulse select-none ${className}`}>
        <div className="h-3 w-28 bg-surface-2 rounded-xs mb-2" />
        <div className="h-5 w-48 bg-surface-2 rounded-xs mb-5" />
        <div className="h-32 w-full bg-surface-2/40 rounded-sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-danger/30 bg-surface/50 p-5 sm:p-6 text-xs text-text-secondary ${className}`}>
        <p className="font-semibold text-text">Practice Rhythm</p>
        <p className="text-danger mt-1">Unable to load activity data.</p>
        {onRetry && (
          <button onClick={onRetry} className="text-accent underline mt-2 cursor-pointer font-medium">
            Retry
          </button>
        )}
      </div>
    );
  }
  return (
    <section
      aria-label="Practice Rhythm Heatmap"
      className={`rounded-xl border border-line bg-surface p-4 sm:p-6 select-none transition-all ${className}`}
    >
      {/* ── EDITORIAL HEADER ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3.5 border-b border-line">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted block">
            Practice Rhythm
          </span>
          <p className="text-xs sm:text-sm font-semibold text-text mt-0.5 tabular-nums">
            {activeDays} active days <span className="text-muted/40 font-normal">·</span> {totalAttempts} attempts <span className="text-muted/40 font-normal">·</span> 52-week matrix
          </p>
        </div>

        {/* Live Hover Readout or Contextual Subtitle */}
        <div className="text-xs font-mono text-muted min-h-[20px] sm:min-h-[24px] flex items-center">
          {hoveredCell && hoveredCell.count !== null ? (
            <span className="text-text font-medium bg-surface-2 px-2.5 py-0.5 rounded border border-line-subtle animate-fade-in text-[11px]">
              <span className="text-accent font-semibold tabular-nums">+{hoveredCell.count}</span> solve{hoveredCell.count === 1 ? '' : 's'} on{' '}
              {formatDisplayDate(hoveredCell.date)}
            </span>
          ) : (
            <span className="text-muted/70 text-[10px] sm:text-[11px]">364 calendar days cadence</span>
          )}
        </div>
      </div>

      {/* ── HEATMAP GRID WITH STRUCTURAL FRAMEWORK ─────────────────── */}
      <div className="pt-4 max-w-full overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-block min-w-full">
          {/* Month Labels Bar */}
          <div className="flex text-[10px] font-mono text-muted mb-2 pl-7 sm:pl-8 h-4">
            {weeks.map((_, idx) => {
              const label = monthLabels.find((m) => m.weekIndex === idx);
              return (
                <div key={idx} className="w-3 sm:w-3.5 mr-[3px] shrink-0 relative">
                  {label && (
                    <span className="absolute left-0 -top-0.5 whitespace-nowrap text-[10px] font-mono text-muted/80">
                      {label.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Days Grid with Weekday Indicators */}
          <div className="flex">
            {/* Weekday Guide (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[9px] font-mono text-muted/60 pr-2 select-none w-7 sm:w-8 shrink-0 h-[102px] sm:h-[116px]">
              {DAY_LABELS.map((d, i) => (
                <span key={i} className="h-3 sm:h-3.5 leading-none flex items-center">
                  {d.label}
                </span>
              ))}
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => {
                    if (day.isFuture) {
                      return <div key={day.date} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
                    }

                    const isToday = day.date === todayStr;
                    const cellColor = getCellColor(day.count);

                    return (
                      <div
                        key={day.date}
                        onMouseEnter={() => setHoveredCell(day)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] cursor-pointer transition-colors ${cellColor} ${
                          isToday ? 'ring-1 ring-accent ring-offset-1 ring-offset-background' : ''
                        }`}
                        title={`${day.count} solves on ${day.date}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── QUIET LEGEND & RANGE METRIC ─────────────────────────────── */}
      <div className="pt-3 border-t border-line-subtle/50 mt-3 sm:mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-muted font-mono">
        <span>364 calendar days tracked</span>

        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-surface-2/60" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-easy/30" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-easy/55" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-easy/80" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-easy" />
          </div>
          <span>More</span>
        </div>
      </div>
    </section>
  );
};

export default PracticeHeatmap;
