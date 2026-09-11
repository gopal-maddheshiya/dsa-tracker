import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchRevisionQueue } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';
import Badge from '../components/ui/Badge';
import { CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  struggled: {
    label: 'Struggled',
    dot: 'bg-rose-400',
    text: 'text-rose-400',
    badgeVariant: 'hard',
    cycle: '2d cycle',
    intervalDays: 2,
  },
  revisit_needed: {
    label: 'Revisit',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    badgeVariant: 'medium',
    cycle: '5d cycle',
    intervalDays: 5,
  },
  solved: {
    label: 'Solved',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    badgeVariant: 'easy',
    cycle: '14d cycle',
    intervalDays: 14,
  },
};

const DIFFICULTY_CONFIG = {
  easy:   { variant: 'easy',   label: 'Easy' },
  medium: { variant: 'medium', label: 'Medium' },
  hard:   { variant: 'hard',   label: 'Hard' },
};

const PLATFORM_LABELS = {
  leetcode: 'LeetCode',
  gfg: 'GFG',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'External',
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
      if (res?.success) setQueue(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load revision queue.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

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
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F4F6]">
              Revision Queue
            </h1>
            {!isLoading && queue.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#F97316]/12 border border-[#F97316]/30 text-[#F97316]">
                {queue.length} due
              </span>
            )}
          </div>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Prioritized by spaced repetition forgetting curves and struggle frequency.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="btn-ghost self-start sm:self-auto text-xs flex items-center gap-2"
        >
          <span>How scoring works</span>
          <span className="text-[#6B7280] text-[10px]">{showFormula ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Formula Explainer */}
      {showFormula && (
        <div className="panel p-6 space-y-4 border-white/[0.12] bg-[#121418] animate-fade-up">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F3F4F6] tracking-tight">Deterministic Spaced Repetition</h3>
            <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-wider">Ebbinghaus Curve</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D0F13] border border-white/[0.08] font-mono text-xs sm:text-sm text-[#F97316] overflow-x-auto shadow-inner">
            priorityScore = (daysSinceLastAttempt / intervalForStatus) + struggleWeight
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF] block mb-2.5">
                Target Recall Intervals
              </span>
              <div className="space-y-2 text-[#9CA3AF]">
                <div className="flex justify-between">
                  <span>Struggled</span>
                  <span className="font-mono font-semibold text-rose-400">2 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Revisit Needed</span>
                  <span className="font-mono font-semibold text-amber-400">5 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Solved</span>
                  <span className="font-mono font-semibold text-emerald-400">14 days</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF] block mb-2.5">
                Struggle Weights Added
              </span>
              <div className="space-y-2 text-[#9CA3AF]">
                <div className="flex justify-between">
                  <span>Struggled</span>
                  <span className="font-mono font-semibold text-rose-400">+2.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Revisit Needed</span>
                  <span className="font-mono font-semibold text-amber-400">+1.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Solved Overdue</span>
                  <span className="font-mono font-semibold text-[#6B7280]">+0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      {!isLoading && !error && queue.length > 0 && (
        <div className="panel p-4 flex flex-wrap items-center justify-between gap-4 border-white/[0.08] bg-[#121418]">
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-[#F3F4F6] text-lg">{summaryMetrics.total}</span>
            <span className="text-xs text-[#9CA3AF]">items due for revision</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{summaryMetrics.struggled} Struggled</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{summaryMetrics.revisit} Revisit</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{summaryMetrics.solved} Solved</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="panel animate-pulse p-6 space-y-4 border-white/[0.08]">
          <div className="flex justify-between items-center">
            <div className="h-4 w-40 shimmer rounded-md" />
            <div className="h-4 w-24 shimmer rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 shimmer rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="panel p-8 text-center border-rose-500/20">
          <p className="text-xs text-rose-400 mb-3">{error}</p>
          <button onClick={loadQueue} type="button" className="btn-ghost text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Empty queue */}
      {!isLoading && !error && queue.length === 0 && (
        <div className="panel border-dashed p-14 text-center border-white/[0.1] bg-[#121418]">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#F3F4F6] tracking-tight">Queue is completely clear!</h2>
          <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-sm mx-auto leading-relaxed">
            All your cataloged problems are up to date with spaced repetition schedule. Practice more problems to populate your queue.
          </p>
          <Link to="/problems" className="inline-flex btn-primary mt-5 text-xs">
            Browse Problems →
          </Link>
        </div>
      )}

      {/* Queue items */}
      {!isLoading && !error && queue.length > 0 && (
        <div className="panel overflow-hidden border-white/[0.08]">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#0F1114] border-b border-white/[0.08]">
            <div className="col-span-1 section-label">#</div>
            <div className="col-span-5 section-label">Problem & Topics</div>
            <div className="col-span-2 section-label">Status</div>
            <div className="col-span-2 section-label">Last Practiced</div>
            <div className="col-span-1 section-label text-right">Score</div>
            <div className="col-span-1 section-label text-right">Action</div>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {queue.map((item, index) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diffCfg = DIFFICULTY_CONFIG[item.difficulty] || { variant: 'default', label: item.difficulty };
              const platformLabel = PLATFORM_LABELS[item.platform] || item.platform;
              const rankStr = String(index + 1).padStart(2, '0');
              const daysStr = item.daysSinceLastAttempt === 0 ? 'Today' : `${item.daysSinceLastAttempt}d ago`;

              return (
                <div
                  key={item.problemId}
                  className="px-6 py-4 hover:bg-[#171A20] transition-colors duration-150"
                >
                  {/* Desktop view */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 font-mono text-xs font-semibold text-[#6B7280]">
                      {rankStr}
                    </div>

                    <div className="col-span-5 min-w-0 pr-3">
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="text-sm font-semibold text-[#F3F4F6] hover:text-[#FB923C] transition-colors truncate block"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={diffCfg.variant}>{diffCfg.label}</Badge>
                        <span className="text-[10px] font-mono text-[#9CA3AF] px-1.5 py-0.2 rounded bg-[#0D0F13] border border-white/[0.07]">
                          {platformLabel}
                        </span>
                        {item.topics?.length > 0 && (
                          <span className="text-[10px] text-[#9CA3AF] font-mono truncate">
                            {item.topics.slice(0, 2).join(', ')}
                            {item.topics.length > 2 && ` +${item.topics.length - 2}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                        <span className={`text-xs font-semibold ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="font-mono text-xs text-[#9CA3AF] font-medium block">
                        {daysStr}
                      </span>
                      <span className="text-[10px] font-mono text-[#6B7280] block">
                        {statusCfg.cycle}
                      </span>
                    </div>

                    <div className="col-span-1 text-right">
                      <span className="font-mono text-xs font-bold text-[#F97316]">
                        {item.priorityScore.toFixed(2)}
                      </span>
                    </div>

                    <div className="col-span-1 text-right">
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="btn-ghost text-xs py-1 px-2.5"
                      >
                        Review
                      </Link>
                    </div>
                  </div>

                  {/* Mobile view */}
                  <div className="block md:hidden space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-semibold text-[#6B7280] shrink-0">
                          {rankStr}
                        </span>
                        <Link
                          to={`/problems/${item.problemId}`}
                          className="text-sm font-semibold text-[#F3F4F6] hover:text-[#FB923C] truncate"
                        >
                          {item.title}
                        </Link>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#F97316] shrink-0">
                        {item.priorityScore.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={diffCfg.variant}>{diffCfg.label}</Badge>
                        <span className={`font-medium ${statusCfg.text}`}>{statusCfg.label}</span>
                        <span className="text-[#6B7280]">·</span>
                        <span className="font-mono text-[#9CA3AF]">{daysStr}</span>
                      </div>
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="text-xs text-[#F97316] hover:text-[#FB923C] font-semibold"
                      >
                        Review →
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
