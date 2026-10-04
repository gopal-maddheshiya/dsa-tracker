import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, RotateCw, BookOpen, AlertCircle } from 'lucide-react';
import {
  getSummary,
  getTopics,
  getTrend,
  getHeatmap,
} from '../api/analytics.api.js';
import StatCard from '../components/analytics/StatCard.jsx';
import TrendChart from '../components/analytics/TrendChart.jsx';
import DifficultyChart from '../components/analytics/DifficultyChart.jsx';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart.jsx';
import HeatmapGrid from '../components/analytics/HeatmapGrid.jsx';

/**
 * DashboardPage: Central analytics cockpit for the DSA / Interview Prep Tracker.
 * Integrates KPI metrics, weekly solve trend, difficulty distribution donut,
 * topic weakness ranking, and a 12-week practice heatmap with independent section fault-tolerance.
 */
export default function DashboardPage() {
  // Independent section states to allow partial resilience
  const [summaryState, setSummaryState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const [topicsState, setTopicsState] = useState({
    data: [],
    loading: true,
    error: null,
  });

  const [trendState, setTrendState] = useState({
    data: [],
    loading: true,
    error: null,
  });

  const [heatmapState, setHeatmapState] = useState({
    data: [],
    loading: true,
    error: null,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 1. Fetch Summary
  const fetchSummaryData = useCallback(async () => {
    if (isMountedRef.current) {
      setSummaryState((prev) => ({ ...prev, loading: true, error: null }));
    }
    try {
      const res = await getSummary();
      if (isMountedRef.current) {
        setSummaryState({
          data: res.data || null,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setSummaryState((prev) => ({
          ...prev,
          loading: false,
          error: err,
        }));
      }
    }
  }, []);

  // 2. Fetch Topics
  const fetchTopicsData = useCallback(async () => {
    if (isMountedRef.current) {
      setTopicsState((prev) => ({ ...prev, loading: true, error: null }));
    }
    try {
      const res = await getTopics();
      if (isMountedRef.current) {
        setTopicsState({
          data: res.data?.topics || [],
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setTopicsState((prev) => ({
          ...prev,
          loading: false,
          error: err,
        }));
      }
    }
  }, []);

  // 3. Fetch Trend
  const fetchTrendData = useCallback(async () => {
    if (isMountedRef.current) {
      setTrendState((prev) => ({ ...prev, loading: true, error: null }));
    }
    try {
      const res = await getTrend();
      if (isMountedRef.current) {
        setTrendState({
          data: res.data?.trend || [],
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setTrendState((prev) => ({
          ...prev,
          loading: false,
          error: err,
        }));
      }
    }
  }, []);

  // 4. Fetch Heatmap
  const fetchHeatmapData = useCallback(async () => {
    if (isMountedRef.current) {
      setHeatmapState((prev) => ({ ...prev, loading: true, error: null }));
    }
    try {
      const res = await getHeatmap();
      if (isMountedRef.current) {
        setHeatmapState({
          data: res.data?.heatmap || [],
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setHeatmapState((prev) => ({
          ...prev,
          loading: false,
          error: err,
        }));
      }
    }
  }, []);

  // Parallel dashboard load using Promise.allSettled
  const loadDashboard = useCallback(async () => {
    if (isMountedRef.current) setIsRefreshing(true);
    await Promise.allSettled([
      fetchSummaryData(),
      fetchTopicsData(),
      fetchTrendData(),
      fetchHeatmapData(),
    ]);
    if (isMountedRef.current) setIsRefreshing(false);
  }, [fetchSummaryData, fetchTopicsData, fetchTrendData, fetchHeatmapData]);

  // Initial mount load
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = summaryState.data;
  const isFreshAccount =
    !summaryState.loading &&
    summary &&
    summary.totalProblems === 0 &&
    summary.totalAttempted === 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Compact Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text">
            Dashboard
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            A clear view of your DSA practice and where to focus next.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh button */}
          <button
            type="button"
            onClick={loadDashboard}
            disabled={isRefreshing}
            title="Refresh analytics data"
            aria-label="Refresh analytics data"
            className="p-1.5 text-text-secondary hover:text-text hover:bg-surface-hover border border-line rounded-md transition-colors disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-accent"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`}
            />
          </button>

          {/* Phase 9 Restrained Revision Queue Teaser */}
          <Link
            to="/revision"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-colors"
          >
            <span>Review due problems</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted" />
          </Link>

          {/* Quick Problem Entry Shortcut */}
          <Link
            to="/problems"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add problem</span>
          </Link>
        </div>
      </div>

      {/* Fresh Account First-Use Banner */}
      {isFreshAccount && (
        <div className="p-4 rounded-lg bg-surface border border-line-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-text">
                No practice data yet
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Add your first problem and log an attempt to start building your analytics cockpit.
              </p>
            </div>
          </div>
          <Link
            to="/problems"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text hover:text-white bg-surface-2 hover:bg-accent border border-line hover:border-accent rounded-md transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Track first problem</span>
          </Link>
        </div>
      )}

      {/* Row 1: Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Tracked problems"
          value={summary?.totalProblems}
          context="Across all difficulties"
          badge="Problems"
          badgeType="default"
          loading={summaryState.loading}
          error={summaryState.error}
          onRetry={fetchSummaryData}
        />

        <StatCard
          label="Practice attempts"
          value={summary?.totalAttempted}
          context="Practice sessions logged"
          badge="Sessions"
          badgeType="accent"
          loading={summaryState.loading}
          error={summaryState.error}
          onRetry={fetchSummaryData}
        />

        <StatCard
          label="Solved attempts"
          value={summary?.totalSolved}
          context={
            summary?.totalAttempted > 0
              ? `${Math.round(
                  (summary.totalSolved / summary.totalAttempted) * 100
                )}% of attempts solved`
              : 'All-time solved'
          }
          badge="Solved"
          badgeType="success"
          loading={summaryState.loading}
          error={summaryState.error}
          onRetry={fetchSummaryData}
        />
      </div>

      {/* Row 2: Practice Solve Trend + Difficulty Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Line Chart: 8 cols on desktop */}
        <div className="lg:col-span-8">
          <TrendChart
            data={trendState.data}
            loading={trendState.loading}
            error={trendState.error}
            onRetry={fetchTrendData}
          />
        </div>

        {/* Difficulty Donut: 4 cols on desktop */}
        <div className="lg:col-span-4">
          <DifficultyChart
            breakdown={summary?.difficultyBreakdown}
            totalProblems={summary?.totalProblems ?? 0}
            loading={summaryState.loading}
            error={summaryState.error}
            onRetry={fetchSummaryData}
          />
        </div>
      </div>

      {/* Row 3: Topic Weakness & Signals */}
      <div>
        <TopicWeaknessChart
          topics={topicsState.data}
          loading={topicsState.loading}
          error={topicsState.error}
          onRetry={fetchTopicsData}
        />
      </div>

      {/* Row 4: 12-Week Practice Heatmap */}
      <div>
        <HeatmapGrid
          data={heatmapState.data}
          loading={heatmapState.loading}
          error={heatmapState.error}
          onRetry={fetchHeatmapData}
        />
      </div>
    </div>
  );
}
