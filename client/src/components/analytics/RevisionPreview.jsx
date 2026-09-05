import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  struggled: { label: 'Struggled', badge: 'text-rose-400 bg-rose-950/40 border-rose-900/60', dot: 'bg-rose-500' },
  revisit_needed: { label: 'Revisit', badge: 'text-amber-400 bg-amber-950/40 border-amber-900/60', dot: 'bg-amber-500' },
  solved: { label: 'Solved', badge: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60', dot: 'bg-emerald-500' },
};

const DIFFICULTY_COLOR = {
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  hard: 'text-rose-400',
};

const RevisionPreview = ({ queue = [], isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg p-4 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-4 w-36 bg-slate-800 rounded"></div>
          <div className="h-4 w-20 bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-800/40 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg p-5">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">Revision Queue</h3>
        <div className="h-36 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-rose-400 mb-2">Unable to load revision recommendations.</p>
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

  const previewItems = queue.slice(0, 5);

  return (
    <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                Priority Revision
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded">
                {queue.length} due
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ranked recall based on elapsed days & struggle weight.
            </p>
          </div>

          <Link
            to="/revision"
            className="text-xs font-medium text-slate-300 hover:text-white transition-colors inline-flex items-center space-x-1"
          >
            <span>Open queue</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {previewItems.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400">No revision items due right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40 mt-1">
            {previewItems.map((item, idx) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diffColor = DIFFICULTY_COLOR[item.difficulty] || 'text-slate-400';

              return (
                <Link
                  key={item.problemId}
                  to={`/problems/${item.problemId}`}
                  className="py-2.5 px-1.5 flex items-center justify-between gap-3 hover:bg-slate-900/50 rounded transition-colors group text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <span className="font-mono text-slate-500 text-[11px] shrink-0">#{idx + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-200 font-medium group-hover:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center space-x-2">
                        <span className={`capitalize ${diffColor}`}>{item.difficulty}</span>
                        <span>&bull;</span>
                        <span>{item.daysSinceLastAttempt}d elapsed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${statusCfg.badge}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${statusCfg.dot}`}></span>
                      <span>{statusCfg.label}</span>
                    </span>

                    <div className="text-right font-mono min-w-[36px]">
                      <span className="text-xs font-semibold text-white">{item.priorityScore.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {previewItems.length > 0 && (
        <div className="pt-2.5 mt-2 border-t border-slate-800/60 text-right">
          <Link
            to="/revision"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center space-x-1"
          >
            <span>View all {queue.length} problems in queue &rarr;</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RevisionPreview;

