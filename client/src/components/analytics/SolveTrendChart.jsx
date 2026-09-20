import React, { useState, useMemo } from 'react';
import {
  ComposedChart, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { TrendingUp, Zap, BarChart3, Flame, Calendar } from 'lucide-react';
import { THEME_COLORS } from '../../theme/colors';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDateTick = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const month = MONTH_NAMES[parseInt(parts[1], 10) - 1];
    const day = parseInt(parts[2], 10);
    return `${month} ${day}`;
  }
  return dateStr;
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

/* ── Custom Tooltip ──────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, maxDaySolved }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const isPeak = data.solved > 0 && data.solved === maxDaySolved;

  return (
    <div className="rounded-xl p-3 shadow-xl border border-line text-xs min-w-[190px] bg-surface/95 backdrop-blur-md text-text">
      <div className="flex items-center justify-between pb-2 border-b border-line mb-2">
        <span className="text-xs font-semibold text-text">
          {formatFullDate(label || data.date)}
        </span>
        {isPeak && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-bold border border-accent/30">
            PEAK DAY
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-muted flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-easy" />
            Daily Solved
          </span>
          <span className="font-bold tabular-nums text-text">
            {data.solved > 0 ? `+${data.solved}` : '0'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-line/60">
          <span className="text-muted flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Total Trajectory
          </span>
          <span className="font-bold tabular-nums text-accent">
            {data.cumulative}
          </span>
        </div>
      </div>
    </div>
  );
};

const SolveTrendChart = ({ trendData = [], isLoading = false, error = null, onRetry, className = '' }) => {
  // Mode: 'hybrid' (Dual volume + trajectory) | 'cumulative' (Growth curve) | 'daily' (Volume bars)
  const [chartMode, setChartMode] = useState('hybrid');
  // Range: '14D' | '30D' | '90D' | 'all'
  const [range, setRange] = useState('all');
  // Live Scrubbing point
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // ── 1. Construct Continuous Chronological Time-Series ───────────────
  const { filledData, periodSolves, maxDaySolved, peakPoint, totalDaysCount, dateRangeText } = useMemo(() => {
    if (!trendData || trendData.length === 0) {
      return {
        filledData: [],
        periodSolves: 0,
        maxDaySolved: 0,
        peakPoint: null,
        totalDaysCount: 0,
        dateRangeText: '',
      };
    }

    // Build lookup map of solved count by date ISO string
    const dateMap = new Map();
    let earliestStr = '9999-99-99';
    let latestStr = '0000-00-00';

    trendData.forEach((item) => {
      const d = item.date;
      const count = Number(item.solved !== undefined ? item.solved : (item.solvedCount ?? 0)) || 0;
      if (d) {
        dateMap.set(d, count);
        if (d < earliestStr) earliestStr = d;
        if (d > latestStr) latestStr = d;
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    if (todayStr > latestStr) latestStr = todayStr;

    // Determine target start and end dates based on range filter
    const endDate = new Date(latestStr + 'T00:00:00');
    let startDate = new Date(earliestStr + 'T00:00:00');

    if (range === '14D') {
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 13);
    } else if (range === '30D') {
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 29);
    } else if (range === '90D') {
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 89);
    }

    // Pre-calculate running cumulative total prior to startDate
    let runningCumulative = 0;
    const startDateStr = startDate.toISOString().slice(0, 10);
    trendData.forEach((item) => {
      if (item.date && item.date < startDateStr) {
        runningCumulative += Number(item.solved !== undefined ? item.solved : (item.solvedCount ?? 0)) || 0;
      }
    });

    // Fill every continuous calendar day
    const result = [];
    let pSolves = 0;
    let maxSolved = 0;
    let peakItem = null;

    const iter = new Date(startDate);
    while (iter <= endDate) {
      const iso = iter.toISOString().slice(0, 10);
      const count = dateMap.get(iso) || 0;
      runningCumulative += count;
      pSolves += count;

      if (count > maxSolved) {
        maxSolved = count;
        peakItem = { date: iso, count };
      }

      result.push({
        date: iso,
        solved: count,
        cumulative: runningCumulative,
      });

      iter.setDate(iter.getDate() + 1);
    }

    const rangeLabel = `${formatDateTick(result[0]?.date)} — ${formatDateTick(result[result.length - 1]?.date)}`;

    return {
      filledData: result,
      periodSolves: pSolves,
      maxDaySolved: maxSolved,
      peakPoint: peakItem,
      totalDaysCount: result.length,
      dateRangeText: rangeLabel,
    };
  }, [trendData, range]);

  // Derived velocity rates
  const dailyPace = totalDaysCount > 0 ? (periodSolves / totalDaysCount).toFixed(2) : '0.00';
  const weeklyPace = totalDaysCount > 0 ? ((periodSolves / totalDaysCount) * 7).toFixed(1) : '0.0';

  // Hover scrub event handler
  const handleMouseMove = (state) => {
    if (state && state.activePayload && state.activePayload.length) {
      setHoveredPoint(state.activePayload[0].payload);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  if (isLoading) {
    return (
      <div className={`panel p-6 animate-pulse border-line flex flex-col justify-between h-full ${className}`}>
        <div className="flex justify-between items-center mb-5">
          <div className="space-y-2">
            <div className="h-4 w-32 shimmer rounded-md" />
            <div className="h-3 w-48 shimmer rounded-md" />
          </div>
          <div className="h-8 w-24 shimmer rounded-xl" />
        </div>
        <div className="h-60 shimmer rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`panel p-6 border-danger/25 text-center flex flex-col justify-between h-full ${className}`}>
        <h3 className="text-sm font-semibold text-text mb-2">Solve Velocity</h3>
        <p className="text-xs text-danger mb-4">Unable to load trend trajectory.</p>
        {onRetry && (
          <button onClick={onRetry} type="button" className="btn-secondary text-xs">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`panel p-4 sm:p-6 relative overflow-hidden transition-all flex flex-col justify-between h-full ${className}`}
    >
      {/* ── Top Header & KPI Summary ───────────────────────────────── */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <TrendingUp className="w-4 h-4 text-accent shrink-0" />
              <h3 className="text-base font-semibold text-text tracking-tight shrink-0">
                Solve Velocity
              </h3>

              {/* Live Scrubbing Badge Indicator */}
              {hoveredPoint ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-accent/12 border border-accent/25 text-accent text-xs animate-fadeIn font-medium">
                  {formatFullDate(hoveredPoint.date)}
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-surface-2 border border-line text-muted shrink-0">
                  {totalDaysCount} calendar days
                </span>
              )}
            </div>

            {/* Header Telemetry Pills */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="px-2.5 py-1 rounded-lg bg-surface-2 border border-line flex items-center gap-1.5 text-xs">
                <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Solved</span>
                <span className="font-bold tabular-nums text-accent">{periodSolves}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-surface-2 border border-line flex items-center gap-1.5 text-xs">
                <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Pace</span>
                <span className="font-bold tabular-nums text-text">{weeklyPace} <span className="text-[10px] text-muted font-normal">/wk</span></span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted leading-relaxed mt-1">
            {hoveredPoint ? (
              <span>
                Scrubbing: <strong className="text-text">+{hoveredPoint.solved} solved</strong> · <strong className="text-accent">{hoveredPoint.cumulative} total</strong>
              </span>
            ) : chartMode === 'hybrid' ? (
              'Continuous timeline showing daily output volume and cumulative growth trajectory'
            ) : chartMode === 'cumulative' ? (
              'Cumulative solved problem growth trajectory across calendar timeline'
            ) : (
              'Daily problem solve volume by calendar date'
            )}
          </p>
        </div>

        {/* ── Mode & Range Toggles ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-line flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line text-xs">
            <button
              type="button"
              onClick={() => setChartMode('hybrid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                chartMode === 'hybrid'
                  ? 'bg-surface text-accent font-semibold shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
              title="Combined Daily Output and Growth Curve"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Combined</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('cumulative')}
              className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                chartMode === 'cumulative'
                  ? 'bg-surface text-accent font-semibold shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
              title="Cumulative Growth Trajectory Only"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Trajectory</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('daily')}
              className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                chartMode === 'daily'
                  ? 'bg-surface text-accent font-semibold shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
              title="Daily Solved Volume Only"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Daily</span>
            </button>
          </div>

          {/* Lookback Range Selectors */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line text-xs">
            {[
              { label: '14D', value: '14D' },
              { label: '30D', value: '30D' },
              { label: '90D', value: '90D' },
              { label: 'ALL', value: 'all' },
            ].map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  range === value
                    ? 'bg-surface text-accent font-semibold shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chart Rendering Canvas ─────────────────────────────────── */}
      {filledData.length === 0 ? (
        <div className="h-[220px] sm:h-72 flex flex-col items-center justify-center text-center border border-dashed border-line rounded-xl">
          <TrendingUp className="w-8 h-8 text-accent mb-2" />
          <p className="text-xs text-muted">No solved activity recorded in this period.</p>
        </div>
      ) : (
        <div className="h-[220px] sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'hybrid' ? (
              <ComposedChart
                data={filledData}
                margin={{ top: 16, right: 12, left: -20, bottom: 4 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  <linearGradient id="growthGradPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={THEME_COLORS.accent} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={THEME_COLORS.accent} stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke={THEME_COLORS.line}
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey="date"
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDateTick}
                  dy={10}
                  tick={{ fill: THEME_COLORS.muted, fontSize: 10 }}
                  minTickGap={40}
                />

                {/* Primary Left Y-Axis for Cumulative Growth */}
                <YAxis
                  yAxisId="cumulative"
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: THEME_COLORS.muted, fontSize: 10 }}
                  domain={[0, 'auto']}
                />

                {/* Secondary Right Y-Axis for Daily Volume (Grounded in lower third) */}
                <YAxis
                  yAxisId="daily"
                  orientation="right"
                  hide
                  domain={[0, Math.max(maxDaySolved * 3.5, 6)]}
                />

                <Tooltip
                  content={<CustomTooltip maxDaySolved={maxDaySolved} />}
                  cursor={{ stroke: THEME_COLORS.line, strokeDasharray: '3 3', strokeWidth: 1 }}
                />

                {/* Daily Output Bars in harmonious semi-transparent teal */}
                <Bar
                  yAxisId="daily"
                  dataKey="solved"
                  fill={THEME_COLORS.easy}
                  fillOpacity={0.45}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={12}
                  animationDuration={600}
                />

                {/* Cumulative Growth Curve */}
                <Area
                  yAxisId="cumulative"
                  type="monotone"
                  dataKey="cumulative"
                  stroke={THEME_COLORS.accent}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#growthGradPremium)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: THEME_COLORS.accent,
                    stroke: THEME_COLORS.bg,
                    strokeWidth: 2,
                  }}
                  animationDuration={800}
                />
              </ComposedChart>
            ) : chartMode === 'cumulative' ? (
              <AreaChart
                data={filledData}
                margin={{ top: 16, right: 12, left: -20, bottom: 4 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  <linearGradient id="growthGradPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={THEME_COLORS.accent} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={THEME_COLORS.accent} stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke={THEME_COLORS.line}
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey="date"
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDateTick}
                  dy={10}
                  tick={{ fill: THEME_COLORS.muted, fontSize: 10 }}
                  minTickGap={40}
                />

                <YAxis
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: THEME_COLORS.muted, fontSize: 10 }}
                  domain={[0, 'auto']}
                />

                <Tooltip
                  content={<CustomTooltip maxDaySolved={maxDaySolved} />}
                  cursor={{ stroke: THEME_COLORS.line, strokeDasharray: '3 3', strokeWidth: 1 }}
                />

                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke={THEME_COLORS.accent}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#growthGradPremium)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: THEME_COLORS.accent,
                    stroke: THEME_COLORS.bg,
                    strokeWidth: 2,
                  }}
                  animationDuration={800}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={filledData}
                margin={{ top: 16, right: 12, left: -20, bottom: 4 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <CartesianGrid
                  stroke={THEME_COLORS.line}
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey="date"
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDateTick}
                  dy={10}
                  tick={{ fill: THEME_COLORS.muted, fontSize: 10 }}
                  minTickGap={40}
                />

                <YAxis
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: THEME_COLORS.muted, fontSize: 10 }}
                  domain={[0, Math.max(maxDaySolved + 1, 4)]}
                />

                {Number(dailyPace) > 0 && (
                  <ReferenceLine
                    y={Number(dailyPace)}
                    stroke={THEME_COLORS.accent}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                )}

                <Tooltip
                  content={<CustomTooltip maxDaySolved={maxDaySolved} />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />

                <Bar
                  dataKey="solved"
                  fill={THEME_COLORS.accent}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                  animationDuration={600}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Footer KPI Strip ──────────────────────────────────────── */}
      {filledData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-3.5 border-t border-line text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-muted font-medium">
                {chartMode === 'hybrid'
                  ? 'Combined View'
                  : chartMode === 'cumulative'
                    ? 'Cumulative Trajectory'
                    : 'Daily Solves'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-muted font-medium">Velocity:</span>
              <span className="font-semibold text-text tabular-nums">{dailyPace} / day</span>
              <span className="text-[11px] text-muted">({weeklyPace}/wk)</span>
            </div>

            {maxDaySolved > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted font-medium">Peak:</span>
                <span className="font-semibold text-accent tabular-nums">
                  {maxDaySolved} solves
                  {peakPoint?.date && (
                    <span className="text-xs text-muted font-normal ml-1">
                      ({formatDateTick(peakPoint.date)})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-muted font-medium">
            {dateRangeText}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolveTrendChart;

