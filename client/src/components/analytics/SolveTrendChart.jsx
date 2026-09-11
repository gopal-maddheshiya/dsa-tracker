import React, { useState, useMemo } from 'react';
import {
  ComposedChart, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Flame, TrendingUp, Zap, BarChart3 } from 'lucide-react';

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
      {/* Outer ambient beacon pulse */}
      <circle cx={cx} cy={cy} r={10} fill="rgba(249, 115, 22, 0.2)" />
      <circle cx={cx} cy={cy} r={6} fill="#F97316" stroke="#141312" strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={2} fill="#FFFFFF" />
    </g>
  );
};

/* ── Custom Glassmorphic Tooltip ──────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="rounded-2xl p-3.5 shadow-2xl border border-white/[0.12] text-xs min-w-[180px] backdrop-blur-xl transition-all"
        style={{
          background: 'linear-gradient(165deg, rgba(20, 23, 28, 0.98), rgba(13, 15, 19, 0.98))',
          boxShadow: '0 16px 36px rgba(0,0,0,0.75), inset 0 1px 0 0 rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-2.5">
          <span className="text-[10px] font-mono font-medium text-[#9CA3AF]">
            {formatFullDate(label || data.date)}
          </span>
          {data.isPeak && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              PEAK
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F97316] shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
              <span className="text-[#9CA3AF] font-medium">Daily Solved</span>
            </div>
            <span className="font-mono font-bold text-[#F3F4F6] text-sm">
              +{data.solved}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
              <span className="text-[#9CA3AF] font-medium">Trajectory Total</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {data.cumulative}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SolveTrendChart = ({ trendData = [], isLoading = false, error = null, onRetry }) => {
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
      <div className="panel p-6 animate-pulse border-[#262320]">
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
      <div className="panel p-6 border-rose-500/20 text-center">
        <h3 className="text-sm font-bold text-[#F5F5F4] mb-2">Solve Velocity</h3>
        <p className="text-xs text-rose-400 mb-4">Unable to load trend trajectory.</p>
        {onRetry && (
          <button onClick={onRetry} type="button" className="btn-ghost text-xs">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="panel p-6 relative overflow-hidden transition-all"
      style={{
        background: 'radial-gradient(ellipse 75% 65% at 85% 0%, rgba(249,115,22,0.08) 0%, transparent 60%), linear-gradient(180deg, #171614 0%, #131211 100%)',
      }}
    >
      {/* ── Top Header & Interactive Scrubber ──────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-[#F3F4F6] tracking-tight">
              Solve Velocity
            </h3>

            {/* Live Scrubbing Badge Indicator */}
            {hoveredPoint ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] animate-fadeIn">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {formatFullDate(hoveredPoint.date)}
              </span>
            ) : (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.08] text-[#9CA3AF]">
                {displayData.length} timeline points
              </span>
            )}

            {hoveredPoint?.isPeak && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                Peak Day
              </span>
            )}
          </div>

          {/* Subtitle / Scrubber readout */}
          <p className="text-xs text-[#9CA3AF] mt-1 font-mono">
            {hoveredPoint ? (
              <span className="text-[#9CA3AF]">
                Scrubbing: <strong className="text-[#F3F4F6]">+{hoveredPoint.solved} solves</strong> on this day • <strong className="text-emerald-400">{hoveredPoint.cumulative} cumulative</strong> total
              </span>
            ) : chartMode === 'hybrid' ? (
              'Dual View • Daily output bars grounded with cumulative trajectory curve'
            ) : chartMode === 'cumulative' ? (
              'Trajectory View • Continuous upward momentum'
            ) : (
              'Daily Output View • Discrete problem volume by day'
            )}
          </p>
        </div>

        {/* Action Controls & KPI Badges */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 sm:gap-3">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setChartMode('hybrid')}
              title="Dual Daily Volume + Cumulative Curve"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                chartMode === 'hybrid'
                  ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/20'
                  : 'text-[#6B7280] hover:text-[#F3F4F6]'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Hybrid</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('cumulative')}
              title="Cumulative Growth Trajectory"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                chartMode === 'cumulative'
                  ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/20'
                  : 'text-[#6B7280] hover:text-[#F3F4F6]'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Growth</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('daily')}
              title="Discrete Daily Solve Bars"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                chartMode === 'daily'
                  ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/20'
                  : 'text-[#6B7280] hover:text-[#F3F4F6]'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Daily</span>
            </button>
          </div>

          {/* Time range pills */}
          <div className="flex items-center p-1 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
            {['14D', '30D', 'all'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all ${
                  range === r
                    ? 'bg-[#1C2026] text-[#F3F4F6] border border-white/[0.12]'
                    : 'text-[#6B7280] hover:text-[#F3F4F6]'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Dynamic Period / Hovered KPI */}
          <div className="text-right pl-2 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280] block">
              {hoveredPoint ? 'At Point' : 'Period Total'}
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-[#F97316] leading-none block mt-0.5">
              {hoveredPoint ? hoveredPoint.cumulative : totalPeriodSolved}
            </span>
          </div>
        </div>
      </div>

      {/* ── Chart Rendering Canvas ─────────────────────────────────── */}
      {displayData.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center text-center border border-dashed border-white/[0.08] rounded-2xl">
          <TrendingUp className="w-8 h-8 text-[#F97316] mb-2" />
          <p className="text-xs text-[#6B7280]">No solved activity recorded in this period.</p>
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
                  {/* Radiant orange glow underfill */}
                  <linearGradient id="growthGradPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.4} />
                    <stop offset="60%" stopColor="#F97316" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Grounded dual volume bar gradient */}
                  <linearGradient id="hybridBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB923C" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0.15} />
                  </linearGradient>

                  {/* Active node glow filter */}
                  <filter id="areaGlowFilter" x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation="3.5" result="glowBlur" />
                    <feMerge>
                      <feMergeNode in="glowBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.7}
                />

                <XAxis
                  dataKey="date"
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDateTick}
                  dy={10}
                  tick={{ fill: '#6B7280', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
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
                  tick={{ fill: '#6B7280', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
                  domain={[0, 'auto']}
                />

                {/* Secondary Hidden Y-Axis for Volume Bars (anchored low in the bottom 35%) */}
                <YAxis
                  yAxisId="daily"
                  orientation="right"
                  hide
                  domain={[0, Math.max(maxDaySolved * 2.8, 4)]}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeDasharray: '3 3', strokeWidth: 1 }}
                />

                {/* Volume Columns in Background */}
                <Bar
                  yAxisId="daily"
                  dataKey="solved"
                  fill="url(#hybridBarGrad)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                  animationDuration={700}
                />

                {/* Cumulative Glowing Trajectory Spline */}
                <Area
                  yAxisId="cumulative"
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#growthGradPremium)"
                  dot={<CustomPeakDot maxVal={maxDaySolved} />}
                  activeDot={{
                    r: 6,
                    fill: '#FB923C',
                    stroke: '#0D0F13',
                    strokeWidth: 3,
                    filter: 'url(#areaGlowFilter)',
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
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.45} />
                    <stop offset="50%" stopColor="#F97316" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>
                  <filter id="areaGlowFilter" x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation="3.5" result="glowBlur" />
                    <feMerge>
                      <feMergeNode in="glowBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.7}
                />

                <XAxis
                  dataKey="date"
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDateTick}
                  dy={10}
                  tick={{ fill: '#6B7280', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
                  minTickGap={45}
                />

                <YAxis
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: '#6B7280', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
                  domain={[0, 'auto']}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeDasharray: '3 3', strokeWidth: 1 }}
                />

                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#growthGradPremium)"
                  dot={<CustomPeakDot maxVal={maxDaySolved} />}
                  activeDot={{
                    r: 6,
                    fill: '#FB923C',
                    stroke: '#0D0F13',
                    strokeWidth: 3,
                    filter: 'url(#areaGlowFilter)',
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
                <defs>
                  <linearGradient id="barGradPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FB923C" stopOpacity={1} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0.75} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.7}
                />

                <XAxis
                  dataKey="date"
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDateTick}
                  dy={10}
                  tick={{ fill: '#6B7280', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
                  minTickGap={45}
                />

                <YAxis
                  stroke="transparent"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tick={{ fill: '#6B7280', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
                  domain={[0, Math.max(maxDaySolved + 1, 3)]}
                />

                {/* Subtle Velocity Average Baseline */}
                {Number(avgDailySolved) > 0 && (
                  <ReferenceLine
                    y={Number(avgDailySolved)}
                    stroke="#F97316"
                    strokeDasharray="4 4"
                    strokeOpacity={0.4}
                  />
                )}

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />

                <Bar
                  dataKey="solved"
                  fill="url(#barGradPremium)"
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
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/[0.08] text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316] shadow-[0_0_8px_rgba(249,115,22,0.7)]" />
              <span className="font-mono text-[#9CA3AF]">
                {chartMode === 'hybrid'
                  ? 'Dual Mode'
                  : chartMode === 'cumulative'
                    ? 'Cumulative Trajectory'
                    : 'Daily Output'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[#6B7280]">Velocity:</span>
              <span className="font-bold text-[#F3F4F6]">{avgDailySolved} / day</span>
            </div>

            {maxDaySolved > 0 && (
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-[#6B7280]">Peak:</span>
                <span className="font-bold text-amber-400">
                  {maxDaySolved} solves
                  {peakPoint?.date && (
                    <span className="text-[10px] text-[#6B7280] font-normal ml-1">
                      ({formatDateTick(peakPoint.date)})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="font-mono text-[11px] text-[#6B7280]">
            Range: {formatDateTick(displayData[0]?.date)} — {formatDateTick(displayData[displayData.length - 1]?.date)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolveTrendChart;
