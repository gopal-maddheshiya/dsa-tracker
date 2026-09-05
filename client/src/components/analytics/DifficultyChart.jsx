import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DIFFICULTY_CONFIG = [
  { key: 'easy', label: 'Easy', color: '#10b981', border: 'border-emerald-500/40', text: 'text-emerald-400' },
  { key: 'medium', label: 'Medium', color: '#f59e0b', border: 'border-amber-500/40', text: 'text-amber-400' },
  { key: 'hard', label: 'Hard', color: '#ef4444', border: 'border-rose-500/40', text: 'text-rose-400' },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-md p-2.5 shadow-lg text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ backgroundColor: data.payload.color }}
          ></span>
          <span className="font-sans font-medium text-slate-200 capitalize">
            {data.name}
          </span>
          <span className="text-white font-bold">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const DifficultyChart = ({ breakdown = {}, isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 animate-pulse">
        <div className="h-4 w-36 bg-slate-800 rounded mb-4"></div>
        <div className="h-44 bg-slate-800/40 rounded flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-4 border-slate-800"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-200">Difficulty Distribution</h3>
        <div className="h-44 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-rose-400 mb-2">Unable to load difficulty breakdown.</p>
          {onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const easyCount = Number(breakdown.easy) || 0;
  const mediumCount = Number(breakdown.medium) || 0;
  const hardCount = Number(breakdown.hard) || 0;
  const total = easyCount + mediumCount + hardCount;

  const data = [
    { name: 'Easy', value: easyCount, color: '#10b981' },
    { name: 'Medium', value: mediumCount, color: '#f59e0b' },
    { name: 'Hard', value: hardCount, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Difficulty Distribution</h3>
          <p className="text-xs text-slate-400">Categorization across solved and tracked problems</p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {total} total
        </span>
      </div>

      {total === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-slate-800/80 rounded-md p-4">
          <p className="text-xs text-slate-400 font-medium">No problems tracked yet.</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Difficulty distribution will populate automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-1">
          <div className="h-40 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={data.length > 1 ? 3 : 0}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold font-mono text-white leading-none">
                {total}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                Problems
              </span>
            </div>
          </div>

          {/* Textual legend with counts and percentages for accessibility */}
          <div className="space-y-2 text-xs">
            {DIFFICULTY_CONFIG.map(({ key, label, color, text }) => {
              const count = Number(breakdown[key]) || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="font-medium text-slate-300">{label}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className={`font-semibold ${text}`}>{count}</span>
                    <span className="text-slate-400 text-[11px]">({pct}%)</span>
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
