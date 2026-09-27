import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

const DIFFICULTY_MAP = {
  easy: { label: 'Easy', dotClass: 'w-1.5 h-1.5 rounded-full bg-easy', textClass: 'text-easy' },
  medium: { label: 'Med', dotClass: 'w-1.5 h-1.5 rounded-full bg-medium', textClass: 'text-medium' },
  hard: { label: 'Hard', dotClass: 'w-1.5 h-1.5 rounded-full bg-hard', textClass: 'text-hard' },
};

const getRelativeUrgency = (dateStr) => {
  if (!dateStr) return 'TODAY';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'TODAY';
  if (diffDays === 1) return 'TOMORROW';
  return `${diffDays}D`;
};

/**
 * UpcomingRevisionsCard: Left Wing of Deliberate Practice Workbench.
 *
 * Implements Premium Spaced Repetition Queue:
 * - Scannable tabular rows with difficulty dots and urgency indicators.
 * - Flat hairline rows with subtle #323232 hover.
 * - Balanced vertical height matching Topic Bottlenecks.
 */
const UpcomingRevisionsCard = ({
  queue = [],
  featuredId = null,
  maxItems = 5,
  isLoading = false,
  error = null,
  className = '',
}) => {
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
              <div className="h-3.5 w-44 bg-surface-2 rounded" />
              <div className="h-3.5 w-16 bg-surface-2 rounded" />
            </div>
          ))}
        </div>
        <div className="h-3 w-28 bg-surface-2 rounded mt-2" />
      </div>
    );
  }

  // Filter out featured problem so it never duplicates
  const candidates = (queue || [])
    .filter((item) => !featuredId || (item.problemId !== featuredId && item.id !== featuredId && item._id !== featuredId))
    .slice(0, maxItems);

  return (
    <div
      className={`rounded-xl border border-line bg-surface p-3.5 sm:p-5 flex flex-col justify-between h-full select-none shadow-xs hover:border-line-subtle transition-all ${className}`}
    >
      <div className="flex-1 flex flex-col">
        {/* Header: Title + Subtitle Question + Due Count + View All Link */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-line">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-muted">
                RECALL QUEUE
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-accent px-1.5 sm:px-2 py-0.2 rounded-full bg-accent/10 border border-accent/25 tabular-nums">
                {queue.length} due
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 hidden xs:block">
              Ebbinghaus memory curve intervals
            </p>
          </div>

          <Link
            to="/revision"
            className="text-[10px] sm:text-[11px] font-mono text-muted hover:text-text transition-colors flex items-center gap-1 group font-medium"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Column Headers */}
        {candidates.length > 0 && (
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-muted/60 px-1 pt-2 pb-1 select-none border-b border-line-subtle/30">
            <div className="flex items-center gap-2">
              <span className="w-4 sm:w-5 tabular-nums">#</span>
              <span>Problem</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-14 text-right hidden sm:inline">Difficulty</span>
              <span className="w-14 sm:w-16 text-center">Timing</span>
              <span className="w-3" />
            </div>
          </div>
        )}

        {/* Work Queue Rows */}
        {candidates.length === 0 ? (
          <div className="py-8 sm:py-10 text-center space-y-1.5 my-auto">
            <p className="text-xs font-bold text-text">Recall queue is clear</p>
            <p className="text-[11px] text-muted">Zero pending intervals. Algorithmic retention is optimal.</p>
          </div>
        ) : (
          <div className="divide-y divide-line-subtle/40 pt-0.5 flex-1 flex flex-col justify-around">
            {candidates.map((item, idx) => {
              const diffKey = item.difficulty?.toLowerCase() || 'medium';
              const diffInfo = DIFFICULTY_MAP[diffKey] || DIFFICULTY_MAP.medium;
              const urgency = getRelativeUrgency(item.nextRevisionDate);
              const targetId = item.problemId || item.id || item._id;

              return (
                <Link
                  key={targetId || idx}
                  to={`/problems/${targetId}`}
                  className="py-2 sm:py-2.5 px-1.5 sm:px-2 -mx-0.5 sm:-mx-1.5 flex items-center justify-between gap-2 sm:gap-2.5 group transition-all duration-150 hover:bg-surface-2/70 hover:pl-2 rounded-lg border border-transparent hover:border-line-subtle/50"
                  title={item.title}
                >
                  {/* Left: Index + Title */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] sm:text-[11px] font-mono text-muted/60 w-4 sm:w-5 shrink-0 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p className="text-xs font-medium text-text group-hover:text-accent truncate transition-colors">
                      {item.title}
                    </p>
                  </div>

                  {/* Right: Difficulty + Relative due timing */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 select-none">
                    <div className="inline-flex items-center justify-end gap-1.5 font-mono text-[11px] w-auto sm:w-14">
                      <span className={diffInfo.dotClass} />
                      <span className={`font-semibold ${diffInfo.textClass} hidden sm:inline`}>
                        {diffInfo.label}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] sm:text-[10px] font-mono font-bold w-14 sm:w-16 text-center px-1 sm:px-1.5 py-0.5 rounded-full ${
                        urgency === 'TODAY'
                          ? 'text-accent bg-accent/15 border border-accent/35 shadow-[0_0_8px_rgba(255,161,22,0.25)]'
                          : urgency === 'TOMORROW'
                          ? 'text-medium bg-medium/10 border border-medium/25'
                          : 'text-muted bg-surface-2 border border-line-subtle'
                      }`}
                    >
                      {urgency}
                    </span>

                    <span className="text-muted/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all text-xs font-mono w-3 text-right">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-line mt-auto flex items-center justify-between text-xs text-muted font-mono">
        <span className="text-[11px] text-muted">
          {queue.length > 5 ? `+${queue.length - candidates.length} more in queue` : 'Spaced repetition active'}
        </span>
        <Link
          to="/revision"
          className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Start session</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default UpcomingRevisionsCard;
