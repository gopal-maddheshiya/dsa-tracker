import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DIFFICULTY_CONFIG = [
  { key: 'easy', label: 'Easy', color: '#F97316', text: 'text-[#F97316]' },
  { key: 'medium', label: 'Medium', color: '#f59e0b', text: 'text-amber-400' },
  { key: 'hard', label: 'Hard', color: '#f43f5e', text: 'text-rose-400' },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#1C1A18] border border-[#2E2A27] rounded-lg p-2.5 shadow-xl text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: data.payload.color }} />
          <span className="text-[#A8A29E] capitalize">{data.name}:</span>
          <span className="text-[#F5F5F4] font-mono font-bold">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const DifficultyChart = ({ breakdown = {}, isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="panel p-5 animate-pulse">
        <div className="h-4 w-36 shimmer rounded-md mb-2" />
        <div className="h-3 w-28 shimmer rounded-md mb-5" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-36 shimmer rounded-xl" />
          <div className="space-y-2.5 pt-2">
            {[1,2,3].map(i => <div key={i} className="h-9 shimmer rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F4] mb-3">Difficulty Split</h3>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-rose-400 mb-3">Unable to load difficulty data.</p>
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
    <div className="panel p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F5F4]">Difficulty Split</h3>
          <p className="text-xs text-[#78716C] mt-0.5">Problem difficulty distribution</p>
        </div>
        <span className="text-sm font-bold font-mono text-[#A8A29E]">{total}</span>
      </div>

      {total === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-[#2E2A27] rounded-xl p-4">
          <p className="text-xs text-[#78716C]">No problems cataloged yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-4">
          <div className="sm:col-span-2 relative flex items-center justify-center h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie data={pieData} dataKey="value" nameKey="name"
                  innerRadius={38} outerRadius={56}
                  paddingAngle={pieData.length > 1 ? 3 : 0} stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold font-mono text-[#F5F5F4] leading-none">{total}</span>
              <span className="text-[10px] text-[#78716C] mt-0.5">Total</span>
            </div>
          </div>

          <div className="sm:col-span-3 space-y-2">
            {DIFFICULTY_CONFIG.map(({ key, label, color, text }) => {
              const count = counts[key] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-[#141312] border border-[#2E2A27]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs text-[#F5F5F4]">{label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={`font-semibold ${text}`}>{count}</span>
                    <span className="text-[#78716C]">({pct}%)</span>
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
