import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  AlertTriangle,
  Trophy,
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

/**
 * TopicWeaknessChart: Level 5 Topic Diagnostics Matrix.
 *
 * Clearly highlights the #1 algorithmic bottleneck while providing
 * a compact, scannable ranking for secondary topics.
 */
const TopicWeaknessChart = ({ topics = [], isLoading = false, error = null, onRetry }) => {
  const navigate = useNavigate();
  // View mode: 'struggle' (Focus Areas) | 'mastery' (Strong Topics)
  const [viewMode, setViewMode] = useState('struggle');
  // Expand/collapse beyond top 6
  const [showAll, setShowAll] = useState(false);

  // Count topics by category
  const struggleCount = useMemo(() => {
    return (topics || []).filter((t) => (t.struggleRatio || 0) >= 0.35).length;
  }, [topics]);

  const masteryCount = useMemo(() => {
    return (topics || []).filter((t) => (t.struggleRatio || 0) < 0.35).length;
  }, [topics]);

  const processedTopics = useMemo(() => {
    if (!topics || topics.length === 0) return [];
    const cloned = [...topics];

    if (viewMode === 'struggle') {
      return cloned.sort((a, b) => (b.struggleRatio || 0) - (a.struggleRatio || 0) || (b.totalAttempts || 0) - (a.totalAttempts || 0));
    } else {
      return cloned.sort((a, b) => (a.struggleRatio || 0) - (b.struggleRatio || 0) || (b.totalAttempts || 0) - (a.totalAttempts || 0));
    }
  }, [topics, viewMode]);

  const displayTopics = showAll ? processedTopics : processedTopics.slice(0, 6);

  if (isLoading) {
    return (
      <div className="panel p-4 sm:p-5 animate-pulse border-line/70">
        <div className="flex justify-between items-center mb-3">
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-surface-2 rounded-md" />
            <div className="h-3 w-40 bg-surface-2 rounded-md" />
          </div>
          <div className="h-7 w-36 bg-surface-2 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-surface-2/40 border border-line space-y-2">
              <div className="h-3.5 w-24 bg-surface-2 rounded" />
              <div className="h-1.5 w-full bg-surface-2 rounded-full" />
              <div className="h-3 w-28 bg-surface-2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-4 border-danger/25">
        <h3 className="text-xs font-semibold text-text mb-2">Topic Diagnostics</h3>
        <div className="h-28 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-danger mb-2">Unable to load topic analytics.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-secondary text-xs py-1 px-3">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleTopicClick = (topicName) => {
    navigate(`/problems?topic=${encodeURIComponent(topicName)}`);
  };

  const primaryTopic = displayTopics.length > 0 ? displayTopics[0] : null;
  const secondaryTopics = displayTopics.slice(1);

  return (
    <div className="panel p-4 sm:p-5 relative overflow-hidden transition-all flex flex-col justify-between">
      <div>
        {/* ── Top Header & Mode Toggle ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-line/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text tracking-tight">
                  Topic Diagnostics
                </h3>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-surface-2 border border-line text-muted">
                  {topics.length} tracked
                </span>
              </div>
              <p className="text-xs text-muted">
                {viewMode === 'struggle'
                  ? 'Ranked by highest struggle rate · Focus algorithmic bottlenecks'
                  : 'Ranked by highest solve accuracy · High retention patterns'}
              </p>
            </div>
          </div>

          {/* Segmented Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-2/80 border border-line w-full sm:w-auto text-xs font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('struggle')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer text-xs ${
                viewMode === 'struggle'
                  ? 'bg-danger/15 text-danger font-semibold border border-danger/30 shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Focus Areas</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  viewMode === 'struggle' ? 'bg-danger/25 text-danger' : 'bg-surface-3 text-muted'
                }`}
              >
                {struggleCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mastery')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer text-xs ${
                viewMode === 'mastery'
                  ? 'bg-easy/15 text-easy font-semibold border border-easy/30 shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Strong Topics</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  viewMode === 'mastery' ? 'bg-easy/25 text-easy' : 'bg-surface-3 text-muted'
                }`}
              >
                {masteryCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── Content Grid ─────────────────────────────────────────── */}
        {displayTopics.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center border border-dashed border-line rounded-lg p-3">
            <Target className="w-6 h-6 text-muted/40 mb-1.5" />
            <p className="text-xs text-text-secondary font-medium">No topic practice data recorded yet.</p>
            <p className="text-[10px] text-muted mt-0.5">Solve problems and tag topics to generate weakness diagnostics.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Primary Focus / Bottleneck Highlight (#1 Card) */}
            {primaryTopic && (() => {
              const strugglePct = Math.round((primaryTopic.struggleRatio || 0) * 100);
              const masteryPct = Math.round((1 - (primaryTopic.struggleRatio || 0)) * 100);
              const solvedCount = Math.max(0, (primaryTopic.totalAttempts || 0) - (primaryTopic.struggledAttempts || 0));
              const pct = viewMode === 'struggle' ? strugglePct : masteryPct;

              return (
                <div className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  viewMode === 'struggle'
                    ? 'bg-danger/5 border-danger/25 hover:border-danger/40'
                    : 'bg-easy/5 border-easy/25 hover:border-easy/40'
                }`}>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${
                        viewMode === 'struggle'
                          ? 'text-danger bg-danger/10 border-danger/25'
                          : 'text-easy bg-easy/10 border-easy/25'
                      }`}>
                        {viewMode === 'struggle' ? '#01 Bottleneck' : '#01 Top Pattern'}
                      </span>
                      <span className="text-[11px] font-mono text-muted">
                        Rank #01
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h4
                        onClick={() => handleTopicClick(primaryTopic.topic)}
                        className="text-base font-bold text-text hover:text-accent cursor-pointer transition-colors"
                      >
                        {primaryTopic.topic}
                      </h4>
                      <span className={`text-xs font-semibold tabular-nums ${
                        viewMode === 'struggle' ? 'text-danger' : 'text-easy'
                      }`}>
                        {pct}% {viewMode === 'struggle' ? 'struggle rate' : 'accuracy'}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {viewMode === 'struggle'
                        ? `${primaryTopic.struggledAttempts} of ${primaryTopic.totalAttempts} attempts struggled (${solvedCount} solved). Drilling 2–3 medium problems here will yield highest recall gains.`
                        : `${solvedCount} solved across ${primaryTopic.totalAttempts} attempts with high retention. Maintain cadence with periodic revisions.`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTopicClick(primaryTopic.topic)}
                    className="btn-secondary text-xs px-3 py-1.5 shrink-0 flex items-center justify-center gap-1.5 font-medium rounded-md transition-all self-start sm:self-auto hover:border-accent/40 hover:text-accent cursor-pointer"
                  >
                    <span>{viewMode === 'struggle' ? `Drill ${primaryTopic.topic}` : `Explore ${primaryTopic.topic}`}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })()}

            {/* Secondary Ranked Topics (Cards 2-6) */}
            {secondaryTopics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5">
                {secondaryTopics.map((item, idx) => {
                  const strugglePct = Math.round((item.struggleRatio || 0) * 100);
                  const masteryPct = Math.round((1 - (item.struggleRatio || 0)) * 100);
                  const solvedCount = Math.max(0, (item.totalAttempts || 0) - (item.struggledAttempts || 0));
                  const pct = viewMode === 'struggle' ? strugglePct : masteryPct;

                  const isHighStruggle = strugglePct >= 60;
                  const isMidStruggle = strugglePct >= 35 && !isHighStruggle;

                  const barColor =
                    viewMode === 'struggle'
                      ? isHighStruggle
                        ? 'bg-danger'
                        : isMidStruggle
                        ? 'bg-medium'
                        : 'bg-easy'
                      : 'bg-easy';

                  return (
                    <div
                      key={item.topic}
                      onClick={() => handleTopicClick(item.topic)}
                      className="group cursor-pointer p-2 sm:p-2.5 rounded-lg bg-surface-2/20 hover:bg-surface-2/60 border border-line/40 hover:border-accent/40 transition-all flex flex-col justify-between gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-muted">
                            #{String(idx + 2).padStart(2, '0')}
                          </span>
                          <span className="font-semibold text-text group-hover:text-accent truncate transition-colors text-xs">
                            {item.topic}
                          </span>
                        </div>
                        <ArrowUpRight className="w-3 h-3 text-muted/30 group-hover:text-accent transition-transform shrink-0" />
                      </div>

                      {/* Thin Progress Rail */}
                      <div className="h-1 w-full bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>

                      {/* Clean Non-Redundant Stats */}
                      <div className="flex items-center justify-between text-[10px] text-muted tabular-nums">
                        <span>{pct}% {viewMode === 'struggle' ? 'struggle' : 'acc.'}</span>
                        <span>{item.totalAttempts} att.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Expand/Collapse Toggle if More Than 6 Topics ────────── */}
        {processedTopics.length > 6 && (
          <div className="flex justify-center mt-3 pt-2 border-t border-line/40">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="btn-secondary text-[11px] px-3 py-1 flex items-center gap-1 cursor-pointer rounded-md hover:border-accent/40 transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3 h-3 text-accent" />
                  <span>Show Top 6 Focus Topics</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 text-accent" />
                  <span>Show All {processedTopics.length} Tracked Topics</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicWeaknessChart;
