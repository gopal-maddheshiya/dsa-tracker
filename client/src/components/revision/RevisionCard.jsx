import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Target, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  getPriorityTier,
} from '../../lib/revisionUtils.js';

/**
 * RevisionCard: Ranked revision queue candidate.
 * Transparently discloses priority score, attempt recency, target interval, and rationale.
 * Optimized for clear reading rhythm, scannable priority, and responsive presentation.
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
  const priorityTier = getPriorityTier(item.priorityScore);

  // Determine left accent stripe based on priority hierarchy
  const borderAccentClass = isFirst
    ? 'border-l-4 border-l-accent ring-1 ring-accent/20 bg-surface/90'
    : timing.state === 'overdue' || item.priorityScore >= 3.0
    ? 'border-l-4 border-l-amber-500/70 hover:border-l-amber-500'
    : 'border-l-4 border-l-line hover:border-l-line-hover';

  return (
    <div
      className={`rounded-lg p-4 sm:p-5 transition-all duration-200 bg-surface border border-line hover:border-line-hover shadow-xs ${borderAccentClass}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
        {/* Left & Center Zone: Rank + Problem Identity + Timing Context + Rationale */}
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
          {/* Rank Badge */}
          <div className="flex flex-col items-center shrink-0 pt-0.5">
            <span
              className={`font-mono text-xs font-semibold px-2 py-1 rounded border tracking-wide ${
                isFirst
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'bg-surface-2 text-text-secondary border-line'
              }`}
            >
              {formatRank(index)}
            </span>
            {isFirst && (
              <span className="text-[9px] font-mono text-accent font-medium mt-1 uppercase tracking-tight">
                Top
              </span>
            )}
          </div>

          {/* Main Info Body */}
          <div className="min-w-0 flex-1 space-y-2.5">
            {/* Header: Title, Difficulty, and Topics */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/problems/${item.id}`}
                className="text-sm sm:text-base font-semibold text-text hover:text-accent transition-colors truncate max-w-full sm:max-w-md"
              >
                {item.title}
              </Link>

              <DifficultyBadge difficulty={item.difficulty} />

              {/* Topics Pills */}
              {Array.isArray(item.topics) && item.topics.length > 0 && (
                <div className="hidden sm:flex flex-wrap items-center gap-1">
                  {item.topics.slice(0, 3).map((topic, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted bg-surface-2 border border-line"
                    >
                      {topic}
                    </span>
                  ))}
                  {item.topics.length > 3 && (
                    <span className="text-[10px] font-mono text-muted">
                      +{item.topics.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Status & Timing Context HUD */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-muted">
              <StatusBadge status={item.latestStatus} />

              {/* Timing Badge with semantic icon */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded border font-sans font-medium ${timing.badgeClass}`}
              >
                {timing.state === 'overdue' && (
                  <AlertCircle className="w-3 h-3 shrink-0" />
                )}
                {timing.state === 'due' && (
                  <Clock className="w-3 h-3 shrink-0" />
                )}
                {timing.state === 'upcoming' && (
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                )}
                <span>{timing.label}</span>
              </span>

              {/* Last Attempt Recency */}
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-muted shrink-0" />
                <span>Last {formatDaysElapsed(item.daysSinceLastAttempt)}</span>
              </span>

              {/* Spaced Interval Target */}
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Target className="w-3 h-3 text-muted shrink-0" />
                <span>Target: {formatInterval(item.intervalDays)}</span>
              </span>
            </div>

            {/* Deterministic Explanation Callout */}
            <div className="bg-surface-2/40 border-l-2 border-accent/60 rounded-r-md px-3 py-1.5 text-xs text-text-secondary">
              <div className="flex items-center gap-1 text-[10px] font-mono text-accent uppercase tracking-wider mb-0.5 font-medium">
                <HelpCircle className="w-3 h-3" />
                <span>Why this is surfaced</span>
              </div>
              <p className="leading-relaxed text-text-secondary text-[11px] sm:text-xs">
                {reasonText}
              </p>
            </div>
          </div>
        </div>

        {/* Right Zone: Priority Score & Review Action */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 pt-3 lg:pt-0 border-t border-line lg:border-t-0 shrink-0">
          {/* Priority Score HUD */}
          <div className="flex flex-col items-start lg:items-end bg-surface-2/40 border border-line rounded-lg px-3 py-2 min-w-[120px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                Priority
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${priorityTier.badgeClass}`}
              >
                {priorityTier.label}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-text my-0.5">
              {formatPriorityScore(item.priorityScore)}
            </div>
            <span className="text-[10px] font-mono text-muted">
              +{item.struggleWeight} struggle weight
            </span>
          </div>

          {/* Primary Action Button */}
          <Link
            to={`/problems/${item.id}`}
            aria-label={`Review problem ${item.title}`}
            className="h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-all duration-150 active:scale-95 shadow-xs shrink-0"
          >
            <span>Review problem</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
