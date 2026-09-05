import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_BADGES = {
  solved: { label: 'Solved', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
  struggled: { label: 'Struggled', bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-800/60' },
  revisit_needed: { label: 'Revisit Needed', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
};

const DIFFICULTY_BADGES = {
  easy: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40',
  medium: 'text-amber-400 border-amber-800/60 bg-amber-950/40',
  hard: 'text-rose-400 border-rose-800/60 bg-rose-950/40',
};

const RevisionPreview = ({ queue = [], isLoading = false, error = null, onRetry }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-4 w-36 bg-slate-800 rounded"></div>
          <div className="h-4 w-20 bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-800/40 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-200">Revision Queue Preview</h3>
        <div className="h-44 flex flex-col items-center justify-center text-center p-4">
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

  const previewItems = queue.slice(0, 4);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-200">Recommended Revision</h3>
          <Link
            to="/revision"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center space-x-1"
          >
            <span>View all ({queue.length})</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Top problems scheduled for recall based on last outcome and elapsed interval.
        </p>

        {previewItems.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center border border-dashed border-slate-800/80 rounded-md p-4">
            <p className="text-xs text-slate-400 font-medium">No revision items due.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Problems with past attempts will be prioritized here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {previewItems.map((item) => {
              const statusCfg = STATUS_BADGES[item.lastAttemptStatus] || STATUS_BADGES.revisit_needed;
              const diffClass = DIFFICULTY_BADGES[item.difficulty] || DIFFICULTY_BADGES.medium;

              return (
                <Link
                  key={item.problemId}
                  to={`/problems/${item.problemId}`}
                  className="block p-3 rounded-md bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2 truncate">
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${diffClass}`}
                      >
                        {item.difficulty}
                      </span>
                      <span className="text-xs font-medium text-slate-200 hover:text-white truncate">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {item.daysSinceLastAttempt === 0
                        ? 'Attempted today'
                        : `${item.daysSinceLastAttempt}d since attempt`}
                    </span>
                    <span className="text-slate-300">
                      Priority: <strong className="text-white">{item.priorityScore}</strong>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {previewItems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
          <Link
            to="/revision"
            className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Open full revision queue &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

export default RevisionPreview;
