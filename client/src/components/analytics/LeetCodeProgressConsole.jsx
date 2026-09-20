import React from 'react';
import { Flame, Zap, CheckCircle2 } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';
import { easy, medium, hard } from '../../theme/colors';

/**
 * Authentic LeetCode-style Progress & Telemetry Console.
 * Features:
 * 1. Signature circular multi-segment donut ring showing Solved / Total.
 * 2. 3 Easy, Medium, Hard breakdown bars with exact LeetCode colors & progress.
 * 3. Integrated Telemetry strip (Streak, Submissions, Solve Rate) in a single ultra-sleek console.
 */
const LeetCodeProgressConsole = ({
  summary,
  isLoading = false,
  solvedPct = 0,
  solveRate = 0,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-surface border border-line p-4 sm:p-5 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-28 h-28 rounded-full bg-surface-2" />
          </div>
          <div className="md:col-span-5 space-y-3">
            <div className="h-10 bg-surface-2 rounded-lg" />
            <div className="h-10 bg-surface-2 rounded-lg" />
            <div className="h-10 bg-surface-2 rounded-lg" />
          </div>
          <div className="md:col-span-4 space-y-3">
            <div className="h-10 bg-surface-2 rounded-lg" />
            <div className="h-10 bg-surface-2 rounded-lg" />
            <div className="h-10 bg-surface-2 rounded-lg" />
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
  const solvedAttempts = summary?.solvedAttempts || 0;

  // Extract counts per difficulty
  const diffItems = summary?.difficultyBreakdown || [];
  const easyItem = diffItems.find((d) => d.difficulty === 'easy') || { count: 0, solved: 0 };
  const medItem = diffItems.find((d) => d.difficulty === 'medium') || { count: 0, solved: 0 };
  const hardItem = diffItems.find((d) => d.difficulty === 'hard') || { count: 0, solved: 0 };

  // Fallbacks if backend doesn't provide per-difficulty solved yet
  const easySolved = easyItem.solved ?? (totalProblems > 0 ? Math.round(solvedProblems * 0.5) : 0);
  const medSolved = medItem.solved ?? (totalProblems > 0 ? Math.round(solvedProblems * 0.35) : 0);
  const hardSolved = hardItem.solved ?? Math.max(0, solvedProblems - easySolved - medSolved);

  const easyTotal = easyItem.count || 0;
  const medTotal = medItem.count || 0;
  const hardTotal = hardItem.count || 0;

  const easyPct = easyTotal > 0 ? Math.min(100, Math.round((easySolved / easyTotal) * 100)) : 0;
  const medPct = medTotal > 0 ? Math.min(100, Math.round((medSolved / medTotal) * 100)) : 0;
  const hardPct = hardTotal > 0 ? Math.min(100, Math.round((hardSolved / hardTotal) * 100)) : 0;

  // Circular gauge SVG parameters
  const size = 118;
  const strokeWidth = 9;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Segments calculation for donut ring based on solved problems
  const easyRatio = totalProblems > 0 ? easySolved / totalProblems : 0;
  const medRatio = totalProblems > 0 ? medSolved / totalProblems : 0;
  const hardRatio = totalProblems > 0 ? hardSolved / totalProblems : 0;

  const easyArc = circumference * easyRatio;
  const medArc = circumference * medRatio;
  const hardArc = circumference * hardRatio;

  // Offsets for sequential arcs
  const easyOffset = 0;
  const medOffset = -easyArc;
  const hardOffset = -(easyArc + medArc);

  return (
    <div className="rounded-2xl bg-surface border border-line p-3.5 sm:p-5 shadow-sm transition-all duration-300 hover:border-line/90">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center">
        
        {/* 1. Solved Problems Circular Gauge (Authentic LeetCode Ring) */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-row md:flex-col items-center justify-center gap-3.5 sm:gap-4 md:py-1">
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
              <span className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight tabular-nums leading-none">
                <AnimatedNumber value={solvedProblems} />
              </span>
              <div className="text-[11px] text-muted font-medium mt-1 leading-tight">
                /{totalProblems}
              </div>
              <div className="text-[9px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">
                Solved
              </div>
            </div>
          </div>

          {/* Quick Solve Percentage pill on mobile */}
          <div className="flex flex-col items-start md:items-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-line text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-semibold text-text tabular-nums">{solvedPct}%</span>
              <span className="text-muted">completion</span>
            </div>
            <span className="text-[10px] text-muted mt-1 hidden md:block">
              {totalProblems - solvedProblems} remaining
            </span>
          </div>
        </div>

        {/* 2. LeetCode Difficulty Bars (Easy, Medium, Hard) */}
        <div className="md:col-span-8 lg:col-span-5 space-y-2">
          {/* Easy Bar */}
          <div className="bg-surface-2/45 hover:bg-surface-2/70 transition-colors border border-line/50 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-easy">
                <span className="w-1.5 h-1.5 rounded-full bg-easy" />
                <span>Easy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text tabular-nums text-xs">
                  {easySolved}
                  <span className="text-muted font-normal">/{easyTotal}</span>
                </span>
                <span className="text-[10px] font-medium text-muted bg-surface/80 px-1.5 py-0.5 rounded border border-line/40 tabular-nums">
                  {easyPct}%
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-easy transition-all duration-700 ease-out"
                style={{ width: `${easyPct}%` }}
              />
            </div>
          </div>

          {/* Medium Bar */}
          <div className="bg-surface-2/45 hover:bg-surface-2/70 transition-colors border border-line/50 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-medium" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text tabular-nums text-xs">
                  {medSolved}
                  <span className="text-muted font-normal">/{medTotal}</span>
                </span>
                <span className="text-[10px] font-medium text-muted bg-surface/80 px-1.5 py-0.5 rounded border border-line/40 tabular-nums">
                  {medPct}%
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-medium transition-all duration-700 ease-out"
                style={{ width: `${medPct}%` }}
              />
            </div>
          </div>

          {/* Hard Bar */}
          <div className="bg-surface-2/45 hover:bg-surface-2/70 transition-colors border border-line/50 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-hard">
                <span className="w-1.5 h-1.5 rounded-full bg-hard" />
                <span>Hard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text tabular-nums text-xs">
                  {hardSolved}
                  <span className="text-muted font-normal">/{hardTotal}</span>
                </span>
                <span className="text-[10px] font-medium text-muted bg-surface/80 px-1.5 py-0.5 rounded border border-line/40 tabular-nums">
                  {hardPct}%
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-hard transition-all duration-700 ease-out"
                style={{ width: `${hardPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. LeetCode Telemetry Strip (Streak, Sessions, Accuracy) */}
        <div className="md:col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-line/60 pt-3 lg:pt-0 lg:pl-5">
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-2.5">
            
            {/* Streak Pill */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between p-2 lg:p-2.5 rounded-xl bg-surface-2/30 hover:bg-surface-2/60 border border-line/40 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
                  <Flame className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-medium text-muted">Current Streak</div>
                  <div className="text-xs sm:text-sm font-bold text-text tabular-nums">
                    {currentStreak} <span className="text-xs font-medium text-muted">days</span>
                  </div>
                </div>
              </div>
              <div className="mt-1.5 lg:mt-0 self-start lg:self-auto">
                <span className="text-[10px] font-medium text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded tabular-nums whitespace-nowrap">
                  Best: {longestStreak}d
                </span>
              </div>
            </div>

            {/* Sessions Pill */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between p-2 lg:p-2.5 rounded-xl bg-surface-2/30 hover:bg-surface-2/60 border border-line/40 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-medium/15 border border-medium/25 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-medium" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-medium text-muted">Total Practice</div>
                  <div className="text-xs sm:text-sm font-bold text-text tabular-nums">
                    {totalAttempts} <span className="text-xs font-medium text-muted">sessions</span>
                  </div>
                </div>
              </div>
              <div className="mt-1.5 lg:mt-0 self-start lg:self-auto">
                <span className="text-[10px] font-medium text-medium bg-medium/10 border border-medium/20 px-1.5 py-0.5 rounded tabular-nums whitespace-nowrap">
                  {solveRate}% acc
                </span>
              </div>
            </div>

            {/* Solved Attempts Pill */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between p-2 lg:p-2.5 rounded-xl bg-surface-2/30 hover:bg-surface-2/60 border border-line/40 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-success/15 border border-success/25 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-medium text-muted">Accepted Solves</div>
                  <div className="text-xs sm:text-sm font-bold text-text tabular-nums">
                    {solvedAttempts} <span className="text-xs font-medium text-muted">attempts</span>
                  </div>
                </div>
              </div>
              <div className="mt-1.5 lg:mt-0 self-start lg:self-auto">
                <span className="text-[10px] font-medium text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded tabular-nums whitespace-nowrap">
                  {solvedPct}% solve
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LeetCodeProgressConsole;
