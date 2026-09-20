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
  Sparkles,
  Zap,
} from 'lucide-react';

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
      // Sort by highest struggle ratio descending, then by total attempts
      return cloned.sort((a, b) => (b.struggleRatio || 0) - (a.struggleRatio || 0) || (b.totalAttempts || 0) - (a.totalAttempts || 0));
    } else {
      // Sort by highest mastery / lowest struggle ratio, then by total attempts
      return cloned.sort((a, b) => (a.struggleRatio || 0) - (b.struggleRatio || 0) || (b.totalAttempts || 0) - (a.totalAttempts || 0));
    }
  }, [topics, viewMode]);

  const displayTopics = showAll ? processedTopics : processedTopics.slice(0, 6);

  if (isLoading) {
    return (
      <div className="panel p-4 sm:p-6 animate-pulse border-line">
        <div className="flex justify-between items-center mb-5">
          <div className="space-y-2">
            <div className="h-4 w-36 shimmer rounded-md" />
            <div className="h-3 w-48 shimmer rounded-md" />
          </div>
          <div className="h-8 w-44 shimmer rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-2/40 border border-line space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 shimmer rounded-md" />
                <div className="h-5 w-24 shimmer rounded-full" />
              </div>
              <div className="h-2 w-full shimmer rounded-full" />
              <div className="flex justify-between items-center">
                <div className="h-3 w-28 shimmer rounded-md" />
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

  const topStruggle = topics.find((t) => (t.struggleRatio || 0) > 0);
  const topMastery = [...topics].sort((a, b) => (a.struggleRatio || 0) - (b.struggleRatio || 0))[0];

  const handleTopicClick = (topicName) => {
    navigate(`/problems?topic=${encodeURIComponent(topicName)}`);
  };

  return (
    <div className="panel p-4 sm:p-6 relative overflow-hidden transition-all flex flex-col justify-between">
      <div>
        {/* ── Top Header & Mode Toggle ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-text tracking-tight">
                  Topic Diagnostics
                </h3>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-surface-2 border border-line text-muted">
                  {topics.length} tracked
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {viewMode === 'struggle'
                  ? 'Ranked by highest struggle rate · Identify algorithmic bottlenecks'
                  : 'Ranked by highest solve accuracy · High retention patterns'}
              </p>
            </div>
          </div>

          {/* Segmented Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-surface-2/70 border border-line w-full sm:w-auto text-xs font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('struggle')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'struggle'
                  ? 'bg-danger/15 text-danger font-semibold border border-danger/30 shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Focus Areas</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  viewMode === 'struggle' ? 'bg-danger/25 text-danger' : 'bg-surface-3 text-muted'
                }`}
              >
                {struggleCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mastery')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'mastery'
                  ? 'bg-easy/15 text-easy font-semibold border border-easy/30 shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Strong Topics</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  viewMode === 'mastery' ? 'bg-easy/25 text-easy' : 'bg-surface-3 text-muted'
                }`}
              >
                {masteryCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── Topics Matrix Grid (2 columns on md/lg) ─────────────── */}
        {displayTopics.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-line rounded-xl p-4">
            <Target className="w-8 h-8 text-muted/40 mb-2" />
            <p className="text-xs text-text-secondary font-medium">No topic practice data recorded yet.</p>
            <p className="text-[11px] text-muted mt-1">Solve problems and tag topics to generate weakness diagnostics.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayTopics.map((item, idx) => {
              const strugglePct = Math.round((item.struggleRatio || 0) * 100);
              const masteryPct = Math.round((1 - (item.struggleRatio || 0)) * 100);
              const solvedCount = Math.max(0, (item.totalAttempts || 0) - (item.struggledAttempts || 0));

              const isHighStruggle = strugglePct >= 60;
              const isMidStruggle = strugglePct >= 35 && !isHighStruggle;

              // Value & label according to view mode
              const pct = viewMode === 'struggle' ? strugglePct : masteryPct;
              const badgeLabel =
                viewMode === 'struggle'
                  ? isHighStruggle
                    ? 'Critical'
                    : isMidStruggle
                    ? 'Moderate'
                    : 'Stable'
                  : masteryPct >= 75
                  ? 'Mastered'
                  : masteryPct >= 50
                  ? 'Solid'
                  : 'Developing';

              // Gradient color for progress bar
              const barGradient =
                viewMode === 'struggle'
                  ? isHighStruggle
                    ? 'bg-gradient-to-r from-danger/90 to-danger shadow-[0_0_10px_rgba(239,71,67,0.35)]'
                    : isMidStruggle
                    ? 'bg-gradient-to-r from-amber-500/90 to-accent shadow-[0_0_10px_rgba(255,161,22,0.3)]'
                    : 'bg-gradient-to-r from-easy/80 to-easy'
                  : 'bg-gradient-to-r from-emerald-500/90 to-easy shadow-[0_0_10px_rgba(0,184,163,0.35)]';

              // Badge styling
              const badgeStyle =
                viewMode === 'struggle'
                  ? isHighStruggle
                    ? 'bg-danger/12 text-danger border-danger/25'
                    : isMidStruggle
                    ? 'bg-accent/12 text-accent border-accent/25'
                    : 'bg-easy/12 text-easy border-easy/25'
                  : 'bg-easy/12 text-easy border-easy/25';

              const dotColor =
                viewMode === 'struggle'
                  ? isHighStruggle
                    ? 'bg-danger'
                    : isMidStruggle
                    ? 'bg-accent'
                    : 'bg-easy'
                  : 'bg-easy';

              return (
                <div
                  key={item.topic}
                  onClick={() => handleTopicClick(item.topic)}
                  className="group relative cursor-pointer p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/80 border border-line hover:border-accent/40 transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md"
                >
                  {/* Top Line: Rank, Title, and Unified Status Pill */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-6 h-5.5 rounded-md bg-surface-3/80 border border-line/60 text-text-secondary text-[11px] font-mono flex items-center justify-center font-bold shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">
                        {item.topic}
                      </span>
                    </div>

                    {/* Unified Status Pill with Dot Indicator */}
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border tabular-nums shrink-0 flex items-center gap-1.5 ${badgeStyle}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                      <span>
                        {pct}% {badgeLabel}
                      </span>
                    </span>
                  </div>

                  {/* High-Tech Progress Track */}
                  <div className="h-2 w-full bg-surface-3/90 rounded-full overflow-hidden p-0.5 border border-line/50">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${barGradient}`}
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>

                  {/* Bottom Line: Attempt Breakdown & Interactive Cue */}
                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      <span className="text-text font-medium tabular-nums">
                        {item.struggledAttempts} / {item.totalAttempts}
                      </span>
                      <span className="text-[11px] text-muted">
                        {viewMode === 'struggle' ? 'struggled' : 'sessions'}
                      </span>
                      <span className="text-line mx-0.5">·</span>
                      <span className="text-[11px] text-text-secondary tabular-nums font-medium">
                        {solvedCount} solved ({viewMode === 'struggle' ? 100 - pct : pct}%)
                      </span>
                    </div>

                    {/* Interactive "Practice →" cue */}
                    <div className="flex items-center gap-1 text-[11px] font-medium text-muted/60 group-hover:text-accent transition-colors">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                        Practice
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Expand/Collapse Toggle if More Than 6 Topics ────────── */}
        {processedTopics.length > 6 && (
          <div className="flex justify-center mt-3.5">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer rounded-lg hover:border-accent/40 transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-accent" />
                  <span>Show Top 6 Focus Topics</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-accent" />
                  <span>Show All {processedTopics.length} Tracked Topics</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── AI Diagnostic & Practice Recommendation Banner ──────────── */}
      {topics.length > 0 && (
        <div className="mt-5 p-3.5 sm:p-4 rounded-xl border transition-all shadow-xs bg-surface-2/40 border-line">
          {viewMode === 'struggle' && topStruggle ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-danger/10 border border-danger/25 text-danger shrink-0 mt-0.5 sm:mt-0 shadow-[0_0_12px_rgba(239,71,67,0.15)]">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono tracking-wider text-danger uppercase font-bold flex items-center gap-1">
                    Priority Bottleneck Identified
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <strong className="text-text font-semibold">{topStruggle.topic}</strong> has your highest struggle rate at{' '}
                    <strong className="text-danger font-semibold tabular-nums">
                      {Math.round((topStruggle.struggleRatio || 0) * 100)}%
                    </strong>{' '}
                    across {topStruggle.totalAttempts} sessions. Drilling 2–3 medium problems here will yield the highest rating gain.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTopicClick(topStruggle.topic)}
                className="btn-primary text-xs px-3.5 py-2 shrink-0 flex items-center justify-center gap-1.5 group cursor-pointer self-end sm:self-auto shadow-[0_0_12px_rgba(255,161,22,0.25)] hover:shadow-[0_0_18px_rgba(255,161,22,0.4)] transition-all font-semibold"
              >
                <span>Drill {topStruggle.topic}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : topMastery ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-easy/10 border border-easy/25 text-easy shrink-0 mt-0.5 sm:mt-0 shadow-[0_0_12px_rgba(0,184,163,0.15)]">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono tracking-wider text-easy uppercase font-bold flex items-center gap-1">
                    Topic Mastery Highlight
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <strong className="text-text font-semibold">{topMastery.topic}</strong> is your strongest pattern with{' '}
                    <strong className="text-easy font-semibold tabular-nums">
                      {Math.round((1 - (topMastery.struggleRatio || 0)) * 100)}%
                    </strong>{' '}
                    solve accuracy across {topMastery.totalAttempts} sessions. Maintain cadence with periodic spaced revisions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTopicClick(topMastery.topic)}
                className="btn-secondary text-xs px-3.5 py-2 shrink-0 flex items-center justify-center gap-1.5 group cursor-pointer self-end sm:self-auto hover:border-easy/40 transition-colors font-medium"
              >
                <span>Explore {topMastery.topic}</span>
                <ArrowRight className="w-3.5 h-3.5 text-easy group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default TopicWeaknessChart;
