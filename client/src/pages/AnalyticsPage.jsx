import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart2,
  Clock,
  Zap,
  Target,
  Trophy,
  Calendar,
  Flame,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { getAdvanced } from '../api/analytics.api.js';

export default function AnalyticsPage() {
  const [scope, setScope] = useState('all'); // '30d' | '90d' | 'all'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Topic matrix filters
  const [topicSearch, setTopicSearch] = useState('');
  const [masteryFilter, setMasteryFilter] = useState('all'); // 'all' | 'Mastered' | 'Proficient' | 'Needs Practice'

  const loadData = async (selectedScope) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdvanced({ scope: selectedScope });
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load advanced analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(scope);
  }, [scope]);

  // Topic Mastery filtered list
  const filteredTopics = useMemo(() => {
    if (!data?.topicMastery) return [];
    return data.topicMastery.filter((t) => {
      const matchesSearch = t.topic.toLowerCase().includes(topicSearch.toLowerCase().trim());
      const matchesFilter =
        masteryFilter === 'all' ? true : t.masteryTier === masteryFilter;
      return matchesSearch && matchesFilter;
    });
  }, [data?.topicMastery, topicSearch, masteryFilter]);

  // Rhythm max for scaling weekly rhythm chart
  const maxRhythmCount = useMemo(() => {
    if (!data?.rhythmMetrics?.dayOfWeekActivity) return 1;
    const max = Math.max(...data.rhythmMetrics.dayOfWeekActivity.map((d) => d.count), 1);
    return max;
  }, [data?.rhythmMetrics?.dayOfWeekActivity]);

  const platformColors = {
    LeetCode: 'from-amber-500 to-orange-500',
    GeeksforGeeks: 'from-emerald-500 to-green-600',
    Codeforces: 'from-blue-500 to-indigo-600',
    HackerRank: 'from-teal-500 to-emerald-600',
    InterviewBit: 'from-rose-500 to-pink-600',
    Other: 'from-gray-500 to-slate-600',
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header & Scope Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
            <BarChart2 className="w-4 h-4" />
            <span>Telemetry & Mastery</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            Advanced DSA Analytics
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Deep algorithmic velocity, retention accuracy, platform share, and topic mastery matrix.
          </p>
        </div>

        {/* Time Scope Filter Pill */}
        <div className="flex items-center p-1 rounded-xl bg-surface border border-line self-start sm:self-auto shadow-xs">
          {[
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'Last 90 Days' },
            { id: 'all', label: 'All Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScope(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                scope === tab.id
                  ? 'bg-accent text-white font-semibold shadow-xs'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs text-text-secondary font-mono">Computing advanced telemetry metrics...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm font-semibold text-rose-400">{error}</p>
          <button
            type="button"
            onClick={() => loadData(scope)}
            className="px-4 py-2 rounded-xl bg-surface border border-line text-xs font-medium text-text hover:border-accent"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* SECTION 1: TOP-TIER DEEP KPI CARDS (Divergent from Dashboard) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Avg Solve Speed */}
            <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Avg Solve Speed
                </span>
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-text font-mono">
                    {data?.timeStats?.avgSolveTimeMinutes || 0}
                  </span>
                  <span className="text-xs text-text-secondary">mins / problem</span>
                </div>
                <div className="text-[11px] text-muted mt-1">
                  Fastest solve:{' '}
                  <span className="text-emerald-400 font-semibold font-mono">
                    {data?.timeStats?.fastestSolveMinutes || 0}m
                  </span>
                </div>
              </div>
            </div>

            {/* 2. First-Try Clean Accuracy */}
            <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  First-Try Accuracy
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                    {data?.accuracyMetrics?.firstTryAccuracyPct || 0}%
                  </span>
                  <span className="text-xs text-text-secondary">flawless rate</span>
                </div>
                <div className="text-[11px] text-muted mt-1">
                  {data?.accuracyMetrics?.firstTrySolves || 0} of{' '}
                  {data?.accuracyMetrics?.totalAttempted || 0} solved in 1 attempt
                </div>
              </div>
            </div>

            {/* 3. Total Time in the Flow */}
            <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Logged Practice Time
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-text font-mono">
                    {data?.timeStats?.totalHours || '0.0'}
                  </span>
                  <span className="text-xs text-text-secondary">active hours</span>
                </div>
                <div className="text-[11px] text-muted mt-1">
                  ~{data?.timeStats?.totalMinutes || 0} total minutes spent
                </div>
              </div>
            </div>

            {/* 4. Peak Velocity Day & Longest Streak */}
            <div className="p-5 rounded-2xl bg-surface border border-line shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Peak Rhythm
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-accent">
                    {data?.rhythmMetrics?.peakProductivityDay || 'None'}
                  </span>
                </div>
                <div className="text-[11px] text-muted mt-1">
                  Best streak:{' '}
                  <span className="text-accent font-semibold font-mono">
                    {data?.rhythmMetrics?.longestStreak || 0} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: SPEED BENCHMARK & RECALL ACCURACY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speed Benchmark by Difficulty Tier */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text">
                    Solve Time Benchmarks by Difficulty
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Average minutes required per solved problem by tier.
                  </p>
                </div>
                <Clock className="w-4 h-4 text-muted" />
              </div>

              <div className="space-y-4 pt-2">
                {[
                  {
                    tier: 'Easy',
                    mins: data?.timeStats?.timeByDifficulty?.Easy || 0,
                    color: 'bg-emerald-500',
                    target: 'Target: ≤15m',
                  },
                  {
                    tier: 'Medium',
                    mins: data?.timeStats?.timeByDifficulty?.Medium || 0,
                    color: 'bg-amber-500',
                    target: 'Target: ≤30m',
                  },
                  {
                    tier: 'Hard',
                    mins: data?.timeStats?.timeByDifficulty?.Hard || 0,
                    color: 'bg-rose-500',
                    target: 'Target: ≤50m',
                  },
                ].map((item) => {
                  const maxMins = 60;
                  const pct = Math.min(100, Math.round((item.mins / maxMins) * 100));
                  return (
                    <div key={item.tier} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text">{item.tier} Problems</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted">{item.target}</span>
                          <span className="font-mono font-bold text-text">{item.mins} min</span>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-surface-2 border border-line/60 text-xs text-text-secondary flex items-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-accent shrink-0" />
                <span>
                  Tip: Top tech interview loops expect Mediums solved cleanly within 25-30 minutes.
                </span>
              </div>
            </div>

            {/* Retention & Recall Breakdown */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text">
                    Attempt Breakdown & Recall Stability
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Analysis of problems solved in 1 attempt vs multiple passes.
                  </p>
                </div>
                <RotateCw className="w-4 h-4 text-muted" />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-surface-2 border border-line text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                    {data?.accuracyMetrics?.firstTrySolves || 0}
                  </div>
                  <div className="text-[10px] text-text-secondary mt-0.5">First-Try Clean</div>
                  <div className="text-[9px] text-muted">(1 attempt)</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-line text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                    {data?.accuracyMetrics?.multiAttemptSolves || 0}
                  </div>
                  <div className="text-[10px] text-text-secondary mt-0.5">Multi-Pass</div>
                  <div className="text-[9px] text-muted">(2-3 attempts)</div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-line text-center">
                  <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">
                    {data?.accuracyMetrics?.strugglingSolves || 0}
                  </div>
                  <div className="text-[10px] text-text-secondary mt-0.5">High Friction</div>
                  <div className="text-[9px] text-muted">(4+ attempts)</div>
                </div>
              </div>

              {/* Retention stability bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text">Long-term Recall Stability</span>
                  <span className="font-mono font-bold text-accent">
                    {data?.accuracyMetrics?.retentionRatePct || 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${data?.accuracyMetrics?.retentionRatePct || 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Percentage of reviewed problems promoted up the Leitner schedule without regression.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: PLATFORM SHARE & WEEKLY RHYTHM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Share */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text">Platform Distribution</h3>
                  <p className="text-xs text-text-secondary">
                    Where your solutions are sourced and practiced.
                  </p>
                </div>
                <Layers className="w-4 h-4 text-muted" />
              </div>

              <div className="space-y-3 pt-2">
                {data?.platformDistribution && data.platformDistribution.length > 0 ? (
                  data.platformDistribution.map((item) => (
                    <div key={item.platform} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text">{item.platform}</span>
                        <span className="font-mono text-text-secondary">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                        <div
                          className={`h-full bg-gradient-to-r ${
                            platformColors[item.platform] || platformColors.Other
                          } rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(4, item.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted py-4 text-center">No platform data available yet.</p>
                )}
              </div>
            </div>

            {/* Weekly Day-of-Week Rhythm */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text">Weekly Practice Rhythm</h3>
                  <p className="text-xs text-text-secondary">
                    Distribution of problem solves by day of the week.
                  </p>
                </div>
                <Calendar className="w-4 h-4 text-muted" />
              </div>

              {/* Bar Columns */}
              <div className="grid grid-cols-7 gap-2 pt-6 items-end h-40">
                {data?.rhythmMetrics?.dayOfWeekActivity?.map((dayItem) => {
                  const heightPct = Math.min(100, Math.round((dayItem.count / maxRhythmCount) * 85) + 12);
                  const isPeak =
                    dayItem.day.toLowerCase().startsWith(
                      (data?.rhythmMetrics?.peakProductivityDay || '').slice(0, 3).toLowerCase()
                    );

                  return (
                    <div key={dayItem.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] font-mono text-muted group-hover:text-text transition-colors">
                        {dayItem.count}
                      </div>
                      <div className="w-full max-w-[32px] bg-surface-2 rounded-t-lg overflow-hidden flex flex-col justify-end h-28 border-t border-x border-line">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isPeak
                              ? 'bg-accent shadow-[0_0_12px_rgba(237,134,65,0.4)]'
                              : 'bg-surface-hover group-hover:bg-accent/40'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          isPeak ? 'text-accent' : 'text-text-secondary'
                        }`}
                      >
                        {dayItem.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-[11px] text-muted pt-1">
                Peak momentum occurs on{' '}
                <span className="font-semibold text-accent">
                  {data?.rhythmMetrics?.peakProductivityDay || 'weekdays'}
                </span>
                .
              </div>
            </div>
          </div>

          {/* SECTION 4: COMPREHENSIVE TOPIC MASTERY MATRIX */}
          <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-text">Topic Mastery Matrix</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent border border-accent/20">
                    {filteredTopics.length} Topics
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Algorithmic depth evaluation based on solve rate, volume, and solution velocity.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    placeholder="Search topics..."
                    className="w-full sm:w-44 bg-surface-2 border border-line rounded-xl pl-8 pr-3 py-1.5 text-xs text-text placeholder-muted focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-surface-2 border border-line">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'Mastered', label: 'Mastered' },
                    { id: 'Proficient', label: 'Proficient' },
                    { id: 'Needs Practice', label: 'Needs Focus' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMasteryFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        masteryFilter === tab.id
                          ? 'bg-accent text-white font-semibold'
                          : 'text-text-secondary hover:text-text'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matrix Table / Grid */}
            {filteredTopics.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">
                No topics matching your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-line text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                      <th className="py-3 px-4">Topic Area</th>
                      <th className="py-3 px-4">Solved / Total</th>
                      <th className="py-3 px-4">Success Rate</th>
                      <th className="py-3 px-4">Avg Speed</th>
                      <th className="py-3 px-4">Mastery Tier</th>
                      <th className="py-3 px-4 text-right">Confidence Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60 text-xs">
                    {filteredTopics.map((topicItem) => {
                      const tierStyle =
                        topicItem.masteryTier === 'Mastered'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                          : topicItem.masteryTier === 'Proficient'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/25';

                      return (
                        <tr
                          key={topicItem.topic}
                          className="hover:bg-surface-hover/60 transition-colors"
                        >
                          {/* Topic Name */}
                          <td className="py-3.5 px-4 font-semibold text-text">
                            {topicItem.topic}
                          </td>

                          {/* Solved / Total with mini bar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-text">
                                {topicItem.solvedCount}/{topicItem.totalProblems}
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                                <div
                                  className="h-full bg-accent rounded-full"
                                  style={{
                                    width: `${Math.round(
                                      (topicItem.solvedCount / (topicItem.totalProblems || 1)) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Success Rate */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-text">
                            {topicItem.successRate}%
                          </td>

                          {/* Avg Speed */}
                          <td className="py-3.5 px-4 font-mono text-text-secondary">
                            {topicItem.avgTimeMinutes}m
                          </td>

                          {/* Mastery Tier Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tierStyle}`}
                            >
                              {topicItem.masteryTier}
                            </span>
                          </td>

                          {/* Confidence Score */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-mono font-bold text-accent">
                              {topicItem.confidenceScore}/100
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
