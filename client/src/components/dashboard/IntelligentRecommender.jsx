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
  easy: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400' },
  medium: { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25', dot: 'bg-amber-400' },
  hard: { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/25', dot: 'bg-rose-400' },
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
      <div className={`panel p-6 border-white/[0.08] animate-pulse flex flex-col justify-between h-full ${className}`}>
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
    <div
      className={`panel p-6 border-white/[0.08] relative overflow-hidden flex flex-col justify-between h-full group ${className}`}
      style={{
        background:
          'radial-gradient(ellipse 70% 60% at 90% 10%, rgba(249,115,22,0.12) 0%, transparent 65%), linear-gradient(180deg, rgba(22, 27, 39, 0.85) 0%, rgba(14, 17, 26, 0.92) 100%)',
      }}
    >
      {/* ── 1. Top Header: Kicker, Title & Focus Areas ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08] relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md shadow-orange-500/20 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400/90 block">
              RECOMMENDED DAILY FOCUS
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Adaptive Practice Spotlight
            </h2>
          </div>
        </div>

        {/* Focus Areas pill list */}
        {weakestTopics && weakestTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
              <Target className="w-3 h-3 text-orange-400" />
              Focus:
            </span>
            {weakestTopics.map((w, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
              >
                <span>{w.topic}</span>
                <span className="text-rose-400/80 font-bold">{Math.round(w.struggleRatio * 100)}%</span>
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <Flame className="w-3.5 h-3.5 fill-orange-400 shrink-0" />
              <span>{dailyFocus.badge || 'Priority Practice'}</span>
            </span>

            {/* Difficulty Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase border ${diffCfg.text} ${diffCfg.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
              <span>{dailyFocus.difficulty}</span>
            </span>

            {/* Platform Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold uppercase bg-white/[0.04] text-slate-300 border border-white/[0.08]">
              {platformName}
            </span>
          </div>

          {/* Problem Title: High contrast, multiline safe */}
          <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-orange-300 transition-colors tracking-tight leading-snug">
            <Link to={`/problems/${dailyFocus.id}`} className="hover:underline">
              {dailyFocus.title}
            </Link>
          </h3>

          {/* AI Coaching Explanation Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border-l-2 border-l-orange-500 border border-white/[0.06] shadow-xs">
            <div className="flex items-center gap-1.5 text-orange-400 font-mono font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Why this problem now</span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-sans">
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
          {/* Primary Solve & Log CTA */}
          <Link
            to={`/problems/${dailyFocus.id}`}
            className="btn-primary w-full sm:w-auto"
          >
            <span>Solve & Log Problem</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Secondary External Link CTA: Symmetrical 40px height */}
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
