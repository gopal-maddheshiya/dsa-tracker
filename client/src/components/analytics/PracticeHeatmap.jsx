import React, { useMemo, useState } from 'react';
import { Calendar, TrendingUp, Activity } from 'lucide-react';
import { accent } from '../../theme/colors';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDisplayDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const PracticeHeatmap = ({ heatmapData = [], isLoading = false, error = null, onRetry }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [compactMode, setCompactMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 640;
  });

  // Generate 24 weeks (~5.5 months) rolling history
  const { weeks, monthLabels, todayStr } = useMemo(() => {
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
      monthLabels: months,
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
      // Find the month that occurs most frequently in this week
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

  // Dynamic Grade & Motivating Status
  const gradeConfig = useMemo(() => {
    if (consistencyPct >= 75) return { grade: 'A', label: 'Consistent', color: 'text-easy', bg: 'bg-easy/10', border: 'border-easy/30' };
    if (consistencyPct >= 55) return { grade: 'B', label: 'Regular', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' };
    if (consistencyPct >= 35) return { grade: 'C', label: 'Developing', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' };
    if (consistencyPct >= 15) return { grade: 'D', label: 'Sporadic', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' };
    return { grade: 'F', label: 'Inactive', color: 'text-muted', bg: 'bg-surface-2', border: 'border-line' };
  }, [consistencyPct]);

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

  // Heatmap Cell Color Scheme (LeetCode/Linear dark-mode palette)
  const getCellColor = (count) => {
    if (count === null || count === undefined) return 'bg-transparent border-transparent';
    if (count === 0) return 'bg-surface-2/70 border-line/40 hover:border-text-secondary/40';
    if (count === 1) return 'bg-easy/25 border-easy/40 hover:bg-easy/35';
    if (count <= 3) return 'bg-easy/50 border-easy/65 hover:bg-easy/60 shadow-[0_0_6px_rgba(44,187,93,0.15)]';
    if (count <= 5) return 'bg-easy/75 border-easy/85 hover:bg-easy/85 shadow-[0_0_8px_rgba(44,187,93,0.3)]';
    return 'bg-easy border-emerald-400 text-bg hover:brightness-110 shadow-[0_0_10px_rgba(44,187,93,0.45)]';
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-surface border border-line p-4 sm:p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-5">
          <div className="h-5 w-44 bg-surface-2 rounded-md" />
          <div className="h-7 w-52 bg-surface-2 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 h-48 bg-surface-2 rounded-xl" />
          <div className="lg:col-span-4 h-48 bg-surface-2 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-surface border border-danger/20 p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-text">Practice Activity</h3>
        <div className="h-36 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-danger mb-3">Unable to load practice telemetry.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-secondary text-xs">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-line p-4 sm:p-5 lg:p-6 overflow-hidden min-w-0 max-w-full">
      {/* ── Top Header & Telemetry Controls ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-line">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Activity className="w-4 h-4 text-accent shrink-0" />
            <h3 className="text-base font-semibold text-text tracking-tight">Practice Activity</h3>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${gradeConfig.color} ${gradeConfig.bg} ${gradeConfig.border}`}
            >
              Grade {gradeConfig.grade} · {consistencyPct}% {gradeConfig.label}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Rolling {compactMode ? '12-week' : '24-week'} consistency & habit telemetry
          </p>
        </div>

        {/* View Toggle & Inline Telemetry Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Segmented View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line text-xs">
            <button
              type="button"
              onClick={() => setCompactMode(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                !compactMode
                  ? 'bg-surface text-accent font-semibold shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              24w Full
            </button>
            <button
              type="button"
              onClick={() => setCompactMode(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                compactMode
                  ? 'bg-surface text-accent font-semibold shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              12w Compact
            </button>
          </div>

          {/* Active Days Pill */}
          <div className="px-2.5 py-1 rounded-lg bg-surface-2 border border-line flex items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Active</span>
            <span className="font-semibold tabular-nums text-text">
              {activeDaysInView} <span className="text-[10px] text-muted font-normal">/ {totalDaysInView}d</span>
            </span>
          </div>

          {/* Sessions Pill */}
          <div className="px-2.5 py-1 rounded-lg bg-surface-2 border border-line flex items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Sessions</span>
            <span className="font-semibold tabular-nums text-accent">
              {totalAttemptsInView}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content: Heatmap Grid + Right Telemetry Sidebar ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-5 min-w-0">
        {/* Left/Center: Heatmap Grid + Readout + Legend (8 cols) */}
        <div className="lg:col-span-8 min-w-0 flex flex-col justify-between">
          <div className={`w-full ${compactMode ? 'overflow-x-auto sm:overflow-x-visible' : 'overflow-x-auto'} pb-2`}>
            <div className={compactMode ? 'min-w-0 max-w-full' : 'min-w-[580px]'}>
              {/* Day Labels + Heatmap Month Clusters */}
              <div className="flex gap-2 sm:gap-2.5">
                {/* Day rows: Sun to Sat, displaying M, W, F with exact row-height matching */}
                <div className="flex flex-col text-[11px] text-muted select-none w-4 shrink-0 text-right pr-1 font-medium">
                  {/* Top height spacer matching Month Header height exactly */}
                  <div className="h-5 mb-1.5" />

                  {/* 7 day labels */}
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

                {/* Month Clusters: Natural spacing between months like LeetCode (no lines/dividers) */}
                <div className="flex gap-2.5 sm:gap-3.5 overflow-visible">
                  {monthGroups.map((group, gIdx) => {
                    const isHoveredMonth =
                      hoveredCell && parseInt(hoveredCell.date.slice(5, 7), 10) - 1 === group.monthIdx;

                    return (
                      <div key={gIdx} className="flex flex-col shrink-0">
                        {/* Month Header Label (Clean text like LeetCode) */}
                        <div className="h-5 mb-1.5 flex items-center select-none">
                          <span
                            className={`text-xs font-medium transition-colors ${
                              isHoveredMonth ? 'text-accent font-semibold' : 'text-text-secondary'
                            }`}
                          >
                            {group.monthName}
                          </span>
                        </div>

                        {/* Week Columns belonging to this month */}
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
                                    } ${isToday && !isHovered ? 'ring-1.5 ring-accent shadow-[0_0_8px_rgba(255,161,22,0.35)]' : ''}`}
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

          {/* Bottom Bar: Window metadata, Live Hover Inspection Readout, & Scale Legend */}
          <div className="mt-3 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Window & Today Indicator */}
            <div className="flex items-center gap-3 text-text-secondary">
              <span className="font-medium">{totalDaysInView}d window</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] border border-line ring-1.5 ring-accent bg-surface-2 inline-block" />
                <span>Today</span>
              </span>
            </div>

            {/* Center: Live Hover Inspection Pill */}
            <div className="text-xs min-h-[26px] flex items-center">
              {hoveredCell && hoveredCell.count !== null ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-2 border border-line text-text">
                  <span className="text-accent font-semibold tabular-nums">
                    {hoveredCell.count === 0 ? '0' : hoveredCell.count} solve{hoveredCell.count !== 1 ? 's' : ''}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-text font-semibold">{formatDisplayDate(hoveredCell.date)}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-surface-3 border border-line text-accent">
                    {MONTH_NAMES[parseInt(hoveredCell.date.slice(5, 7), 10) - 1]}
                  </span>
                  <span className="text-muted">·</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${hoveredCell.count > 0 ? 'text-easy bg-easy/10' : 'text-muted bg-surface-3'}`}>
                    {hoveredCell.count > 0 ? 'Active' : 'Rest'}
                  </span>
                </span>
              ) : (
                <span className="text-muted flex items-center gap-1.5 text-xs">
                  <span className="text-accent">◉</span> Hover or tap any square for session logs
                </span>
              )}
            </div>

            {/* Right: Color Intensity Scale */}
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="text-[11px] text-muted">Less</span>
              {[
                'bg-surface-2/70 border-line/40',
                'bg-easy/25 border-easy/40',
                'bg-easy/50 border-easy/65',
                'bg-easy/75 border-easy/85',
                'bg-easy border-emerald-400',
              ].map((cls, i) => (
                <span key={i} className={`w-3 h-3 rounded-[2px] border ${cls}`} />
              ))}
              <span className="text-[11px] text-muted">More</span>
            </div>
          </div>

          {/* Swipe Helper on Mobile (when in full mode) */}
          {!compactMode && (
            <div className="sm:hidden text-xs text-muted text-center pt-2 flex items-center justify-center gap-1.5 border-t border-line mt-2">
              <span>←</span>
              <span>Swipe horizontally to view full 24-week timeline</span>
              <span>→</span>
            </div>
          )}
        </div>

        {/* ── Right Telemetry Sidebar: Day Cadence & Weekly Velocity ─────────── */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 border-t lg:border-t-0 lg:border-l border-line pt-4 lg:pt-0 lg:pl-5">
          {/* 1. Day-of-Week Cadence (Sleek Vertical Equalizer) */}
          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-line flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs uppercase tracking-wider text-text font-semibold">
                  Day Cadence
                </span>
              </div>
              {dayTotals[bestDayIdx] > 0 && (
                <span className="text-[11px] font-semibold tabular-nums text-accent bg-accent/10 border border-accent/25 px-2 py-0.5 rounded-md">
                  Peak: {DAY_ABBRS[bestDayIdx]} ({dayTotals[bestDayIdx]})
                </span>
              )}
            </div>

            {/* 7 Vertical Equalizer Columns with background track rails */}
            <div className="grid grid-cols-7 gap-1.5 items-end h-20 pt-1 pb-0.5">
              {dayTotals.map((tot, idx) => {
                const isPeak = idx === bestDayIdx && tot > 0;
                const heightPct = maxDayTotal > 0 ? Math.max(10, Math.round((tot / maxDayTotal) * 100)) : 10;
                const isZero = tot === 0;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center h-full justify-between group cursor-default"
                    title={`${DAY_ABBRS[idx]}: ${tot} solve${tot !== 1 ? 's' : ''}`}
                  >
                    {/* Micro value label */}
                    <span
                      className={`text-[10px] tabular-nums leading-none transition-colors ${
                        isPeak
                          ? 'font-bold text-accent'
                          : tot > 0
                          ? 'text-text-secondary group-hover:text-text font-medium'
                          : 'text-muted/40'
                      }`}
                    >
                      {tot > 0 ? tot : '·'}
                    </span>

                    {/* Vertical Rail + Filled Bar */}
                    <div className="w-full flex justify-center items-end flex-1 my-1">
                      <div className="w-2 sm:w-2.5 h-full rounded-full bg-surface-3/50 relative flex items-end justify-center overflow-hidden">
                        <div
                          className={`w-full rounded-full transition-all duration-300 ${
                            isPeak
                              ? 'bg-gradient-to-t from-accent to-amber-300 shadow-[0_0_6px_rgba(255,161,22,0.45)]'
                              : tot > 0
                              ? 'bg-accent/75 group-hover:bg-accent'
                              : 'bg-transparent'
                          }`}
                          style={{ height: isZero ? '0%' : `${heightPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[11px] select-none transition-colors leading-none ${
                        isPeak
                          ? 'font-bold text-accent'
                          : 'text-muted group-hover:text-text-secondary'
                      }`}
                    >
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Weekly Velocity (Histogram & Momentum Metrics) */}
          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-line flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs uppercase tracking-wider text-text font-semibold">
                  Weekly Velocity
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-md border ${
                  weekDelta > 0
                    ? 'text-easy bg-easy/10 border-easy/25'
                    : weekDelta < 0
                    ? 'text-text-secondary bg-surface-3 border-line'
                    : 'text-muted bg-surface-3 border-line'
                }`}
              >
                {weekDelta > 0
                  ? `↑ +${weekDelta} vs last wk`
                  : weekDelta < 0
                  ? `↓ ${Math.abs(weekDelta)} vs last wk`
                  : 'Pace steady'}
              </span>
            </div>

            {/* Velocity Summary Row */}
            <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-surface border border-line/60 mb-2">
              <div className="flex items-center gap-1">
                <span className="text-muted text-[11px]">This Wk:</span>
                <span className="font-bold tabular-nums text-accent">{currentWeekTotal}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted text-[11px]">Avg/Wk:</span>
                <span className="font-medium tabular-nums text-text">{avgWeeklyOutput}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted text-[11px]">Peak:</span>
                <span className="font-medium tabular-nums text-text">{maxWeekTotal}</span>
              </div>
            </div>

            {/* Weekly Bars Histogram (Recent weeks with background rails) */}
            <div className="flex items-end gap-1 sm:gap-1.5 h-12 pt-1">
              {weeklyTotals.slice(-12).map((wt, i, arr) => {
                const isCur = i === arr.length - 1;
                const heightPct = maxWeekTotal > 0 && wt > 0 ? Math.max(12, Math.round((wt / maxWeekTotal) * 100)) : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-default"
                    title={`Week ${weeklyTotals.length - arr.length + i + 1}: ${wt} solve${wt !== 1 ? 's' : ''}`}
                  >
                    <div className="w-full flex justify-center items-end flex-1">
                      <div className="w-1.5 sm:w-2 h-full rounded-t-sm bg-surface-3/50 relative flex items-end justify-center overflow-hidden">
                        <div
                          className={`w-full rounded-t-sm transition-all duration-200 ${
                            isCur
                              ? 'bg-accent shadow-[0_0_6px_rgba(255,161,22,0.4)]'
                              : wt > 0
                              ? 'bg-accent/65 group-hover:bg-accent/90'
                              : 'bg-transparent'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-[9px] mt-0.5 leading-none tabular-nums ${
                        isCur ? 'font-bold text-accent' : 'text-muted/50 group-hover:text-muted'
                      }`}
                    >
                      {isCur ? 'Now' : ''}
                    </span>
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
