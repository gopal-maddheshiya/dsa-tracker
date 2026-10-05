import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Target, ArrowRight, ShieldAlert } from 'lucide-react';

/**
 * TopicWeaknessChart: Ranking visualization of topics with highest struggle ratios.
 * Features a balanced 2-column layout on desktop:
 * - Left (8 cols): Ranked topic rows with proportional progress bars.
 * - Right (4 cols): Diagnostic Friction Intelligence summary eliminating dead space.
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

  // Primary friction topic (highest struggle ratio)
  const primaryFriction = hasData ? topTopics[0] : null;

  // Compute average struggle percentage
  const avgStrugglePercent = hasData
    ? Math.round(
        (topTopics.reduce((acc, curr) => acc + (curr.struggleRatio || 0), 0) /
          topTopics.length) *
          100
      )
    : 0;

  return (
    <div className="p-4 sm:p-4.5 rounded-xl bg-surface border border-line shadow-xs flex flex-col justify-between h-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 border-b border-line-subtle pb-2.5">
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
            Practice areas where you encounter the highest attempt friction
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="space-y-3 py-2 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3.5 bg-surface-2 rounded w-28" />
                  <div className="h-3 bg-surface-2 rounded w-16" />
                </div>
                <div className="h-1.5 bg-surface-2 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-6 border border-line-subtle rounded-lg flex flex-col items-center justify-center p-4 text-center bg-bg/40">
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
                className="mt-2.5 px-3 py-1 text-xs font-mono text-accent hover:text-accent-hover border border-line hover:border-accent/40 rounded transition-colors"
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
              Log a few attempts to see where you encounter friction.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch py-1">
            {/* Left Column (8 cols on desktop): Ranked Topic Rows */}
            <div className="lg:col-span-8 space-y-2">
              {topTopics.map((item, index) => {
                const ratio =
                  typeof item?.struggleRatio === 'number' && !isNaN(item.struggleRatio)
                    ? item.struggleRatio
                    : 0;
                const strugglePercent = Math.round(ratio * 100);
                const isHighStruggle = ratio >= 0.5;
                const barColor = isHighStruggle ? 'bg-rose-500/80' : 'bg-amber-500/80';
                const textBadge = isHighStruggle
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

                return (
                  <div
                    key={item.topic || index}
                    className="p-2 sm:p-2.5 rounded-lg bg-surface-2/40 border border-line-subtle transition-all duration-150 hover:bg-surface-2/70 hover:border-line group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      {/* Topic Identity & Rank */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded bg-surface border border-line text-[10px] font-mono text-muted flex items-center justify-center font-semibold shrink-0">
                          #{index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-xs text-text truncate block">
                            {item.topic}
                          </span>
                          <span className="text-[10px] font-mono text-muted block sm:hidden mt-0.5">
                            {item.struggledCount} struggle / {item.totalAttempts} att.
                          </span>
                        </div>
                      </div>

                      {/* Controlled-Width Visual Struggle Bar & Statistics */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-muted hidden sm:inline shrink-0">
                          {item.struggledCount} struggle / {item.totalAttempts} att.
                        </span>

                        <div className="w-24 sm:w-32 md:w-36 shrink-0">
                          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-line-subtle">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                              style={{ width: `${Math.max(strugglePercent, 4)}%` }}
                            />
                          </div>
                        </div>

                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono rounded border font-semibold ${textBadge} shrink-0 min-w-[38px] text-center`}
                        >
                          {strugglePercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column (4 cols on desktop): Friction Intelligence Summary */}
            {primaryFriction && (
              <div className="lg:col-span-4 flex flex-col justify-between p-3.5 rounded-xl bg-surface-2/50 border border-line space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-line-subtle pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
                      <Target className="w-3.5 h-3.5 text-accent" />
                      <span>Friction Intelligence</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Priority Focus
                    </span>
                  </div>

                  {/* Top Struggle Highlight */}
                  <div className="p-2.5 rounded-lg bg-surface border border-line">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                      Primary Friction Topic
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="font-semibold text-xs text-text truncate">
                        {primaryFriction.topic}
                      </span>
                      <span className="font-mono text-xs font-bold text-rose-400 shrink-0">
                        {Math.round(primaryFriction.struggleRatio * 100)}% struggle
                      </span>
                    </div>
                  </div>

                  {/* Average Struggle Metric */}
                  <div className="p-2.5 rounded-lg bg-surface border border-line">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-secondary text-[11px]">Average Friction</span>
                      <span className="font-mono font-semibold text-text text-xs">
                        {avgStrugglePercent}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${avgStrugglePercent}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Topics with high friction ratio trigger frequent spaced repetition resets. Reviewing these topics early prevents retention decay.
                  </p>
                </div>

                <Link
                  to={`/problems?topic=${encodeURIComponent(primaryFriction.topic)}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium text-text bg-surface hover:bg-surface-hover border border-line hover:border-accent/40 rounded-md transition-all duration-150 active:scale-95 shadow-xs"
                >
                  <span>Practice {primaryFriction.topic}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted" />
                </Link>
              </div>
            )}
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
                Rank #{index + 1}: {item.topic} — {Math.round(item.struggleRatio * 100)}% struggle ratio ({item.struggledCount} of {item.totalAttempts} attempts)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
