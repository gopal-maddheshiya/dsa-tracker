import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SpotlightCard from '../common/SpotlightCard.jsx';
import { DonutSkeleton } from '../common/SkeletonLoader.jsx';

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    color: '#10b981', // Emerald Green
    hoverColor: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    fillClass: 'bg-[#10b981]',
    textClass: 'text-emerald-400',
    dotGlow: 'shadow-[0_0_8px_rgba(52,211,153,0.6)]',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b', // Amber
    hoverColor: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    fillClass: 'bg-[#f59e0b]',
    textClass: 'text-amber-400',
    dotGlow: 'shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  },
  hard: {
    label: 'Hard',
    color: '#ef4444', // Rose Red
    hoverColor: '#f87171',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    fillClass: 'bg-[#ef4444]',
    textClass: 'text-rose-400',
    dotGlow: 'shadow-[0_0_8px_rgba(251,113,133,0.6)]',
  },
};

/**
 * DifficultyChart: Interactive, zero-overlap Donut Chart showing problem distribution across difficulty tiers.
 * Features bi-directional hover illumination, dynamic center HUD, and accessible filtering links.
 */
export default function DifficultyChart({
  breakdown = [],
  totalProblems = 0,
  loading = false,
  error = null,
  onRetry = null,
}) {
  const [hoveredTier, setHoveredTier] = useState(null);

  // Normalize breakdown counts from backend summary
  const diffMap = { easy: 0, medium: 0, hard: 0 };
  if (Array.isArray(breakdown)) {
    breakdown.forEach((item) => {
      const k = (item.difficulty || '').toLowerCase();
      if (diffMap[k] !== undefined) {
        diffMap[k] = Number(item.count) || 0;
      }
    });
  }

  const effectiveTotal =
    totalProblems > 0
      ? totalProblems
      : diffMap.easy + diffMap.medium + diffMap.hard;

  const rows = [
    {
      key: 'easy',
      ...DIFFICULTY_CONFIG.easy,
      count: diffMap.easy,
      pct: effectiveTotal > 0 ? Math.round((diffMap.easy / effectiveTotal) * 100) : 0,
    },
    {
      key: 'medium',
      ...DIFFICULTY_CONFIG.medium,
      count: diffMap.medium,
      pct: effectiveTotal > 0 ? Math.round((diffMap.medium / effectiveTotal) * 100) : 0,
    },
    {
      key: 'hard',
      ...DIFFICULTY_CONFIG.hard,
      count: diffMap.hard,
      pct: effectiveTotal > 0 ? Math.round((diffMap.hard / effectiveTotal) * 100) : 0,
    },
  ];

  // SVG Geometry Calculation (Zero Overlap Guaranteed)
  const R = 58;
  const C = 2 * Math.PI * R; // ~364.4247
  const nonZeroTiers = rows.filter((r) => r.count > 0);
  const gap = nonZeroTiers.length > 1 ? 4.5 : 0; // Gap between segments in px along circumference

  let cumulativeOffset = 0;
  const segments = rows.map((row) => {
    if (effectiveTotal === 0 || row.count === 0) {
      return { ...row, visibleLen: 0, dashOffset: 0, C };
    }
    const rawLen = (row.count / effectiveTotal) * C;
    const visibleLen = Math.max(0, rawLen - gap);
    const dashOffset = -cumulativeOffset;
    cumulativeOffset += rawLen;
    return {
      ...row,
      visibleLen,
      dashOffset,
      C,
    };
  });

  // Active HUD state (hovered vs default)
  const activeRow = hoveredTier ? rows.find((r) => r.key === hoveredTier) : null;

  return (
    <SpotlightCard
      spotlightColor="rgba(245, 158, 11, 0.08)"
      borderColor="rgba(245, 158, 11, 0.28)"
      className="p-4 sm:p-5 rounded-2xl specular-card flex flex-col justify-between h-full"
    >
      {/* Header with Title and Total Badge */}
      <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-text tracking-tight">
            Difficulty Distribution
          </h2>
          <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
            Solved problems by difficulty (click to filter)
          </p>
        </div>

        {/* Total Badge */}
        <span className="text-[10px] font-mono text-text-secondary bg-surface-2 px-2.5 py-1 rounded-full border border-line shrink-0">
          {effectiveTotal} Total
        </span>
      </div>

      {loading ? (
        <DonutSkeleton />
      ) : error ? (
        <div className="py-8 border border-line rounded-xl text-center">
          <p className="text-xs text-text-secondary">Failed to load difficulty distribution</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-xs text-accent underline"
            >
              Retry
            </button>
          )}
        </div>
      ) : effectiveTotal === 0 ? (
        <div className="py-8 border border-dashed border-line rounded-xl text-center space-y-1">
          <p className="text-xs font-semibold text-text">No solved problems tracked yet</p>
          <p className="text-[11px] text-muted">Solve and log attempts to see your difficulty distribution</p>
        </div>
      ) : (
        /* Donut Chart + Legend Container (Zero Overlapping, Responsive) */
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-around gap-6 py-2 flex-1">
          {/* ==============================================================
              Interactive Donut Ring Chart (Pure SVG, 60fps)
              ============================================================== */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform overflow-visible"
              viewBox="0 0 160 160"
            >
              {/* Background Ring */}
              <circle
                cx="80"
                cy="80"
                r={R}
                stroke="var(--line)"
                strokeWidth="13"
                fill="transparent"
                opacity="0.5"
              />

              {/* Segments */}
              {segments.map((seg) => {
                if (seg.visibleLen <= 0) return null;
                const isHovered = hoveredTier === seg.key;
                const isMuted = hoveredTier && !isHovered;

                return (
                  <circle
                    key={seg.key}
                    cx="80"
                    cy="80"
                    r={R}
                    stroke={isHovered ? seg.hoverColor : seg.color}
                    strokeWidth={isHovered ? 16 : 13}
                    strokeDasharray={`${seg.visibleLen} ${seg.C - seg.visibleLen}`}
                    strokeDashoffset={seg.dashOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: isHovered ? `drop-shadow(0 0 8px ${seg.glowColor})` : 'none',
                      cursor: 'pointer',
                    }}
                    opacity={isMuted ? 0.35 : 1}
                    onMouseEnter={() => setHoveredTier(seg.key)}
                    onMouseLeave={() => setHoveredTier(null)}
                  />
                );
              })}
            </svg>

            {/* Dynamic Center HUD (Calculated to guarantee ZERO overlapping with 102px hole) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-2">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight transition-colors duration-200 leading-none ${
                  activeRow ? activeRow.textClass : 'text-text'
                }`}
              >
                {activeRow ? activeRow.count : effectiveTotal}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted mt-1 font-medium truncate max-w-[90px]">
                {activeRow ? `${activeRow.label} (${activeRow.pct}%)` : 'Total Solved'}
              </span>
            </div>
          </div>

          {/* ==============================================================
              Interactive Legend (Bi-directional hover & filter link)
              ============================================================== */}
          <div className="w-full sm:flex-1 max-w-xs space-y-2.5">
            {rows.map((row) => {
              const isHovered = hoveredTier === row.key;
              const isMuted = hoveredTier && !isHovered;

              return (
                <Link
                  key={row.key}
                  to={`/problems?difficulty=${row.key}`}
                  onMouseEnter={() => setHoveredTier(row.key)}
                  onMouseLeave={() => setHoveredTier(null)}
                  className={`flex flex-col gap-1 px-3 py-2 rounded-xl border transition-all duration-200 group ${
                    isHovered
                      ? 'bg-surface-2 border-line shadow-xs scale-[1.02]'
                      : 'border-line/40 hover:bg-surface-2/60 hover:border-line'
                  } ${isMuted ? 'opacity-40' : 'opacity-100'}`}
                  title={`Filter ${row.label} problems (${row.count} solved)`}
                >
                  <div className="flex items-center justify-between text-xs">
                    {/* Left: Indicator Dot & Name */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${row.fillClass} ${
                          isHovered ? row.dotGlow : ''
                        }`}
                      />
                      <span className="font-semibold text-text group-hover:text-accent transition-colors">
                        {row.label}
                      </span>
                    </div>

                    {/* Right: Numbers */}
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-text-secondary">
                        {row.count} / {effectiveTotal}
                      </span>
                      <span className={`font-bold ${isHovered ? row.textClass : 'text-text'}`}>
                        {row.pct}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden border border-line-subtle/50 mt-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${row.fillClass}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </SpotlightCard>
  );
}
