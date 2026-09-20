import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCcw } from 'lucide-react';

const STATUS_CONFIG = {
  struggled: { label: 'Struggled', text: 'text-danger', bg: 'bg-danger/10 border-danger/20', dot: 'bg-danger' },
  revisit_needed: { label: 'Revisit', text: 'text-medium', bg: 'bg-medium/10 border-medium/20', dot: 'bg-medium' },
  solved: { label: 'Due', text: 'text-success', bg: 'bg-success/10 border-success/20', dot: 'bg-success' },
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', text: 'text-easy', dot: 'bg-easy' },
  medium: { label: 'Medium', text: 'text-medium', dot: 'bg-medium' },
  hard: { label: 'Hard', text: 'text-hard', dot: 'bg-hard' },
};

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
        <div className="flex justify-between items-center px-4 sm:px-5 py-3.5 border-b border-line">
          <div className="h-4 w-32 shimmer rounded-md" />
          <div className="h-4 w-14 shimmer rounded-md" />
        </div>
        <div className="divide-y divide-line">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 sm:px-5 py-3 flex items-center gap-3">
              <div className="h-4 w-4 shimmer rounded" />
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
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-line bg-surface-2/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/12 border border-accent/25 flex items-center justify-center text-accent shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text tracking-tight leading-none">Revision Queue</h3>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums bg-accent/12 border border-accent/25 text-accent">
                {queue.length} due
              </span>
            </div>
            <span className="text-[10px] text-muted font-medium mt-0.5 block leading-none">Spaced Recall Backlog</span>
          </div>
        </div>
        <Link
          to="/revision"
          className="text-xs text-muted hover:text-accent transition-colors font-medium flex items-center gap-1 group"
        >
          <span>View all</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      {previewItems.length === 0 ? (
        <div className="py-12 text-center px-4 flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-success/12 border border-success/25 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <p className="text-sm font-semibold text-text">Queue is clear</p>
          <p className="text-xs text-muted mt-1">No revision items due right now.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <div className="divide-y divide-line/60">
            {previewItems.map((item, idx) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diffCfg = DIFFICULTY_CONFIG[item.difficulty] || DIFFICULTY_CONFIG.medium;
              const platformLabel = PLATFORM_LABELS[item.platform] || item.platform;
              const topicStr = item.topics?.length > 0 ? item.topics.slice(0, 2).join(', ') : '';

              return (
                <Link
                  key={item.problemId}
                  to={`/problems/${item.problemId}`}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 block hover:bg-surface-2/60 transition-colors duration-150 group"
                >
                  {/* Tier 1: Index Badge + Problem Title + Priority Score */}
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-md bg-surface-2 border border-line/60 flex items-center justify-center text-[10px] font-mono text-muted group-hover:text-text group-hover:border-accent/40 shrink-0 tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-text group-hover:text-accent line-clamp-1 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-muted font-medium">Priority</span>
                      <span className="text-xs font-bold tabular-nums text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
                        {item.priorityScore.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Tier 2: Metadata (Topics, Difficulty, Platform) + Status Badge */}
                  <div className="flex items-center justify-between gap-2 pl-7 text-xs">
                    <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 text-muted">
                      {/* Topics */}
                      <span className="truncate text-text-secondary font-medium">
                        {topicStr || 'General'}
                      </span>
                      
                      <span className="text-line shrink-0">•</span>

                      {/* Difficulty with colored dot */}
                      <span className={`inline-flex items-center gap-1 shrink-0 font-medium ${diffCfg.text}`}>
                        <span className={`w-1 h-1 rounded-full ${diffCfg.dot}`} />
                        <span>{diffCfg.label}</span>
                      </span>

                      <span className="text-line shrink-0">•</span>

                      {/* Platform Micro-Pill */}
                      <span className="text-[10px] font-mono uppercase tracking-wide shrink-0 px-1.5 py-0.2 rounded bg-surface-2 border border-line/50 text-text-secondary">
                        {platformLabel}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${statusCfg.text} ${statusCfg.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── Footer ────────────────────────────────────────── */}
          <div className="px-4 sm:px-5 py-2.5 border-t border-line bg-surface-2/20 flex items-center justify-between text-xs text-muted mt-auto">
            <span className="text-[11px]">{queue.length > 4 ? `+${queue.length - 4} more in backlog` : 'Spaced repetition active'}</span>
            <Link to="/revision" className="text-accent hover:underline font-semibold inline-flex items-center gap-1 group">
              <span>Start revision</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
export default RevisionPreview;
