import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { getRank } from '../utils/profileUtils';

import LeetCodeProgressConsole from '../components/analytics/LeetCodeProgressConsole';
import DifficultyChart from '../components/analytics/DifficultyChart';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart';
import SolveTrendChart from '../components/analytics/SolveTrendChart';
import PracticeHeatmap from '../components/analytics/PracticeHeatmap';
import RevisionPreview from '../components/analytics/RevisionPreview';
import IntelligentRecommender from '../components/dashboard/IntelligentRecommender';
import Badge from '../components/ui/Badge';
import Reveal from '../components/common/Reveal';
import { BarChart3 } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard · DSA Tracker';
  }, []);

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

  useEffect(() => {
    const handleProblemCreated = () => {
      loadSummary(); loadTopics(); loadTrend(); loadHeatmap(); loadRevision();
    };
    window.addEventListener('problem-created', handleProblemCreated);
    return () => window.removeEventListener('problem-created', handleProblemCreated);
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

  const rank = useMemo(() => getRank(summary?.solvedProblems ?? 0), [summary?.solvedProblems]);

  return (
    <div className="space-y-6 pb-6 animate-fade-up">
      {/* Premium Minimalist Hero Header */}
      <Reveal delay={0} y={12}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-line">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                {greeting}, <span className="text-accent">{firstName}</span>
              </h1>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm"
                style={{
                  color: rank.color,
                  borderColor: `${rank.color}35`,
                  background: `${rank.color}14`,
                }}
              >
                {rank.Icon && <rank.Icon className="w-3.5 h-3.5" />}
                <span>{rank.label}</span>
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Track daily consistency, solve velocity, and spaced recall.
            </p>
          </div>

          {revisionQueue.length > 0 && (
            <div className="flex items-center shrink-0">
              <Link
                to="/revision"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-line hover:border-accent text-xs text-text font-medium transition-all group"
              >
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-semibold text-accent tabular-nums">{revisionQueue.length}</span>
                <span>revisions due</span>
                <span className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          )}
        </div>
      </Reveal>

      {/* LeetCode-style Progress & Activity Console */}
      <Reveal delay={50} y={15}>
        <LeetCodeProgressConsole
          summary={summary}
          isLoading={loadingSummary}
          solvedPct={solvedPct}
          solveRate={solveRate}
        />
      </Reveal>

      {/* Zero state vs Asymmetric Dashboard Grid */}
      {hasZeroData ? (
        <Reveal delay={100}>
          <div className="bg-surface rounded-xl border border-dashed border-line p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 text-accent">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-text">Nothing to show yet</h2>
            <p className="text-xs text-muted mt-2 max-w-sm mx-auto leading-relaxed">
              Add your first problem and log practice sessions to unlock analytics.
            </p>
            <Link to="/problems?new=1" className="btn-primary inline-flex mt-5 text-xs">
              Add your first problem
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Priority Action Spotlight & Recall Queue (Balanced & Aligned) */}
          <Reveal delay={100} y={20}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full">
                <IntelligentRecommender className="h-full flex-1" />
              </div>
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
                <RevisionPreview
                  className="h-full flex-1"
                  queue={revisionQueue}
                  isLoading={loadingRevision}
                  error={revisionError}
                  onRetry={loadRevision}
                />
              </div>
            </div>
          </Reveal>

          {/* Row 2: Full-Width Practice Consistency & Rhythm Activity Center */}
          <Reveal delay={120} y={20}>
            <div className="w-full">
              <PracticeHeatmap
                heatmapData={heatmap}
                isLoading={loadingHeatmap}
                error={heatmapError}
                onRetry={loadHeatmap}
              />
            </div>
          </Reveal>

          {/* Row 3: Performance Analytics - Solve Velocity & Difficulty Split (Matched Heights) */}
          <Reveal delay={140} y={20}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="flex flex-col h-full">
                <SolveTrendChart
                  className="h-full flex-1"
                  trendData={trend}
                  isLoading={loadingTrend}
                  error={trendError}
                  onRetry={loadTrend}
                />
              </div>
              <div className="flex flex-col h-full">
                <DifficultyChart
                  className="h-full flex-1"
                  breakdown={summary?.difficultyBreakdown}
                  isLoading={loadingSummary}
                  error={summaryError}
                  onRetry={loadSummary}
                />
              </div>
            </div>
          </Reveal>

          {/* Row 4: Full-Width Topic Mastery & Diagnostics Matrix */}
          <Reveal delay={160} y={20}>
            <div className="w-full">
              <TopicWeaknessChart
                topics={topics}
                isLoading={loadingTopics}
                error={topicsError}
                onRetry={loadTopics}
              />
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
