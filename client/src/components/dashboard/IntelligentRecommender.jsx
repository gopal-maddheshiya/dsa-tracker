import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { fetchProblemRecommendations } from '../../api/problems';

const DIFFICULTY_CONFIG = {
  easy: { text: 'text-easy', dot: 'bg-easy' },
  medium: { text: 'text-medium', dot: 'bg-medium' },
  hard: { text: 'text-hard', dot: 'bg-hard' },
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  codeforces: 'Codeforces',
  gfg: 'GeeksforGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  atcoder: 'AtCoder',
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
        <div className="flex items-center justify-between pb-3 border-b border-line/40">
          <div className="h-4 w-28 shimmer rounded" />
          <div className="h-4 w-20 shimmer rounded" />
        </div>
        <div className="space-y-3 py-4">
          <div className="h-5 w-48 shimmer rounded" />
          <div className="h-3.5 w-64 shimmer rounded" />
          <div className="h-14 w-full shimmer rounded-lg" />
        </div>
        <div className="h-8 w-36 shimmer rounded-lg" />
      </div>
    );
  }

  if (!data || !data.dailyFocus) {
    return (
      <div className={`panel p-5 sm:p-6 flex flex-col justify-between h-full text-center items-center ${className}`}>
        <div className="w-9 h-9 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-muted mb-2 mt-2">
          <Compass className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text">Practice Queue Clear</h3>
          <p className="text-xs text-muted max-w-sm mx-auto my-1.5 leading-relaxed">
            All priority spaced revisions are up to date. Catalog new problems to generate fresh drill recommendations.
          </p>
        </div>
        <div className="mt-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
            className="btn-primary text-xs py-1.5 px-3 cursor-pointer"
          >
            + Catalog Problem
          </button>
        </div>
      </div>
    );
  }

  const { dailyFocus, weakestTopics } = data;
  const diffCfg = DIFFICULTY_CONFIG[dailyFocus.difficulty] || DIFFICULTY_CONFIG.medium;
  const platformName = PLATFORM_LABELS[dailyFocus.platform] || dailyFocus.platform;
  const primaryWeakTopic = weakestTopics && weakestTopics.length > 0 ? weakestTopics[0] : null;
  const topicList = (dailyFocus.topics || []).slice(0, 3).join(', ');

  return (
    <div className={`panel p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between h-full group ${className}`}>
      {/* ── 1. Clean Understated Header ────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-line/50">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-accent shrink-0" />
          <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Daily Focus
          </h2>
          <span className="text-[10px] text-muted font-mono font-medium px-1.5 py-0.2 rounded bg-surface-2 border border-line/60">
            AI Recommended
          </span>
        </div>

        {/* Quiet Target Context */}
        {primaryWeakTopic && (
          <span className="text-xs text-muted hidden sm:inline-flex items-center gap-1">
            Focus area: <strong className="text-text font-medium">{primaryWeakTopic.topic}</strong>
            <span className="text-[11px] font-mono text-danger font-semibold">
              ({Math.round(primaryWeakTopic.struggleRatio * 100)}% struggle)
            </span>
          </span>
        )}
      </div>

      {/* ── 2. Content Zone ────────────────────────────────────────── */}
      <div className="py-3.5 space-y-3 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2">
          {/* Subtle Tag */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-2 border border-line/60 text-text-secondary">
              <span>{dailyFocus.badge || 'Priority Drill'}</span>
            </span>
          </div>

          {/* Problem Title */}
          <h3 className="text-base sm:text-lg font-bold text-text tracking-tight leading-snug">
            <Link
              to={`/problems/${dailyFocus.id}`}
              className="hover:text-accent transition-colors hover:underline"
            >
              {dailyFocus.title}
            </Link>
          </h3>

          {/* Clean Inline Metadata Line (No bulky pill soup) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            {/* Difficulty */}
            <span className={`inline-flex items-center font-semibold ${diffCfg.text}`}>
              <span className="capitalize">{dailyFocus.difficulty}</span>
            </span>

            <span className="text-line/60">/</span>

            {/* Platform */}
            <span className="text-text-secondary font-medium">
              {platformName}
            </span>

            {topicList && (
              <>
                <span className="text-line/60">/</span>
                <span className="text-muted truncate">
                  {topicList}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── 3. Subtle Spaced Recall Insight (Elegant Accent Bar) ─── */}
        <div className="border-l-2 border-accent/70 pl-3 py-1 bg-surface-2/30 rounded-r-md">
          <p className="text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold text-text">Memory Insight: </span>
            {dailyFocus.rationale}
          </p>
        </div>

        {/* ── 4. Balanced Action CTAs ──────────────────────────────── */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          <Link
            to={`/problems/${dailyFocus.id}`}
            className="btn-primary text-xs py-1.5 px-3.5 rounded-md font-semibold inline-flex items-center gap-1.5 shadow-none"
          >
            <span>Solve & Log Attempt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {dailyFocus.link && (
            <a
              href={dailyFocus.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs py-1.5 px-3 rounded-md font-medium inline-flex items-center gap-1.5 text-text-secondary hover:text-text"
            >
              <span>View on {platformName}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};

export default IntelligentRecommender;
