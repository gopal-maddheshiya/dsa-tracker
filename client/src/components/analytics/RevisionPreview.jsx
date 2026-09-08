import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  struggled:      { label: 'Struggled', text: 'text-rose-400',    dot: 'bg-rose-400' },
  revisit_needed: { label: 'Revisit',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  solved:         { label: 'Solved',    text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const PLATFORM_LABELS = {
  leetcode: 'LC',
  gfg: 'GFG',
  codechef: 'CC',
  hackerrank: 'HR',
  other: 'Ext',
};

const RevisionPreview = ({ queue = [], isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="panel animate-pulse border-white/[0.08]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.08]">
          <div className="h-4 w-36 shimmer rounded-md" />
          <div className="h-4 w-16 shimmer rounded-md" />
        </div>
        <div className="divide-y divide-white/[0.08]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-3">
              <div className="h-3 w-6 shimmer rounded" />
              <div className="flex-1">
                <div className="h-3.5 w-48 shimmer rounded-md mb-1.5" />
                <div className="h-2.5 w-32 shimmer rounded-md" />
              </div>
              <div className="h-3 w-12 shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-6 border-rose-500/20">
        <h3 className="text-sm font-bold text-[#F3F4F6] mb-3">Revision Queue</h3>
        <div className="h-28 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-rose-400 mb-2">Unable to load revision queue.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-ghost text-xs">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const previewItems = queue.slice(0, 5);

  return (
    <div className="panel overflow-hidden border-white/[0.08]">
      <div className="px-6 py-4 border-b border-white/[0.08] bg-[#0E1015] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-[#F3F4F6] tracking-tight">Revision Queue</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316]">
            {queue.length} due
          </span>
        </div>
        <Link
          to="/revision"
          className="text-xs text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors font-medium flex items-center gap-1"
        >
          <span>View all</span>
          <span>→</span>
        </Link>
      </div>

      {previewItems.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-[#F3F4F6]">Queue is clear</p>
          <p className="text-xs text-[#9CA3AF] mt-1">No revision items due right now.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.08]">
          {previewItems.map((item, idx) => {
            const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
            const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
            const diffLabel = DIFFICULTY_LABELS[item.difficulty] || item.difficulty;
            const platformLabel = PLATFORM_LABELS[item.platform] || item.platform;
            const topicStr = item.topics?.length > 0 ? item.topics.slice(0, 2).join(', ') : '';
            const metaLine = [topicStr, `${diffLabel} · ${platformLabel}`].filter(Boolean).join('  ·  ');

            return (
              <Link
                key={item.problemId}
                to={`/problems/${item.problemId}`}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#181B20] transition-colors duration-150 group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="font-mono text-xs font-semibold text-[#9CA3AF] shrink-0 w-5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#F3F4F6] group-hover:text-[#F97316] truncate transition-colors">
                      {item.title}
                    </div>
                    {metaLine && (
                      <div className="text-xs font-mono text-[#9CA3AF] mt-0.5 truncate">
                        {metaLine}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    <span className={`text-xs font-semibold ${statusCfg.text}`}>{statusCfg.label}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-[#F97316] min-w-[36px] text-right">
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
