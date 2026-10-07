import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RotateCw, BookOpen, CheckCircle2, AlertCircle, ArrowRight, Search, X, Tag, Sparkles, Filter } from 'lucide-react';
import { getRevisionQueue, getSummary, getHeatmap } from '../api/analytics.api.js';
import problemsApi from '../api/problems.api.js';
import RevisionSummary from '../components/revision/RevisionSummary.jsx';
import RevisionCard from '../components/revision/RevisionCard.jsx';
import AlgorithmExplainer from '../components/revision/AlgorithmExplainer.jsx';
import AttemptFormModal from '../components/problems/AttemptFormModal.jsx';

/**
 * RevisionPage: Explainable spaced-repetition revision workspace.
 * Prioritizes problem review deterministically according to the Leitner algorithm.
 */
export default function RevisionPage() {
  const [queue, setQueue] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [velocity, setVelocity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isBusyRef = useRef(false);
  isBusyRef.current = loading || isRefreshing;

  // Fetch queue, summary, and heatmap data in parallel
  const loadRevisionData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [queueRes, summaryRes, heatmapRes] = await Promise.allSettled([
        getRevisionQueue(),
        getSummary(),
        getHeatmap(),
      ]);

      if (queueRes.status === 'fulfilled') {
        setQueue(queueRes.value.data?.queue || []);
      } else {
        throw queueRes.reason;
      }

      if (summaryRes.status === 'fulfilled') {
        setSummaryData(summaryRes.value.data || null);
      }

      if (heatmapRes.status === 'fulfilled' && Array.isArray(heatmapRes.value.data?.heatmap)) {
        const heatmap = heatmapRes.value.data.heatmap;
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        const cutoff = sevenDaysAgo.toISOString().slice(0, 10);
        const recentAttempts = heatmap
          .filter((item) => item.date >= cutoff)
          .reduce((sum, item) => sum + (item.count || 0), 0);
        setVelocity(recentAttempts);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Mount load and window focus refresh (re-sync when returning from problem attempt logging)
  useEffect(() => {
    loadRevisionData();

    const handleFocus = () => {
      if (!isBusyRef.current) {
        loadRevisionData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadRevisionData]);

  const [attemptingProblem, setAttemptingProblem] = useState(null);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all'); // 'all' | 'due' | 'overdue' | 'hard'
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique topics present in the current revision queue
  const availableTopics = useMemo(() => {
    const set = new Set();
    queue.forEach((item) => {
      if (Array.isArray(item.topics)) {
        item.topics.forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [queue]);

  // Tab counts for urgency filters
  const urgencyCounts = useMemo(() => {
    return {
      all: queue.length,
      due: queue.filter((item) => item.daysSinceLastAttempt >= item.intervalDays).length,
      overdue: queue.filter((item) => item.daysSinceLastAttempt > item.intervalDays).length,
      hard: queue.filter((item) => item.difficulty === 'hard').length,
    };
  }, [queue]);

  // Client-side queue filtering
  const filteredQueue = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return queue.filter((item) => {
      if (query) {
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesTopic = Array.isArray(item.topics) && item.topics.some((t) => t.toLowerCase().includes(query));
        const matchesPlatform = item.platform?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesTopic && !matchesPlatform) {
          return false;
        }
      }
      if (filterTopic && (!item.topics || !item.topics.includes(filterTopic))) {
        return false;
      }
      if (filterUrgency === 'due') {
        const isDue = item.daysSinceLastAttempt >= item.intervalDays;
        if (!isDue) return false;
      }
      if (filterUrgency === 'overdue') {
        const isOverdue = item.daysSinceLastAttempt > item.intervalDays;
        if (!isOverdue) return false;
      }
      if (filterUrgency === 'hard') {
        if (item.difficulty !== 'hard') return false;
      }
      return true;
    });
  }, [queue, filterTopic, filterUrgency, searchQuery]);

  const hasActiveFilters = Boolean(filterTopic || filterUrgency !== 'all' || searchQuery.trim());

  const clearAllFilters = () => {
    setFilterTopic('');
    setFilterUrgency('all');
    setSearchQuery('');
  };

  const handleQuickLogSubmit = async (attemptData) => {
    if (!attemptingProblem) return;
    await problemsApi.createAttempt(attemptingProblem.id, attemptData);
    await loadRevisionData(true);
    setAttemptingProblem(null);
  };

  const isBrandNewUser =
    !loading && summaryData && summaryData.totalProblems === 0;
  const isQueueClear =
    !loading && !isBrandNewUser && queue.length === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 sm:pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-5">
        <div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1">
            Revision Intelligence
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text">
              Revision Queue
            </h1>
            {!loading && queue.length > 0 && (
              <span className="text-[11px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded border border-line">
                {filteredQueue.length === queue.length
                  ? `${queue.length} problems`
                  : `${filteredQueue.length} of ${queue.length} problems`}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1 max-w-xl">
            The problems that deserve your attention next, prioritized by the Leitner retention model.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadRevisionData(true)}
            disabled={isRefreshing}
            title="Refresh revision queue"
            aria-label="Refresh revision queue"
            className="h-9 w-9 p-0 inline-flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-hover border border-line rounded-md transition-all duration-150 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`}
            />
          </button>

          <Link
            to="/problems"
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-medium text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-all duration-150 active:scale-95 shadow-xs"
          >
            <span>All problems</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted" />
          </Link>
        </div>
      </div>

      {/* Top Queue Metrics */}
      <RevisionSummary queue={queue} loading={loading} velocity={velocity} />

      {/* Transparent Algorithm Disclosure Panel */}
      <AlgorithmExplainer />

      {/* Primary Queue Section */}
      <div className="space-y-4">
        {/* Section Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold tracking-tight text-text">
              Prioritized Queue
            </h2>
            {!loading && queue.length > 0 && (
              <span className="text-[11px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded border border-line">
                {filteredQueue.length === queue.length
                  ? `${queue.length} problems`
                  : `${filteredQueue.length} of ${queue.length} shown`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Leitner Score Descending
            </span>
          </div>
        </div>

        {/* Filter & Search Control Panel */}
        {!loading && queue.length > 0 && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-surface border border-line shadow-xs space-y-2.5">
            {/* Row 1: Urgency Status Tabs + Search Input */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              {/* Urgency Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setFilterUrgency('all')}
                  className={`whitespace-nowrap shrink-0 h-8 px-3 rounded-lg text-xs font-mono font-medium transition-all active:scale-95 inline-flex items-center gap-1.5 ${
                    filterUrgency === 'all'
                      ? 'bg-accent text-white shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-hover border border-line'
                  }`}
                >
                  <span>All</span>
                  <span className={`text-[10px] px-1 rounded ${filterUrgency === 'all' ? 'bg-black/20 text-white font-semibold' : 'text-muted'}`}>
                    {urgencyCounts.all}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterUrgency(filterUrgency === 'due' ? 'all' : 'due')}
                  className={`whitespace-nowrap shrink-0 h-8 px-3 rounded-lg text-xs font-mono font-medium transition-all active:scale-95 inline-flex items-center gap-1.5 ${
                    filterUrgency === 'due'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-amber-400 hover:bg-surface-hover border border-line'
                  }`}
                >
                  <span>⚡ Due now</span>
                  <span className={`text-[10px] px-1 rounded ${filterUrgency === 'due' ? 'bg-black/20 text-white font-semibold' : 'text-amber-400/90'}`}>
                    {urgencyCounts.due}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterUrgency(filterUrgency === 'overdue' ? 'all' : 'overdue')}
                  className={`whitespace-nowrap shrink-0 h-8 px-3 rounded-lg text-xs font-mono font-medium transition-all active:scale-95 inline-flex items-center gap-1.5 ${
                    filterUrgency === 'overdue'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-rose-400 hover:bg-surface-hover border border-line'
                  }`}
                >
                  <span>⚠️ Overdue</span>
                  <span className={`text-[10px] px-1 rounded ${filterUrgency === 'overdue' ? 'bg-black/20 text-white font-semibold' : 'text-rose-400/90'}`}>
                    {urgencyCounts.overdue}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterUrgency(filterUrgency === 'hard' ? 'all' : 'hard')}
                  className={`whitespace-nowrap shrink-0 h-8 px-3 rounded-lg text-xs font-mono font-medium transition-all active:scale-95 inline-flex items-center gap-1.5 ${
                    filterUrgency === 'hard'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-surface-2 text-text-secondary hover:text-purple-400 hover:bg-surface-hover border border-line'
                  }`}
                >
                  <span>Hard</span>
                  <span className={`text-[10px] px-1 rounded ${filterUrgency === 'hard' ? 'bg-black/20 text-white font-semibold' : 'text-muted'}`}>
                    {urgencyCounts.hard}
                  </span>
                </button>
              </div>

              {/* Problem Name & Topic Search Input */}
              <div className="relative flex-1 sm:min-w-[200px] md:max-w-xs">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter queue by title or tag..."
                  className="w-full bg-surface-2 border border-line rounded-lg pl-8 pr-7 py-1.5 text-xs text-text placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-text rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Dedicated Topic Filter Chips (Cleanly isolated so heights never clash) */}
            {availableTopics.length > 0 && (
              <div className="pt-2 border-t border-line/60 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-mono uppercase text-muted tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-muted" /> Topics:
                </span>
                <button
                  type="button"
                  onClick={() => setFilterTopic('')}
                  className={`whitespace-nowrap shrink-0 h-6 px-2.5 rounded-full text-[11px] font-mono transition-all active:scale-95 inline-flex items-center gap-1 ${
                    !filterTopic
                      ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                      : 'bg-surface-2/70 text-text-secondary hover:text-text hover:bg-surface-2 border border-line'
                  }`}
                >
                  All Topics
                </button>
                {availableTopics.map((t) => {
                  const topicCount = queue.filter((item) => item.topics?.includes(t)).length;
                  const isSelected = filterTopic === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilterTopic(isSelected ? '' : t)}
                      className={`whitespace-nowrap shrink-0 h-6 px-2.5 rounded-full text-[11px] font-mono transition-all active:scale-95 inline-flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-accent text-white font-semibold shadow-xs'
                          : 'bg-surface-2/70 text-text-secondary hover:text-text hover:bg-surface-2 border border-line'
                      }`}
                    >
                      <span>{t}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                        {topicCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Row 3: Active Filters Summary & Reset */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-line/60 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted text-[11px] font-mono">Active filters:</span>
                {filterUrgency !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-2 border border-line text-[11px] font-mono text-text">
                    <span className="text-muted">Status:</span>
                    <span className="font-semibold capitalize">{filterUrgency}</span>
                    <button
                      type="button"
                      onClick={() => setFilterUrgency('all')}
                      className="text-muted hover:text-rose-400 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterTopic && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-2 border border-line text-[11px] font-mono text-text">
                    <span className="text-muted">Topic:</span>
                    <span className="font-semibold text-accent">{filterTopic}</span>
                    <button
                      type="button"
                      onClick={() => setFilterTopic('')}
                      className="text-muted hover:text-rose-400 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-2 border border-line text-[11px] font-mono text-text">
                    <span className="text-muted">Search:</span>
                    <span className="font-semibold">"{searchQuery}"</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-muted hover:text-rose-400 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-mono text-accent hover:underline ml-1"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-lg bg-surface border border-line shadow-xs animate-pulse space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 bg-surface-2 rounded" />
                    <div className="h-4 bg-surface-2 rounded w-48 sm:w-64" />
                    <div className="h-4 bg-surface-2 rounded w-16" />
                  </div>
                  <div className="h-8 bg-surface-2 rounded w-20" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 bg-surface-2/60 rounded w-20" />
                  <div className="h-3 bg-surface-2/60 rounded w-28" />
                  <div className="h-3 bg-surface-2/60 rounded w-24" />
                </div>
                <div className="h-8 bg-surface-2/40 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Localized Error State */}
        {!loading && error && (
          <div className="p-8 border border-line rounded-lg flex flex-col items-center justify-center text-center bg-surface/60 space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">
                Unable to load revision queue
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm">
                {error.message || 'Unable to retrieve prioritized revision recommendations.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadRevisionData()}
              className="h-9 px-4 text-xs font-mono text-white bg-accent hover:bg-accent-hover rounded-md transition-all duration-200 active:scale-95 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_12px_rgba(237,134,65,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_16px_rgba(237,134,65,0.4)]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Brand-New Account State */}
        {!loading && !error && isBrandNewUser && (
          <div className="p-10 border border-dashed border-line rounded-lg flex flex-col items-center justify-center text-center bg-surface/40 space-y-3">
            <div className="w-10 h-10 rounded-full bg-surface-2 border border-line flex items-center justify-center text-accent">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">
                No revision queue yet
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm">
                Log practice attempts on problems to start building your spaced-repetition revision queue.
              </p>
            </div>
            <Link
              to="/problems"
              className="mt-2 h-9 inline-flex items-center gap-1.5 px-4 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-all duration-200 active:scale-95 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_12px_rgba(237,134,65,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_16px_rgba(237,134,65,0.4)]"
            >
              <span>Go to Problems</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Caught-Up Queue State */}
        {!loading && !error && isQueueClear && (
          <div className="p-10 border border-line rounded-lg flex flex-col items-center justify-center text-center bg-surface/40 space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">
                You're all caught up
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm">
                There are no problems currently requiring revision. New items will surface automatically as problems reach their spaced-repetition intervals.
              </p>
            </div>
            <Link
              to="/problems"
              className="mt-2 h-9 inline-flex items-center gap-1.5 px-4 text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-all duration-150 active:scale-95 shadow-xs"
            >
              <span>Practice problems</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted" />
            </Link>
          </div>
        )}

        {/* Ranked Revision Queue List */}
        {!loading && !error && queue.length > 0 && (
          <div className="space-y-3">
            {filteredQueue.length > 0 ? (
              filteredQueue.map((item, index) => (
                <RevisionCard
                  key={item.id || index}
                  item={item}
                  index={index}
                  onQuickLog={(p) => setAttemptingProblem(p)}
                />
              ))
            ) : (
              <div className="p-10 border border-line/80 rounded-xl text-center bg-surface/50 backdrop-blur-xs space-y-3">
                <div className="w-10 h-10 rounded-full bg-surface-2 border border-line flex items-center justify-center text-muted mx-auto">
                  <Filter className="w-4 h-4 text-muted" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text">No matching revision problems</h4>
                  <p className="text-xs text-muted max-w-sm mx-auto mt-1 leading-relaxed">
                    No problems match your current criteria {searchQuery ? `for "${searchQuery}"` : ''}. Try adjusting your filters or resetting to view the full queue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="h-8 px-3.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 border border-accent/25 rounded-lg transition-all active:scale-95 inline-flex items-center gap-1.5"
                >
                  <span>Clear all filters</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Direct Quick Log Attempt Modal */}
      {attemptingProblem && (
        <AttemptFormModal
          isOpen={Boolean(attemptingProblem)}
          onClose={() => setAttemptingProblem(null)}
          onSubmit={handleQuickLogSubmit}
          problemTitle={attemptingProblem.title}
        />
      )}
    </div>
  );
}
