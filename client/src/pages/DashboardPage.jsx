import React, { useEffect, useState, useCallback } from 'react';
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

import { ArrowRight } from 'lucide-react';
import UnifiedHero from '../components/dashboard/UnifiedHero';
import RoadmapActionBanner from '../components/dashboard/RoadmapActionBanner';
import UpcomingRevisionsCard from '../components/dashboard/UpcomingRevisionsCard';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart';
import PracticeHeatmap from '../components/analytics/PracticeHeatmap';
import WeeklyReviewSection from '../components/analytics/WeeklyReviewSection';
import Reveal from '../components/common/Reveal';

/**
 * DashboardPage: High-Signal Deliberate Practice Command Center.
 *
 * Grounded exclusively in real telemetry:
 * 1. Top: Command Header & 4-Card Grounded KPI Dock (UnifiedHero).
 * 2. Today's Mission Spotlight: Highest priority problem due according to Ebbinghaus forgetting curve.
 * 3. Deliberate Practice Workbench (2 Columns):
 *    - Left: Spaced Recall Queue (Next 5 problems due with urgency dots).
 *    - Right: Topic Gap Matrix (Top 5 struggle topics with struggle ratios).
 * 4. Activity Rhythm: Full-width 52-week Practice Heatmap.
 * 5. Cognitive Intelligence: AI 7-Day Retrospective & Action Plan.
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

  // Synchronously resolve display data (demo dataset for guests)
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
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-12 animate-fade-up min-w-0 max-w-full overflow-x-clip">
      {/* ── DEMO WORKSPACE BANNER (Guest Interactive Preview Only) ──── */}
      {!isAuthenticated && (
        <Reveal delay={0} y={4}>
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-2.5 sm:p-3.5 shadow-xs select-none">
            <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary shrink-0">
                      Demo Workspace
                    </span>
                    <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-surface-2 border border-line-subtle text-muted">
                      Interactive Preview
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-text-secondary leading-tight truncate sm:whitespace-normal">
                    <span className="hidden sm:inline">Exploring </span>
                    <strong className="text-text font-semibold">{displaySummary?.catalogProblems ?? 10} cataloged questions</strong>
                    <span className="hidden sm:inline"> and deliberate practice telemetry. Create an account to log personal attempts and configure recall intervals.</span>
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
                  <h3 className="text-sm font-semibold text-text">Set Your Goals</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Define daily targets, target companies, and interview dates to anchor your prep roadmap.
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="btn-primary text-xs py-2 px-3 text-center w-full rounded-lg"
                >
                  Set Goals →
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
        /* ── DELIBERATE PRACTICE COMMAND WORKSPACE ──────────────────── */
        <div className="space-y-4 sm:space-y-6">
          {/* 1. Today's Practice Target Spotlight */}
          <Reveal delay={15} y={4}>
            <RoadmapActionBanner
              dailyFocus={displayRecommendations?.dailyFocus}
              primaryWeakTopic={primaryWeakTopic}
              isLoading={!isAuthenticated ? false : loadingRecommendations}
            />
          </Reveal>

          {/* 2. Deliberate Practice Workbench: 2-Column Balanced Twin Cards */}
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-muted uppercase tracking-wider font-semibold px-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Deliberate Practice Workbench</span>
              <span className="text-muted/40 hidden sm:inline">·</span>
              <span className="text-[11px] text-muted font-normal lowercase tracking-normal hidden sm:inline">
                active recall & topic bottleneck matrix
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
              {/* Left: Spaced Repetition Recall Queue */}
              <Reveal delay={25} y={6} className="h-full flex flex-col">
                <UpcomingRevisionsCard
                  queue={displayRevisionQueue}
                  featuredId={displayRecommendations?.dailyFocus?.id || displayRecommendations?.dailyFocus?._id}
                  maxItems={5}
                  isLoading={!isAuthenticated ? false : loadingRevision}
                  error={!isAuthenticated ? null : revisionError}
                />
              </Reveal>

              {/* Right: Topic Bottlenecks & Gaps */}
              <Reveal delay={30} y={6} className="h-full flex flex-col">
                <TopicWeaknessChart
                  topics={displayTopics}
                  isLoading={!isAuthenticated ? false : loadingTopics}
                  error={!isAuthenticated ? null : topicsError}
                  onRetry={loadTopics}
                />
              </Reveal>
            </div>
          </div>

          {/* 3. Full Width Bottom Canvas: Practice Rhythm & Heatmap */}
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-muted uppercase tracking-wider font-semibold px-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-easy" />
              <span>Practice Rhythm & Consistency</span>
            </div>

            <Reveal delay={35} y={6}>
              <PracticeHeatmap
                heatmapData={displayHeatmap}
                isLoading={!isAuthenticated ? false : loadingHeatmap}
                error={!isAuthenticated ? null : heatmapError}
                onRetry={loadHeatmap}
              />
            </Reveal>
          </div>

          {/* 4. AI 7-Day Cognitive Retrospective */}
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-muted uppercase tracking-wider font-semibold px-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Cognitive Retrospective & Synthesis</span>
            </div>

            <Reveal delay={40} y={6}>
              <WeeklyReviewSection />
            </Reveal>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
