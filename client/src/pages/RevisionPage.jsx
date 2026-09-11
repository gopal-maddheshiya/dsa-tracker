import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchRevisionQueue } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';
import { useToast } from '../context/ToastContext';
import Badge from '../components/ui/Badge';
import AttemptForm from '../components/AttemptForm';
import {
  CheckCircle2,
  Clock,
  Flame,
  ExternalLink,
  Plus,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  Sparkles,
} from 'lucide-react';

const STATUS_CONFIG = {
  struggled: {
    label: 'Struggled',
    dot: 'bg-rose-400',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/25',
    badgeVariant: 'hard',
    cycle: '2-Day Recall Target',
    intervalDays: 2,
  },
  revisit_needed: {
    label: 'Revisit',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/25',
    badgeVariant: 'medium',
    cycle: '5-Day Recall Target',
    intervalDays: 5,
  },
  solved: {
    label: 'Solved',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    badgeVariant: 'easy',
    cycle: '14-Day Maintenance Target',
    intervalDays: 14,
  },
};

const DIFFICULTY_CONFIG = {
  easy:   { variant: 'easy',   label: 'Easy' },
  medium: { variant: 'medium', label: 'Medium' },
  hard:   { variant: 'hard',   label: 'Hard' },
};

const PLATFORM_CONFIG = {
  leetcode:   { label: 'LeetCode', short: 'LC', style: 'text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.08)]', dot: 'bg-amber-400' },
  gfg:        { label: 'GeeksforGeeks', short: 'GFG', style: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.08)]', dot: 'bg-emerald-400' },
  codechef:   { label: 'CodeChef', short: 'CC', style: 'text-amber-300 bg-amber-600/10 border-amber-600/25 shadow-[0_0_8px_rgba(217,119,6,0.08)]', dot: 'bg-amber-300' },
  hackerrank: { label: 'HackerRank', short: 'HR', style: 'text-green-400 bg-green-500/10 border-green-500/25 shadow-[0_0_8px_rgba(34,197,94,0.08)]', dot: 'bg-green-400' },
  other:      { label: 'External', short: 'Ext', style: 'text-[#9CA3AF] bg-white/[0.04] border-white/[0.08]', dot: 'bg-[#9CA3AF]' },
};

const getUrgencyBadge = (score) => {
  if (score >= 3.0) {
    return {
      label: 'Critical Overdue',
      style: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
      dot: 'bg-rose-400',
    };
  }
  if (score >= 2.0) {
    return {
      label: 'High Urgency',
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
      dot: 'bg-amber-400',
    };
  }
  return {
    label: 'Review Cycle',
    style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-400',
  };
};

const RevisionPage = () => {
  const toast = useToast();
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [loggingProblem, setLoggingProblem] = useState(null);

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

  // Listen for problem updates
  useEffect(() => {
    const handleRefresh = () => loadQueue();
    window.addEventListener('problem-created', handleRefresh);
    return () => window.removeEventListener('problem-created', handleRefresh);
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

  const handleOpenLog = (item) => {
    setLoggingProblem({
      id: item.problemId,
      title: item.title,
    });
  };

  const handleLogSuccess = () => {
    setLoggingProblem(null);
    loadQueue();
    toast.success('Practice session recorded! Spaced repetition updated.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-up">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2.5">
              <span>Revision Queue</span>
              <RotateCcw className="w-5 h-5 text-[#F97316]" />
            </h1>
            {!isLoading && queue.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#F97316]/12 border border-[#F97316]/30 text-[#F97316] shadow-[0_0_12px_rgba(249,115,22,0.12)]">
                {queue.length} due
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            Prioritized by Ebbinghaus forgetting curves and past struggle patterns.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="btn-ghost self-start sm:self-auto text-xs flex items-center gap-2 border border-white/[0.08] hover:border-[#F97316]/30 rounded-xl px-3 py-2 transition-all cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-[#F97316]" />
          <span>How scoring works</span>
          {showFormula ? <ChevronUp className="w-3.5 h-3.5 text-[#6B7280]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />}
        </button>
      </div>

      {/* Spaced Repetition Formula Explainer */}
      {showFormula && (
        <div className="panel p-5 sm:p-6 space-y-4 border-white/[0.12] bg-[#121418] rounded-2xl animate-fade-up shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F3F4F6] tracking-tight flex items-center gap-2">
              <span>Deterministic Spaced Repetition Engine</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[#F97316]/10 border border-[#F97316]/20">
              Ebbinghaus Algorithm
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D0F13] border border-white/[0.08] font-mono text-xs sm:text-sm text-[#F97316] overflow-x-auto shadow-inner">
            priorityScore = (daysSinceLastAttempt / intervalForStatus) + struggleWeight
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF] block mb-2.5 font-semibold">
                Target Recall Intervals
              </span>
              <div className="space-y-2 text-[#9CA3AF] font-mono text-[11px]">
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> Struggled</span>
                  <span className="font-semibold text-rose-400">2 days cycle</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Revisit Needed</span>
                  <span className="font-semibold text-amber-400">5 days cycle</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Solved</span>
                  <span className="font-semibold text-emerald-400">14 days cycle</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D0F13] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF] block mb-2.5 font-semibold">
                Struggle Weights Added
              </span>
              <div className="space-y-2 text-[#9CA3AF] font-mono text-[11px]">
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> Struggled</span>
                  <span className="font-semibold text-rose-400">+2.00 Priority</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Revisit Needed</span>
                  <span className="font-semibold text-amber-400">+1.00 Priority</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Solved Overdue</span>
                  <span className="font-semibold text-[#6B7280]">+0.00 Priority</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      {!isLoading && !error && queue.length > 0 && (
        <div className="panel p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-white/[0.08] bg-[#121418] rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/25 flex items-center justify-center text-[#F97316]">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#F3F4F6] text-xl leading-none">{summaryMetrics.total}</span>
                <span className="text-xs text-[#9CA3AF] font-medium">Problems Overdue</span>
              </div>
              <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">Spaced repetition schedule active</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="font-semibold">{summaryMetrics.struggled} Struggled</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold">{summaryMetrics.revisit} Revisit</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold">{summaryMetrics.solved} Solved</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="panel animate-pulse p-6 space-y-4 border-white/[0.08] rounded-2xl">
          <div className="flex justify-between items-center">
            <div className="h-4 w-40 shimmer rounded-md" />
            <div className="h-4 w-24 shimmer rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 shimmer rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="panel p-8 text-center border-rose-500/20 rounded-2xl bg-rose-500/[0.03]">
          <p className="text-xs text-rose-400 mb-3">{error}</p>
          <button onClick={loadQueue} type="button" className="btn-ghost text-xs cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Empty queue */}
      {!isLoading && !error && queue.length === 0 && (
        <div className="panel border-dashed p-14 text-center border-white/[0.1] bg-[#121418] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#F3F4F6] tracking-tight">Queue is completely clear!</h2>
          <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-sm mx-auto leading-relaxed">
            All your cataloged problems are up to date with spaced repetition schedules. Catalog more problems or log attempts to populate your queue.
          </p>
          <Link to="/problems" className="inline-flex btn-primary mt-5 text-xs">
            Browse Problems Catalog →
          </Link>
        </div>
      )}

      {/* Queue items list */}
      {!isLoading && !error && queue.length > 0 && (
        <div className="panel overflow-hidden border-white/[0.08] rounded-2xl bg-[#0E1013]/90 shadow-xl">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#14171C]/60 border-b border-white/[0.08] text-[#6B7280] text-xs font-mono tracking-wider">
            <div className="col-span-1 section-label">#</div>
            <div className="col-span-4 section-label">Problem & Topics</div>
            <div className="col-span-2 section-label">Urgency</div>
            <div className="col-span-2 section-label">Last Practiced</div>
            <div className="col-span-1 section-label text-center">Score</div>
            <div className="col-span-2 section-label text-right">Action</div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {queue.map((item, index) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diffCfg = DIFFICULTY_CONFIG[item.difficulty] || { variant: 'default', label: item.difficulty };
              const platformCfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.other;
              const urgency = getUrgencyBadge(item.priorityScore);
              const rankStr = String(index + 1).padStart(2, '0');
              const daysStr = item.daysSinceLastAttempt === 0 ? 'Today' : `${item.daysSinceLastAttempt}d ago`;

              return (
                <div
                  key={item.problemId}
                  className="px-5 sm:px-6 py-4 hover:bg-[#14171D] transition-colors duration-150 group relative"
                >
                  {/* Left accent bar on hover */}
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Desktop view */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 font-mono text-xs font-semibold text-[#6B7280]">
                      {rankStr}
                    </div>

                    <div className="col-span-4 min-w-0 pr-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/problems/${item.problemId}`}
                          className="text-sm font-semibold text-[#F3F4F6] hover:text-[#FB923C] transition-colors truncate block tracking-tight"
                          title={item.title}
                        >
                          {item.title}
                        </Link>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#6B7280] hover:text-[#F97316] transition-colors shrink-0"
                            title="Open original problem"
                          >
                            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant={diffCfg.variant} dot size="xs">{diffCfg.label}</Badge>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${platformCfg.style}`}>
                          {platformCfg.short}
                        </span>
                        {item.topics?.length > 0 && (
                          <span className="text-[10px] text-[#9CA3AF] font-mono truncate max-w-[140px]">
                            {item.topics.slice(0, 2).join(', ')}
                            {item.topics.length > 2 && ` +${item.topics.length - 2}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg border ${urgency.style}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot} animate-pulse`} />
                        <span>{urgency.label}</span>
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="font-mono text-xs text-[#9CA3AF] font-medium block">
                        {daysStr}
                      </span>
                      <span className="text-[10px] font-mono text-[#6B7280] block">
                        {statusCfg.cycle}
                      </span>
                    </div>

                    <div className="col-span-1 text-center">
                      <span className="font-mono text-xs font-bold text-[#F97316] px-2 py-0.5 rounded-md bg-[#F97316]/10 border border-[#F97316]/20">
                        {item.priorityScore.toFixed(2)}
                      </span>
                    </div>

                    <div className="col-span-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenLog(item)}
                          className="px-2.5 py-1 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 text-[11px] font-mono font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                          title="Log review practice session"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                          <span>Log Recall</span>
                        </button>
                        <Link
                          to={`/problems/${item.problemId}`}
                          className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.1] text-xs font-semibold transition-all"
                          title="View problem & notes"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Mobile view */}
                  <div className="block md:hidden space-y-3">
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
                      <span className="font-mono text-xs font-bold text-[#F97316] shrink-0 px-2 py-0.5 rounded-md bg-[#F97316]/10 border border-[#F97316]/20">
                        {item.priorityScore.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={diffCfg.variant} dot size="xs">{diffCfg.label}</Badge>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg border ${urgency.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                          <span>{urgency.label}</span>
                        </span>
                        <span className="font-mono text-[11px] text-[#9CA3AF]">{daysStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenLog(item)}
                          className="px-2.5 py-1 rounded-lg text-emerald-400 bg-emerald-500/10 active:bg-emerald-500/20 border border-emerald-500/25 text-[11px] font-mono font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                          <span>Log</span>
                        </button>
                        <Link
                          to={`/problems/${item.problemId}`}
                          className="text-xs text-[#F97316] font-semibold"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attempt Logging Modal */}
      {loggingProblem && (
        <AttemptForm
          isOpen={Boolean(loggingProblem)}
          onClose={() => setLoggingProblem(null)}
          onSuccess={handleLogSuccess}
          problemId={loggingProblem.id}
          problemTitle={loggingProblem.title}
        />
      )}
    </div>
  );
};

export default RevisionPage;

