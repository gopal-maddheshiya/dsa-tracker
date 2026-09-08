import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
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
      <div style={{
        background: 'linear-gradient(135deg, #1C1A18 0%, #211F1D 100%)',
        border: '1px solid #3A3530',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.08)',
        backdropFilter: 'blur(8px)',
        minWidth: '130px',
      }}>
        <div style={{ color: '#6B6560', fontSize: '10px', marginBottom: '6px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
          {formatDate(label)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#F97316',
            boxShadow: '0 0 6px rgba(249,115,22,0.7)',
          }} />
          <span style={{ color: '#A8A29E', fontSize: '11px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Solved</span>
          <span style={{
            color: '#F97316', fontSize: '14px', fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            marginLeft: 'auto',
          }}>{payload[0].value}</span>
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
  const maxSolved = normalizedData.length > 0 ? Math.max(...normalizedData.map(d => d.solved)) : 0;
  const avgSolved = normalizedData.length > 0
    ? Math.round(totalSolvedInTrend / normalizedData.length)
    : 0;

  return (
    <div className="panel p-5" style={{ background: 'linear-gradient(160deg, #1C1A18 0%, #191715 100%)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F5F4] tracking-wide">Solve Velocity</h3>
          <p className="text-[11px] text-[#6B6560] mt-0.5 font-mono tracking-wide">Chronological solve trajectory</p>
        </div>
        <div className="flex items-center gap-3">
          {avgSolved > 0 && (
            <div className="text-right">
              <div className="text-[10px] text-[#6B6560] font-mono">avg/day</div>
              <div className="text-xs font-bold font-mono text-[#A8A29E]">{avgSolved}</div>
            </div>
          )}
          <div className="text-right">
            <div className="text-[10px] text-[#6B6560] font-mono">total</div>
            <div className="text-sm font-bold font-mono" style={{ color: '#F97316', textShadow: '0 0 12px rgba(249,115,22,0.4)' }}>
              {totalSolvedInTrend}
            </div>
          </div>
        </div>
      </div>

      {normalizedData.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-[#2E2A27] rounded-xl">
          <svg className="w-8 h-8 text-[#3A3530] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-xs text-[#6B6560]">No solved attempts logged yet.</p>
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={normalizedData} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
              <defs>
                {/* Primary orange glow gradient */}
                <linearGradient id="solveGradPremium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.45} />
                  <stop offset="40%" stopColor="#F97316" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0.01} />
                </linearGradient>
                {/* Stroke glow filter */}
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid
                strokeDasharray="2 4"
                stroke="#262320"
                vertical={false}
                strokeOpacity={0.6}
              />

              {/* Average reference line */}
              {avgSolved > 0 && (
                <ReferenceLine
                  y={avgSolved}
                  stroke="#3A3530"
                  strokeDasharray="4 3"
                  strokeWidth={1}
                />
              )}

              <XAxis
                dataKey="date"
                stroke="transparent"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
                dy={8}
                tick={{ fill: '#6B6560', fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="transparent"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fill: '#6B6560', fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: '#3A3530',
                  strokeWidth: 1,
                  strokeDasharray: '4 3',
                }}
              />

              <Area
                type="monotoneX"
                dataKey="solved"
                stroke="#F97316"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#solveGradPremium)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: '#F97316',
                  stroke: '#1C1A18',
                  strokeWidth: 2.5,
                  filter: 'url(#lineGlow)',
                }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.3))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer legend */}
      {normalizedData.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#262320]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #F97316, #FB923C)' }} />
            <span className="text-[10px] text-[#6B6560] font-mono">solve count</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 border-t border-dashed border-[#3A3530]" />
            <span className="text-[10px] text-[#6B6560] font-mono">avg baseline</span>
          </div>
          {maxSolved > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#6B6560] font-mono">peak</span>
              <span className="text-[10px] font-bold font-mono" style={{ color: '#FB923C' }}>{maxSolved}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SolveTrendChart;
