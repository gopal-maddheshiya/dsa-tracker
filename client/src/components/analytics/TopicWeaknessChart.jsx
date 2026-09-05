import React from 'react';

/**
 * Visualizes topic weakness based on struggle ratio.
 * Higher struggle ratio indicates greater revision urgency.
 */
const TopicWeaknessChart = ({ topics = [], isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 animate-pulse">
        <div className="h-4 w-40 bg-slate-800 rounded mb-2"></div>
        <div className="h-3 w-64 bg-slate-800/60 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-slate-800 rounded"></div>
                <div className="h-3 w-12 bg-slate-800 rounded"></div>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-200">Topic Weakness Ranking</h3>
        <div className="h-56 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-rose-400 mb-2">Unable to load topic analytics.</p>
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

  // Display top 6 most relevant topics
  const displayTopics = topics.slice(0, 6);
  const highestStruggleTopic = topics.length > 0 && topics[0].struggleRatio > 0 ? topics[0] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-200">Topic Weakness Ranking</h3>
          <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-750">
            Struggle Ratio
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Ranked by proportion of practice attempts resulting in struggled status.
        </p>

        {displayTopics.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center border border-dashed border-slate-800/80 rounded-md p-4">
            <p className="text-xs text-slate-400 font-medium">No practice attempts recorded yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Topic weakness will update automatically as you log attempts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayTopics.map((item) => {
              const ratioPct = Math.round(item.struggleRatio * 100);
              // Dynamic color based on severity
              const barColor =
                ratioPct >= 50
                  ? 'bg-rose-500'
                  : ratioPct >= 25
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';
              const textColor =
                ratioPct >= 50
                  ? 'text-rose-400'
                  : ratioPct >= 25
                  ? 'text-amber-400'
                  : 'text-emerald-400';

              return (
                <div key={item.topic} className="group">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="font-mono text-slate-400 text-[11px] w-4 shrink-0">
                        #{item.weaknessRank}
                      </span>
                      <span className="font-medium text-slate-200 truncate">
                        {item.topic}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0 font-mono text-[11px]">
                      <span className="text-slate-400">
                        {item.struggledAttempts}/{item.totalAttempts} struggled
                      </span>
                      <span className={`font-semibold ${textColor}`}>
                        {ratioPct}%
                      </span>
                    </div>
                  </div>
                  {/* Visual Bar */}
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                      style={{ width: `${Math.max(ratioPct, 2)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contextual Weakness Insight Box */}
      {highestStruggleTopic && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-start space-x-3 bg-slate-950/40 p-3 rounded-md border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
          <div className="text-xs">
            <span className="font-semibold text-slate-300">Highest Struggle Area: </span>
            <span className="text-white font-medium">{highestStruggleTopic.topic}</span>
            <p className="text-slate-400 mt-0.5">
              {highestStruggleTopic.struggledAttempts} of {highestStruggleTopic.totalAttempts} recorded attempts resulted in struggled status ({Math.round(highestStruggleTopic.struggleRatio * 100)}% ratio).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicWeaknessChart;
