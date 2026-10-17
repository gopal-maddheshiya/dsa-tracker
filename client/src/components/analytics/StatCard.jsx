import React from 'react';
import { Code2, Terminal, CheckCheck, Target, Clock, X, TrendingUp } from 'lucide-react';
import SpotlightCard from '../common/SpotlightCard.jsx';

/**
 * StatCard: Compact, non-redundant KPI metric card.
 * Types:
 * - 'tracked': Warm terracotta squircle with Code2 icon (Tracked Problems)
 * - 'attempts': Cyan/teal squircle with Terminal icon (Practice Attempts)
 * - 'solved': Emerald squircle with CheckCheck icon (Solved Problems)
 * - 'success': Crimson rose squircle with Target icon (Success Rate)
 * - 'inprogress': Amber squircle with clock icon
 * - 'notsolved': Red squircle with X icon
 */
export default function StatCard({
  label,
  value,
  context,
  subtext,
  badgeType = 'default',
  loading = false,
  error = null,
  onRetry = null,
}) {
  if (loading) {
    return (
      <div className="p-3 sm:p-3.5 rounded-2xl specular-card flex flex-col justify-between min-h-[78px] sm:min-h-[84px] animate-pulse">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-2 shrink-0" />
          <div className="h-6 w-12 bg-surface-2 rounded" />
        </div>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-line/30">
          <div className="h-2.5 w-16 bg-surface-2 rounded" />
          <div className="h-2.5 w-12 bg-surface-2 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-3.5 rounded-2xl specular-card flex flex-col justify-between min-h-[78px] sm:min-h-[84px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-text-secondary block truncate">{label}</span>
          <span className="text-[9px] font-mono tabular-nums text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
            Error
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[11px] text-muted">
          <span>Failed to load</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-[11px] text-accent hover:underline font-mono tabular-nums cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Map card style identity with custom spotlight hues and conceptual DSA icons
  const cardConfig = {
    tracked: {
      iconBg: 'bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white ring-1 ring-white/20',
      Icon: Code2,
      subtextColor: 'text-[#ed8641]',
      hasTrend: false,
      spotlightColor: 'rgba(237, 134, 65, 0.12)',
      borderColor: 'rgba(237, 134, 65, 0.38)',
    },
    attempts: {
      iconBg: 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2] text-white ring-1 ring-white/20',
      Icon: Terminal,
      subtextColor: 'text-[#0891b2] dark:text-[#5ebdbc]',
      hasTrend: false,
      spotlightColor: 'rgba(94, 189, 188, 0.12)',
      borderColor: 'rgba(94, 189, 188, 0.38)',
    },
    total: {
      iconBg: 'bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white ring-1 ring-white/20',
      Icon: Code2,
      subtextColor: 'text-[#ed8641]',
      hasTrend: false,
      spotlightColor: 'rgba(237, 134, 65, 0.12)',
      borderColor: 'rgba(237, 134, 65, 0.38)',
    },
    solved: {
      iconBg: 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white ring-1 ring-white/20',
      Icon: CheckCheck,
      subtextColor: 'text-emerald-500 dark:text-emerald-400',
      hasTrend: false,
      spotlightColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.38)',
    },
    success: {
      iconBg: 'bg-gradient-to-br from-[#f43f5e] to-[#e11d48] text-white ring-1 ring-white/20',
      Icon: Target,
      subtextColor: 'text-rose-500 dark:text-rose-400',
      hasTrend: false,
      spotlightColor: 'rgba(225, 29, 72, 0.12)',
      borderColor: 'rgba(225, 29, 72, 0.38)',
    },
    inprogress: {
      iconBg: 'bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white ring-1 ring-white/20',
      Icon: Clock,
      subtextColor: 'text-amber-500 dark:text-amber-400',
      hasTrend: false,
      spotlightColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.38)',
    },
    notsolved: {
      iconBg: 'bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-white ring-1 ring-white/20',
      Icon: X,
      subtextColor: 'text-rose-500 dark:text-rose-400',
      hasTrend: false,
      spotlightColor: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.38)',
    },
    default: {
      iconBg: 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white ring-1 ring-white/20',
      Icon: CheckCheck,
      subtextColor: 'text-emerald-500 dark:text-emerald-400',
      hasTrend: false,
      spotlightColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.38)',
    },
  };

  const style = cardConfig[badgeType] || cardConfig.default;
  const ActiveIcon = style.Icon;
  const displaySubtext = subtext || context;

  return (
    <SpotlightCard
      spotlightColor={style.spotlightColor}
      borderColor={style.borderColor}
      className="p-3 sm:p-3.5 rounded-2xl specular-card specular-card-hover flex flex-col justify-between group relative overflow-hidden min-h-[78px] sm:min-h-[84px]"
    >
      {/* Top Row: Icon on left, Metric Value on right */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${style.iconBg}`}
        >
          <ActiveIcon className="w-4 h-4 stroke-[2.2]" />
        </div>

        <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-text leading-none tabular-nums text-right">
          {value !== undefined && value !== null ? value : '—'}
        </div>
      </div>

      {/* Bottom Row: Label on left, Subtext on right */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-line/30">
        <span className="text-[11px] sm:text-xs font-medium text-text-secondary truncate">
          {label}
        </span>
        {displaySubtext && (
          <div
            className={`text-[10px] sm:text-[11px] font-mono tabular-nums font-medium flex items-center gap-1 shrink-0 ${style.subtextColor}`}
          >
            {style.hasTrend && <TrendingUp className="w-3 h-3 shrink-0" />}
            <span>{displaySubtext}</span>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}
