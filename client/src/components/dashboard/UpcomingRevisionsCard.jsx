import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DIFFICULTY_MAP = {
  easy: { label: 'Easy', dotClass: 'semantic-dot-easy', textClass: 'text-easy' },
  medium: { label: 'Med', dotClass: 'semantic-dot-medium', textClass: 'text-medium' },
  hard: { label: 'Hard', dotClass: 'semantic-dot-hard', textClass: 'text-hard' },
};

/**
 * Format relative urgency in uppercase ('TODAY', 'TOMORROW', '3D')
 */
const getRelativeUrgency = (dateStr) => {
  if (!dateStr) return 'TODAY';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'TODAY';
  if (diffDays === 1) return 'TOMORROW';
  return `${diffDays}D`;
};

/**
 * UpcomingRevisionsCard: Quiet Engineering Work Queue.
 *
 * Clean, scannable spaced repetition queue matching the app's dark theme.
 */
const UpcomingRevisionsCard = ({
  queue = [],
  featuredId = null,
  isLoading = false,
  error = null,
  className = '',
}) => {
  const { isAuthenticated } = useAuth();

  const handleRevisionClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent('open-auth-gate', {
          detail: {
            title: 'Spaced Repetition Queue',
            description: 'Create an account to track your personalized forgetting curve and revision schedules.',
            contextAction: 'Revision Queue',
          },
        })
      );
    }
  };
  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-line/80 card-classy p-4 sm:p-5 animate-pulse flex flex-col justify-between h-full select-none ${className}`}>
        <div className="flex justify-between items-center pb-3 border-b border-line-subtle">
          <div className="h-3 w-24 bg-surface-2 rounded-xs" />
          <div className="h-3 w-16 bg-surface-2 rounded-xs" />
        </div>
        <div className="space-y-3 py-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="h-3.5 w-36 bg-surface-2 rounded-xs" />
              <div className="h-3 w-16 bg-surface-2 rounded-xs" />
            </div>
          ))}
        </div>
        <div className="h-3 w-28 bg-surface-2 rounded-xs mt-2" />
      </div>
    );
  }

  // Filter out featured problem so it never duplicates
  const candidates = (queue || [])
    .filter((item) => !featuredId || item.problemId !== featuredId)
    .slice(0, 5);

  return (
    <section
      aria-label="Upcoming Revisions Queue"
      className={`rounded-2xl border border-line/80 card-classy p-4 sm:p-5 flex flex-col justify-between h-full select-none shadow-lg ${className}`}
    >
      <div className="flex-1 flex flex-col">
        {/* Header: UP NEXT + VIEW ALL */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
              Recall Queue
            </span>
            <span className="text-[11px] font-mono font-medium text-accent px-2 py-0.5 rounded-full bg-accent/15 border border-accent/25 tabular-nums">
              {queue.length} due
            </span>
          </div>

          <Link
            to="/revision"
            onClick={handleRevisionClick}
            className="text-xs font-mono text-muted hover:text-accent transition-colors font-medium tracking-wider flex items-center gap-1 group"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Column Headers for Structural & Visual Balance with Bottlenecks */}
        {candidates.length > 0 && (
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted/60 px-2 pt-2.5 pb-1 select-none border-b border-line-subtle/30">
            <div className="flex items-center gap-3">
              <span className="w-5 tabular-nums">#</span>
              <span>Problem</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-right hidden sm:inline">Difficulty</span>
              <span className="w-14 text-center">Timing</span>
              <span className="w-3" />
            </div>
          </div>
        )}

        {/* Work Queue Rows */}
        {candidates.length === 0 ? (
          <div className="py-10 text-center space-y-1 my-auto">
            <p className="text-xs font-semibold text-text">Queue is clear</p>
            <p className="text-[11px] text-muted">Zero pending recalls. Retention memory is optimal.</p>
          </div>
        ) : (
          <div className="divide-y divide-line-subtle/50 pt-0.5 flex-1 flex flex-col justify-around">
            {candidates.map((item, idx) => {
              const diffKey = item.difficulty?.toLowerCase() || 'medium';
              const diffInfo = DIFFICULTY_MAP[diffKey] || DIFFICULTY_MAP.medium;
              const urgency = getRelativeUrgency(item.nextRevisionDate);
              const primaryTopic = item.topics?.[0] || null;

              return (
                <Link
                  key={item.problemId}
                  to={`/problems/${item.problemId}`}
                  className="py-2 px-2 -mx-2 flex items-center justify-between gap-2.5 sm:gap-3 group transition-colors hover:bg-surface-hover/70 rounded-md"
                  title={item.title}
                >
                  {/* Left: Index + Title + Topic Tag */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-[11px] font-mono text-muted/60 w-5 shrink-0 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p className="text-xs font-medium text-text group-hover:text-accent truncate transition-colors">
                      {item.title}
                    </p>
                    {primaryTopic && (
                      <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-surface-2 border border-line-subtle text-[10px] font-mono text-muted shrink-0">
                        #{primaryTopic.toLowerCase().replace(/\s+/g, '-')}
                      </span>
                    )}
                  </div>

                  {/* Right: Difficulty dot + Urgency Pill + Arrow */}
                  <div className="flex items-center gap-3 shrink-0 select-none">
                    <div className="inline-flex items-center justify-end gap-1 font-mono text-[11px] w-auto sm:w-16">
                      <span className={diffInfo.dotClass} />
                      <span className={`font-medium ${diffInfo.textClass} hidden sm:inline`}>
                        {diffInfo.label}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-medium w-14 text-center px-1.5 py-0.5 rounded-full ${
                        urgency === 'TODAY'
                          ? 'text-accent bg-accent/15 border border-accent/25'
                          : 'text-muted bg-surface-2 border border-line-subtle'
                      }`}
                    >
                      {urgency}
                    </span>

                    <span className="text-muted/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all text-xs font-mono w-3 text-right">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Telemetry */}
      <div className="pt-3 border-t border-line mt-auto flex items-center justify-between text-xs text-muted font-mono">
        {queue.length > 5 ? (
          <>
            <span className="text-[11px] text-muted">+{queue.length - candidates.length} more in queue</span>
            <Link
              to="/revision"
              onClick={handleRevisionClick}
              className="text-[11px] font-mono font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>Start session</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </>
        ) : (
          <>
            <span className="text-[11px] text-muted">Spaced cadence active</span>
            <Link
              to="/revision"
              onClick={handleRevisionClick}
              className="text-[11px] font-mono text-accent hover:underline font-medium"
            >
              Open queue →
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default UpcomingRevisionsCard;
