import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * TopicWeaknessChart: Right Wing of Deliberate Practice Workbench.
 *
 * Implements Premium Topic Bottlenecks & Accuracy Gaps Matrix:
 * - Scannable analytical rows showing top struggle topics.
 * - #1 priority gap highlighted with amber badge and intensity bar.
 * - Matches Recall Queue vertically with hairline separators and #323232 hover.
 */
const TopicWeaknessChart = ({
  topics = [],
  maxItems = 5,
  isLoading = false,
  error = null,
  onRetry,
  className = '',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Sort topics by struggle ratio descending, secondary sort by total attempts
  const rankedTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    return [...topics]
      .filter((t) => (t.totalAttempts || 0) > 0 || (t.count || 0) > 0)
      .sort((a, b) => (b.struggleRatio || 0) - (a.struggleRatio || 0) || (b.totalAttempts || 0) - (a.totalAttempts || 0))
      .slice(0, maxItems);
  }, [topics, maxItems]);

  if (isLoading) {
    return (
      <div className={`rounded-xl border border-line bg-surface p-4 sm:p-5 animate-pulse flex flex-col justify-between h-full select-none ${className}`}>
        <div className="flex justify-between items-center pb-3 border-b border-line-subtle">
          <div className="h-3.5 w-32 bg-surface-2 rounded" />
          <div className="h-3 w-16 bg-surface-2 rounded" />
        </div>
        <div className="space-y-3 py-4 flex-1">
          {[1, 2, 3, 4, 5].slice(0, maxItems).map((i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="h-3.5 w-36 bg-surface-2 rounded" />
              <div className="h-3.5 w-16 bg-surface-2 rounded" />
            </div>
          ))}
        </div>
        <div className="h-3 w-28 bg-surface-2 rounded mt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl border border-hard/30 bg-surface p-4 sm:p-5 text-xs text-text-secondary ${className}`}>
        <p className="font-semibold text-text">Top Bottlenecks</p>
        <p className="text-hard mt-1">Unable to load topic diagnostics.</p>
        {onRetry && (
          <button onClick={onRetry} className="text-accent underline mt-2 cursor-pointer font-medium">
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-line bg-surface p-4 sm:p-5 flex flex-col justify-between h-full select-none shadow-xs hover:border-line-subtle transition-all ${className}`}
    >
      <div className="flex-1 flex flex-col">
        {/* Header: Title + Subtitle Question + Tag + Catalog Link */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
                TOPIC BOTTLENECKS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-surface-2 border border-line-subtle text-muted">
                Struggle Rate
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Accuracy gaps & retention bottlenecks
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/problems')}
            className="text-[11px] font-mono text-muted hover:text-text transition-colors flex items-center gap-1 group cursor-pointer font-medium"
          >
            <span>Catalog</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Column Headers */}
        {rankedTopics.length > 0 && (
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted/60 px-1 pt-2.5 pb-1 select-none border-b border-line-subtle/30">
            <div className="flex items-center gap-2.5">
              <span className="w-5 tabular-nums">#</span>
              <span>Topic</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-16 text-right">Struggle</span>
              <span className="w-14 text-right hidden xl:inline">Volume</span>
              <span className="w-3" />
            </div>
          </div>
        )}

        {/* Bottleneck Rows */}
        {rankedTopics.length === 0 ? (
          <div className="py-10 text-center space-y-1.5 my-auto">
            <p className="text-xs font-bold text-text">No bottlenecks detected</p>
            <p className="text-[11px] text-muted">
              Log problem attempts with notes to generate struggle diagnostics.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line-subtle/40 pt-0.5 flex-1 flex flex-col justify-around">
            {rankedTopics.map((item, idx) => {
              const isFirst = idx === 0;
              const strugglePercent = Math.round((item.struggleRatio || 0) * 100);
              const attempts = item.totalAttempts || item.count || 0;
              const topicName = item.topic || item.name;

              return (
                <div
                  key={topicName || idx}
                  onClick={() => navigate(`/problems?topic=${encodeURIComponent(topicName)}`)}
                  className={`py-2.5 px-2 -mx-1.5 flex items-center justify-between text-xs cursor-pointer group rounded-lg transition-all duration-150 ${
                    isFirst
                      ? 'bg-surface-2/60 border border-accent/25 shadow-xs'
                      : 'hover:bg-surface-2/70 hover:pl-2.5 border border-transparent hover:border-line-subtle/50'
                  }`}
                  title={`Filter catalog by ${topicName}`}
                >
                  {/* Left: Index + Topic + #1 Priority Tag */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className={`font-mono text-[11px] tabular-nums shrink-0 w-5 ${
                        isFirst ? 'text-accent font-bold' : 'text-muted/60'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`truncate transition-colors ${
                        isFirst
                          ? 'font-bold text-text group-hover:text-accent'
                          : 'font-medium text-text-secondary group-hover:text-text'
                      }`}
                    >
                      {topicName}
                    </span>
                    {isFirst && (
                      <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-accent/15 border border-accent/30 text-[9px] font-mono text-accent font-bold uppercase shrink-0 shadow-[0_0_8px_rgba(255,161,22,0.2)]">
                        Top Gap
                      </span>
                    )}
                  </div>

                  {/* Right: Intensity bar + Struggle Percent + Solves + Arrow */}
                  <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 font-mono text-[11px] tabular-nums select-none">
                    {/* Slim intensity bar */}
                    <div className="w-8 sm:w-10 h-1 rounded-full bg-surface-2 overflow-hidden border border-line-subtle/40 hidden xs:block">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFirst ? 'bg-gradient-to-r from-accent to-amber-400 shadow-[0_0_6px_rgba(255,161,22,0.4)]' : 'bg-muted/70'
                        }`}
                        style={{ width: `${Math.min(100, strugglePercent)}%` }}
                      />
                    </div>

                    <span
                      className={`font-semibold min-w-[32px] text-right ${
                        isFirst ? 'text-accent font-bold' : 'text-text-secondary'
                      }`}
                    >
                      {strugglePercent}%
                    </span>

                    <span className="text-[10px] text-muted/70 w-14 text-right hidden xl:inline">
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
          onClick={() => {
            if (!isAuthenticated) {
              window.dispatchEvent(
                new CustomEvent('open-auth-gate', {
                  detail: {
                    title: 'Personal Analytics Matrix',
                    description: 'Create an account to track your comprehensive topic mastery and struggle distribution.',
                    contextAction: 'Profile Analytics',
                  },
                })
              );
            } else {
              navigate('/profile?tab=analytics');
            }
          }}
          className="text-muted hover:text-text transition-colors cursor-pointer text-[11px] font-medium"
        >
          Full matrix in Profile →
        </button>
      </div>
    </div>
  );
};

export default TopicWeaknessChart;
