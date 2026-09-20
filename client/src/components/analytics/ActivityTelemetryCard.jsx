import React from 'react';
import { Flame, Zap } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';

/**
 * Clean 2-Stat Activity & Momentum Card.
 * Displays Streak and Practice Sessions with zero fluff, no duplicate percentages,
 * and zero text truncation on any screen size.
 */
const ActivityTelemetryCard = ({
  summary,
  isLoading = false,
  solveRate = 0,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`rounded-xl bg-surface border border-line p-3 sm:p-4 grid grid-cols-2 gap-3 animate-pulse ${className}`}>
        <div className="h-16 bg-surface-2 rounded-lg" />
        <div className="h-16 bg-surface-2 rounded-lg" />
      </div>
    );
  }

  const currentStreak = summary?.currentStreak || 0;
  const longestStreak = summary?.longestStreak || currentStreak;
  const totalAttempts = summary?.totalAttempts || 0;

  return (
    <div className={`rounded-xl bg-surface border border-line p-2.5 sm:p-3 shadow-sm ${className}`}>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 h-full items-center">
        
        {/* Streak Item */}
        <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-lg bg-surface-2/40 hover:bg-surface-2/60 border border-line/40 transition-colors h-full">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-text-secondary tracking-tight">
              Streak
            </span>
            <div className="w-5 h-5 rounded-md bg-accent/15 border border-accent/25 flex items-center justify-center shrink-0">
              <Flame className="w-3 h-3 text-accent" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-bold text-accent tabular-nums tracking-tight">
              <AnimatedNumber value={currentStreak} />
              <span className="text-xs font-normal text-muted ml-0.5">d</span>
            </span>
            <span className="text-[10px] font-medium text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded tabular-nums whitespace-nowrap">
              Best {longestStreak}d
            </span>
          </div>
        </div>

        {/* Practice Sessions Item */}
        <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-lg bg-surface-2/40 hover:bg-surface-2/60 border border-line/40 transition-colors h-full">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] sm:text-xs font-semibold text-text-secondary tracking-tight">
              Practice
            </span>
            <div className="w-5 h-5 rounded-md bg-medium/15 border border-medium/25 flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3 text-medium" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-bold text-medium tabular-nums tracking-tight">
              <AnimatedNumber value={totalAttempts} />
            </span>
            <span className="text-[10px] font-medium text-medium bg-medium/10 border border-medium/20 px-1.5 py-0.5 rounded tabular-nums whitespace-nowrap">
              {solveRate}% acc
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActivityTelemetryCard;
