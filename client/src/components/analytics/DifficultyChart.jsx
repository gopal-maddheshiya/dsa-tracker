import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const DIFFICULTY_CONFIG = [
  {
    key: 'easy',
    label: 'Easy',
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.4)',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    target: 30,
  },
  {
    key: 'medium',
    label: 'Medium',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.4)',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    target: 50,
  },
  {
    key: 'hard',
    label: 'Hard',
    color: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.4)',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
    target: 20,
  },
];

const DifficultyChart = ({ breakdown = {}, isLoading = false, error = null, onRetry, className = '' }) => {
  const navigate = useNavigate();
  const [hoveredDiff, setHoveredDiff] = useState(null);

  if (isLoading) {
    return (
      <div className={`panel p-6 animate-pulse border-white/[0.08] flex flex-col justify-between h-full ${className}`}>
        <div className="h-4 w-36 shimmer rounded-md mb-2" />
        <div className="h-3 w-28 shimmer rounded-md mb-5" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-36 shimmer rounded-xl" />
          <div className="space-y-2.5 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 shimmer rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`panel p-6 border-rose-500/20 flex flex-col justify-between h-full ${className}`}>
        <h3 className="text-sm font-bold text-white mb-3">Difficulty Split</h3>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-rose-400 mb-3">Unable to load difficulty data.</p>
          {onRetry && (
            <button onClick={onRetry} type="button" className="btn-ghost text-xs">
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
        glow: cfg.glow,
        text: cfg.text,
        dot: cfg.dot,
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
      className={`panel p-6 border-white/[0.08] relative overflow-hidden transition-all flex flex-col justify-between h-full ${className}`}
      style={{
        background: 'radial-gradient(ellipse 65% 55% at 90% 10%, rgba(245,158,11,0.06) 0%, transparent 60%), linear-gradient(180deg, rgba(22, 27, 39, 0.78) 0%, rgba(14, 17, 26, 0.88) 100%)',
      }}
    >
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="shrink-0 mb-3 sm:mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Difficulty Split</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-slate-400">
                Distribution
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Hover to inspect • Click row to filter problems
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.1] text-slate-300">
            {total} total
          </span>
        </div>
      </div>

      {/* ── Donut + Legend Grid + Readiness Bar ────────────────────── */}
      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-[#262320] rounded-xl p-4 my-auto">
          <p className="text-xs text-[#6B6560]">No problems cataloged yet.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-around py-1 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            {/* Donut Chart with ample clearance to prevent edge clipping */}
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
                      stroke="#0E121B"
                      strokeWidth={3}
                      onMouseEnter={(data) => setHoveredDiff(data.key)}
                      onMouseLeave={() => setHoveredDiff(null)}
                      onClick={(data) => handleDifficultyClick(data.key)}
                      className="cursor-pointer"
                    >
                      {pieData.map((entry) => {
                        const isHovered = hoveredDiff === entry.key;
                        const isDimmed = hoveredDiff && !isHovered;
                        return (
                          <Cell
                            key={`cell-${entry.key}`}
                            fill={entry.color}
                            opacity={isDimmed ? 0.35 : 1}
                            style={{
                              filter: isHovered ? `drop-shadow(0 0 8px ${entry.glow})` : 'none',
                              transition: 'all 0.2s ease-in-out',
                            }}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Dynamic Live Center Metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span
                    className={`text-3xl font-extrabold font-mono tracking-tight leading-none transition-all duration-200 ${
                      activeConfig ? activeConfig.text : 'text-white'
                    }`}
                    style={activeConfig ? { textShadow: `0 0 14px ${activeConfig.glow}` } : {}}
                  >
                    {activeCount}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1 font-semibold transition-all duration-200">
                    {activeConfig ? `${activeConfig.label} (${activePct}%)` : 'TOTAL'}
                  </span>
                </div>
              </div>

              {/* Interactive Clickable Difficulty Rows */}
              <div className="flex-1 w-full space-y-2">
                {DIFFICULTY_CONFIG.map(({ key, label, glow, text, dot }) => {
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-150 group text-left ${
                        isHovered
                          ? 'bg-white/[0.08] border-white/[0.2] shadow-lg shadow-black/40 translate-x-1'
                          : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform ${dot} ${
                            isHovered ? 'scale-125' : ''
                          }`}
                          style={{ boxShadow: `0 0 8px ${glow}` }}
                        />
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 font-mono text-xs">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`font-bold text-sm ${text}`}>{count}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({pct}%)</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-orange-400 transition-colors font-sans">
                          Filter ↗
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Interview Target Progress Bar ────────── */}
            <div className="pt-3.5 border-t border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-slate-400 font-medium">
                  Interview Readiness Split
                </span>
                <span className={`text-[11px] font-semibold ${medHardRatio >= 65 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {medHardRatio}% Med & Hard (Target ≥65%)
                </span>
              </div>

              {/* Segmented Proportional Bar */}
              <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/[0.08]">
                {easyPct > 0 && (
                  <div
                    style={{ width: `${easyPct}%` }}
                    className="h-full bg-emerald-400 rounded-l-full transition-all duration-500"
                    title={`Easy: ${easyPct}%`}
                  />
                )}
                {medPct > 0 && (
                  <div
                    style={{ width: `${medPct}%` }}
                    className={`h-full bg-amber-400 transition-all duration-500 ${
                      easyPct === 0 ? 'rounded-l-full' : ''
                    } ${hardPct === 0 ? 'rounded-r-full' : ''}`}
                    title={`Medium: ${medPct}%`}
                  />
                )}
                {hardPct > 0 && (
                  <div
                    style={{ width: `${hardPct}%` }}
                    className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                    title={`Hard: ${hardPct}%`}
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <span>Easy: {easyPct}%</span>
                <span>Medium: {medPct}%</span>
                <span>Hard: {hardPct}%</span>
              </div>
            </div>
          </div>
        )}

      {/* ── Footer Insight ──────────────────────────────────── */}
      {total > 0 && (
        <div className="mt-auto pt-3.5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${medHardRatio >= 65 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'}`} />
            <span className="text-slate-300">
              {medHardRatio >= 65
                ? 'Strong preparation ratio for technical interviews'
                : 'Prioritize Medium and Hard problems for rounds'}
            </span>
          </div>
          <span className="text-slate-500 text-[10px] self-end sm:self-auto shrink-0">FAANG Benchmark</span>
        </div>
      )}
    </div>
  );
};

export default DifficultyChart;
