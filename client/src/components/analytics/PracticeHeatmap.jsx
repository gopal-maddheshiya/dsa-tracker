import React, { useMemo, useState } from 'react';

const toIsoDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PracticeHeatmap = ({ heatmapData = [], isLoading = false, error = null, onRetry }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const { weeks, monthLabels, totalAttemptsInPeriod, activeDaysCount } = useMemo(() => {
    const countMap = {};
    let total = 0, active = 0;
    heatmapData.forEach((item) => {
      const count = Number(item.count) || 0;
      countMap[item.date] = count;
      total += count;
      if (count > 0) active++;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (20 * 7 - 1));
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const generatedWeeks = [];
    const months = [];
    let lastMonth = -1;
    let currentWeek = [];
    const iter = new Date(startDate);

    while (iter <= today || currentWeek.length > 0) {
      const iso = toIsoDate(iter);
      const isFuture = iter > today;
      const count = countMap[iso] || 0;
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
    return { weeks: generatedWeeks, monthLabels: months, totalAttemptsInPeriod: total, activeDaysCount: active };
  }, [heatmapData]);

  const getColor = (count) => {
    if (count === null || count === undefined) return 'bg-transparent border-transparent';
    if (count === 0) return 'bg-[#211F1D] border-[#2E2A27]';
    if (count <= 2) return 'bg-[#F97316]/25 border-[#F97316]/40';
    if (count <= 4) return 'bg-[#F97316]/65 border-[#F97316]/80';
    return 'bg-[#F97316] border-[#FB923C]';
  };

  if (isLoading) {
    return (
      <div className="panel p-5 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-4 w-28 shimmer rounded-md" />
          <div className="h-4 w-24 shimmer rounded-md" />
        </div>
        <div className="h-36 shimmer rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F4]">Practice Activity</h3>
        <div className="h-36 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-rose-400 mb-3">Unable to load heatmap.</p>
          {onRetry && <button onClick={onRetry} type="button" className="btn-ghost">Retry</button>}
        </div>
      </div>
    );
  }

  const consistencyPct = Math.round((activeDaysCount / 140) * 100);
  const avgPerActiveDay = activeDaysCount > 0 ? (totalAttemptsInPeriod / activeDaysCount).toFixed(1) : '—';

  return (
    <div className="panel p-5">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left stats */}
        <div className="lg:w-52 shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2E2A27] pb-5 lg:pb-0 lg:pr-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
              <h3 className="text-sm font-semibold text-[#F5F5F4]">Practice Activity</h3>
            </div>
            <p className="text-xs text-[#78716C] mb-5">20-week consistency history</p>

            <div className="space-y-2.5">
              {[
                { label: 'Active Days', value: activeDaysCount, sub: `/ 140d · ${consistencyPct}%`, color: 'text-[#F5F5F4]' },
                { label: 'Period Attempts', value: totalAttemptsInPeriod, sub: 'total', color: 'text-[#F97316]' },
                { label: 'Avg / Active Day', value: avgPerActiveDay, sub: 'attempts', color: 'text-[#A8A29E]' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-[#141312] border border-[#2E2A27]">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[#78716C]">{label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-base font-bold font-mono leading-none ${color}`}>{value}</span>
                    <span className="text-[10px] text-[#78716C] font-mono">{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2E2A27]">
            {hoveredCell && hoveredCell.count !== null ? (
              <div>
                <div className="text-[11px] font-medium text-[#A8A29E]">{formatDisplayDate(hoveredCell.date)}</div>
                <div className="text-sm font-mono font-bold text-[#F97316] mt-0.5">
                  {hoveredCell.count} attempt{hoveredCell.count !== 1 ? 's' : ''}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#78716C]">Hover any cell for details</p>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="min-w-[420px]">
            <div className="flex text-[10px] text-[#78716C] font-mono mb-1.5 pl-7">
              {weeks.map((_, wIndex) => {
                const labelObj = monthLabels.find(m => m.weekIndex === wIndex && m.name);
                return (
                  <div key={wIndex} className="w-4 mr-0.5 shrink-0 overflow-visible">
                    {labelObj ? labelObj.name : ''}
                  </div>
                );
              })}
            </div>

            <div className="flex items-start">
              <div className="flex flex-col space-y-0.5 text-[9px] text-[#78716C] font-mono pr-2 select-none">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <span key={i} className="h-4 leading-none flex items-center">{d}</span>
                ))}
              </div>
              <div className="flex gap-0.5">
                {weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-0.5">
                    {week.map((cell) => {
                      const isHovered = hoveredCell?.date === cell.date;
                      return (
                        <div
                          key={cell.date}
                          onMouseEnter={() => !cell.isFuture && setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-4 h-4 rounded border transition-all duration-100 cursor-default ${getColor(cell.count)} ${isHovered ? 'ring-1 ring-[#FB923C] scale-110 z-10' : ''}`}
                          title={!cell.isFuture ? `${formatDisplayDate(cell.date)}: ${cell.count} attempt${cell.count !== 1 ? 's' : ''}` : ''}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-[#78716C]">
              <span className="font-mono">Rolling 140-day window</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                {['bg-[#211F1D] border-[#2E2A27]','bg-[#F97316]/25 border-[#F97316]/40','bg-[#F97316]/65 border-[#F97316]/80','bg-[#F97316] border-[#FB923C]'].map((cls, i) => (
                  <span key={i} className={`w-3 h-3 rounded border ${cls}`} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeHeatmap;
