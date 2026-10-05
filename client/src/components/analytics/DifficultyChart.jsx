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
    <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between h-full">
      {/* Header with Title and Total Pill */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Difficulty Distribution
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Solved problems by difficulty (click to filter)
          </p>
        </div>

        {/* Total Badge */}
        <span className="text-[10px] font-mono text-slate-300 bg-surface-2 px-2.5 py-1 rounded-full border border-line shrink-0">
          {effectiveTotal} Total
        </span>
      </div>

      {loading ? (
        <div className="space-y-3 py-4 animate-pulse">
          <div className="h-20 bg-surface-2/40 rounded-xl w-full" />
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
        <>
          {/* ==============================================================
              MOBILE VIEW: Donut Ring Chart + Legend (Screen 1 Reference)
              ============================================================== */}
          <div className="flex sm:hidden items-center justify-between gap-4 py-2">
            {/* Left: SVG Donut Chart */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                {(() => {
                  const C = 2 * Math.PI * 38; // ~238.76
                  const easyPct = effectiveTotal > 0 ? rows[0].count / effectiveTotal : 0;
                  const medPct = effectiveTotal > 0 ? rows[1].count / effectiveTotal : 0;
                  const hardPct = effectiveTotal > 0 ? rows[2].count / effectiveTotal : 0;

                  const easyLen = easyPct * C;
                  const medLen = medPct * C;
                  const hardLen = hardPct * C;

                  return (
                    <>
                      {/* Easy Segment */}
                      {easyLen > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#10b981"
                          strokeWidth="8"
                          strokeDasharray={`${easyLen} ${C - easyLen}`}
                          strokeDashoffset="0"
                          fill="transparent"
                        />
                      )}
                      {/* Medium Segment */}
                      {medLen > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#f59e0b"
                          strokeWidth="8"
                          strokeDasharray={`${medLen} ${C - medLen}`}
                          strokeDashoffset={`-${easyLen}`}
                          fill="transparent"
                        />
                      )}
                      {/* Hard Segment */}
                      {hardLen > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#ef4444"
                          strokeWidth="8"
                          strokeDasharray={`${hardLen} ${C - hardLen}`}
                          strokeDashoffset={`-${easyLen + medLen}`}
                          fill="transparent"
                        />
                      )}
                    </>
                  );
                })()}
              </svg>
              {/* Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-mono font-bold text-white leading-none">
                  {effectiveTotal}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Total</span>
              </div>
            </div>

            {/* Right: Legend Breakdown List */}
            <div className="flex-1 space-y-2">
              {rows.map((row) => {
                const pct = effectiveTotal > 0 ? Math.round((row.count / effectiveTotal) * 100) : 0;
                return (
                  <Link
                    key={row.key}
                    to={`/problems?difficulty=${row.key}`}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-surface-2/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-[2px] shrink-0 ${row.fillClass}`} />
                      <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {row.label}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-300">
                      {row.count}{' '}
                      <span className="text-slate-500 font-normal">({pct}%)</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ==============================================================
              DESKTOP VIEW: Horizontal Capsule Progress Bars
              ============================================================== */}
          <div className="hidden sm:flex flex-1 flex-col justify-center space-y-4 py-2">
            {rows.map((row) => {
              const pct = effectiveTotal > 0 ? Math.round((row.count / effectiveTotal) * 100) : 0;

              return (
                <Link
                  key={row.key}
                  to={`/problems?difficulty=${row.key}`}
                  className="flex items-center gap-4 py-1 px-1.5 -mx-1.5 rounded-xl hover:bg-surface-2/40 transition-colors group"
                  title={`Filter ${row.label} problems`}
                >
                  <span className="w-14 text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {row.label}
                  </span>

                  <div className="flex-1 h-3.5 rounded-full bg-[#1e293b] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${row.fillClass}`}
                      style={{ width: `${Math.max(row.count > 0 ? 6 : 0, pct)}%` }}
                    />
                  </div>

                  <span className="w-16 text-right text-xs font-mono text-slate-400 shrink-0">
                    {row.count} / {effectiveTotal}
                  </span>

                  <span className="w-10 text-right text-xs font-mono font-bold text-white shrink-0">
                    {pct}%
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
