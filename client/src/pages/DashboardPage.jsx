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
import { getErrorMessage } from '../utils/errorHandler';

import DifficultyChart from '../components/analytics/DifficultyChart';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart';
import SolveTrendChart from '../components/analytics/SolveTrendChart';
import PracticeHeatmap from '../components/analytics/PracticeHeatmap';
import RevisionPreview from '../components/analytics/RevisionPreview';

const StatCell = ({ label, value, sub, color = 'text-[#F5F5F4]' }) => (
  <div className="flex flex-col gap-1 py-4 px-5">
    <span className="stat-label">{label}</span>
    <div className="flex items-baseline gap-1.5">
      <span className={`stat-value ${color}`}>{value}</span>
      {sub && <span className="text-[11px] font-mono text-[#78716C]">{sub}</span>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();

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
    setLoadingSummary(true); setSummaryError(null);
    try { const res = await fetchAnalyticsSummary(); if (res?.success) setSummary(res.data); }
    catch (err) { setSummaryError(getErrorMessage(err, 'Unable to load summary.')); }
    finally { setLoadingSummary(false); }
  }, []);

  const loadTopics = useCallback(async () => {
    setLoadingTopics(true); setTopicsError(null);
    try { const res = await fetchTopicAnalytics(); if (res?.success) setTopics(res.data || []); }
    catch (err) { setTopicsError(getErrorMessage(err, 'Unable to load topics.')); }
    finally { setLoadingTopics(false); }
  }, []);

  const loadTrend = useCallback(async () => {
    setLoadingTrend(true); setTrendError(null);
    try { const res = await fetchTrendAnalytics(); if (res?.success) setTrend(res.data || []); }
    catch (err) { setTrendError(getErrorMessage(err, 'Unable to load trend.')); }
    finally { setLoadingTrend(false); }
  }, []);

  const loadHeatmap = useCallback(async () => {
    setLoadingHeatmap(true); setHeatmapError(null);
    try { const res = await fetchHeatmapAnalytics(); if (res?.success) setHeatmap(res.data || []); }
    catch (err) { setHeatmapError(getErrorMessage(err, 'Unable to load heatmap.')); }
    finally { setLoadingHeatmap(false); }
  }, []);

  const loadRevision = useCallback(async () => {
    setLoadingRevision(true); setRevisionError(null);
    try { const res = await fetchRevisionQueue(); if (res?.success) setRevisionQueue(res.data || []); }
    catch (err) { setRevisionError(getErrorMessage(err, 'Unable to load revision queue.')); }
    finally { setLoadingRevision(false); }
  }, []);

  useEffect(() => {
    loadSummary(); loadTopics(); loadTrend(); loadHeatmap(); loadRevision();
  }, [loadSummary, loadTopics, loadTrend, loadHeatmap, loadRevision]);

  const hasZeroData = !loadingSummary && summary && summary.totalProblems === 0 && summary.totalAttempts === 0;
  const solveRate = summary?.totalAttempts > 0
    ? Math.round((summary.solvedAttempts / summary.totalAttempts) * 100) : 0;
  const solvedPct = summary?.totalProblems > 0
    ? Math.round((summary.solvedProblems / summary.totalProblems) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F4]">Progress Overview</h1>
          <p className="text-sm text-[#A8A29E] mt-1">
            {summary
              ? `${summary.totalProblems} problems · ${summary.totalAttempts} sessions logged`
              : 'Velocity trends, topic weakness analysis, and spaced recall queue.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {revisionQueue.length > 0 && (
            <Link to="/revision"
              className="inline-flex items-center gap-1.5 btn-ghost text-amber-400 border-amber-500/20 hover:bg-amber-500/5 hover:border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dot-pulse" />
              {revisionQueue.length} due
            </Link>
          )}
          <Link to="/problems" className="btn-primary text-xs px-3 py-1.5">
            + Add Problem
          </Link>
        </div>
      </div>

      {/* Zero state */}
      {hasZeroData ? (
        <div className="panel border-dashed p-14 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-base font-semibold text-[#F5F5F4]">Nothing to show yet</h2>
          <p className="text-sm text-[#A8A29E] mt-2 max-w-sm mx-auto leading-relaxed">
            Add your first problem and log practice sessions to unlock analytics.
          </p>
          <Link to="/problems" className="btn-primary inline-flex mt-5 text-sm">
            Add your first problem
          </Link>
        </div>
      ) : (
        <>
          {/* KPI Strip */}
          <div className="panel overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#2E2A27]">
              <StatCell label="Cataloged" value={summary?.totalProblems ?? 0} sub="problems" />
              <StatCell label="Practice Sessions" value={summary?.totalAttempts ?? 0} sub="logged" />
              <StatCell label="Problems Solved" value={summary?.solvedProblems ?? 0} sub={`${solvedPct}%`} color="text-emerald-400" />
              <StatCell label="Solve Rate" value={`${solveRate}%`} sub={`${summary?.solvedAttempts ?? 0} solved`} color="text-[#F97316]" />
            </div>
          </div>

          <SolveTrendChart trendData={trend} isLoading={loadingTrend} error={trendError} onRetry={loadTrend} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TopicWeaknessChart topics={topics} isLoading={loadingTopics} error={topicsError} onRetry={loadTopics} />
            <DifficultyChart breakdown={summary?.difficultyBreakdown} isLoading={loadingSummary} error={summaryError} onRetry={loadSummary} />
          </div>

          <PracticeHeatmap heatmapData={heatmap} isLoading={loadingHeatmap} error={heatmapError} onRetry={loadHeatmap} />
          <RevisionPreview queue={revisionQueue} isLoading={loadingRevision} error={revisionError} onRetry={loadRevision} />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
