import React, { useMemo, useState } from 'react';
import { Calendar, TrendingUp, Activity } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDisplayDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * PracticeHeatmap: Level 4 Practice Activity Instrument.
 *
 * Designed as ONE unified analytics instrument:
 * - Visual Anchor: 24-week rolling habit & consistency heatmap.
 * - Integrated Supporting Telemetry: Day Cadence & Weekly Output (unboxed, clean gauges).
 * - Zero nested cards or duplicate borders.
 */
const PracticeHeatmap = ({ heatmapData = [], isLoading = false, error = null, onRetry }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [compactMode, setCompactMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 640;
  });

  // Generate 24 weeks (~5.5 months) rolling history
  const { weeks, todayStr } = useMemo(() => {
    const map = new Map();
    (heatmapData || []).forEach(({ date, count }) => {
      map.set(date, Number(count) || 0);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);

    const WEEKS_TO_SHOW = 24;
    const totalDays = WEEKS_TO_SHOW * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start on Sunday

    const generatedWeeks = [];
    const months = [];
    let currentWeek = [];
    let lastMonth = -1;

    const iter = new Date(startDate);
    while (iter <= today || currentWeek.length > 0) {
      const iso = iter.toISOString().slice(0, 10);
      const isFuture = iter > today;
      const count = map.get(iso) ?? 0;
      const currentMonth = iter.getMonth();

      if (currentWeek.length === 0) {
        months.push({
          weekIndex: generatedWeeks.length,
          name: currentMonth !== lastMonth ? MONTH_NAMES[currentMonth] : '',
        });
        lastMonth = currentMonth;
      }

      currentWeek.push({ date: iso, count: isFuture ? null : count, isFuture });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
        if (iter >= today) break;
      }
      iter.setDate(iter.getDate() + 1);
    }

    return {
      weeks: generatedWeeks,
      todayStr: todayIso,
    };
  }, [heatmapData]);

  // 12 weeks in compact mode (perfect for mobile), 24 weeks in full mode (fills laptop)
  const displayWeeks = useMemo(() => {
    return compactMode ? weeks.slice(-12) : weeks;
  }, [weeks, compactMode]);

  // Derive Month Groups with exact week clustering for unambiguous month identification
  const monthGroups = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    displayWeeks.forEach((week, wIdx) => {
      const monthFreq = {};
      week.forEach((day) => {
        if (day.date) {
          const m = parseInt(day.date.slice(5, 7), 10) - 1;
          monthFreq[m] = (monthFreq[m] || 0) + 1;
        }
      });
      let bestMonth = 0;
      let maxCount = -1;
      Object.entries(monthFreq).forEach(([m, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestMonth = parseInt(m, 10);
        }
      });

      if (!currentGroup || currentGroup.monthIdx !== bestMonth) {
        currentGroup = {
          monthIdx: bestMonth,
          monthName: MONTH_NAMES[bestMonth],
          weeks: [{ week, wIdx }],
        };
        groups.push(currentGroup);
      } else {
        currentGroup.weeks.push({ week, wIdx });
      }
    });

    return groups;
  }, [displayWeeks]);

  // Telemetry in current view window
  const { totalAttemptsInView, activeDaysInView } = useMemo(() => {
    let attempts = 0;
    let active = 0;
    displayWeeks.forEach((week) => {
      week.forEach((cell) => {
        if (cell.count !== null && !cell.isFuture) {
          attempts += cell.count;
          if (cell.count > 0) active += 1;
        }
      });
    });
    return { totalAttemptsInView: attempts, activeDaysInView: active };
  }, [displayWeeks]);

  const totalDaysInView = displayWeeks.length * 7;
  const consistencyPct = totalDaysInView > 0 ? Math.round((activeDaysInView / totalDaysInView) * 100) : 0;

  // Day-of-Week Rhythm aggregates
  const { dayTotals, maxDayTotal, bestDayIdx } = useMemo(() => {
    const totals = [0, 0, 0, 0, 0, 0, 0];
    displayWeeks.forEach((week) => {
      week.forEach((cell, dayIdx) => {
        if (cell.count && !cell.isFuture) {
          totals[dayIdx] += cell.count;
        }
      });
    });
    const max = Math.max(...totals, 1);
    const bestIdx = totals.reduce((best, val, i) => (val > totals[best] ? i : best), 0);
    return { dayTotals: totals, maxDayTotal: max, bestDayIdx: bestIdx };
  }, [displayWeeks]);

  // Weekly output totals and momentum
  const weeklyTotals = useMemo(() => {
    return displayWeeks.map((week) =>
      week.reduce((sum, cell) => sum + (cell.count || 0), 0)
    );
  }, [displayWeeks]);

  const currentWeekTotal = weeklyTotals[weeklyTotals.length - 1] || 0;
  const prevWeekTotal = weeklyTotals.length > 1 ? weeklyTotals[weeklyTotals.length - 2] || 0 : 0;
  const weekDelta = currentWeekTotal - prevWeekTotal;
  const maxWeekTotal = Math.max(...weeklyTotals, 1);
  const avgWeeklyOutput = weeklyTotals.length > 0
    ? (totalAttemptsInView / weeklyTotals.length).toFixed(1)
    : '0';

  // Heatmap Cell Color Scheme
  const getCellColor = (count) => {
    if (count === null || count === undefined) return 'bg-transparent border-transparent';
    if (count === 0) return 'bg-surface-2/70 border-line/40 hover:border-text-secondary/40';
    if (count === 1) return 'bg-easy/25 border-easy/40 hover:bg-easy/35';
    if (count <= 3) return 'bg-easy/50 border-easy/65 hover:bg-easy/60';
    if (count <= 5) return 'bg-easy/75 border-easy/85 hover:bg-easy/85';
    return 'bg-easy border-emerald-400 text-bg hover:brightness-110';
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-surface border border-line/70 p-4 sm:p-5 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <div className="h-5 w-44 bg-surface-2 rounded-md" />
          <div className="h-6 w-48 bg-surface-2 rounded-md" />
        </div>
        <div className="h-44 bg-surface-2/50 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-surface border border-danger/25 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-text">Practice Activity</h3>
        <div className="h-32 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-danger mb-2">Unable to load practice telemetry.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-secondary text-xs py-1 px-3">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="practice-activity-instrument" className="panel p-4 sm:p-5 relative overflow-hidden transition-all flex flex-col justify-between">
      {/* ── Level 4 Header: Clean Title + Secondary Telemetry ───────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-line/50">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-text tracking-tight">
              Practice Activity
            </h3>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.2 rounded bg-surface-2 border border-line/60 text-accent">
              {consistencyPct}% active rate
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Rolling {compactMode ? '12-week' : '24-week'} habit consistency & practice cadence
          </p>
        </div>

        {/* Quiet Controls & Compact Telemetry */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap self-start sm:self-auto">
          {/* Direct Telemetry Readout */}
          <div className="text-xs text-muted tabular-nums">
            <span className="font-semibold text-text">{activeDaysInView}</span>
            <span className="text-muted/70">/{totalDaysInView}d active</span>
            <span className="text-line/60 mx-1.5">·</span>
            <span className="font-semibold text-accent">{totalAttemptsInView}</span>
            <span className="text-muted/70"> sessions</span>
          </div>

          {/* Minimal 24w / 12w Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-md bg-surface-2/80 border border-line text-xs">
            <button
              type="button"
              onClick={() => setCompactMode(false)}
              className={`px-2 py-0.5 font-medium rounded transition-colors cursor-pointer text-xs ${
                !compactMode
                  ? 'bg-surface text-accent font-semibold shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              24w
            </button>
            <button
              type="button"
              onClick={() => setCompactMode(true)}
              className={`px-2 py-0.5 font-medium rounded transition-colors cursor-pointer text-xs ${
                compactMode
                  ? 'bg-surface text-accent font-semibold shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              12w
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Instrument Body: Heatmap + Integrated Rhythm Sidebar ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3.5 min-w-0 items-stretch">

        {/* ── PRIMARY: Heatmap Grid (8 cols on lg) ──────────────────── */}
        <div className="lg:col-span-8 min-w-0 flex flex-col justify-between">
          <div className={`w-full ${compactMode ? 'overflow-x-auto sm:overflow-x-visible' : 'overflow-x-auto'} pb-1`}>
            <div className={compactMode ? 'min-w-0 max-w-full' : 'min-w-[580px]'}>
              <div className="flex gap-2 sm:gap-2.5">
                {/* Day rows: S, M, T, W, T, F, S */}
                <div className="flex flex-col text-[11px] text-muted select-none w-4 shrink-0 text-right pr-1 font-medium">
                  <div className="h-5 mb-1" />
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <span className="h-3.5 sm:h-4 md:h-[17px] flex items-center justify-end leading-none opacity-0">S</span>
                    <span className="h-3.5 sm:h-4 md:h-[17px] flex items-center justify-end leading-none">M</span>
                    <span className="h-3.5 sm:h-4 md:h-[17px] flex items-center justify-end leading-none opacity-0">T</span>
                    <span className="h-3.5 sm:h-4 md:h-[17px] flex items-center justify-end leading-none">W</span>
                    <span className="h-3.5 sm:h-4 md:h-[17px] flex items-center justify-end leading-none opacity-0">T</span>
                    <span className="h-3.5 sm:h-4 md:h-[17px] flex items-center justify-end leading-none">F</span>
                    <span className="h-3.5 sm:h-4 md:h-[17px] flex items-center justify-end leading-none opacity-0">S</span>
                  </div>
                </div>

                {/* Month Clusters */}
                <div className="flex gap-2.5 sm:gap-3.5 overflow-visible">
                  {monthGroups.map((group, gIdx) => {
                    const isHoveredMonth =
                      hoveredCell && parseInt(hoveredCell.date.slice(5, 7), 10) - 1 === group.monthIdx;

                    return (
                      <div key={gIdx} className="flex flex-col shrink-0">
                        <div className="h-5 mb-1 flex items-center select-none">
                          <span
                            className={`text-xs font-medium transition-colors ${
                              isHoveredMonth ? 'text-accent font-semibold' : 'text-text-secondary'
                            }`}
                          >
                            {group.monthName}
                          </span>
                        </div>

                        {/* Week Columns */}
                        <div className="flex gap-1 sm:gap-1.5">
                          {group.weeks.map(({ week, wIdx }) => (
                            <div key={wIdx} className="flex flex-col gap-1 sm:gap-1.5 shrink-0">
                              {week.map((day, dIdx) => {
                                const isHovered = hoveredCell?.date === day.date;
                                const isToday = day.date === todayStr;

                                if (day.isFuture) {
                                  return (
                                    <div
                                      key={dIdx}
                                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[17px] md:h-[17px] rounded-[3px] bg-transparent"
                                    />
                                  );
                                }

                                return (
                                  <div
                                    key={dIdx}
                                    onMouseEnter={() => setHoveredCell(day)}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    onClick={() => setHoveredCell(day)}
                                    title={day.count !== null ? `${formatDisplayDate(day.date)}: ${day.count} solves` : ''}
                                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[17px] md:h-[17px] rounded-[3px] border transition-all duration-150 cursor-pointer ${getCellColor(
                                      day.count
                                    )} ${
                                      isHovered
                                        ? 'ring-2 ring-accent scale-110 z-10'
                                        : ''
                                    } ${isToday && !isHovered ? 'ring-1.5 ring-accent' : ''}`}
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Window, Live Inspection Pill, & Legend */}
          <div className="mt-3 pt-2.5 border-t border-line/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-muted text-[11px]">
              <span>{totalDaysInView}d window</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] border border-line ring-1 ring-accent bg-surface-2 inline-block" />
                <span>Today</span>
              </span>
            </div>

            {/* Live Hover Readout */}
            <div className="text-xs min-h-[24px] flex items-center">
              {hoveredCell && hoveredCell.count !== null ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-2 border border-line/60 text-text text-xs">
                  <span className="text-accent font-semibold tabular-nums">
                    {hoveredCell.count === 0 ? '0' : hoveredCell.count} solves
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-text font-medium">{formatDisplayDate(hoveredCell.date)}</span>
                  <span className="text-muted">·</span>
                  <span className={`text-[10px] font-semibold px-1 rounded ${hoveredCell.count > 0 ? 'text-easy bg-easy/10' : 'text-muted bg-surface-3'}`}>
                    {hoveredCell.count > 0 ? 'Active' : 'Rest'}
                  </span>
                </span>
              ) : (
                <span className="text-muted flex items-center gap-1 text-[11px]">
                  <span>Hover cell for session logs</span>
                </span>
              )}
            </div>

            {/* Intensity Scale */}
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className="text-[10px]">Less</span>
              {[
                'bg-surface-2/70 border-line/40',
                'bg-easy/25 border-easy/40',
                'bg-easy/50 border-easy/65',
                'bg-easy/75 border-easy/85',
                'bg-easy border-emerald-400',
              ].map((cls, i) => (
                <span key={i} className={`w-2.5 h-2.5 rounded-[2px] border ${cls}`} />
              ))}
              <span className="text-[10px]">More</span>
            </div>
          </div>
        </div>

        {/* ── SUPPORTING: Unboxed Integrated Rhythm Telemetry (4 cols) ── */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-line/40 pt-3.5 lg:pt-0 lg:pl-5 flex flex-col justify-between gap-3.5">

          {/* 1. Day Cadence Gauge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
                  Day Cadence
                </span>
              </div>
              {dayTotals[bestDayIdx] > 0 && (
                <span className="text-[10px] font-mono font-semibold tabular-nums text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.2 rounded">
                  Peak: {DAY_ABBRS[bestDayIdx]} ({dayTotals[bestDayIdx]})
                </span>
              )}
            </div>

            {/* Equalizer Columns */}
            <div className="grid grid-cols-7 gap-1.5 items-end h-16 pt-1 pb-0.5">
              {dayTotals.map((tot, idx) => {
                const isPeak = idx === bestDayIdx && tot > 0;
                const heightPct = maxDayTotal > 0 ? Math.max(12, Math.round((tot / maxDayTotal) * 100)) : 12;
                const isZero = tot === 0;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center h-full justify-between group cursor-default"
                    title={`${DAY_ABBRS[idx]}: ${tot} solve${tot !== 1 ? 's' : ''}`}
                  >
                    <span
                      className={`text-[9px] tabular-nums leading-none transition-colors ${
                        isPeak
                          ? 'font-bold text-accent'
                          : tot > 0
                          ? 'text-text-secondary font-medium'
                          : 'text-muted/40'
                      }`}
                    >
                      {tot > 0 ? tot : '·'}
                    </span>

                    <div className="w-full flex justify-center items-end flex-1 my-0.5">
                      <div className="w-1.5 sm:w-2 h-full rounded-full bg-surface-2 relative flex items-end justify-center overflow-hidden">
                        <div
                          className={`w-full rounded-full transition-all duration-300 ${
                            isPeak
                              ? 'bg-accent'
                              : tot > 0
                              ? 'bg-accent/70'
                              : 'bg-transparent'
                          }`}
                          style={{ height: isZero ? '0%' : `${heightPct}%` }}
                        />
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono leading-none ${
                        isPeak ? 'font-bold text-accent' : 'text-muted'
                      }`}
                    >
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Weekly Output Velocity Gauge */}
          <div className="space-y-1.5 pt-2.5 border-t border-line/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
                  Weekly Output
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold tabular-nums px-1.5 py-0.2 rounded border ${
                  weekDelta > 0
                    ? 'text-easy bg-easy/10 border-easy/25'
                    : weekDelta < 0
                    ? 'text-text-secondary bg-surface-2 border-line/50'
                    : 'text-muted bg-surface-2 border-line/50'
                }`}
              >
                {weekDelta > 0
                  ? `↑ +${weekDelta} vs last wk`
                  : weekDelta < 0
                  ? `↓ ${Math.abs(weekDelta)} vs last wk`
                  : 'Pace steady'}
              </span>
            </div>

            {/* Velocity Micro Stats */}
            <div className="flex items-center justify-between text-[11px] text-muted py-0.5 tabular-nums">
              <span>This wk: <strong className="text-accent font-semibold">{currentWeekTotal}</strong></span>
              <span className="text-line/60">·</span>
              <span>Avg: <strong className="text-text font-medium">{avgWeeklyOutput}</strong>/wk</span>
              <span className="text-line/60">·</span>
              <span>Peak: <strong className="text-text font-medium">{maxWeekTotal}</strong></span>
            </div>

            {/* Mini Histogram */}
            <div className="flex items-end gap-1 h-10 pt-1">
              {weeklyTotals.slice(-12).map((wt, i, arr) => {
                const isCur = i === arr.length - 1;
                const heightPct = maxWeekTotal > 0 && wt > 0 ? Math.max(15, Math.round((wt / maxWeekTotal) * 100)) : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-default"
                    title={`Week ${weeklyTotals.length - arr.length + i + 1}: ${wt} solves`}
                  >
                    <div className="w-full flex justify-center items-end flex-1">
                      <div className="w-1 sm:w-1.5 h-full rounded-t-xs bg-surface-2 relative flex items-end justify-center overflow-hidden">
                        <div
                          className={`w-full rounded-t-xs transition-all duration-200 ${
                            isCur
                              ? 'bg-accent'
                              : wt > 0
                              ? 'bg-accent/60'
                              : 'bg-transparent'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PracticeHeatmap;
