import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * RevisionQueuePreview: Spaced-repetition revision queue candidates on the Dashboard.
 * 100% dynamically connected to real backend Leitner priority queue data.
 * Every row links to the real problem in MongoDB.
 */
export default function RevisionQueuePreview({
  queue = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  const hasItems = Array.isArray(queue) && queue.length > 0;
  const displayItems = hasItems ? queue.slice(0, 3) : [];

  return (
    <div className="p-4 sm:p-4.5 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between flex-1">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Revision Queue
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Problems to review based on spaced repetition
          </p>
        </div>

        {/* View All Button linking to /revision */}
        <Link
          to="/revision"
          className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-surface-2 border border-line rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Rows Container */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-11 bg-surface-2/40 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="py-4 text-center text-xs text-slate-400">
            Failed to load revision queue
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="block mx-auto mt-1 text-accent underline"
              >
                Retry
              </button>
            )}
          </div>
        ) : !hasItems ? (
          <div className="py-6 border border-dashed border-line rounded-xl flex flex-col items-center justify-center p-4 text-center bg-surface-2/10">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white">All caught up!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No problems are due for spaced repetition review right now.
            </p>
            <Link
              to="/problems"
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-accent hover:text-accent-hover bg-accent/10 border border-accent/25 rounded-lg transition-colors"
            >
              <span>Explore problems</span>
              <ArrowRight className="w-3.5 h-3" />
            </Link>
          </div>
        ) : (
          displayItems.map((item) => {
            const diff = (item.difficulty || 'medium').toLowerCase();
            const capDiff = diff.charAt(0).toUpperCase() + diff.slice(1);
            const firstTopic =
              Array.isArray(item.topics) && item.topics.length > 0
                ? item.topics[0]
                : 'Algorithms';

            const daysElapsed = item.daysSinceLastAttempt || 0;
            const interval = item.intervalDays || 3;
            let dueText = `Due in ${Math.max(1, Math.round(interval - daysElapsed))} days`;
            let dueColor = 'text-slate-400';

            if (daysElapsed > interval) {
              const od = Math.max(1, Math.round(daysElapsed - interval));
              dueText = od === 1 ? 'Overdue by 1 day' : `Overdue by ${od} days`;
              dueColor = 'text-rose-400';
            } else if (daysElapsed >= interval) {
              dueText = 'Due today';
              dueColor = 'text-rose-400';
            } else if (interval - daysElapsed <= 1) {
              dueText = 'Due tomorrow';
              dueColor = 'text-amber-400';
            }

            const isOverdue = daysElapsed > interval;
            const isDueToday = daysElapsed >= interval;
            const isDueTomorrow = interval - daysElapsed <= 1;

            const isHard = diff === 'hard';
            const isMedium = diff === 'medium';
            const badgeBg = isHard
              ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30'
              : isMedium
              ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30'
              : 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30';

            const clockSquircleBg = isOverdue || isDueToday
              ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30'
              : isDueTomorrow
              ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
              : 'bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/30';

            return (
              <Link
                key={item.id}
                to={`/problems/${item.id}`}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-surface-2/40 border border-line-subtle hover:border-slate-700 hover:bg-surface-2/70 transition-all group"
              >
                {/* Left: Squircle Clock Icon + (Title & Pills) */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${clockSquircleBg}`}
                  >
                    <Clock className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-accent transition-colors truncate block">
                      {item.title}
                    </span>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`px-1.5 py-0.5 rounded-md border text-[10px] font-medium shrink-0 ${badgeBg}`}
                      >
                        {capDiff}
                      </span>

                      <span className="px-1.5 py-0.5 rounded-md bg-surface border border-line text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                        {firstTopic}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Due timing + Chevron */}
                <div className="flex items-center gap-1.5 shrink-0 text-right">
                  <span className={`text-[11px] sm:text-xs font-mono font-medium ${dueColor}`}>
                    {dueText}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
