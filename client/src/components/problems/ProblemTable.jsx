import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Code2 } from 'lucide-react';
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
  onViewLogs,
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
    <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_20px_-4px_rgba(0,0,0,0.3)]">
      <div className="w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface-2/70 text-muted font-mono uppercase text-[10px] tracking-wider select-none">
              <th scope="col" className="py-2.5 px-3 font-semibold min-w-0">
                <button
                  type="button"
                  onClick={() => onSort?.('title')}
                  className="group/th inline-flex items-center gap-1 hover:text-text transition-colors font-semibold uppercase text-[10px]"
                >
                  <span>Problem</span>
                  {renderSortIndicator('title')}
                </button>
              </th>
              <th scope="col" className="py-2.5 px-2.5 font-semibold whitespace-nowrap w-24">
                Platform
              </th>
              <th scope="col" className="py-2.5 px-2.5 font-semibold whitespace-nowrap w-20">
                <button
                  type="button"
                  onClick={() => onSort?.('difficulty')}
                  className="group/th inline-flex items-center gap-1 hover:text-text transition-colors font-semibold uppercase text-[10px]"
                >
                  <span>Diff</span>
                  {renderSortIndicator('difficulty')}
                </button>
              </th>
              <th scope="col" className="py-2.5 px-2.5 font-semibold whitespace-nowrap w-36 lg:w-44">
                Topics
              </th>
              <th scope="col" className="py-2.5 px-2.5 font-semibold whitespace-nowrap w-28">
                <button
                  type="button"
                  onClick={() => onSort?.('status')}
                  className="group/th inline-flex items-center gap-1 hover:text-text transition-colors font-semibold uppercase text-[10px]"
                >
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </button>
              </th>
              <th scope="col" className="py-2.5 px-2.5 font-semibold whitespace-nowrap w-24">
                <button
                  type="button"
                  onClick={() => onSort?.('lastAttempt')}
                  className="group/th inline-flex items-center gap-1 hover:text-text transition-colors font-semibold uppercase text-[10px]"
                >
                  <span>Last Attempt</span>
                  {renderSortIndicator('lastAttempt')}
                </button>
              </th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right whitespace-nowrap w-36">
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
                  {/* Problem Title & External Link (flexible, truncates cleanly without overflowing table) */}
                  <td className={`py-2.5 px-3 font-medium text-text min-w-0 ${stripeClass}`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="hover:text-accent font-semibold text-xs sm:text-[13px] text-text transition-colors truncate min-w-0"
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
                  <td className="py-2.5 px-2.5 whitespace-nowrap w-24">
                    <PlatformBadge platform={problem.platform} />
                  </td>

                  {/* Difficulty */}
                  <td className="py-2.5 px-2.5 whitespace-nowrap w-20">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>

                  {/* Topics (Space-conscious single-line with compact chips + tooltip) */}
                  <td className="py-2.5 px-2.5 w-36 lg:w-44">
                    <div
                      className="flex items-center gap-1 flex-nowrap overflow-hidden"
                      title={problem.topics && problem.topics.length > 0 ? problem.topics.join(', ') : ''}
                    >
                      {problem.topics && problem.topics.length > 0 ? (
                        <>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-surface-2 text-text-secondary border border-line truncate max-w-[90px] lg:max-w-[110px] shrink-0"
                          >
                            {problem.topics[0]}
                          </span>
                          {problem.topics.length > 1 && (
                            <span
                              className="px-1 py-0.5 rounded text-[10.5px] font-mono bg-surface-2 text-muted border border-line shrink-0 cursor-help"
                            >
                              +{problem.topics.length - 1}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted text-[11px]">—</span>
                      )}
                    </div>
                  </td>

                  {/* Status & Approach */}
                  <td className="py-2.5 px-2.5 whitespace-nowrap w-28">
                    <div className="flex flex-col gap-0.5 items-start">
                      <StatusBadge status={latest?.status || null} />
                      {latest?.approach && (
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded border font-medium ${
                            latest.approach === 'brute_force'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                              : latest.approach === 'better'
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                              : latest.approach === 'other'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              latest.approach === 'brute_force'
                                ? 'bg-amber-400'
                                : latest.approach === 'better'
                                ? 'bg-sky-400'
                                : latest.approach === 'other'
                                ? 'bg-purple-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                          <span className="capitalize">{latest.approach.replace('_', ' ')}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Last Attempt */}
                  <td className="py-2.5 px-2.5 whitespace-nowrap font-mono text-muted text-xs w-24">
                    {formatRelativeDate(latest?.attemptedAt)}
                  </td>

                  {/* Actions (Streamlined compact ergonomics) */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap w-36">
                    <div className="flex items-center justify-end gap-1">
                      {/* Code / Logs View Button */}
                      <button
                        type="button"
                        onClick={() => onViewLogs?.(problem)}
                        className={`h-7 inline-flex items-center gap-1 px-2 rounded-md text-[11px] font-mono font-medium transition-all duration-150 active:scale-95 border ${
                          latest?.code
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-xs'
                            : latest
                            ? 'bg-surface-2 hover:bg-surface-hover text-text-secondary border-line'
                            : 'bg-surface-2/50 text-muted/60 border-line/60 hover:text-text'
                        }`}
                        title={latest?.code ? 'View Java solution code & logs' : 'View practice logs'}
                      >
                        <Code2 className="w-3 h-3" />
                        <span>{latest?.code ? 'Code' : 'Logs'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onLogAttempt(problem)}
                        className="h-7 inline-flex items-center gap-1 px-2 rounded-md text-[11px] font-mono font-medium bg-surface-2 hover:bg-accent hover:text-white text-text-secondary hover:border-accent border border-line shadow-xs transition-all duration-150 active:scale-95"
                        title="Log practice attempt"
                      >
                        <Plus className="w-3 h-3 text-accent group-hover:text-inherit" />
                        <span>Log</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditProblem(problem)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted hover:text-text hover:bg-surface-hover transition-all duration-150 active:scale-95 focus-visible:ring-1 focus-visible:ring-accent"
                        title="Edit problem"
                        aria-label="Edit problem"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteProblem(problem)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-all duration-150 active:scale-95 focus-visible:ring-1 focus-visible:ring-danger"
                        title="Delete problem"
                        aria-label="Delete problem"
                      >
                        <Trash2 className="w-3 h-3" />
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
