import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Zap, RotateCcw, ArrowRight } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';
import { easy, medium, hard } from '../../theme/colors';

/**
 * LeetCode Pro Split Console (Dense & Ergonomic).
 *
 * Left: Authentic LeetCode Solved Card (Donut + Easy/Med/Hard bars).
 * Right: 3 High-Density Telemetry Cards with micro-meters & zero wasted space.
 */
const LeetCodeStatsConsole = ({
  summary,
  isLoading = false,
  solveRate = 0,
  revisionCount = 0,
  isLoadingRevision = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch animate-pulse">
        <div className="lg:col-span-5 panel p-4 border-line space-y-3">
          <div className="h-4 w-28 shimmer rounded" />
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-surface-2 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-surface-2 rounded" />
              <div className="h-3.5 bg-surface-2 rounded" />
              <div className="h-3.5 bg-surface-2 rounded" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="panel p-4 h-32 shimmer rounded-xl" />
          <div className="panel p-4 h-32 shimmer rounded-xl" />
          <div className="col-span-2 sm:col-span-1 panel p-4 h-24 sm:h-32 shimmer rounded-xl" />
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

  // Streak calculation for progress rail
  const streakPct = longestStreak > 0 ? Math.min(100, Math.round((currentStreak / longestStreak) * 100)) : 0;

  // Solved vs struggled sessions
  const solvedSessions = Math.round((totalAttempts * solveRate) / 100);
  const struggledSessions = Math.max(0, totalAttempts - solvedSessions);

  // Compact donut geometry (100px diameter)
  const size = 100;
  const strokeWidth = 8;
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
      
      {/* ── Left Pillar: Authentic LeetCode Solved Card (col-span-5) ── */}
      <div className="lg:col-span-5 panel p-3.5 sm:p-4 flex flex-col justify-between shadow-sm hover:border-line transition-colors">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-line/50">
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Problems Solved
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 border border-line text-accent">
            {overallPct}% cataloged
          </span>
        </div>

        {/* Donut + Stacked Bars */}
        <div className="flex items-center gap-3 sm:gap-4 pt-2.5">
          
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
              <div className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">
                Solved
              </div>
              <div className="text-[10px] font-mono text-muted tabular-nums mt-0.5">
                /{totalProblems}
              </div>
            </div>
          </div>

          {/* Compact 3-Row Difficulty Bars */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Easy */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-easy flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-easy shadow-[0_0_4px_rgba(0,184,163,0.5)]" />
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
                <span className="font-semibold text-medium flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-medium shadow-[0_0_4px_rgba(255,192,30,0.5)]" />
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
                <span className="font-semibold text-hard flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-hard shadow-[0_0_4px_rgba(255,55,95,0.5)]" />
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
      </div>

      {/* ── Right Pillar: 3 Dense Telemetry Cards (col-span-7) ───────── */}
      <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch">
        
        {/* 1. Active Streak Card (Dense, with streak progress rail) */}
        <div className="panel p-3.5 sm:p-4 flex flex-col justify-between hover:border-line transition-all shadow-sm group">
          {/* Top Line: Label + Icon */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-semibold text-text-secondary tracking-tight">
              Active Streak
            </span>
            <div className="p-1.5 rounded-lg bg-accent/15 border border-accent/25 text-accent shrink-0">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Core Metric: Big Number */}
          <div className="my-1.5">
            <div className="text-2xl font-black text-text tabular-nums tracking-tight leading-tight">
              <AnimatedNumber value={currentStreak} />
              <span className="text-xs font-normal text-muted ml-1">days</span>
            </div>
          </div>

          {/* Micro Telemetry Rail: Progress towards best record */}
          <div className="space-y-1 pt-1 border-t border-line/40">
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

        {/* 2. Practice Volume Card (Dense, with solve vs struggle breakdown) */}
        <div className="panel p-3.5 sm:p-4 flex flex-col justify-between hover:border-line transition-all shadow-sm group">
          {/* Top Line: Label + Icon */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-semibold text-text-secondary tracking-tight">
              Practice Volume
            </span>
            <div className="p-1.5 rounded-lg bg-easy/15 border border-easy/25 text-easy shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Core Metric: Big Number */}
          <div className="my-1.5">
            <div className="text-2xl font-black text-text tabular-nums tracking-tight leading-tight">
              <AnimatedNumber value={totalAttempts} />
              <span className="text-xs font-normal text-muted ml-1">sessions</span>
            </div>
          </div>

          {/* Micro Telemetry Rail: Solve Rate Bar */}
          <div className="space-y-1 pt-1 border-t border-line/40">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted">{solvedSessions} solved</span>
              <span className="font-mono font-semibold text-easy">{solveRate}% acc</span>
            </div>
            <div className="w-full h-1 rounded-full bg-surface-2 overflow-hidden border border-line/40">
              <div
                className="h-full rounded-full bg-easy transition-all duration-700 ease-out"
                style={{ width: `${Math.max(solveRate, totalAttempts > 0 ? 5 : 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Revision Queue Card (col-span-2 on mobile, col-span-1 on sm+) */}
        <Link
          to="/revision"
          className="col-span-2 sm:col-span-1 panel p-3.5 sm:p-4 flex flex-col justify-between hover:border-accent/40 transition-all shadow-sm group cursor-pointer"
        >
          {/* Top Line: Label + Icon */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-semibold text-text-secondary tracking-tight">
              Revision Queue
            </span>
            <div className="p-1.5 rounded-lg bg-accent/15 border border-accent/25 text-accent shrink-0">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Core Metric: Big Number */}
          <div className="my-1.5">
            {isLoadingRevision ? (
              <div className="h-7 w-16 shimmer rounded my-0.5" />
            ) : (
              <div className="text-2xl font-black text-accent tabular-nums tracking-tight leading-tight">
                <AnimatedNumber value={revisionCount} />
                <span className="text-xs font-normal text-muted ml-1">due</span>
              </div>
            )}
          </div>

          {/* Micro Action Strip */}
          <div className="pt-1 border-t border-line/40 flex items-center justify-between text-[10px]">
            <span className="text-text-secondary group-hover:text-accent font-semibold transition-colors">
              Review Backlog
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-accent group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

      </div>

    </div>
  );
};

export default LeetCodeStatsConsole;
