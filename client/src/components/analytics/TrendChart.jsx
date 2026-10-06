import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { formatWeeklyDate } from '../../lib/analyticsUtils.js';

/**
 * Custom dark tooltip pin matching reference image callout
 */
function TrendTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-[#161618] border border-line rounded-xl px-3 py-1.5 shadow-2xl text-center font-mono pointer-events-none -translate-y-2">
        <div className="text-[10px] text-slate-400">
          {formatWeeklyDate(label) || label}
        </div>
        <div className="text-white font-bold text-xs">
          {item.value} problems
        </div>
      </div>
    );
  }
  return null;
}

/**
 * TrendChart: Exact match to "Solving Progress" card in reference image.
 */
export default function TrendChart({
  data = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Solve Trend
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Problems solved over time
          </p>
        </div>

        {/* Dropdown Filter Pill */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 border border-line text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col justify-center min-h-[220px]">
        {loading ? (
          <div className="h-56 w-full animate-pulse flex flex-col justify-end space-y-3 p-4">
            <div className="h-3.5 bg-surface-2 rounded w-1/4" />
            <div className="h-36 bg-surface-2/60 rounded-xl w-full" />
          </div>
        ) : error ? (
          <div className="h-56 border border-line rounded-xl flex flex-col items-center justify-center p-6 text-center bg-surface-2/20">
            <p className="text-xs text-slate-400 font-medium">
              Couldn't load solve trend
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 px-3 py-1 text-xs font-mono text-accent hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        ) : !hasData ? (
          <div className="h-56 border border-dashed border-line rounded-xl flex flex-col items-center justify-center p-6 text-center bg-surface-2/10">
            <p className="text-xs font-medium text-white">No solved attempts yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Your weekly progress will graph here as you solve problems.
            </p>
          </div>
        ) : (
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="solveTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ed8641" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#ed8641" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--line)"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatWeeklyDate}
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--line)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--line)' }}
                />
                <Tooltip
                  content={<TrendTooltip />}
                  wrapperStyle={{ outline: 'none', pointerEvents: 'none', zIndex: 30 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#ed8641"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#solveTrendGradient)"
                  dot={{
                    fill: '#ed8641',
                    r: 3.5,
                    stroke: '#ffffff',
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    fill: '#ffffff',
                    stroke: '#ed8641',
                    strokeWidth: 3,
                    r: 6,
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
