import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  DifficultyBadge,
  StatusBadge,
  PlatformBadge,
  formatRelativeDate,
} from './ProblemBadges';

/**
 * ProblemTable
 * High-density, scan-friendly table layout for desktop viewports.
 */
export default function ProblemTable({
  problems = [],
  onLogAttempt,
  onEditProblem,
  onDeleteProblem,
}) {
  return (
    <div className="rounded-lg bg-surface border border-line overflow-hidden shadow-subtle">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line bg-surface-2/60 text-muted font-mono uppercase text-[10px] tracking-wider">
              <th scope="col" className="py-3 px-4 font-semibold">
                Problem
              </th>
              <th scope="col" className="py-3 px-3 font-semibold">
                Platform
              </th>
              <th scope="col" className="py-3 px-3 font-semibold">
                Difficulty
              </th>
              <th scope="col" className="py-3 px-3 font-semibold">
                Topics
              </th>
              <th scope="col" className="py-3 px-3 font-semibold">
                Status
              </th>
              <th scope="col" className="py-3 px-3 font-semibold">
                Last Attempt
              </th>
              <th scope="col" className="py-3 px-4 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {problems.map((problem) => {
              const latest = problem.latestAttempt;
              return (
                <tr
                  key={problem.id}
                  className="hover:bg-surface-hover/50 transition-colors group"
                >
                  {/* Problem Title & External Link */}
                  <td className="py-3 px-4 font-medium text-text max-w-xs">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="hover:text-accent font-medium text-xs transition-colors hover:underline truncate"
                        title={problem.title}
                      >
                        {problem.title}
                      </Link>
                      {problem.link && (
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-text p-0.5 rounded transition-colors shrink-0"
                          title="Open external problem link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <PlatformBadge platform={problem.platform} />
                  </td>

                  {/* Difficulty */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>

                  {/* Topics */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                      {problem.topics && problem.topics.length > 0 ? (
                        <>
                          {problem.topics.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-2 text-text-secondary border border-line"
                            >
                              {t}
                            </span>
                          ))}
                          {problem.topics.length > 2 && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-2 text-muted border border-line"
                              title={problem.topics.slice(2).join(', ')}
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
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={latest?.status || null} />
                  </td>

                  {/* Last Attempt */}
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-muted text-[11px]">
                    {formatRelativeDate(latest?.attemptedAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onLogAttempt(problem)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-surface-2 hover:bg-surface-hover text-text-secondary hover:text-text border border-line transition-colors"
                        title="Log practice attempt"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditProblem(problem)}
                        className="p-1 rounded text-muted hover:text-text hover:bg-surface-2 transition-colors focus-visible:ring-1 focus-visible:ring-accent"
                        title="Edit problem"
                        aria-label="Edit problem"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteProblem(problem)}
                        className="p-1 rounded text-muted hover:text-danger hover:bg-danger/10 transition-colors focus-visible:ring-1 focus-visible:ring-danger"
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
