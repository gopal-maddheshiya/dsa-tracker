import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Link2,
  Share2,
  Zap,
  Layers,
  Search,
  Code,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

/**
 * Helper to match any topic string to a recognizable icon and visual theme
 */
function getTopicVisual(topicName = '') {
  const norm = topicName.toLowerCase().trim();

  if (norm.includes('array')) {
    return {
      iconBg: 'bg-[#0f766e]/30 text-[#14b8a6]',
      barColor: 'bg-[#10b981]',
      pctColor: 'text-[#10b981]',
      Icon: Grid,
    };
  }
  if (norm.includes('string')) {
    return {
      iconBg: 'bg-[#1e40af]/30 text-[#60a5fa]',
      barColor: 'bg-[#3b82f6]',
      pctColor: 'text-[#10b981]',
      symbol: 'T',
    };
  }
  if (norm.includes('link')) {
    return {
      iconBg: 'bg-[#92400e]/30 text-[#fbbf24]',
      barColor: 'bg-[#f59e0b]',
      pctColor: 'text-slate-300',
      Icon: Link2,
    };
  }
  if (norm.includes('tree') || norm.includes('bst')) {
    return {
      iconBg: 'bg-[#065f46]/30 text-[#34d399]',
      barColor: 'bg-[#a855f7]',
      pctColor: 'text-slate-300',
      symbol: '🌲',
    };
  }
  if (norm.includes('graph')) {
    return {
      iconBg: 'bg-[#991b1b]/30 text-[#f87171]',
      barColor: 'bg-[#ef4444]',
      pctColor: 'text-[#ef4444]',
      Icon: Share2,
    };
  }
  if (norm.includes('dynamic') || norm === 'dp') {
    return {
      iconBg: 'bg-[#1d4ed8]/30 text-[#93c5fd]',
      barColor: 'bg-[#38bdf8]',
      pctColor: 'text-[#ef4444]',
      symbol: 'Σ',
    };
  }
  if (norm.includes('greedy')) {
    return {
      iconBg: 'bg-[#854d0e]/30 text-[#fde047]',
      barColor: 'bg-[#eab308]',
      pctColor: 'text-slate-300',
      Icon: Zap,
    };
  }
  if (norm.includes('stack') || norm.includes('queue')) {
    return {
      iconBg: 'bg-[#9d174d]/30 text-[#f472b6]',
      barColor: 'bg-[#ec4899]',
      pctColor: 'text-slate-300',
      Icon: Layers,
    };
  }
  if (norm.includes('search')) {
    return {
      iconBg: 'bg-[#6b21a8]/30 text-[#c084fc]',
      barColor: 'bg-[#8b5cf6]',
      pctColor: 'text-slate-300',
      Icon: Search,
    };
  }

  // Default fallback for any other custom topic
  return {
    iconBg: 'bg-[#334155]/40 text-slate-300',
    barColor: 'bg-[#3b82f6]',
    pctColor: 'text-slate-300',
    Icon: Code,
  };
}

/**
 * TopicWeaknessChart: Real topic-wise performance derived from user's attempt records.
 * Every row is an interactive link that filters the problem catalog by that topic.
 */
export default function TopicWeaknessChart({
  topics = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  const hasData = Array.isArray(topics) && topics.length > 0;
  // Display up to 9 topics
  const displayTopics = hasData ? topics.slice(0, 9) : [];

  return (
    <div className="p-4 sm:p-4.5 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Top Struggling Topics
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Topics with highest struggle rate (click to filter)
          </p>
        </div>

        <Link
          to="/problems"
          className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 transition-colors shrink-0 font-medium"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Rows Container */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 bg-surface-2/40 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Failed to load topic performance
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="block mx-auto mt-2 text-accent underline"
              >
                Retry
              </button>
            )}
          </div>
        ) : !hasData ? (
          <div className="py-8 border border-dashed border-line rounded-xl flex flex-col items-center justify-center p-6 text-center bg-surface-2/10">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/25 text-accent flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-white">No topic data yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              Log attempts on your problems to unlock performance analytics per topic.
            </p>
          </div>
        ) : (
          displayTopics.map((item, idx) => {
            const visual = getTopicVisual(item.topic);
            const { Icon, symbol } = visual;
            const total = item.totalAttempts || 1;
            const solved = Math.max(0, total - (item.struggledCount || 0));
            const pct = Math.min(100, Math.round((solved / total) * 100));

            return (
              <Link
                key={item.topic}
                to={`/problems?topic=${encodeURIComponent(item.topic)}`}
                className="flex items-center gap-2.5 sm:gap-4 py-1 px-2 -mx-2 rounded-xl hover:bg-surface-2/40 transition-colors group"
                title={`Filter problems by ${item.topic}`}
              >
                {/* Mobile Rank Number Badge (Screen 2) */}
                <div className="sm:hidden w-6 h-6 rounded-full bg-surface-2 border border-line text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>

                {/* Desktop Circular Icon Badge */}
                <div
                  className={`hidden sm:flex w-7 h-7 rounded-full items-center justify-center shrink-0 ${visual.iconBg}`}
                >
                  {Icon ? (
                    <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                  ) : (
                    <span className="text-xs font-bold leading-none">
                      {symbol}
                    </span>
                  )}
                </div>

                {/* Topic Title */}
                <span className="w-24 sm:w-36 text-xs font-medium text-white group-hover:text-accent transition-colors truncate shrink-0">
                  {item.topic}
                </span>

                {/* Rounded Progress Bar */}
                <div className="flex-1 h-2.5 sm:h-3 rounded-full bg-surface-2 overflow-hidden border border-line-subtle min-w-[50px] max-w-sm sm:max-w-md">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${visual.barColor}`}
                    style={{ width: `${Math.max(6, pct)}%` }}
                  />
                </div>

                {/* Evidence e.g. 42 / 50 */}
                <span className="hidden xs:inline-block w-12 sm:w-16 text-right text-xs font-mono text-slate-400 shrink-0">
                  {solved} / {total}
                </span>

                {/* Percentage */}
                <span
                  className={`w-9 sm:w-12 text-right text-xs font-mono font-bold shrink-0 ${visual.pctColor}`}
                >
                  {pct}%
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
