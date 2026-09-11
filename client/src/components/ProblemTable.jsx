import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Badge from './ui/Badge';
import {
  FolderOpen,
  ExternalLink,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';

const DIFFICULTY_CONFIG = {
  easy:   { variant: 'easy',   label: 'Easy',   weight: 1 },
  medium: { variant: 'medium', label: 'Medium', weight: 2 },
  hard:   { variant: 'hard',   label: 'Hard',   weight: 3 },
};

const STATUS_CONFIG = {
  solved: {
    label: 'Solved',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.15)]',
  },
  struggled: {
    label: 'Struggled',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/25',
    dot: 'bg-rose-400',
    glow: 'shadow-[0_0_8px_rgba(244,63,94,0.15)]',
  },
  revisit_needed: {
    label: 'Revisit Needed',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/25',
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_8px_rgba(245,158,11,0.15)]',
  },
};

const PLATFORM_CONFIG = {
  leetcode:   { label: 'LeetCode', short: 'LC', style: 'text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.08)]', dot: 'bg-amber-400' },
  gfg:        { label: 'GeeksforGeeks', short: 'GFG', style: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.08)]', dot: 'bg-emerald-400' },
  codechef:   { label: 'CodeChef', short: 'CC', style: 'text-amber-300 bg-amber-600/10 border-amber-600/25 shadow-[0_0_8px_rgba(217,119,6,0.08)]', dot: 'bg-amber-300' },
  hackerrank: { label: 'HackerRank', short: 'HR', style: 'text-green-400 bg-green-500/10 border-green-500/25 shadow-[0_0_8px_rgba(34,197,94,0.08)]', dot: 'bg-green-400' },
  other:      { label: 'External', short: 'Ext', style: 'text-[#9CA3AF] bg-white/[0.04] border-white/[0.08]', dot: 'bg-[#9CA3AF]' },
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

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#4B5563] opacity-0 group-hover:opacity-70 transition-opacity" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-[#F97316]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#F97316]" />
    );
  };

  if (isLoading) {
    return (
      <div className="panel overflow-hidden animate-pulse border-white/[0.08] rounded-2xl">
        <div className="flex gap-4 px-6 py-4 bg-[#0F1114] border-b border-white/[0.08]">
          {[40, 220, 140, 90, 80, 90, 60, 100].map((w, i) => (
            <div key={i} className="h-3 shimmer rounded-md" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-4 px-6 py-4 items-center">
              <div className="h-3.5 w-8 shimmer rounded-md" />
              <div className="h-3.5 w-56 shimmer rounded-md" />
              <div className="h-3 w-32 shimmer rounded-md" />
              <div className="h-4 w-16 shimmer rounded-md" />
              <div className="h-3 w-12 shimmer rounded-md" />
              <div className="h-3 w-20 shimmer rounded-md" />
              <div className="h-3 w-10 shimmer rounded-md mx-auto" />
              <div className="h-4 w-20 shimmer rounded-md ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-8 text-center border-rose-500/20 rounded-2xl bg-rose-500/[0.03]">
        <p className="text-sm font-semibold text-rose-300">Unable to load problems</p>
        <p className="text-xs text-rose-400 mt-1">{error}</p>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="panel border-dashed p-14 text-center border-white/[0.1] bg-[#121418] rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[#181B20] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 shadow-sm">
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

  return (
    <div className="panel overflow-hidden border-white/[0.08] rounded-2xl bg-[#0E1013]/90 shadow-xl">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[760px] w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#14171C]/60 text-[#6B7280] text-xs font-mono tracking-wider">
              <th className="w-12 text-center py-3.5 px-3">#</th>
              <th
                onClick={() => handleSort('title')}
                className="py-3.5 px-3 cursor-pointer select-none hover:text-[#F3F4F6] transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Problem</span>
                  {renderSortIndicator('title')}
                </div>
              </th>
              <th className="py-3.5 px-3">Topics</th>
              <th
                onClick={() => handleSort('difficulty')}
                className="py-3.5 px-3 cursor-pointer select-none hover:text-[#F3F4F6] transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Difficulty</span>
                  {renderSortIndicator('difficulty')}
                </div>
              </th>
              <th className="py-3.5 px-3">Platform</th>
              <th
                onClick={() => handleSort('status')}
                className="py-3.5 px-3 cursor-pointer select-none hover:text-[#F3F4F6] transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIndicator('status')}
                </div>
              </th>
              <th
                onClick={() => handleSort('sessions')}
                className="text-center py-3.5 px-3 cursor-pointer select-none hover:text-[#F3F4F6] transition-colors group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Sessions</span>
                  {renderSortIndicator('sessions')}
                </div>
              </th>
              <th className="text-right py-3.5 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {sortedProblems.map((problem, idx) => {
              const diff = DIFFICULTY_CONFIG[problem.difficulty] || { variant: 'default', label: problem.difficulty };
              const latestStatus = problem.latestAttempt?.status;
              const statusCfg = latestStatus ? STATUS_CONFIG[latestStatus] : null;
              const platformCfg = PLATFORM_CONFIG[problem.platform] || PLATFORM_CONFIG.other;

              return (
                <tr
                  key={problem.id}
                  className="hover:bg-[#14171D] transition-colors duration-150 group relative"
                >
                  {/* # Index Column with subtle hover accent */}
                  <td className="text-center font-mono text-[11px] text-[#6B7280] py-3.5 px-3 relative">
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {String(startIndex + idx + 1).padStart(2, '0')}
                  </td>

                  {/* Problem Title & External Link */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2 max-w-[300px]">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="font-semibold text-[#F3F4F6] group-hover:text-[#FB923C] transition-colors truncate text-[13px] tracking-tight"
                        title={problem.title}
                      >
                        {problem.title}
                      </Link>
                      {problem.link && (
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noreferrer"
                          title="Open original problem in new tab"
                          className="text-[#6B7280] hover:text-[#F97316] transition-colors shrink-0 p-1 -m-1 rounded hover:bg-white/[0.05]"
                        >
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Topic Pills */}
                  <td className="py-3.5 px-3">
                    {problem.topics?.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {problem.topics.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.08] text-[#9CA3AF] group-hover:border-white/[0.14] transition-colors"
                          >
                            {t}
                          </span>
                        ))}
                        {problem.topics.length > 2 && (
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.08] text-[#6B7280]"
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

                  {/* Difficulty Badge with pulsing dot */}
                  <td className="py-3.5 px-3">
                    <Badge variant={diff.variant} dot size="sm">
                      {diff.label}
                    </Badge>
                  </td>

                  {/* Brand Platform Badge */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${platformCfg.style}`}
                      title={platformCfg.label}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${platformCfg.dot}`} />
                      <span>{platformCfg.short}</span>
                    </span>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-3.5 px-3">
                    {statusCfg ? (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.glow}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
                        <span>{statusCfg.label}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-mono text-[#6B7280] px-2 py-0.5 rounded-md bg-[#0D0F13] border border-white/[0.06]">
                        Unattempted
                      </span>
                    )}
                  </td>

                  {/* Session Count */}
                  <td className="text-center py-3.5 px-3">
                    <span className="inline-block font-mono text-xs font-semibold text-[#9CA3AF] px-2.5 py-0.5 rounded-lg bg-[#0D0F13] border border-white/[0.08] group-hover:border-white/[0.14] transition-colors">
                      {problem.attemptCount || 0}
                    </span>
                  </td>

                  {/* Enhanced Icon Actions */}
                  <td className="text-right py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1.5 text-xs">
                      {/* 1-Click Quick Log Attempt */}
                      {onLog && (
                        <button
                          type="button"
                          onClick={() => onLog(problem)}
                          title={`Log attempt for "${problem.title}"`}
                          className="px-2.5 py-1 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 transition-all font-mono text-[11px] font-semibold flex items-center gap-1 shrink-0 shadow-sm active:scale-95 mr-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                          <span>Log</span>
                        </button>
                      )}

                      {/* View Action */}
                      <Link
                        to={`/problems/${problem.id}`}
                        title="View problem details"
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.1] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {/* Edit Action */}
                      <button
                        type="button"
                        onClick={() => onEdit(problem)}
                        title="Edit problem details"
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => onDelete(problem)}
                        title="Delete problem"
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
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
};

export default ProblemTable;
