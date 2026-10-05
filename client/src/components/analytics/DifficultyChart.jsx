import React from 'react';
import { Link } from 'react-router-dom';

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    color: '#10b981', // Green
    fillClass: 'bg-[#10b981]',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b', // Orange/Amber
    fillClass: 'bg-[#f59e0b]',
  },
  hard: {
    label: 'Hard',
    color: '#ef4444', // Red/Rose
    fillClass: 'bg-[#ef4444]',
  },
};

/**
 * DifficultyChart: Real distribution of tracked problems across difficulty tiers.
 * Every difficulty row is an interactive link that filters the problem catalog.
 */
export default function DifficultyChart({
  breakdown = [],
  totalProblems = 0,
  loading = false,
  error = null,
  onRetry = null,
}) {
  // Normalize breakdown counts from real backend summary
  const diffMap = { easy: 0, medium: 0, hard: 0 };
  if (Array.isArray(breakdown)) {
    breakdown.forEach((item) => {
      const k = (item.difficulty || '').toLowerCase();
      if (diffMap[k] !== undefined) {
        diffMap[k] = Number(item.count) || 0;
      }
    });
  }

  const effectiveTotal = totalProblems > 0 ? totalProblems : diffMap.easy + diffMap.medium + diffMap.hard;

  const rows = [
    {
      key: 'easy',
      label: 'Easy',
      count: diffMap.easy,
      total: effectiveTotal,
      fillClass: 'bg-[#10b981]',
    },
    {
      key: 'medium',
      label: 'Medium',
      count: diffMap.medium,
      total: effectiveTotal,
      fillClass: 'bg-[#f59e0b]',
    },
    {
      key: 'hard',
      label: 'Hard',
      count: diffMap.hard,
      total: effectiveTotal,
      fillClass: 'bg-[#ef4444]',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between h-full">
      {/* Header with Title and Legend */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Problems by Difficulty
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribution of tracked problems (click to filter)
          </p>
        </div>

        {/* Total Badge */}
        <span className="text-[10px] font-mono text-slate-300 bg-surface-2 px-2.5 py-1 rounded-full border border-line shrink-0">
          {effectiveTotal} Total
        </span>
      </div>

      {/* Main Bar Rows */}
      <div className="flex-1 flex flex-col justify-center space-y-5 py-2">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-surface-2/40 rounded-full w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="py-6 border border-line rounded-xl text-center">
            <p className="text-xs text-slate-400">Failed to load difficulty distribution</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 text-xs text-blue-400 underline"
              >
                Retry
              </button>
            )}
          </div>
        ) : effectiveTotal === 0 ? (
          <div className="py-6 border border-dashed border-line rounded-xl text-center">
            <p className="text-xs text-slate-400">No problems tracked yet</p>
          </div>
        ) : (
          rows.map((row) => {
            const pct = effectiveTotal > 0 ? Math.round((row.count / effectiveTotal) * 100) : 0;

            return (
              <Link
                key={row.key}
                to={`/problems?difficulty=${row.key}`}
                className="flex items-center gap-4 py-1 px-1.5 -mx-1.5 rounded-xl hover:bg-surface-2/40 transition-colors group"
                title={`Filter ${row.label} problems`}
              >
                {/* Difficulty Label */}
                <span className="w-14 text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {row.label}
                </span>

                {/* Thick Capsule Progress Bar */}
                <div className="flex-1 h-4 rounded-full bg-[#1e293b] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${row.fillClass}`}
                    style={{ width: `${Math.max(row.count > 0 ? 6 : 0, pct)}%` }}
                  />
                </div>

                {/* Ratio e.g. 15 / 35 */}
                <span className="w-16 text-right text-xs font-mono text-slate-400 shrink-0">
                  {row.count} / {effectiveTotal}
                </span>

                {/* Percentage e.g. 43% */}
                <span className="w-10 text-right text-xs font-mono font-bold text-white shrink-0">
                  {pct}%
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
