import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchRevisionQueue } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';

const STATUS_CONFIG = {
  struggled: {
    label: 'Struggled',
    badge: 'text-rose-400 bg-rose-950/40 border-rose-900/60',
    dot: 'bg-rose-500',
    intervalDays: 2,
  },
  revisit_needed: {
    label: 'Revisit Needed',
    badge: 'text-amber-400 bg-amber-950/40 border-amber-900/60',
    dot: 'bg-amber-500',
    intervalDays: 5,
  },
  solved: {
    label: 'Solved',
    badge: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60',
    dot: 'bg-emerald-500',
    intervalDays: 14,
  },
};

const DIFFICULTY_CONFIG = {
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  hard: 'text-rose-400',
};

const PLATFORM_NAMES = {
  leetcode: 'LeetCode',
  gfg: 'GeeksforGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'External',
};

const getDueExplanation = (status, days) => {
  const formattedDays = days === 0 ? 'Today' : `${days}d`;
  if (status === 'struggled') {
    return `${formattedDays} elapsed (2d struggle cycle)`;
  }
  if (status === 'revisit_needed') {
    return `${formattedDays} elapsed (5d revisit cycle)`;
  }
  return `${formattedDays} elapsed (14d solved cycle)`;
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

  // Context summary metrics calculated directly from queue data
  const summaryMetrics = useMemo(() => {
    let struggled = 0;
    let revisit = 0;
    let solved = 0;

    queue.forEach((item) => {
      const st = item.latestStatus || item.lastAttemptStatus;
      if (st === 'struggled') struggled++;
      else if (st === 'revisit_needed') revisit++;
      else if (st === 'solved') solved++;
    });

    return {
      total: queue.length,
      struggled,
      revisit,
      solved,
    };
  }, [queue]);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* 1. Page Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold tracking-tight text-white">Revision Queue</h1>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                {queue.length} due
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active recall schedule prioritized by elapsed days and struggle weight.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded transition-colors self-start sm:self-auto inline-flex items-center space-x-1.5"
          >
            <span>{showFormula ? 'Hide formula' : 'How prioritization works'}</span>
            <span className="text-slate-500 font-sans">{showFormula ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Expandable Model Explanation */}
        {showFormula && (
          <div className="mt-4 p-4 rounded-lg bg-[#0d121f] border border-slate-800 text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-200 text-xs font-medium">
                Deterministic Spaced Repetition Formula
              </span>
              <span className="text-slate-500 text-[11px] font-mono">100% Explainable &bull; Sub-millisecond Execution</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-emerald-400 text-xs border border-slate-800/80 overflow-x-auto">
              priorityScore = (daysSinceLastAttempt / intervalForStatus) + struggleWeight
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] pt-1">
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
                <span className="text-slate-200 font-medium block mb-1 font-mono">Intervals by Status</span>
                <div className="space-y-1 font-mono text-slate-400 text-[11px]">
                  <div className="flex justify-between"><span>Struggled:</span><span className="text-rose-400">2 days</span></div>
                  <div className="flex justify-between"><span>Revisit Needed:</span><span className="text-amber-400">5 days</span></div>
                  <div className="flex justify-between"><span>Solved:</span><span className="text-emerald-400">14 days</span></div>
                </div>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
                <span className="text-slate-200 font-medium block mb-1 font-mono">Struggle Weights</span>
                <div className="space-y-1 font-mono text-slate-400 text-[11px]">
                  <div className="flex justify-between"><span>Struggled:</span><span className="text-rose-400">+2.0 urgency</span></div>
                  <div className="flex justify-between"><span>Revisit Needed:</span><span className="text-amber-400">+1.0 urgency</span></div>
                  <div className="flex justify-between"><span>Solved:</span><span className="text-slate-300">+0.0 standard</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Priority Summary Strip */}
      {!isLoading && !error && queue.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#0d121f] border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">Due Now</span>
              <span className="text-lg font-bold text-white font-mono">{summaryMetrics.total}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Total queue</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0d121f] border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-rose-400/90 uppercase tracking-wider block font-mono">Struggled</span>
              <span className="text-lg font-bold text-rose-400 font-mono">{summaryMetrics.struggled}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">2d interval</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0d121f] border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-400/90 uppercase tracking-wider block font-mono">Revisit</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{summaryMetrics.revisit}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">5d interval</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0d121f] border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-400/90 uppercase tracking-wider block font-mono">Overdue Solved</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{summaryMetrics.solved}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">14d interval</span>
          </div>
        </div>
      )}

      {/* 3. Loading State */}
      {isLoading && (
        <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg divide-y divide-slate-800/50">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="h-4 w-52 bg-slate-800/80 rounded"></div>
                <div className="h-3 w-32 bg-slate-800/40 rounded"></div>
              </div>
              <div className="h-7 w-20 bg-slate-800/60 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Error State */}
      {error && !isLoading && (
        <div className="bg-[#0d121f] border border-slate-800 rounded-lg p-8 text-center">
          <p className="text-xs text-rose-400 mb-3">{error}</p>
          <button
            onClick={loadQueue}
            type="button"
            className="text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 transition-colors"
          >
            Retry Loading Queue
          </button>
        </div>
      )}

      {/* 5. Empty State */}
      {!isLoading && !error && queue.length === 0 && (
        <div className="bg-[#0d121f] border border-dashed border-slate-800 rounded-xl p-12 text-center max-w-md mx-auto">
          <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400 font-mono text-xs">
            0
          </div>
          <h2 className="text-sm font-semibold text-slate-200">No problems currently due for revision</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Your revision queue is clear! As you log practice sessions, problems will automatically enter the spaced repetition queue according to their outcome.
          </p>
          <div className="mt-5">
            <Link
              to="/problems"
              className="inline-flex items-center px-3.5 py-1.5 rounded text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
            >
              Browse Problems &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* 6. High-Density Priority List / Table */}
      {!isLoading && !error && queue.length > 0 && (
        <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg overflow-hidden shadow-sm">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Problem</div>
            <div className="col-span-3">Why Due / Context</div>
            <div className="col-span-2">Latest Status</div>
            <div className="col-span-1 text-right">Score</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {/* Table Body / Rows */}
          <div className="divide-y divide-slate-800/50">
            {queue.map((item, index) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diffColor = DIFFICULTY_CONFIG[item.difficulty] || 'text-slate-400';
              const platformLabel = PLATFORM_NAMES[item.platform] || item.platform;
              const isTopPriority = index === 0;
              const dueExplanation = getDueExplanation(statusKey, item.daysSinceLastAttempt);

              return (
                <div
                  key={item.problemId}
                  className={`p-3 sm:px-4 sm:py-3 transition-colors hover:bg-slate-900/60 ${
                    isTopPriority ? 'bg-emerald-950/10 border-l-2 border-l-emerald-500' : ''
                  }`}
                >
                  {/* Desktop Grid Row */}
                  <div className="hidden md:grid md:grid-cols-12 gap-3 items-center text-xs">
                    {/* Rank */}
                    <div className="col-span-1 flex items-center space-x-1.5 font-mono text-slate-500">
                      <span className={isTopPriority ? 'text-emerald-400 font-bold' : ''}>
                        #{index + 1}
                      </span>
                    </div>

                    {/* Problem Title + Platform + Topics */}
                    <div className="col-span-4 min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/problems/${item.problemId}`}
                          className="font-medium text-slate-200 hover:text-white hover:underline truncate"
                          title={item.title}
                        >
                          {item.title}
                        </Link>
                        {isTopPriority && (
                          <span className="shrink-0 text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.2 rounded">
                            Top
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{platformLabel}</span>
                        <span>&bull;</span>
                        <span className={`capitalize font-mono ${diffColor}`}>{item.difficulty}</span>
                        {item.topics && item.topics.length > 0 && (
                          <>
                            <span>&bull;</span>
                            <span className="text-slate-400 truncate" title={item.topics.join(', ')}>
                              {item.topics.slice(0, 2).join(', ')}
                              {item.topics.length > 2 ? ` +${item.topics.length - 2}` : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Context / Why Due */}
                    <div className="col-span-3 text-[11px] font-mono text-slate-400">
                      <span className="text-slate-300">{dueExplanation}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${statusCfg.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>

                    {/* Score */}
                    <div className="col-span-1 text-right font-mono">
                      <span className="text-xs font-semibold text-white">
                        {item.priorityScore.toFixed(2)}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="col-span-1 text-right">
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </div>

                  {/* Mobile Stacked Cardlet (< 768px) */}
                  <div className="block md:hidden space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-500 text-xs font-semibold">#{index + 1}</span>
                        <Link
                          to={`/problems/${item.problemId}`}
                          className="font-medium text-slate-200 hover:text-white text-xs"
                        >
                          {item.title}
                        </Link>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="text-xs font-bold text-white">{item.priorityScore.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500 block">score</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span
                        className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded font-mono border text-[10px] ${statusCfg.badge}`}
                      >
                        <span className={`w-1 h-1 rounded-full ${statusCfg.dot}`}></span>
                        <span>{statusCfg.label}</span>
                      </span>
                      <span className={`capitalize font-mono text-[10px] ${diffColor}`}>{item.difficulty}</span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-slate-400 font-mono text-[10px]">{dueExplanation}</span>
                    </div>

                    <div className="pt-1 flex items-center justify-between border-t border-slate-800/50">
                      <span className="text-[10px] text-slate-500 font-mono">{platformLabel}</span>
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      >
                        Review &rarr;
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

