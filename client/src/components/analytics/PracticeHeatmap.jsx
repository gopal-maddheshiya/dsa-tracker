import React, { useMemo, useState } from 'react';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const formatDisplayDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const PracticeHeatmap = ({ heatmapData = [], isLoading = false, error = null, onRetry }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const {
    weeks,
    monthLabels,
    totalAttemptsInPeriod,
    activeDaysCount,
    weeklyTotals,
    bestWeekIdx,
    currentWeekTotal,
    prevWeekTotal,
    todayStr,
    dayTotals,
    maxDayTotal,
    bestDayIdx,
  } = useMemo(() => {
    const map = new Map();
    let total = 0;
    let active = 0;

    (heatmapData || []).forEach(({ date, count }) => {
      const c = Number(count) || 0;
      map.set(date, c);
      total += c;
      if (c > 0) active += 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);

    const WEEKS_TO_SHOW = 20;
    const totalDays = WEEKS_TO_SHOW * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());

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
        months.push({ weekIndex: generatedWeeks.length, name: currentMonth !== lastMonth ? MONTH_NAMES[currentMonth] : '' });
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

    // Weekly totals for sparkline
    const wTotals = generatedWeeks.map(w => w.reduce((s, c) => s + (c.count || 0), 0));
    const bestWIdx = wTotals.reduce((best, val, i) => val > wTotals[best] ? i : best, 0);
    const curWeek = wTotals[wTotals.length - 1] || 0;
    const prvWeek = wTotals.length > 1 ? wTotals[wTotals.length - 2] || 0 : 0;

    // Day of week totals (0 = Sun .. 6 = Sat)
    const dTotals = [0, 0, 0, 0, 0, 0, 0];
    generatedWeeks.forEach(w => {
      w.forEach((cell, dayIdx) => {
        if (cell.count && !cell.isFuture) {
          dTotals[dayIdx] += cell.count;
        }
      });
    });
    const maxDTot = Math.max(...dTotals, 1);
    const bDayIdx = dTotals.reduce((best, val, i) => val > dTotals[best] ? i : best, 0);

    return {
      weeks: generatedWeeks,
      monthLabels: months,
      totalAttemptsInPeriod: total,
      activeDaysCount: active,
      weeklyTotals: wTotals,
      bestWeekIdx: bestWIdx,
      currentWeekTotal: curWeek,
      prevWeekTotal: prvWeek,
      todayStr: todayIso,
      dayTotals: dTotals,
      maxDayTotal: maxDTot,
      bestDayIdx: bDayIdx,
    };
  }, [heatmapData]);

  const getColor = (count) => {
    if (count === null || count === undefined) return 'bg-transparent border-transparent';
    if (count === 0) return 'bg-[#141312] border-[#1E1C1A]';
    if (count === 1) return 'bg-[#92400E]/60 border-[#92400E]/80';
    if (count <= 2) return 'bg-[#B45309]/70 border-[#B45309]/90';
    if (count <= 4) return 'bg-[#D97706]/80 border-[#D97706]';
    if (count <= 6) return 'bg-[#F59E0B] border-[#FBBF24]';
    return 'bg-[#FCD34D] border-[#FDE68A]';
  };

  if (isLoading) {
    return (
      <div className="panel p-6 animate-pulse border-[#262320]">
        <div className="flex justify-between mb-4">
          <div className="h-4 w-32 shimmer rounded-md" />
          <div className="h-4 w-28 shimmer rounded-md" />
        </div>
        <div className="h-44 shimmer rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-6 border-rose-500/20">
        <h3 className="text-sm font-bold text-[#F5F5F4]">Practice Activity</h3>
        <div className="h-36 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-rose-400 mb-3">Unable to load heatmap.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-ghost text-xs">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const consistencyPct = Math.round((activeDaysCount / 140) * 100);
  const avgPerActiveDay = activeDaysCount > 0 ? (totalAttemptsInPeriod / activeDaysCount).toFixed(1) : '—';

  // Weekly trend — is this week better/worse?
  const weekDelta = currentWeekTotal - prevWeekTotal;
  const weekTrend = weekDelta > 0 ? '↑' : weekDelta < 0 ? '↓' : '→';
  const weekTrendColor = weekDelta > 0 ? 'text-emerald-400' : weekDelta < 0 ? 'text-rose-400' : 'text-[#6B6560]';

  // Sparkline max for scaling
  const sparkMax = Math.max(...weeklyTotals, 1);

  // Consistency grade
  const grade = consistencyPct >= 80 ? 'A' : consistencyPct >= 60 ? 'B' : consistencyPct >= 40 ? 'C' : consistencyPct >= 20 ? 'D' : 'F';
  const gradeColor = consistencyPct >= 60 ? '#10B981' : consistencyPct >= 40 ? '#F59E0B' : '#EF4444';

  const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="panel p-6 border-[#262320]">
      {/* ── Top Header + Summary Badges ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#262320]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            <h3 className="text-base font-bold text-[#F3F4F6] tracking-tight">Practice Activity</h3>
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5"
              style={{
                color: gradeColor,
                background: `${gradeColor}15`,
                border: `1px solid ${gradeColor}35`,
              }}
            >
              Grade {grade} · {consistencyPct}% Consistent
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1 font-mono">
            Rolling 140-day (20-week) consistency & habit tracker
          </p>
        </div>

        {/* Top 3 Quick Stats */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#6B7280] block uppercase tracking-wider">Active Days</span>
            <span className="text-xs font-bold font-mono text-[#F3F4F6]">
              {activeDaysCount} <span className="text-[10px] text-[#6B7280]">/ 140d</span>
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#6B7280] block uppercase tracking-wider">Total Sessions</span>
            <span className="text-xs font-bold font-mono text-[#F97316]">
              {totalAttemptsInPeriod} <span className="text-[10px] text-[#6B7280]">attempts</span>
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
            <span className="text-[10px] font-mono text-[#6B7280] block uppercase tracking-wider">Daily Avg</span>
            <span className="text-xs font-bold font-mono text-[#9CA3AF]">
              {avgPerActiveDay} <span className="text-[10px] text-[#6B7280]">/ active</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content: Heatmap Grid + Practice Habits ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-5">
        {/* Left/Center: Heatmap Grid + Live Readout + Legend (span 7 or 8) */}
        <div className="xl:col-span-8 flex flex-col justify-between overflow-x-auto">
          <div className="min-w-[400px]">
            {/* Month labels */}
            <div className="flex text-[10px] text-[#6B7280] font-mono mb-1.5 pl-6">
              {weeks.map((_, wIndex) => {
                const labelObj = monthLabels.find((m) => m.weekIndex === wIndex && m.name);
                return (
                  <div key={wIndex} className="w-4 mr-0.5 shrink-0 overflow-visible">
                    {labelObj ? labelObj.name : ''}
                  </div>
                );
              })}
            </div>

            {/* Matrix: Days + Cells */}
            <div className="flex items-start">
              <div className="flex flex-col space-y-0.5 text-[9px] text-[#6B7280] font-mono pr-2 select-none">
                {DAY_LABELS.map((d, i) => (
                  <span key={i} className="h-4 leading-none flex items-center">
                    {i % 2 === 0 ? d.charAt(0) : ''}
                  </span>
                ))}
              </div>
              <div className="flex gap-0.5">
                {weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-0.5">
                    {week.map((cell) => {
                      const isHovered = hoveredCell?.date === cell.date;
                      const isToday = cell.date === todayStr;
                      return (
                        <div
                          key={cell.date}
                          onMouseEnter={() => !cell.isFuture && setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => !cell.isFuture && setHoveredCell((prev) => prev?.date === cell.date ? null : cell)}
                          className={`w-4 h-4 rounded border transition-all duration-100 cursor-pointer ${getColor(cell.count)} ${
                            isHovered ? 'ring-1 ring-[#FB923C] scale-125 z-10 shadow-lg shadow-[#F97316]/30' : ''
                          } ${isToday && !isHovered ? 'ring-1 ring-[#F97316]/40' : ''}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar directly below grid: Tightly integrated, NO empty gaps */}
            <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-[11px]">
              {/* Left: Window & Today */}
              <div className="flex items-center gap-3 font-mono text-[#6B7280]">
                <span>140d window</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded border ring-1 ring-[#F97316]/40 bg-[#0E1014] border-white/[0.1] inline-block" />
                  <span>Today</span>
                </span>
              </div>

              {/* Center: Live Hover/Tap Inspection readout */}
              <div className="font-mono text-xs">
                {hoveredCell && hoveredCell.count !== null ? (
                  <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#161920] border border-white/[0.12]">
                    <span className="text-[#F97316] font-bold">
                      {hoveredCell.count === 0 ? '0' : hoveredCell.count} attempt{hoveredCell.count !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[#6B7280]">·</span>
                    <span className="text-[#9CA3AF]">{formatDisplayDate(hoveredCell.date)}</span>
                  </span>
                ) : (
                  <span className="text-[#6B7280] flex items-center gap-1.5 text-[11px]">
                    <span className="text-[#F97316]">◉</span> Tap / hover any cell for details
                  </span>
                )}
              </div>

              {/* Right: Legend */}
              <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
                <span>Less</span>
                {[
                  'bg-[#0D0F13] border-white/[0.07]',
                  'bg-[#92400E]/60 border-[#92400E]/80',
                  'bg-[#B45309]/70 border-[#B45309]/90',
                  'bg-[#D97706]/80 border-[#D97706]',
                  'bg-[#F59E0B] border-[#FBBF24]',
                  'bg-[#FCD34D] border-[#FDE68A]',
                ].map((cls, i) => (
                  <span key={i} className={`w-3 h-3 rounded border ${cls}`} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Practice Habits & Velocity Breakdown */}
        <div className="xl:col-span-4 flex flex-col justify-between gap-3 border-t xl:border-t-0 xl:border-l border-white/[0.08] pt-4 xl:pt-0 xl:pl-6">
          {/* Day of Week Rhythm */}
          <div className="p-3 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">Day-of-Week Rhythm</span>
              {dayTotals[bestDayIdx] > 0 && (
                <span className="text-[10px] font-mono font-semibold text-amber-400">
                  Peak: {DAY_ABBRS[bestDayIdx]} ({dayTotals[bestDayIdx]})
                </span>
              )}
            </div>
            <div className="flex items-end justify-between gap-1.5 h-11 pt-1">
              {dayTotals.map((tot, idx) => {
                const h = Math.max(4, Math.round((tot / maxDayTotal) * 32));
                const isPeak = idx === bestDayIdx && tot > 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm transition-all duration-300"
                      style={{
                        height: `${h}px`,
                        background: isPeak ? '#F97316' : tot > 0 ? '#F9731666' : '#1A1D24',
                      }}
                      title={`${DAY_ABBRS[idx]}: ${tot} attempts`}
                    />
                    <span className={`text-[9px] font-mono ${isPeak ? 'text-[#F97316] font-bold' : 'text-[#6B7280]'}`}>
                      {['S','M','T','W','T','F','S'][idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Consistency Trend Sparkline */}
          <div className="p-3 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">Weekly Output</span>
              <span className={`text-[10px] font-mono font-bold ${weekTrendColor}`}>
                {weekTrend} {Math.abs(weekDelta)} this week
              </span>
            </div>
            <div className="flex items-end gap-0.5 h-7">
              {weeklyTotals.map((wt, i) => {
                const h = Math.max(3, (wt / sparkMax) * 24);
                const isCur = i === weeklyTotals.length - 1;
                const isBest = i === bestWeekIdx && wt > 0;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-200"
                    style={{
                      height: `${h}px`,
                      background: isCur ? '#F97316' : isBest ? '#FCD34D' : wt > 0 ? '#F9731688' : '#181A20',
                    }}
                    title={`Week ${i + 1}: ${wt} sessions`}
                  />
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
