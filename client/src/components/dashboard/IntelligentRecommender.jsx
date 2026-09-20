import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Flame,
  Target,
} from 'lucide-react';
import { fetchProblemRecommendations } from '../../api/problems';

const DIFFICULTY_CONFIG = {
  easy: { text: 'text-easy', bg: 'bg-easy/12 border-easy/25', dot: 'bg-easy' },
  medium: { text: 'text-medium', bg: 'bg-medium/12 border-medium/25', dot: 'bg-medium' },
  hard: { text: 'text-hard', bg: 'bg-hard/12 border-hard/25', dot: 'bg-hard' },
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  gfg: 'GeeksforGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'External',
};

const IntelligentRecommender = ({ className = '' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetchProblemRecommendations();
      if (res?.success && res.data) {
        setData(res.data);
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
      <div className={`panel p-4 sm:p-6 border-line animate-pulse flex flex-col justify-between h-full ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl shimmer shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 w-36 max-w-full shimmer rounded" />
            <div className="h-3 w-48 max-w-full shimmer rounded" />
          </div>
        </div>
        <div className="h-28 shimmer rounded-xl my-4" />
        <div className="h-10 w-40 max-w-full shimmer rounded-xl" />
      </div>
    );
  }

  if (!data || !data.dailyFocus) {
    return (
      <div className={`panel p-5 sm:p-6 flex flex-col justify-between h-full text-center items-center ${className}`}>
        <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-2 mt-4">
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

  return (
    <div className={`panel p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between h-full group ${className}`}>
      {/* ── 1. Top Header: Clean, balanced focus identity ────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-line relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/12 border border-accent/25 flex items-center justify-center text-accent shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-accent block leading-tight">
              Recommended Daily Focus
            </span>
            <h2 className="text-sm sm:text-base font-bold text-text tracking-tight leading-tight">
              Adaptive Practice Spotlight
            </h2>
          </div>
        </div>

        {/* Focus Areas pill list */}
        {weakestTopics && weakestTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            <span className="text-[10px] sm:text-[11px] uppercase text-muted font-semibold flex items-center gap-1">
              <Target className="w-3 h-3 text-accent" />
              Focus:
            </span>
            {weakestTopics.map((w, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-danger/10 text-danger border border-danger/20"
              >
                <span>{w.topic}</span>
                <span className="font-semibold tabular-nums">{Math.round(w.struggleRatio * 100)}%</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. Hero Content Area: Grouped Problem Identity & Insight ── */}
      <div className="py-3.5 sm:py-4 space-y-3.5 relative z-10 flex-1 flex flex-col justify-between">
        
        {/* Core Subject: Priority Pill + Title + Metadata Row */}
        <div className="space-y-2">
          {/* Priority Status Tag */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-accent/12 text-accent border border-accent/25">
              <Flame className="w-3 h-3 fill-accent shrink-0" />
              <span>{dailyFocus.badge || 'Priority Practice'}</span>
            </span>
          </div>

          {/* Problem Title */}
          <h3 className="text-lg sm:text-xl font-bold text-text tracking-tight leading-snug">
            <Link to={`/problems/${dailyFocus.id}`} className="hover:text-accent transition-colors hover:underline">
              {dailyFocus.title}
            </Link>
          </h3>

          {/* Consolidated Metadata Line: Difficulty + Platform + Topics in one clean line */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Difficulty Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase border ${diffCfg.text} ${diffCfg.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
              <span>{dailyFocus.difficulty}</span>
            </span>

            {/* Platform Badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium uppercase bg-surface-2 text-text-secondary border border-line">
              {platformName}
            </span>

            <span className="text-muted/40 hidden sm:inline">•</span>

            {/* Topic Tags */}
            {dailyFocus.topics && dailyFocus.topics.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-surface-2 text-text-secondary border border-line/60 hover:text-text hover:border-line transition-colors"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Spaced Repetition Rationale Box (Compact & Indented) */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-surface-2/50 border border-line/50 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent/15 flex items-center justify-center text-accent shrink-0">
              <Lightbulb className="w-2.5 h-2.5" />
            </div>
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
              Why this problem now
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed pl-6">
            {dailyFocus.rationale}
          </p>
        </div>

        {/* ── 3. Anchored Action CTAs ──────────────────────────────── */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <Link
            to={`/problems/${dailyFocus.id}`}
            className="btn-primary w-full sm:w-auto text-center justify-center text-xs py-2 px-4"
          >
            <span>Solve & Log Problem</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {dailyFocus.link && (
            <a
              href={dailyFocus.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto text-center justify-center text-xs py-2 px-4"
            >
              <span>Original Problem</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};

export default IntelligentRecommender;
