import React from 'react';

/**
 * StatCard: Developer cockpit KPI card.
 * Emphasizes clean hierarchy: small label, prominent technical number, subtle supporting context.
 */
export default function StatCard({
  label,
  value,
  context,
  badge,
  badgeType = 'default', // 'default' | 'success' | 'accent' | 'warning'
  loading = false,
  error = null,
  onRetry = null,
}) {
  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-surface border border-line shadow-subtle flex flex-col justify-between animate-pulse min-h-[104px]">
        <div className="flex items-center justify-between">
          <div className="h-3.5 bg-surface-2 rounded w-24" />
          <div className="h-4 bg-surface-2 rounded w-10" />
        </div>
        <div className="my-2 h-7 bg-surface-2 rounded w-16" />
        <div className="h-3 bg-surface-2 rounded w-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-surface border border-line shadow-subtle flex flex-col justify-between min-h-[104px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">{label}</span>
          <span className="text-[10px] font-mono text-danger">Error</span>
        </div>
        <div className="my-1 text-xs text-muted">Failed to load</div>
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
    default: 'bg-surface-2 text-text-secondary border-line',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="p-4 rounded-lg bg-surface border border-line shadow-subtle flex flex-col justify-between transition-colors hover:border-line-subtle group">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
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

      <div className="my-1.5 text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-text">
        {value !== undefined && value !== null ? value : '—'}
      </div>

      {context && (
        <div className="text-[11px] font-mono text-muted truncate">
          {context}
        </div>
      )}
    </div>
  );
}
