import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RotateCw, BookOpen, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { getRevisionQueue, getSummary, getHeatmap } from '../api/analytics.api.js';
import RevisionSummary from '../components/revision/RevisionSummary.jsx';
import RevisionCard from '../components/revision/RevisionCard.jsx';
import AlgorithmExplainer from '../components/revision/AlgorithmExplainer.jsx';

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

  const isBrandNewUser =
    !loading && summaryData && summaryData.totalProblems === 0;
  const isQueueClear =
    !loading && !isBrandNewUser && queue.length === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
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
                {queue.length} {queue.length === 1 ? 'problem' : 'problems'}
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
        <div className="flex items-center justify-between border-b border-line-subtle pb-2">
          <h2 className="text-sm font-semibold text-text">
            Prioritized Queue
          </h2>
          {!loading && queue.length > 0 && (
            <span className="text-[11px] font-mono text-muted">
              Ranked strictly by priority score descending
            </span>
          )}
        </div>

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
              className="h-9 px-4 text-xs font-mono text-white bg-accent hover:bg-accent-hover rounded-md transition-all duration-150 active:scale-95 shadow-xs"
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
              className="mt-2 h-9 inline-flex items-center gap-1.5 px-4 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-all duration-150 active:scale-95 shadow-xs"
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
            {queue.map((item, index) => (
              <RevisionCard
                key={item.id || index}
                item={item}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
