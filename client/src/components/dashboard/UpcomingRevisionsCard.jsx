import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PLATFORM_LABELS } from '../../theme/platforms';

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', text: 'text-easy' },
  medium: { label: 'Med', text: 'text-medium' },
  hard: { label: 'Hard', text: 'text-hard' },
};

const STATUS_CONFIG = {
  struggled: { label: 'Struggled', dot: 'bg-danger' },
  revisit_needed: { label: 'Recall Due', dot: 'bg-medium' },
  solved: { label: 'Solved', dot: 'bg-success' },
};

/**
 * UpcomingRevisionsCard: Level 3 Priority Module.
 *
 * Answers: "What else needs attention soon?"
 * Supports Today's Focus without competing with it.
 * Shows top 3 candidates + link to full revision queue.
 */
const UpcomingRevisionsCard = ({
  queue = [],
  featuredId = null,
  isLoading = false,
  error = null,
  onRetry,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`panel p-5 border-line/70 animate-pulse flex flex-col justify-between h-full ${className}`}>
        <div className="flex justify-between items-center pb-3 border-b border-line/40">
          <div className="h-4 w-32 bg-surface-2 rounded" />
          <div className="h-4 w-16 bg-surface-2 rounded" />
        </div>
        <div className="space-y-1.5 py-3">
          <div className="h-8 bg-surface-2 rounded-lg" />
          <div className="h-8 bg-surface-2 rounded-lg" />
          <div className="h-8 bg-surface-2 rounded-lg" />
        </div>
        <div className="h-4 w-28 bg-surface-2 rounded mt-2" />
      </div>
    );
  }

  // Filter out featured problem so it never duplicates
  const candidates = (queue || [])
    .filter((item) => !featuredId || item.problemId !== featuredId)
    .slice(0, 3);

  return (
    <div className={`panel p-5 border-line/70 flex flex-col justify-between h-full transition-all shadow-sm ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line/50">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-accent shrink-0" />
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Upcoming Revisions
            </h3>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded font-mono text-[10px] font-bold tabular-nums bg-accent/10 border border-accent/25 text-accent">
              {queue.length} due
            </span>
          </div>

          <Link
            to="/revision"
            className="text-xs text-muted hover:text-accent transition-colors font-medium flex items-center gap-1 group"
          >
            <span>View all</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {/* Due Items List */}
        {candidates.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-success/80" />
            <span>No additional revisions due today. High retention!</span>
          </div>
        ) : (
          <div className="space-y-1.5 pt-3">
            {candidates.map((item, idx) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diffCfg = DIFFICULTY_CONFIG[item.difficulty] || DIFFICULTY_CONFIG.medium;
              const topic = item.topics?.length > 0 ? item.topics[0] : '';

              return (
                <Link
                  key={item.problemId}
                  to={`/problems/${item.problemId}`}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-2/20 hover:bg-surface-2/60 border border-line/30 hover:border-accent/40 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                >
                  {/* Left: Index + Title + Diff */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-4 h-4 rounded bg-surface-3/80 border border-line/50 flex items-center justify-center text-[9px] font-mono font-bold text-text-secondary group-hover:text-accent shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-text group-hover:text-accent truncate transition-colors">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted leading-tight">
                        <span className={`font-semibold ${diffCfg.text}`}>{diffCfg.label}</span>
                        {topic && (
                          <>
                            <span className="text-line/60">·</span>
                            <span className="truncate">#{topic}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quiet Semantic Dot Status */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-text-secondary font-mono flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      <span>{statusCfg.label}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-line/40 mt-3 flex items-center justify-between text-[11px] text-muted">
        {queue.length > 3 ? (
          <>
            <span>+{queue.length - candidates.length} more in recall queue</span>
            <Link to="/revision" className="text-accent hover:underline font-medium">
              Start revision session →
            </Link>
          </>
        ) : (
          <span className="text-text-secondary">Optimal recall cadence</span>
        )}
      </div>
    </div>
  );
};

export default UpcomingRevisionsCard;
