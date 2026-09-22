import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../../theme/colors';
import { Calendar, Zap, Target, Flame } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * YearlyHeatmap: 365-day practice heatmap board with hover tooltips,
 * responsive horizontal scrolling, and integrated habit metrics.
 */
export const YearlyHeatmap = ({ heatmapData = [] }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    if (scrollRef.current && window.innerWidth < 768) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(today.getFullYear() - 1);
  yearAgo.setDate(yearAgo.getDate() + 1);

  // Build a map from date string -> count
  const countMap = {};
  let totalSessions = 0;
  const monthCounts = {};
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  heatmapData.forEach(({ date, count }) => {
    const c = Number(count) || 0;
    countMap[date] = c;
    totalSessions += c;
    const m = date.slice(0, 7); // YYYY-MM
    monthCounts[m] = (monthCounts[m] || 0) + c;
    if (c > 0) {
      const dt = new Date(date + 'T00:00:00');
      dayCounts[dt.getDay()] += c;
    }
  });

  // Summary stats
  const activeDaysCount = heatmapData.filter((h) => h.count > 0).length;
  const consistencyRate = Math.round((activeDaysCount / 365) * 100);
  const weeksCount = Math.max(1, Math.ceil(365 / 7));
  const avgPerWeek = (totalSessions / weeksCount).toFixed(1);

  const busiestMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestMonthLabel = busiestMonth
    ? (() => {
        const [y, m] = busiestMonth[0].split('-');
        return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
      })()
    : '—';
  const busiestMonthCount = busiestMonth ? busiestMonth[1] : 0;

  // Best day of week
  let bestDayIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (dayCounts[i] > dayCounts[bestDayIdx]) bestDayIdx = i;
  }
  const bestDayName = dayCounts[bestDayIdx] > 0 ? DAYS_FULL[bestDayIdx] : '—';
  const bestDaySessions = dayCounts[bestDayIdx];

  // Build weeks array (Sun–Sat columns)
  const weeks = [];
  let current = new Date(yearAgo);
  // Align to Sunday
  current.setDate(current.getDate() - current.getDay());

  while (current <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10);
      const isInRange = current >= yearAgo && current <= today;
      week.push({ date: dateStr, count: isInRange ? countMap[dateStr] || 0 : null });
      current = new Date(current);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const getColor = (count) => {
    if (count === null) return 'transparent';
    if (count === 0) return colors.surface2;
    if (count === 1) return `${colors.easy}40`;
    if (count === 2) return `${colors.easy}70`;
    if (count <= 4) return `${colors.easy}a6`;
    if (count <= 6) return `${colors.easy}d9`;
    return colors.easy;
  };

  // Month label positions
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const firstNonNull = week.find((d) => d.count !== null);
    if (firstNonNull) {
      const dt = new Date(firstNonNull.date);
      if (dt.getDate() <= 7) {
        monthLabels.push({ week: wi, month: MONTHS[dt.getMonth()] });
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* ── Scrollable Heatmap Board ──────────────────────────── */}
      <div ref={scrollRef} className="overflow-x-auto relative rounded-xl bg-surface border border-line p-3 sm:p-4">
        <div ref={containerRef} className="relative select-none" style={{ minWidth: 780 }}>
          {/* Month labels */}
          <div className="flex mb-1.5 ml-8" style={{ gap: 2.5 }}>
            {weeks.map((_, wi) => {
              const lbl = monthLabels.find((m) => m.week === wi);
              return (
                <div key={wi} style={{ width: 12.5, flexShrink: 0 }}>
                  {lbl && <span className="text-xs text-muted font-medium">{lbl.month}</span>}
                </div>
              );
            })}
          </div>

          <div className="flex" style={{ gap: 2.5 }}>
            {/* Day labels */}
            <div className="flex flex-col mr-1.5" style={{ gap: 2.5, paddingTop: 0 }}>
              {DAYS.map((d, i) => (
                <div key={d} style={{ height: 12.5, display: 'flex', alignItems: 'center' }}>
                  {i % 2 === 1 && (
                    <span className="text-xs text-muted w-6 text-right font-medium">{d}</span>
                  )}
                  {i % 2 === 0 && <span className="w-6" />}
                </div>
              ))}
            </div>

            {/* Cells */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: 2.5 }}>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className="heatmap-cell"
                    style={{
                      width: 12.5,
                      height: 12.5,
                      borderRadius: 2.5,
                      background: getColor(cell.count),
                      border: cell.count !== null ? `1px solid ${colors.line}` : 'none',
                      cursor: cell.count !== null ? 'pointer' : 'default',
                      transition: 'transform 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (cell.count !== null && containerRef.current) {
                        e.currentTarget.style.transform = 'scale(1.4)';
                        e.currentTarget.style.zIndex = '10';
                        const containerRect = containerRef.current.getBoundingClientRect();
                        const cellRect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          count: cell.count,
                          date: cell.date,
                          x: cellRect.left - containerRect.left + cellRect.width / 2,
                          y: cellRect.top - containerRect.top,
                        });
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.zIndex = '1';
                      setHoveredCell(null);
                    }}
                    onClick={(e) => {
                      if (cell.count !== null && containerRef.current) {
                        const containerRect = containerRef.current.getBoundingClientRect();
                        const cellRect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell((prev) =>
                          prev?.date === cell.date
                            ? null
                            : {
                                count: cell.count,
                                date: cell.date,
                                x: cellRect.left - containerRect.left + cellRect.width / 2,
                                y: cellRect.top - containerRect.top,
                              }
                        );
                      }
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Floating Single Tooltip: Always on top, no z-index fighting or column clipping */}
          {hoveredCell && (() => {
            const isFlipped = hoveredCell.y < 35;
            const clampedX = Math.max(75, Math.min(hoveredCell.x, 780 - 75));
            const arrowOffset = hoveredCell.x - clampedX;

            return (
              <div
                className="pointer-events-none absolute z-50 px-2.5 py-1.5 rounded-lg text-xs shadow-modal transition-all duration-75"
                style={{
                  left: clampedX,
                  top: isFlipped ? hoveredCell.y + 20 : hoveredCell.y - 36,
                  transform: 'translateX(-50%)',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.line}`,
                  whiteSpace: 'nowrap',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold ${hoveredCell.count > 0 ? 'text-accent' : 'text-muted'}`}>
                    {hoveredCell.count} {hoveredCell.count === 1 ? 'session' : 'sessions'}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-text font-medium">{hoveredCell.date}</span>
                </div>

                {/* Downward/Upward Triangle Arrow */}
                <div
                  className="absolute w-0 h-0"
                  style={{
                    left: `calc(50% + ${arrowOffset}px)`,
                    transform: 'translateX(-50%)',
                    ...(isFlipped
                      ? {
                          bottom: '100%',
                          borderLeft: '5px solid transparent',
                          borderRight: '5px solid transparent',
                          borderBottom: `5px solid ${colors.surface}`,
                        }
                      : {
                          top: '100%',
                          borderLeft: '5px solid transparent',
                          borderRight: '5px solid transparent',
                          borderTop: `5px solid ${colors.surface}`,
                        }),
                  }}
                />
              </div>
            );
          })()}

          {/* Legend Strip */}
          <div className="flex flex-wrap items-center justify-between mt-3.5 pt-2.5 border-t border-line sm:ml-8 ml-1 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Less</span>
              {[colors.surface2, `${colors.easy}40`, `${colors.easy}70`, `${colors.easy}a6`, colors.easy].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2.5,
                    background: c,
                    border: `1px solid ${colors.line}`,
                  }}
                />
              ))}
              <span className="text-xs text-muted">More</span>
            </div>
            <span className="text-xs text-muted">
              Tap or hover any square to view date & practice sessions
            </span>
          </div>
        </div>
      </div>

      {/* ── Integrated Heatmap Analytics Bar ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted" />
            Active Days
          </span>
          <div className="my-1">
            <span className="text-xl font-semibold tabular-nums text-text">{activeDaysCount}</span>
            <span className="text-xs text-muted"> / 365d</span>
          </div>
          <span className="text-xs text-muted">{consistencyRate}% annual habit</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-medium" />
            Practice Pace
          </span>
          <div className="my-1">
            <span className="text-xl font-semibold tabular-nums text-text">{avgPerWeek}</span>
            <span className="text-xs text-muted"> sess/wk</span>
          </div>
          <span className="text-xs text-muted">{totalSessions} sessions logged</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-medium flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-easy" />
            Prime Practice Day
          </span>
          <div className="my-1">
            <span className="text-xl font-semibold text-easy truncate block">{bestDayName}</span>
          </div>
          <span className="text-xs text-muted">{bestDaySessions} sessions logged</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-medium flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-accent" />
            Peak Month
          </span>
          <div className="my-1">
            <span className="text-xl font-semibold text-accent truncate block">{busiestMonthLabel}</span>
          </div>
          <span className="text-xs text-muted">{busiestMonthCount} peak sessions</span>
        </div>
      </div>
    </div>
  );
};

export default YearlyHeatmap;
