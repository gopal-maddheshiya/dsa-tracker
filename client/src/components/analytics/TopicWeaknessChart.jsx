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
      <div className="panel p-6 animate-pulse border-[#262320]">
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
      <div className="panel p-6 border-rose-500/20">
        <h3 className="text-sm font-bold text-[#F5F5F4] mb-3">Topic Weakness</h3>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-rose-400 mb-3">Unable to load topic analytics.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-ghost text-xs">
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
    <div
      className="panel p-6 border-[#262320] relative overflow-hidden transition-all flex flex-col justify-between"
      style={{
        background: 'radial-gradient(ellipse 65% 55% at 10% 10%, rgba(244,63,94,0.05) 0%, transparent 60%), linear-gradient(180deg, #171614 0%, #131211 100%)',
      }}
    >
      <div>
        {/* ── Top Header & Mode Toggle ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F5F5F4] tracking-tight">
                {viewMode === 'struggle' ? 'Topic Weakness' : 'Topic Mastery'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#141312] border border-[#262320] text-[#A8A29E]">
                {displayTopics.length} tracked
              </span>
            </div>
            <p className="text-xs text-[#6B6560] mt-1 font-mono">
              {viewMode === 'struggle'
                ? 'Ranked by struggle ratio • Click to practice topic'
                : 'Ranked by win rate • Highest accuracy topics'}
            </p>
          </div>

          {/* Toggle pills */}
          <div className="flex items-center p-1 rounded-xl bg-[#11100F] border border-[#262320] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('struggle')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'struggle'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-[#6B6560] hover:text-[#A8A29E]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Focus Areas
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mastery')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'mastery'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-[#6B6560] hover:text-[#A8A29E]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Strong Topics
            </button>
          </div>
        </div>

        {/* ── Topics List ──────────────────────────────────────────── */}
        {displayTopics.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-[#262320] rounded-xl p-4">
            <p className="text-xs text-[#6B6560]">No practice attempts recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3.5 my-auto">
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

              // Gradient styles
              const barGradient = viewMode === 'struggle'
                ? isHighStruggle
                  ? 'linear-gradient(90deg, #F43F5E 0%, #FB7185 100%)'
                  : isMidStruggle
                  ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)'
                  : 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                : 'linear-gradient(90deg, #10B981 0%, #34D399 100%)';

              const barShadow = viewMode === 'struggle'
                ? isHighStruggle
                  ? '0 0 10px rgba(244, 63, 94, 0.4)'
                  : isMidStruggle
                  ? '0 0 8px rgba(245, 158, 11, 0.3)'
                  : 'none'
                : '0 0 8px rgba(16, 185, 129, 0.3)';

              const badgeStyle = viewMode === 'struggle'
                ? isHighStruggle
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : isMidStruggle
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

              return (
                <div
                  key={item.topic}
                  onClick={() => handleTopicClick(item.topic)}
                  className="group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-[#1C1A18]/60 border border-transparent hover:border-[#262320] transition-all duration-150"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    {/* Topic index & name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[11px] text-[#6B6560] shrink-0 w-4">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[#F5F5F4] font-semibold truncate group-hover:text-[#FB923C] transition-colors">
                        {item.topic}
                      </span>
                      {/* Action pill on hover */}
                      <span className="hidden group-hover:inline-flex items-center text-[10px] text-amber-400 font-mono font-medium pl-1 animate-fadeIn">
                        Practice ↗
                      </span>
                    </div>

                    {/* Stats & Risk Badge */}
                    <div className="flex items-center gap-2.5 shrink-0 font-mono text-[11px] ml-2">
                      <span className="text-[#8C847E] font-medium hidden sm:inline">
                        {item.struggledAttempts} / {item.totalAttempts} att.
                      </span>

                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badgeStyle} hidden md:inline`}>
                        {badgeLabel}
                      </span>

                      <span
                        className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${badgeStyle} min-w-[44px] text-center`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Sleek Gradient Glowing Bar */}
                  <div className="h-1.5 w-full bg-[#11100F] rounded-full overflow-hidden border border-[#262320]">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(pct, 4)}%`,
                        background: barGradient,
                        boxShadow: barShadow,
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
        <div className="mt-5 pt-4 border-t border-[#262320] flex items-start gap-2.5">
          {viewMode === 'struggle' && topStruggle ? (
            <>
              <span className="relative flex h-2 w-2 mt-1 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                <strong className="text-[#F5F5F4]">{topStruggle.topic}</strong> has your highest struggle rate at{' '}
                <strong className="text-rose-400 font-mono">{Math.round(topStruggle.struggleRatio * 100)}%</strong> over{' '}
                {topStruggle.totalAttempts} sessions. Click to practice target problems.
              </p>
            </>
          ) : topMastery ? (
            <>
              <span className="relative flex h-2 w-2 mt-1 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs text-[#A8A29E] leading-relaxed">
                <strong className="text-[#F5F5F4]">{topMastery.topic}</strong> is your top mastery topic with{' '}
                <strong className="text-emerald-400 font-mono">
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
