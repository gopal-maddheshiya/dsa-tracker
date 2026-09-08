import React from 'react';

const TopicWeaknessChart = ({ topics = [], isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="panel p-5 animate-pulse">
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
      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-[#F5F5F4] mb-3">Topic Weakness</h3>
        <div className="h-48 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-rose-400 mb-3">Unable to load topic analytics.</p>
          {onRetry && <button onClick={onRetry} type="button" className="btn-ghost">Retry</button>}
        </div>
      </div>
    );
  }

  const displayTopics = topics.slice(0, 6);

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F5F5F4]">Topic Weakness</h3>
          <p className="text-xs text-[#78716C] mt-0.5">Ranked by struggle ratio</p>
        </div>
        <span className="section-label mt-1">Struggle %</span>
      </div>

      {displayTopics.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center border border-dashed border-[#2E2A27] rounded-xl p-4">
          <p className="text-xs text-[#78716C]">No practice attempts recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayTopics.map((item, idx) => {
            const ratioPct = Math.round(item.struggleRatio * 100);
            const barColor = ratioPct >= 60 ? 'bg-rose-500' : ratioPct >= 35 ? 'bg-amber-500' : 'bg-[#F97316]';
            const textColor = ratioPct >= 60 ? 'text-rose-400' : ratioPct >= 35 ? 'text-amber-400' : 'text-[#F97316]';
            return (
              <div key={item.topic}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-[#78716C] shrink-0 w-4">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[#F5F5F4] font-medium truncate">{item.topic}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] ml-2">
                    <span className="text-[#78716C]">{item.struggledAttempts}/{item.totalAttempts}</span>
                    <span className={`font-bold w-8 text-right ${textColor}`}>{ratioPct}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${barColor}`} style={{ width: `${Math.max(ratioPct, 3)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {topics.length > 0 && topics[0].struggleRatio > 0 && (
        <div className="mt-5 pt-4 border-t border-[#2E2A27] flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
          <p className="text-[11px] text-[#78716C]">
            <span className="text-[#A8A29E] font-medium">{topics[0].topic}</span>
            {' '}has your highest struggle rate at{' '}
            <span className="text-rose-400 font-mono">{Math.round(topics[0].struggleRatio * 100)}%</span>
            {' '}over {topics[0].totalAttempts} attempts.
          </p>
        </div>
      )}
    </div>
  );
};

export default TopicWeaknessChart;
