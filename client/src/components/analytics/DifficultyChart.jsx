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
 * Space-optimized with centered donut and tight, integrated legend (no dead space).
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
    <div className="p-4 sm:p-4.5 rounded-xl bg-surface border border-line shadow-xs flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex items-start justify-between gap-4 mb-3 border-b border-line-subtle pb-2.5">
        <div>
          <h2 className="text-sm font-semibold text-text tracking-tight">Difficulty distribution</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Tracked problems categorized by level
          </p>
        </div>
        <span className="text-[10px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded border border-line shrink-0">
          {totalProblems} total
        </span>
      </div>

      {/* Main Content Area - Vertically Centered & Tight */}
      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="h-52 w-full animate-pulse flex flex-col items-center justify-center p-4">
            <div className="w-24 h-24 rounded-full border-4 border-surface-2 border-t-accent animate-spin" />
            <div className="mt-3 flex gap-3">
              <div className="h-3 bg-surface-2 rounded w-12" />
              <div className="h-3 bg-surface-2 rounded w-12" />
              <div className="h-3 bg-surface-2 rounded w-12" />
            </div>
          </div>
        ) : error ? (
          <div className="h-52 border border-line-subtle rounded-lg flex flex-col items-center justify-center p-4 text-center bg-bg/40">
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
                className="mt-2.5 px-3 py-1 text-xs font-mono text-accent hover:text-accent-hover border border-line hover:border-accent/40 rounded transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        ) : !hasData ? (
          <div className="h-52 border border-dashed border-line rounded-lg flex flex-col items-center justify-center p-4 text-center bg-bg/40">
            <div className="w-8 h-8 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted mb-2 font-mono text-xs">
              //
            </div>
            <p className="text-xs font-medium text-text">No problems tracked yet</p>
            <p className="text-[11px] text-muted mt-1 max-w-xs">
              Add your first problem to see difficulty distribution.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            {/* Donut Chart with Centered Total Hole Metric */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<DifficultyTooltip />} />
                  <Pie
                    data={formattedData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={62}
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
                <span className="text-lg sm:text-xl font-mono font-bold text-text leading-none">
                  {totalProblems}
                </span>
                <span className="text-[9px] text-muted uppercase tracking-wider font-mono mt-1">
                  Problems
                </span>
              </div>
            </div>

            {/* Compact Semantic Legend with Zero Dead Space */}
            <div className="grid grid-cols-3 gap-2 w-full mt-2.5 pt-2.5 border-t border-line-subtle text-center">
              {formattedData.map((item) => {
                const config = DIFFICULTY_CONFIG[item.difficulty];
                const pct = totalProblems > 0
                  ? Math.round((item.count / totalProblems) * 100)
                  : 0;

                return (
                  <div
                    key={item.difficulty}
                    className="flex flex-col items-center p-1.5 sm:p-2 rounded-md bg-surface-2/60 border border-line-subtle transition-colors hover:border-line"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <span
                        className="w-2 h-2 rounded-full inline-block shrink-0 shadow-xs"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="font-medium text-[11px]">{config.label}</span>
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-1 font-mono">
                      <span className="text-xs sm:text-sm font-semibold text-text">
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
