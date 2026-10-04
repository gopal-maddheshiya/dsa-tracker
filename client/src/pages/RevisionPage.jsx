import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RotateCw, BookOpen, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { getRevisionQueue, getSummary } from '../api/analytics.api.js';
import RevisionSummary from '../components/revision/RevisionSummary.jsx';
import RevisionCard from '../components/revision/RevisionCard.jsx';
import AlgorithmExplainer from '../components/revision/AlgorithmExplainer.jsx';

/**
 * RevisionPage: Explainable spaced-repetition revision queue.
 * Prioritizes problem review deterministically according to the Leitner algorithm.
 */
export default function RevisionPage() {
  const [queue, setQueue] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isBusyRef = useRef(false);
  isBusyRef.current = loading || isRefreshing;

  // Fetch queue and summary in parallel
  const loadRevisionData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [queueRes, summaryRes] = await Promise.allSettled([
        getRevisionQueue(),
        getSummary(),
      ]);

      if (queueRes.status === 'fulfilled') {
        setQueue(queueRes.value.data?.queue || []);
      } else {
        throw queueRes.reason;
      }

      if (summaryRes.status === 'fulfilled') {
        setSummaryData(summaryRes.value.data || null);
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
    <div className="space-y-6 pb-12">
      {/* Compact Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text">
            Revision
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Focus on the problems that need another pass.
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
            className="p-1.5 text-text-secondary hover:text-text hover:bg-surface-hover border border-line rounded-md transition-colors disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-accent"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`}
            />
          </button>

          <Link
            to="/problems"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-colors focus-visible:ring-1 focus-visible:ring-accent"
          >
            <span>All problems</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted" />
          </Link>
        </div>
      </div>

      {/* Top Queue Metrics */}
      <RevisionSummary queue={queue} loading={loading} />

      {/* Transparent Algorithm Disclosure Panel */}
      <AlgorithmExplainer />

      {/* Primary Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-line-subtle pb-2">
          <h2 className="text-xs font-semibold text-text uppercase tracking-wider font-mono">
            Prioritized Queue
          </h2>
          {!loading && queue.length > 0 && (
            <span className="text-[11px] font-mono text-muted">
              {queue.some((i) => i.daysSinceLastAttempt >= i.intervalDays)
                ? 'Sorted by priority score descending'
                : 'All candidates within interval · Ranked by relative priority'}
            </span>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-5 rounded-lg bg-surface border border-line shadow-subtle animate-pulse space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-surface-2 rounded w-48" />
                  <div className="h-4 bg-surface-2 rounded w-16" />
                </div>
                <div className="h-3 bg-surface-2/60 rounded w-72" />
                <div className="h-3 bg-surface-2/40 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-8 border border-line-subtle rounded-lg flex flex-col items-center justify-center text-center bg-bg/40 space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">
                Couldn't load your revision queue
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm">
                {error.message || 'Unable to retrieve prioritized revision recommendations.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadRevisionData()}
              className="px-4 py-1.5 text-xs font-mono text-white bg-accent hover:bg-accent-hover rounded-md transition-colors"
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
                Log a few practice attempts on problems to start building your spaced-repetition revision history.
              </p>
            </div>
            <Link
              to="/problems"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-colors shadow-subtle"
            >
              <span>Go to Problems</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Clear Queue State (Active user with no problems currently due) */}
        {!loading && !error && isQueueClear && (
          <div className="p-10 border border-line rounded-lg flex flex-col items-center justify-center text-center bg-surface/40 space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">
                Nothing is due for revision
              </h3>
              <p className="text-xs text-muted mt-1 max-w-sm">
                Your current queue is clear. New revision items will appear automatically as problems reach their spaced-repetition intervals.
              </p>
            </div>
            <Link
              to="/problems"
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-colors"
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
