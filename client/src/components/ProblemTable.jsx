import React from 'react';
import { Link } from 'react-router-dom';

const DIFFICULTY_STYLES = {
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  hard: 'text-red-400',
};

const STATUS_CONFIG = {
  solved: { label: 'Solved', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  struggled: { label: 'Struggled', text: 'text-red-400', dot: 'bg-red-400' },
  revisit_needed: { label: 'Revisit', text: 'text-amber-400', dot: 'bg-amber-400' },
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode', gfg: 'GFG', codechef: 'CodeChef',
  hackerrank: 'HackerRank', other: 'External',
};

const ProblemTable = ({ problems, isLoading, error, onEdit, onDelete, onOpenAdd }) => {
  if (isLoading) {
    return (
      <div className="panel overflow-hidden animate-pulse">
        <div className="flex gap-4 px-4 py-3 bg-[#141312] border-b border-[#2E2A27]">
          {[200,120,80,80,80,60,100].map((w,i) => (
            <div key={i} className="h-3 shimmer rounded-md" style={{ width: w }} />
          ))}
        </div>
        <div className="divide-y divide-[#2E2A27]/60">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex gap-4 px-4 py-4 items-center">
              <div className="h-3.5 w-48 shimmer rounded-md" />
              <div className="h-3 w-24 shimmer rounded-md" />
              <div className="h-3 w-14 shimmer rounded-md" />
              <div className="h-3 w-14 shimmer rounded-md" />
              <div className="h-3 w-14 shimmer rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm font-medium text-rose-300">Unable to load problems</p>
        <p className="text-xs text-rose-400 mt-1">{error}</p>
      </div>
    );
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="panel border-dashed p-14 text-center">
        <div className="w-10 h-10 rounded-xl bg-[#211F1D] border border-[#2E2A27] flex items-center justify-center mx-auto mb-4">
          <span className="text-[#78716C] text-lg">📂</span>
        </div>
        <h3 className="text-sm font-semibold text-[#F5F5F4]">No problems found</h3>
        <p className="text-xs text-[#78716C] mt-1 max-w-xs mx-auto leading-relaxed">
          No problems match your filters, or you haven't cataloged any yet.
        </p>
        <button onClick={onOpenAdd} type="button" className="btn-primary text-xs mt-5">
          + Add First Problem
        </button>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>Topics</th>
              <th>Difficulty</th>
              <th>Platform</th>
              <th>Status</th>
              <th className="text-center">Sessions</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => {
              const diffClass = DIFFICULTY_STYLES[problem.difficulty] || 'text-[#A8A29E]';
              const latestStatus = problem.latestAttempt?.status;
              const statusCfg = latestStatus ? STATUS_CONFIG[latestStatus] : null;
              const topicsString = problem.topics?.length > 0 ? problem.topics.join(' · ') : '—';

              return (
                <tr key={problem.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link to={`/problems/${problem.id}`}
                        className="font-medium text-[#F5F5F4] hover:text-[#FB923C] hover:underline transition-colors truncate max-w-[260px] text-[13px]">
                        {problem.title}
                      </Link>
                      <a href={problem.link} target="_blank" rel="noreferrer"
                        className="text-[#78716C] hover:text-[#A8A29E] transition-colors shrink-0 text-xs">↗</a>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-[#A8A29E] truncate max-w-[160px] block" title={topicsString}>
                      {topicsString}
                    </span>
                  </td>
                  <td>
                    <span className={`text-xs capitalize font-semibold ${diffClass}`}>{problem.difficulty}</span>
                  </td>
                  <td>
                    <span className="text-[11px] text-[#78716C]">
                      {PLATFORM_LABELS[problem.platform] || problem.platform}
                    </span>
                  </td>
                  <td>
                    {statusCfg ? (
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                        <span className={`text-xs ${statusCfg.text}`}>{statusCfg.label}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#78716C]">—</span>
                    )}
                  </td>
                  <td className="text-center">
                    <span className="font-mono text-xs text-[#A8A29E]">{problem.attemptCount || 0}</span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-3 text-xs">
                      <Link to={`/problems/${problem.id}`} className="text-[#78716C] hover:text-[#F5F5F4] transition-colors">Open</Link>
                      <button type="button" onClick={() => onEdit(problem)} className="text-[#78716C] hover:text-[#A8A29E] transition-colors">Edit</button>
                      <button type="button" onClick={() => onDelete(problem)} className="text-[#78716C] hover:text-red-400 transition-colors">Delete</button>
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
