import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchRevisionQueue } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';

const STATUS_CONFIG = {
  struggled: { label: 'Struggled', dot: 'bg-rose-400', text: 'text-rose-400', cycle: '2d cycle', intervalDays: 2 },
  revisit_needed: { label: 'Revisit', dot: 'bg-amber-400', text: 'text-amber-400', cycle: '5d cycle', intervalDays: 5 },
  solved: { label: 'Solved', dot: 'bg-[#F97316]', text: 'text-[#F97316]', cycle: '14d cycle', intervalDays: 14 },
};

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const PLATFORM_LABELS = {
  leetcode: 'LeetCode', gfg: 'GFG', codechef: 'CodeChef',
  hackerrank: 'HackerRank', other: 'External',
};

const RevisionPage = () => {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormula, setShowFormula] = useState(false);

  const loadQueue = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await fetchRevisionQueue();
      if (res?.success) setQueue(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load revision queue.'));
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const summaryMetrics = useMemo(() => {
    let struggled = 0, revisit = 0, solved = 0;
    queue.forEach((item) => {
      const st = item.latestStatus || item.lastAttemptStatus;
      if (st === 'struggled') struggled++;
      else if (st === 'revisit_needed') revisit++;
      else if (st === 'solved') solved++;
    });
    return { total: queue.length, struggled, revisit, solved };
  }, [queue]);

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F4]">Revision Queue</h1>
            {!isLoading && queue.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                {queue.length} due
              </span>
            )}
          </div>
          <p className="text-sm text-[#A8A29E] mt-0.5">Problems ranked by spaced repetition priority score.</p>
        </div>
        <button type="button" onClick={() => setShowFormula(!showFormula)}
          className="btn-ghost self-start sm:self-auto text-xs flex items-center gap-1.5">
          <span>How scoring works</span>
          <span className="text-[#78716C] text-[9px]">{showFormula ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Formula */}
      {showFormula && (
        <div className="panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F5F5F4]">Scoring Formula</h3>
            <span className="section-label">Deterministic Spaced Repetition</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#141312] border border-[#2E2A27] font-mono text-sm text-[#F97316] overflow-x-auto">
            priorityScore = (daysSinceLastAttempt / intervalForStatus) + struggleWeight
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { title: 'Recall Intervals', rows: [['Struggled','2 days','text-rose-400'],['Revisit Needed','5 days','text-amber-400'],['Solved','14 days','text-[#F97316]']] },
              { title: 'Struggle Weights', rows: [['Struggled','+2.0','text-rose-400'],['Revisit Needed','+1.0','text-amber-400'],['Solved','+0.0','text-[#78716C]']] },
            ].map(({ title, rows }) => (
              <div key={title} className="p-3 rounded-lg bg-[#141312] border border-[#2E2A27]">
                <span className="section-label block mb-2">{title}</span>
                <div className="space-y-1.5 text-[#A8A29E]">
                  {rows.map(([label, value, color]) => (
                    <div key={label} className="flex justify-between">
                      <span>{label}</span>
                      <span className={`font-mono ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary strip */}
      {!isLoading && !error && queue.length > 0 && (
        <div className="panel px-5 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-[#F5F5F4] text-sm">{summaryMetrics.total}</span>
            <span className="text-[#78716C]">items due</span>
          </div>
          <span className="text-[#2E2A27]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="font-mono font-bold text-rose-400">{summaryMetrics.struggled}</span>
            <span className="text-[#78716C]">Struggled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-mono font-bold text-amber-400">{summaryMetrics.revisit}</span>
            <span className="text-[#78716C]">Revisit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
            <span className="font-mono font-bold text-[#F97316]">{summaryMetrics.solved}</span>
            <span className="text-[#78716C]">Solved Overdue</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="panel animate-pulse">
          <div className="flex justify-between px-5 py-4 border-b border-[#2E2A27]">
            <div className="h-4 w-36 shimmer rounded-md" />
            <div className="h-4 w-20 shimmer rounded-md" />
          </div>
          <div className="divide-y divide-[#2E2A27]/60">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="h-3 w-6 shimmer rounded" />
                <div className="flex-1">
                  <div className="h-4 w-56 shimmer rounded-md mb-1.5" />
                  <div className="h-2.5 w-36 shimmer rounded-md" />
                </div>
                <div className="h-3 w-14 shimmer rounded" />
                <div className="h-3 w-14 shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="panel p-8 text-center">
          <p className="text-xs text-rose-400 mb-3">{error}</p>
          <button onClick={loadQueue} type="button" className="btn-ghost">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && queue.length === 0 && (
        <div className="panel border-dashed p-14 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-[#F97316] text-lg">✓</span>
          </div>
          <h2 className="text-sm font-semibold text-[#F5F5F4]">Queue is clear</h2>
          <p className="text-xs text-[#78716C] mt-1 max-w-sm mx-auto leading-relaxed">
            No problems due for revision right now. Keep practicing and they'll appear based on your logged outcomes.
          </p>
          <Link to="/problems" className="inline-flex btn-ghost mt-5 text-xs">Browse Problems →</Link>
        </div>
      )}

      {/* Queue list */}
      {!isLoading && !error && queue.length > 0 && (
        <div className="panel overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#141312] border-b border-[#2E2A27]">
            {['#','Problem','Status','Last Seen','Score','Action'].map((h, i) => (
              <div key={h}
                className={`section-label ${i === 0 ? 'col-span-1' : i === 1 ? 'col-span-5' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-2' : i === 4 ? 'col-span-1 text-right' : 'col-span-1 text-right'}`}>
                {h}
              </div>
            ))}
          </div>

          <div className="divide-y divide-[#2E2A27]/60">
            {queue.map((item, index) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diffLabel = DIFFICULTY_LABELS[item.difficulty] || item.difficulty;
              const platformLabel = PLATFORM_LABELS[item.platform] || item.platform;
              const rankStr = String(index + 1).padStart(2, '0');
              const daysStr = item.daysSinceLastAttempt === 0 ? 'Today' : `${item.daysSinceLastAttempt}d ago`;
              const topicStr = item.topics?.length > 0 ? item.topics.join(' · ') : '';
              const metaLine = [topicStr, `${diffLabel} · ${platformLabel}`].filter(Boolean).join('  —  ');

              return (
                <div key={item.problemId} className="px-5 py-3.5 hover:bg-[#211F1D] transition-colors">
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 font-mono text-[11px] text-[#78716C]">{rankStr}</div>
                    <div className="col-span-5 min-w-0 pr-2">
                      <Link to={`/problems/${item.problemId}`}
                        className="text-sm font-medium text-[#F5F5F4] hover:text-[#FB923C] hover:underline truncate block transition-colors" title={item.title}>
                        {item.title}
                      </Link>
                      {metaLine && <div className="text-[11px] text-[#78716C] mt-0.5 truncate">{metaLine}</div>}
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      <span className={`text-xs ${statusCfg.text}`}>{statusCfg.label}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-mono text-xs text-[#A8A29E]">{daysStr}</span>
                      <span className="text-[10px] text-[#78716C] block mt-0.5">{statusCfg.cycle}</span>
                    </div>
                    <div className="col-span-1 text-right">
                      <span className="font-mono text-xs font-semibold text-[#F5F5F4]">{item.priorityScore.toFixed(2)}</span>
                    </div>
                    <div className="col-span-1 text-right">
                      <Link to={`/problems/${item.problemId}`} className="text-xs text-[#78716C] hover:text-[#F5F5F4] transition-colors">
                        Review →
                      </Link>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="block md:hidden space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[11px] text-[#78716C] shrink-0">{rankStr}</span>
                        <Link to={`/problems/${item.problemId}`} className="text-sm font-medium text-[#F5F5F4] hover:text-[#FB923C] truncate">
                          {item.title}
                        </Link>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#A8A29E] shrink-0">{item.priorityScore.toFixed(2)}</span>
                    </div>
                    {metaLine && <div className="text-[11px] text-[#78716C] truncate pl-6">{metaLine}</div>}
                    <div className="flex items-center justify-between text-[11px] pt-0.5 pl-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        <span className={statusCfg.text}>{statusCfg.label}</span>
                        <span className="text-[#78716C]">·</span>
                        <span className="font-mono text-[#A8A29E]">{daysStr}</span>
                      </div>
                      <Link to={`/problems/${item.problemId}`} className="text-[#78716C] hover:text-[#F5F5F4] transition-colors">Review →</Link>
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
