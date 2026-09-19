import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trophy } from 'lucide-react';

const TopicWeaknessChart = ({ topics = [], isLoading = false, error = null, onRetry }) => {
  const navigate = useNavigate();
  // View mode: 'struggle' (Focus Areas) | 'mastery' (Strong Topics)
  const [viewMode, setViewMode] = useState('struggle');

  const processedTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    const cloned = [...topics];

    if (viewMode === 'struggle') {
      // Sort by highest struggle ratio
      return cloned.sort((a, b) => (b.struggleRatio || 0) - (a.struggleRatio || 0));
    } else {
      // Sort by highest mastery / win rate: (1 - struggleRatio)
      return cloned.sort((a, b) => (a.struggleRatio || 0) - (b.struggleRatio || 0));
    }
  }, [topics, viewMode]);

  const displayTopics = processedTopics.slice(0, 6);

  if (isLoading) {
    return (
      <div className="panel p-6 animate-pulse border-line">
        <div className="flex justify-between items-center mb-5">
          <div className="space-y-2">
            <div className="h-4 w-36 shimmer rounded-md" />
            <div className="h-3 w-48 shimmer rounded-md" />
          </div>
          <div className="h-7 w-32 shimmer rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-28 shimmer rounded-md" />
                <div className="h-3 w-12 shimmer rounded-md" />
              </div>
              <div className="h-1.5 w-full shimmer rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-6 border-danger/25">
        <h3 className="text-sm font-semibold text-text mb-3">Topic Weakness</h3>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-danger mb-3">Unable to load topic analytics.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-secondary text-xs">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const topStruggle = topics.find((t) => t.struggleRatio > 0);
  const topMastery = [...topics].sort((a, b) => a.struggleRatio - b.struggleRatio)[0];

  const handleTopicClick = (topicName) => {
    navigate(`/problems?topic=${encodeURIComponent(topicName)}`);
  };

  return (
    <div className="panel p-6 relative overflow-hidden transition-all flex flex-col justify-between">
      <div>
        {/* ── Top Header & Mode Toggle ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-text tracking-tight">
                {viewMode === 'struggle' ? 'Topic Weakness' : 'Topic Mastery'}
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-surface-2 border border-line text-muted">
                {displayTopics.length} tracked
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              {viewMode === 'struggle'
                ? 'Ranked by struggle ratio • Click to practice topic'
                : 'Ranked by win rate • Highest accuracy topics'}
            </p>
          </div>

          {/* Toggle pills */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('struggle')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'struggle'
                  ? 'bg-danger/15 text-danger border border-danger/30'
                  : 'text-muted hover:text-text'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Focus Areas
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mastery')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'mastery'
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Strong Topics
            </button>
          </div>
        </div>

        {/* ── Topics Matrix Grid (2 columns on md/lg) ─────────────── */}
        {displayTopics.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-line rounded-xl p-4">
            <p className="text-xs text-muted">No practice attempts recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-auto">
            {displayTopics.map((item, idx) => {
              const strugglePct = Math.round(item.struggleRatio * 100);
              const masteryPct = Math.round((1 - item.struggleRatio) * 100);

              const isHighStruggle = strugglePct >= 60;
              const isMidStruggle = strugglePct >= 35 && !isHighStruggle;

              // Values according to active view mode
              const pct = viewMode === 'struggle' ? strugglePct : masteryPct;
              const badgeLabel = viewMode === 'struggle'
                ? isHighStruggle ? 'Critical' : isMidStruggle ? 'Moderate' : 'Stable'
                : masteryPct >= 75 ? 'Mastered' : masteryPct >= 50 ? 'Solid' : 'Developing';

              const barColor = viewMode === 'struggle'
                ? isHighStruggle
                  ? 'bg-danger'
                  : isMidStruggle
                  ? 'bg-medium'
                  : 'bg-success'
                : 'bg-success';

              const badgeStyle = viewMode === 'struggle'
                ? isHighStruggle
                  ? 'bg-danger/12 text-danger border-danger/25'
                  : isMidStruggle
                  ? 'bg-medium/12 text-medium border-medium/25'
                  : 'bg-success/12 text-success border-success/25'
                : 'bg-success/12 text-success border-success/25';

              return (
                <div
                  key={item.topic}
                  onClick={() => handleTopicClick(item.topic)}
                  className="group cursor-pointer p-3 rounded-xl bg-surface-2/40 hover:bg-surface-2 border border-line transition-all duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-2 gap-1.5 sm:gap-2">
                    {/* Topic index & name with flex-1 min-w-0 */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs text-muted shrink-0 w-4 font-medium tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">
                        {item.topic}
                      </span>
                      {/* Action pill on hover */}
                      <span className="hidden sm:group-hover:inline-flex items-center text-xs text-accent font-medium pl-1 animate-fadeIn shrink-0">
                        Practice ↗
                      </span>
                    </div>

                    {/* Stats & Risk Badge */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-xs self-end sm:self-auto pl-6 sm:pl-0">
                      <span className="text-muted font-medium text-xs tabular-nums">
                        {item.struggledAttempts}/{item.totalAttempts} att.
                      </span>

                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${badgeStyle}`}>
                        {badgeLabel}
                      </span>

                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeStyle} min-w-[40px] text-center tabular-nums`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Clean Flat Progress Bar */}
                  <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden border border-line">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                      style={{
                        width: `${Math.max(pct, 4)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Dynamic AI / Coach Insight Footer ──────────────────────── */}
      {topics.length > 0 && (
        <div className="mt-5 pt-4 border-t border-line flex items-start gap-2.5">
          {viewMode === 'struggle' && topStruggle ? (
            <>
              <span className="relative flex h-2 w-2 mt-1 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              </span>
              <p className="text-xs text-muted leading-relaxed">
                <strong className="text-text font-semibold">{topStruggle.topic}</strong> has your highest struggle rate at{' '}
                <strong className="text-danger font-semibold tabular-nums">{Math.round(topStruggle.struggleRatio * 100)}%</strong> over{' '}
                {topStruggle.totalAttempts} sessions. Click to practice target problems.
              </p>
            </>
          ) : topMastery ? (
            <>
              <span className="relative flex h-2 w-2 mt-1 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <p className="text-xs text-muted leading-relaxed">
                <strong className="text-text font-semibold">{topMastery.topic}</strong> is your top mastery topic with{' '}
                <strong className="text-success font-semibold tabular-nums">
                  {Math.round((1 - topMastery.struggleRatio) * 100)}%
                </strong>{' '}
                accuracy over {topMastery.totalAttempts} sessions. High retention!
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default TopicWeaknessChart;
