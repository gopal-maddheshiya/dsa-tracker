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
 * Features semantic left-border status stripes, touch-friendly 40px+ action targets,
 * and clean metadata hierarchy.
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
    <div className="space-y-3">
      {problems.map((problem) => {
        const latest = problem.latestAttempt;
        const stripeClass = getCardStripeClass(latest?.status);

        return (
          <div
            key={problem.id}
            className={`p-4 rounded-xl bg-surface border border-line shadow-xs space-y-3 transition-colors hover:border-line-hover ${stripeClass}`}
          >
            {/* Top row: Badges & external link */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <DifficultyBadge difficulty={problem.difficulty} />
                <PlatformBadge platform={problem.platform} />
              </div>
              {problem.link && (
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 flex items-center justify-center text-muted hover:text-accent rounded-lg hover:bg-surface-2 transition-all duration-150 active:scale-95 shrink-0"
                  title="Open external problem link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Problem Title */}
            <div>
              <Link
                to={`/problems/${problem.id}`}
                className="text-sm font-semibold text-text hover:text-accent transition-colors block line-clamp-2 leading-snug"
              >
                {problem.title}
              </Link>
            </div>

            {/* Topics */}
            {problem.topics && problem.topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {problem.topics.map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-2 text-text-secondary border border-line"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Status & Last attempt bar */}
            <div className="flex items-center justify-between pt-2.5 border-t border-line/60 text-xs">
              <StatusBadge status={latest?.status || null} />
              <div className="text-[11px] font-mono text-muted">
                {latest ? `Attempted ${formatRelativeDate(latest.attemptedAt)}` : 'Not attempted'}
              </div>
            </div>

            {/* Actions footer with touch-comfortable targets */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onLogAttempt(problem)}
                  className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-mono font-medium rounded-lg bg-surface-2 hover:bg-accent hover:text-white text-text border border-line shadow-xs transition-all duration-150 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-accent group-hover:text-inherit" />
                  <span>Log</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditProblem(problem)}
                  className="h-9 w-9 inline-flex items-center justify-center text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-all duration-150 active:scale-95 focus-visible:ring-1 focus-visible:ring-accent"
                  title="Edit problem"
                  aria-label="Edit problem"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProblem(problem)}
                  className="h-9 w-9 inline-flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all duration-150 active:scale-95 focus-visible:ring-1 focus-visible:ring-danger"
                  title="Delete problem"
                  aria-label="Delete problem"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link
                to={`/problems/${problem.id}`}
                className="inline-flex items-center gap-1 h-9 px-2 text-xs font-medium text-accent hover:underline font-mono"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
