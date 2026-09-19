import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  struggled: { label: 'Struggled', text: 'text-danger', dot: 'bg-danger' },
  revisit_needed: { label: 'Revisit', text: 'text-medium', dot: 'bg-medium' },
  solved: { label: 'Solved', text: 'text-success', dot: 'bg-success' },
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
      <div className={`bg-surface rounded-xl border border-line animate-pulse overflow-hidden h-full flex flex-col justify-between ${className}`}>
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-line">
          <div className="h-4 w-32 shimmer rounded-md" />
          <div className="h-4 w-14 shimmer rounded-md" />
        </div>
        <div className="divide-y divide-line">
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
      <div className={`bg-surface rounded-xl border border-danger/25 p-5 h-full flex flex-col justify-between ${className}`}>
        <h3 className="text-sm font-semibold text-text mb-3">Revision Queue</h3>
        <div className="h-28 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-danger mb-2">Unable to load revision queue.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-secondary text-xs">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const previewItems = queue.slice(0, 4);

  return (
    <div className={`panel overflow-hidden transition-all flex flex-col justify-between h-full ${className}`}>
      <div className="px-5 py-4 border-b border-line bg-surface-2/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-text tracking-tight">Revision Queue</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums bg-accent/12 border border-accent/25 text-accent">
            {queue.length} due
          </span>
        </div>
        <Link
          to="/revision"
          className="text-xs text-muted hover:text-text transition-colors font-medium flex items-center gap-1 group"
        >
          <span>View all</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      {previewItems.length === 0 ? (
        <div className="py-12 text-center px-4 flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-success/12 border border-success/25 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <p className="text-sm font-semibold text-text">Queue is clear</p>
          <p className="text-xs text-muted mt-1">No revision items due right now.</p>
        </div>
      ) : (
        <div className="divide-y divide-line flex-1 flex flex-col justify-between">
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
                className="px-5 py-3.5 block hover:bg-surface-2 transition-colors duration-150 group"
              >
                {/* Tier 1: Index + Problem Title + Priority Score */}
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-xs font-medium tabular-nums text-muted shrink-0 w-4">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-text group-hover:text-accent line-clamp-2 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="text-xs text-muted font-medium">Priority</span>
                    <span className="text-xs font-semibold tabular-nums text-accent">
                      {item.priorityScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Tier 2: Topics, Difficulty, Platform and Status */}
                <div className="flex items-center justify-between gap-2 pl-6.5 text-xs">
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0 text-muted">
                    <span className="truncate">{topicStr || 'Algorithm'}</span>
                    <span className="text-line">·</span>
                    <span className="shrink-0">{diffLabel}</span>
                    <span className="text-line">·</span>
                    <span className="uppercase tracking-wide shrink-0">{platformLabel}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    <span className={`text-xs font-medium ${statusCfg.text}`}>{statusCfg.label}</span>
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
