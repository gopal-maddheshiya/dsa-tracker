import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import {
  DifficultyBadge,
  StatusBadge,
  PlatformBadge,
  formatRelativeDate,
} from './ProblemBadges';

/**
 * ProblemMobileList
 * Stacked card view for mobile & small tablet screens (<768px).
 * Features spacious rounded-2xl cards, semantic left-border status stripes,
 * and touch-comfortable h-9.5 action targets.
 */
export default function ProblemMobileList({
  problems = [],
  onLogAttempt,
  onEditProblem,
  onDeleteProblem,
}) {
  const getCardStripeClass = (status) => {
    if (!status) return 'border-l-4 border-l-line';
    switch (status) {
      case 'solved':
        return 'border-l-4 border-l-emerald-500/80';
      case 'revisit_needed':
        return 'border-l-4 border-l-amber-500/80';
      case 'struggled':
        return 'border-l-4 border-l-rose-500/80';
      default:
        return 'border-l-4 border-l-line';
    }
  };

  return (
    <div className="space-y-3.5">
      {problems.map((problem) => {
        const latest = problem.latestAttempt;
        const stripeClass = getCardStripeClass(latest?.status);

        return (
          <div
            key={problem.id}
            className={`p-4 sm:p-5 rounded-2xl bg-surface border border-line shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_2px_8px_-2px_rgba(0,0,0,0.25)] space-y-3.5 transition-all hover:border-line-hover ${stripeClass}`}
          >
            {/* Top row: Badges & external link */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <DifficultyBadge difficulty={problem.difficulty} />
                <PlatformBadge platform={problem.platform} />
              </div>
              {problem.link && (
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 flex items-center justify-center text-muted hover:text-accent rounded-xl hover:bg-surface-2 transition-all duration-150 active:scale-95 shrink-0"
                  title="Open external problem link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Problem Title */}
            <div>
              <Link
                to={`/problems/${problem.id}`}
                className="text-sm sm:text-base font-semibold text-text hover:text-accent transition-colors block line-clamp-2 leading-snug"
              >
                {problem.title}
              </Link>
            </div>

            {/* Topics */}
            {problem.topics && problem.topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {problem.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-surface-2 text-text-secondary border border-line"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Status & Last attempt bar */}
            <div className="flex items-center justify-between pt-3 border-t border-line/60 text-xs">
              <StatusBadge status={latest?.status || null} />
              <div className="text-xs font-mono text-muted">
                {latest ? `Attempted ${formatRelativeDate(latest.attemptedAt)}` : 'Not attempted'}
              </div>
            </div>

            {/* Actions footer with touch-comfortable targets */}
            <div className="pt-2.5 border-t border-line/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLogAttempt(problem)}
                  className="h-8.5 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-mono font-medium bg-accent/10 hover:bg-accent hover:text-white text-accent border border-accent/25 hover:border-accent transition-all duration-150 active:scale-95 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log</span>
                </button>
                <Link
                  to={`/problems/${problem.id}`}
                  className="h-8.5 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-mono font-medium bg-surface-2 hover:bg-surface-hover text-text-secondary hover:text-text border border-line transition-all duration-150 active:scale-95 shadow-xs"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted" />
                </Link>
              </div>

              <div className="flex items-center bg-surface-2/60 p-0.5 rounded-lg border border-line/70">
                <button
                  type="button"
                  onClick={() => onEditProblem(problem)}
                  className="h-7.5 w-7.5 inline-flex items-center justify-center rounded-md text-muted hover:text-text hover:bg-surface transition-all duration-150 active:scale-95"
                  title="Edit problem"
                  aria-label="Edit problem"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-line/80" />
                <button
                  type="button"
                  onClick={() => onDeleteProblem(problem)}
                  className="h-7.5 w-7.5 inline-flex items-center justify-center rounded-md text-muted hover:text-danger hover:bg-danger/15 transition-all duration-150 active:scale-95"
                  title="Delete problem"
                  aria-label="Delete problem"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
