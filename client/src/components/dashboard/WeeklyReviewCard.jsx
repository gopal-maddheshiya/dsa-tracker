import React, { useState } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from 'lucide-react';
import { fetchWeeklyReview } from '../../api/ai';
import { getErrorMessage } from '../../utils/errorHandler';

/**
 * WeeklyReviewCard: Compact Editorial Intelligence Brief.
 *
 * Follows UI-3.3 Reference Direction:
 * - Editorial insight block with minimal footprint (no wasted horizontal space).
 * - Displays a sharp synthesis headline, key gap diagnosis, and next focus.
 * - Action plan accessible via quiet disclosure.
 * - Fits naturally in an analytical pairing alongside the Up Next queue.
 */
const WeeklyReviewCard = ({ className = '' }) => {
  const [reviewData, setReviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerateReview = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeeklyReview();
      setReviewData(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to generate weekly review. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      aria-label="Weekly Intelligence Signal"
      className={`rounded-lg border border-line-subtle/70 bg-surface/40 p-4 sm:p-5 flex flex-col justify-between h-full select-none transition-all relative overflow-hidden ${className}`}
    >
      {/* Precision architectural corner crosshairs */}
      <span aria-hidden="true" className="absolute top-2 left-2 text-[10px] font-mono text-muted/25 select-none pointer-events-none">+</span>
      <span aria-hidden="true" className="absolute top-2 right-2 text-[10px] font-mono text-muted/25 select-none pointer-events-none">+</span>

      <div>
        {/* ── HEADER STRIP ────────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-3 border-b border-line-subtle/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
              Weekly Signal
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-2 border border-line-subtle text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>{reviewData?.source === 'gemini' ? 'Gemini 2.5' : 'AI Engine'}</span>
            </span>
            {reviewData?.sampleSize?.isLowSample && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent/10 border border-accent/25 text-accent font-medium">
                Early
              </span>
            )}
          </div>

          {reviewData && !isLoading && (
            <button
              type="button"
              onClick={handleGenerateReview}
              className="text-[11px] font-mono text-muted hover:text-text transition-colors cursor-pointer inline-flex items-center gap-1"
              title="Refresh intelligence brief"
            >
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {/* ── UNGENERATED / DEFAULT STATE ─────────────────────────── */}
        {!reviewData && !isLoading && !error && (
          <div className="py-3.5 space-y-3.5">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text leading-snug tracking-tight">
                Executive Practice Synthesis
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Evaluates 7-day velocity trajectory, active recall burden, and primary topic friction into actionable steps.
              </p>
            </div>

            {/* Micro Telemetry Preview Framework */}
            <div className="grid grid-cols-3 gap-1.5 text-center select-none pt-0.5">
              <div className="p-2 rounded bg-surface-2/40 border border-line-subtle/40">
                <span className="text-[9px] font-mono text-muted uppercase block">Window</span>
                <span className="text-[11px] font-mono font-bold text-text">7-Day</span>
              </div>
              <div className="p-2 rounded bg-surface-2/40 border border-line-subtle/40">
                <span className="text-[9px] font-mono text-muted uppercase block">Intelligence</span>
                <span className="text-[11px] font-mono font-bold text-accent">Gemini</span>
              </div>
              <div className="p-2 rounded bg-surface-2/40 border border-line-subtle/40">
                <span className="text-[9px] font-mono text-muted uppercase block">Target</span>
                <span className="text-[11px] font-mono font-bold text-text">Friction</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateReview}
              className="w-full py-2 px-3.5 rounded-md bg-accent/10 hover:bg-accent/20 border border-accent/25 text-accent font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-all group"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent group-hover:rotate-12 transition-transform" />
              <span>Synthesize Intelligence Brief</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* ── LOADING STATE ───────────────────────────────────────── */}
        {isLoading && (
          <div className="py-6 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
              <span className="font-semibold text-text">Synthesizing intelligence brief…</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Evaluating 7-day velocity trajectory, topic struggle rates, and active recall load.
            </p>
          </div>
        )}

        {/* ── ERROR STATE ─────────────────────────────────────────── */}
        {error && (
          <div className="my-3 p-3 rounded-md bg-danger/10 border border-danger/25 text-xs text-text-secondary flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <p className="truncate">{error}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleGenerateReview}
                className="text-xs font-semibold text-accent hover:underline cursor-pointer"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="p-1 text-muted hover:text-text cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── GENERATED EDITORIAL INTELLIGENCE BRIEF ──────────────── */}
        {reviewData && !isLoading && (
          <div className="pt-3 space-y-3 animate-fade-in">
            {/* Headline with precision accent stripe */}
            <div className="border-l-2 border-accent pl-2.5 space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-text tracking-tight leading-snug">
                {reviewData.headline}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                {reviewData.weeklySummary}
              </p>
            </div>

            {/* Diagnostic Key-Value Pairs */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-md bg-surface-2/50 border border-line-subtle/50 space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted block font-semibold">
                  01 Biggest Gap
                </span>
                <p className="text-xs text-text-secondary font-medium truncate" title={reviewData.biggestGap}>
                  {reviewData.biggestGap}
                </p>
              </div>

              <div className="p-2.5 rounded-md bg-surface-2/50 border border-line-subtle/50 space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted block font-semibold">
                  02 Next Focus
                </span>
                <p className="text-xs text-text font-medium truncate" title={reviewData.nextWeekFocus}>
                  {reviewData.nextWeekFocus}
                </p>
              </div>
            </div>

            {/* Action Plan Progressive Disclosure */}
            {reviewData.actionPlan?.length > 0 && (
              <div className="pt-2 border-t border-line-subtle/40">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[11px] text-muted hover:text-text transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>Tactical action plan ({reviewData.actionPlan.length} steps)</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {isExpanded && (
                  <ol className="mt-2 space-y-1.5 pl-0.5 text-xs text-text-secondary animate-fade-in">
                    {reviewData.actionPlan.map((step, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2 py-1 border-b border-line-subtle/30 last:border-0 text-[11px]">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="font-mono text-accent font-bold shrink-0 text-[10px]">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <span className="leading-snug truncate">{step.action}</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-2 border border-line-subtle text-muted shrink-0 tabular-nums font-semibold">
                          {step.targetMinutes}m
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-line-subtle/40 mt-3 flex items-center justify-between text-[10px] font-mono text-muted">
        <span>7-day rolling synthesis</span>
        <span>AI Intelligence Console</span>
      </div>
    </section>
  );
};

export default WeeklyReviewCard;
