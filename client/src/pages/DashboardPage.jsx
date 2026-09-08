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
import { getRank, fmtMonthYear } from '../utils/profileUtils';

import DifficultyChart from '../components/analytics/DifficultyChart';
import TopicWeaknessChart from '../components/analytics/TopicWeaknessChart';
import SolveTrendChart from '../components/analytics/SolveTrendChart';
import PracticeHeatmap from '../components/analytics/PracticeHeatmap';
import RevisionPreview from '../components/analytics/RevisionPreview';
import ProgressRing from '../components/ui/ProgressRing';
import Badge from '../components/ui/Badge';
import { Trophy, BarChart3, Sparkles } from 'lucide-react';



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

  const rank = useMemo(() => getRank(summary?.solvedProblems ?? 0), [summary?.solvedProblems]);
  const memberSince = user?.createdAt ? fmtMonthYear(user.createdAt) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero greeting */}
      <div
        className="panel p-6 flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 85% 20%, rgba(249,115,22,0.12), transparent 70%), linear-gradient(180deg, #181614 0%, #131211 100%)',
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#F97316] mb-1 font-semibold">Welcome back</p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F4] flex items-center gap-2">
              {greeting}, {firstName}
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 inline-block" />
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono border"
              style={{
                color: rank.color,
                borderColor: `${rank.color}33`,
                background: `${rank.color}11`,
              }}
            >
              {rank.Icon && <rank.Icon className="w-3 h-3" />}
              {rank.label}
            </span>
          </div>
          <p className="text-xs text-[#6B6560] mt-1.5 font-mono">
            {summary
              ? `${summary.totalProblems} cataloged · ${summary.totalAttempts} sessions · ${summary.solvedProblems ?? 0} solved`
              : 'Loading your progress…'}
            {memberSince && <span className="text-[#4A4540]"> · Since {memberSince}</span>}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            {revisionQueue.length > 0 && (
              <Link to="/revision">
                <Badge variant="amber" dot size="sm">{revisionQueue.length} revision due</Badge>
              </Link>
            )}
            {summary?.solvedProblems > 0 && (
              <Badge variant="emerald" size="sm">
                <Trophy className="w-3 h-3 inline mr-1" />
                {summary.solvedProblems} solved
              </Badge>
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
            <p className="text-[10px] font-mono text-[#6B6560] mt-1.5 tracking-wide">solved</p>
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
            <p className="text-[10px] font-mono text-[#6B6560] mt-1.5 tracking-wide">solve rate</p>
          </div>
        </div>
        {/* Add problem CTA */}
        <Link to="/problems" className="btn-primary shrink-0 text-sm shadow-lg shadow-[#F97316]/20">
          + Add Problem
        </Link>
      </div>

      {/* Zero state */}
      {hasZeroData ? (
        <div className="panel border-dashed p-14 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-[#F97316]" />
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
        <div className="space-y-6 stagger-children">

          {/* Row 1: Solve Velocity Trend (Full Width) */}
          <SolveTrendChart trendData={trend} isLoading={loadingTrend} error={trendError} onRetry={loadTrend} />

          {/* Row 2: Practice Consistency & Rhythm (Full Width) */}
          <PracticeHeatmap heatmapData={heatmap} isLoading={loadingHeatmap} error={heatmapError} onRetry={loadHeatmap} />

          {/* Row 3: Topic Mastery & Difficulty Balance (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TopicWeaknessChart topics={topics} isLoading={loadingTopics} error={topicsError} onRetry={loadTopics} />
            <DifficultyChart breakdown={summary?.difficultyBreakdown} isLoading={loadingSummary} error={summaryError} onRetry={loadSummary} />
          </div>

          {/* Row 4: Spaced Repetition Revision Queue (Full Width) */}
          <RevisionPreview queue={revisionQueue} isLoading={loadingRevision} error={revisionError} onRetry={loadRevision} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
