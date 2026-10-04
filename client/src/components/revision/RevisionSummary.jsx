import { getRevisionTimingState, formatPriorityScore } from '../../lib/revisionUtils.js';

const STATUS_LABELS = {
  solved: 'Solved',
  revisit_needed: 'Revisit needed',
  struggled: 'Struggled',
};

/**
 * RevisionSummary: Compact KPI row summarizing the active revision queue.
 */
export default function RevisionSummary({ queue = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-surface border border-line shadow-subtle min-h-[96px] flex flex-col justify-between"
          >
            <div className="h-3.5 bg-surface-2 rounded w-24" />
            <div className="h-7 bg-surface-2 rounded w-16 my-1.5" />
            <div className="h-3 bg-surface-2 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  const safeQueue = Array.isArray(queue) ? queue : [];
  const queueLength = safeQueue.length;
  const dueCount = safeQueue.filter((item) => {
    if (!item) return false;
    const timing = getRevisionTimingState(item.daysSinceLastAttempt, item.intervalDays);
    return timing.state === 'due' || timing.state === 'overdue';
  }).length;
  const topItem = queueLength > 0 ? safeQueue[0] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Queue Depth */}
      <div className="p-4 rounded-lg bg-surface border border-line shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">Current queue</span>
          <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-line">
            Top 20 max
          </span>
        </div>
        <div className="my-1 text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-text">
          {queueLength}
        </div>
        <div className="text-[11px] font-mono text-muted">
          {queueLength === 1 ? '1 problem surfaced' : `${queueLength} problems surfaced`}
        </div>
      </div>

      {/* 2. Due / Overdue Count */}
      <div className="p-4 rounded-lg bg-surface border border-line shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">Due for revision</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              dueCount > 0
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`}
          >
            {dueCount > 0 ? 'Action needed' : 'All clear'}
          </span>
        </div>
        <div className="my-1 text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-text">
          {dueCount}
        </div>
        <div className="text-[11px] font-mono text-muted">
          Past target revision interval
        </div>
      </div>

      {/* 3. Most Urgent Item */}
      <div className="p-4 rounded-lg bg-surface border border-line shadow-subtle flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">Most urgent</span>
          <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
            Rank 01
          </span>
        </div>
        <div className="my-1 text-lg font-semibold tracking-tight text-text truncate">
          {topItem ? topItem.title : '—'}
        </div>
        <div className="text-[11px] font-mono text-muted truncate">
          {topItem
            ? `Priority ${formatPriorityScore(topItem.priorityScore)} · ${STATUS_LABELS[topItem.latestStatus] || topItem.latestStatus || 'Recorded'}`
            : 'No items in queue'}
        </div>
      </div>
    </div>
  );
}
