import AnimatedNumber from '../ui/AnimatedNumber';

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
  valueColor = 'text-white',
  glowColor = 'rgba(249,115,22,0.14)',
  progressPercent,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 flex flex-col justify-between animate-pulse rounded-2xl bg-[#131722]/60 backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-20 bg-white/[0.06] rounded"></div>
          <div className="h-7 w-7 bg-white/[0.06] rounded-xl"></div>
        </div>
        <div className="h-8 w-20 bg-white/[0.06] rounded mb-2"></div>
        <div className="h-3 w-28 bg-white/[0.04] rounded"></div>
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
    <div className="h-full p-4 sm:p-5 flex flex-col justify-between hover:border-white/[0.22] hover:shadow-[0_12px_36px_rgba(0,0,0,0.55)] transition-all duration-200 group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#161B28]/75 to-[#0E121B]/85 backdrop-blur-xl border border-white/[0.09] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
      {/* Top right ambient corner lighting */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 blur-2xl rounded-full pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glowColor }}
      />

      {/* Top row: Full title + Icon */}
      <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold leading-snug flex-1 min-w-0">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-xl bg-white/[0.05] border border-white/[0.09] flex items-center justify-center text-slate-300 group-hover:text-white group-hover:scale-110 transition-all shadow-sm shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Metric value and badge */}
      <div className="my-1 relative z-10">
        <div className="flex items-baseline gap-2 flex-wrap">
          <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${valueColor}`}>
            {renderValue()}
          </div>
          {badge && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-orange-400 self-center">
              {badge}
            </span>
          )}
        </div>

        {/* Optional inline progress bar */}
        {progressPercent !== undefined && (
          <div className="mt-2.5 w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
            />
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 font-mono mt-1.5 relative z-10 leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
