import React, { useState } from 'react';
import { Sparkles, RefreshCw, X, TrendingUp, AlertTriangle, Target, Clock, Compass } from 'lucide-react';
import { fetchWeeklyReview } from '../../api/ai';
import { getErrorMessage } from '../../utils/errorHandler';

/**
 * WeeklyReviewCard: AI-Powered 7-Day Practice Progress Review.
 *
 * Product Principle:
 * - Deterministic Analytics = What Happened
 * - Gemini = Why It Matters + What To Do Next
 *
 * User Triggered: Does NOT invoke Gemini on initial load.
 */
const WeeklyReviewCard = ({ className = '' }) => {
  const [reviewData, setReviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className={`panel p-4 sm:p-5 border-line/70 transition-all shadow-sm ${className}`}>
      {/* ── Level 1 Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/50">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-accent/10 border border-accent/25 text-accent shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text">
                Weekly Review
              </span>
              {reviewData && (
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      reviewData.source === 'gemini'
                        ? 'bg-accent/10 border-accent/25 text-accent font-semibold'
                        : 'bg-surface-3 border-line text-muted'
                    }`}
                  >
                    {reviewData.source === 'gemini' ? 'Gemini Review' : 'Standard Review'}
                  </span>
                  {reviewData.sampleSize?.isLowSample && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/25 text-amber-400 font-medium">
                      Early Signal
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted hidden sm:block">
              7-day practice telemetry, breakthrough signals, and prioritized execution.
            </p>
          </div>
        </div>

        {/* Action Trigger */}
        <div>
          <button
            type="button"
            onClick={handleGenerateReview}
            disabled={isLoading}
            className="text-xs font-medium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line/70 hover:border-accent/50 bg-surface-2/60 hover:bg-surface-2 text-text transition-all cursor-pointer disabled:opacity-50"
            title="Generate or refresh your 7-day progress review"
          >
            <Sparkles className={`w-3.5 h-3.5 text-accent ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {isLoading
                ? 'Generating review…'
                : reviewData
                ? 'Refresh review'
                : 'Generate weekly review'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Error Banner ──────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3.5 p-3 rounded-lg border border-danger/40 bg-danger/10 text-xs text-text-secondary flex items-start justify-between gap-2 animate-fade-in">
          <p className="leading-relaxed">{error}</p>
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
              className="text-muted hover:text-text cursor-pointer p-0.5"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Loading State ─────────────────────────────────────────────── */}
      {isLoading && (
        <div className="mt-3.5 p-4 rounded-xl border border-line/60 bg-surface-2/40 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent animate-spin" />
            <span className="text-xs font-semibold text-text">
              Generating your weekly review…
            </span>
          </div>
          <p className="text-[11px] text-muted leading-relaxed">
            Analyzing 7-day solve velocity, topic struggle ratios, and spaced recall pressure to frame targeted progress guidance.
          </p>
          <div className="space-y-2 pt-1 animate-pulse">
            <div className="h-4 w-3/4 bg-surface-3 rounded" />
            <div className="h-3 w-full bg-surface-3 rounded" />
            <div className="h-3 w-5/6 bg-surface-3 rounded" />
          </div>
        </div>
      )}

      {/* ── Initial Untriggered State ──────────────────────────────────── */}
      {!reviewData && !isLoading && !error && (
        <div className="mt-3.5 p-4 rounded-xl border border-dashed border-line/80 bg-surface-2/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <p className="font-medium text-text">
              Ready for your personalized weekly progress review?
            </p>
            <p className="text-[11px] text-muted leading-relaxed">
              Synthesize key retention breakthroughs, detect weak algorithmic patterns, and formulate three focused actions for the days ahead.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateReview}
            className="btn-primary text-xs shrink-0 self-start sm:self-center inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate review</span>
          </button>
        </div>
      )}

      {/* ── Generated Review Content ──────────────────────────────────── */}
      {reviewData && !isLoading && (
        <div className="mt-3.5 space-y-4 animate-fade-in">
          {/* Headline */}
          <div>
            <h2 className="text-sm sm:text-base font-bold text-text tracking-tight leading-snug">
              {reviewData.headline}
            </h2>
          </div>

          {/* Low-Sample Early Signal Notice */}
          {reviewData.sampleSize?.isLowSample && (
            <div className="p-2.5 rounded-lg border border-amber-500/25 bg-amber-500/5 text-xs text-text-secondary flex items-start gap-2">
              <span className="font-mono text-amber-400 font-bold shrink-0">ℹ</span>
              <p className="text-[11px] leading-relaxed text-muted">
                <strong className="text-text font-medium">Early signal:</strong> Based on{' '}
                {reviewData.sampleSize.attempts} logged attempt
                {reviewData.sampleSize.attempts === 1 ? '' : 's'} across{' '}
                {reviewData.sampleSize.activeDays} active day
                {reviewData.sampleSize.activeDays === 1 ? '' : 's'}. Keep practicing before drawing
                stronger conclusions.
              </p>
            </div>
          )}

          {/* What Changed */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
              What Changed
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              {reviewData.weeklySummary}
            </p>
          </div>

          {/* Two-Column Diagnostic Signals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Strongest Signal */}
            <div className="p-3 rounded-lg border border-line/60 bg-surface-2/40 space-y-1">
              <div className="flex items-center gap-1.5 text-easy">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Strongest Signal
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {reviewData.strongestSignal}
              </p>
            </div>

            {/* Biggest Gap */}
            <div className="p-3 rounded-lg border border-line/60 bg-surface-2/40 space-y-1">
              <div className="flex items-center gap-1.5 text-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Biggest Gap
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {reviewData.biggestGap}
              </p>
            </div>
          </div>

          {/* Next Focus */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-accent">
              <Target className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                Next Focus
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {reviewData.recommendedFocus}
            </p>
          </div>

          {/* Three Actions */}
          <div className="space-y-2 pt-1 border-t border-line/40">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                Three Actions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {reviewData.actionPlan?.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-line/60 bg-surface-2/30 flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-accent">
                        Action 0{index + 1}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-3 text-muted">
                        {item.minutes}m
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text leading-snug">
                      {item.action}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Encouragement Footer */}
          {reviewData.encouragement && (
            <div className="pt-2 border-t border-line/30 flex items-start gap-2">
              <span className="text-accent text-sm leading-none">“</span>
              <p className="text-xs italic text-muted leading-relaxed">
                {reviewData.encouragement}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyReviewCard;
