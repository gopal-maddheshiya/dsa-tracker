import React from 'react';

/**
 * TopicWeaknessChart: Ranking visualization of topics with highest struggle ratios.
 * Features transparent low-sample context and non-judgmental labeling.
 */
export default function TopicWeaknessChart({
  topics = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  // Display top 5 topics by weaknessRank
  const topTopics = Array.isArray(topics) ? topics.slice(0, 5) : [];
  const hasData = topTopics.length > 0;

  return (
    <div className="p-5 rounded-lg bg-surface border border-line shadow-subtle flex flex-col justify-between h-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-line-subtle pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text tracking-tight">
              Topic difficulty signals
            </h2>
            <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-line">
              Top {topTopics.length || 5}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Higher struggle ratio indicates practice areas where you encounter the most friction.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[200px] flex flex-col justify-center">
        {loading ? (
          <div className="space-y-4 py-2 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3.5 bg-surface-2 rounded w-28" />
                  <div className="h-3 bg-surface-2 rounded w-16" />
                </div>
                <div className="h-2 bg-surface-2 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 border border-line-subtle rounded-lg flex flex-col items-center justify-center p-6 text-center bg-bg/40">
            <p className="text-xs text-text-secondary font-medium">
              Couldn't load topic difficulty signals
            </p>
            <p className="text-[11px] text-muted mt-1 max-w-xs">
              {error.message || 'Unable to analyze topic struggle ratios.'}
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
          <div className="py-8 border border-dashed border-line rounded-lg flex flex-col items-center justify-center p-6 text-center bg-bg/40">
            <div className="w-8 h-8 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted mb-2 font-mono text-xs">
              //
            </div>
            <p className="text-xs font-medium text-text">No topic insights yet</p>
            <p className="text-[11px] text-muted mt-1 max-w-xs">
              Log a few attempts to see where you struggle most.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            {topTopics.map((item, index) => {
              const ratio = typeof item?.struggleRatio === 'number' && !isNaN(item.struggleRatio) ? item.struggleRatio : 0;
              const strugglePercent = Math.round(ratio * 100);
              const isHighStruggle = ratio >= 0.5;
              const barColor = isHighStruggle
                ? 'bg-rose-500/80'
                : 'bg-amber-500/80';
              const textBadge = isHighStruggle
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

              return (
                <div key={item.topic || index} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] text-muted w-5 shrink-0">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-text truncate">
                        {item.topic}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 font-mono text-xs">
                      {/* Low-sample context indicator */}
                      <span className="text-[11px] text-muted hidden sm:inline">
                        {item.struggledCount} struggled of {item.totalAttempts} {item.totalAttempts === 1 ? 'attempt' : 'attempts'}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded border font-semibold ${textBadge}`}
                      >
                        {strugglePercent}% struggle
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden border border-line-subtle">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.max(strugglePercent, 4)}%` }}
                    />
                  </div>
                  
                  {/* Mobile low sample context below bar */}
                  <div className="sm:hidden text-[10px] font-mono text-muted mt-1 text-right">
                    {item.struggledCount} struggled / {item.totalAttempts} attempts
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accessible summary */}
      {hasData && (
        <div className="sr-only">
          <h3>Topic struggle rankings</h3>
          <ul>
            {topTopics.map((item, index) => (
              <li key={item.topic}>
                Rank {index + 1}: {item.topic} — {Math.round(item.struggleRatio * 100)}% struggle ratio ({item.struggledCount} of {item.totalAttempts} attempts)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
