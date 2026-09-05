import React from 'react';
import { Link } from 'react-router-dom';

const DIFFICULTY_CONFIG = {
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  hard: 'text-rose-400',
};

const STATUS_CONFIG = {
  solved: { label: 'Solved', badge: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60', dot: 'bg-emerald-500' },
  struggled: { label: 'Struggled', badge: 'text-rose-400 bg-rose-950/40 border-rose-900/60', dot: 'bg-rose-500' },
  revisit_needed: { label: 'Revisit', badge: 'text-amber-400 bg-amber-950/40 border-amber-900/60', dot: 'bg-amber-500' },
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  gfg: 'GFG',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'External',
};

const ProblemTable = ({
  problems,
  isLoading,
  error,
  onEdit,
  onDelete,
  onOpenAdd,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg p-8 text-center animate-pulse">
        <div className="inline-flex items-center space-x-2 text-slate-400 text-xs font-mono">
          <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading problem repository...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0d121f] border border-rose-900/60 rounded-lg p-6 text-center text-rose-300 text-xs">
        <p className="font-semibold text-rose-200">Unable to load problems</p>
        <p className="mt-1 text-rose-400">{error}</p>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="bg-[#0d121f] border border-dashed border-slate-800/80 rounded-lg p-12 text-center">
        <div className="w-9 h-9 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-xs mb-3">
          0
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">No problems found</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
          No problems match your search criteria, or you haven't cataloged any problems yet.
        </p>
        <div className="mt-4">
          <button
            onClick={onOpenAdd}
            type="button"
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded transition-colors shadow-sm"
          >
            + Add First Problem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-4">Problem</th>
              <th className="py-2.5 px-3">Platform</th>
              <th className="py-2.5 px-3">Difficulty</th>
              <th className="py-2.5 px-3">Topics</th>
              <th className="py-2.5 px-3">Latest Status</th>
              <th className="py-2.5 px-3 text-center">Attempts</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {problems.map((problem) => {
              const diffColor = DIFFICULTY_CONFIG[problem.difficulty] || 'text-slate-400';
              const latestStatus = problem.latestAttempt?.status;
              const statusCfg = latestStatus ? STATUS_CONFIG[latestStatus] : null;

              return (
                <tr
                  key={problem.id}
                  className="hover:bg-slate-900/60 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="font-medium text-slate-200 hover:text-white hover:underline transition-colors line-clamp-1"
                      >
                        {problem.title}
                      </Link>
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-300 transition-colors text-xs shrink-0"
                        title="Open external problem link"
                        aria-label={`Open ${problem.title} on external platform`}
                      >
                        ↗
                      </a>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-400 text-[11px]">
                      {PLATFORM_LABELS[problem.platform] || problem.platform}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`font-mono text-[11px] capitalize font-medium ${diffColor}`}>
                      {problem.difficulty}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {problem.topics && problem.topics.length > 0 ? (
                        problem.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="px-1.5 py-0.2 rounded bg-slate-900/90 text-slate-400 border border-slate-800 text-[10px] font-mono"
                          >
                            {topic}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                      {problem.topics && problem.topics.length > 3 && (
                        <span className="text-slate-500 text-[10px] self-center font-mono">
                          +{problem.topics.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {statusCfg ? (
                      <span
                        className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${statusCfg.badge}`}
                      >
                        <span className={`w-1 h-1 rounded-full ${statusCfg.dot}`}></span>
                        <span>{statusCfg.label}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-mono">Unattempted</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-slate-400 text-xs">
                      {problem.attemptCount || 0}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1 font-mono text-xs">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        Workspace
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(problem)}
                        className="px-2 py-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(problem)}
                        className="px-2 py-0.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        Delete
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

