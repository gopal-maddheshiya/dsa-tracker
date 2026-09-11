import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Clock,
  Target,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { fetchProblemRecommendations } from '../../api/problems';
import Badge from '../ui/Badge';

const DIFFICULTY_COLORS = {
  easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const IntelligentRecommender = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('spaced'); // 'spaced' | 'weakness' | 'backlog'

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
      <div className="bg-[#12161F] border border-white/5 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-52 bg-white/10 rounded mb-4"></div>
        <div className="h-28 bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  if (!data || !data.dailyFocus) {
    return null;
  }

  const { dailyFocus, spacedRepetition, weaknessDrill, unattemptedBacklog, weakestTopics } = data;

  const currentList =
    activeTab === 'spaced'
      ? spacedRepetition
      : activeTab === 'weakness'
      ? weaknessDrill
      : unattemptedBacklog;

  return (
    <div className="bg-gradient-to-b from-[#151A26] to-[#0F131C] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Ambient background highlight */}
      <div
        className="absolute top-0 right-1/4 w-72 h-44 rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.35), transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Header with Weak Topics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Next Up: Adaptive Recommendation
            </h2>
            <p className="text-[11px] text-gray-400">
              Personalized practice priority tuned to your struggle areas and retention curve
            </p>
          </div>
        </div>

        {/* Weakest topics indicators */}
        {weakestTopics && weakestTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase font-semibold text-gray-400">Focus Areas:</span>
            {weakestTopics.map((w, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-gray-300 border border-white/5"
              >
                {w.topic} ({Math.round(w.struggleRatio * 100)}% struggle)
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Daily Focus Hero Card */}
      <div className="bg-[#191F2C]/90 border border-orange-500/30 rounded-xl p-5 mb-5 relative overflow-hidden group hover:border-orange-500/50 transition-all shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Top pill row */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-xs">
                <Flame className="w-3 h-3 fill-orange-400" />
                {dailyFocus.badge || 'Daily Focus'}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border capitalize ${
                  DIFFICULTY_COLORS[dailyFocus.difficulty] || 'text-gray-300'
                }`}
              >
                {dailyFocus.difficulty}
              </span>
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">
                {dailyFocus.platform}
              </span>
            </div>

            {/* Problem Title */}
            <h3 className="text-lg font-extrabold text-white group-hover:text-orange-300 transition-colors tracking-tight mb-2">
              <Link to={`/problems/${dailyFocus.id}`} className="hover:underline">
                {dailyFocus.title}
              </Link>
            </h3>

            {/* AI Rationale */}
            <p className="text-xs text-gray-300 leading-relaxed mb-3 bg-black/20 p-2.5 rounded-lg border border-white/5">
              <span className="text-orange-400 font-semibold mr-1">Why this now:</span>
              {dailyFocus.rationale}
            </p>

            {/* Topics */}
            {dailyFocus.topics && dailyFocus.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {dailyFocus.topics.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex sm:flex-col items-center gap-2.5 shrink-0">
            <Link
              to={`/problems/${dailyFocus.id}`}
              className="w-full text-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Solve & Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {dailyFocus.link && (
              <a
                href={dailyFocus.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <span>External Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for secondary queues */}
      <div>
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('spaced')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'spaced'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            Spaced Repetition Due ({spacedRepetition?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('weakness')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'weakness'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            Weak Spot Drills ({weaknessDrill?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backlog')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'backlog'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            Fresh Challenges ({unattemptedBacklog?.length || 0})
          </button>
        </div>

        {/* List items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {currentList && currentList.length > 0 ? (
            currentList.slice(0, 3).map((prob) => (
              <Link
                key={prob.id}
                to={`/problems/${prob.id}`}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      DIFFICULTY_COLORS[prob.difficulty] || 'text-gray-300'
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                  {prob.daysSinceLastAttempt !== undefined && (
                    <span className="text-[10px] text-gray-500 font-mono">
                      {prob.daysSinceLastAttempt}d ago
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-gray-200 group-hover:text-orange-400 transition-colors truncate mb-1">
                  {prob.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span className="capitalize">{prob.platform}</span>
                  <span className="text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                    Solve &rarr;
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 py-4 text-center text-xs text-gray-500 italic">
              No additional recommendations in this category. Keep solving!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelligentRecommender;
