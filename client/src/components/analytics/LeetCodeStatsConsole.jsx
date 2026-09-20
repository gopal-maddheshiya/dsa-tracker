import React from 'react';
import { Flame, Zap } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';
import { easy, medium, hard } from '../../theme/colors';

/**
 * Unified LeetCode Stats Console.
 * Proportioned for visual impact across Mobile (< 640px) and Laptop/Desktop (>= 1024px).
 *
 * - Prominent, glowing multi-segment Donut ring with bold center telemetry.
 * - Difficulty bars that naturally balance horizontal space without awkward voids.
 * - Symmetrical, substantial Activity Momentum tiles (Streak & Volume).
 * - Generous vertical breathing room to eliminate "chapta" (squashed) appearance.
 */
const LeetCodeStatsConsole = ({
  summary,
  isLoading = false,
  solveRate = 0,
}) => {
  if (isLoading) {
    return (
      <div className="panel p-5 sm:p-6 lg:p-7 border-line animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            <div className="w-32 h-32 rounded-full bg-surface-2 shrink-0" />
            <div className="w-full flex-1 space-y-3">
              <div className="h-5 bg-surface-2 rounded-md" />
              <div className="h-5 bg-surface-2 rounded-md" />
              <div className="h-5 bg-surface-2 rounded-md" />
            </div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="h-28 bg-surface-2 rounded-xl" />
            <div className="h-28 bg-surface-2 rounded-xl" />
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

  // Prominent circular ring geometry (124px diameter)
  const size = 124;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 2;
  const circumference = 2 * Math.PI * radius;

  // Arc proportions based on total cataloged
  const easyArc = totalProblems > 0 ? (easySolved / totalProblems) * circumference : 0;
  const medArc = totalProblems > 0 ? (medSolved / totalProblems) * circumference : 0;
  const hardArc = totalProblems > 0 ? (hardSolved / totalProblems) * circumference : 0;

  const easyOffset = 0;
  const medOffset = -easyArc;
  const hardOffset = -(easyArc + medArc);

  return (
    <div className="panel p-5 sm:p-6 lg:p-7 transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        {/* ── Left Half: Prominent Donut Ring + Difficulty Breakdown ── */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
          
          {/* Circular Multi-Segment Donut Ring (124px with glowing arcs) */}
          <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="-rotate-90 transform"
            >
              <defs>
                <filter id="easy-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={easy} floodOpacity="0.5" />
                </filter>
                <filter id="med-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={medium} floodOpacity="0.45" />
                </filter>
                <filter id="hard-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={hard} floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-surface-2/80"
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
                  filter="url(#hard-glow)"
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
                  filter="url(#med-glow)"
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
                  filter="url(#easy-glow)"
                  className="transition-all duration-700 ease-out"
                />
              )}
            </svg>

            {/* Inner Ring Heroic Metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-3xl sm:text-4xl font-black text-text tracking-tight tabular-nums leading-none">
                <AnimatedNumber value={solvedProblems} />
              </span>
              <div className="text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-wider mt-1">
                Solved
              </div>
              <div className="text-[10px] font-mono text-muted tabular-nums mt-0.5">
                {solvedProblems}/{totalProblems} ({overallPct}%)
              </div>
            </div>
          </div>

          {/* 3 LeetCode Difficulty Rows (Fills available space gracefully) */}
          <div className="w-full flex-1 min-w-0 space-y-3">
            
            {/* Easy Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-easy flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-easy shadow-[0_0_6px_rgba(0,184,163,0.6)]" />
                  Easy
                </span>
                <div className="flex items-center gap-2 text-xs tabular-nums">
                  <span className="font-bold text-text">{easySolved}</span>
                  <span className="text-muted">/{easyTotal}</span>
                  <span className="text-[11px] font-mono font-semibold text-easy ml-1">
                    {easyPct}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-line/50 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-easy/80 to-easy shadow-[0_0_8px_rgba(0,184,163,0.35)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(easyPct, easySolved > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>

            {/* Medium Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-medium flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-medium shadow-[0_0_6px_rgba(255,192,30,0.6)]" />
                  Medium
                </span>
                <div className="flex items-center gap-2 text-xs tabular-nums">
                  <span className="font-bold text-text">{medSolved}</span>
                  <span className="text-muted">/{medTotal}</span>
                  <span className="text-[11px] font-mono font-semibold text-medium ml-1">
                    {medPct}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-line/50 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500/80 to-medium shadow-[0_0_8px_rgba(255,192,30,0.3)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(medPct, medSolved > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>

            {/* Hard Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-hard flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-hard shadow-[0_0_6px_rgba(255,55,95,0.6)]" />
                  Hard
                </span>
                <div className="flex items-center gap-2 text-xs tabular-nums">
                  <span className="font-bold text-text">{hardSolved}</span>
                  <span className="text-muted">/{hardTotal}</span>
                  <span className="text-[11px] font-mono font-semibold text-hard ml-1">
                    {hardPct}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-2 overflow-hidden border border-line/50 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600/80 to-hard shadow-[0_0_8px_rgba(255,55,95,0.3)] transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(hardPct, hardSolved > 0 ? 5 : 0)}%` }}
                />
              </div>
            </div>

          </div>

        </div>

        {/* ── Right Half: Substantial Activity Momentum Bay ──────────── */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-line/60 pt-5 lg:pt-0 lg:pl-8">
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 h-full items-stretch">
            
            {/* Active Streak Tile */}
            <div className="flex flex-col justify-between p-4 sm:p-4.5 rounded-xl bg-surface-2/40 hover:bg-surface-2/70 border border-line/60 transition-all shadow-xs group">
              <div className="flex items-center justify-between gap-1.5 mb-3">
                <span className="text-xs font-semibold text-text-secondary tracking-tight">
                  Active Streak
                </span>
                <div className="p-2 rounded-lg bg-accent/15 border border-accent/25 text-accent shadow-[0_0_10px_rgba(255,161,22,0.2)] shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-2xl sm:text-3xl font-black text-text tabular-nums tracking-tight">
                  <AnimatedNumber value={currentStreak} />
                  <span className="text-xs font-normal text-muted ml-1.5">days</span>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md tabular-nums">
                  Best: {longestStreak}d streak
                </div>
              </div>
            </div>

            {/* Practice Volume Tile */}
            <div className="flex flex-col justify-between p-4 sm:p-4.5 rounded-xl bg-surface-2/40 hover:bg-surface-2/70 border border-line/60 transition-all shadow-xs group">
              <div className="flex items-center justify-between gap-1.5 mb-3">
                <span className="text-xs font-semibold text-text-secondary tracking-tight">
                  Practice Volume
                </span>
                <div className="p-2 rounded-lg bg-easy/15 border border-easy/25 text-easy shadow-[0_0_10px_rgba(0,184,163,0.2)] shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-2xl sm:text-3xl font-black text-text tabular-nums tracking-tight">
                  <AnimatedNumber value={totalAttempts} />
                  <span className="text-xs font-normal text-muted ml-1.5">sessions</span>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-easy bg-easy/10 border border-easy/20 px-2 py-0.5 rounded-md tabular-nums">
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
