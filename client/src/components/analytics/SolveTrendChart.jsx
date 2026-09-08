import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;
  }
  return dateStr;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1C1A18] border border-[#2E2A27] rounded-lg p-2.5 shadow-xl text-xs">
        <div className="text-[#78716C] text-[10px] mb-1 font-mono">{formatDate(label)}</div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F97316] inline-block" />
          <span className="text-[#A8A29E]">Solved:</span>
          <span className="text-[#F5F5F4] font-mono font-bold">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const SolveTrendChart = ({ trendData = [], isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="panel p-5 animate-pulse">
        <div className="flex justify-between mb-4">
          <div><div className="h-4 w-28 shimmer rounded-md mb-2" /><div className="h-3 w-44 shimmer rounded-md" /></div>
          <div className="h-6 w-20 shimmer rounded-full" />
        </div>
        <div className="h-44 shimmer rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F4] mb-3">Solve Velocity</h3>
        <div className="h-44 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-rose-400 mb-3">Unable to load trend data.</p>
          {onRetry && <button onClick={onRetry} type="button" className="btn-ghost">Retry</button>}
        </div>
      </div>
    );
  }

  const normalizedData = trendData.map((item) => ({
    date: item.date,
    solved: Number(item.solved !== undefined ? item.solved : (item.solvedCount ?? 0)),
  }));
  const totalSolvedInTrend = normalizedData.reduce((acc, curr) => acc + curr.solved, 0);

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F5F4]">Solve Velocity</h3>
          <p className="text-xs text-[#78716C] mt-0.5">Chronological solve trajectory</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="section-label">Period total</span>
          <span className="text-sm font-bold font-mono text-[#F97316]">{totalSolvedInTrend}</span>
        </div>
      </div>

      {normalizedData.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-[#2E2A27] rounded-xl">
          <p className="text-xs text-[#78716C]">No solved attempts logged yet.</p>
        </div>
      ) : (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={normalizedData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="solveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262320" vertical={false} />
              <XAxis dataKey="date" stroke="#2E2A27" fontSize={10} tickLine={false} axisLine={false}
                tickFormatter={formatDate} dy={6} tick={{ fill: '#78716C' }} />
              <YAxis stroke="#2E2A27" fontSize={10} tickLine={false} axisLine={false}
                allowDecimals={false} tick={{ fill: '#78716C' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="solved" stroke="#F97316" strokeWidth={2}
                fillOpacity={1} fill="url(#solveGrad)" dot={false}
                activeDot={{ r: 4, fill: '#FB923C', stroke: '#1C1A18', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SolveTrendChart;
