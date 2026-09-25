import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Sparkles, X, Target, Clock } from 'lucide-react';
import { PLATFORM_LABELS } from '../../theme/platforms';
import { getAICoach } from '../../api/ai';

const DIFFICULTY_MAP = {
  easy: {
    label: 'Easy',
    dotClass: 'semantic-dot-easy',
    textClass: 'text-easy',
    chipClass: 'bg-easy/10 border-easy/25',
  },
  medium: {
    label: 'Medium',
    dotClass: 'semantic-dot-medium',
    textClass: 'text-medium',
    chipClass: 'bg-medium/10 border-medium/25',
  },
  hard: {
    label: 'Hard',
    dotClass: 'semantic-dot-hard',
    textClass: 'text-hard',
    chipClass: 'bg-hard/10 border-hard/25',
  },
};

/**
 * TodaysFocusCard: Clean, High-Focus Deliberate Practice Target.
 *
 * Designed with quiet confidence:
 * Clear problem hierarchy, authentic practice rationale,
 * and direct 1-click solve actions without fake lighting or visual clutter.
 */
const TodaysFocusCard = ({
  dailyFocus,
  primaryWeakTopic,
  isLoading = false,
  className = '',
}) => {
  const [coachData, setCoachData] = useState(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachError, setCoachError] = useState(null);

  // Reset local coaching state when daily focus problem changes
  useEffect(() => {
    setCoachData(null);
    setIsCoachOpen(false);
    setCoachError(null);
  }, [dailyFocus?.id]);

  const handleToggleCoach = async () => {
    if (isCoachOpen && !isCoachLoading) {
      setIsCoachOpen(false);
      return;
    }
    if (coachData) {
      setIsCoachOpen(true);
      return;
    }
    if (!dailyFocus?.id || isCoachLoading) return;

    setIsCoachOpen(true);
    setIsCoachLoading(true);
    setCoachError(null);
    try {
      const data = await getAICoach(dailyFocus.id);
      setCoachData(data);
    } catch (err) {
      setCoachError('Coaching note temporarily unavailable. Standard recall guidance is active.');
    } finally {
      setIsCoachLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`rounded-xl border border-line bg-surface p-6 sm:p-7 animate-pulse select-none ${className}`}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-3 w-32 bg-surface-2 rounded-xs" />
            <div className="h-3 w-28 bg-surface-2 rounded-xs" />
          </div>
          <div className="h-7 w-2/3 bg-surface-2 rounded-xs" />
          <div className="h-4 w-1/3 bg-surface-2 rounded-xs" />
          <div className="h-12 w-full bg-surface-2 rounded-md" />
          <div className="flex gap-3 pt-1">
            <div className="h-9 w-40 bg-surface-2 rounded-md" />
            <div className="h-9 w-28 bg-surface-2 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state when all revisions and targets are clear
  if (!dailyFocus) {
    return (
      <section
        aria-label="Today's Primary Focus"
        className={`rounded-xl border border-line bg-surface p-6 sm:p-7 select-none transition-all ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-easy" />
              <span className="text-xs font-mono uppercase tracking-wider text-easy font-semibold">
                Practice Queue Clear
              </span>
            </div>
            <h2 className="text-xl font-bold text-text tracking-tight">
              All caught up! Zero pending recalls.
            </h2>
            <p className="text-xs text-muted max-w-xl leading-relaxed">
              Your spaced repetition memory retention is optimal. Choose any topic drill from the catalog or add a new problem to schedule upcoming intervals.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              to="/problems"
              className="btn-primary text-xs py-2 px-4 rounded-md font-medium text-center w-full sm:w-auto"
            >
              Browse Catalog →
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
              className="btn-secondary text-xs py-2 px-3.5 rounded-md font-medium text-center w-full sm:w-auto cursor-pointer"
            >
              + Add Problem
            </button>
          </div>
        </div>
      </section>
    );
  }

  const diffKey = dailyFocus?.difficulty?.toLowerCase() || 'medium';
  const diffInfo = DIFFICULTY_MAP[diffKey] || DIFFICULTY_MAP.medium;
  const platformLabel = dailyFocus?.platform
    ? PLATFORM_LABELS[dailyFocus.platform.toLowerCase()] || dailyFocus.platform
    : 'LeetCode';

  return (
    <section
      aria-label="Today's Primary Target"
      className={`rounded-xl border border-line bg-surface p-4 sm:p-6 transition-all ${className}`}
    >
      {/* ── TOP METADATA STRIP ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
            Today's Target
          </span>
          <span className="text-muted/40 font-mono text-xs">·</span>
          <span className="text-xs text-muted font-medium">
            {dailyFocus.badge || 'Priority Spaced Recall'}
          </span>
        </div>

        {primaryWeakTopic && (
          <div className="text-xs text-muted font-mono inline-flex items-center gap-1.5">
            <span>Target gap:</span>
            <span className="text-text font-semibold">{primaryWeakTopic.topic}</span>
            <span className="text-danger font-semibold tabular-nums">
              ({Math.round(primaryWeakTopic.struggleRatio * 100)}% struggle)
            </span>
          </div>
        )}
      </div>

      {/* ── MAIN WORKSPACE CONTENT ────────────────────────────────────── */}
      <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Title, Badges, Rationale, CTAs */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Problem Title */}
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-text tracking-tight leading-snug">
              <Link
                to={`/problems/${dailyFocus.id}`}
                className="hover:text-accent transition-colors"
                title={dailyFocus.title}
              >
                {dailyFocus.title}
              </Link>
            </h2>

            {/* Clean Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-text-secondary select-none">
              <div className={`inline-flex items-center gap-1.5 font-medium px-2 py-0.5 rounded border ${diffInfo.chipClass}`}>
                <span className={diffInfo.dotClass} />
                <span className={diffInfo.textClass}>{diffInfo.label}</span>
              </div>

              <span className="px-2 py-0.5 rounded bg-surface-2 border border-line font-mono text-[11px] text-text-secondary">
                {platformLabel}
              </span>

              {dailyFocus.topics?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {dailyFocus.topics.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-surface-2/60 border border-line-subtle text-[11px] font-mono text-muted hover:text-text transition-colors"
                    >
                      #{t.toLowerCase().replace(/\s+/g, '-')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rationale / Spaced Recall Insight */}
          {dailyFocus.rationale && (
            <div className="border-l-2 border-accent pl-3.5 py-1 text-xs text-text-secondary leading-relaxed">
              <span className="font-semibold text-text">Practice Rationale: </span>
              {dailyFocus.rationale}
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            <Link
              to={`/problems/${dailyFocus.id}`}
              className="btn-primary text-xs py-2 px-4 rounded-md font-semibold inline-flex items-center justify-center gap-2 cursor-pointer shadow-none w-full sm:w-auto"
            >
              <span>Solve & Log Attempt</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded-xs bg-black/25 text-[10px] font-mono font-normal opacity-75">
                ↵
              </kbd>
            </Link>

            <button
              type="button"
              onClick={handleToggleCoach}
              disabled={isCoachLoading}
              className="btn-secondary text-xs py-2 px-3.5 rounded-md font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors w-full sm:w-auto"
              title="Get coaching notes & pattern tips"
            >
              <Sparkles className={`w-3.5 h-3.5 text-accent ${isCoachLoading ? 'animate-spin' : ''}`} />
              <span>{isCoachLoading ? 'Generating…' : isCoachOpen ? 'Hide Coach' : 'AI Coach'}</span>
            </button>

            {dailyFocus.link && (
              <a
                href={dailyFocus.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-text font-medium inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-md hover:bg-surface-2 transition-colors w-full sm:w-auto sm:ml-auto"
              >
                <span>View on {platformLabel}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Quiet, Clean Practice Notes */}
        <div className="lg:col-span-4 w-full">
          <div className="p-4 rounded-lg bg-surface-2/40 border border-line-subtle space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-line-subtle text-[11px] font-mono text-muted">
              <span className="font-semibold uppercase text-text">Session Guide</span>
              <span>25–35m target</span>
            </div>

            <div className="space-y-1.5 text-muted leading-relaxed">
              <p className="flex items-start gap-1.5">
                <span className="text-text font-bold">1.</span>
                <span>Attempt optimal algorithm before checking hints.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-text font-bold">2.</span>
                <span>Time yourself to simulate real interview pressure.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-text font-bold">3.</span>
                <span>Log takeaways to reset the spaced repetition curve.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── EXPANDABLE INLINE COACHING DRAWER ──────────────────────────── */}
      {isCoachOpen && (
        <div className="mt-4 p-4 rounded-lg border border-line bg-surface-2 text-xs text-text-secondary space-y-2.5 animate-fade-in relative z-10">
          <div className="flex items-center justify-between border-b border-line-subtle pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-text">
                Engineering Coach Note
              </span>
              {coachData && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-line-subtle text-muted">
                  {coachData.source === 'gemini' ? 'Gemini AI' : 'Deterministic'}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsCoachOpen(false)}
              className="p-1 rounded text-muted hover:text-text transition-colors cursor-pointer"
              aria-label="Close coaching note"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {isCoachLoading ? (
            <div className="py-2 space-y-1">
              <p className="text-xs font-medium text-text">Generating your coaching note…</p>
              <p className="text-[11px] text-muted">Analyzing pattern, complexity, and common bottlenecks.</p>
            </div>
          ) : coachError ? (
            <div className="py-1 space-y-1 text-danger">
              <p>{coachError}</p>
              <button
                type="button"
                onClick={handleToggleCoach}
                className="text-accent underline font-medium cursor-pointer"
              >
                Retry note
              </button>
            </div>
          ) : coachData ? (
            <div className="space-y-2">
              <p className="font-semibold text-text text-sm">{coachData.headline}</p>
              <p className="leading-relaxed">
                <strong className="text-text font-medium">Focus Pattern: </strong>
                {coachData.patternFocus}
              </p>
              {coachData.sessionPlan?.length > 0 && (
                <div className="pt-2 border-t border-line-subtle space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-muted font-semibold tracking-wider">
                    Timed Plan
                  </span>
                  <ul className="space-y-1 text-[11px]">
                    {coachData.sessionPlan.map((step, idx) => (
                      <li key={idx} className="flex justify-between gap-2 py-0.5">
                        <span>{idx + 1}. {step.step}</span>
                        <span className="font-mono text-muted">{step.minutes}m</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
};

export default TodaysFocusCard;
