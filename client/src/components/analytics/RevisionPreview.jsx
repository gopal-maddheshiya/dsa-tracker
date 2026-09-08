import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  struggled: { label: 'Struggled', text: 'text-rose-400', dot: 'bg-rose-400' },
  revisit_needed: { label: 'Revisit', text: 'text-amber-400', dot: 'bg-amber-400' },
  solved: { label: 'Solved', text: 'text-[#F97316]', dot: 'bg-[#F97316]' },
};

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const PLATFORM_LABELS = {
  leetcode: 'LeetCode', gfg: 'GFG', codechef: 'CodeChef',
  hackerrank: 'HackerRank', other: 'External',
};

const RevisionPreview = ({ queue = [], isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="panel animate-pulse">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#2E2A27]">
          <div className="h-4 w-36 shimmer rounded-md" />
          <div className="h-4 w-16 shimmer rounded-md" />
        </div>
        <div className="divide-y divide-[#2E2A27]/60">
          {[1,2,3,4].map(i => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-3">
              <div className="h-3 w-6 shimmer rounded" />
              <div className="flex-1">
                <div className="h-3.5 w-48 shimmer rounded-md mb-1.5" />
                <div className="h-2.5 w-32 shimmer rounded-md" />
              </div>
              <div className="h-3 w-10 shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F4] mb-3">Revision Queue</h3>
        <div className="h-28 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-rose-400 mb-2">Unable to load revision queue.</p>
          {onRetry && <button onClick={onRetry} type="button" className="btn-ghost">Retry</button>}
        </div>
      </div>
    );
  }

  const previewItems = queue.slice(0, 5);

  return (
    <div className="panel overflow-hidden">
      <div className="px-5 py-4 border-b border-[#2E2A27] bg-[#141312] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-[#F5F5F4]">Revision Queue</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
            {queue.length} due
          </span>
        </div>
        <Link to="/revision" className="text-xs text-[#78716C] hover:text-[#F5F5F4] transition-colors">
          View all →
        </Link>
      </div>

      {previewItems.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-8 h-8 rounded-lg bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-[#F97316] text-sm">✓</span>
          </div>
          <p className="text-sm font-medium text-[#A8A29E]">Queue is clear</p>
          <p className="text-xs text-[#78716C] mt-1">No revision items due right now.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#2E2A27]/60">
          {previewItems.map((item, idx) => {
            const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
            const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
            const diffLabel = DIFFICULTY_LABELS[item.difficulty] || item.difficulty;
            const platformLabel = PLATFORM_LABELS[item.platform] || item.platform;
            const topicStr = item.topics?.length > 0 ? item.topics.slice(0, 2).join(' · ') : '';
            const metaLine = [topicStr, `${diffLabel} · ${platformLabel}`].filter(Boolean).join('  —  ');

            return (
              <Link key={item.problemId} to={`/problems/${item.problemId}`}
                className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#211F1D] transition-colors group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono text-[10px] text-[#78716C] shrink-0 w-4">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-[#F5F5F4] font-medium group-hover:text-white truncate transition-colors">
                      {item.title}
                    </div>
                    {metaLine && <div className="text-[11px] text-[#78716C] mt-0.5 truncate">{metaLine}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    <span className={`text-xs ${statusCfg.text}`}>{statusCfg.label}</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-[#A8A29E] min-w-[36px] text-right">
                    {item.priorityScore.toFixed(2)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RevisionPreview;
