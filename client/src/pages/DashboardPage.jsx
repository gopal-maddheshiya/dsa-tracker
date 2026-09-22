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
import { fetchProblemRecommendations } from '../api/problems';
import { getErrorMessage } from '../utils/errorHandler';
import { getRank } from '../utils/profileUtils';

import PracticeStateBar from '../components/dashboard/PracticeStateBar';
import TodaysFocusCard from '../components/dashboard/TodaysFocusCard';
import UpcomingRevisionsCard from '../components/dashboard/UpcomingRevisionsCard';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart';
import SolveTrendChart from '../components/analytics/SolveTrendChart';
import PracticeHeatmap from '../components/analytics/PracticeHeatmap';
import Reveal from '../components/common/Reveal';
import { Globe, Sparkles, Code2, Repeat } from 'lucide-react';

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

  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

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

  const loadRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    try {
      const res = await fetchProblemRecommendations();
      if (res?.success) setRecommendations(res.data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadTopics();
    loadTrend();
    loadHeatmap();
    loadRevision();
    loadRecommendations();
  }, [loadSummary, loadTopics, loadTrend, loadHeatmap, loadRevision, loadRecommendations]);

  useEffect(() => {
    const handleProblemCreated = () => {
      loadSummary();
      loadTopics();
      loadTrend();
      loadHeatmap();
      loadRevision();
      loadRecommendations();
    };
    window.addEventListener('problem-created', handleProblemCreated);
    return () => window.removeEventListener('problem-created', handleProblemCreated);
  }, [loadSummary, loadTopics, loadTrend, loadHeatmap, loadRevision, loadRecommendations]);

  const hasZeroData = !loadingSummary && summary && summary.totalProblems === 0 && summary.totalAttempts === 0;
  const solveRate = summary?.totalAttempts > 0
    ? Math.round((summary.solvedAttempts / summary.totalAttempts) * 100) : 0;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Coder';

  const rank = useMemo(() => getRank(summary?.solvedProblems ?? 0), [summary?.solvedProblems]);
  const primaryWeakTopic = recommendations?.weakestTopics?.[0] || null;

  return (
    <div className="space-y-5 sm:space-y-6 pb-6 animate-fade-up">
      {/* ── Level 1 Header: User Context & Subtle Utility Actions ───── */}
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

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to="/profile?tab=platforms"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2/60 hover:bg-surface-2 border border-line/50 text-xs text-text-secondary hover:text-text font-medium transition-colors"
              title="Manage connected coding platforms & auto-sync"
            >
              <Globe className="w-3.5 h-3.5 text-accent" />
              <span>Platform Sync</span>
              <span className="text-[10px] font-mono text-muted">
                4 Hubs
              </span>
            </Link>

            {revisionQueue.length > 0 && (
              <Link
                to="/revision"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2/60 hover:bg-surface-2 border border-line/50 text-xs text-text font-medium transition-colors"
                title="View Spaced Repetition Revision Queue"
              >
                <Repeat className="w-3.5 h-3.5 text-accent" />
                <span className="font-semibold text-accent tabular-nums">{revisionQueue.length}</span>
                <span>due</span>
                <span className="text-muted">→</span>
              </Link>
            )}
          </div>
        </div>
      </Reveal>

      {/* ── Zero State vs Structured 6-Level Command Center ─────────── */}
      {hasZeroData ? (
        <Reveal delay={100}>
          <div className="bg-surface rounded-2xl border border-line p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text tracking-tight">
                    Get Started with Your Interview Prep Workspace
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Complete these three essential steps to activate your telemetry, analytics, and spaced recall engine.
                  </p>
                </div>
              </div>
            </div>

            {/* 3-Step Guided Setup Progression */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1: Connect Platforms */}
              <div className="p-4 rounded-xl bg-surface-2/40 border border-line hover:border-accent/40 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                      Step 1
                    </span>
                    <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                      <Globe className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-text">
                    Connect Platforms
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Link LeetCode, Codeforces, GFG, or CodeChef to auto-sync your verified solves, ratings, and consistency streak.
                  </p>
                </div>
                <Link
                  to="/profile?tab=platforms"
                  className="btn-primary text-xs inline-flex items-center justify-center gap-1.5 w-full mt-2"
                >
                  <span>Connect Platforms</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Step 2: Build Practice Catalog */}
              <div className="p-4 rounded-xl bg-surface-2/40 border border-line hover:border-easy/40 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-easy uppercase tracking-wider">
                      Step 2
                    </span>
                    <div className="p-1.5 rounded-lg bg-easy/10 border border-easy/20 text-easy">
                      <Code2 className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-text">
                    Build Practice Catalog
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Catalog target DSA problems with topics, difficulties, and personal notes, or batch-import questions.
                  </p>
                </div>
                <Link
                  to="/problems?new=1"
                  className="btn-secondary text-xs inline-flex items-center justify-center gap-1.5 w-full mt-2 hover:border-easy/40 hover:text-easy"
                >
                  <span>Add First Problem</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Step 3: Start Today's Focus */}
              <div className="p-4 rounded-xl bg-surface-2/40 border border-line hover:border-medium/40 transition-colors flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-medium uppercase tracking-wider">
                      Step 3
                    </span>
                    <div className="p-1.5 rounded-lg bg-medium/10 border border-medium/20 text-medium">
                      <Repeat className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-text">
                    Start Today's Focus
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Solve with the Cockpit stopwatch, log your approach and complexity, and let spaced repetition schedule recall intervals.
                  </p>
                </div>
                <Link
                  to="/problems"
                  className="btn-secondary text-xs inline-flex items-center justify-center gap-1.5 w-full mt-2 hover:border-medium/40 hover:text-medium"
                >
                  <span>Explore Practice Cockpit</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      ) : (
        <div className="flex flex-col space-y-6 sm:space-y-8">

          {/* ── CHAPTER A: Current State & Immediate Action ───────────── */}
          <div className="flex flex-col space-y-4">
            {/* Desktop: Order 1 (Top). Mobile: Order 2 (Directly under Today's Focus) */}
            <div className="order-2 lg:order-1">
              <Reveal delay={40} y={12}>
                <PracticeStateBar
                  summary={summary}
                  isLoading={loadingSummary}
                  solveRate={solveRate}
                  heatmapData={heatmap}
                  revisionCount={revisionQueue?.length ?? 0}
                />
              </Reveal>
            </div>

            {/* Level 2 (Hero) & Level 3 (Priority): Today's Focus + Upcoming Revisions */}
            {/* Mobile: Order 1 (Today's Focus is Hero at top of first viewport) */}
            <div className="order-1 lg:order-2 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
              {/* Today's Focus (Col 8 on Desktop) */}
              <div className="lg:col-span-8 flex flex-col h-full">
                <Reveal delay={60} y={16}>
                  <TodaysFocusCard
                    dailyFocus={recommendations?.dailyFocus}
                    primaryWeakTopic={primaryWeakTopic}
                    isLoading={loadingRecommendations}
                  />
                </Reveal>
              </div>

              {/* Upcoming Revisions (Col 4 on Desktop, hidden on mobile here so it renders at Order 3) */}
              <div className="hidden lg:flex lg:col-span-4 flex-col h-full">
                <Reveal delay={80} y={16}>
                  <UpcomingRevisionsCard
                    queue={revisionQueue}
                    featuredId={recommendations?.dailyFocus?.id}
                    isLoading={loadingRevision}
                    error={revisionError}
                    onRetry={loadRevision}
                  />
                </Reveal>
              </div>
            </div>

            {/* Mobile-Only Upcoming Revisions rendered at Order 3 */}
            <div className="order-3 lg:hidden">
              <Reveal delay={80} y={16}>
                <UpcomingRevisionsCard
                  queue={revisionQueue}
                  featuredId={recommendations?.dailyFocus?.id}
                  isLoading={loadingRevision}
                  error={revisionError}
                  onRetry={loadRevision}
                />
              </Reveal>
            </div>
          </div>

          {/* ── CHAPTER B: Practice Behavior & Weaknesses ─────────────── */}
          <div className="space-y-4 sm:space-y-5">
            {/* LEVEL 4: Practice Consistency & Rhythm Activity Center */}
            <Reveal delay={100} y={20}>
              <div className="w-full">
                <PracticeHeatmap
                  heatmapData={heatmap}
                  isLoading={loadingHeatmap}
                  error={heatmapError}
                  onRetry={loadHeatmap}
                />
              </div>
            </Reveal>

            {/* LEVEL 5: Topic Diagnostics Matrix */}
            <Reveal delay={120} y={20}>
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

          {/* ── CHAPTER C: Long-Term Performance Trajectory ───────────── */}
          <div>
            {/* LEVEL 6: Solve Velocity Timeline */}
            <Reveal delay={140} y={20}>
              <div className="w-full">
                <SolveTrendChart
                  trendData={trend}
                  isLoading={loadingTrend}
                  error={trendError}
                  onRetry={loadTrend}
                />
              </div>
            </Reveal>
          </div>

        </div>
      )}
    </div>
  );
};

export default DashboardPage;
