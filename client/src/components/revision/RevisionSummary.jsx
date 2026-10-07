import React from 'react';
import { getRevisionTimingState, formatPriorityScore } from '../../lib/revisionUtils.js';

const STATUS_LABELS = {
  solved: 'Solved',
  revisit_needed: 'Revisit needed',
  struggled: 'Struggled',
};

/**
 * RevisionSummary: Compact KPI row summarizing the active revision queue.
 * Displays Queue Depth, Due Today (urgency focal point), and 7-Day Velocity.
 */
export default function RevisionSummary({ queue = [], loading = false, velocity = null }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-surface border border-line shadow-xs min-h-[104px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-surface-2 rounded w-24" />
              <div className="h-4 bg-surface-2 rounded w-16" />
            </div>
            <div className="h-7 bg-surface-2 rounded w-14 my-2" />
            <div className="h-3 bg-surface-2 rounded w-36" />
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
    <div>
      {/* 1. Mobile Compact 3-Column Strip (< sm): Saves 380px vertical height */}
      <div className="block sm:hidden p-3 rounded-xl bg-surface border border-line shadow-xs">
        <div className="grid grid-cols-3 divide-x divide-line/60 text-center">
          {/* Queue Depth */}
          <div className="px-1.5">
            <span className="text-[10px] font-mono uppercase text-muted tracking-wider block">
              Queue
            </span>
            <span className="text-xl font-bold font-mono text-text block my-0.5">
              {queueLength}
            </span>
            <span className="text-[10px] text-muted block truncate">
              Top 20 max
            </span>
          </div>

          {/* Due Today */}
          <div className="px-1.5">
            <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider block">
              Due Now
            </span>
            <span className="text-xl font-bold font-mono text-amber-400 block my-0.5">
              {dueCount}
            </span>
            <span className="text-[10px] text-muted block truncate">
              {dueCount > 0 ? 'Action needed' : 'All clear'}
            </span>
          </div>

          {/* 7-Day Velocity */}
          <div className="px-1.5">
            <span className="text-[10px] font-mono uppercase text-accent tracking-wider block">
              7D Velocity
            </span>
            <span className="text-xl font-bold font-mono text-text block my-0.5">
              {velocity !== null ? velocity : '—'}
            </span>
            <span className="text-[10px] text-muted block truncate">
              Reviews
            </span>
          </div>
        </div>
      </div>

      {/* 2. Desktop 3-Card Row (>= sm) */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {/* 1. Queue Depth */}
        <div className="p-4 rounded-xl bg-surface border border-line border-t-2 border-t-accent/70 shadow-xs flex flex-col justify-between hover:border-line-hover transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary tracking-wide">Queue depth</span>
            <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-line">
              Top 20 max
            </span>
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-text">
            {queueLength}
          </div>
          <div className="text-[11px] text-muted">
            {queueLength === 1 ? '1 problem requiring attention' : `${queueLength} problems requiring attention`}
          </div>
        </div>

      {/* 2. Due Today (Urgency Focal Point) */}
      <div className="p-4 rounded-xl bg-surface border border-line border-t-2 border-t-amber-500/80 shadow-xs flex flex-col justify-between hover:border-line-hover transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary tracking-wide">Due today</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              dueCount > 0
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`}
          >
            {dueCount > 0 ? 'Action needed' : 'All clear'}
          </span>
        </div>
        <div className="my-2 text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-text flex items-baseline gap-2">
          <span>{dueCount}</span>
          {dueCount > 0 && (
            <span className="text-xs font-sans font-normal text-amber-400/90">
              ready for review
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted">
          At or past target revision interval
        </div>
      </div>

      {/* 3. 7-Day Velocity / Review Throughput */}
      <div className="p-4 rounded-xl bg-surface border border-line border-t-2 border-t-indigo-500/70 shadow-xs flex flex-col justify-between hover:border-line-hover transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary tracking-wide">
            {velocity !== null ? '7-Day velocity' : 'Most urgent'}
          </span>
          <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
            {velocity !== null ? 'Throughput' : 'Rank 01'}
          </span>
        </div>
        {velocity !== null ? (
          <>
            <div className="my-2 text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-text flex items-baseline gap-1.5">
              <span>{velocity}</span>
              <span className="text-xs font-sans font-normal text-muted">
                {velocity === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <div className="text-[11px] text-muted">
              Completed attempts in past 7 days
            </div>
          </>
        ) : (
          <>
            <div className="my-2 text-base sm:text-lg font-semibold tracking-tight text-text truncate">
              {topItem ? topItem.title : '—'}
            </div>
            <div className="text-[11px] text-muted truncate">
              {topItem
                ? `Priority ${formatPriorityScore(topItem.priorityScore)} · ${STATUS_LABELS[topItem.latestStatus] || topItem.latestStatus || 'Recorded'}`
                : 'No items in queue'}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);
}
