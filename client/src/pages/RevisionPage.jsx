import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchRevisionQueue } from '../api/analytics';
import { createAttempt } from '../api/attempts';
import { getErrorMessage } from '../utils/errorHandler';
import { useToast } from '../context/ToastContext';
import Badge from '../components/ui/Badge';
import AttemptForm from '../components/AttemptForm';
import RevisionTable from '../components/RevisionTable';
import PaginationBar from '../components/ui/PaginationBar';
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
    dot: 'bg-danger',
    text: 'text-danger',
    bg: 'bg-danger/12 border-danger/25',
    badgeVariant: 'hard',
    cycle: '2-day recall target',
    intervalDays: 2,
  },
  revisit_needed: {
    label: 'Revisit',
    dot: 'bg-medium',
    text: 'text-medium',
    bg: 'bg-medium/12 border-medium/25',
    badgeVariant: 'medium',
    cycle: '5-day recall target',
    intervalDays: 5,
  },
  solved: {
    label: 'Solved',
    dot: 'bg-success',
    text: 'text-success',
    bg: 'bg-success/12 border-success/25',
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
  leetcode:   { label: 'LeetCode', short: 'LC', style: 'text-accent bg-accent/10 border-accent/20', dot: 'bg-accent' },
  gfg:        { label: 'GeeksforGeeks', short: 'GFG', style: 'text-easy bg-easy/10 border-easy/20', dot: 'bg-easy' },
  codechef:   { label: 'CodeChef', short: 'CC', style: 'text-medium bg-medium/10 border-medium/20', dot: 'bg-medium' },
  hackerrank: { label: 'HackerRank', short: 'HR', style: 'text-success bg-success/10 border-success/20', dot: 'bg-success' },
  codeforces: { label: 'Codeforces', short: 'CF', style: 'text-accent bg-accent/10 border-accent/20', dot: 'bg-accent' },
  atcoder:    { label: 'AtCoder', short: 'AC', style: 'text-medium bg-medium/10 border-medium/20', dot: 'bg-medium' },
  other:      { label: 'External', short: 'Ext', style: 'text-muted bg-surface-2 border-line', dot: 'bg-muted' },
};

const getUrgencyBadge = (score) => {
  if (score >= 3.0) {
    return {
      label: 'Critical Overdue',
      style: 'bg-danger/12 text-danger border-danger/25',
      dot: 'bg-danger',
    };
  }
  if (score >= 2.0) {
    return {
      label: 'High Urgency',
      style: 'bg-medium/12 text-medium border-medium/25',
      dot: 'bg-medium',
    };
  }
  return {
    label: 'Recall Due',
    style: 'bg-success/12 text-success border-success/25',
    dot: 'bg-success',
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10 | 25 | 50 | 'all'

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, topicFilter]);

  const totalItems = filteredQueue.length;
  const paginatedQueue = useMemo(() => {
    if (pageSize === 'all') return filteredQueue;
    const start = (currentPage - 1) * pageSize;
    return filteredQueue.slice(start, start + pageSize);
  }, [filteredQueue, currentPage, pageSize]);

  const startIndex = pageSize === 'all' ? 0 : (currentPage - 1) * pageSize;

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

  const handleQuickLog = async (item, status = 'solved') => {
    try {
      await createAttempt(item.problemId, {
        status,
        timeTakenMinutes: 15,
        notes: `Quick recall logged via Revision Queue (${status === 'solved' ? 'Recalled successfully' : 'Needs more practice'}).`,
        attemptedAt: new Date().toISOString(),
      });
      toast.success(`Marked "${item.title}" as ${status === 'solved' ? 'Solved' : 'Struggled'}!`);
      window.dispatchEvent(new CustomEvent('problem-created'));
      loadQueue();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to log quick recall.'));
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setTopicFilter('');
  };

  const hasActiveFilters = statusFilter !== 'all' || searchQuery.trim() !== '' || topicFilter !== '';

  return (
    <div className="space-y-5 pb-6 animate-fade-up">
      {/* ── Top Header Banner ────────────────────────────────────────── */}
      <Reveal delay={0} y={12}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text flex items-center gap-2">
                <span>Revision Queue</span>
                <RotateCcw className="w-4 h-4 text-accent" />
              </h1>
              {!isLoading && queue.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 border border-accent/20 text-accent tabular-nums">
                  {queue.length} due
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-1">
              Spaced repetition schedules prioritized by forgetting curves and past struggle.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="btn-secondary self-start sm:self-auto text-xs flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-accent" />
            <span>How scoring works</span>
            {showFormula ? <ChevronUp className="w-3.5 h-3.5 text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-muted" />}
          </button>
        </div>
      </Reveal>

      {/* ── Spaced Repetition Formula Explainer ───────────────────────── */}
      {showFormula && (
        <Reveal delay={40} y={12}>
          <div className="p-5 sm:p-6 space-y-4 border border-line bg-surface rounded-xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text tracking-tight flex items-center gap-2">
                <span>Deterministic Spaced Repetition Engine</span>
                <Sparkles className="w-4 h-4 text-accent" />
              </h3>
              <span className="text-xs uppercase tracking-wide font-semibold px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent">
                Ebbinghaus Algorithm
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-2 border border-line font-mono text-xs sm:text-sm text-accent overflow-x-auto">
              priorityScore = (daysSinceLastAttempt / intervalForStatus) + struggleWeight
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-lg bg-surface-2/60 border border-line">
                <span className="text-xs uppercase tracking-wide text-text-secondary block mb-2.5 font-semibold">
                  Target Recall Intervals
                </span>
                <div className="space-y-2 text-muted text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-line">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger" /> Struggled</span>
                    <span className="font-semibold text-danger">2 days cycle</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-line">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-medium" /> Revisit Needed</span>
                    <span className="font-semibold text-medium">5 days cycle</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> Solved</span>
                    <span className="font-semibold text-success">14 days cycle</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-surface-2/60 border border-line">
                <span className="text-xs uppercase tracking-wide text-text-secondary block mb-2.5 font-semibold">
                  Struggle Weights Added
                </span>
                <div className="space-y-2 text-muted text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-line">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-danger" /> Struggled</span>
                    <span className="font-semibold text-danger">+2.00 Priority</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-line">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-medium" /> Revisit Needed</span>
                    <span className="font-semibold text-medium">+1.00 Priority</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> Solved Overdue</span>
                    <span className="font-semibold text-muted">+0.00 Priority</span>
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
          <div className="p-3.5 sm:p-4 border border-line bg-surface rounded-xl space-y-3.5">
            {/* Top Row: Overdue Count & Status Recall Drill Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                  <Flame className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text text-lg sm:text-xl leading-none tabular-nums">{summaryMetrics.total}</span>
                    <span className="text-xs text-muted font-medium">Problems Overdue</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Click a tier below to filter recall drill</p>
                </div>
              </div>

              {/* Interactive Status Segmented Filter */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-2 border border-line rounded-lg">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-surface text-text font-semibold border border-line shadow-xs'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  <span>All</span>
                  <span className="text-xs px-1.5 py-0.2 rounded bg-surface tabular-nums">{summaryMetrics.total}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('struggled')}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'struggled'
                      ? 'bg-danger/15 text-danger font-semibold border border-danger/30 shadow-xs'
                      : 'text-danger/80 hover:text-danger'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                  <span>Struggled</span>
                  <span className="text-xs px-1.5 py-0.2 rounded bg-danger/15 tabular-nums">{summaryMetrics.struggled}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('revisit_needed')}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'revisit_needed'
                      ? 'bg-medium/15 text-medium font-semibold border border-medium/30 shadow-xs'
                      : 'text-medium/80 hover:text-medium'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-medium" />
                  <span>Revisit</span>
                  <span className="text-xs px-1.5 py-0.2 rounded bg-medium/15 tabular-nums">{summaryMetrics.revisit}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('solved')}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'solved'
                      ? 'bg-success/15 text-success font-semibold border border-success/30 shadow-xs'
                      : 'text-success/80 hover:text-success'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span>Solved</span>
                  <span className="text-xs px-1.5 py-0.2 rounded bg-success/15 tabular-nums">{summaryMetrics.solved}</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Search & Topic Filter Toolbar */}
            <div className="pt-3 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2 min-w-0">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search overdue problems or topics..."
                    className="w-full h-10 pl-10 pr-9 text-xs rounded-lg bg-surface-2 border border-line text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer p-0.5"
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
                      className="w-full h-10 pl-3.5 pr-8 text-xs rounded-lg bg-surface-2 border border-line text-text appearance-none cursor-pointer focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    >
                      <option value="">All Topics ({availableTopics.length})</option>
                      {availableTopics.map((t) => (
                        <option key={t} value={t} className="bg-surface text-text">
                          {t}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-muted shrink-0 pt-0.5 sm:pt-0">
                <span>
                  Showing <strong className="text-text tabular-nums">{filteredQueue.length}</strong> of {queue.length}
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-accent hover:underline transition-colors cursor-pointer text-xs ml-1"
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
        <div className="animate-pulse p-6 space-y-4 border border-line rounded-xl bg-surface">
          <div className="flex justify-between items-center">
            <div className="h-4 w-40 bg-surface-2 rounded-md" />
            <div className="h-4 w-24 bg-surface-2 rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-surface-2 rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* ── Error State ──────────────────────────────────────────────── */}
      {error && !isLoading && (
        <div className="p-8 text-center border border-danger/25 rounded-xl bg-danger/10">
          <p className="text-xs text-danger mb-3">{error}</p>
          <button onClick={loadQueue} type="button" className="btn-secondary text-xs cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* ── Empty Queue (All Done!) ─────────────────────────────────── */}
      {!isLoading && !error && queue.length === 0 && (
        <div className="border border-dashed p-12 sm:p-14 text-center border-line bg-surface rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4 text-success">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-text tracking-tight">Revision Queue is Completely Clear!</h2>
          <p className="text-xs text-muted mt-1.5 max-w-md mx-auto leading-relaxed">
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
        <div className="p-10 text-center border border-line bg-surface rounded-xl">
          <p className="text-xs text-muted">No overdue problems match your selected filters.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-secondary text-xs mt-3.5 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-accent" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* ── Queue Items List: Desktop Table + Mobile Cards ───────────── */}
      {!isLoading && !error && filteredQueue.length > 0 && (
        <div className="space-y-3">
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block">
            <RevisionTable
              queue={paginatedQueue}
              onOpenLog={handleOpenLog}
              onQuickLog={handleQuickLog}
              startIndex={startIndex}
            />
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="block md:hidden space-y-3">
            {paginatedQueue.map((item, index) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const diffCfg = DIFFICULTY_CONFIG[item.difficulty] || { variant: 'default', label: item.difficulty };
              const platformCfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.other;
              const urgency = getUrgencyBadge(item.priorityScore);
              const rankStr = String(startIndex + index + 1).padStart(2, '0');
              const daysFormatted = formatDaysAgo(item.daysSinceLastAttempt);

              return (
                <Reveal key={item.problemId} delay={Math.min(index * 25, 200)} y={10}>
                  <TiltCard maxTilt={5}>
                    <div className="p-4 border border-line bg-surface rounded-xl space-y-3 relative overflow-hidden">
                      {/* Card Top Strip: Rank, Platform, Difficulty & Priority Score */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-muted tabular-nums">
                            #{rankStr}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${platformCfg.style}`}>
                            {platformCfg.short}
                          </span>
                          <Badge variant={diffCfg.variant} size="xs">{diffCfg.label}</Badge>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-accent px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 shrink-0 tabular-nums">
                          <Flame className="w-3 h-3 text-accent" />
                          <span>{item.priorityScore.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Problem Title */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/problems/${item.problemId}`}
                            className="text-sm font-semibold text-text hover:text-accent transition-colors line-clamp-2 leading-snug tracking-tight"
                          >
                            {item.title}
                          </Link>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted hover:text-accent p-1 -m-1 shrink-0"
                              title="Open original problem"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {/* Topic tags */}
                        {item.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.topics.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-2 border border-line text-text-secondary"
                              >
                                #{t}
                              </span>
                            ))}
                            {item.topics.length > 3 && (
                              <span className="text-xs font-mono px-1.5 py-0.5 rounded-md text-muted">
                                +{item.topics.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Overdue Timing & Urgency Strip */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-line">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${urgency.style}`}>
                          <span>{urgency.label}</span>
                        </span>

                        <div className="text-right text-xs">
                          <span className="text-text font-medium tabular-nums">{daysFormatted}</span>
                          <span className="text-muted ml-1.5">({statusCfg.cycle})</span>
                        </div>
                      </div>

                      {/* Mobile Actions: Non-wrapping flex action bar */}
                      <div className="flex items-center gap-2 pt-2 border-t border-line">
                        <button
                          type="button"
                          onClick={() => handleOpenLog(item)}
                          className="flex-1 h-8 rounded-lg text-success bg-success/10 hover:bg-success/20 border border-success/25 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Log Recall</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickLog(item, 'solved')}
                          className="h-8 px-2.5 rounded-lg text-success bg-surface-2 hover:bg-success/15 border border-line hover:border-success/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                          title="Quick 1-Tap: Mark Solved"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Pass</span>
                        </button>
                        <Link
                          to={`/problems/${item.problemId}`}
                          className="btn-secondary h-8 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3 text-muted" />
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>

          {/* ── Smart Responsive Pagination Footer ── */}
          <PaginationBar
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="problems"
          />
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
