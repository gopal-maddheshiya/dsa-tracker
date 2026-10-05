import React from 'react';

/**
 * MobileRingDock: Dedicated mobile overview stage (< sm screens).
 * Renders 3 luminous rings ("gol gol") standing on dedicated support pedestals ("support ko leke khada hai").
 * Ultra-compact, space-efficient (~110px total height), eliminating loose dead margins.
 */
export default function MobileRingDock({ summary, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="sm:hidden rounded-xl bg-surface/60 border border-line p-3 shadow-xs animate-pulse">
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 py-0.5">
              <div className="w-13 h-13 rounded-full bg-surface-2" />
              <div className="w-0.5 h-1.5 bg-line" />
              <div className="h-4.5 w-14 bg-surface-2 rounded-full" />
              <div className="h-2 w-8 bg-surface-2 rounded mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sm:hidden rounded-xl bg-surface/60 border border-line p-3 text-center space-y-1.5">
        <div className="text-xs text-muted">Unable to load overview metrics</div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-mono text-accent hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const totalProblems = summary?.totalProblems ?? 0;
  const totalAttempted = summary?.totalAttempted ?? 0;
  const totalSolved = summary?.totalSolved ?? 0;

  const solvePercent = totalAttempted > 0
    ? Math.min(100, Math.round((totalSolved / totalAttempted) * 100))
    : 0;

  const radius = 23;
  const circumference = 2 * Math.PI * radius; // ~144.5
  const solvedOffset = circumference * (1 - solvePercent / 100);

  return (
    <div className="sm:hidden rounded-xl bg-surface/80 border border-line p-3 shadow-xs">
      <div className="grid grid-cols-3 gap-1">
        {/* ==========================================
            1. TRACKED RING (Indigo)
           ========================================== */}
        <div className="flex flex-col items-center justify-between text-center min-w-0">
          {/* Circular Ring */}
          <div className="relative flex items-center justify-center w-13 h-13 shrink-0">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 54 54"
            >
              <circle
                cx="27"
                cy="27"
                r={radius}
                stroke="rgba(255, 255, 255, 0.07)"
                strokeWidth="3.2"
                fill="transparent"
              />
              <circle
                cx="27"
                cy="27"
                r={radius}
                stroke="rgb(99, 102, 241)"
                strokeWidth="3.2"
                strokeDasharray={circumference}
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.45))',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-mono font-bold text-sm text-text tracking-tight">
                {summary ? totalProblems : '—'}
              </span>
            </div>
          </div>

          {/* Pedestal Support Stem */}
          <div className="w-[1.5px] h-2 bg-indigo-500/50 my-0.5 rounded-full" />

          {/* Support Pedestal Base Pill */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-2 border border-line text-[10px] font-mono font-medium text-text shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Tracked</span>
          </div>

          {/* Subtext */}
          <span className="text-[9px] font-mono text-muted mt-0.5 truncate max-w-full">
            All tiers
          </span>
        </div>

        {/* ==========================================
            2. ATTEMPTS RING (Violet)
           ========================================== */}
        <div className="flex flex-col items-center justify-between text-center min-w-0">
          {/* Circular Ring */}
          <div className="relative flex items-center justify-center w-13 h-13 shrink-0">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 54 54"
            >
              <circle
                cx="27"
                cy="27"
                r={radius}
                stroke="rgba(255, 255, 255, 0.07)"
                strokeWidth="3.2"
                fill="transparent"
              />
              <circle
                cx="27"
                cy="27"
                r={radius}
                stroke="rgb(129, 140, 248)"
                strokeWidth="3.2"
                strokeDasharray={circumference}
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(129, 140, 248, 0.45))',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-mono font-bold text-sm text-text tracking-tight">
                {summary ? totalAttempted : '—'}
              </span>
            </div>
          </div>

          {/* Pedestal Support Stem */}
          <div className="w-[1.5px] h-2 bg-indigo-400/50 my-0.5 rounded-full" />

          {/* Support Pedestal Base Pill */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-2 border border-line text-[10px] font-mono font-medium text-text shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Attempts</span>
          </div>

          {/* Subtext */}
          <span className="text-[9px] font-mono text-muted mt-0.5 truncate max-w-full">
            Sessions
          </span>
        </div>

        {/* ==========================================
            3. SOLVED PROGRESS RING (Emerald)
           ========================================== */}
        <div className="flex flex-col items-center justify-between text-center min-w-0">
          {/* Circular Radial Arc */}
          <div className="relative flex items-center justify-center w-13 h-13 shrink-0">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 54 54"
            >
              <circle
                cx="27"
                cy="27"
                r={radius}
                stroke="rgba(255, 255, 255, 0.07)"
                strokeWidth="3.2"
                fill="transparent"
              />
              <circle
                cx="27"
                cy="27"
                r={radius}
                stroke="rgb(52, 211, 153)"
                strokeWidth="3.2"
                strokeDasharray={circumference}
                strokeDashoffset={solvedOffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(52, 211, 153, 0.45))',
                  transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-mono font-bold text-sm text-text tracking-tight">
                {summary ? totalSolved : '—'}
              </span>
            </div>
          </div>

          {/* Pedestal Support Stem */}
          <div className="w-[1.5px] h-2 bg-emerald-400/50 my-0.5 rounded-full" />

          {/* Support Pedestal Base Pill */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-2 border border-line text-[10px] font-mono font-medium text-text shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Solved</span>
          </div>

          {/* Subtext */}
          <span className="text-[9px] font-mono text-emerald-400/90 mt-0.5 truncate max-w-full font-medium">
            {solvePercent}% rate
          </span>
        </div>
      </div>
    </div>
  );
}
