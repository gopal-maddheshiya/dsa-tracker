import React from 'react';
import { Flame, Zap } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';
import { easy, medium, hard } from '../../theme/colors';

/**
 * Unified LeetCode Stats Console.
 * Perfectly proportioned for both Mobile (< 640px) and Laptop/Desktop (>= 1024px).
 *
 * - Solved Problems: Compact Donut + Easy/Medium/Hard bars with constrained, snug width.
 * - Activity Momentum: Integrated Streak & Practice telemetry tiles.
 * - Zero dead space, authentic LeetCode engineering aesthetic.
 */
const LeetCodeStatsConsole = ({
  summary,
  isLoading = false,
  solveRate = 0,
}) => {
  if (isLoading) {
    return (
      <div className="panel p-4 sm:p-5 border-line animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-7 flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-surface-2 shrink-0" />
            <div className="flex-1 space-y-2.5 max-w-sm">
              <div className="h-4 bg-surface-2 rounded" />
              <div className="h-4 bg-surface-2 rounded" />
              <div className="h-4 bg-surface-2 rounded" />
            </div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="h-20 bg-surface-2 rounded-xl" />
            <div className="h-20 bg-surface-2 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const totalProblems = summary?.totalProblems || 0;
  const solvedProblems = summary?.solvedProblems || 0;
  const currentStreak = summary?.currentStreak || 0;
  const longestStreak = summary?.longestStreak || currentStreak;
  const totalAttempts = summary?.totalAttempts || 0;

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

  // Circular ring geometry
  const size = 96;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Donut arc proportions based on total cataloged
  const easyArc = totalProblems > 0 ? (easySolved / totalProblems) * circumference : 0;
  const medArc = totalProblems > 0 ? (medSolved / totalProblems) * circumference : 0;
  const hardArc = totalProblems > 0 ? (hardSolved / totalProblems) * circumference : 0;

  const easyOffset = 0;
  const medOffset = -easyArc;
  const hardOffset = -(easyArc + medArc);

  return (
    <div className="panel p-4 sm:p-5 transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
        
        {/* ── Left Half: LeetCode Solved Ring + Difficulty Breakdown ── */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
          
          {/* Circular Multi-Segment Donut Ring */}
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

              {/* Hard Segment */}
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

              {/* Medium Segment */}
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

              {/* Easy Segment */}
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
              <span className="text-xl sm:text-2xl font-black text-text tracking-tight tabular-nums leading-none">
                <AnimatedNumber value={solvedProblems} />
              </span>
              <div className="text-[10px] text-muted font-medium leading-tight mt-0.5">
                /{totalProblems}
              </div>
              <div className="text-[8px] font-bold text-accent uppercase tracking-widest mt-0.5">
                Solved
              </div>
            </div>
          </div>

          {/* 3 LeetCode Difficulty Rows (constrained so they never overstretch on laptop) */}
          <div className="w-full sm:flex-1 min-w-0 max-w-sm space-y-2">
            
            {/* Easy Row */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-easy flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-easy" />
                  Easy
                </span>
                <div className="flex items-center gap-1.5 text-xs tabular-nums">
                  <span className="font-bold text-text">{easySolved}</span>
                  <span className="text-muted">/{easyTotal}</span>
                  <span className="text-[11px] text-muted ml-0.5">({easyPct}%)</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                <div
                  className="h-full rounded-full bg-easy transition-all duration-700 ease-out"
                  style={{ width: `${easyPct}%` }}
                />
              </div>
            </div>

            {/* Medium Row */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-medium flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-medium" />
                  Medium
                </span>
                <div className="flex items-center gap-1.5 text-xs tabular-nums">
                  <span className="font-bold text-text">{medSolved}</span>
                  <span className="text-muted">/{medTotal}</span>
                  <span className="text-[11px] text-muted ml-0.5">({medPct}%)</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                <div
                  className="h-full rounded-full bg-medium transition-all duration-700 ease-out"
                  style={{ width: `${medPct}%` }}
                />
              </div>
            </div>

            {/* Hard Row */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-hard flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-hard" />
                  Hard
                </span>
                <div className="flex items-center gap-1.5 text-xs tabular-nums">
                  <span className="font-bold text-text">{hardSolved}</span>
                  <span className="text-muted">/{hardTotal}</span>
                  <span className="text-[11px] text-muted ml-0.5">({hardPct}%)</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line/40">
                <div
                  className="h-full rounded-full bg-hard transition-all duration-700 ease-out"
                  style={{ width: `${hardPct}%` }}
                />
              </div>
            </div>

          </div>

        </div>

        {/* ── Right Half: Snug Activity Momentum (Streak & Practice) ── */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-line/60 pt-4 lg:pt-0 lg:pl-6">
          <div className="grid grid-cols-2 gap-3 h-full items-stretch">
            
            {/* Streak Tile */}
            <div className="flex flex-col justify-between p-3 rounded-xl bg-surface-2/40 hover:bg-surface-2/70 border border-line/50 transition-colors">
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-xs font-semibold text-text-secondary tracking-tight">
                  Active Streak
                </span>
                <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
                  <Flame className="w-3.5 h-3.5 text-accent" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-text tabular-nums tracking-tight">
                  <AnimatedNumber value={currentStreak} />
                  <span className="text-xs font-normal text-muted ml-1">days</span>
                </div>
                <div className="text-[11px] font-medium text-accent">
                  Best: {longestStreak}d streak
                </div>
              </div>
            </div>

            {/* Practice Output Tile */}
            <div className="flex flex-col justify-between p-3 rounded-xl bg-surface-2/40 hover:bg-surface-2/70 border border-line/50 transition-colors">
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-xs font-semibold text-text-secondary tracking-tight">
                  Practice Volume
                </span>
                <div className="w-6 h-6 rounded-lg bg-easy/15 border border-easy/25 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-easy" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-text tabular-nums tracking-tight">
                  <AnimatedNumber value={totalAttempts} />
                  <span className="text-xs font-normal text-muted ml-1">sessions</span>
                </div>
                <div className="text-[11px] font-medium text-easy">
                  {solveRate}% solve rate
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LeetCodeStatsConsole;
