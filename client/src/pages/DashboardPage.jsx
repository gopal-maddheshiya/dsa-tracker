import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getSummary,
  getTopics,
  getTrend,
  getHeatmap,
  getRevisionQueue,
} from '../api/analytics.api.js';
import StatCard from '../components/analytics/StatCard.jsx';
import TrendChart from '../components/analytics/TrendChart.jsx';
import DifficultyChart from '../components/analytics/DifficultyChart.jsx';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart.jsx';
import HeatmapGrid from '../components/analytics/HeatmapGrid.jsx';
import RevisionQueuePreview from '../components/analytics/RevisionQueuePreview.jsx';

/**
 * DashboardPage: Central productivity cockpit for DSA preparation.
 * 100% dynamically wired to real backend endpoints and user data:
 * - Real user greeting from Auth Context
 * - Real KPI numbers from /api/analytics/summary
 * - Real solve trend over 12 weeks from /api/analytics/trend
 * - Real problem distribution across tiers
 * - Real topic performance with clickable filters
 * - Real 84-day daily consistency heatmap
 * - Real Leitner revision queue candidates linking directly to problem detail views
 */
export default function DashboardPage() {
  const { user } = useAuth();

  // Independent section states to guarantee resilient loading
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

  const [revisionState, setRevisionState] = useState({
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

  const fetchSummaryData = useCallback(async () => {
    if (isMountedRef.current) setSummaryState((p) => ({ ...p, loading: true, error: null }));
    try {
      const res = await getSummary();
      if (isMountedRef.current) setSummaryState({ data: res.data || null, loading: false, error: null });
    } catch (err) {
      if (isMountedRef.current) setSummaryState((p) => ({ ...p, loading: false, error: err }));
    }
  }, []);

  const fetchTopicsData = useCallback(async () => {
    if (isMountedRef.current) setTopicsState((p) => ({ ...p, loading: true, error: null }));
    try {
      const res = await getTopics();
      if (isMountedRef.current) setTopicsState({ data: res.data?.topics || [], loading: false, error: null });
    } catch (err) {
      if (isMountedRef.current) setTopicsState((p) => ({ ...p, loading: false, error: err }));
    }
  }, []);

  const fetchTrendData = useCallback(async () => {
    if (isMountedRef.current) setTrendState((p) => ({ ...p, loading: true, error: null }));
    try {
      const res = await getTrend();
      if (isMountedRef.current) setTrendState({ data: res.data?.trend || [], loading: false, error: null });
    } catch (err) {
      if (isMountedRef.current) setTrendState((p) => ({ ...p, loading: false, error: err }));
    }
  }, []);

  const fetchHeatmapData = useCallback(async () => {
    if (isMountedRef.current) setHeatmapState((p) => ({ ...p, loading: true, error: null }));
    try {
      const res = await getHeatmap();
      if (isMountedRef.current) setHeatmapState({ data: res.data?.heatmap || [], loading: false, error: null });
    } catch (err) {
      if (isMountedRef.current) setHeatmapState((p) => ({ ...p, loading: false, error: err }));
    }
  }, []);

  const fetchRevisionData = useCallback(async () => {
    if (isMountedRef.current) setRevisionState((p) => ({ ...p, loading: true, error: null }));
    try {
      const res = await getRevisionQueue();
      if (isMountedRef.current) setRevisionState({ data: res.data?.queue || [], loading: false, error: null });
    } catch (err) {
      if (isMountedRef.current) setRevisionState((p) => ({ ...p, loading: false, error: err }));
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    if (isMountedRef.current) setIsRefreshing(true);
    await Promise.allSettled([
      fetchSummaryData(),
      fetchTopicsData(),
      fetchTrendData(),
      fetchHeatmapData(),
      fetchRevisionData(),
    ]);
    if (isMountedRef.current) setIsRefreshing(false);
  }, [
    fetchSummaryData,
    fetchTopicsData,
    fetchTrendData,
    fetchHeatmapData,
    fetchRevisionData,
  ]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = summaryState.data;

  // Real calculations directly from backend statistics
  const totalProblems = summary?.totalProblems ?? 0;
  const totalSolved = summary?.totalSolved ?? 0;
  const totalAttempted = summary?.totalAttempted ?? 0;
  const inProgress = Math.max(0, totalAttempted - totalSolved);
  const notSolved = Math.max(0, totalProblems - totalSolved);

  const solvedPct = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  const inProgressPct = totalProblems > 0 ? Math.round((inProgress / totalProblems) * 100) : 0;
  const notSolvedPct = totalProblems > 0 ? Math.round((notSolved / totalProblems) * 100) : 0;

  const successRate =
    totalAttempted > 0
      ? ((totalSolved / totalAttempted) * 100).toFixed(1)
      : totalProblems > 0
      ? ((totalSolved / totalProblems) * 100).toFixed(1)
      : '0.0';

  // Time-aware greeting
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* ==============================================================
          1. HEADER: Dynamic Greeting + Action Controls + Quote Card
          ============================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-white flex items-center gap-2">
            <span>{timeGreeting}, {firstName}!</span>
            <span role="img" aria-label="wave">
              👋
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Keep solving. Consistency today builds confidence tomorrow.
          </p>
        </div>

        {/* Action Controls: Mobile Stack (Screen 1) & Desktop Flex */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Primary Action: Add Problem (Full-width on mobile) */}
          <Link
            to="/problems?action=add"
            className="w-full sm:w-auto h-11 sm:h-9 inline-flex items-center justify-center gap-2 px-4 text-sm sm:text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(237,134,65,0.35)] whitespace-nowrap order-1 sm:order-3"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Problem</span>
          </Link>

          {/* Secondary Row: Review Due + Refresh (2 columns on mobile) */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 order-2">
            {/* Review Due */}
            <Link
              to="/revision"
              className="h-10 sm:h-9 inline-flex items-center justify-center gap-2 px-3.5 text-xs font-medium text-slate-300 hover:text-white bg-surface hover:bg-surface-2 border border-line rounded-xl transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Review Due</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted" />
            </Link>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadDashboard}
              disabled={isRefreshing}
              className="h-10 sm:h-9 p-2.5 inline-flex items-center justify-center rounded-xl bg-surface border border-line text-slate-400 hover:text-white hover:bg-surface-2 transition-all active:scale-95 disabled:opacity-50"
              title="Refresh analytics data"
              aria-label="Refresh analytics data"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
            </button>
          </div>

          {/* Motivational Quote Box (Desktop only) */}
          <div className="hidden xl:flex items-center gap-2.5 h-9 px-3.5 rounded-xl bg-surface-2 border border-line order-4">
            <div className="w-5 h-5 rounded-md bg-accent/15 text-accent flex items-center justify-center font-bold text-xs shrink-0">
              “
            </div>
            <p className="text-xs text-slate-200 font-medium whitespace-nowrap">
              “A little progress each day adds up to big results.”
            </p>
          </div>
        </div>
      </div>

      {/* ==============================================================
          2. TOP 4 KPI CARDS: Tracked Problems, Practice Attempts, Solved Problems, Success Rate (Screen 1)
          ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Tracked Problems */}
        <StatCard
          label="Tracked Problems"
          value={totalProblems}
          subtext={`${totalProblems} total`}
          badgeType="tracked"
          loading={summaryState.loading}
          error={summaryState.error}
          onRetry={fetchSummaryData}
        />

        {/* Card 2: Practice Attempts */}
        <StatCard
          label="Practice Attempts"
          value={totalAttempted}
          subtext={`${totalAttempted} sessions`}
          badgeType="attempts"
          loading={summaryState.loading}
          error={summaryState.error}
          onRetry={fetchSummaryData}
        />

        {/* Card 3: Solved Problems */}
        <StatCard
          label="Solved Problems"
          value={totalSolved}
          subtext={`${solvedPct}%`}
          badgeType="solved"
          percentage={solvedPct}
          loading={summaryState.loading}
          error={summaryState.error}
          onRetry={fetchSummaryData}
        />

        {/* Card 4: Success Rate */}
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          subtext="accuracy"
          badgeType="success"
          percentage={Math.round(Number(successRate))}
          loading={summaryState.loading}
          error={summaryState.error}
          onRetry={fetchSummaryData}
        />
      </div>

      {/* ==============================================================
          3. MIDDLE ROW: Solving Progress (60%) + Problems by Difficulty (40%)
          ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 xl:col-span-7">
          <TrendChart
            data={trendState.data}
            loading={trendState.loading}
            error={trendState.error}
            onRetry={fetchTrendData}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-5">
          <DifficultyChart
            breakdown={summary?.difficultyBreakdown}
            totalProblems={totalProblems}
            loading={summaryState.loading}
            error={summaryState.error}
            onRetry={fetchSummaryData}
          />
        </div>
      </div>

      {/* ==============================================================
          4. BOTTOM ROW: Topic-wise Performance (50%) + Daily Consistency & Revision Queue (50%)
          ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Topic-wise Performance */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col">
          <TopicWeaknessChart
            topics={topicsState.data}
            loading={topicsState.loading}
            error={topicsState.error}
            onRetry={fetchTopicsData}
          />
        </div>

        {/* Right Stack: Daily Consistency + Revision Queue */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between gap-5">
          <HeatmapGrid
            data={heatmapState.data}
            loading={heatmapState.loading}
            error={heatmapState.error}
            onRetry={fetchHeatmapData}
          />

          <RevisionQueuePreview
            queue={revisionState.data}
            loading={revisionState.loading}
            error={revisionState.error}
            onRetry={fetchRevisionData}
          />
        </div>
      </div>
    </div>
  );
}
