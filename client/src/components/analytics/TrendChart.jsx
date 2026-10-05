import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatWeeklyDate } from '../../lib/analyticsUtils.js';

/**
 * Custom dark tooltip matching the restrained design system
 */
function TrendTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-surface-2/95 backdrop-blur-sm border border-line rounded-md px-2.5 py-1.5 shadow-xs text-xs font-mono pointer-events-none max-w-[210px]">
        <div className="text-muted text-[10px] uppercase tracking-wider mb-1 truncate">
          Week of {formatWeeklyDate(label)}
        </div>
        <div className="text-text font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent inline-block shadow-xs shrink-0" />
          <span className="text-text font-semibold">{item.value}</span>
          <span className="text-text-secondary text-[11px] font-sans truncate">
            {item.value === 1 ? 'solved attempt' : 'solved attempts'}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * TrendChart: Weekly solved attempts over time with glowing gradient fill.
 */
export default function TrendChart({
  data = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  const hasData = Array.isArray(data) && data.length > 0 && data.some((d) => d.count > 0);

  return (
    <div className="p-4 sm:p-4.5 rounded-xl bg-surface border border-line shadow-xs flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex items-start justify-between gap-4 mb-3 border-b border-line-subtle pb-2.5">
        <div>
          <h2 className="text-sm font-semibold text-text tracking-tight">Solve trend</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Weekly problem-solving consistency across 12 trailing weeks
          </p>
        </div>
        <span className="text-[10px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded border border-line shrink-0">
          12 Weeks
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="h-52 sm:h-56 w-full animate-pulse flex flex-col justify-end space-y-3 p-4">
            <div className="h-3.5 bg-surface-2 rounded w-1/4 self-start" />
            <div className="h-32 bg-surface-2/60 rounded w-full" />
            <div className="flex justify-between gap-2 pt-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-2.5 bg-surface-2 rounded w-10" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="h-52 sm:h-56 border border-line-subtle rounded-lg flex flex-col items-center justify-center p-6 text-center bg-bg/40">
            <p className="text-xs text-text-secondary font-medium">
              Couldn't load solve trend
            </p>
            <p className="text-[11px] text-muted mt-1 max-w-xs">
              {error.message || 'Unable to retrieve historical trend data.'}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 px-3 py-1 text-xs font-mono text-accent hover:text-accent-hover border border-line hover:border-accent/40 rounded transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        ) : !hasData ? (
          <div className="h-52 sm:h-56 border border-dashed border-line rounded-lg flex flex-col items-center justify-center p-6 text-center bg-bg/40">
            <div className="w-8 h-8 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted mb-2 font-mono text-xs">
              //
            </div>
            <p className="text-xs font-medium text-text">No solved attempts yet</p>
            <p className="text-[11px] text-muted mt-1 max-w-xs">
              Once you solve problems, your weekly practice trend will appear here.
            </p>
          </div>
        ) : (
          <div className="w-full h-52 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 16, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#1e1f24"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatWeeklyDate}
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <Tooltip
                  content={<TrendTooltip />}
                  wrapperStyle={{ outline: 'none', pointerEvents: 'none', zIndex: 30 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                  dot={{ fill: '#6366f1', r: 2.5, stroke: '#121316', strokeWidth: 1.5 }}
                  activeDot={{
                    fill: '#6366f1',
                    stroke: '#0b0c0e',
                    strokeWidth: 2,
                    r: 5,
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Accessible data table for screen-readers */}
      {hasData && (
        <div className="sr-only">
          <h3>Weekly solve trend table</h3>
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th>Solved attempts</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.date}>
                  <td>{item.date}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
