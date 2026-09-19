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

import StatCard from '../components/analytics/StatCard';
import DifficultyChart from '../components/analytics/DifficultyChart';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart';
import SolveTrendChart from '../components/analytics/SolveTrendChart';
import PracticeHeatmap from '../components/analytics/PracticeHeatmap';
import RevisionPreview from '../components/analytics/RevisionPreview';
import IntelligentRecommender from '../components/dashboard/IntelligentRecommender';
import Badge from '../components/ui/Badge';
import Reveal from '../components/common/Reveal';
import TiltCard from '../components/common/TiltCard';
import { BarChart3, Code2, CheckCircle2, Zap, Flame } from 'lucide-react';

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
    <div className="space-y-6 pb-24 sm:pb-16 animate-fade-up">
      {/* Clean Minimalist Hero Greeting & Quick Actions */}
      <Reveal delay={0} y={16}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08] relative">
          {/* Subtle ambient bloom behind greeting */}
          <div
            className="absolute -top-6 -left-6 w-48 h-24 rounded-full pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.25), transparent 70%)', filter: 'blur(30px)' }}
          />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {greeting}, {firstName}
              </h1>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border"
                style={{
                  color: rank.color,
                  borderColor: `${rank.color}44`,
                  background: `${rank.color}18`,
                }}
              >
                {rank.Icon && <rank.Icon className="w-3.5 h-3.5" />}
                {rank.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Here is your daily momentum overview and recall priority.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto relative z-10">
            {revisionQueue.length > 0 && (
              <Link to="/revision">
                <Badge variant="amber" dot size="sm">
                  {revisionQueue.length} revision due
                </Badge>
              </Link>
            )}
            <Link to="/problems?new=1" className="btn-primary text-xs sm:text-sm">
              + Add Problem
            </Link>
          </div>
        </div>
      </Reveal>

      {/* KPI Metric Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Reveal delay={0} y={20} className="h-full">
          <TiltCard maxTilt={8} className="h-full">
            <StatCard
              title="Total Cataloged"
              value={summary?.totalProblems || 0}
              subtitle="Problems in repository"
              icon={Code2}
              isLoading={loadingSummary}
              badge={`${summary?.difficultyBreakdown?.find((d) => d.difficulty === 'hard')?.count || 0} Hard`}
              glowColor="rgba(249,115,22,0.18)"
            />
          </TiltCard>
        </Reveal>

        <Reveal delay={70} y={20} className="h-full">
          <TiltCard maxTilt={8} className="h-full">
            <StatCard
              title="Problems Solved"
              value={summary?.solvedProblems || 0}
              subtitle={`${solvedPct}% solve progress`}
              icon={CheckCircle2}
              valueColor="text-emerald-400"
              isLoading={loadingSummary}
              badge={`${solvedPct}%`}
              glowColor="rgba(16,185,129,0.18)"
              progressPercent={solvedPct}
            />
          </TiltCard>
        </Reveal>

        <Reveal delay={140} y={20} className="h-full">
          <TiltCard maxTilt={8} className="h-full">
            <StatCard
              title="Practice Sessions"
              value={summary?.totalAttempts || 0}
              subtitle={`${summary?.solvedAttempts || 0} successful`}
              icon={Zap}
              valueColor="text-amber-400"
              isLoading={loadingSummary}
              badge={`${solveRate}% accuracy`}
              glowColor="rgba(245,158,11,0.18)"
            />
          </TiltCard>
        </Reveal>

        <Reveal delay={210} y={20} className="h-full">
          <TiltCard maxTilt={8} className="h-full">
            <StatCard
              title="Practice Streak"
              value={`${summary?.currentStreak || 0} Days`}
              subtitle={`Best: ${summary?.longestStreak || summary?.currentStreak || 0} days`}
              icon={Flame}
              valueColor="text-[#E07A38]"
              isLoading={loadingSummary}
              badge={summary?.currentStreak > 0 ? '🔥 Active' : 'Ready'}
              glowColor="rgba(224,122,56,0.22)"
            />
          </TiltCard>
        </Reveal>
      </div>

      {/* Zero state vs Asymmetric Dashboard Grid */}
      {hasZeroData ? (
        <Reveal delay={100}>
          <div className="bg-[#141824]/70 backdrop-blur-xl rounded-2xl border border-dashed border-white/[0.12] p-12 text-center shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-[#E07A38]/10 border border-[#E07A38]/20 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-[#E07A38]" />
            </div>
            <h2 className="text-base font-semibold text-white">Nothing to show yet</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              Add your first problem and log practice sessions to unlock analytics.
            </p>
            <Link to="/problems?new=1" className="btn-primary inline-flex mt-5 text-sm">
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
