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
      <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-20 bg-slate-800 rounded"></div>
          <div className="h-4 w-4 bg-slate-800 rounded"></div>
        </div>
        <div className="h-7 w-16 bg-slate-800 rounded mb-2"></div>
        <div className="h-3 w-28 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d121f] border border-slate-800/80 hover:border-slate-700/80 transition-colors rounded-lg p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {badge ? (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            {badge}
          </span>
        ) : Icon ? (
          <span className="text-slate-400" aria-hidden="true">
            <Icon className="w-3.5 h-3.5" />
          </span>
        ) : null}
      </div>

      <div className="my-0.5">
        <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${valueColor}`}>
          {value !== undefined && value !== null ? value : 0}
        </div>
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
