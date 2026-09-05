import React from 'react';

/**
 * Compact, information-dense KPI statistic card.
 * Designed with restrained borders and subtle contrast.
 */
const StatCard = ({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  isLoading = false,
  valueColor = 'text-white',
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5 flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-24 bg-slate-800 rounded"></div>
          <div className="h-5 w-5 bg-slate-800 rounded"></div>
        </div>
        <div className="h-8 w-16 bg-slate-800 rounded mb-2"></div>
        <div className="h-3 w-32 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-colors rounded-lg p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {badge ? (
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            {badge}
          </span>
        ) : Icon ? (
          <span className="text-slate-400" aria-hidden="true">
            <Icon className="w-4 h-4" />
          </span>
        ) : null}
      </div>

      <div className="my-1">
        <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${valueColor}`}>
          {value !== undefined && value !== null ? value : 0}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-1 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
