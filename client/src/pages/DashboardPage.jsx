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
    <div className="space-y-6 pb-24 sm:pb-12 animate-fade-up">

      {/* ── 1. UNIFIED GRAND HERO (Engineering Grid & Telemetry Hub) ── */}
      <Reveal delay={0} y={6}>
        <UnifiedHero
          user={user}
          summary={summary}
          revisionCount={revisionQueue?.length ?? 0}
          dailyFocus={recommendations?.dailyFocus}
          isLoading={loadingSummary}
          onQuickAdd={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
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
              dailyFocus={recommendations?.dailyFocus}
              primaryWeakTopic={primaryWeakTopic}
              isLoading={loadingRecommendations}
            />
          </Reveal>

          {/* ── 3. CORE WORK GRID (2 Columns: Revision Queue & Weakness Bottlenecks) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left (7 cols): Spaced Repetition Due Queue */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <Reveal delay={35} y={10} className="h-full flex-1 flex flex-col">
                <UpcomingRevisionsCard
                  queue={revisionQueue}
                  featuredId={recommendations?.dailyFocus?.id || recommendations?.dailyFocus?._id}
                  isLoading={loadingRevision}
                  error={revisionError}
                />
              </Reveal>
            </div>

            {/* Right (5 cols): Top Algorithmic Bottlenecks */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <Reveal delay={50} y={10} className="h-full flex-1 flex flex-col">
                <TopicWeaknessChart
                  topics={topics}
                  isLoading={loadingTopics}
                  error={topicsError}
                  onRetry={loadTopics}
                />
              </Reveal>
            </div>
          </div>

          {/* ── 4. PRACTICE RHYTHM: 52-WEEK ACTIVITY HEATMAP ──────────── */}
          <Reveal delay={65} y={10}>
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
