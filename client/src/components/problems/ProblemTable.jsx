import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  DifficultyBadge,
  StatusBadge,
  PlatformBadge,
  formatRelativeDate,
} from './ProblemBadges';

/**
 * ProblemTable
 * High-density, scan-friendly table layout for desktop viewports.
 * Features semantic left-border status stripes, interactive column sorting indicators,
 * subtle row hover transitions, and accessible action controls.
 */
export default function ProblemTable({
  problems = [],
  sortConfig = { key: 'lastAttempt', direction: 'desc' },
  onSort,
  onLogAttempt,
  onEditProblem,
  onDeleteProblem,
}) {
  const renderSortIndicator = (columnKey) => {
    if (!onSort) return null;
    const isActive = sortConfig?.key === columnKey;
    if (isActive) {
      return sortConfig.direction === 'asc' ? (
        <span className="p-0.5 rounded bg-accent/15 text-accent inline-flex items-center">
          <ArrowUp className="w-3 h-3 shrink-0" />
        </span>
      ) : (
        <span className="p-0.5 rounded bg-accent/15 text-accent inline-flex items-center">
          <ArrowDown className="w-3 h-3 shrink-0" />
        </span>
      );
    }
    return (
      <ArrowUpDown className="w-3 h-3 text-muted/40 group-hover/th:text-text transition-colors shrink-0" />
    );
  };

  const getRowStripeClass = (status) => {
    if (!status) return 'border-l-2 border-l-transparent';
    switch (status) {
      case 'solved':
        return 'border-l-2 border-l-emerald-500';
      case 'revisit_needed':
        return 'border-l-2 border-l-amber-500';
      case 'struggled':
        return 'border-l-2 border-l-rose-500';
      default:
        return 'border-l-2 border-l-transparent';
    }
  };

  return (
    <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface-2/60 text-muted font-mono uppercase text-[10.5px] tracking-wider select-none">
              <th scope="col" className="py-3 px-4 font-semibold w-auto min-w-[240px]">
                <button
                  type="button"
                  onClick={() => onSort?.('title')}
                  className="group/th inline-flex items-center gap-1.5 hover:text-text transition-colors font-semibold uppercase text-[10.5px]"
                >
                  <span>Problem</span>
                  {renderSortIndicator('title')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5 font-semibold whitespace-nowrap w-28">
                Platform
              </th>
              <th scope="col" className="py-3 px-3.5 font-semibold whitespace-nowrap w-28">
                <button
                  type="button"
                  onClick={() => onSort?.('difficulty')}
                  className="group/th inline-flex items-center gap-1.5 hover:text-text transition-colors font-semibold uppercase text-[10.5px]"
                >
                  <span>Difficulty</span>
                  {renderSortIndicator('difficulty')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5 font-semibold w-64 min-w-[200px]">
                Topics
              </th>
              <th scope="col" className="py-3 px-3.5 font-semibold whitespace-nowrap w-32">
                <button
                  type="button"
                  onClick={() => onSort?.('status')}
                  className="group/th inline-flex items-center gap-1.5 hover:text-text transition-colors font-semibold uppercase text-[10.5px]"
                >
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5 font-semibold whitespace-nowrap w-32">
                <button
                  type="button"
                  onClick={() => onSort?.('lastAttempt')}
                  className="group/th inline-flex items-center gap-1.5 hover:text-text transition-colors font-semibold uppercase text-[10.5px]"
                >
                  <span>Last Attempt</span>
                  {renderSortIndicator('lastAttempt')}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-right whitespace-nowrap w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {problems.map((problem) => {
              const latest = problem.latestAttempt;
              const stripeClass = getRowStripeClass(latest?.status);

              return (
                <tr
                  key={problem.id}
                  className="hover:bg-surface-hover/60 transition-colors duration-150 group"
                >
                  {/* Problem Title & External Link (with reliable left status stripe) */}
                  <td className={`py-3 px-4 font-medium text-text ${stripeClass}`}>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="hover:text-accent font-semibold text-xs sm:text-sm text-text transition-colors truncate"
                        title={problem.title}
                      >
                        {problem.title}
                      </Link>
                      {problem.link && (
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted/40 hover:text-accent p-0.5 rounded transition-colors shrink-0 inline-flex items-center"
                          title="Open external problem link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <PlatformBadge platform={problem.platform} />
                  </td>

                  {/* Difficulty */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>

                  {/* Topics (Single-line strict with clean truncation and title tooltip) */}
                  <td className="py-3 px-3.5">
                    <div
                      className="flex items-center gap-1.5 flex-nowrap overflow-hidden max-w-[280px]"
                      title={problem.topics && problem.topics.length > 0 ? problem.topics.join(', ') : ''}
                    >
                      {problem.topics && problem.topics.length > 0 ? (
                        <>
                          {problem.topics.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-surface-2 text-text-secondary border border-line truncate max-w-[125px] shrink-0"
                            >
                              {t}
                            </span>
                          ))}
                          {problem.topics.length > 2 && (
                            <span
                              className="px-1.5 py-0.5 rounded-md text-[11px] font-mono bg-surface-2 text-muted border border-line shrink-0 cursor-help"
                            >
                              +{problem.topics.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted text-[11px]">—</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <StatusBadge status={latest?.status || null} />
                  </td>

                  {/* Last Attempt */}
                  <td className="py-3 px-3.5 whitespace-nowrap font-mono text-muted text-xs">
                    {formatRelativeDate(latest?.attemptedAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLogAttempt(problem)}
                        className="h-7.5 inline-flex items-center gap-1.5 px-2.5 rounded-md text-xs font-mono font-medium bg-surface-2 hover:bg-accent hover:text-white text-text-secondary hover:border-accent border border-line shadow-xs transition-all duration-150 active:scale-95"
                        title="Log practice attempt"
                      >
                        <Plus className="w-3.5 h-3.5 text-accent group-hover:text-inherit" />
                        <span>Log</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditProblem(problem)}
                        className="h-7.5 w-7.5 inline-flex items-center justify-center rounded-md text-muted hover:text-text hover:bg-surface-hover transition-all duration-150 active:scale-95 focus-visible:ring-1 focus-visible:ring-accent"
                        title="Edit problem"
                        aria-label="Edit problem"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteProblem(problem)}
                        className="h-7.5 w-7.5 inline-flex items-center justify-center rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-all duration-150 active:scale-95 focus-visible:ring-1 focus-visible:ring-danger"
                        title="Delete problem"
                        aria-label="Delete problem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
