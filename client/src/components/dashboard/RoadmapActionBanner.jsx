import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, ExternalLink, Sparkles, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { PLATFORM_LABELS } from '../../theme/platforms';
import { getAICoach } from '../../api/ai';

const DIFFICULTY_MAP = {
  easy: {
    label: 'Easy',
    dotClass: 'semantic-dot-easy',
    textClass: 'text-easy',
    chipClass: 'bg-easy/15 border-easy/30 text-easy',
  },
  medium: {
    label: 'Medium',
    dotClass: 'semantic-dot-medium',
    textClass: 'text-medium',
    chipClass: 'bg-medium/15 border-medium/30 text-medium',
  },
  hard: {
    label: 'Hard',
    dotClass: 'semantic-dot-hard',
    textClass: 'text-hard',
    chipClass: 'bg-hard/15 border-hard/30 text-hard',
  },
};

/**
 * RoadmapActionBanner: Daily Deliberate Recall Action Strip.
 *
 * Inspired by the "Plan Your DSA Journey" roadmap banner in executive learning dashboards:
 * - High-visibility callout for today's highest priority deliberate practice problem.
 * - Explains spaced repetition rationale.
 * - Direct 1-click CTA button to start solving or view details.
 * - Optional AI Coaching note expander.
 */
const RoadmapActionBanner = ({
  dailyFocus,
  primaryWeakTopic,
  isLoading = false,
  className = '',
}) => {
  const [coachData, setCoachData] = useState(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  const handleToggleCoach = async () => {
    if (isCoachOpen) {
      setIsCoachOpen(false);
      return;
    }
    if (coachData) {
      setIsCoachOpen(true);
      return;
    }
    if (!dailyFocus?.id && !dailyFocus?._id) return;

    setIsCoachOpen(true);
    setIsCoachLoading(true);
    try {
      const data = await getAICoach(dailyFocus.id || dailyFocus._id);
      setCoachData(data);
    } catch (err) {
      console.error('Coaching note unavailable:', err);
    } finally {
      setIsCoachLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`rounded-xl border border-line card-classy p-5 animate-pulse select-none ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-surface-2 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-40 bg-surface-2 rounded-xs" />
              <div className="h-5 w-64 bg-surface-2 rounded-xs" />
              <div className="h-3 w-80 bg-surface-2 rounded-xs" />
            </div>
          </div>
          <div className="h-10 w-36 bg-surface-2 rounded-xl shrink-0" />
        </div>
      </div>
    );
  }

  // If no problem is due today, show a clean caught-up roadmap banner
  if (!dailyFocus) {
    return (
      <div className={`rounded-xl border border-line/80 card-classy p-5 sm:p-6 select-none ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-success/12 border border-success/25 text-success shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">
                  YOUR DAILY ROADMAP · Deliberate Recall
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-text">
                Spaced Repetition Queue is Caught Up!
              </h3>
              <p className="text-xs text-muted max-w-xl leading-relaxed">
                All scheduled intervals are up to date. Explore new topics or catalog new problems to expand your coverage.
              </p>
            </div>
          </div>

          <Link
            to="/problems"
            className="btn-primary text-xs py-2.5 px-4.5 rounded-xl font-semibold inline-flex items-center justify-center gap-2 shrink-0"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const diff = DIFFICULTY_MAP[dailyFocus.difficulty] || DIFFICULTY_MAP.medium;
  const platform = PLATFORM_LABELS[dailyFocus.platform] || PLATFORM_LABELS.other;
  const weakTopicName = typeof primaryWeakTopic === 'string'
    ? primaryWeakTopic
    : primaryWeakTopic?.topic || primaryWeakTopic?.name || null;

  return (
    <div className={`rounded-xl border border-line/80 card-classy p-5 sm:p-6 select-none transition-all ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Side: Target Icon + Details */}
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
          <div className="p-3 rounded-xl bg-accent/12 border border-accent/25 text-accent shrink-0 shadow-xs">
            <Target className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Overline & Category */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                YOUR DAILY ROADMAP · Deliberate Practice Target
              </span>
              {weakTopicName && (
                <span className="text-[10px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded border border-line">
                  Focus Area: #{weakTopicName}
                </span>
              )}
            </div>

            {/* Target Title & Metadata */}
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-base sm:text-lg font-bold text-text truncate max-w-md">
                {dailyFocus.title}
              </h3>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${diff.chipClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${diff.dotClass}`} />
                <span>{diff.label}</span>
              </span>
              <span className="font-mono text-xs text-muted font-medium">
                {platform.label}
              </span>
            </div>

            {/* Subtext Rationale */}
            <p className="text-xs text-text-secondary leading-relaxed max-w-2xl line-clamp-2">
              {dailyFocus.rationale || 'Prioritized based on your forgetting curve interval to solidify algorithmic pattern retention.'}
            </p>
          </div>
        </div>

        {/* Right Side: CTAs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          <button
            type="button"
            onClick={handleToggleCoach}
            className={`btn-secondary text-xs py-2.5 px-3.5 rounded-xl font-medium inline-flex items-center gap-1.5 cursor-pointer transition-all ${
              isCoachOpen ? 'bg-accent/15 border-accent/35 text-accent' : 'text-text-secondary hover:text-text'
            }`}
            title="Toggle AI Coach cognitive hints"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isCoachLoading ? 'animate-spin' : 'text-accent'}`} />
            <span>AI Coach</span>
            {isCoachOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <Link
            to={`/problems/${dailyFocus.id || dailyFocus._id}`}
            className="btn-primary text-xs py-2.5 px-4.5 rounded-xl font-semibold inline-flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-none"
          >
            <span>Solve Target</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Expandable AI Coach Insight Panel */}
      {isCoachOpen && (
        <div className="mt-4 pt-4 border-t border-line/60 animate-fade-in space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-accent font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cognitive Recall Notes for {dailyFocus.title}:</span>
          </div>
          {isCoachLoading ? (
            <div className="space-y-2 py-2">
              <div className="h-3 w-3/4 bg-surface-2 rounded-xs animate-pulse" />
              <div className="h-3 w-1/2 bg-surface-2 rounded-xs animate-pulse" />
            </div>
          ) : coachData ? (
            <div className="text-xs text-text-secondary leading-relaxed bg-surface-2/40 p-3.5 rounded-lg border border-line">
              <p className="font-medium text-text">{coachData.summary || coachData.takeaway}</p>
              {coachData.hints?.length > 0 && (
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted">
                  {coachData.hints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted italic">
              Focus on identifying the pattern first (e.g. hash map prefix sums or two-pointer window) before writing code. Time target: ~25 mins.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RoadmapActionBanner;
