import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
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
      <div className={`panel p-6 border-line animate-pulse flex flex-col justify-between h-full ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl shimmer shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-44 shimmer rounded" />
            <div className="h-3 w-64 shimmer rounded" />
          </div>
        </div>
        <div className="h-28 shimmer rounded-xl my-4" />
        <div className="h-10 w-48 shimmer rounded-xl" />
      </div>
    );
  }

  if (!data || !data.dailyFocus) {
    return null;
  }

  const { dailyFocus, weakestTopics } = data;
  const diffCfg = DIFFICULTY_CONFIG[dailyFocus.difficulty] || DIFFICULTY_CONFIG.medium;
  const platformName = PLATFORM_LABELS[dailyFocus.platform] || dailyFocus.platform;

  return (
    <div className={`panel p-6 relative overflow-hidden flex flex-col justify-between h-full group ${className}`}>
      {/* ── 1. Top Header: Kicker, Title & Focus Areas ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/12 border border-accent/25 flex items-center justify-center text-accent shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent block">
              RECOMMENDED DAILY FOCUS
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-text tracking-tight">
              Adaptive Practice Spotlight
            </h2>
          </div>
        </div>

        {/* Focus Areas pill list */}
        {weakestTopics && weakestTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            <span className="text-xs uppercase text-muted font-semibold flex items-center gap-1">
              <Target className="w-3 h-3 text-accent" />
              Focus:
            </span>
            {weakestTopics.map((w, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger/12 text-danger border border-danger/25"
              >
                <span>{w.topic}</span>
                <span className="font-semibold tabular-nums">{Math.round(w.struggleRatio * 100)}%</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. Hero Content Area: Meta, Title, Coaching, Topics ─────── */}
      <div className="py-4 sm:py-5 space-y-4 relative z-10 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Metadata Pill Row: Uniform height, distinct roles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Action priority badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent/12 text-accent border border-accent/25">
              <Flame className="w-3.5 h-3.5 fill-accent shrink-0" />
              <span>{dailyFocus.badge || 'Priority Practice'}</span>
            </span>

            {/* Difficulty Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${diffCfg.text} ${diffCfg.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
              <span>{dailyFocus.difficulty}</span>
            </span>

            {/* Platform Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase bg-surface-2 text-text-secondary border border-line">
              {platformName}
            </span>
          </div>

          {/* Problem Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-text group-hover:text-accent transition-colors tracking-tight leading-snug">
            <Link to={`/problems/${dailyFocus.id}`} className="hover:underline">
              {dailyFocus.title}
            </Link>
          </h3>

          {/* AI Coaching Explanation Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-surface-2 border-l-2 border-l-accent border border-line">
            <div className="flex items-center gap-1.5 text-accent font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Why this problem now</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {dailyFocus.rationale}
            </p>
          </div>

          {/* Topic Hashtags */}
          {dailyFocus.topics && dailyFocus.topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {dailyFocus.topics.map((t, i) => (
                <span key={i} className="chip-topic">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── 3. Symmetrical Action CTAs ────────────────────────────── */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to={`/problems/${dailyFocus.id}`}
            className="btn-primary w-full sm:w-auto"
          >
            <span>Solve & Log Problem</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {dailyFocus.link && (
            <a
              href={dailyFocus.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto"
            >
              <span>Original Problem</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelligentRecommender;
