import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, AlertTriangle, Trophy, ArrowUpRight, ArrowRight } from 'lucide-react';

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
      <div className="panel p-4 sm:p-6 animate-pulse border-line">
        <div className="flex justify-between items-center mb-5">
          <div className="space-y-2">
            <div className="h-4 w-36 shimmer rounded-md" />
            <div className="h-3 w-48 shimmer rounded-md" />
          </div>
          <div className="h-7 w-32 shimmer rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3.5 rounded-xl bg-surface-2/40 border border-line space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 shimmer rounded-md" />
                <div className="h-4 w-16 shimmer rounded-md" />
              </div>
              <div className="h-2 w-full shimmer rounded-full" />
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 shimmer rounded-md" />
                <div className="h-3 w-16 shimmer rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-4 sm:p-6 border-danger/25">
        <h3 className="text-sm font-semibold text-text mb-3">Topic Diagnostics</h3>
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
    <div className="panel p-4 sm:p-6 relative overflow-hidden transition-all flex flex-col justify-between">
      <div>
        {/* ── Top Header & Mode Toggle ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent shrink-0" />
              <h3 className="text-base font-semibold text-text tracking-tight">
                {viewMode === 'struggle' ? 'Topic Weakness & Focus Areas' : 'Topic Mastery & Retention'}
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-surface-2 border border-line text-muted">
                {displayTopics.length} tracked
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {viewMode === 'struggle'
                ? 'Ranked by highest struggle rate · Identify algorithm bottlenecks'
                : 'Ranked by highest accuracy · High retention topics'}
            </p>
          </div>

          {/* Segmented Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-2 border border-line self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setViewMode('struggle')}
              className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'struggle'
                  ? 'bg-danger/15 text-danger font-semibold border border-danger/30 shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Focus Areas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mastery')}
              className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'mastery'
                  ? 'bg-easy/15 text-easy font-semibold border border-easy/30 shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Strong Topics</span>
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
              const solvedCount = Math.max(0, item.totalAttempts - item.struggledAttempts);

              const isHighStruggle = strugglePct >= 60;
              const isMidStruggle = strugglePct >= 35 && !isHighStruggle;

              // Value & label according to view mode
              const pct = viewMode === 'struggle' ? strugglePct : masteryPct;
              const badgeLabel = viewMode === 'struggle'
                ? isHighStruggle ? 'Critical' : isMidStruggle ? 'Moderate' : 'Stable'
                : masteryPct >= 75 ? 'Mastered' : masteryPct >= 50 ? 'Solid' : 'Developing';

              // Gradient color for progress bar
              const barGradient = viewMode === 'struggle'
                ? isHighStruggle
                  ? 'bg-gradient-to-r from-danger/80 to-danger shadow-[0_0_8px_rgba(239,71,67,0.3)]'
                  : isMidStruggle
                  ? 'bg-gradient-to-r from-amber-500/80 to-accent shadow-[0_0_8px_rgba(255,161,22,0.25)]'
                  : 'bg-gradient-to-r from-easy/80 to-easy'
                : 'bg-gradient-to-r from-emerald-500/80 to-easy shadow-[0_0_8px_rgba(0,184,163,0.3)]';

              // Badge styling
              const badgeStyle = viewMode === 'struggle'
                ? isHighStruggle
                  ? 'bg-danger/12 text-danger border-danger/25'
                  : isMidStruggle
                  ? 'bg-accent/12 text-accent border-accent/25'
                  : 'bg-easy/12 text-easy border-easy/25'
                : 'bg-easy/12 text-easy border-easy/25';

              return (
                <div
                  key={item.topic}
                  onClick={() => handleTopicClick(item.topic)}
                  className="group cursor-pointer p-3.5 rounded-xl bg-surface-2/40 hover:bg-surface-2/80 border border-line hover:border-accent/40 transition-all duration-200 flex flex-col justify-between gap-2.5 shadow-xs"
                >
                  {/* Top line: Topic Index, Title, and Unified Status Badge */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-md bg-surface-3 border border-line text-text-secondary text-[10px] font-mono flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">
                        {item.topic}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted/50 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </div>

                    {/* Unified Status Badge */}
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border tabular-nums shrink-0 ${badgeStyle}`}>
                      {pct}% {badgeLabel}
                    </span>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden border border-line/60">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${barGradient}`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>

                  {/* Bottom Line: Detailed Attempt Breakdown */}
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>
                      {viewMode === 'struggle'
                        ? `${item.struggledAttempts} struggled of ${item.totalAttempts} att.`
                        : `${solvedCount} solved of ${item.totalAttempts} att.`}
                    </span>
                    <span className="text-text-secondary font-medium tabular-nums">
                      {viewMode === 'struggle'
                        ? `${solvedCount} solved (${100 - pct}%)`
                        : `${item.struggledAttempts} struggled (${100 - pct}%)`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Dynamic Actionable AI Diagnostic Callout ────────────────── */}
      {topics.length > 0 && (
        <div className="mt-5 p-3 sm:p-3.5 rounded-xl bg-surface-2/50 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {viewMode === 'struggle' && topStruggle ? (
            <>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-danger/10 border border-danger/25 text-danger shrink-0 mt-0.5 sm:mt-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-text font-semibold">{topStruggle.topic}</strong> has your highest struggle rate at{' '}
                  <strong className="text-danger font-semibold tabular-nums">{Math.round(topStruggle.struggleRatio * 100)}%</strong> across{' '}
                  {topStruggle.totalAttempts} sessions. Targeted practice recommended.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTopicClick(topStruggle.topic)}
                className="btn-secondary text-xs px-3 py-1.5 shrink-0 flex items-center justify-center gap-1.5 group cursor-pointer self-end sm:self-auto"
              >
                <span>Practice {topStruggle.topic}</span>
                <ArrowRight className="w-3.5 h-3.5 text-accent group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          ) : topMastery ? (
            <>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-easy/10 border border-easy/25 text-easy shrink-0 mt-0.5 sm:mt-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-text font-semibold">{topMastery.topic}</strong> is your top mastery topic with{' '}
                  <strong className="text-easy font-semibold tabular-nums">
                    {Math.round((1 - topMastery.struggleRatio) * 100)}%
                  </strong>{' '}
                  win rate over {topMastery.totalAttempts} sessions. High retention!
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTopicClick(topMastery.topic)}
                className="btn-secondary text-xs px-3 py-1.5 shrink-0 flex items-center justify-center gap-1.5 group cursor-pointer self-end sm:self-auto"
              >
                <span>Explore {topMastery.topic}</span>
                <ArrowRight className="w-3.5 h-3.5 text-accent group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default TopicWeaknessChart;

