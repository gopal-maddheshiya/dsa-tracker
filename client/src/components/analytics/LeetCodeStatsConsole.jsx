import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap, Trophy, Activity, Globe, Code2, Repeat } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';
import { easy, medium, hard } from '../../theme/colors';
import { PLATFORM_CONFIG } from '../../theme/platforms';

/**
 * LeetCodeStatsConsole: Dedicated LeetCode Solved & Momentum Console.
 * Symmetrically pairs with PracticeStudio on laptop viewports.
 *
 * Top Zone: Solved Problems Donut (108px) + Stacked Easy/Med/Hard Bars.
 * Mid Zone: 7-Day Consistency Rhythm + Today's Target Status Rail.
 * Bottom Zone: Active Streak & Practice Output Tiles.
 */
const LeetCodeStatsConsole = ({
  summary,
  isLoading = false,
  solveRate = 0,
  heatmapData = [],
  revisionCount = 0,
  className = '',
}) => {
  // Calculate 7-Day Consistency Rhythm & Today's Target Status from real heatmap logs
  const { weekDays, weekTotal, todayCount } = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const countMap = new Map();
    (heatmapData || []).forEach(({ date, count }) => {
      if (date) countMap.set(date, Number(count) || 0);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    let total = 0;
    let todayLogged = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const count = countMap.get(iso) || 0;
      const isToday = i === 0;

      if (isToday) todayLogged = count;
      total += count;

      days.push({
        date: iso,
        shortDay: isToday ? 'Now' : dayNames[d.getDay()],
        count,
        isToday,
      });
    }

    return { weekDays: days, weekTotal: total, todayCount: todayLogged };
  }, [heatmapData]);

  // Extract active platforms breakdown unconditionally before any early returns
  const platformBreakdown = summary?.platformBreakdown || {};
  const activePlatforms = useMemo(() => {
    return [
      { key: 'leetcode', label: 'LeetCode', short: 'LC', count: platformBreakdown.leetcode || 0, style: PLATFORM_CONFIG.leetcode.style },
      { key: 'codeforces', label: 'Codeforces', short: 'CF', count: platformBreakdown.codeforces || 0, style: PLATFORM_CONFIG.codeforces.style },
      { key: 'gfg', label: 'GeeksforGeeks', short: 'GFG', count: platformBreakdown.gfg || 0, style: PLATFORM_CONFIG.gfg.style },
      { key: 'codechef', label: 'CodeChef', short: 'CC', count: platformBreakdown.codechef || 0, style: PLATFORM_CONFIG.codechef.style },
      { key: 'hackerrank', label: 'HackerRank', short: 'HR', count: platformBreakdown.hackerrank || 0, style: PLATFORM_CONFIG.hackerrank.style },
      { key: 'other', label: 'Other', short: 'Ext', count: platformBreakdown.other || 0, style: PLATFORM_CONFIG.other.style },
    ].filter((p) => p.count > 0);
  }, [platformBreakdown]);

  if (isLoading) {
    return (
      <div className={`panel p-4 sm:p-5 border-line animate-pulse flex flex-col justify-between h-full ${className}`}>
        <div className="space-y-3 pb-4 border-b border-line/40">
          <div className="flex justify-between">
            <div className="h-4 w-28 shimmer rounded" />
            <div className="h-4 w-20 shimmer rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-surface-2 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-surface-2 rounded" />
              <div className="h-3.5 bg-surface-2 rounded" />
              <div className="h-3.5 bg-surface-2 rounded" />
            </div>
          </div>
        </div>
        <div className="py-2 space-y-2">
          <div className="h-10 bg-surface-2 rounded-lg" />
        </div>
        <div className="pt-2 grid grid-cols-2 gap-3">
          <div className="h-20 bg-surface-2 rounded-xl" />
          <div className="h-20 bg-surface-2 rounded-xl" />
        </div>
      </div>
    );
  }

  const totalProblems = summary?.totalProblems || 0;
  const solvedProblems = summary?.solvedProblems || 0;
  const currentStreak = summary?.currentStreak || 0;
  const longestStreak = summary?.longestStreak || currentStreak;
  const totalAttempts = summary?.totalAttempts || 0;
  const overallPct = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  // Extract counts per difficulty
  const diffItems = summary?.difficultyBreakdown || [];
  const easyItem = diffItems.find((d) => d.difficulty === 'easy') || { count: 0, solved: 0 };
  const medItem = diffItems.find((d) => d.difficulty === 'medium') || { count: 0, solved: 0 };
  const hardItem = diffItems.find((d) => d.difficulty === 'hard') || { count: 0, solved: 0 };

  const easySolved = easyItem.solved ?? (totalProblems > 0 ? Math.round(solvedProblems * 0.5) : 0);
  const medSolved = medItem.solved ?? (totalProblems > 0 ? Math.round(solvedProblems * 0.35) : 0);
  const hardSolved = hardItem.solved ?? Math.max(0, solvedProblems - easySolved - medSolved);

  const easyTotal = easyItem.count || 0;
  const medTotal = medItem.count || 0;
  const hardTotal = hardItem.count || 0;

  const easyPct = easyTotal > 0 ? Math.min(100, Math.round((easySolved / easyTotal) * 100)) : 0;
  const medPct = medTotal > 0 ? Math.min(100, Math.round((medSolved / medTotal) * 100)) : 0;
  const hardPct = hardTotal > 0 ? Math.min(100, Math.round((hardSolved / hardTotal) * 100)) : 0;

  const streakPct = longestStreak > 0 ? Math.min(100, Math.round((currentStreak / longestStreak) * 100)) : 0;
  const solvedSessions = Math.round((totalAttempts * solveRate) / 100);

  // Donut geometry (108px diameter)
  const size = 108;
  const strokeWidth = 9;
  const center = size / 2;
  const radius = center - strokeWidth - 1;
  const circumference = 2 * Math.PI * radius;

  const easyArc = totalProblems > 0 ? (easySolved / totalProblems) * circumference : 0;
  const medArc = totalProblems > 0 ? (medSolved / totalProblems) * circumference : 0;
  const hardArc = totalProblems > 0 ? (hardSolved / totalProblems) * circumference : 0;

  const easyOffset = 0;
  const medOffset = -easyArc;
  const hardOffset = -(easyArc + medArc);

  return (
    <div className={`panel p-4 sm:p-5 flex flex-col justify-between h-full transition-all shadow-sm ${className}`}>
      
      {/* ── ZONE 1: Solved Problems Donut + Difficulty Stack ──────────── */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-line/50">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent shrink-0" />
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Platform Solved
            </h2>
          </div>
          {summary?.catalogProblems && summary.catalogProblems < totalProblems ? (
            <span
              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent flex items-center gap-1 cursor-default"
              title={`Platform verified ${solvedProblems} solved problems across connected platforms. ${summary.catalogProblems} tracked in catalog.`}
            >
              <span>{solvedProblems} Platform</span>
              <span className="text-muted font-normal">({summary.catalogProblems} in catalog)</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 border border-line text-accent">
              {overallPct}% cataloged
            </span>
          )}
        </div>

        {/* Donut + Difficulty Bars */}
        <div className="flex items-center gap-4 sm:gap-5 py-2.5">
          
          {/* Multi-Segment Donut Ring */}
          <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="-rotate-90 transform"
            >
              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-surface-2"
              />

              {/* Hard Arc */}
              {hardArc > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={hard}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${hardArc} ${circumference - hardArc}`}
                  strokeDashoffset={hardOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Medium Arc */}
              {medArc > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={medium}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${medArc} ${circumference - medArc}`}
                  strokeDashoffset={medOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* Easy Arc */}
              {easyArc > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={easy}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${easyArc} ${circumference - easyArc}`}
                  strokeDashoffset={easyOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-2xl font-black text-text tracking-tight tabular-nums leading-none">
                <AnimatedNumber value={solvedProblems} />
              </span>
              <div className="text-[9px] font-bold text-accent uppercase tracking-wider mt-0.5">
                Platform
              </div>
              <div className="text-[8px] font-semibold text-text-secondary uppercase tracking-widest">
                Solved
              </div>
            </div>
          </div>

          {/* Stacked Difficulty Bars */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Easy */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-easy text-[11px]">
                  Easy
                </span>
                <div className="flex items-center gap-1 text-[11px] tabular-nums">
                  <span className="font-bold text-text">{easySolved}</span>
                  <span className="text-muted">/{easyTotal}</span>
                  <span className="text-[10px] text-muted ml-0.5 font-mono">({easyPct}%)</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-easy/80 to-easy shadow-[0_0_6px_rgba(0,184,163,0.3)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(easyPct, easySolved > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-medium text-[11px]">
                  Med.
                </span>
                <div className="flex items-center gap-1 text-[11px] tabular-nums">
                  <span className="font-bold text-text">{medSolved}</span>
                  <span className="text-muted">/{medTotal}</span>
                  <span className="text-[10px] text-muted ml-0.5 font-mono">({medPct}%)</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500/80 to-medium shadow-[0_0_6px_rgba(255,192,30,0.3)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(medPct, medSolved > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-hard text-[11px]">
                  Hard
                </span>
                <div className="flex items-center gap-1 text-[11px] tabular-nums">
                  <span className="font-bold text-text">{hardSolved}</span>
                  <span className="text-muted">/{hardTotal}</span>
                  <span className="text-[10px] text-muted ml-0.5 font-mono">({hardPct}%)</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600/80 to-hard shadow-[0_0_6px_rgba(255,55,95,0.3)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(hardPct, hardSolved > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Metric Clarity Rail: Tracked Catalog vs Revision Due */}
        <div className="grid grid-cols-2 gap-2 pt-2.5 mt-2 border-t border-line/50">
          <Link
            to="/problems"
            className="p-2 rounded-lg bg-surface-2/40 hover:bg-surface-2/70 border border-line/60 hover:border-line transition-colors group"
            title="Local practice repository stored in this tracker"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted font-semibold flex items-center justify-between">
              <span>Tracked Catalog</span>
              <Code2 className="w-3 h-3 text-text-secondary group-hover:text-text transition-colors" />
            </div>
            <div className="text-xs font-bold text-text mt-0.5 tabular-nums">
              {summary?.catalogProblems ?? totalProblems}
              <span className="text-[10px] font-normal text-muted ml-1">
                ({summary?.catalogSolved ?? 0} solved)
              </span>
            </div>
          </Link>

          <Link
            to="/revision"
            className="p-2 rounded-lg bg-surface-2/40 hover:bg-surface-2/70 border border-line/60 hover:border-accent/40 transition-colors group"
            title="Problems currently eligible for active spaced recall review"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted font-semibold flex items-center justify-between">
              <span>Revision Due</span>
              <Repeat className="w-3 h-3 text-accent group-hover:rotate-180 transition-transform duration-300" />
            </div>
            <div className="text-xs font-bold text-accent mt-0.5 tabular-nums flex items-center justify-between">
              <span>
                {revisionCount}
                <span className="text-[10px] font-normal text-muted ml-1">due</span>
              </span>
              <span className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-transform text-xs">→</span>
            </div>
          </Link>
        </div>

        {/* Platform Sources Micro Strip */}
        {activePlatforms.length > 0 && (
          <div className="flex items-center justify-between gap-1.5 pt-2 mt-1 border-t border-line/40 text-[10px]">
            <span className="text-muted font-medium flex items-center gap-1 shrink-0">
              <Globe className="w-3 h-3 text-accent" />
              <span>Synced Hubs:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {activePlatforms.map((p) => (
                <span
                  key={p.key}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${p.style}`}
                  title={`${p.label}: ${p.count} problem${p.count === 1 ? '' : 's'}`}
                >
                  <span>{p.short}</span>
                  <span className="font-mono tabular-nums font-bold">{p.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── ZONE 2: 7-Day Consistency Rhythm & Today's Target Status ───── */}
      <div className="py-2.5 px-3 rounded-lg bg-surface-2/25 border border-line/40 my-2">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="font-semibold text-text-secondary">7-Day Activity Rhythm</span>
            <span className="text-[10px] text-muted font-mono font-medium hidden sm:inline">
              ({weekTotal} {weekTotal === 1 ? 'attempt' : 'attempts'})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-muted">Today:</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[10px] border ${
                todayCount > 0
                  ? 'text-success bg-success/10 border-success/25'
                  : 'text-muted bg-surface-3 border-line/50'
              }`}
            >
              {todayCount > 0 ? `${todayCount} logged` : '0 logged'}
            </span>
          </div>
        </div>

        {/* 7 Micro Column Bars */}
        <div className="grid grid-cols-7 gap-1.5 items-end h-8">
          {weekDays.map((d) => {
            const maxInWeek = Math.max(...weekDays.map((x) => x.count), 3);
            const heightPct =
              d.count > 0 ? Math.max(35, Math.round((d.count / maxInWeek) * 100)) : 14;

            return (
              <div
                key={d.date}
                className="flex flex-col items-center gap-1 group/bar relative"
                title={`${d.date}: ${d.count} ${d.count === 1 ? 'attempt' : 'attempts'}`}
              >
                {/* Micro vertical bar rail */}
                <div className="w-full h-5 rounded bg-surface-2/70 flex items-end overflow-hidden p-0.5 border border-line/30">
                  <div
                    className={`w-full rounded-xs transition-all duration-500 ease-out ${
                      d.isToday
                        ? d.count > 0
                          ? 'bg-success shadow-[0_0_6px_rgba(46,204,113,0.4)]'
                          : 'bg-accent/40'
                        : d.count > 0
                        ? 'bg-accent shadow-[0_0_4px_rgba(99,102,241,0.3)]'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                {/* Day label */}
                <span
                  className={`text-[9px] font-mono leading-none ${
                    d.isToday ? 'font-bold text-accent' : 'text-muted'
                  }`}
                >
                  {d.shortDay}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ZONE 3: Activity Momentum Tiles (Streak & Volume) ────────── */}
      <div className="pt-2 border-t border-line/50 mt-auto">
        <div className="grid grid-cols-2 gap-3">
          
          {/* Active Streak Tile */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-surface-2/30 hover:bg-surface-2/60 border border-line/40 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-semibold text-text-secondary">
                Streak
              </span>
              <div className="p-1 rounded bg-accent/15 border border-accent/25 text-accent shrink-0">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-1">
              <div className="text-xl font-black text-text tabular-nums leading-tight">
                <AnimatedNumber value={currentStreak} />
                <span className="text-xs font-normal text-muted ml-1">days</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted">
                <span>Best: {longestStreak}d</span>
                <span className="font-mono text-accent font-semibold">{streakPct}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(streakPct, currentStreak > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Practice Volume Tile */}
          <div className="p-3 rounded-lg bg-surface-2/30 hover:bg-surface-2/60 border border-line/40 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-semibold text-text-secondary">
                Activity
              </span>
              <div className="p-1 rounded bg-easy/15 border border-easy/25 text-easy shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-1">
              <div className="text-xl font-black text-text tabular-nums leading-tight">
                <AnimatedNumber value={totalAttempts} />
                <span className="text-xs font-normal text-muted ml-1">att.</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted">{solvedSessions} solved</span>
                <span className="font-mono font-semibold text-easy">{solveRate}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                <div
                  className="h-full rounded-full bg-easy transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(solveRate, totalAttempts > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LeetCodeStatsConsole;
