import React from 'react';
import { Link } from 'react-router-dom';

const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
  medium: 'bg-amber-950/60 text-amber-400 border-amber-800/80',
  hard: 'bg-rose-950/60 text-rose-400 border-rose-800/80',
};

const STATUS_STYLES = {
  solved: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/80',
  struggled: 'bg-rose-950/50 text-rose-400 border-rose-800/80',
  revisit_needed: 'bg-amber-950/50 text-amber-400 border-amber-800/80',
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  gfg: 'GFG',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'Other',
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
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center animate-pulse">
        <div className="inline-flex items-center space-x-2 text-slate-400 text-xs">
          <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading problem repository...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/30 border border-rose-800/80 rounded-lg p-6 text-center text-rose-300 text-xs">
        <p className="font-semibold text-rose-200">Unable to load problems</p>
        <p className="mt-1 text-rose-400">{error}</p>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="bg-slate-900 border border-dashed border-slate-800 rounded-lg p-12 text-center">
        <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-mono text-xs mb-3">
          0
        </div>
        <h3 className="text-sm font-semibold text-slate-200">No problems found</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
          No problems match your search criteria, or you haven't tracked any problems yet.
        </p>
        <div className="mt-5">
          <button
            onClick={onOpenAdd}
            type="button"
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-md transition-colors shadow-sm"
          >
            + Add First Problem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
              <th className="py-3 px-4">Problem</th>
              <th className="py-3 px-3">Platform</th>
              <th className="py-3 px-3">Difficulty</th>
              <th className="py-3 px-3">Topics</th>
              <th className="py-3 px-3">Latest Status</th>
              <th className="py-3 px-3">Attempts</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {problems.map((problem) => {
              const diffStyle = DIFFICULTY_STYLES[problem.difficulty] || 'bg-slate-800 text-slate-300';
              const latestStatus = problem.latestAttempt?.status;
              const statusStyle = latestStatus
                ? STATUS_STYLES[latestStatus] || 'bg-slate-800 text-slate-300'
                : 'bg-slate-800/60 text-slate-400 border-slate-700';

              return (
                <tr
                  key={problem.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="font-medium text-white hover:text-emerald-400 transition-colors line-clamp-1"
                      >
                        {problem.title}
                      </Link>
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-300 transition-colors text-xs shrink-0"
                        title="Open problem in new tab"
                        aria-label={`Open ${problem.title} on external platform`}
                      >
                        ↗
                      </a>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-400 uppercase text-[10px] tracking-wider">
                      {PLATFORM_LABELS[problem.platform] || problem.platform}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${diffStyle}`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {problem.topics && problem.topics.length > 0 ? (
                        problem.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-mono"
                          >
                            {topic}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                      {problem.topics && problem.topics.length > 3 && (
                        <span className="text-slate-500 text-[10px] self-center">
                          +{problem.topics.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${statusStyle}`}
                    >
                      {latestStatus ? latestStatus.replace('_', ' ') : 'Unattempted'}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-400 text-xs">
                      {problem.attemptCount || 0}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(problem)}
                        className="px-2 py-1 rounded text-xs text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(problem)}
                        className="px-2 py-1 rounded text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
