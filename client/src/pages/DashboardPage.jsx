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
import {
  DEMO_SUMMARY,
  DEMO_TOPICS,
  DEMO_HEATMAP,
  DEMO_REVISION_QUEUE,
  DEMO_RECOMMENDATIONS,
} from '../data/demoData';

import { Flame, Plus, ArrowRight, Sparkles } from 'lucide-react';
import UnifiedHero from '../components/dashboard/UnifiedHero';
import RoadmapActionBanner from '../components/dashboard/RoadmapActionBanner';
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();

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

  // Main data initialization: if guest, reset personal state and make ZERO network calls
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setSummary(null);
      setTopics([]);
      setHeatmap([]);
      setRevisionQueue([]);
      setRecommendations(null);
      setLoadingSummary(false);
      setLoadingTopics(false);
      setLoadingHeatmap(false);
      setLoadingRevision(false);
      setLoadingRecommendations(false);
      setSummaryError(null);
      setTopicsError(null);
      setHeatmapError(null);
      setRevisionError(null);
      return;
    }

    loadSummary();
    loadTopics();
    loadHeatmap();
    loadRevision();
    loadRecommendations();
  }, [
    authLoading,
    isAuthenticated,
    loadSummary,
    loadTopics,
    loadHeatmap,
    loadRevision,
    loadRecommendations,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleProblemCreated = () => {
      loadSummary();
      loadTopics();
      loadHeatmap();
      loadRevision();
      loadRecommendations();
    };
    window.addEventListener('problem-created', handleProblemCreated);
    return () => window.removeEventListener('problem-created', handleProblemCreated);
  }, [isAuthenticated, loadSummary, loadTopics, loadHeatmap, loadRevision, loadRecommendations]);

  const handleQuickAddClick = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-auth-gate', {
          detail: {
            title: 'Add a Problem',
            description: 'Create an account to catalog your custom problems, code solutions, and configure spaced repetition.',
            contextAction: 'Add Problem',
          },
        })
      );
    } else {
      window.dispatchEvent(new CustomEvent('open-quick-add'));
    }
  };

  // Synchronously resolve display data: guests always see demo data; authenticated users see personal data
  const displaySummary = !isAuthenticated ? DEMO_SUMMARY : summary;
  const displayTopics = !isAuthenticated ? DEMO_TOPICS : topics;
  const displayHeatmap = !isAuthenticated ? DEMO_HEATMAP : heatmap;
  const displayRevisionQueue = !isAuthenticated ? DEMO_REVISION_QUEUE : revisionQueue;
  const displayRecommendations = !isAuthenticated ? DEMO_RECOMMENDATIONS : recommendations;

  const hasZeroData =
    isAuthenticated &&
    !loadingSummary &&
    !summaryError &&
    (displaySummary?.totalProblems ?? 0) === 0 &&
    (displaySummary?.totalAttempts ?? 0) === 0;

  // Greeting & Date formatting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'Coder';
  const primaryWeakTopic = displayRecommendations?.weakestTopics?.[0] || null;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date());
  const streak = displaySummary?.currentStreak ?? 0;

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-fade-up">

      {/* ── DEMO WORKSPACE BANNER (Guest Interactive Preview) ────────── */}
      {!isAuthenticated && (
        <Reveal delay={0} y={4}>
          <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-r from-surface-2 via-surface to-surface-2 p-4 sm:p-5 shadow-lg select-none">
            <div className="absolute inset-0 engineering-grid opacity-30 pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shrink-0 mt-1 sm:mt-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                      Demo Workspace
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                      Interactive Preview
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                    Exploring <strong className="text-text font-semibold">399 cataloged questions</strong>, active spaced repetition, and algorithmic telemetry. Create an account to log personal attempts, save solutions, and sync LeetCode.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to="/signup"
                  className="btn-primary text-xs py-2 px-4 rounded-xl font-semibold shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary text-xs py-2 px-3.5 rounded-xl font-medium"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ── 1. UNIFIED GRAND HERO (Engineering Grid & Telemetry Hub) ── */}
      <Reveal delay={0} y={6}>
        <UnifiedHero
          user={user}
          summary={displaySummary}
          revisionCount={displayRevisionQueue?.length ?? 0}
          dailyFocus={displayRecommendations?.dailyFocus}
          isLoading={!isAuthenticated ? false : loadingSummary}
          onQuickAdd={handleQuickAddClick}
        />
      </Reveal>

      {/* ── ZERO DATA STATE: Clear 3-Step Setup ─────────────────────── */}
      {hasZeroData ? (
        <Reveal delay={40}>
          <div className="relative overflow-hidden rounded-2xl border border-line card-classy p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="absolute inset-0 engineering-grid pointer-events-none opacity-40" />
            <div className="relative z-10 space-y-1 pb-4 border-b border-line-subtle">
              <h2 className="text-base font-bold text-text tracking-tight">
                Welcome to your deliberate practice workspace
              </h2>
              <p className="text-xs text-muted">
                Complete these three steps to activate spaced repetition and personal telemetry.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-surface-2/40 border border-line-subtle flex flex-col justify-between space-y-3">
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
                  className="btn-primary text-xs py-2 px-3 text-center w-full rounded-lg"
                >
                  Connect Platforms →
                </Link>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-surface-2/40 border border-line-subtle flex flex-col justify-between space-y-3">
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
                  className="btn-secondary text-xs py-2 px-3 text-center w-full rounded-lg cursor-pointer"
                >
                  Add First Problem →
                </button>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-surface-2/40 border border-line-subtle flex flex-col justify-between space-y-3">
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
                  className="btn-secondary text-xs py-2 px-3 text-center w-full rounded-lg"
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

          {/* ── 2. ROADMAP ACTION STRIP (Daily Deliberate Practice Drill) ── */}
          <Reveal delay={20} y={8}>
            <RoadmapActionBanner
              dailyFocus={displayRecommendations?.dailyFocus}
              primaryWeakTopic={primaryWeakTopic}
              isLoading={!isAuthenticated ? false : loadingRecommendations}
            />
          </Reveal>

          {/* ── 3. CORE WORK GRID (2 Columns: Revision Queue & Weakness Bottlenecks) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left (7 cols): Spaced Repetition Due Queue */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <Reveal delay={35} y={10} className="h-full flex-1 flex flex-col">
                <UpcomingRevisionsCard
                  queue={displayRevisionQueue}
                  featuredId={displayRecommendations?.dailyFocus?.id || displayRecommendations?.dailyFocus?._id}
                  isLoading={!isAuthenticated ? false : loadingRevision}
                  error={!isAuthenticated ? null : revisionError}
                />
              </Reveal>
            </div>

            {/* Right (5 cols): Top Algorithmic Bottlenecks */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <Reveal delay={50} y={10} className="h-full flex-1 flex flex-col">
                <TopicWeaknessChart
                  topics={displayTopics}
                  isLoading={!isAuthenticated ? false : loadingTopics}
                  error={!isAuthenticated ? null : topicsError}
                  onRetry={loadTopics}
                />
              </Reveal>
            </div>
          </div>

          {/* ── 4. PRACTICE RHYTHM: 52-WEEK ACTIVITY HEATMAP ──────────── */}
          <Reveal delay={65} y={10}>
            <PracticeHeatmap
              heatmapData={displayHeatmap}
              isLoading={!isAuthenticated ? false : loadingHeatmap}
              error={!isAuthenticated ? null : heatmapError}
              onRetry={loadHeatmap}
            />
          </Reveal>

        </div>
      )}
    </div>
  );
};

export default DashboardPage;
