import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    return `${month} ${parseInt(parts[2], 10)}`;
  }
  return dateStr;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-md p-2.5 shadow-xl text-xs font-mono">
        <div className="text-slate-400 mb-1">{formatDate(label)}</div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
          <span className="font-sans text-slate-200">Solved:</span>
          <span className="text-white font-bold">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const SolveTrendChart = ({ trendData = [], isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-4 w-32 bg-slate-800 rounded"></div>
          <div className="h-4 w-20 bg-slate-800 rounded"></div>
        </div>
        <div className="h-48 bg-slate-800/40 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-200">Solve Velocity Trend</h3>
        <div className="h-48 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-rose-400 mb-2">Unable to load trend data.</p>
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

  const totalSolvedInTrend = trendData.reduce((acc, curr) => acc + (curr.solvedCount || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Solve Velocity Trend</h3>
          <p className="text-xs text-slate-400">Chronological history of successful solves</p>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded font-medium">
          {totalSolvedInTrend} total solved
        </span>
      </div>

      {trendData.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-center border border-dashed border-slate-800/80 rounded-md p-4">
          <p className="text-xs text-slate-400 font-medium">No solved attempts logged yet.</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Your daily solve count will plot chronologically as problems are solved.
          </p>
        </div>
      ) : (
        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatDate}
                dy={6}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="solvedCount"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSolved)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SolveTrendChart;
