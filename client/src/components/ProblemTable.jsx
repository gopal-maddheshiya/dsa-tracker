import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Badge from './ui/Badge';
import { FolderOpen } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  easy:   { variant: 'easy',   label: 'Easy',   weight: 1 },
  medium: { variant: 'medium', label: 'Medium', weight: 2 },
  hard:   { variant: 'hard',   label: 'Hard',   weight: 3 },
};

const STATUS_CONFIG = {
  solved:         { label: 'Solved',         text: 'text-emerald-400', dot: 'bg-emerald-400' },
  struggled:      { label: 'Struggled',      text: 'text-rose-400',    dot: 'bg-rose-400' },
  revisit_needed: { label: 'Revisit Needed', text: 'text-amber-400',   dot: 'bg-amber-400' },
};

const PLATFORM_CONFIG = {
  leetcode:   { label: 'LC',  style: 'text-[#F97316] bg-amber-500/10 border-amber-500/20' },
  gfg:        { label: 'GFG', style: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  codechef:   { label: 'CC',  style: 'text-amber-300 bg-amber-600/10 border-amber-600/20' },
  hackerrank: { label: 'HR',  style: 'text-emerald-300 bg-emerald-600/10 border-emerald-600/20' },
  other:      { label: 'Ext', style: 'text-[#A8A29E] bg-[#141312] border-[#262320]' },
};

const ProblemTable = ({ problems, isLoading, error, onEdit, onDelete, onOpenAdd, onLog, startIndex = 0 }) => {
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedProblems = useMemo(() => {
    if (!problems || !sortField) return problems;
    return [...problems].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'difficulty') {
        valA = DIFFICULTY_CONFIG[a.difficulty]?.weight || 0;
        valB = DIFFICULTY_CONFIG[b.difficulty]?.weight || 0;
      } else if (sortField === 'sessions') {
        valA = a.attemptCount || 0;
        valB = b.attemptCount || 0;
      } else if (sortField === 'title') {
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
      } else if (sortField === 'status') {
        valA = a.latestAttempt?.status || '';
        valB = b.latestAttempt?.status || '';
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [problems, sortField, sortAsc]);

  if (isLoading) {
    return (
      <div className="panel overflow-hidden animate-pulse border-white/[0.08]">
        <div className="flex gap-4 px-6 py-3.5 bg-[#0F1114] border-b border-white/[0.08]">
          {[40, 200, 140, 80, 80, 80, 60, 100].map((w, i) => (
            <div key={i} className="h-3 shimmer rounded-md" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y divide-white/[0.05]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 px-6 py-4 items-center">
              <div className="h-3.5 w-8 shimmer rounded-md" />
              <div className="h-3.5 w-48 shimmer rounded-md" />
              <div className="h-3 w-28 shimmer rounded-md" />
              <div className="h-4 w-14 shimmer rounded-md" />
              <div className="h-3 w-10 shimmer rounded-md" />
              <div className="h-3 w-16 shimmer rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-8 text-center border-rose-500/20">
        <p className="text-sm font-semibold text-rose-300">Unable to load problems</p>
        <p className="text-xs text-rose-400 mt-1">{error}</p>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="panel border-dashed p-14 text-center border-white/[0.1] bg-[#121418]">
        <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-6 h-6 text-[#9CA3AF]" />
        </div>
        <h3 className="text-base font-bold text-[#F3F4F6] tracking-tight">No problems found</h3>
        <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs mx-auto leading-relaxed">
          No problems match your search or filters. Catalog your first problem to get started.
        </p>
        <button onClick={onOpenAdd} type="button" className="btn-primary text-xs mt-5">
          + Add First Problem
        </button>
      </div>
    );
  }

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return <span className="ml-1 text-[10px] text-[#F97316] font-mono">{sortAsc ? '↑' : '↓'}</span>;
  };

  return (
    <div className="panel overflow-hidden border-white/[0.08]">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12 text-center text-[#6B6560] font-mono">#</th>
              <th
                onClick={() => handleSort('title')}
                className="cursor-pointer select-none hover:text-[#F5F5F4] transition-colors"
              >
                Problem {renderSortIndicator('title')}
              </th>
              <th>Topics</th>
              <th
                onClick={() => handleSort('difficulty')}
                className="cursor-pointer select-none hover:text-[#F5F5F4] transition-colors"
              >
                Difficulty {renderSortIndicator('difficulty')}
              </th>
              <th>Platform</th>
              <th
                onClick={() => handleSort('status')}
                className="cursor-pointer select-none hover:text-[#F5F5F4] transition-colors"
              >
                Status {renderSortIndicator('status')}
              </th>
              <th
                onClick={() => handleSort('sessions')}
                className="text-center cursor-pointer select-none hover:text-[#F5F5F4] transition-colors"
              >
                Sessions {renderSortIndicator('sessions')}
              </th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProblems.map((problem, idx) => {
              const diff = DIFFICULTY_CONFIG[problem.difficulty] || { variant: 'default', label: problem.difficulty };
              const latestStatus = problem.latestAttempt?.status;
              const statusCfg = latestStatus ? STATUS_CONFIG[latestStatus] : null;
              const platformCfg = PLATFORM_CONFIG[problem.platform] || PLATFORM_CONFIG.other;

              return (
                <tr key={problem.id} className="hover:bg-[#171A20] transition-colors duration-150 group">
                  {/* # Index Column */}
                  <td className="text-center font-mono text-[11px] text-[#6B7280]">
                    {String(startIndex + idx + 1).padStart(2, '0')}
                  </td>

                  {/* Problem Title & External Link */}
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="font-semibold text-[#F3F4F6] group-hover:text-[#FB923C] transition-colors truncate max-w-[280px] text-[13px]"
                      >
                        {problem.title}
                      </Link>
                      {problem.link && (
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noreferrer"
                          title="Open original problem in new tab"
                          className="text-[#6B7280] hover:text-[#9CA3AF] transition-colors shrink-0 text-xs opacity-60 group-hover:opacity-100"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Topic Pills */}
                  <td>
                    {problem.topics?.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {problem.topics.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.07] text-[#9CA3AF]"
                          >
                            {t}
                          </span>
                        ))}
                        {problem.topics.length > 2 && (
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.07] text-[#6B7280]"
                            title={problem.topics.slice(2).join(', ')}
                          >
                            +{problem.topics.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-[#6B7280] font-mono">—</span>
                    )}
                  </td>

                  {/* Difficulty Badge */}
                  <td>
                    <Badge variant={diff.variant}>{diff.label}</Badge>
                  </td>

                  {/* Brand Platform Badge */}
                  <td>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${platformCfg.style}`}>
                      {platformCfg.label}
                    </span>
                  </td>

                  {/* Status Indicator */}
                  <td>
                    {statusCfg ? (
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusCfg.dot}`} />
                        <span className={`text-xs font-semibold ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#6B7280] font-mono">Unattempted</span>
                    )}
                  </td>

                  {/* Session Count */}
                  <td className="text-center">
                    <span className="font-mono text-xs font-semibold text-[#9CA3AF] px-2 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.07]">
                      {problem.attemptCount || 0}
                    </span>
                  </td>

                  {/* Enhanced Icon Actions */}
                  <td>
                    <div className="flex items-center justify-end gap-1.5 text-xs">
                      {/* 1-Click Quick Log Attempt */}
                      {onLog && (
                        <button
                          type="button"
                          onClick={() => onLog(problem)}
                          title={`Log attempt for "${problem.title}"`}
                          className="px-2 py-1 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 transition-all font-mono text-[11px] font-semibold flex items-center gap-1 shrink-0 mr-1"
                        >
                          <span className="text-xs leading-none font-bold">+</span>
                          <span>Log</span>
                        </button>
                      )}

                      {/* View Action */}
                      <Link
                        to={`/problems/${problem.id}`}
                        title="View problem details"
                        className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#F5F5F4] hover:bg-[#211F1D] border border-transparent hover:border-[#262320] transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>

                      {/* Edit Action */}
                      <button
                        type="button"
                        onClick={() => onEdit(problem)}
                        title="Edit problem details"
                        className="p-1.5 rounded-lg text-[#6B6560] hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => onDelete(problem)}
                        title="Delete problem"
                        className="p-1.5 rounded-lg text-[#6B6560] hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
};

export default ProblemTable;
