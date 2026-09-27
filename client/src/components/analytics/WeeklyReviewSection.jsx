import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { fetchWeeklyReview } from '../../api/ai';
import { useAuth } from '../../context/AuthContext';
import { DEMO_WEEKLY_REVIEW } from '../../data/demoData';

/**
 * WeeklyReviewSection: 7-Day Cognitive Retrospective.
 *
 * Implements Phase 9: AI Layer Harmonization.
 * - Grounded synthesis of 7-day practice telemetry.
 * - Highlights: Headline, Weekly Summary, Strongest Signal vs Biggest Gap.
 * - Concrete 3-step prioritized action plan with time estimates.
 * - Deterministic guest preview via DEMO_WEEKLY_REVIEW without unauthorized requests.
 */
const WeeklyReviewSection = ({ className = '' }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadReview = useCallback(async (isManualRefresh = false) => {
    if (!isAuthenticated) {
      setReview(DEMO_WEEKLY_REVIEW);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchWeeklyReview();
      setReview(data || null);
    } catch (err) {
      console.error('Failed to load weekly review:', err);
      setError(
        err?.response?.status === 429
          ? 'AI request limit reached (5 requests / 15 min). Please try again shortly.'
          : 'Weekly retrospective temporarily unavailable. Please retry.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    loadReview(false);
  }, [authLoading, loadReview]);

  const handleRefreshClick = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-auth-gate', {
          detail: {
            title: 'AI 7-Day Retrospective',
            description:
              'Create an account to generate live AI-synthesized weekly reviews based on your personal attempts and recall intervals.',
            contextAction: 'Weekly Review',
          },
        })
      );
      return;
    }
    loadReview(true);
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div
        className={`rounded-xl border border-line bg-surface p-5 sm:p-6 space-y-4 animate-pulse select-none ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-surface-2 rounded" />
          <div className="h-4 w-24 bg-surface-2 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-surface-2 rounded-md" />
        <div className="h-12 w-full bg-surface-2 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="h-20 bg-surface-2 rounded-lg" />
          <div className="h-20 bg-surface-2 rounded-lg" />
        </div>
      </div>
    );
  }

  // Error State
  if (error && !review) {
    return (
      <div
        className={`rounded-xl border border-hard/30 bg-surface p-5 sm:p-6 space-y-3 select-none ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted font-bold">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>AI Weekly Retrospective</span>
          </div>
          <button
            type="button"
            onClick={() => loadReview(true)}
            className="text-xs font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
        <p className="text-xs text-text-secondary">{error}</p>
      </div>
    );
  }

  // Empty-week state (0 attempts logged)
  const isZeroActivity =
    review?.source === 'empty_week_deterministic' ||
    (review?.actionPlan?.length === 0 && !review?.weeklySummary);

  if (isZeroActivity) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-line bg-surface p-5 sm:p-6 space-y-4 select-none shadow-xs ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
              AI 7-Day Retrospective
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 border border-line-subtle text-muted">
            Zero Active Sessions
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-text">
            {review?.headline || 'No Practice Activity Recorded in Past 7 Days'}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            {review?.weeklySummary ||
              'Complete at least 1 deliberate practice session to activate AI retrospective analysis, telemetry insights, and recommended focus.'}
          </p>
        </div>

        <div className="pt-1 flex items-center gap-3">
          <Link
            to="/problems"
            className="btn-primary text-xs py-2 px-3.5 rounded-lg font-semibold inline-flex items-center gap-1.5"
          >
            <span>Start Practice Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={refreshing}
            className="btn-secondary text-xs py-2 px-3 rounded-lg inline-flex items-center gap-1.5 text-text-secondary cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Check Telemetry</span>
          </button>
        </div>
      </div>
    );
  }

  const confidenceBadge = review?.sampleSize?.isLowSample
    ? { text: 'Early Signals · Low Sample', class: 'bg-amber-500/10 border-amber-500/30 text-amber-400' }
    : { text: 'High Confidence · Grounded Telemetry', class: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };

  return (
    <section
      aria-label="AI 7-Day Retrospective"
      className={`relative overflow-hidden rounded-xl border border-line bg-surface p-3.5 sm:p-6 space-y-4 sm:space-y-5 shadow-xs hover:border-line-subtle transition-all ${className}`}
    >
      {/* Specular Top Ambient Highlight */}
      <div className="absolute top-0 inset-x-8 sm:inset-x-16 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent pointer-events-none" />

      {/* ── HEADER: Eyebrow + Badges + Re-analyze ───────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1 sm:p-1.5 rounded-md bg-accent/15 border border-accent/30 text-accent shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary truncate">
                AI 7-Day Retrospective
              </span>
              {!isAuthenticated && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-surface-2 border border-line-subtle text-muted shrink-0">
                  Preview
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-muted font-medium hidden xs:inline">
              Grounded performance synthesis & cognitive trajectory
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Confidence Pill */}
          <span
            className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${confidenceBadge.class}`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{confidenceBadge.text}</span>
          </span>

          {/* Re-Analyze Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={refreshing}
            className="text-[11px] sm:text-xs font-mono py-1 px-2 sm:px-2.5 rounded-lg border border-line-subtle bg-surface-2/80 hover:bg-surface-2 text-text-secondary hover:text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh weekly telemetry analysis"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-accent' : ''}`} />
            <span>{refreshing ? 'Analyzing...' : 'Re-analyze'}</span>
          </button>
        </div>
      </div>

      {/* ── HEADLINE & SUMMARY ──────────────────────────────────────── */}
      <div className="space-y-1">
        <h3 className="text-sm sm:text-lg font-bold text-text tracking-tight leading-snug">
          {review?.headline || 'Weekly Practice Rhythm & Pattern Analysis'}
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-3xl">
          {review?.weeklySummary}
        </p>
      </div>

      {/* ── DUAL SIGNAL DOCK: Strongest Signal vs Biggest Gap ───────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5 pt-0.5">
        {/* Strongest Signal */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-easy/5 border border-easy/25 flex items-start gap-2.5 sm:gap-3">
          <div className="p-1 rounded-md bg-easy/15 text-easy shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-easy block">
              Strongest Signal
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              {review?.strongestSignal || 'Consistent practice logged across core intervals.'}
            </p>
          </div>
        </div>

        {/* Biggest Gap */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-accent/5 border border-accent/25 flex items-start gap-2.5 sm:gap-3">
          <div className="p-1 rounded-md bg-accent/15 text-accent shrink-0 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block">
              Primary Bottleneck
            </span>
            <p className="text-xs text-text-secondary leading-relaxed">
              {review?.biggestGap || 'Need additional repetitions on complex problem classes.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── RECOMMENDED FOCUS BANNER ───────────────────────────────── */}
      {review?.recommendedFocus && (
        <div className="p-2.5 sm:p-3 rounded-lg bg-surface-2/70 border border-line-subtle flex items-start sm:items-center gap-2 sm:gap-2.5">
          <Compass className="w-4 h-4 text-accent shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs text-text-secondary leading-snug">
            <strong className="text-text font-semibold">Recommended Focus: </strong>
            <span>{review.recommendedFocus}</span>
          </div>
        </div>
      )}

      {/* ── 3-STEP ACTION PLAN ───────────────────────────────────────── */}
      {review?.actionPlan && review.actionPlan.length > 0 && (
        <div className="space-y-2 sm:space-y-2.5 pt-0.5 sm:pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
              Prioritized Action Plan · Next 3 Steps
            </span>
            <span className="text-[10px] font-mono text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                Total est.{' '}
                {review.actionPlan.reduce((acc, curr) => acc + (Number(curr.minutes) || 0), 0)}m
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            {review.actionPlan.map((step, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-3.5 rounded-xl bg-surface-2/40 border border-line-subtle hover:border-line transition-all flex flex-col justify-between space-y-2 sm:space-y-2.5"
              >
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-accent">
                      STEP 0{idx + 1}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-surface border border-line-subtle text-text-secondary font-medium">
                      ⏱ {step.minutes || 20}m
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-text leading-snug">{step.action}</h4>
                </div>
                <p className="text-[11px] text-muted leading-relaxed border-t border-line-subtle/50 pt-1.5 sm:pt-2">
                  <span className="font-medium text-text-secondary">Why: </span>
                  {step.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GROUNDED ENCOURAGEMENT FOOTER ────────────────────────────── */}
      {review?.encouragement && (
        <div className="pt-1 border-t border-line-subtle/70 flex items-center gap-2 text-xs text-muted">
          <Zap className="w-3.5 h-3.5 text-accent shrink-0" />
          <p className="italic text-[11px] text-text-secondary leading-tight">
            "{review.encouragement}"
          </p>
        </div>
      )}
    </section>
  );
};

export default WeeklyReviewSection;
