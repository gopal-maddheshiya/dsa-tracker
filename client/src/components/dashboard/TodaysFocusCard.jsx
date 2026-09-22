import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, ExternalLink, Sparkles, X } from 'lucide-react';
import { PLATFORM_LABELS } from '../../theme/platforms';
import { getAICoach } from '../../api/ai';

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', text: 'text-easy', dot: 'bg-easy' },
  medium: { label: 'Medium', text: 'text-medium', dot: 'bg-medium' },
  hard: { label: 'Hard', text: 'text-hard', dot: 'bg-hard' },
};

/**
 * TodaysFocusCard: The Level 2 Hero Action on the Dashboard.
 *
 * Answers within 3 seconds:
 * WHAT: Problem Title
 * WHY: Memory insight / rationale based on spaced repetition & weakness diagnostics
 * STATE: Difficulty, platform, urgency
 * ACTION: Prominent "Solve & Log Attempt" button + On-demand grounded "Coach me"
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
      setCoachError('Coaching is temporarily unavailable. Your standard recall guidance is still active.');
    } finally {
      setIsCoachLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`panel p-5 border-line/70 animate-pulse flex flex-col justify-between h-full ${className}`}>
        <div className="space-y-3 pb-3 border-b border-line/40">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-surface-2 rounded" />
            <div className="h-4 w-32 bg-surface-2 rounded" />
          </div>
          <div className="h-6 w-3/4 bg-surface-2 rounded" />
          <div className="h-4 w-1/2 bg-surface-2 rounded" />
          <div className="h-12 w-full bg-surface-2 rounded-lg" />
        </div>
        <div className="pt-3 flex gap-2">
          <div className="h-8 w-36 bg-surface-2 rounded-md" />
          <div className="h-8 w-24 bg-surface-2 rounded-md" />
        </div>
      </div>
    );
  }

  const diffCfg = dailyFocus
    ? DIFFICULTY_CONFIG[dailyFocus.difficulty] || DIFFICULTY_CONFIG.medium
    : null;

  return (
    <div className={`panel p-5 sm:p-6 border-line/70 flex flex-col justify-between h-full transition-all shadow-sm ${className}`}>
      <div>
        {/* Header Line */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line/50">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent shrink-0" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Today's Focus
            </span>
          </div>

          {primaryWeakTopic && (
            <span className="text-xs text-muted inline-flex items-center gap-1.5">
              <span>Target area:</span>
              <strong className="text-text font-medium">{primaryWeakTopic.topic}</strong>
              <span className="text-[11px] font-mono text-danger font-semibold">
                ({Math.round(primaryWeakTopic.struggleRatio * 100)}% struggle)
              </span>
            </span>
          )}
        </div>

        {/* Featured Content Body */}
        {dailyFocus ? (
          <div className="pt-3.5 space-y-3">
            {/* SMALL: Recall Context */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-accent">
                {dailyFocus.badge || 'Priority Recall'}
              </span>
              <span className="text-line/60">·</span>
              <span className="text-xs text-muted">Recommended for today</span>
            </div>

            {/* LARGE: Problem Title (Visual Anchor) */}
            <h2 className="text-xl sm:text-2xl font-black text-text tracking-tight leading-snug">
              <Link
                to={`/problems/${dailyFocus.id}`}
                className="hover:text-accent transition-colors hover:underline"
              >
                {dailyFocus.title}
              </Link>
            </h2>

            {/* MEDIUM: Contextual Memory Insight (Restrained Left Accent, Unboxed) */}
            <div className="border-l-2 border-accent/60 pl-3 py-1">
              <p className="text-xs text-text-secondary leading-relaxed">
                <span className="font-semibold text-text">Memory Insight: </span>
                {dailyFocus.rationale}
              </p>
            </div>

            {/* SMALL: Metadata (Difficulty · Platform · Topics) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted pt-0.5">
              {diffCfg && (
                <span className={`inline-flex items-center gap-1.5 font-semibold ${diffCfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
                  <span>{diffCfg.label}</span>
                </span>
              )}

              <span className="text-line/60">/</span>

              <span className="text-text-secondary font-medium">
                {PLATFORM_LABELS[dailyFocus.platform] || dailyFocus.platform}
              </span>

              {dailyFocus.topics?.length > 0 && (
                <>
                  <span className="text-line/60">/</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {dailyFocus.topics.slice(0, 3).map((t) => (
                      <span key={t} className="text-[11px] font-mono text-muted/80">
                        #{t}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* LOCALIZED LOADING STATE FOR AI COACH */}
            {isCoachLoading && (
              <div className="p-3.5 rounded-lg border border-line/60 bg-surface-2/40 animate-pulse space-y-2 mt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
                  <span>Preparing your coaching note…</span>
                </div>
                <div className="h-2.5 w-4/5 bg-surface-3 rounded" />
                <div className="h-2.5 w-3/5 bg-surface-3 rounded" />
              </div>
            )}

            {/* LOCALIZED ERROR STATE FOR AI COACH */}
            {coachError && isCoachOpen && (
              <div className="p-3.5 rounded-lg border border-line/60 bg-surface-2/60 text-xs text-text-secondary space-y-2 mt-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="leading-relaxed">{coachError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCoachOpen(false);
                      setCoachError(null);
                    }}
                    className="text-muted hover:text-text cursor-pointer shrink-0 p-0.5"
                    aria-label="Dismiss error"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleToggleCoach}
                  className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Retry coaching note
                </button>
              </div>
            )}

            {/* AI COACHING NOTE LOADING PANEL */}
            {isCoachOpen && isCoachLoading && (
              <div className="p-3.5 sm:p-4 rounded-lg border border-line/70 bg-surface-2/50 space-y-2.5 transition-all mt-2 animate-fade-in">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-line/40">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text">
                      Coaching Note
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-3 text-muted">
                      Synthesizing…
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 py-1">
                  <p className="text-xs font-semibold text-text">
                    Generating your coaching note…
                  </p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Analyzing practice history, weak topic telemetry, and spaced-repetition metrics to frame targeted session guidance.
                  </p>
                  <div className="space-y-1.5 pt-1.5 animate-pulse">
                    <div className="h-3 w-4/5 bg-surface-3 rounded" />
                    <div className="h-3 w-3/5 bg-surface-3 rounded" />
                  </div>
                </div>
              </div>
            )}

            {/* RESTRAINED AI COACHING NOTE PANEL */}
            {coachData && isCoachOpen && !isCoachLoading && (
              <div className="p-3.5 sm:p-4 rounded-lg border border-line/70 bg-surface-2/50 space-y-2.5 transition-all mt-2">
                {/* Note Header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-line/40">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text">
                      Coaching Note
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-3 text-muted">
                      {coachData.source === 'gemini' ? 'Gemini Coach' : 'Standard Recall'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCoachOpen(false)}
                    className="text-muted hover:text-text cursor-pointer p-0.5"
                    aria-label="Close coaching note"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Headline */}
                <h3 className="text-xs sm:text-sm font-bold text-text leading-snug">
                  {coachData.headline}
                </h3>

                {/* Grounded Explanation */}
                <div className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
                  <p>
                    <strong className="text-text font-semibold">Why this problem: </strong>
                    {coachData.whyThisProblem}
                  </p>
                  <p>
                    <strong className="text-text font-semibold">Pattern focus: </strong>
                    {coachData.patternFocus}
                  </p>
                </div>

                {/* Timed Session Execution Plan */}
                {coachData.sessionPlan?.length > 0 && (
                  <div className="pt-2 border-t border-line/30 space-y-1">
                    <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted">
                      Timed Session Plan
                    </div>
                    <ul className="space-y-1 text-xs text-text-secondary">
                      {coachData.sessionPlan.map((step, idx) => (
                        <li key={idx} className="flex items-baseline justify-between gap-2">
                          <span>
                            <span className="font-mono text-muted mr-1.5">{idx + 1}.</span>
                            {step.step}
                          </span>
                          <span className="text-[11px] font-mono text-muted shrink-0">
                            {step.minutes}m
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Encouragement */}
                {coachData.encouragement && (
                  <p className="text-[11px] text-muted italic pt-1 border-t border-line/30">
                    "{coachData.encouragement}"
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-xs text-muted">
              Practice queue clear! Log problems in the catalog to unlock daily recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Dominant Primary Action Bar + Secondary Grounded Coach Button */}
      {dailyFocus && (
        <div className="pt-4 mt-2 border-t border-line/40 flex flex-wrap items-center gap-3">
          <Link
            to={`/problems/${dailyFocus.id}`}
            className="btn-primary text-xs py-2.5 px-5 rounded-md font-semibold inline-flex items-center gap-2 shadow-xs group cursor-pointer"
          >
            <span>Solve & Log Attempt</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {dailyFocus.link && (
            <a
              href={dailyFocus.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-text font-medium inline-flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-surface-2 transition-colors"
            >
              <span>Open on {PLATFORM_LABELS[dailyFocus.platform] || 'Platform'}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}

          <button
            type="button"
            onClick={handleToggleCoach}
            disabled={isCoachLoading}
            className="text-xs text-text-secondary hover:text-accent font-medium inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-line/60 hover:border-accent/40 hover:bg-surface-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-accent ${isCoachLoading ? 'animate-spin' : ''}`} />
            <span>{isCoachLoading ? 'Generating note…' : isCoachOpen ? 'Hide Coach' : 'Coach me'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TodaysFocusCard;
