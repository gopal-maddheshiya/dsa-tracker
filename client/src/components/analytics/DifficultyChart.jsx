import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    color: '#10b981', // Emerald
    textClass: 'text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b', // Amber
    textClass: 'text-amber-400',
    dotClass: 'bg-amber-500',
  },
  hard: {
    label: 'Hard',
    color: '#ef4444', // Rose/Red
    textClass: 'text-rose-400',
    dotClass: 'bg-rose-500',
  },
};

/**
 * Custom dark tooltip for Difficulty Donut
 */
function DifficultyTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const config = DIFFICULTY_CONFIG[data.difficulty] || {
      label: data.difficulty,
      color: '#a1a1aa',
    };

    return (
      <div className="bg-surface-2/95 backdrop-blur-sm border border-line rounded-md px-3 py-2 shadow-xs text-xs font-mono">
        <div className="text-text font-medium flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block shadow-xs"
            style={{ backgroundColor: config.color }}
          />
          <span>{config.label}</span>
          <span className="text-text-secondary">—</span>
          <span className="text-text font-semibold">{data.count}</span>
        </div>
        {data.total > 0 && (
          <div className="text-[10px] text-muted mt-0.5">
            {((data.count / data.total) * 100).toFixed(1)}% of total
          </div>
        )}
      </div>
    );
  }
  return null;
}

/**
 * DifficultyChart: Donut distribution of tracked problems by difficulty.
 */
export default function DifficultyChart({
  breakdown = [],
  totalProblems = 0,
  loading = false,
  error = null,
  onRetry = null,
}) {
  // Normalize breakdown data ensuring easy, medium, hard exist
  const formattedData = ['easy', 'medium', 'hard'].map((diff) => {
    const found = Array.isArray(breakdown)
      ? breakdown.find((b) => (b.difficulty || '').toLowerCase() === diff)
      : null;
    return {
      difficulty: diff,
      name: DIFFICULTY_CONFIG[diff].label,
      count: found ? Number(found.count) || 0 : 0,
      total: totalProblems,
    };
  });

  const hasData = totalProblems > 0 && formattedData.some((d) => d.count > 0);

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-surface border border-line shadow-xs flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex items-start justify-between gap-4 mb-4 border-b border-line-subtle pb-3">
        <div>
          <h2 className="text-sm font-semibold text-text tracking-tight">Difficulty distribution</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Tracked problems categorized by level
          </p>
        </div>
        <span className="text-[10px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded border border-line">
          {totalProblems} total
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[240px] flex flex-col justify-center">
        {loading ? (
          <div className="h-60 w-full animate-pulse flex flex-col items-center justify-center p-4">
            <div className="w-28 h-28 rounded-full border-4 border-surface-2 border-t-accent animate-spin" />
            <div className="mt-4 flex gap-4">
              <div className="h-3 bg-surface-2 rounded w-14" />
              <div className="h-3 bg-surface-2 rounded w-14" />
              <div className="h-3 bg-surface-2 rounded w-14" />
            </div>
          </div>
        ) : error ? (
          <div className="h-60 border border-line-subtle rounded-lg flex flex-col items-center justify-center p-6 text-center bg-bg/40">
            <p className="text-xs text-text-secondary font-medium">
              Couldn't load difficulty distribution
            </p>
            <p className="text-[11px] text-muted mt-1 max-w-xs">
              {error.message || 'Unable to retrieve problem difficulty breakdown.'}
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
            <p className="text-xs font-medium text-text">No problems tracked yet</p>
            <p className="text-[11px] text-muted mt-1 max-w-xs">
              Add your first problem to see difficulty distribution.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Donut Chart with Centered Total */}
            <div className="relative w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<DifficultyTooltip />} />
                  <Pie
                    data={formattedData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    stroke="#121316"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {formattedData.map((entry) => (
                      <Cell
                        key={`cell-${entry.difficulty}`}
                        fill={DIFFICULTY_CONFIG[entry.difficulty].color}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Metric Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-mono font-semibold text-text">
                  {totalProblems}
                </span>
                <span className="text-[10px] text-muted uppercase tracking-wider font-sans">
                  Problems
                </span>
              </div>
            </div>

            {/* Restrained Semantic Legend */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3 border-t border-line-subtle text-center">
              {formattedData.map((item) => {
                const config = DIFFICULTY_CONFIG[item.difficulty];
                const pct = totalProblems > 0
                  ? Math.round((item.count / totalProblems) * 100)
                  : 0;

                return (
                  <div
                    key={item.difficulty}
                    className="flex flex-col items-center p-2 rounded-md bg-surface-2/60 border border-line-subtle transition-colors hover:border-line"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <span
                        className="w-2 h-2 rounded-full inline-block shrink-0 shadow-xs"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="font-medium text-[11px]">{config.label}</span>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1 font-mono">
                      <span className="text-sm font-semibold text-text">
                        {item.count}
                      </span>
                      <span className="text-[10px] text-muted">
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Accessible data table for screen-readers */}
      {hasData && (
        <div className="sr-only">
          <h3>Difficulty distribution table</h3>
          <table>
            <thead>
              <tr>
                <th>Difficulty</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {formattedData.map((row) => (
                <tr key={row.difficulty}>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                  <td>
                    {totalProblems > 0
                      ? `${((row.count / totalProblems) * 100).toFixed(1)}%`
                      : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
