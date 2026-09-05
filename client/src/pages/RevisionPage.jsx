import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchRevisionQueue } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';

const STATUS_BADGES = {
  solved: {
    label: 'Solved',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-800/70',
  },
  revisit_needed: {
    label: 'Revisit Needed',
    bg: 'bg-amber-950/60',
    text: 'text-amber-400',
    border: 'border-amber-800/70',
  },
  struggled: {
    label: 'Struggled',
    bg: 'bg-rose-950/60',
    text: 'text-rose-400',
    border: 'border-rose-800/70',
  },
};

const DIFFICULTY_BADGES = {
  easy: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40',
  medium: 'text-amber-400 border-amber-800/60 bg-amber-950/40',
  hard: 'text-rose-400 border-rose-800/60 bg-rose-950/40',
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  gfg: 'GeeksforGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'Other',
};

const RevisionPage = () => {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormula, setShowFormula] = useState(false);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchRevisionQueue();
      if (res?.success) {
        setQueue(res.data || []);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load revision queue.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Revision Queue</h1>
            <p className="text-sm text-slate-400 mt-1">
              Prioritized schedule for active recall based on time elapsed and past difficulty.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowFormula(!showFormula)}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-md transition-colors"
            >
              {showFormula ? 'Hide Details' : 'How Ranking Works'}
            </button>
          </div>
        </div>

        {/* Expandable Model Explanation */}
        {showFormula && (
          <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
                Deterministic Spaced Repetition Logic
              </span>
              <span className="text-slate-500 font-mono text-[10px]">No AI / Mathematical Weighting</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-emerald-400 text-xs border border-slate-800">
              priorityScore = (daysSinceLastAttempt / intervalForStatus) + struggleWeight
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400 text-[11px]">
              <div>
                <strong className="text-slate-200">Spacing Intervals:</strong>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 font-mono">
                  <li>Solved: 14 days</li>
                  <li>Revisit Needed: 5 days</li>
                  <li>Struggled: 2 days</li>
                </ul>
              </div>
              <div>
                <strong className="text-slate-200">Struggle Weights:</strong>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5 font-mono">
                  <li>Struggled: +2.0 (High urgency)</li>
                  <li>Revisit Needed: +1.0 (Medium urgency)</li>
                  <li>Solved: +0.0 (Standard cycle)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="h-4 w-48 bg-slate-800 rounded"></div>
                <div className="h-3 w-32 bg-slate-800/60 rounded"></div>
              </div>
              <div className="h-8 w-20 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Error State */}
      {error && !isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
          <p className="text-xs text-rose-400 mb-3">{error}</p>
          <button
            onClick={loadQueue}
            type="button"
            className="text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md border border-slate-700 transition-colors"
          >
            Retry Loading Queue
          </button>
        </div>
      )}

      {/* 4. Empty State */}
      {!isLoading && !error && queue.length === 0 && (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400 font-mono text-xs">
            0
          </div>
          <h2 className="text-base font-semibold text-slate-200">No problems due for revision</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Your revision queue is up to date! As you solve problems and log practice sessions, items will be scheduled here according to their spaced repetition intervals.
          </p>
          <div className="mt-5">
            <Link
              to="/problems"
              className="inline-flex items-center px-4 py-2 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
            >
              Browse Problem Bank &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* 5. Revision Queue List */}
      {!isLoading && !error && queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white font-mono">{queue.length}</strong> problems needing review
            </span>
            <span className="font-mono text-[11px] text-slate-500">Sorted by urgency score descending</span>
          </div>

          <div className="space-y-2.5">
            {queue.map((item, index) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_BADGES[statusKey] || STATUS_BADGES.revisit_needed;
              const diffClass = DIFFICULTY_BADGES[item.difficulty] || DIFFICULTY_BADGES.medium;
              const platformName = PLATFORM_LABELS[item.platform] || item.platform;

              return (
                <div
                  key={item.problemId}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-slate-500 text-xs">
                        #{index + 1}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${diffClass}`}
                      >
                        {item.difficulty}
                      </span>
                      <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        {platformName}
                      </span>
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors"
                      >
                        {item.title}
                      </Link>
                    </div>

                    {/* Topics */}
                    {item.topics && item.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {item.topics.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metrics & Action */}
                  <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right font-mono">
                      <div className="flex items-center space-x-1.5 sm:justify-end">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {item.daysSinceLastAttempt === 0
                          ? 'Attempted today'
                          : `${item.daysSinceLastAttempt}d ago`}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-center font-mono">
                        <span className="text-[10px] uppercase text-slate-500 block leading-tight">Score</span>
                        <span className="text-sm font-bold text-emerald-400 leading-tight">
                          {item.priorityScore}
                        </span>
                      </div>

                      <Link
                        to={`/problems/${item.problemId}`}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Solve</span>
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
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

export default RevisionPage;
