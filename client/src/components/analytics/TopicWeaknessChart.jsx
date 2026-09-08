import React from 'react';

const TopicWeaknessChart = ({ topics = [], isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="panel p-6 animate-pulse">
        <div className="h-4 w-36 shimmer rounded-md mb-2" />
        <div className="h-3 w-52 shimmer rounded-md mb-6" />
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-28 shimmer rounded-md" />
                <div className="h-3 w-10 shimmer rounded-md" />
              </div>
              <div className="h-1.5 w-full shimmer rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-6">
        <h3 className="text-sm font-semibold text-[#F5F5F4] mb-3">Topic Weakness</h3>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-red-400 mb-3">Unable to load topic analytics.</p>
          {onRetry && <button onClick={onRetry} type="button" className="btn-ghost">Retry</button>}
        </div>
      </div>
    );
  }

  const displayTopics = topics.slice(0, 6);

  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F5F4] tracking-tight">Topic Weakness</h3>
          <p className="text-xs text-[#78716C] mt-0.5">Ranked by struggle ratio</p>
        </div>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-[#141312] border border-[#2E2A27] text-[#A8A29E]">
          Struggle %
        </span>
      </div>

      {displayTopics.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-[#2E2A27] rounded-xl p-4">
          <p className="text-xs text-[#78716C]">No practice attempts recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayTopics.map((item, idx) => {
            const ratioPct = Math.round(item.struggleRatio * 100);
            const isHigh = ratioPct >= 60;
            const isMid = ratioPct >= 35 && !isHigh;

            const barColor = isHigh ? 'bg-red-500' : isMid ? 'bg-amber-500' : 'bg-emerald-500';
            const badgeStyle = isHigh
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : isMid
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

            return (
              <div key={item.topic} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[11px] text-[#78716C] shrink-0 w-4">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[#F5F5F4] font-medium truncate group-hover:text-white transition-colors">
                      {item.topic}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] ml-2">
                    <span className="text-[#A8A29E] font-medium">
                      {item.struggledAttempts} <span className="text-[#78716C]">/</span> {item.totalAttempts}
                    </span>
                    <span className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border ${badgeStyle} min-w-[38px] text-center`}>
                      {ratioPct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-[#141312] rounded-full overflow-hidden border border-[#2E2A27]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{
                      width: `${Math.max(ratioPct, 3)}%`,
                      boxShadow: isHigh ? '0 0 8px rgba(239, 68, 68, 0.4)' : isMid ? '0 0 8px rgba(245, 158, 11, 0.3)' : 'none',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {topics.length > 0 && topics[0].struggleRatio > 0 && (
        <div className="mt-5 pt-4 border-t border-[#2E2A27] flex items-start gap-2.5">
          <span className="relative flex h-2 w-2 mt-1 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <p className="text-xs text-[#A8A29E] leading-relaxed">
            <span className="text-[#F5F5F4] font-semibold">{topics[0].topic}</span>
            {' '}has your highest struggle rate at{' '}
            <span className="text-red-400 font-mono font-bold">{Math.round(topics[0].struggleRatio * 100)}%</span>
            {' '}over {topics[0].totalAttempts} sessions logged.
          </p>
        </div>
      )}
    </div>
  );
};

export default TopicWeaknessChart;
