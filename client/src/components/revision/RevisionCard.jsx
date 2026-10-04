import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Target, Calendar } from 'lucide-react';
import {
  DifficultyBadge,
  StatusBadge,
} from '../problems/ProblemBadges.jsx';
import {
  formatDaysElapsed,
  formatInterval,
  getRevisionTimingState,
  formatRevisionReason,
  formatPriorityScore,
  formatRank,
} from '../../lib/revisionUtils.js';

/**
 * RevisionCard: Ranked revision queue candidate.
 * Transparently discloses priority score, attempt recency, target interval, and rationale.
 */
export default function RevisionCard({ item, index }) {
  if (!item) return null;

  const isFirst = index === 0;
  const timing = getRevisionTimingState(
    item.daysSinceLastAttempt,
    item.intervalDays
  );
  const reasonText = formatRevisionReason(
    item.latestStatus,
    item.daysSinceLastAttempt,
    item.intervalDays
  );

  return (
    <div
      className={`rounded-lg p-5 transition-all duration-200 border ${
        isFirst
          ? 'bg-surface border-accent/40 shadow-subtle ring-1 ring-accent/20'
          : 'bg-surface border-line hover:border-line-subtle shadow-subtle'
      }`}
    >
      {/* Desktop & Tablet Layout (Horizontal Grid) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Rank + Problem Info + Explanation */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Rank Badge */}
          <div className="flex flex-col items-center shrink-0">
            <span
              className={`font-mono text-sm font-semibold px-2 py-1 rounded border ${
                isFirst
                  ? 'bg-accent/10 text-accent border-accent/30'
                  : 'bg-surface-2 text-muted border-line'
              }`}
            >
              {formatRank(index)}
            </span>
          </div>

          {/* Main Info */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Title, Difficulty, and Topics */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/problems/${item.id}`}
                className="text-base font-semibold text-text hover:text-accent transition-colors truncate"
              >
                {item.title}
              </Link>

              <DifficultyBadge difficulty={item.difficulty} />

              {/* Topics Pills */}
              {Array.isArray(item.topics) && item.topics.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {item.topics.slice(0, 3).map((topic, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono text-text-secondary bg-surface-2 border border-line"
                    >
                      {topic}
                    </span>
                  ))}
                  {item.topics.length > 3 && (
                    <span className="text-[10px] font-mono text-muted">
                      +{item.topics.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Status & Timing Context HUD */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted">
              <StatusBadge status={item.latestStatus} />

              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted shrink-0" />
                <span>Last attempt {formatDaysElapsed(item.daysSinceLastAttempt)}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-muted shrink-0" />
                <span>{formatInterval(item.intervalDays)}</span>
              </span>

              <span
                className={`px-1.5 py-0.5 text-[10px] rounded border font-sans font-medium ${timing.badgeClass}`}
              >
                {timing.label}
              </span>
            </div>

            {/* Explainable Deterministic Reason */}
            <div className="border-l-2 border-line pl-3 py-0.5 text-xs text-text-secondary mt-1">
              <p>{reasonText}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Priority Score & Review Action */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 pt-3 lg:pt-0 border-t border-line-subtle lg:border-t-0 shrink-0">
          {/* Priority Score Pill */}
          <div className="flex flex-col lg:items-end">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                Priority
              </span>
              <span className="text-xl font-mono font-semibold text-text">
                {formatPriorityScore(item.priorityScore)}
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted">
              Weight: +{item.struggleWeight}
            </span>
          </div>

          {/* Primary Action Button */}
          <Link
            to={`/problems/${item.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-colors shadow-subtle"
          >
            <span>Review problem</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
