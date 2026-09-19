import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  struggled: { label: 'Struggled', text: 'text-rose-400', dot: 'bg-rose-400' },
  revisit_needed: { label: 'Revisit', text: 'text-amber-400', dot: 'bg-amber-400' },
  solved: { label: 'Solved', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const PLATFORM_LABELS = {
  leetcode: 'LC',
  gfg: 'GFG',
  codechef: 'CC',
  hackerrank: 'HR',
  other: 'Ext',
};

const RevisionPreview = ({ queue = [], isLoading = false, error = null, onRetry, className = '' }) => {
  if (isLoading) {
    return (
      <div className={`bg-[#131722]/60 backdrop-blur-xl rounded-2xl border border-white/[0.08] animate-pulse overflow-hidden h-full flex flex-col justify-between ${className}`}>
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-white/[0.08]">
          <div className="h-4 w-32 shimmer rounded-md" />
          <div className="h-4 w-14 shimmer rounded-md" />
        </div>
        <div className="divide-y divide-white/[0.06]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-3">
              <div className="h-3 w-4 shimmer rounded" />
              <div className="flex-1">
                <div className="h-3.5 w-44 shimmer rounded-md mb-1.5" />
                <div className="h-2.5 w-28 shimmer rounded-md" />
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
      <div className={`bg-[#131722]/60 backdrop-blur-xl rounded-2xl border border-rose-500/20 p-5 h-full flex flex-col justify-between ${className}`}>
        <h3 className="text-sm font-bold text-white mb-3">Revision Queue</h3>
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

  const previewItems = queue.slice(0, 4);

  return (
    <div className={`panel border-white/[0.08] overflow-hidden transition-all flex flex-col justify-between h-full ${className}`}>
      <div className="px-5 py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-white tracking-tight">Revision Queue</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-orange-500/10 border border-orange-500/25 text-orange-400">
            {queue.length} due
          </span>
        </div>
        <Link
          to="/revision"
          className="text-xs text-slate-400 hover:text-white transition-colors font-medium flex items-center gap-1 group"
        >
          <span>View all</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      {previewItems.length === 0 ? (
        <div className="py-12 text-center px-4 flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-200">Queue is clear</p>
          <p className="text-xs text-slate-400 mt-1">No revision items due right now.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06] flex-1 flex flex-col justify-between">
          {previewItems.map((item, idx) => {
            const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
            const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
            const diffLabel = DIFFICULTY_LABELS[item.difficulty] || item.difficulty;
            const platformLabel = PLATFORM_LABELS[item.platform] || item.platform;
            const topicStr = item.topics?.length > 0 ? item.topics.slice(0, 2).join(', ') : '';

            return (
              <Link
                key={item.problemId}
                to={`/problems/${item.problemId}`}
                className="px-5 py-3.5 block hover:bg-white/[0.04] transition-colors duration-150 group"
              >
                {/* Tier 1: Index + Problem Title + Priority Score */}
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="font-mono text-xs font-semibold text-slate-500 shrink-0 w-4">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-orange-400 line-clamp-2 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="text-[10px] font-mono text-slate-500 font-medium">Priority</span>
                    <span className="text-xs font-mono font-bold text-orange-400">
                      {item.priorityScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Tier 2: Topics, Difficulty, Platform and Status */}
                <div className="flex items-center justify-between gap-2 pl-6.5 text-[11px] font-mono">
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0 text-slate-400">
                    <span className="truncate">{topicStr || 'Algorithm'}</span>
                    <span className="text-slate-600">·</span>
                    <span className="shrink-0">{diffLabel}</span>
                    <span className="text-slate-600">·</span>
                    <span className="uppercase tracking-wide shrink-0">{platformLabel}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    <span className={`text-[11px] font-medium ${statusCfg.text}`}>{statusCfg.label}</span>
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
