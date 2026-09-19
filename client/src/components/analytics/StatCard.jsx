import React from 'react';
import AnimatedNumber from '../ui/AnimatedNumber';

/**
 * Compact, information-dense KPI statistic card.
 * Flat LeetCode dark theme styling with tokenized surfaces and tabular numbers.
 */
const StatCard = ({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  isLoading = false,
  valueColor = 'text-text',
  progressPercent,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 flex flex-col justify-between shimmer rounded-xl bg-surface border border-line">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3.5 w-20 bg-surface-2 rounded" />
          <div className="h-7 w-7 bg-surface-2 rounded-lg" />
        </div>
        <div className="h-8 w-20 bg-surface-2 rounded mb-2" />
        <div className="h-3 w-28 bg-surface-2 rounded" />
      </div>
    );
  }

  const renderValue = () => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') {
      return <AnimatedNumber value={value} />;
    }
    const match = String(value).match(/^(\d+)(.*)$/);
    if (match) {
      return <AnimatedNumber value={parseInt(match[1], 10)} suffix={match[2]} />;
    }
    return value;
  };

  return (
    <div className="h-full p-3.5 sm:p-5 flex flex-col justify-between rounded-xl bg-surface border border-line transition-colors min-w-0">
      {/* Top row: Title + Icon */}
      <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary leading-snug flex-1 min-w-0 break-words">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-text-secondary shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Metric value and badge */}
      <div className="my-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <div className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight tabular-nums ${valueColor}`}>
            {renderValue()}
          </div>
          {badge && (
            <span className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-accent/12 border border-accent/25 text-accent self-center whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>

        {/* Optional inline progress bar */}
        {progressPercent !== undefined && (
          <div className="mt-2.5 w-full bg-surface-2 rounded-full h-1.5 overflow-hidden border border-line">
            <div
              className="h-full bg-easy rounded-full transition-all duration-300"
              style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
            />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] sm:text-xs text-text-secondary mt-1.5 leading-normal break-words min-w-0">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
