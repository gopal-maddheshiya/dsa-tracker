import React from 'react';

/**
 * Compact, information-dense KPI statistic card.
 * Styled to match exact charcoal/warm black palette tokens.
 */
const StatCard = ({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  isLoading = false,
  valueColor = 'text-[#F5F5F4]',
}) => {
  if (isLoading) {
    return (
      <div className="panel p-4 flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-20 bg-[#262320] rounded"></div>
          <div className="h-4 w-4 bg-[#262320] rounded"></div>
        </div>
        <div className="h-7 w-16 bg-[#262320] rounded mb-2"></div>
        <div className="h-3 w-28 bg-[#262320]/60 rounded"></div>
      </div>
    );
  }

  return (
    <div className="panel p-4 flex flex-col justify-between hover:border-[#3E3834] transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#A8A29E]">
          {title}
        </span>
        {badge ? (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#141312] border border-[#262320] text-[#F97316]">
            {badge}
          </span>
        ) : Icon ? (
          <span className="text-[#A8A29E]" aria-hidden="true">
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
        <p className="text-[11px] text-[#6B6560] font-mono mt-0.5 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
