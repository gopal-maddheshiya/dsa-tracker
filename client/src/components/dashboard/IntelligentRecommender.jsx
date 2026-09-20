import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ExternalLink,
  Flame,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { fetchProblemRecommendations } from '../../api/problems';

const DIFFICULTY_CONFIG = {
  easy: { text: 'text-easy', bg: 'bg-easy/10 border-easy/25', dot: 'bg-easy' },
  medium: { text: 'text-medium', bg: 'bg-medium/10 border-medium/25', dot: 'bg-medium' },
  hard: { text: 'text-hard', bg: 'bg-hard/10 border-hard/25', dot: 'bg-hard' },
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  gfg: 'GeeksforGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'External',
};

const IntelligentRecommender = ({ className = '', onFocusLoaded = null }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetchProblemRecommendations();
      if (res?.success && res.data) {
        setData(res.data);
        if (res.data.dailyFocus?.id && onFocusLoaded) {
          onFocusLoaded(res.data.dailyFocus.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className={`panel p-4 sm:p-5 border-line animate-pulse flex flex-col justify-between h-full ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg shimmer shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 w-36 shimmer rounded" />
            <div className="h-3 w-48 shimmer rounded" />
          </div>
        </div>
        <div className="h-28 shimmer rounded-xl my-4" />
        <div className="h-10 w-44 shimmer rounded-xl" />
      </div>
    );
  }

  if (!data || !data.dailyFocus) {
    return (
      <div className={`panel p-5 sm:p-6 flex flex-col justify-between h-full text-center items-center ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-2 mt-4">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text">Practice Queue Clear</h3>
          <p className="text-xs text-muted max-w-sm mx-auto my-2 leading-relaxed">
            Catalog new DSA problems to unlock adaptive daily recommendations and spaced repetition schedules.
          </p>
        </div>
        <div className="mt-3 mb-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
            className="btn-primary text-xs cursor-pointer"
          >
            + Catalog a Problem
          </button>
        </div>
      </div>
    );
  }

  const { dailyFocus, weakestTopics } = data;
  const diffCfg = DIFFICULTY_CONFIG[dailyFocus.difficulty] || DIFFICULTY_CONFIG.medium;
  const platformName = PLATFORM_LABELS[dailyFocus.platform] || dailyFocus.platform;
  const primaryWeakTopic = weakestTopics && weakestTopics.length > 0 ? weakestTopics[0] : null;

  // Clean topics (max 3, no hashtags)
  const displayTopics = (dailyFocus.topics || []).slice(0, 3);
  const extraTopicCount = Math.max(0, (dailyFocus.topics?.length || 0) - 3);

  return (
    <div className={`panel p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between h-full group ${className}`}>
      {/* ── 1. Header: Clean Copilot Identity ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-line/60 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-accent uppercase block leading-tight">
              Adaptive Practice Spotlight
            </span>
            <h2 className="text-sm sm:text-base font-bold text-text tracking-tight leading-tight mt-0.5">
              Recommended Daily Focus
            </h2>
          </div>
        </div>

        {/* Focused Weakness Target Pill */}
        {primaryWeakTopic && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-danger/10 text-danger border border-danger/20 self-start sm:self-center shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            <span>Target:</span>
            <span className="font-semibold text-text">{primaryWeakTopic.topic}</span>
            <span className="text-danger font-mono font-semibold tabular-nums">
              ({Math.round(primaryWeakTopic.struggleRatio * 100)}%)
            </span>
          </div>
        )}
      </div>

      {/* ── 2. Problem Focus Content ────────────────────────────────── */}
      <div className="py-4 space-y-3.5 relative z-10 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2.5">
          {/* Status Tag */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/25">
              <Flame className="w-3 h-3 fill-accent shrink-0" />
              <span>{dailyFocus.badge || 'Priority Revision'}</span>
            </span>
          </div>

          {/* Problem Title */}
          <h3 className="text-lg sm:text-xl font-bold text-text tracking-tight leading-snug">
            <Link
              to={`/problems/${dailyFocus.id}`}
              className="hover:text-accent transition-colors hover:underline"
            >
              {dailyFocus.title}
            </Link>
          </h3>

          {/* Metadata Row: Difficulty + Platform + Clean Topic Tags */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
            {/* Difficulty Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${diffCfg.text} ${diffCfg.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
              <span>{dailyFocus.difficulty}</span>
            </span>

            {/* Platform Badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-2/80 text-text-secondary border border-line/60">
              {platformName}
            </span>

            <span className="text-line hidden sm:inline">•</span>

            {/* Clean Topic Pills (no # clutter) */}
            {displayTopics.map((topic, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-2/60 text-text-secondary border border-line/50 hover:text-text hover:border-line transition-colors"
              >
                {topic}
              </span>
            ))}

            {extraTopicCount > 0 && (
              <span className="text-[10px] font-mono text-muted px-1.5 py-0.5 rounded bg-surface-2 border border-line/40">
                +{extraTopicCount}
              </span>
            )}
          </div>
        </div>

        {/* ── 3. Spaced Recall Rationale (Refined Copilot Callout) ──── */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-surface-2/40 border-l-2 border-accent border-y border-r border-line/40 space-y-1 my-1">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
              Why this problem now
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-text-secondary leading-relaxed pl-5">
            {dailyFocus.rationale}
          </p>
        </div>

        {/* ── 4. Anchored Action CTAs ──────────────────────────────── */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <Link
            to={`/problems/${dailyFocus.id}`}
            className="btn-primary w-full sm:w-auto text-center justify-center text-xs py-2 px-4 shadow-[0_0_12px_rgba(255,161,22,0.2)] hover:shadow-[0_0_18px_rgba(255,161,22,0.35)] transition-all font-semibold"
          >
            <span>Solve & Log Attempt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {dailyFocus.link && (
            <a
              href={dailyFocus.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto text-center justify-center text-xs py-2 px-3.5 hover:border-accent/40 transition-colors font-medium text-text-secondary hover:text-text"
            >
              <span>Open on {platformName}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};

export default IntelligentRecommender;
