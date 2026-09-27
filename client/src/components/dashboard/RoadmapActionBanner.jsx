import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, ExternalLink, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { PLATFORM_LABELS } from '../../theme/platforms';
import { getAICoach } from '../../api/ai';
import { useAuth } from '../../context/AuthContext';
import { DEMO_AI_COACH } from '../../data/demoData';

const DIFFICULTY_MAP = {
  easy: {
    label: 'Easy',
    chipClass: 'bg-easy/10 border-easy/30 text-easy',
  },
  medium: {
    label: 'Medium',
    chipClass: 'bg-medium/10 border-medium/30 text-medium',
  },
  hard: {
    label: 'Hard',
    chipClass: 'bg-hard/10 border-hard/30 text-hard',
  },
};

/**
 * RoadmapActionBanner: Today's Practice Mission Spotlight (LeetCode Daily Challenge Style).
 *
 * Implements Premium Deliberate Practice Spotlight:
 * - Thick left amber accent console bar (border-l-4 border-l-accent).
 * - Specular top hairline reflection.
 * - Live radar beacon pulse.
 * - Difficulty, platform, and algorithmic pattern chips.
 * - High-contrast dominant "Solve Target" CTA + expandable AI Engineering Terminal.
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
      <div className={`rounded-xl border border-line bg-surface p-5 sm:p-6 animate-pulse select-none ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2.5 flex-1">
            <div className="h-3.5 w-36 bg-surface-2 rounded" />
            <div className="h-7 w-64 bg-surface-2 rounded-md" />
            <div className="h-3 w-80 bg-surface-2 rounded" />
          </div>
          <div className="h-10 w-36 bg-surface-2 rounded-lg shrink-0" />
        </div>
      </div>
    );
  }

  // If no problem is due today, show caught-up state
  if (!dailyFocus) {
    return (
      <div className={`rounded-xl border border-line bg-surface p-5 sm:p-6 select-none ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-easy/10 border border-easy/25 text-easy shrink-0">
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
                All scheduled recall intervals are optimal. Explore new topics or catalog problems to expand algorithmic coverage.
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
      className={`relative rounded-xl border border-line border-l-[4px] border-l-accent bg-surface p-4 sm:p-5 lg:p-6 select-none shadow-xs hover:border-line-subtle transition-all overflow-hidden ${className}`}
    >
      {/* Specular Top Subtle Reflection */}
      <div className="absolute top-0 inset-x-8 sm:inset-x-16 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        
        {/* Left Side: Mission Context & Dominant Problem Details */}
        <div className="space-y-2.5 flex-1 min-w-0">
          
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(255,161,22,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
              DAILY PRACTICE CHALLENGE
            </span>
            <span className="text-muted/40">·</span>
            <span className="text-[11px] text-muted font-medium font-mono">
              Ebbinghaus Spaced Recall
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
            <span className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold border ${diff.chipClass}`}>
              {diff.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-md font-mono text-[11px] bg-surface-2 border border-line-subtle text-text-secondary font-medium">
              {platform.label}
            </span>
            {topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="px-2.5 py-0.5 rounded-md font-mono text-[11px] bg-surface-2/70 border border-line-subtle/80 text-muted hover:text-text-secondary transition-colors"
              >
                {topic}
              </span>
            ))}
          </div>

          {/* Why this problem? */}
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl pt-0.5">
            <strong className="text-text font-semibold">Why today: </strong>
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
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Secondary: Coach Toggle (Engineering hint) */}
          <button
            type="button"
            onClick={handleToggleCoach}
            className={`text-xs font-semibold py-2 sm:py-2.5 px-3.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors border ${
              isCoachOpen
                ? 'bg-surface-2 border-line text-text'
                : 'bg-surface-2/80 hover:bg-surface-2 border-line-subtle text-text-secondary hover:text-text'
            }`}
            title="Toggle cognitive coaching hint"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isCoachLoading ? 'animate-spin text-accent' : 'text-accent'}`} />
            <span>AI Hint</span>
            {isCoachOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Primary: Solve Target → (Bold LeetCode Orange CTA) */}
          <Link
            to={`/problems/${targetProblemId}`}
            className="bg-accent hover:bg-accent-hover text-bg text-xs sm:text-sm py-2 sm:py-2.5 px-5 rounded-lg font-black inline-flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all tracking-tight flex-1 sm:flex-none cursor-pointer"
          >
            <span>Solve Target</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>

      </div>

      {/* Expandable AI Coach Insight Panel (Engineering Terminal Style) */}
      {isCoachOpen && (
        <div className="mt-4 pt-4 border-t border-line animate-fade-in space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-accent font-semibold">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-1">
                <span className="w-2 h-2 rounded-full bg-hard/70" />
                <span className="w-2 h-2 rounded-full bg-medium/70" />
                <span className="w-2 h-2 rounded-full bg-easy/70" />
              </div>
              <Terminal className="w-3.5 h-3.5 text-accent" />
              <span>Cognitive Recall Notes · {dailyFocus.title}</span>
            </div>
            <span className="text-[10px] text-muted">Complexity & Pattern Anchor</span>
          </div>

          {isCoachLoading ? (
            <div className="space-y-2 py-2">
              <div className="h-3 w-3/4 bg-surface-2 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-surface-2 rounded animate-pulse" />
            </div>
          ) : coachData ? (
            <div className="text-xs text-text-secondary leading-relaxed bg-[#181818] p-3.5 rounded-lg border border-line space-y-2.5 font-mono shadow-inner">
              <div className="flex items-center gap-2 text-[11px] text-accent/80 font-bold border-b border-line-subtle/50 pb-1.5">
                <span>$</span>
                <span className="text-text-secondary">pattern-digest --target "{dailyFocus.title}"</span>
              </div>
              <p className="text-text font-medium leading-normal pl-3 border-l-2 border-accent/40">
                {coachData.summary || coachData.takeaway}
              </p>
              {coachData.hints?.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-muted pt-1 border-t border-line-subtle/40">
                  {coachData.hints.map((hint, idx) => (
                    <li key={idx} className="text-[11px]">{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="text-xs text-text-secondary bg-[#181818] p-3.5 rounded-lg border border-line font-mono shadow-inner">
              <p className="pl-3 border-l-2 border-accent/40">
                Focus on identifying the core pattern before writing code. Aim for clean O(N) auxiliary space management.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default RoadmapActionBanner;
