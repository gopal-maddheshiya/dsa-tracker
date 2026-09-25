import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchAnalyticsSummary,
  fetchTopicAnalytics,
  fetchHeatmapAnalytics,
  fetchRevisionQueue,
} from '../api/analytics';
import { fetchProblemRecommendations } from '../api/problems';
import { getErrorMessage } from '../utils/errorHandler';

import { Flame, Plus, ArrowRight } from 'lucide-react';
import PracticeStateBar from '../components/dashboard/PracticeStateBar';
import TodaysFocusCard from '../components/dashboard/TodaysFocusCard';
import UpcomingRevisionsCard from '../components/dashboard/UpcomingRevisionsCard';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart';
import PracticeHeatmap from '../components/analytics/PracticeHeatmap';
import Reveal from '../components/common/Reveal';

/**
 * DashboardPage: Streamlined Deliberate Practice Workspace.
 *
 * Core Layout Architecture:
 * 1. Header: Greeting, Date, Streak status, and direct "+ Add Problem" / "Catalog" shortcuts.
 * 2. Top Telemetry: 4 essential KPI cards (Solved with Easy/Med/Hard breakdown, Revision Due, Streak, Tracked).
 * 3. Primary Focus: Today's Target problem with clean metadata, practice rationale, and 1-click solve CTA.
 * 4. Core Work Grid: Spaced Repetition Due Queue (left) paired with Algorithmic Bottlenecks (right).
 * 5. Practice Rhythm: GitHub-style 52-week activity heatmap for daily consistency.
 */
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

  const [heatmap, setHeatmap] = useState([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);
  const [heatmapError, setHeatmapError] = useState(null);

  const [revisionQueue, setRevisionQueue] = useState([]);
  const [loadingRevision, setLoadingRevision] = useState(true);
  const [revisionError, setRevisionError] = useState(null);

  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const res = await fetchAnalyticsSummary();
      if (res?.success) setSummary(res.data);
    } catch (err) {
      setSummaryError(getErrorMessage(err, 'Unable to load summary.'));
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
      setTopicsError(getErrorMessage(err, 'Unable to load topics.'));
    } finally {
      setLoadingTopics(false);
    }
  }, []);

  const loadHeatmap = useCallback(async () => {
    setLoadingHeatmap(true);
    setHeatmapError(null);
    try {
      const res = await fetchHeatmapAnalytics();
      if (res?.success) setHeatmap(res.data || []);
    } catch (err) {
      setHeatmapError(getErrorMessage(err, 'Unable to load heatmap.'));
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
      setRevisionError(getErrorMessage(err, 'Unable to load revision queue.'));
    } finally {
      setLoadingRevision(false);
    }
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
    loadHeatmap();
    loadRevision();
    loadRecommendations();
  }, [loadSummary, loadTopics, loadHeatmap, loadRevision, loadRecommendations]);

  useEffect(() => {
    const handleProblemCreated = () => {
      loadSummary();
      loadTopics();
      loadHeatmap();
      loadRevision();
      loadRecommendations();
    };
    window.addEventListener('problem-created', handleProblemCreated);
    return () => window.removeEventListener('problem-created', handleProblemCreated);
  }, [loadSummary, loadTopics, loadHeatmap, loadRevision, loadRecommendations]);

  const hasZeroData =
    !loadingSummary &&
    !summaryError &&
    (summary?.totalProblems ?? 0) === 0 &&
    (summary?.totalAttempts ?? 0) === 0;

  // Greeting & Date formatting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Coder';
  const primaryWeakTopic = recommendations?.weakestTopics?.[0] || null;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date());
  const streak = summary?.currentStreak ?? 0;

  return (
    <div className="space-y-6 pb-16 animate-fade-up">

      {/* ── 1. CLEAN EDITORIAL HEADER ──────────────────────────────── */}
      <Reveal delay={0} y={6}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line select-none">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-muted">
              <span>{greeting}, {firstName}</span>
              <span className="text-muted/40">·</span>
              <span>{todayFormatted}</span>
              {streak > 0 && (
                <>
                  <span className="text-muted/40">·</span>
                  <span className="inline-flex items-center gap-1 text-accent font-semibold">
                    <Flame className="w-3.5 h-3.5 text-accent" />
                    <span>{streak}d streak</span>
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Dashboard
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
              className="btn-primary text-xs py-1.5 px-3.5 rounded-md font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none"
              title="Add a problem to catalog"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Problem</span>
            </button>

            <Link
              to="/problems"
              className="btn-secondary text-xs py-1.5 px-3 rounded-md font-medium text-text-secondary hover:text-text inline-flex items-center justify-center gap-1 transition-colors flex-1 sm:flex-none"
              title="Browse complete catalog"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ── ZERO DATA STATE: Clear 3-Step Setup ─────────────────────── */}
      {hasZeroData ? (
        <Reveal delay={40}>
          <div className="rounded-lg border border-line-subtle/80 bg-surface/50 p-6 sm:p-8 space-y-6">
            <div className="space-y-1 pb-4 border-b border-line-subtle">
              <h2 className="text-base font-bold text-text tracking-tight">
                Welcome to your deliberate practice workspace
              </h2>
              <p className="text-xs text-muted">
                Complete these three steps to activate spaced repetition and personal telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-md bg-surface-2/40 border border-line-subtle flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-accent uppercase">
                    Step 1
                  </span>
                  <h3 className="text-sm font-semibold text-text">Connect Platforms</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Auto-sync solved problems, ratings, and stats from LeetCode, Codeforces, GFG, or CodeChef.
                  </p>
                </div>
                <Link
                  to="/profile?tab=platforms"
                  className="btn-primary text-xs py-1.5 px-3 text-center w-full"
                >
                  Connect Platforms →
                </Link>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-md bg-surface-2/40 border border-line-subtle flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-easy uppercase">
                    Step 2
                  </span>
                  <h3 className="text-sm font-semibold text-text">Catalog Problems</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Import existing solves or add target questions with topic tags and target complexity.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
                  className="btn-secondary text-xs py-1.5 px-3 text-center w-full cursor-pointer"
                >
                  Add First Problem →
                </button>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-md bg-surface-2/40 border border-line-subtle flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-medium uppercase">
                    Step 3
                  </span>
                  <h3 className="text-sm font-semibold text-text">Start Practicing</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Practice with timed attempts, log takeaways, and let spaced recall manage intervals.
                  </p>
                </div>
                <Link
                  to="/problems"
                  className="btn-secondary text-xs py-1.5 px-3 text-center w-full"
                >
                  Explore Catalog →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      ) : (
        /* ── STREAMLINED DASHBOARD COMPOSITION ───────────────────────── */
        <div className="space-y-6">

          {/* ── 2. KEY METRICS: 4 KPI CARDS (Placed at the top) ──────── */}
          <Reveal delay={15} y={6}>
            <PracticeStateBar
              summary={summary}
              isLoading={loadingSummary}
              revisionCount={revisionQueue?.length ?? 0}
            />
          </Reveal>

          {/* ── 3. TODAY'S TARGET: CLEAN, FOCUSED DELIBERATE PRACTICE ──── */}
          <Reveal delay={30} y={8}>
            <TodaysFocusCard
              dailyFocus={recommendations?.dailyFocus}
              primaryWeakTopic={primaryWeakTopic}
              isLoading={loadingRecommendations}
            />
          </Reveal>

          {/* ── 4. CORE WORK GRID (2 Columns: Revision Queue & Weakness Bottlenecks) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left (7 cols): Spaced Repetition Due Queue */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <Reveal delay={45} y={10} className="h-full flex-1 flex flex-col">
                <UpcomingRevisionsCard
                  queue={revisionQueue}
                  featuredId={recommendations?.dailyFocus?.id}
                  isLoading={loadingRevision}
                  error={revisionError}
                />
              </Reveal>
            </div>

            {/* Right (5 cols): Top Algorithmic Bottlenecks */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <Reveal delay={60} y={10} className="h-full flex-1 flex flex-col">
                <TopicWeaknessChart
                  topics={topics}
                  isLoading={loadingTopics}
                  error={topicsError}
                  onRetry={loadTopics}
                />
              </Reveal>
            </div>
          </div>

          {/* ── 5. PRACTICE RHYTHM: 52-WEEK ACTIVITY HEATMAP ──────────── */}
          <Reveal delay={75} y={10}>
            <PracticeHeatmap
              heatmapData={heatmap}
              isLoading={loadingHeatmap}
              error={heatmapError}
              onRetry={loadHeatmap}
            />
          </Reveal>

        </div>
      )}
    </div>
  );
};

export default DashboardPage;
