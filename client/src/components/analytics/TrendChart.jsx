import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
      <div className="bg-surface-2 border border-line rounded-md px-3 py-2 shadow-elevated text-xs font-mono">
        <div className="text-text-secondary text-[11px] mb-1">
          Week of {formatWeeklyDate(label)}
        </div>
        <div className="text-text font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          <span>
            {item.value} {item.value === 1 ? 'solved attempt' : 'solved attempts'}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * TrendChart: Weekly solved attempts over time.
 */
export default function TrendChart({
  data = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  const hasData = Array.isArray(data) && data.length > 0 && data.some((d) => d.count > 0);

  return (
    <div className="p-5 rounded-lg bg-surface border border-line shadow-subtle flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex items-start justify-between gap-4 mb-4 border-b border-line-subtle pb-3">
        <div>
          <h2 className="text-sm font-semibold text-text tracking-tight">Solve trend</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Solved attempts by week
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded border border-line">
          Weekly
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[240px] flex flex-col justify-center">
        {loading ? (
          <div className="h-60 w-full animate-pulse flex flex-col justify-end space-y-3 p-4">
            <div className="h-4 bg-surface-2 rounded w-1/4 self-start" />
            <div className="h-32 bg-surface-2/60 rounded w-full" />
            <div className="flex justify-between gap-2 pt-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3 bg-surface-2 rounded w-10" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="h-60 border border-line-subtle rounded-lg flex flex-col items-center justify-center p-6 text-center bg-bg/40">
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
          <div className="h-60 border border-dashed border-line rounded-lg flex flex-col items-center justify-center p-6 text-center bg-bg/40">
            <div className="w-8 h-8 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted mb-2 font-mono text-xs">
              //
            </div>
            <p className="text-xs font-medium text-text">No solved attempts yet</p>
            <p className="text-[11px] text-muted mt-1 max-w-xs">
              Once you solve problems, your weekly practice trend will appear here.
            </p>
          </div>
        ) : (
          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#27272a"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatWeeklyDate}
                  tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <Tooltip content={<TrendTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                  activeDot={{
                    fill: '#6366f1',
                    stroke: '#09090b',
                    strokeWidth: 2,
                    r: 5,
                  }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Accessible summary for screen readers & quick text scan */}
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
              {data.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
