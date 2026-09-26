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

import { ArrowRight, Target, GitBranch, BarChart3 } from 'lucide-react';
import UnifiedHero from '../components/dashboard/UnifiedHero';
import RoadmapActionBanner from '../components/dashboard/RoadmapActionBanner';
import MasteryMilestonePath from '../components/dashboard/MasteryMilestonePath';
import UpcomingRevisionsCard from '../components/dashboard/UpcomingRevisionsCard';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart';
import PracticeHeatmap from '../components/analytics/PracticeHeatmap';
import CompactPerformanceCard from '../components/analytics/CompactPerformanceCard';
import Reveal from '../components/common/Reveal';

/**
 * DashboardPage: Next-Level DSA Command Center.
 *
 * Implements Phase Next-Level Architecture:
 * - Top: Command Header & 4-Card Quick KPI Dock (UnifiedHero).
 * - Mobile (< lg): Responsive Segmented Workspace [Focus Today] | [Skill Tree] | [Analytics].
 * - Desktop (>= lg): Dual-Wing Command Layout:
 *   - Left Wing (8 cols): Today's Mission + Intelligent Skill Tree Roadmap.
 *   - Right Wing (4 cols): Spaced Recall Queue + Topic Gaps Bottlenecks.
 *   - Bottom Canvas: Full-width Practice Rhythm Heatmap & Weekly Signal.
 */
const DashboardPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard · DSA Tracker';
  }, []);

  // Responsive desktop detection (>= 1024px)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile Segmented Workspace State: 'focus' | 'roadmap' | 'analytics'
  const [mobileTab, setMobileTab] = useState('focus');

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

  // Synchronously resolve display data
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

  const primaryWeakTopic = displayRecommendations?.weakestTopics?.[0] || null;

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-12 animate-fade-up min-w-0 max-w-full overflow-x-clip">

      {/* ── DEMO WORKSPACE BANNER (Guest Interactive Preview Only) ──── */}
      {!isAuthenticated && (
        <Reveal delay={0} y={4}>
          <div className="relative overflow-hidden rounded-xl border border-line-subtle/80 bg-surface/85 backdrop-blur-md p-2.5 sm:p-3.5 shadow-xs select-none">
            <div className="relative z-10 flex items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2 h-2 rounded-full bg-accent/80 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-secondary shrink-0">
                      Demo Workspace
                    </span>
                    <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-surface-2 border border-line-subtle text-muted">
                      Interactive Preview
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-tight truncate sm:whitespace-normal">
                    <span className="hidden sm:inline">Exploring </span>
                    <strong className="text-text font-semibold">399 cataloged questions</strong>
                    <span className="hidden sm:inline"> and algorithmic telemetry. Create an account to log personal attempts and sync LeetCode.</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link
                  to="/signup"
                  className="bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 text-xs py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-lg font-semibold inline-flex items-center gap-1 whitespace-nowrap transition-colors"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/login"
                  className="hidden xs:inline-block text-xs font-medium text-text-secondary hover:text-text px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-line-subtle bg-surface-2 hover:bg-surface-hover transition-colors"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ── 1. COMMAND HEADER & 4-CARD KPI DOCK ── */}
      <Reveal delay={0} y={4}>
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
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8 space-y-6 shadow-md">
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
      ) : isDesktop ? (
        /* ── DESKTOP BALANCED COMMAND WORKSPACE (>= 1024px) ─────────── */
        <div className="space-y-6">
          {/* 1. Today's Practice Target Spotlight */}
          <Reveal delay={15} y={4}>
            <RoadmapActionBanner
              dailyFocus={displayRecommendations?.dailyFocus}
              primaryWeakTopic={primaryWeakTopic}
              isLoading={!isAuthenticated ? false : loadingRecommendations}
            />
          </Reveal>

          {/* 2. Interactive DSA Skill Tree (Full Width 12-cols) */}
          <Reveal delay={25} y={6}>
            <MasteryMilestonePath
              summary={displaySummary}
              topics={displayTopics}
              dailyFocus={displayRecommendations?.dailyFocus}
            />
          </Reveal>

          {/* 3. Deliberate Practice Workbench: 2-Column Balanced Twin Cards (Equal Height) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Spaced Repetition Recall Queue */}
            <Reveal delay={30} y={6} className="h-full flex flex-col">
              <UpcomingRevisionsCard
                queue={displayRevisionQueue}
                featuredId={displayRecommendations?.dailyFocus?.id || displayRecommendations?.dailyFocus?._id}
                maxItems={5}
                isLoading={!isAuthenticated ? false : loadingRevision}
                error={!isAuthenticated ? null : revisionError}
              />
            </Reveal>

            {/* Right: Topic Bottlenecks & Gaps */}
            <Reveal delay={35} y={6} className="h-full flex flex-col">
              <TopicWeaknessChart
                topics={displayTopics}
                isLoading={!isAuthenticated ? false : loadingTopics}
                error={!isAuthenticated ? null : topicsError}
                onRetry={loadTopics}
              />
            </Reveal>
          </div>

          {/* 4. Full Width Bottom Canvas: Practice Rhythm & Velocity */}
          <Reveal delay={40} y={6}>
            <PracticeHeatmap
              heatmapData={displayHeatmap}
              isLoading={!isAuthenticated ? false : loadingHeatmap}
              error={!isAuthenticated ? null : heatmapError}
              onRetry={loadHeatmap}
            />
          </Reveal>

          <Reveal delay={45} y={6}>
            <CompactPerformanceCard
              heatmapData={displayHeatmap}
              summary={displaySummary}
              isLoading={!isAuthenticated ? false : loadingSummary}
            />
          </Reveal>
        </div>
      ) : (
        /* ── MOBILE SEGMENTED WORKSPACE (< 1024px) ─────────────────────── */
        <div className="space-y-4">
          
          {/* Segmented Controller Tab Bar */}
          <div className="flex items-center p-1 rounded-xl bg-surface-2 border border-line-subtle select-none shadow-xs">
            <button
              type="button"
              onClick={() => setMobileTab('focus')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                mobileTab === 'focus'
                  ? 'bg-accent text-bg shadow-[0_2px_10px_-2px_rgba(255,161,22,0.45)]'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Focus Today</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('roadmap')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                mobileTab === 'roadmap'
                  ? 'bg-accent text-bg shadow-[0_2px_10px_-2px_rgba(255,161,22,0.45)]'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Skill Tree</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('analytics')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                mobileTab === 'analytics'
                  ? 'bg-accent text-bg shadow-[0_2px_10px_-2px_rgba(255,161,22,0.45)]'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>

          {/* TAB 1: FOCUS TODAY (< 1024px) */}
          {mobileTab === 'focus' && (
            <div className="space-y-4 animate-fade-in">
              <RoadmapActionBanner
                dailyFocus={displayRecommendations?.dailyFocus}
                primaryWeakTopic={primaryWeakTopic}
                isLoading={!isAuthenticated ? false : loadingRecommendations}
              />

              <UpcomingRevisionsCard
                queue={displayRevisionQueue}
                featuredId={displayRecommendations?.dailyFocus?.id || displayRecommendations?.dailyFocus?._id}
                maxItems={4}
                isLoading={!isAuthenticated ? false : loadingRevision}
                error={!isAuthenticated ? null : revisionError}
              />

              <CompactPerformanceCard
                heatmapData={displayHeatmap}
                summary={displaySummary}
                isLoading={!isAuthenticated ? false : loadingSummary}
              />
            </div>
          )}

          {/* TAB 2: SKILL TREE ROADMAP (< 1024px) */}
          {mobileTab === 'roadmap' && (
            <div className="space-y-4 animate-fade-in">
              <MasteryMilestonePath
                summary={displaySummary}
                topics={displayTopics}
                dailyFocus={displayRecommendations?.dailyFocus}
              />
            </div>
          )}

          {/* TAB 3: ANALYTICS & RHYTHM (< 1024px) */}
          {mobileTab === 'analytics' && (
            <div className="space-y-4 animate-fade-in">
              <TopicWeaknessChart
                topics={displayTopics}
                isLoading={!isAuthenticated ? false : loadingTopics}
                error={!isAuthenticated ? null : topicsError}
                onRetry={loadTopics}
              />

              <PracticeHeatmap
                heatmapData={displayHeatmap}
                isLoading={!isAuthenticated ? false : loadingHeatmap}
                error={!isAuthenticated ? null : heatmapError}
                onRetry={loadHeatmap}
              />

              <CompactPerformanceCard
                heatmapData={displayHeatmap}
                summary={displaySummary}
                isLoading={!isAuthenticated ? false : loadingSummary}
              />
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default DashboardPage;
