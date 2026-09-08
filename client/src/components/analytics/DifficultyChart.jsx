import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DIFFICULTY_CONFIG = [
  { key: 'easy', label: 'Easy', color: '#10B981', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  { key: 'medium', label: 'Medium', color: '#F59E0B', text: 'text-amber-400', dot: 'bg-amber-400' },
  { key: 'hard', label: 'Hard', color: '#EF4444', text: 'text-red-400', dot: 'bg-red-400' },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#1C1A18] border border-[#2E2A27] rounded-xl p-3 shadow-2xl text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" style={{ backgroundColor: data.payload.color }} />
          <span className="text-[#A8A29E] font-medium capitalize">{data.name}:</span>
          <span className="text-[#F5F5F4] font-mono font-bold text-sm">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const DifficultyChart = ({ breakdown = {}, isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="panel p-6 animate-pulse">
        <div className="h-4 w-36 shimmer rounded-md mb-2" />
        <div className="h-3 w-28 shimmer rounded-md mb-5" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-36 shimmer rounded-xl" />
          <div className="space-y-2.5 pt-2">
            {[1,2,3].map(i => <div key={i} className="h-10 shimmer rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-6">
        <h3 className="text-sm font-semibold text-[#F5F5F4] mb-3">Difficulty Split</h3>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-red-400 mb-3">Unable to load difficulty data.</p>
          {onRetry && <button onClick={onRetry} type="button" className="btn-ghost">Retry</button>}
        </div>
      </div>
    );
  }

  const counts = { easy: 0, medium: 0, hard: 0 };
  if (Array.isArray(breakdown)) {
    breakdown.forEach((item) => {
      if (item?.difficulty && counts[item.difficulty] !== undefined)
        counts[item.difficulty] = Number(item.count) || 0;
    });
  } else if (breakdown && typeof breakdown === 'object') {
    counts.easy = Number(breakdown.easy) || 0;
    counts.medium = Number(breakdown.medium) || 0;
    counts.hard = Number(breakdown.hard) || 0;
  }

  const total = counts.easy + counts.medium + counts.hard;
  const pieData = DIFFICULTY_CONFIG
    .map(({ key, label, color }) => ({ name: label, value: counts[key], color }))
    .filter(item => item.value > 0);

  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F5F4] tracking-tight">Difficulty Split</h3>
          <p className="text-xs text-[#78716C] mt-0.5">Problem difficulty distribution</p>
        </div>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-[#141312] border border-[#2E2A27] text-[#A8A29E]">
          {total} total
        </span>
      </div>

      {total === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-[#2E2A27] rounded-xl p-4">
          <p className="text-xs text-[#78716C]">No problems cataloged yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-6">
          <div className="sm:col-span-2 relative flex items-center justify-center h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie data={pieData} dataKey="value" nameKey="name"
                  innerRadius={44} outerRadius={64}
                  paddingAngle={pieData.length > 1 ? 4 : 0} stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-[#F5F5F4] tracking-tight leading-none">{total}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mt-1">Total</span>
            </div>
          </div>

          <div className="sm:col-span-3 space-y-2.5">
            {DIFFICULTY_CONFIG.map(({ key, label, color, text, dot }) => {
              const count = counts[key] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#141312] border border-[#2E2A27] hover:border-[#3E3834] hover:bg-[#211F1D] transition-all duration-150">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} style={{ boxShadow: `0 0 8px ${color}55` }} />
                    <span className="text-xs font-medium text-[#F5F5F4]">{label}</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-mono text-xs">
                    <span className={`font-bold text-sm ${text}`}>{count}</span>
                    <span className="text-[#78716C] font-mono text-[11px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DifficultyChart;
