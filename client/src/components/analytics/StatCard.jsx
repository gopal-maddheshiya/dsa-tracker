import React from 'react';

/**
 * Compact, information-dense KPI statistic card.
 * Styled to match exact charcoal/warm black palette tokens with ambient hover glow.
 */
const StatCard = ({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  isLoading = false,
  valueColor = 'text-[#F3F4F6]',
  glowColor = 'rgba(249,115,22,0.12)',
}) => {
  if (isLoading) {
    return (
      <div className="panel p-4 sm:p-5 flex flex-col justify-between animate-pulse rounded-2xl bg-[#121418] border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-20 bg-white/[0.06] rounded"></div>
          <div className="h-7 w-7 bg-white/[0.06] rounded-xl"></div>
        </div>
        <div className="h-8 w-20 bg-white/[0.06] rounded mb-2"></div>
        <div className="h-3 w-28 bg-white/[0.04] rounded"></div>
      </div>
    );
  }

  return (
    <div className="panel p-4 sm:p-5 flex flex-col justify-between hover:border-white/[0.2] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 transition-all duration-200 group relative rounded-2xl overflow-hidden bg-[#121418] border border-white/[0.08]">
      {/* Top right ambient corner lighting */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 blur-2xl rounded-full pointer-events-none opacity-30 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glowColor }}
      />

      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#9CA3AF] font-medium">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#9CA3AF] group-hover:text-[#F3F4F6] group-hover:scale-110 transition-all shadow-sm">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="my-1 relative z-10">
        <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${valueColor}`}>
          {value !== undefined && value !== null ? value : 0}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-1 relative z-10">
        {subtitle && (
          <p className="text-[11px] text-[#9CA3AF] font-mono truncate flex-1">
            {subtitle}
          </p>
        )}
        {badge && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#0E1015] border border-white/[0.08] text-[#F97316] shrink-0">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
