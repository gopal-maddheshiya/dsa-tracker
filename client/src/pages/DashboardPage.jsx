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
import PageHeader from '../components/layout/PageHeader';
import ProgressRing from '../components/ui/ProgressRing';
import Badge from '../components/ui/Badge';

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

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Coder';

  return (
    <div className="space-y-6 pb-12">
      {/* Hero greeting */}
      <div className="panel p-5 flex flex-col sm:flex-row sm:items-center gap-5"
        style={{ background: 'linear-gradient(135deg, #1C1A18 0%, #191715 60%, #1a1714 100%)' }}>
        <div className="flex-1">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#F97316] mb-1">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F4]">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-xs text-[#6B6560] mt-1.5 font-mono">
            {summary
              ? `${summary.totalProblems} cataloged · ${summary.totalAttempts} sessions logged · ${summary.solvedProblems ?? 0} solved`
              : 'Loading your progress…'}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {revisionQueue.length > 0 && (
              <Link to="/revision">
                <Badge variant="amber" dot size="sm">{revisionQueue.length} revision due</Badge>
              </Link>
            )}
            {summary?.solvedProblems > 0 && (
              <Badge variant="emerald" size="sm">🏆 {summary.solvedProblems} solved</Badge>
            )}
          </div>
        </div>
        {/* Solve rate ring */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center">
            <ProgressRing
              value={solvedPct}
              size={72}
              stroke={5}
              color="#10B981"
              label={
                <div className="text-center">
                  <span className="text-sm font-bold font-mono text-emerald-400">{solvedPct}%</span>
                </div>
              }
            />
            <p className="text-[10px] font-mono text-[#3E3834] mt-1.5 tracking-wide">solved</p>
          </div>
          <div className="text-center">
            <ProgressRing
              value={solveRate}
              size={72}
              stroke={5}
              color="#F97316"
              label={
                <div className="text-center">
                  <span className="text-sm font-bold font-mono text-[#F97316]">{solveRate}%</span>
                </div>
              }
            />
            <p className="text-[10px] font-mono text-[#3E3834] mt-1.5 tracking-wide">rate</p>
          </div>
        </div>
        {/* Add problem CTA */}
        <Link to="/problems" className="btn-primary shrink-0 text-sm">
          + Add Problem
        </Link>
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
