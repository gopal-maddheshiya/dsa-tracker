import React from 'react';
import AnimatedNumber from '../ui/AnimatedNumber';
import { easy, medium, hard } from '../../theme/colors';

/**
 * Pure LeetCode-style Solved Problems Card.
 * Displays:
 * 1. Multi-segment circular ring (Easy, Medium, Hard) on the left.
 * 2. Easy, Medium, Hard progress rows with colored pills and mini progress bars on the right.
 * Designed to sit side-by-side cleanly on mobile (>= 320px) without any vertical cramming or extra clutter.
 */
const LeetCodeSolvedCard = ({
  summary,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`rounded-xl bg-surface border border-line p-3.5 sm:p-4 animate-pulse ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-surface-2 shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-6 bg-surface-2 rounded-lg" />
            <div className="h-6 bg-surface-2 rounded-lg" />
            <div className="h-6 bg-surface-2 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const totalProblems = summary?.totalProblems || 0;
  const solvedProblems = summary?.solvedProblems || 0;

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

  // Compact circular ring SVG geometry
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
    <div className={`rounded-xl bg-surface border border-line p-3 sm:p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3.5 sm:gap-5">
        
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
            <span className="text-xl sm:text-2xl font-extrabold text-text tracking-tight tabular-nums leading-none">
              <AnimatedNumber value={solvedProblems} />
            </span>
            <div className="text-[10px] sm:text-[11px] text-muted font-medium leading-tight mt-0.5">
              /{totalProblems}
            </div>
            <div className="text-[8px] sm:text-[9px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">
              Solved
            </div>
          </div>
        </div>

        {/* 3 LeetCode Difficulty Rows */}
        <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
          
          {/* Easy Row */}
          <div className="bg-surface-2/40 hover:bg-surface-2/60 transition-colors border border-line/40 rounded-lg px-2.5 py-1.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-easy flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-easy" />
                Easy
              </span>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs tabular-nums">
                <span className="font-bold text-text">{easySolved}</span>
                <span className="text-muted">/{easyTotal}</span>
                <span className="text-[10px] text-muted/80 ml-0.5">({easyPct}%)</span>
              </div>
            </div>
            <div className="w-full h-1 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-easy transition-all duration-700 ease-out"
                style={{ width: `${easyPct}%` }}
              />
            </div>
          </div>

          {/* Medium Row */}
          <div className="bg-surface-2/40 hover:bg-surface-2/60 transition-colors border border-line/40 rounded-lg px-2.5 py-1.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-medium flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-medium" />
                Medium
              </span>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs tabular-nums">
                <span className="font-bold text-text">{medSolved}</span>
                <span className="text-muted">/{medTotal}</span>
                <span className="text-[10px] text-muted/80 ml-0.5">({medPct}%)</span>
              </div>
            </div>
            <div className="w-full h-1 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-medium transition-all duration-700 ease-out"
                style={{ width: `${medPct}%` }}
              />
            </div>
          </div>

          {/* Hard Row */}
          <div className="bg-surface-2/40 hover:bg-surface-2/60 transition-colors border border-line/40 rounded-lg px-2.5 py-1.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-hard flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-hard" />
                Hard
              </span>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs tabular-nums">
                <span className="font-bold text-text">{hardSolved}</span>
                <span className="text-muted">/{hardTotal}</span>
                <span className="text-[10px] text-muted/80 ml-0.5">({hardPct}%)</span>
              </div>
            </div>
            <div className="w-full h-1 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-hard transition-all duration-700 ease-out"
                style={{ width: `${hardPct}%` }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LeetCodeSolvedCard;
