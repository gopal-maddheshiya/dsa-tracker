import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * TopicWeaknessChart: Clean Bottlenecks Worklist.
 *
 * Dense, scannable table identifying struggle areas
 * without neon drop-shadows or competing visual badges.
 */
const TopicWeaknessChart = ({
  topics = [],
  isLoading = false,
  error = null,
  onRetry,
  className = '',
}) => {
  const navigate = useNavigate();

  // Sort topics by struggle ratio descending, secondary sort by total attempts
  const rankedTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    return [...topics]
      .filter((t) => (t.totalAttempts || 0) > 0)
      .sort((a, b) => (b.struggleRatio || 0) - (a.struggleRatio || 0) || (b.totalAttempts || 0) - (a.totalAttempts || 0))
      .slice(0, 5);
  }, [topics]);

  if (isLoading) {
    return (
      <div className={`rounded-xl border border-line bg-surface p-4 sm:p-5 animate-pulse select-none flex flex-col justify-between h-full ${className}`}>
        <div className="flex justify-between items-center pb-3 border-b border-line-subtle">
          <div className="h-3 w-28 bg-surface-2 rounded-xs" />
          <div className="h-3 w-14 bg-surface-2 rounded-xs" />
        </div>
        <div className="space-y-3 py-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="h-3.5 w-32 bg-surface-2 rounded-xs" />
              <div className="h-3 w-20 bg-surface-2 rounded-xs" />
            </div>
          ))}
        </div>
        <div className="h-3 w-32 bg-surface-2 rounded-xs mt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl border border-danger/30 bg-surface p-4 sm:p-5 text-xs text-text-secondary ${className}`}>
        <p className="font-semibold text-text">Top Bottlenecks</p>
        <p className="text-danger mt-1">Unable to load topic diagnostics.</p>
        {onRetry && (
          <button onClick={onRetry} className="text-accent underline mt-2 cursor-pointer font-medium">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <section
      aria-label="Top Algorithmic Bottlenecks"
      className={`rounded-xl border border-line bg-surface p-4 sm:p-5 flex flex-col justify-between h-full select-none ${className}`}
    >
      <div className="flex-1 flex flex-col">
        {/* Header: Micro-label + Catalog Link */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
              Top Bottlenecks
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-2 border border-line-subtle text-muted">
              Struggle Ratio
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/problems')}
            className="text-xs text-muted hover:text-accent font-medium transition-colors cursor-pointer flex items-center gap-1 group font-mono text-[11px]"
          >
            <span>Catalog</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Column Headers for Analytical Scannability */}
        {rankedTopics.length > 0 && (
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted/60 px-2 pt-2.5 pb-1 select-none border-b border-line-subtle/30">
            <div className="flex items-center gap-3">
              <span className="w-5 tabular-nums">#</span>
              <span>Topic</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-right hidden sm:inline">Struggle</span>
              <span className="w-16 text-right hidden sm:inline">Volume</span>
              <span className="w-3" />
            </div>
          </div>
        )}

        {/* Analytical Table Content */}
        {rankedTopics.length === 0 ? (
          <div className="py-10 text-center space-y-1 my-auto">
            <p className="text-xs font-semibold text-text">No bottlenecks detected</p>
            <p className="text-[11px] text-muted">
              Log problem attempts with notes to generate struggle diagnostics.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line-subtle/40 pt-0.5 flex-1 flex flex-col justify-around">
            {rankedTopics.map((item, idx) => {
              const isFirst = idx === 0;
              const strugglePercent = Math.round((item.struggleRatio || 0) * 100);
              const attempts = item.totalAttempts || 0;

              return (
                <div
                  key={item.topic}
                  onClick={() => navigate(`/problems?topic=${encodeURIComponent(item.topic)}`)}
                  className={`py-2 px-2 -mx-2 flex items-center justify-between text-xs cursor-pointer group rounded transition-colors ${
                    isFirst
                      ? 'bg-surface-2/60 border-l-2 border-l-accent pl-2.5'
                      : 'hover:bg-surface-2/40'
                  }`}
                  title={`Filter catalog by ${item.topic}`}
                >
                  {/* Left: Index + Topic + #1 Priority Gap Badge */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className={`font-mono text-xs tabular-nums shrink-0 w-5 ${
                        isFirst ? 'text-accent font-bold' : 'text-muted/60 font-medium'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`truncate transition-colors ${
                        isFirst
                          ? 'font-semibold text-text group-hover:text-accent'
                          : 'font-medium text-text-secondary group-hover:text-text'
                      }`}
                    >
                      {item.topic}
                    </span>
                    {isFirst && (
                      <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-accent/15 border border-accent/25 text-[9px] font-mono text-accent font-bold uppercase shrink-0">
                        Top Gap
                      </span>
                    )}
                  </div>

                  {/* Right: Metrics + Mini Progress Bar */}
                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 font-mono text-[11px] tabular-nums select-none">
                    {/* Mini struggle bar */}
                    <div className="w-10 sm:w-14 h-1 rounded-full bg-surface-2 overflow-hidden border border-line-subtle/40 hidden sm:block">
                      <div
                        className={`h-full rounded-full ${isFirst ? 'bg-accent' : 'bg-muted/70'}`}
                        style={{ width: `${Math.min(100, strugglePercent)}%` }}
                      />
                    </div>

                    <span
                      className={`font-medium min-w-[36px] text-right ${
                        isFirst ? 'text-accent font-bold' : 'text-text-secondary'
                      }`}
                    >
                      {strugglePercent}%
                    </span>

                    <span className="text-[10px] text-muted/70 w-16 text-right hidden sm:inline">
                      {attempts} {attempts === 1 ? 'solve' : 'solves'}
                    </span>

                    <span className="text-muted/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all text-xs font-mono w-3 text-right">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-line mt-auto flex items-center justify-between text-xs text-muted font-mono">
        <span className="text-[11px]">Target deliberate practice</span>
        <button
          type="button"
          onClick={() => navigate('/profile?tab=analytics')}
          className="text-muted hover:text-text transition-colors cursor-pointer text-[11px]"
        >
          Full matrix in Profile →
        </button>
      </div>
    </section>
  );
};

export default TopicWeaknessChart;
