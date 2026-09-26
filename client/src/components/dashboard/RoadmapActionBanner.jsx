import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, ExternalLink, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { PLATFORM_LABELS } from '../../theme/platforms';
import { getAICoach } from '../../api/ai';
import { useAuth } from '../../context/AuthContext';
import { DEMO_AI_COACH } from '../../data/demoData';

const DIFFICULTY_MAP = {
  easy: {
    label: 'Easy',
    chipClass: 'bg-easy/10 border-easy/25 text-easy',
  },
  medium: {
    label: 'Medium',
    chipClass: 'bg-medium/10 border-medium/25 text-medium',
  },
  hard: {
    label: 'Hard',
    chipClass: 'bg-hard/10 border-hard/25 text-hard',
  },
};

/**
 * RoadmapActionBanner: Today's Practice Mission Spotlight.
 *
 * Implements Phase UI Next-Level Command Center:
 * - High-contrast obsidian glass card with specular top accent.
 * - Eyebrow with animated radar beacon.
 * - Problem title with platform & topic pills.
 * - Clear single-sentence retention rationale.
 * - One dominant Solve Target CTA + AI Coach toggle.
 */
const RoadmapActionBanner = ({
  dailyFocus,
  primaryWeakTopic,
  isLoading = false,
  className = '',
}) => {
  const { isAuthenticated } = useAuth();
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

    if (!isAuthenticated) {
      setCoachData(DEMO_AI_COACH);
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
      <div className={`kpi-card p-5 sm:p-6 animate-pulse select-none ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2.5 flex-1">
            <div className="h-3 w-32 bg-surface-2 rounded-xs" />
            <div className="h-6 w-60 bg-surface-2 rounded-md" />
            <div className="h-3 w-72 bg-surface-2 rounded-xs" />
          </div>
          <div className="h-10 w-32 bg-surface-2 rounded-lg shrink-0" />
        </div>
      </div>
    );
  }

  // If no problem is due today, show caught-up state
  if (!dailyFocus) {
    return (
      <div className={`kpi-card p-5 sm:p-6 select-none ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-easy/10 border border-easy/25 text-easy shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold block">
                TODAY'S MISSION
              </span>
              <h3 className="text-sm sm:text-base font-bold text-text">
                Spaced Repetition Queue is Caught Up
              </h3>
              <p className="text-xs text-text-secondary max-w-xl">
                All scheduled recall intervals are optimal. Explore new topics or catalog problems to expand coverage.
              </p>
            </div>
          </div>

          <Link
            to="/problems"
            className="btn-primary text-xs py-2 px-4 rounded-lg font-semibold inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const diffKey = dailyFocus.difficulty?.toLowerCase() || 'medium';
  const diff = DIFFICULTY_MAP[diffKey] || DIFFICULTY_MAP.medium;
  const platform = PLATFORM_LABELS[dailyFocus.platform] || PLATFORM_LABELS.other;
  const topics = Array.isArray(dailyFocus.topics)
    ? dailyFocus.topics
    : typeof dailyFocus.topic === 'string'
    ? [dailyFocus.topic]
    : [];

  const targetProblemId = dailyFocus.id || dailyFocus._id;
  const externalUrl = dailyFocus.problemUrl || dailyFocus.url || null;

  return (
    <section
      aria-label="Today's Practice Mission"
      className={`relative kpi-card p-4 sm:p-5 lg:p-6 select-none border border-line-subtle/80 hover:border-line shadow-xs ${className}`}
    >
      {/* Specular Top Subtle Reflection */}
      <div className="absolute top-0 inset-x-8 sm:inset-x-16 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        
        {/* Left Side: Mission Context & Dominant Problem Details */}
        <div className="space-y-2 sm:space-y-2.5 flex-1 min-w-0">
          
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/90" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
              TODAY'S MISSION
            </span>
            <span className="text-muted/40">·</span>
            <span className="text-[11px] text-muted font-medium">
              Next pattern step in curriculum
            </span>
          </div>

          {/* Problem Title */}
          <h2 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-text leading-tight max-w-xl">
            <Link
              to={`/problems/${targetProblemId}`}
              className="hover:text-accent transition-colors"
            >
              {dailyFocus.title}
            </Link>
          </h2>

          {/* Metadata Chips: Difficulty · Platform · Topics */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${diff.chipClass}`}>
              {diff.label}
            </span>
            <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-surface-2 border border-line-subtle text-text-secondary">
              {platform.label}
            </span>
            {topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-surface-2/60 border border-line-subtle/60 text-muted"
              >
                {topic}
              </span>
            ))}
          </div>

          {/* Why this problem? */}
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl pt-0.5">
            <strong className="text-text font-medium">Why today: </strong>
            <span>
              {dailyFocus.rationale || 'Prioritized based on your spaced repetition curve to solidify algorithmic pattern retention.'}
            </span>
          </p>

        </div>

        {/* Right Side: Actions (Dominant Solve Target + Secondary Coach + Platform) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 shrink-0 pt-1 lg:pt-0">
          
          {/* Tertiary: Open on platform */}
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-muted hover:text-text px-2 py-2 inline-flex items-center gap-1 transition-colors"
              title="Open problem on platform"
            >
              <span>Platform</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Secondary: Coach Toggle (Engineering hint) */}
          <button
            type="button"
            onClick={handleToggleCoach}
            className={`text-xs font-medium py-2 px-3 rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors border ${
              isCoachOpen
                ? 'bg-surface-2 border-line text-text'
                : 'bg-surface-2/80 hover:bg-surface-2 border-line-subtle text-text-secondary hover:text-text'
            }`}
            title="Toggle cognitive coaching hint"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isCoachLoading ? 'animate-spin' : 'text-accent'}`} />
            <span>AI Hint</span>
            {isCoachOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Primary: Solve Target → (Refined Clean CTA) */}
          <Link
            to={`/problems/${targetProblemId}`}
            className="bg-accent hover:bg-accent-hover text-bg text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg font-bold inline-flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all tracking-tight flex-1 sm:flex-none cursor-pointer"
          >
            <span>Solve Target</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Expandable AI Coach Insight Panel */}
      {isCoachOpen && (
        <div className="mt-3.5 pt-3.5 border-t border-line-subtle/80 animate-fade-in space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-accent font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Cognitive Recall Notes · {dailyFocus.title}:</span>
          </div>
          {isCoachLoading ? (
            <div className="space-y-1.5 py-1">
              <div className="h-3 w-3/4 bg-surface-2 rounded-xs animate-pulse" />
              <div className="h-3 w-1/2 bg-surface-2 rounded-xs animate-pulse" />
            </div>
          ) : coachData ? (
            <div className="text-xs text-text-secondary leading-relaxed bg-surface-2/60 p-3 rounded-lg border border-line-subtle space-y-1.5">
              <p className="font-medium text-text">{coachData.summary || coachData.takeaway}</p>
              {coachData.hints?.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-muted pt-1">
                  {coachData.hints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="text-xs text-text-secondary bg-surface-2/60 p-3 rounded-lg border border-line-subtle">
              <p>Focus on identifying the core pattern before writing code. Aim for clean O(N) auxiliary space management.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default RoadmapActionBanner;
