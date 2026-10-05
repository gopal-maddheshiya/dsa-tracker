import React from 'react';

/**
 * StatCard: Developer cockpit KPI card (Desktop).
 * Clean hierarchy: category marker badge, prominent font-mono metric,
 * and informative supporting context with optional progress bar.
 */
export default function StatCard({
  label,
  value,
  context,
  badge,
  badgeType = 'default', // 'default' | 'success' | 'accent' | 'warning'
  progressPercent = null,
  loading = false,
  error = null,
  onRetry = null,
}) {
  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-surface border border-line flex flex-col justify-between min-h-[110px] animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-surface-2 rounded w-24" />
          <div className="h-3.5 bg-surface-2 rounded w-12" />
        </div>
        <div className="my-2 h-7 bg-surface-2 rounded w-16" />
        <div className="h-2.5 bg-surface-2 rounded w-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-surface border border-line flex flex-col justify-between min-h-[110px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted uppercase tracking-wider">{label}</span>
          <span className="text-[10px] font-mono text-danger bg-danger/10 px-1.5 py-0.5 rounded border border-danger/20">
            Error
          </span>
        </div>
        <div className="my-1 text-xs text-muted">Failed to load metric</div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-[11px] text-accent hover:underline text-left font-mono self-start"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const badgeStyles = {
    default: 'bg-surface-2 text-muted border-line',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const cardAccentLine = {
    default: 'border-t-indigo-500/70',
    accent: 'border-t-indigo-400/70',
    success: 'border-t-emerald-500/70',
    warning: 'border-t-amber-500/70',
  };

  return (
    <div
      className={`p-4 sm:p-4.5 rounded-xl bg-surface border border-line ${
        cardAccentLine[badgeType] || 'border-t-line'
      } border-t-2 shadow-xs flex flex-col justify-between transition-all duration-150 hover:border-line-hover hover:bg-surface/90 group min-h-[110px]`}
    >
      {/* Top: Metric Label + Category Context Marker */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-secondary tracking-wide">
          {label}
        </span>
        {badge && (
          <span
            className={`px-1.5 py-0.5 text-[10px] font-mono border rounded ${
              badgeStyles[badgeType] || badgeStyles.default
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Middle: Prominent Technical Metric */}
      <div className="my-1.5 text-2xl lg:text-3xl font-mono font-semibold tracking-tight text-text">
        {value !== undefined && value !== null ? value : '—'}
      </div>

      {/* Bottom: Supporting Context & Optional Subtle Progress Bar */}
      <div className="space-y-1">
        {progressPercent !== undefined && progressPercent !== null && (
          <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500/80 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, Math.min(100, progressPercent))}%` }}
            />
          </div>
        )}
        {context && (
          <div className="text-[11px] text-muted truncate">
            {context}
          </div>
        )}
      </div>
    </div>
  );
}
