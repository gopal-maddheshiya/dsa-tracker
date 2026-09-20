import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { easy, medium, hard, surface, text } from '../../theme/colors';

const DIFFICULTY_CONFIG = [
  {
    key: 'easy',
    label: 'Easy',
    color: easy,
    text: 'text-easy',
    dot: 'bg-easy',
    bg: 'bg-easy/12',
    target: 30,
  },
  {
    key: 'medium',
    label: 'Medium',
    color: medium,
    text: 'text-medium',
    dot: 'bg-medium',
    bg: 'bg-medium/12',
    target: 50,
  },
  {
    key: 'hard',
    label: 'Hard',
    color: hard,
    text: 'text-hard',
    dot: 'bg-hard',
    bg: 'bg-hard/12',
    target: 20,
  },
];

const DifficultyChart = ({ breakdown = {}, isLoading = false, error = null, onRetry, className = '' }) => {
  const navigate = useNavigate();
  const [hoveredDiff, setHoveredDiff] = useState(null);

  if (isLoading) {
    return (
      <div className={`rounded-xl bg-surface border border-line p-6 animate-pulse flex flex-col justify-between h-full ${className}`}>
        <div className="h-4 w-36 bg-surface-2 rounded mb-2" />
        <div className="h-3 w-28 bg-surface-2 rounded mb-5" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-36 bg-surface-2 rounded-xl" />
          <div className="space-y-2.5 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-surface-2 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl bg-surface border border-danger/20 p-6 flex flex-col justify-between h-full ${className}`}>
        <h3 className="text-sm font-semibold text-text mb-3">Difficulty Split</h3>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-danger mb-3">Unable to load difficulty data.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-secondary text-xs">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const counts = { easy: 0, medium: 0, hard: 0 };
  if (Array.isArray(breakdown)) {
    breakdown.forEach((item) => {
      if (item?.difficulty && counts[item.difficulty] !== undefined) {
        counts[item.difficulty] = Number(item.count) || 0;
      }
    });
  } else if (breakdown && typeof breakdown === 'object') {
    counts.easy = Number(breakdown.easy) || 0;
    counts.medium = Number(breakdown.medium) || 0;
    counts.hard = Number(breakdown.hard) || 0;
  }

  const total = counts.easy + counts.medium + counts.hard;

  const pieData = DIFFICULTY_CONFIG
    .map((cfg) => {
      const value = counts[cfg.key] || 0;
      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
      return {
        name: cfg.label,
        key: cfg.key,
        value,
        pct,
        color: cfg.color,
        text: cfg.text,
        dot: cfg.dot,
        bg: cfg.bg,
        target: cfg.target,
      };
    })
    .filter((item) => item.value > 0);

  const activeConfig = hoveredDiff
    ? DIFFICULTY_CONFIG.find((c) => c.key === hoveredDiff)
    : null;
  const activeCount = activeConfig ? counts[activeConfig.key] : total;
  const activePct = activeConfig && total > 0 ? Math.round((activeCount / total) * 100) : 100;

  // Percentage calculations
  const easyPct = total > 0 ? Math.round((counts.easy / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((counts.medium / total) * 100) : 0;
  const hardPct = total > 0 ? Math.round((counts.hard / total) * 100) : 0;
  const medHardRatio = total > 0 ? Math.round(((counts.medium + counts.hard) / total) * 100) : 0;

  const handleDifficultyClick = (diffKey) => {
    navigate(`/problems?difficulty=${diffKey}`);
  };

  return (
    <div
      className={`rounded-xl bg-surface border border-line p-6 flex flex-col justify-between h-full ${className}`}
    >
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="shrink-0 mb-3 sm:mb-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-text tracking-tight">Difficulty Split</h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-2 border border-line text-text-secondary">
                Distribution
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Hover to inspect • Click row to filter problems
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-2 border border-line text-text tabular-nums">
            {total} total
          </span>
        </div>
      </div>

      {/* ── Donut + Legend Grid + Readiness Bar ────────────────────── */}
      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-line rounded-xl p-4 my-auto">
          <p className="text-xs text-muted">No problems cataloged yet.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-around py-1 space-y-4">
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4 xl:gap-6 py-2">
            {/* Donut Chart */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={62}
                    paddingAngle={4}
                    stroke={surface}
                    strokeWidth={3}
                    onMouseEnter={(data) => setHoveredDiff(data.key)}
                    onMouseLeave={() => setHoveredDiff(null)}
                    onClick={(data) => handleDifficultyClick(data.key)}
                    className="cursor-pointer"
                  >
                    {pieData.map((entry) => {
                      const isHovered = hoveredDiff === entry.key;
                      return (
                        <Cell
                          key={`cell-${entry.key}`}
                          fill={entry.color}
                          opacity={hoveredDiff ? (isHovered ? 1 : 0.35) : 1}
                          stroke={isHovered ? text : surface}
                          strokeWidth={isHovered ? 2 : 1}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Live Center Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span
                  className={`text-3xl font-extrabold tracking-tight leading-none transition-all duration-200 tabular-nums ${
                    activeConfig ? activeConfig.text : 'text-text'
                  }`}
                >
                  {activeCount}
                </span>
                <span className="text-xs uppercase tracking-wide text-text-secondary mt-1 font-medium transition-all duration-200">
                  {activeConfig ? `${activeConfig.label} (${activePct}%)` : 'TOTAL'}
                </span>
              </div>
            </div>

            {/* Interactive Clickable Difficulty Rows */}
            <div className="w-full sm:flex-1 space-y-2">
              {DIFFICULTY_CONFIG.map(({ key, label, text: textColor, dot }) => {
                const count = counts[key] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const isHovered = hoveredDiff === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDifficultyClick(key)}
                    onMouseEnter={() => setHoveredDiff(key)}
                    onMouseLeave={() => setHoveredDiff(null)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all duration-150 group text-left cursor-pointer ${
                      isHovered
                        ? 'bg-surface-2 border-line'
                        : 'bg-surface border-line hover:border-line hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                      <span className="text-xs font-medium text-text group-hover:text-accent transition-colors">
                        {label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-baseline gap-1.5 tabular-nums">
                        <span className={`font-semibold text-xs sm:text-sm ${textColor}`}>{count}</span>
                        <span className="text-xs text-text-secondary">({pct}%)</span>
                      </div>
                      <span className="text-xs text-text-secondary group-hover:text-accent transition-colors">
                        ↗
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Interview Target Progress Bar ────────── */}
          <div className="pt-3.5 border-t border-line space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
              <span className="text-xs text-text-secondary font-medium">
                Interview Readiness Split
              </span>
              <span className={`text-xs font-semibold tabular-nums ${medHardRatio >= 65 ? 'text-easy' : 'text-medium'}`}>
                {medHardRatio}% Med & Hard (Target ≥65%)
              </span>
            </div>

            {/* Proportional readiness bar bound to real medHardRatio percentage */}
            <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden border border-line">
              <div
                style={{ width: `${Math.min(100, Math.max(0, medHardRatio))}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  medHardRatio >= 65 ? 'bg-easy' : 'bg-medium'
                }`}
                title={`Interview Readiness: ${medHardRatio}%`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary pt-0.5 tabular-nums">
              <span>Easy: {easyPct}%</span>
              <span>Medium: {medPct}%</span>
              <span>Hard: {hardPct}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer Insight ──────────────────────────────────── */}
      {total > 0 && (
        <div className="mt-auto pt-3.5 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${medHardRatio >= 65 ? 'bg-easy' : 'bg-medium'}`} />
            <span className="text-text">
              {medHardRatio >= 65
                ? 'Strong preparation ratio for technical interviews'
                : 'Prioritize Medium and Hard problems for rounds'}
            </span>
          </div>
          <span className="text-muted text-xs self-end sm:self-auto shrink-0">Benchmark</span>
        </div>
      )}
    </div>
  );
};

export default DifficultyChart;
