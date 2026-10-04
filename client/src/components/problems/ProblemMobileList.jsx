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
 */
export default function ProblemMobileList({
  problems = [],
  onLogAttempt,
  onEditProblem,
  onDeleteProblem,
}) {
  return (
    <div className="space-y-3">
      {problems.map((problem) => {
        const latest = problem.latestAttempt;
        return (
          <div
            key={problem.id}
            className="p-4 rounded-lg bg-surface border border-line shadow-subtle space-y-3"
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
                  className="text-muted hover:text-text p-1 rounded transition-colors shrink-0"
                  title="Open external problem link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Title */}
            <div>
              <Link
                to={`/problems/${problem.id}`}
                className="text-sm font-semibold text-text hover:text-accent transition-colors block line-clamp-2"
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
            <div className="flex items-center justify-between pt-2 border-t border-line/60 text-xs">
              <StatusBadge status={latest?.status || null} />
              <div className="text-[11px] font-mono text-muted">
                {latest ? `Attempted ${formatRelativeDate(latest.attemptedAt)}` : 'Not attempted'}
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLogAttempt(problem)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-surface-2 hover:bg-surface-hover text-text border border-line transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Log</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditProblem(problem)}
                  className="p-1.5 text-muted hover:text-text rounded transition-colors focus-visible:ring-1 focus-visible:ring-accent"
                  title="Edit problem"
                  aria-label="Edit problem"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProblem(problem)}
                  className="p-1.5 text-muted hover:text-danger rounded transition-colors focus-visible:ring-1 focus-visible:ring-danger"
                  title="Delete problem"
                  aria-label="Delete problem"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <Link
                to={`/problems/${problem.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
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
