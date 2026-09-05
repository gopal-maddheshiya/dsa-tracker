import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchAnalyticsSummary,
  fetchTopicAnalytics,
  fetchTrendAnalytics,
  fetchHeatmapAnalytics,
  fetchRevisionQueue,
} from '../api/analytics';

import StatCard from '../components/analytics/StatCard';
import DifficultyChart from '../components/analytics/DifficultyChart';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart';
import SolveTrendChart from '../components/analytics/SolveTrendChart';
import PracticeHeatmap from '../components/analytics/PracticeHeatmap';
import RevisionPreview from '../components/analytics/RevisionPreview';

const DashboardPage = () => {
  const { user } = useAuth();

  // Individual endpoint states for resilient failure isolation
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState(null);

  const [trend, setTrend] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [trendError, setTrendError] = useState(null);

  const [heatmap, setHeatmap] = useState([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);
  const [heatmapError, setHeatmapError] = useState(null);

  const [revisionQueue, setRevisionQueue] = useState([]);
  const [loadingRevision, setLoadingRevision] = useState(true);
  const [revisionError, setRevisionError] = useState(null);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const res = await fetchAnalyticsSummary();
      if (res?.success) setSummary(res.data);
    } catch (err) {
      setSummaryError(err.response?.data?.message || 'Unable to load summary metrics');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadTopics = useCallback(async () => {
    setLoadingTopics(true);
    setTopicsError(null);
    try {
      const res = await fetchTopicAnalytics();
      if (res?.success) setTopics(res.data || []);
    } catch (err) {
      setTopicsError(err.response?.data?.message || 'Unable to load topic analytics');
    } finally {
      setLoadingTopics(false);
    }
  }, []);

  const loadTrend = useCallback(async () => {
    setLoadingTrend(true);
    setTrendError(null);
    try {
      const res = await fetchTrendAnalytics();
      if (res?.success) setTrend(res.data || []);
    } catch (err) {
      setTrendError(err.response?.data?.message || 'Unable to load trend analytics');
    } finally {
      setLoadingTrend(false);
    }
  }, []);

  const loadHeatmap = useCallback(async () => {
    setLoadingHeatmap(true);
    setHeatmapError(null);
    try {
      const res = await fetchHeatmapAnalytics();
      if (res?.success) setHeatmap(res.data || []);
    } catch (err) {
      setHeatmapError(err.response?.data?.message || 'Unable to load heatmap');
    } finally {
      setLoadingHeatmap(false);
    }
  }, []);

  const loadRevision = useCallback(async () => {
    setLoadingRevision(true);
    setRevisionError(null);
    try {
      const res = await fetchRevisionQueue();
      if (res?.success) setRevisionQueue(res.data || []);
    } catch (err) {
      setRevisionError(err.response?.data?.message || 'Unable to load revision queue');
    } finally {
      setLoadingRevision(false);
    }
  }, []);

  const loadAll = useCallback(() => {
    loadSummary();
    loadTopics();
    loadTrend();
    loadHeatmap();
    loadRevision();
  }, [loadSummary, loadTopics, loadTrend, loadHeatmap, loadRevision]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Derive empty state indicator from loaded summary
  const hasZeroData =
    !loadingSummary &&
    summary &&
    summary.totalProblems === 0 &&
    summary.totalAttempts === 0;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header with subtle greeting and primary action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Your DSA Progress</h1>
            {user?.name && (
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                {user.name}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track practice, understand weak areas, and revise at the right time.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/problems"
            className="inline-flex items-center justify-center px-3.5 py-2 rounded-md text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors shadow-sm"
          >
            + Add Problem
          </Link>
        </div>
      </div>

      {/* 2. Global Zero State (when user has 0 problems and 0 attempts) */}
      {hasZeroData ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-emerald-400 text-lg font-bold">
            0
          </div>
          <h2 className="text-lg font-semibold text-white">Your analytics will appear here</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Add your practice problems and log attempts to automatically generate difficulty distributions, solve velocity trends, topic weakness matrices, and spaced repetition schedules.
          </p>
          <div className="mt-6">
            <Link
              to="/problems"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors"
            >
              Add your first problem &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              title="Total Problems"
              value={summary?.totalProblems}
              subtitle="Cataloged in repository"
              isLoading={loadingSummary}
              valueColor="text-white"
            />
            <StatCard
              title="Total Attempts"
              value={summary?.totalAttempts}
              subtitle="Logged practice sessions"
              isLoading={loadingSummary}
              valueColor="text-slate-200"
            />
            <StatCard
              title="Solved Problems"
              value={summary?.solvedProblems}
              subtitle={
                summary?.totalProblems > 0
                  ? `${Math.round((summary.solvedProblems / summary.totalProblems) * 100)}% of tracked problems`
                  : 'Unique problems solved'
              }
              isLoading={loadingSummary}
              valueColor="text-emerald-400"
            />
            <StatCard
              title="Solved Attempts"
              value={summary?.solvedAttempts}
              subtitle={
                summary?.totalAttempts > 0
                  ? `${Math.round((summary.solvedAttempts / summary.totalAttempts) * 100)}% solve success rate`
                  : 'Total successful attempts'
              }
              isLoading={loadingSummary}
              valueColor="text-emerald-400"
            />
          </div>

          {/* 4. First Analytics Grid: Difficulty Distribution & Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <DifficultyChart
                breakdown={summary?.difficultyBreakdown}
                isLoading={loadingSummary}
                error={summaryError}
                onRetry={loadSummary}
              />
            </div>
            <div className="lg:col-span-2">
              <PracticeHeatmap
                heatmapData={heatmap}
                isLoading={loadingHeatmap}
                error={heatmapError}
                onRetry={loadHeatmap}
              />
            </div>
          </div>

          {/* 5. Second Analytics Grid: Solve Trend & Topic Weakness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SolveTrendChart
              trendData={trend}
              isLoading={loadingTrend}
              error={trendError}
              onRetry={loadTrend}
            />
            <TopicWeaknessChart
              topics={topics}
              isLoading={loadingTopics}
              error={topicsError}
              onRetry={loadTopics}
            />
          </div>

          {/* 6. Spaced Repetition Queue Preview */}
          <div>
            <RevisionPreview
              queue={revisionQueue}
              isLoading={loadingRevision}
              error={revisionError}
              onRetry={loadRevision}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
