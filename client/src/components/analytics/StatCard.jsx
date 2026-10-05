import React from 'react';
import { Check, Target, Clock, X, TrendingUp } from 'lucide-react';

/**
 * Clean SVG Radial Progress Ring for KPI cards matching the reference image
 */
function RadialRing({ percentage = 0, color = '#2563eb' }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius; // ~138.2
  const validPct = Math.min(100, Math.max(0, Math.round(percentage)));
  const offset = circumference * (1 - validPct / 100);

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#1e293b"
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
      <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white pointer-events-none">
        {validPct}%
      </span>
    </div>
  );
}

/**
 * StatCard: Exact recreation of the reference desktop KPI cards.
 * Types:
 * - 'total': Green squircle with white checkmark + "+12 this month"
 * - 'solved': Blue squircle with target icon + radial ring
 * - 'inprogress': Amber squircle with clock icon + radial ring
 * - 'notsolved': Red squircle with X icon + radial ring
 */
export default function StatCard({
  label,
  value,
  context,
  subtext,
  badgeType = 'default', // 'total' | 'solved' | 'inprogress' | 'notsolved' | 'default' | 'accent' | 'success' | 'warning'
  percentage = null,
  progressPercent = null,
  loading = false,
  error = null,
  onRetry = null,
}) {
  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-surface border border-line flex items-center justify-between min-h-[105px] animate-pulse">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-surface-2" />
          <div className="space-y-2">
            <div className="h-3 bg-surface-2 rounded w-20" />
            <div className="h-7 bg-surface-2 rounded w-16" />
            <div className="h-2.5 bg-surface-2 rounded w-24" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-surface-2/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-surface border border-line flex flex-col justify-between min-h-[105px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">{label}</span>
          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            Error
          </span>
        </div>
        <div className="my-1 text-xs text-muted">Failed to load data</div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs text-blue-400 hover:underline font-mono self-start"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Map card style identity
  const cardConfig = {
    total: {
      iconBg: 'bg-[#10b981] text-white shadow-[0_0_14px_rgba(16,185,129,0.35)]',
      Icon: Check,
      subtextColor: 'text-emerald-400',
      ringColor: '#10b981',
      hasTrend: true,
    },
    solved: {
      iconBg: 'bg-[#2563eb] text-white shadow-[0_0_14px_rgba(37,99,235,0.4)]',
      Icon: Target,
      subtextColor: 'text-blue-400',
      ringColor: '#3b82f6',
      hasTrend: false,
    },
    inprogress: {
      iconBg: 'bg-[#f59e0b] text-white shadow-[0_0_14px_rgba(245,158,11,0.35)]',
      Icon: Clock,
      subtextColor: 'text-amber-400',
      ringColor: '#f59e0b',
      hasTrend: false,
    },
    notsolved: {
      iconBg: 'bg-[#ef4444] text-white shadow-[0_0_14px_rgba(239,68,68,0.35)]',
      Icon: X,
      subtextColor: 'text-rose-400',
      ringColor: '#ef4444',
      hasTrend: false,
    },
    // Backward compatibility aliases
    default: {
      iconBg: 'bg-[#10b981] text-white',
      Icon: Check,
      subtextColor: 'text-emerald-400',
      ringColor: '#10b981',
      hasTrend: true,
    },
    accent: {
      iconBg: 'bg-[#2563eb] text-white',
      Icon: Target,
      subtextColor: 'text-blue-400',
      ringColor: '#3b82f6',
      hasTrend: false,
    },
    success: {
      iconBg: 'bg-[#10b981] text-white',
      Icon: Check,
      subtextColor: 'text-emerald-400',
      ringColor: '#10b981',
      hasTrend: false,
    },
  };

  const style = cardConfig[badgeType] || cardConfig.default;
  const ActiveIcon = style.Icon;
  const displaySubtext = subtext || context;
  const ringPercentage = percentage ?? progressPercent;

  return (
    <div className="p-4 sm:p-4.5 rounded-2xl bg-surface border border-line shadow-subtle flex items-center justify-between gap-3 hover:border-slate-700/80 transition-all duration-150">
      {/* Left: Icon + Metric info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}
        >
          <ActiveIcon className="w-5 h-5 stroke-[2.5]" />
        </div>

        <div className="min-w-0">
          <span className="text-xs font-medium text-slate-400 block truncate">
            {label}
          </span>
          <div className="text-2xl sm:text-[28px] font-mono font-bold tracking-tight text-white leading-tight my-0.5">
            {value !== undefined && value !== null ? value : '—'}
          </div>
          {displaySubtext && (
            <div
              className={`text-xs font-mono flex items-center gap-1 truncate ${style.subtextColor}`}
            >
              {style.hasTrend && <TrendingUp className="w-3 h-3 shrink-0" />}
              <span>{displaySubtext}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Radial Progress Ring (for Solved, In Progress, Not Solved) */}
      {ringPercentage !== null && ringPercentage !== undefined && (
        <RadialRing percentage={ringPercentage} color={style.ringColor} />
      )}
    </div>
  );
}
