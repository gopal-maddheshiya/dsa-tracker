import React, { useState, useMemo } from 'react';
import {
  ComposedChart, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Flame, TrendingUp, Zap, BarChart3 } from 'lucide-react';
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

/* ── Custom Milestone / Peak Dot ─────────────────────────────────── */
const CustomPeakDot = ({ cx, cy, payload, maxVal }) => {
  if (!cx || !cy || !payload) return null;
  const isPeak = payload.solved === maxVal && maxVal > 0;
  if (!isPeak) return null;

  return (
    <g key={`peak-dot-${payload.date}`}>
      <circle cx={cx} cy={cy} r={8} fill={`${THEME_COLORS.accent}33`} />
      <circle cx={cx} cy={cy} r={5} fill={THEME_COLORS.accent} stroke={THEME_COLORS.bg} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={2} fill={THEME_COLORS.text} />
    </g>
  );
};

/* ── Custom Tooltip ──────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl p-3.5 shadow-dropdown border border-line text-xs min-w-[180px] bg-surface text-text">
        <div className="flex items-center justify-between pb-2 border-b border-line mb-2.5">
          <span className="text-xs font-medium text-muted">
            {formatFullDate(label || data.date)}
          </span>
          {data.isPeak && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-accent/12 text-accent font-semibold border border-accent/25">
              PEAK
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-muted font-medium">Daily Solved</span>
            </div>
            <span className="font-semibold text-text text-sm tabular-nums">
              +{data.solved}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-line">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-muted font-medium">Trajectory Total</span>
            </div>
            <span className="font-semibold text-success text-sm tabular-nums">
              {data.cumulative}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SolveTrendChart = ({ trendData = [], isLoading = false, error = null, onRetry, className = '' }) => {
  // Mode: 'hybrid' (Dual volume + trajectory) | 'cumulative' (Growth curve) | 'daily' (Volume bars)
  const [chartMode, setChartMode] = useState('hybrid');
  // Range: '14D' | '30D' | 'all'
  const [range, setRange] = useState('all');
  // Live Scrubbing point
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Enrich data with cumulative running total and peak day flags
  const rawEnriched = useMemo(() => {
    let running = 0;
    return (trendData || []).map((item) => {
      const count = Number(item.solved !== undefined ? item.solved : (item.solvedCount ?? 0)) || 0;
      running += count;
      return {
        date: item.date,
        solved: count,
        cumulative: running,
      };
    });
  }, [trendData]);

  // Filter based on range
  const displayData = useMemo(() => {
    let slice = rawEnriched;
    if (range === '14D') slice = rawEnriched.slice(-14);
    else if (range === '30D') slice = rawEnriched.slice(-30);

    const maxVal = slice.length > 0 ? Math.max(...slice.map((d) => d.solved)) : 0;
    return slice.map((d) => ({
      ...d,
      isPeak: maxVal > 0 && d.solved === maxVal,
    }));
  }, [rawEnriched, range]);

  const totalPeriodSolved = useMemo(() => {
    return displayData.reduce((acc, curr) => acc + curr.solved, 0);
  }, [displayData]);

  const maxDaySolved = useMemo(() => {
    return displayData.length > 0 ? Math.max(...displayData.map((d) => d.solved)) : 0;
  }, [displayData]);

  const peakPoint = useMemo(() => {
    return displayData.find((d) => d.isPeak && d.solved > 0);
  }, [displayData]);

  const avgDailySolved = useMemo(() => {
    return displayData.length > 0
      ? (totalPeriodSolved / displayData.length).toFixed(1)
      : '0.0';
  }, [displayData, totalPeriodSolved]);

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
      className={`panel p-6 relative overflow-hidden transition-all flex flex-col justify-between h-full ${className}`}
    >
      {/* ── Top Header & Interactive Scrubber ──────────────────────── */}
      <div className="space-y-3 mb-5">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
              <h3 className="text-base font-semibold text-text tracking-tight shrink-0">
                Solve Velocity
              </h3>

              {/* Live Scrubbing Badge Indicator */}
              {hoveredPoint ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent/12 border border-accent/25 text-accent text-xs animate-fadeIn font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {formatFullDate(hoveredPoint.date)}
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-surface-2 border border-line text-muted shrink-0">
                  <span className="sm:hidden">{displayData.length} pts</span>
                  <span className="hidden sm:inline">{displayData.length} timeline points</span>
                </span>
              )}

              {hoveredPoint?.isPeak && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/12 text-accent border border-accent/25 text-xs font-semibold shrink-0">
                  <Flame className="w-3 h-3 text-accent fill-accent/20" />
                  Peak
                </span>
              )}
            </div>

            {/* Period Total */}
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-xs uppercase text-muted font-medium">Total</span>
              <span className="text-lg font-bold text-accent leading-none tabular-nums">
                {totalPeriodSolved}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted leading-relaxed mt-1">
            {hoveredPoint ? (
              <span>
                Scrubbing: <strong className="text-text">+{hoveredPoint.solved} solves</strong> · <strong className="text-success">{hoveredPoint.cumulative} cumulative</strong>
              </span>
            ) : chartMode === 'hybrid' ? (
              'Daily output bars grounded with trajectory curve'
            ) : chartMode === 'cumulative' ? (
              'Cumulative growth trajectory over time'
            ) : (
              'Discrete problem solve volume by day'
            )}
          </p>
        </div>

        {/* Tier 2: Control Toggles (Mode + Range) */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-line flex-wrap">
          <div className="flex items-center justify-between gap-2 w-full flex-wrap">
            {/* View mode toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line">
              <button
                type="button"
                onClick={() => setChartMode('hybrid')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  chartMode === 'hybrid'
                    ? 'bg-surface text-text border border-line shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Hybrid</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('cumulative')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  chartMode === 'cumulative'
                    ? 'bg-surface text-text border border-line shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Growth</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('daily')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  chartMode === 'daily'
                    ? 'bg-surface text-text border border-line shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                <BarChart3 className="w-3 h-3" />
                <span>Daily</span>
              </button>
            </div>

            {/* Time horizon pills */}
            <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line text-xs">
              {['14D', '30D', 'all'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all uppercase ${
                    range === r
                      ? 'bg-surface text-text font-semibold border border-line'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart Rendering Canvas ─────────────────────────────────── */}
      {displayData.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-center border border-dashed border-line rounded-xl">
          <TrendingUp className="w-8 h-8 text-accent mb-2" />
          <p className="text-xs text-muted">No solved activity recorded in this period.</p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'hybrid' ? (
              <ComposedChart
                data={displayData}
                margin={{ top: 16, right: 12, left: -20, bottom: 4 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  <linearGradient id="growthGradPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={THEME_COLORS.accent} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={THEME_COLORS.accent} stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke={THEME_COLORS.line}
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.6}
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
                  minTickGap={45}
                />

                {/* Primary Y-Axis for Cumulative Spline */}
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

                {/* Secondary Hidden Y-Axis for Volume Bars */}
                <YAxis
                  yAxisId="daily"
                  orientation="right"
                  hide
                  domain={[0, Math.max(maxDaySolved * 2.8, 4)]}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: THEME_COLORS.line, strokeDasharray: '3 3', strokeWidth: 1 }}
                />

                {/* Volume Columns in Background */}
                <Bar
                  yAxisId="daily"
                  dataKey="solved"
                  fill={THEME_COLORS.surface2}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                  animationDuration={700}
                />

                {/* Cumulative Trajectory Spline */}
                <Area
                  yAxisId="cumulative"
                  type="monotone"
                  dataKey="cumulative"
                  stroke={THEME_COLORS.accent}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#growthGradPremium)"
                  dot={<CustomPeakDot maxVal={maxDaySolved} />}
                  activeDot={{
                    r: 5,
                    fill: THEME_COLORS.accent,
                    stroke: THEME_COLORS.surface,
                    strokeWidth: 2,
                  }}
                  animationDuration={900}
                />
              </ComposedChart>
            ) : chartMode === 'cumulative' ? (
              <AreaChart
                data={displayData}
                margin={{ top: 16, right: 12, left: -20, bottom: 4 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  <linearGradient id="growthGradPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={THEME_COLORS.accent} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={THEME_COLORS.accent} stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke={THEME_COLORS.line}
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.6}
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
                  minTickGap={45}
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
                  content={<CustomTooltip />}
                  cursor={{ stroke: THEME_COLORS.line, strokeDasharray: '3 3', strokeWidth: 1 }}
                />

                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke={THEME_COLORS.accent}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#growthGradPremium)"
                  dot={<CustomPeakDot maxVal={maxDaySolved} />}
                  activeDot={{
                    r: 5,
                    fill: THEME_COLORS.accent,
                    stroke: THEME_COLORS.surface,
                    strokeWidth: 2,
                  }}
                  animationDuration={900}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={displayData}
                margin={{ top: 16, right: 12, left: -20, bottom: 4 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <CartesianGrid
                  stroke={THEME_COLORS.line}
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.6}
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
                  minTickGap={45}
                />

                <YAxis
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: THEME_COLORS.muted, fontSize: 10 }}
                  domain={[0, Math.max(maxDaySolved + 1, 3)]}
                />

                {Number(avgDailySolved) > 0 && (
                  <ReferenceLine
                    y={Number(avgDailySolved)}
                    stroke={THEME_COLORS.accent}
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                  />
                )}

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />

                <Bar
                  dataKey="solved"
                  fill={THEME_COLORS.accent}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                  animationDuration={800}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Footer KPI Strip ──────────────────────────────────────── */}
      {displayData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-3.5 border-t border-line text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-muted font-medium">
                {chartMode === 'hybrid'
                  ? 'Dual Mode'
                  : chartMode === 'cumulative'
                    ? 'Cumulative Trajectory'
                    : 'Daily Output'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-muted font-medium">Velocity:</span>
              <span className="font-semibold text-text tabular-nums">{avgDailySolved} / day</span>
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

          <div className="text-xs text-muted">
            Range: {formatDateTick(displayData[0]?.date)} — {formatDateTick(displayData[displayData.length - 1]?.date)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolveTrendChart;
