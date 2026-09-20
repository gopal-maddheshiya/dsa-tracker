import React from 'react';
import { Code2, CheckCircle2, Zap, Flame } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';

/**
 * High-density Unified Metric Bar.
 * Consolidates the 4 disparate KPI cards into a single cohesive telemetry console,
 * saving over 60% vertical space while giving a clean Linear/Vercel look.
 */
const UnifiedMetricBar = ({
  summary,
  isLoading = false,
  solvedPct = 0,
  solveRate = 0,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-surface border border-line p-3 sm:p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-2 space-y-2">
            <div className="h-3 w-16 bg-surface-2 rounded" />
            <div className="h-6 w-12 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const hardCount = summary?.difficultyBreakdown?.find((d) => d.difficulty === 'hard')?.count || 0;
  const longestStreak = summary?.longestStreak || summary?.currentStreak || 0;

  const metrics = [
    {
      label: 'Cataloged',
      value: summary?.totalProblems || 0,
      icon: Code2,
      iconColor: 'text-text-secondary',
      valueColor: 'text-text',
      badge: `${hardCount} Hard`,
      badgeColor: 'text-muted bg-surface-2 border-line',
    },
    {
      label: 'Solved',
      value: summary?.solvedProblems || 0,
      icon: CheckCircle2,
      iconColor: 'text-success',
      valueColor: 'text-success',
      badge: `${solvedPct}%`,
      badgeColor: 'text-success bg-success/10 border-success/25',
    },
    {
      label: 'Sessions',
      value: summary?.totalAttempts || 0,
      icon: Zap,
      iconColor: 'text-medium',
      valueColor: 'text-medium',
      badge: `${solveRate}% acc`,
      badgeColor: 'text-medium bg-medium/10 border-medium/25',
    },
    {
      label: 'Streak',
      value: `${summary?.currentStreak || 0}d`,
      icon: Flame,
      iconColor: 'text-accent',
      valueColor: 'text-accent',
      badge: `Best: ${longestStreak}d`,
      badgeColor: 'text-accent bg-accent/10 border-accent/25',
    },
  ];

  return (
    <div className="rounded-xl bg-surface border border-line p-2 sm:p-2.5 shadow-sm">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-line/60">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`p-2.5 sm:p-3 flex flex-col justify-between ${
                idx % 2 === 1 ? 'pl-3 sm:pl-4 border-l border-line/60 lg:border-l' : 'pr-3 sm:pr-4'
              } ${idx > 0 && idx % 2 === 0 ? 'lg:border-l lg:border-line/60' : ''}`}
            >
              {/* Header: Label + Icon */}
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="text-xs font-semibold text-text-secondary tracking-tight">
                  {item.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${item.iconColor} shrink-0`} />
              </div>

              {/* Value + Inline Mini Badge */}
              <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
                <span className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${item.valueColor}`}>
                  {typeof item.value === 'number' ? <AnimatedNumber value={item.value} /> : item.value}
                </span>
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border whitespace-nowrap tabular-nums ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedMetricBar;
