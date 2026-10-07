import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CheckCircle2, RotateCw, CircleDashed, Layers } from 'lucide-react';

/**
 * ProblemStatsBar
 * Responsive KPI summary component for the problems repository.
 * Displays total count with difficulty breakdown, solved count with percentage,
 * review count, and unattempted count.
 * Cards are interactive: clicking triggers the corresponding status filter.
 */
export default function ProblemStatsBar({
  problems = [],
  activeStatus = '',
  onStatusSelect,
  loading = false,
}) {
  const containerRef = useRef(null);
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-surface border border-line shadow-xs min-h-[82px] flex flex-col justify-between"
          >
            <div className="h-3 bg-surface-2 rounded w-20" />
            <div className="h-6 bg-surface-2 rounded w-14 my-1" />
            <div className="h-2.5 bg-surface-2 rounded w-28" />
          </div>
        ))}
      </div>
    );
  }

  const total = problems.length;
  if (total === 0) return null;

  const solvedCount = problems.filter((p) => p.latestAttempt?.status === 'solved').length;
  const reviewCount = problems.filter((p) => {
    const s = p.latestAttempt?.status;
    return s === 'revisit_needed' || s === 'struggled';
  }).length;
  const unattemptedCount = problems.filter((p) => !p.latestAttempt).length;

  const easyCount = problems.filter((p) => p.difficulty === 'easy').length;
  const mediumCount = problems.filter((p) => p.difficulty === 'medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'hard').length;

  const solvedPct = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

  const cards = [
    {
      id: 'all',
      statusValue: '',
      label: 'Total Tracked',
      value: total,
      subtext: `${easyCount}E · ${mediumCount}M · ${hardCount}H`,
      icon: Layers,
      colorClass: 'text-text',
      activeBorder: 'border-accent ring-1 ring-accent/30 bg-surface/95 shadow-[0_0_16px_rgba(237,134,65,0.18)]',
      borderTop: 'border-t-2 border-t-accent/80',
      badge: 'All',
      badgeClass: 'text-text-secondary bg-surface-2',
    },
    {
      id: 'solved',
      statusValue: 'solved',
      label: 'Solved',
      value: solvedCount,
      subtext: `${solvedPct}% complete`,
      icon: CheckCircle2,
      colorClass: 'text-emerald-400',
      activeBorder: 'border-emerald-500/80 ring-1 ring-emerald-500/30 bg-surface/95 shadow-[0_0_16px_rgba(16,185,129,0.18)]',
      borderTop: 'border-t-2 border-t-emerald-500/80',
      badge: `${solvedPct}%`,
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    },
    {
      id: 'review',
      statusValue: 'revisit_needed',
      label: 'Needs Review',
      value: reviewCount,
      subtext: reviewCount > 0 ? 'Requires rehearsal' : 'All clear',
      icon: RotateCw,
      colorClass: 'text-amber-400',
      activeBorder: 'border-amber-500/80 ring-1 ring-amber-500/30 bg-surface/95 shadow-[0_0_16px_rgba(245,158,11,0.18)]',
      borderTop: 'border-t-2 border-t-amber-500/80',
      badge: reviewCount > 0 ? 'Priority' : 'Good',
      badgeClass: reviewCount > 0 ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' : 'text-text-secondary bg-surface-2',
    },
    {
      id: 'unattempted',
      statusValue: 'not_attempted',
      label: 'Unattempted',
      value: unattemptedCount,
      subtext: unattemptedCount === 1 ? '1 in backlog' : `${unattemptedCount} in backlog`,
      icon: CircleDashed,
      colorClass: 'text-muted',
      activeBorder: 'border-purple-500/80 ring-1 ring-purple-500/30 bg-surface/95 shadow-[0_0_16px_rgba(168,85,247,0.18)]',
      borderTop: 'border-t-2 border-t-purple-500/70',
      badge: `${total - unattemptedCount}/${total} tried`,
      badgeClass: 'text-text-secondary bg-surface-2',
    },
  ];

  // GSAP subtle staggered entrance
  useEffect(() => {
    if (containerRef.current && total > 0 && typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        gsap.fromTo(
          containerRef.current.querySelectorAll('.stat-kpi-card'),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out', clearProps: 'transform' }
        );
      }
    }
  }, [total]);

  return (
    <div ref={containerRef}>
      {/* Mobile Compact Strip (< sm) */}
      <div className="block sm:hidden p-3 rounded-xl bg-surface border border-line shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        <div className="grid grid-cols-4 divide-x divide-line/60 text-center">
          {cards.map((c) => {
            const isSelected =
              c.statusValue === '' ? activeStatus === '' : activeStatus === c.statusValue;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onStatusSelect?.(isSelected && c.statusValue !== '' ? '' : c.statusValue)}
                className={`px-1 py-0.5 rounded transition-all active:scale-95 ${
                  isSelected ? 'bg-surface-2 font-semibold' : ''
                }`}
              >
                <span className="text-[9px] font-mono uppercase text-muted tracking-wider block truncate">
                  {c.label}
                </span>
                <span className={`text-lg font-bold font-mono block my-0.5 tabular-nums ${c.colorClass}`}>
                  {c.value}
                </span>
                <span className="text-[9px] text-muted block truncate font-mono">
                  {c.id === 'solved' ? `${solvedPct}%` : c.subtext.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop & Tablet 4-Card Grid (>= sm) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          const isSelected =
            c.statusValue === '' ? activeStatus === '' : activeStatus === c.statusValue;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onStatusSelect?.(isSelected && c.statusValue !== '' ? '' : c.statusValue)}
              className={`stat-kpi-card p-3.5 rounded-xl bg-surface border text-left transition-all duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:border-line-hover hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_20px_-4px_rgba(0,0,0,0.3)] active:scale-[0.99] flex flex-col justify-between min-h-[92px] ${
                c.borderTop
              } ${isSelected ? c.activeBorder : 'border-line'}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-medium text-text-secondary tracking-wide flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted" />
                  <span>{c.label}</span>
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border border-line ${c.badgeClass}`}>
                  {c.badge}
                </span>
              </div>

              <div className="my-1.5 flex items-baseline justify-between w-full">
                <span className={`text-2xl font-mono font-bold tracking-tight tabular-nums ${c.colorClass}`}>
                  {c.value}
                </span>
                <span className="text-[11px] font-mono text-muted">
                  {c.subtext}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
