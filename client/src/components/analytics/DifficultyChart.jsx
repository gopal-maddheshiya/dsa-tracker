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

const DifficultyChart = ({ breakdown = {}, isLoading = false, error = null, onRetry }) => {
  const navigate = useNavigate();
  const [hoveredDiff, setHoveredDiff] = useState(null);

  if (isLoading) {
    return (
      <div className="panel p-6 animate-pulse border-[#262320]">
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
      <div className="panel p-6 border-rose-500/20">
        <h3 className="text-sm font-bold text-[#F5F5F4] mb-3">Difficulty Split</h3>
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
      const val = counts[cfg.key] || 0;
      const pct = total > 0 ? Math.round((val / total) * 100) : 0;
      return {
        key: cfg.key,
        name: cfg.label,
        value: val,
        pct,
        color: cfg.color,
        glow: cfg.glow,
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
      className="panel p-6 border-[#262320] relative overflow-hidden transition-all flex flex-col justify-between"
      style={{
        background: 'radial-gradient(ellipse 65% 55% at 90% 10%, rgba(245,158,11,0.06) 0%, transparent 60%), linear-gradient(180deg, #171614 0%, #131211 100%)',
      }}
    >
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F5F5F4] tracking-tight">Difficulty Split</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#141312] border border-[#262320] text-[#A8A29E]">
                Distribution
              </span>
            </div>
            <p className="text-xs text-[#6B6560] mt-1 font-mono">
              Hover to inspect • Click row to filter problems
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#141312] border border-[#262320] text-[#A8A29E]">
            {total} total
          </span>
        </div>

        {/* ── Donut + Legend Grid ───────────────────────────────────── */}
        {total === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-[#262320] rounded-xl p-4">
            <p className="text-xs text-[#6B6560]">No problems cataloged yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-5">
              {/* Clean Donut Chart (NO floating Tooltip box to prevent overlapping with center text) */}
              <div className="sm:col-span-2 relative flex items-center justify-center h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/* Tooltip removed intentionally: Center hole serves as the dynamic indicator */}
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={74}
                      paddingAngle={3}
                      stroke="#171614"
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
                              filter: isHovered ? `drop-shadow(0 0 10px ${entry.glow})` : 'none',
                              transition: 'all 0.2s ease-in-out',
                            }}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Dynamic Live Center Metric (Unobstructed & Clean) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span
                    className={`text-3xl font-extrabold font-mono tracking-tight leading-none transition-all duration-200 ${
                      activeConfig ? activeConfig.text : 'text-[#F5F5F4]'
                    }`}
                    style={activeConfig ? { textShadow: `0 0 14px ${activeConfig.glow}` } : {}}
                  >
                    {activeCount}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C847E] mt-1 font-semibold transition-all duration-200">
                    {activeConfig ? `${activeConfig.label} (${activePct}%)` : 'TOTAL'}
                  </span>
                </div>
              </div>

              {/* Interactive Clickable Difficulty Rows */}
              <div className="sm:col-span-3 space-y-2">
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-150 group text-left ${
                        isHovered
                          ? 'bg-[#211F1D] border-[#3E3834] shadow-md shadow-black/40 translate-x-1'
                          : 'bg-[#141312] border-[#262320] hover:border-[#332E2A] hover:bg-[#1A1816]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform ${dot} ${
                            isHovered ? 'scale-125' : ''
                          }`}
                          style={{ boxShadow: `0 0 8px ${glow}` }}
                        />
                        <span className="text-xs font-semibold text-[#F5F5F4] group-hover:text-white transition-colors">
                          {label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 font-mono text-xs">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`font-bold text-sm ${text}`}>{count}</span>
                          <span className="text-[#6B6560] font-mono text-[11px]">({pct}%)</span>
                        </div>
                        <span className="text-[10px] text-[#6B6560] group-hover:text-[#F97316] transition-colors font-sans">
                          Filter ↗
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Interview Target vs Actual Comparison Section ────────── */}
            <div className="pt-3 border-t border-[#262320] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[#A8A29E] font-medium">
                  Interview Readiness Split
                </span>
                <span className="text-[11px] font-mono font-semibold text-amber-400">
                  {medHardRatio}% Med & Hard (Target ≥65%)
                </span>
              </div>

              {/* Proportional Segmented Bar */}
              <div className="h-2 w-full bg-[#11100F] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-[#262320]">
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

              {/* 3 Proportional Target Comparison Tiles */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-[#141312] border border-[#262320] text-center">
                  <span className="text-[10px] font-mono text-[#6B6560] block">EASY</span>
                  <span className="text-xs font-bold font-mono text-emerald-400 mt-0.5 block">
                    {easyPct}%
                  </span>
                  <span className="text-[10px] font-mono text-[#8C847E] block mt-0.5">
                    Target: 30%
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#141312] border border-[#262320] text-center">
                  <span className="text-[10px] font-mono text-[#6B6560] block">MEDIUM</span>
                  <span className="text-xs font-bold font-mono text-amber-400 mt-0.5 block">
                    {medPct}%
                  </span>
                  <span className="text-[10px] font-mono text-[#8C847E] block mt-0.5">
                    Target: 50%
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#141312] border border-[#262320] text-center">
                  <span className="text-[10px] font-mono text-[#6B6560] block">HARD</span>
                  <span className="text-xs font-bold font-mono text-rose-400 mt-0.5 block">
                    {hardPct}%
                  </span>
                  <span className="text-[10px] font-mono text-[#8C847E] block mt-0.5">
                    Target: 20%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer Takeaway Strip ──────────────────────────────────── */}
      {total > 0 && (
        <div className="mt-4 pt-3 border-t border-[#262320] flex items-center justify-between text-[11px] font-mono text-[#6B6560]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span className="text-[#A8A29E]">
              {medHardRatio >= 65
                ? 'Strong preparation ratio for technical rounds'
                : 'Prioritize Medium and Hard problems for interviews'}
            </span>
          </div>
          <span className="text-[#6B6560]">FAANG Standard</span>
        </div>
      )}
    </div>
  );
};

export default DifficultyChart;
