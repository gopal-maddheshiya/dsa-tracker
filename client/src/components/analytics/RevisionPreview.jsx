import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

const STATUS_CONFIG = {
  struggled: { label: 'Struggled', text: 'text-danger', bg: 'bg-danger/10 border-danger/25', dot: 'bg-danger' },
  revisit_needed: { label: 'Revisit', text: 'text-medium', bg: 'bg-medium/10 border-medium/25', dot: 'bg-medium' },
  solved: { label: 'Due Today', text: 'text-success', bg: 'bg-success/10 border-success/25', dot: 'bg-success' },
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

const RevisionPreview = ({ queue = [], isLoading = false, error = null, onRetry, className = '', excludeProblemId = null }) => {
  if (isLoading) {
    return (
      <div className={`panel overflow-hidden border border-line animate-pulse h-full flex flex-col justify-between ${className}`}>
        <div className="flex justify-between items-center px-4 sm:px-5 py-3.5 border-b border-line">
          <div className="h-4 w-32 shimmer rounded-md" />
          <div className="h-4 w-14 shimmer rounded-md" />
        </div>
        <div className="divide-y divide-line">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 sm:px-5 py-3 flex items-center gap-3">
              <div className="h-5 w-5 shimmer rounded-md" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-44 shimmer rounded-md" />
                <div className="h-2.5 w-28 shimmer rounded-md" />
              </div>
              <div className="h-4 w-14 shimmer rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`panel border border-danger/25 p-5 h-full flex flex-col justify-between ${className}`}>
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

  const previewItems = queue
    .filter((item) => !excludeProblemId || item.problemId !== excludeProblemId)
    .slice(0, 4);

  return (
    <div className={`panel overflow-hidden transition-all flex flex-col justify-between h-full ${className}`}>
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-line/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text tracking-tight leading-none">Revision Queue</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tabular-nums bg-accent/12 border border-accent/25 text-accent">
                {queue.length} due
              </span>
            </div>
            <span className="text-[11px] text-text-secondary font-medium mt-1 block leading-none">
              Spaced Recall Backlog
            </span>
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
          <div className="divide-y divide-line/40">
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
                  className="px-4 sm:px-5 py-3 block hover:bg-surface-2/50 transition-colors duration-150 group"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: Index badge + Title & metadata */}
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="w-5.5 h-5.5 rounded-md bg-surface-2 border border-line/60 flex items-center justify-center text-[10px] font-mono font-bold text-text-secondary group-hover:text-accent group-hover:border-accent/40 shrink-0 tabular-nums mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="text-sm font-semibold text-text group-hover:text-accent line-clamp-1 transition-colors">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted truncate">
                          {/* Difficulty */}
                          <span className={`inline-flex items-center shrink-0 font-medium ${diffCfg.text}`}>
                            <span>{diffCfg.label}</span>
                          </span>

                          <span className="text-line/60 shrink-0">/</span>

                          {/* Platform pill */}
                          <span className="text-[10px] font-mono uppercase tracking-wide shrink-0 px-1.5 py-0.2 rounded bg-surface-2/80 border border-line/50 text-text-secondary">
                            {platformLabel}
                          </span>

                          {topicStr && (
                            <>
                              <span className="text-line/60 shrink-0">/</span>
                              <span className="truncate text-text-secondary">
                                {topicStr}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Clean Unified Status Pill + Hover arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusCfg.text} ${statusCfg.bg}`}>
                        <span>{statusCfg.label}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all hidden sm:block" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── Footer ────────────────────────────────────────── */}
          <div className="px-4 sm:px-5 py-2.5 border-t border-line/60 bg-surface-2/20 flex items-center justify-between text-xs text-muted mt-auto">
            <span className="text-[11px] text-text-secondary">
              {queue.length > 4 ? `+${queue.length - 4} more in backlog` : 'Spaced repetition active'}
            </span>
            <Link
              to="/revision"
              className="text-accent hover:underline font-semibold inline-flex items-center gap-1 group"
            >
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
