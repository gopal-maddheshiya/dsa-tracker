import React from 'react';
import { Check, Target, Clock, X, TrendingUp, Layers, BarChart2 } from 'lucide-react';

/**
 * Clean SVG Radial Progress Ring for KPI cards matching the reference image
 */
function RadialRing({ percentage = 0, color = '#ed8641' }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius; // ~138.2
  const validPct = Math.min(100, Math.max(0, Math.round(percentage)));
  const offset = circumference * (1 - validPct / 100);

  return (
    <div className="relative w-14 h-14 hidden lg:flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="var(--line)"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.6s ease',
          }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-text pointer-events-none">
        {validPct}%
      </span>
    </div>
  );
}

/**
 * StatCard: Mobile & Desktop 2x2 / 1x4 KPI card.
 * Types:
 * - 'tracked': Blue squircle with 3D box/layers icon (Tracked Problems)
 * - 'attempts': Sky/blue squircle with bullseye target (Practice Attempts)
 * - 'solved': Green squircle with checkmark + percentage subtext (Solved Problems)
 * - 'success': Rose/red squircle with bar chart/trending icon (Success Rate)
 * - 'inprogress': Amber squircle with clock icon
 * - 'notsolved': Red squircle with X icon
 */
export default function StatCard({
  label,
  value,
  context,
  subtext,
  badgeType = 'default',
  percentage = null,
  progressPercent = null,
  loading = false,
  error = null,
  onRetry = null,
}) {
  if (loading) {
    return (
      <div className="p-3.5 sm:p-4.5 rounded-2xl bg-surface border border-line flex flex-col justify-between min-h-[92px] sm:min-h-[105px] animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-surface-2 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-2.5 bg-surface-2 rounded w-16" />
            <div className="h-5 sm:h-7 bg-surface-2 rounded w-12" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3.5 sm:p-4.5 rounded-2xl bg-surface border border-line flex flex-col justify-between min-h-[92px] sm:min-h-[105px]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-medium text-text-secondary">{label}</span>
          <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
            Error
          </span>
        </div>
        <div className="my-1 text-[11px] text-muted">Failed to load</div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-[11px] text-accent hover:underline font-mono self-start"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Map card style identity
  const cardConfig = {
    tracked: {
      iconBg: 'bg-[#ed8641] text-white shadow-[0_0_14px_rgba(237,134,65,0.35)]',
      Icon: Layers,
      subtextColor: 'text-[#ed8641]',
      ringColor: '#ed8641',
      hasTrend: false,
    },
    attempts: {
      iconBg: 'bg-[#5ebdbc] text-slate-900 font-bold shadow-[0_0_14px_rgba(94,189,188,0.35)]',
      Icon: Target,
      subtextColor: 'text-[#0891b2] dark:text-[#5ebdbc]',
      ringColor: '#5ebdbc',
      hasTrend: false,
    },
    total: {
      iconBg: 'bg-[#ed8641] text-white shadow-[0_0_14px_rgba(237,134,65,0.35)]',
      Icon: Layers,
      subtextColor: 'text-[#ed8641]',
      ringColor: '#ed8641',
      hasTrend: false,
    },
    solved: {
      iconBg: 'bg-[#10b981] text-white shadow-[0_0_14px_rgba(16,185,129,0.35)]',
      Icon: Check,
      subtextColor: 'text-emerald-500 dark:text-emerald-400',
      ringColor: '#10b981',
      hasTrend: false,
    },
    success: {
      iconBg: 'bg-[#e11d48] text-white shadow-[0_0_14px_rgba(225,29,72,0.4)]',
      Icon: BarChart2,
      subtextColor: 'text-rose-500 dark:text-rose-400',
      ringColor: '#e11d48',
      hasTrend: false,
    },
    inprogress: {
      iconBg: 'bg-[#f59e0b] text-white shadow-[0_0_14px_rgba(245,158,11,0.35)]',
      Icon: Clock,
      subtextColor: 'text-amber-500 dark:text-amber-400',
      ringColor: '#f59e0b',
      hasTrend: false,
    },
    notsolved: {
      iconBg: 'bg-[#ef4444] text-white shadow-[0_0_14px_rgba(239,68,68,0.35)]',
      Icon: X,
      subtextColor: 'text-rose-500 dark:text-rose-400',
      ringColor: '#ef4444',
      hasTrend: false,
    },
    default: {
      iconBg: 'bg-[#10b981] text-white',
      Icon: Check,
      subtextColor: 'text-emerald-500 dark:text-emerald-400',
      ringColor: '#10b981',
      hasTrend: false,
    },
  };

  const style = cardConfig[badgeType] || cardConfig.default;
  const ActiveIcon = style.Icon;
  const displaySubtext = subtext || context;
  const ringPercentage = percentage ?? progressPercent;

  return (
    <div className="p-3.5 sm:p-4.5 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-line-hover hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_12px_28px_-6px_rgba(0,0,0,0.35)] transition-all duration-200 group relative overflow-hidden">
      {/* Icon + Metric info */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 w-full sm:w-auto">
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${style.iconBg}`}
        >
          <ActiveIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-[11px] sm:text-xs font-medium text-text-secondary block truncate">
            {label}
          </span>
          <div className="text-xl sm:text-2xl xl:text-[28px] font-mono font-bold tracking-tight text-text leading-tight my-0.5 tabular-nums">
            {value !== undefined && value !== null ? value : '—'}
          </div>
          {displaySubtext && (
            <div
              className={`text-[10px] sm:text-xs font-mono flex items-center gap-1 truncate font-medium ${style.subtextColor}`}
            >
              {style.hasTrend && <TrendingUp className="w-3 h-3 shrink-0" />}
              <span>{displaySubtext}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Radial Progress Ring (Desktop viewports) */}
      {ringPercentage !== null && ringPercentage !== undefined && (
        <RadialRing percentage={ringPercentage} color={style.ringColor} />
      )}
    </div>
  );
}
