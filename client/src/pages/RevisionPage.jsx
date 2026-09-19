import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchRevisionQueue } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';
import { useToast } from '../context/ToastContext';
import Badge from '../components/ui/Badge';
import AttemptForm from '../components/AttemptForm';
import Reveal from '../components/common/Reveal';
import TiltCard from '../components/common/TiltCard';
import {
  CheckCircle2,
  Flame,
  ExternalLink,
  Plus,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Search,
  X,
  ArrowRight,
  Filter,
} from 'lucide-react';

const STATUS_CONFIG = {
  struggled: {
    label: 'Struggled',
    dot: 'bg-rose-400',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/25',
    badgeVariant: 'hard',
    cycle: '2-day recall target',
    intervalDays: 2,
  },
  revisit_needed: {
    label: 'Revisit',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/25',
    badgeVariant: 'medium',
    cycle: '5-day recall target',
    intervalDays: 5,
  },
  solved: {
    label: 'Solved',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    badgeVariant: 'easy',
    cycle: '14-day recall target',
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
  codeforces: { label: 'Codeforces', short: 'CF', style: 'text-sky-400 bg-sky-500/10 border-sky-500/25 shadow-[0_0_8px_rgba(56,189,248,0.08)]', dot: 'bg-sky-400' },
  atcoder:    { label: 'AtCoder', short: 'AC', style: 'text-purple-400 bg-purple-500/10 border-purple-500/25 shadow-[0_0_8px_rgba(168,85,247,0.08)]', dot: 'bg-purple-400' },
  other:      { label: 'External', short: 'Ext', style: 'text-[#9CA3AF] bg-white/[0.04] border-white/[0.08]', dot: 'bg-[#9CA3AF]' },
};

const getUrgencyBadge = (score) => {
  if (score >= 3.0) {
    return {
      label: 'Critical Overdue',
      style: 'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
      dot: 'bg-rose-400',
    };
  }
  if (score >= 2.0) {
    return {
      label: 'High Urgency',
      style: 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
      dot: 'bg-amber-400',
    };
  }
  return {
    label: 'Recall Due',
    style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-400',
  };
};

const formatDaysAgo = (days) => {
  if (days == null) return 'Never';
  if (days < 0.5) return 'Today';
  const rounded = Math.round(days);
  if (rounded === 1) return 'Yesterday';
  return `${rounded}d ago`;
};

const RevisionPage = () => {
  useEffect(() => {
    document.title = 'Revision · DSA Tracker';
  }, []);

  const toast = useToast();
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormula, setShowFormula] = useState(false);
  const [loggingProblem, setLoggingProblem] = useState(null);

  // Filter & Search States
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'struggled' | 'revisit_needed' | 'solved'
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('');

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

  // Extract all unique topics in queue
  const availableTopics = useMemo(() => {
    const set = new Set();
    queue.forEach((item) => {
      if (Array.isArray(item.topics)) {
        item.topics.forEach((t) => {
          if (t && t.trim()) set.add(t.trim());
        });
      }
    });
    return Array.from(set).sort();
  }, [queue]);

  // Filter queue by status, search, and topic
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const itemStatus = item.latestStatus || item.lastAttemptStatus;
      if (statusFilter !== 'all' && itemStatus !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchTopic = (item.topics || []).some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchTopic) return false;
      }
      if (topicFilter && !(item.topics || []).some((t) => t.toLowerCase() === topicFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [queue, statusFilter, searchQuery, topicFilter]);

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

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setTopicFilter('');
  };

  const hasActiveFilters = statusFilter !== 'all' || searchQuery.trim() !== '' || topicFilter !== '';

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-24 sm:pb-16 animate-fade-up">
      {/* ── Top Header Banner ────────────────────────────────────────── */}
      <Reveal delay={0} y={12}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2">
                <span>Revision Queue</span>
                <RotateCcw className="w-4 h-4 text-[#E07A38]" />
              </h1>
              {!isLoading && queue.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#E07A38]/15 border border-[#E07A38]/30 text-[#E07A38] shadow-sm">
                  {queue.length} due
                </span>
              )}
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1 font-mono">
              Spaced repetition schedules prioritized by forgetting curves and past struggle.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="btn-ghost self-start sm:self-auto text-xs flex items-center gap-2 border border-white/[0.08] hover:border-[#E07A38]/30 rounded-xl px-3 py-2 transition-all cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#E07A38]" />
            <span>How scoring works</span>
            {showFormula ? <ChevronUp className="w-3.5 h-3.5 text-[#9CA3AF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />}
          </button>
        </div>
      </Reveal>

      {/* ── Spaced Repetition Formula Explainer ───────────────────────── */}
      {showFormula && (
        <Reveal delay={40} y={12}>
          <div className="panel p-5 sm:p-6 space-y-4 border-white/[0.12] bg-[#121418] rounded-2xl animate-fade-in shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F3F4F6] tracking-tight flex items-center gap-2">
                <span>Deterministic Spaced Repetition Engine</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <span className="text-[10px] font-mono text-[#E07A38] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[#E07A38]/10 border border-[#E07A38]/20">
                Ebbinghaus Algorithm
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0D11] border border-white/[0.08] font-mono text-xs sm:text-sm text-[#E07A38] overflow-x-auto shadow-inner">
              priorityScore = (daysSinceLastAttempt / intervalForStatus) + struggleWeight
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-[#0B0D11] border border-white/[0.08]">
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

              <div className="p-4 rounded-xl bg-[#0B0D11] border border-white/[0.08]">
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
        </Reveal>
      )}

      {/* ── Unified Revision Command & Filter Panel ─────────────────── */}
      {!isLoading && !error && queue.length > 0 && (
        <Reveal delay={60} y={12}>
          <div className="panel p-3.5 sm:p-4 border-white/[0.08] bg-[#121418] rounded-2xl shadow-md space-y-3.5">
            {/* Top Row: Overdue Count & Status Recall Drill Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E07A38]/10 border border-[#E07A38]/25 flex items-center justify-center text-[#E07A38] shrink-0">
                  <Flame className="w-4 h-4 text-[#E07A38]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#F3F4F6] text-lg sm:text-xl leading-none">{summaryMetrics.total}</span>
                    <span className="text-xs text-[#9CA3AF] font-medium">Problems Overdue</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">Click a tier below to filter recall drill</p>
                </div>
              </div>

              {/* Interactive Status Segmented Filter */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0B0D11] border border-white/[0.08] rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-[#1C2026] text-white font-bold border border-white/[0.12] shadow-xs'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  <span>All</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-white/[0.06]">{summaryMetrics.total}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('struggled')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'struggled'
                      ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/35 shadow-xs'
                      : 'text-rose-400/80 hover:text-rose-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span>Struggled</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-rose-500/15">{summaryMetrics.struggled}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('revisit_needed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'revisit_needed'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/35 shadow-xs'
                      : 'text-amber-400/80 hover:text-amber-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Revisit</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/15">{summaryMetrics.revisit}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('solved')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'solved'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/35 shadow-xs'
                      : 'text-emerald-400/80 hover:text-emerald-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Solved</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/15">{summaryMetrics.solved}</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Search & Topic Filter Toolbar */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2 min-w-0">
                {/* Search input with proper pl-10 (40px) padding so icon never overlaps text */}
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search overdue problems or topics..."
                    className="w-full h-10 pl-10 pr-9 text-xs rounded-xl bg-[#0B0D11] border border-white/[0.08] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E07A38] focus:ring-1 focus:ring-[#E07A38]/30 transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Topic Filter Dropdown */}
                {availableTopics.length > 0 && (
                  <div className="relative w-full sm:w-48 shrink-0">
                    <select
                      value={topicFilter}
                      onChange={(e) => setTopicFilter(e.target.value)}
                      className="w-full h-10 pl-3.5 pr-8 text-xs rounded-xl bg-[#0B0D11] border border-white/[0.08] text-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-[#E07A38] focus:ring-1 focus:ring-[#E07A38]/30 transition-all shadow-inner"
                    >
                      <option value="">All Topics ({availableTopics.length})</option>
                      {availableTopics.map((t) => (
                        <option key={t} value={t} className="bg-[#131519] text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono text-slate-400 shrink-0 pt-0.5 sm:pt-0">
                <span>
                  Showing <strong className="text-white">{filteredQueue.length}</strong> of {queue.length}
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[#E07A38] hover:text-[#E88B4B] transition-colors cursor-pointer text-[11px] underline underline-offset-2 ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ── Loading Skeleton ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="panel animate-pulse p-6 space-y-4 border-white/[0.08] rounded-2xl bg-[#121418]">
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

      {/* ── Error State ──────────────────────────────────────────────── */}
      {error && !isLoading && (
        <div className="panel p-8 text-center border-rose-500/20 rounded-2xl bg-rose-500/[0.03]">
          <p className="text-xs text-rose-400 mb-3">{error}</p>
          <button onClick={loadQueue} type="button" className="btn-ghost text-xs cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* ── Empty Queue (All Done!) ─────────────────────────────────── */}
      {!isLoading && !error && queue.length === 0 && (
        <div className="panel border-dashed p-12 sm:p-14 text-center border-white/[0.1] bg-[#121418] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.18)]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#F3F4F6] tracking-tight">Revision Queue is Completely Clear!</h2>
          <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-md mx-auto leading-relaxed">
            All your cataloged problems are currently up to date with their optimal spaced-repetition recall cycles. Great job keeping your algorithmic recall sharp!
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link to="/problems" className="btn-primary text-xs">
              Browse Problems Catalog →
            </Link>
          </div>
        </div>
      )}

      {/* ── Empty Filter Results ─────────────────────────────────────── */}
      {!isLoading && !error && queue.length > 0 && filteredQueue.length === 0 && (
        <div className="panel p-10 text-center border-white/[0.08] bg-[#121418] rounded-2xl">
          <p className="text-xs text-slate-400 font-mono">No overdue problems match your selected filters.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-ghost text-xs mt-3.5 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E07A38]" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* ── Queue Items List: Desktop Table + Mobile Cards ───────────── */}
      {!isLoading && !error && filteredQueue.length > 0 && (
        <div className="space-y-3">
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block panel overflow-hidden border-white/[0.08] rounded-2xl bg-[#0E1013]/90 shadow-xl">
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#14171C]/70 border-b border-white/[0.08] text-[#6B7280] text-xs font-mono tracking-wider">
              <div className="col-span-1 section-label">#</div>
              <div className="col-span-4 section-label">Problem & Topics</div>
              <div className="col-span-2 section-label">Recall Urgency</div>
              <div className="col-span-2 section-label">Last Practiced</div>
              <div className="col-span-1 section-label text-center">Score</div>
              <div className="col-span-2 section-label text-right">Action</div>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {filteredQueue.map((item, index) => {
                const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
                const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
                const diffCfg = DIFFICULTY_CONFIG[item.difficulty] || { variant: 'default', label: item.difficulty };
                const platformCfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.other;
                const urgency = getUrgencyBadge(item.priorityScore);
                const rankStr = String(index + 1).padStart(2, '0');
                const daysFormatted = formatDaysAgo(item.daysSinceLastAttempt);

                return (
                  <div
                    key={item.problemId}
                    className="px-6 py-3.5 hover:bg-[#14171D] transition-colors duration-150 group relative"
                  >
                    <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#E07A38] opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 font-mono text-xs font-semibold text-[#6B7280]">
                        {rankStr}
                      </div>

                      <div className="col-span-4 min-w-0 pr-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/problems/${item.problemId}`}
                            className="text-sm font-semibold text-[#F3F4F6] hover:text-[#E07A38] transition-colors line-clamp-1 block tracking-tight"
                            title={item.title}
                          >
                            {item.title}
                          </Link>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#6B7280] hover:text-[#E07A38] transition-colors shrink-0"
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
                            <span className="text-[10px] text-[#9CA3AF] font-mono truncate max-w-[150px]">
                              {item.topics.slice(0, 2).map((t) => `#${t}`).join(' ')}
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
                        <span className="font-mono text-xs text-slate-200 font-semibold block">
                          {daysFormatted}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          {statusCfg.cycle}
                        </span>
                      </div>

                      <div className="col-span-1 text-center">
                        <span className="font-mono text-xs font-bold text-[#E07A38] px-2 py-0.5 rounded-md bg-[#E07A38]/10 border border-[#E07A38]/20">
                          {item.priorityScore.toFixed(2)}
                        </span>
                      </div>

                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenLog(item)}
                            className="px-2.5 py-1.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 text-xs font-mono font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                            title="Log recall practice attempt"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>Log Recall</span>
                          </button>
                          <Link
                            to={`/problems/${item.problemId}`}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/[0.08] text-xs font-semibold transition-all"
                            title="View details & notes"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="block md:hidden space-y-3">
            {filteredQueue.map((item, index) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diffCfg = DIFFICULTY_CONFIG[item.difficulty] || { variant: 'default', label: item.difficulty };
              const platformCfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.other;
              const urgency = getUrgencyBadge(item.priorityScore);
              const rankStr = String(index + 1).padStart(2, '0');
              const daysFormatted = formatDaysAgo(item.daysSinceLastAttempt);

              return (
                <Reveal key={item.problemId} delay={Math.min(index * 25, 200)} y={10}>
                  <TiltCard maxTilt={5}>
                    <div className="panel p-4 border-white/[0.08] bg-[#121418] rounded-2xl shadow-md space-y-3 relative overflow-hidden">
                      {/* Card Top Strip: Rank, Platform, Difficulty & Priority Score */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{rankStr}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${platformCfg.style}`}>
                        {platformCfg.short}
                      </span>
                      <Badge variant={diffCfg.variant} dot size="xs">{diffCfg.label}</Badge>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#E07A38] px-2 py-0.5 rounded-md bg-[#E07A38]/10 border border-[#E07A38]/20 shrink-0">
                      <Flame className="w-3 h-3 text-[#E07A38]" />
                      <span>{item.priorityScore.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Problem Title */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/problems/${item.problemId}`}
                        className="text-sm font-bold text-[#F3F4F6] hover:text-[#E07A38] transition-colors line-clamp-2 leading-snug tracking-tight"
                      >
                        {item.title}
                      </Link>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-500 hover:text-[#E07A38] p-1 -m-1 shrink-0"
                          title="Open original problem"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Topic tags (Now fully visible on mobile!) */}
                    {item.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.topics.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0B0D11] border border-white/[0.06] text-slate-300"
                          >
                            #{t}
                          </span>
                        ))}
                        {item.topics.length > 3 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md text-slate-500">
                            +{item.topics.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Overdue Timing & Urgency Strip */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg border ${urgency.style}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot} animate-pulse`} />
                      <span>{urgency.label}</span>
                    </span>

                    <div className="text-right font-mono text-[11px]">
                      <span className="text-slate-200 font-semibold">{daysFormatted}</span>
                      <span className="text-slate-500 ml-1.5">({statusCfg.cycle})</span>
                    </div>
                  </div>

                  {/* Mobile Actions: Large, Touch-Friendly 40px Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenLog(item)}
                      className="h-10 rounded-xl text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-mono font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Log Recall</span>
                    </button>
                    <Link
                      to={`/problems/${item.problemId}`}
                      className="h-10 rounded-xl text-slate-200 hover:text-white bg-[#0B0D11] border border-white/[0.09] hover:border-white/[0.18] text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
        </div>
      )}

      {/* ── Attempt Logging Modal ────────────────────────────────────── */}
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
