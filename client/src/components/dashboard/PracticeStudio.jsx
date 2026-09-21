import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { fetchProblemRecommendations } from '../../api/problems';

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', text: 'text-easy', dot: 'bg-easy' },
  medium: { label: 'Medium', text: 'text-medium', dot: 'bg-medium' },
  hard: { label: 'Hard', text: 'text-hard', dot: 'bg-hard' },
};

const STATUS_CONFIG = {
  struggled: { label: 'Struggled', text: 'text-danger', bg: 'bg-danger/10 border-danger/25', dot: 'bg-danger' },
  revisit_needed: { label: 'Revisit', text: 'text-medium', bg: 'bg-medium/10 border-medium/25', dot: 'bg-medium' },
  solved: { label: 'Due Today', text: 'text-success', bg: 'bg-success/10 border-success/25', dot: 'bg-success' },
};

const PLATFORM_LABELS = {
  leetcode: 'LC',
  codeforces: 'CF',
  gfg: 'GFG',
  codechef: 'CC',
  hackerrank: 'HR',
  atcoder: 'AC',
  other: 'Ext',
};

/**
 * PracticeStudio: Consolidated Practice & Spaced Repetition Hub.
 *
 * Combines Today's Featured Problem (Top) and Upcoming Spaced Recall Queue (Bottom)
 * into a single unified workspace. Eliminates empty voids and duplicate problem entries.
 */
const PracticeStudio = ({
  queue = [],
  isLoadingQueue = false,
  queueError = null,
  onRetryQueue,
  className = '',
}) => {
  const [data, setData] = useState(null);
  const [loadingRecommender, setLoadingRecommender] = useState(true);

  const loadRecommendations = async () => {
    try {
      setLoadingRecommender(true);
      const res = await fetchProblemRecommendations();
      if (res?.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoadingRecommender(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const isLoading = loadingRecommender || isLoadingQueue;

  if (isLoading) {
    return (
      <div className={`panel p-4 sm:p-5 border-line animate-pulse flex flex-col justify-between h-full ${className}`}>
        {/* Top Featured Skeleton */}
        <div className="space-y-3 pb-4 border-b border-line/40">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 shimmer rounded" />
            <div className="h-4 w-24 shimmer rounded" />
          </div>
          <div className="h-5 w-56 shimmer rounded" />
          <div className="h-3.5 w-44 shimmer rounded" />
          <div className="h-10 w-full shimmer rounded-lg" />
          <div className="h-8 w-40 shimmer rounded-lg" />
        </div>

        {/* Bottom Queue Skeleton */}
        <div className="pt-4 space-y-2.5">
          <div className="flex justify-between">
            <div className="h-4 w-32 shimmer rounded" />
            <div className="h-4 w-16 shimmer rounded" />
          </div>
          <div className="h-10 w-full shimmer rounded-lg" />
          <div className="h-10 w-full shimmer rounded-lg" />
        </div>
      </div>
    );
  }

  const dailyFocus = data?.dailyFocus;
  const weakestTopics = data?.weakestTopics || [];
  const primaryWeakTopic = weakestTopics.length > 0 ? weakestTopics[0] : null;

  const diffCfg = dailyFocus ? (DIFFICULTY_CONFIG[dailyFocus.difficulty] || DIFFICULTY_CONFIG.medium) : null;
  const topicList = dailyFocus?.topics?.slice(0, 3).join(', ') || '';

  // Filter out the featured spotlight problem so it NEVER appears twice
  const upcomingQueue = queue
    .filter((item) => !dailyFocus || item.problemId !== dailyFocus.id)
    .slice(0, 3);

  return (
    <div className={`panel p-4 sm:p-5 flex flex-col justify-between h-full transition-all shadow-sm ${className}`}>
      
      {/* ── ZONE 1: Today's Featured Problem (Hero Practice Target) ──── */}
      <div>
        {/* Header Line */}
        <div className="flex items-center justify-between pb-2.5 border-b border-line/50">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent shrink-0" />
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Today's Focus
            </h2>
            <span className="text-[10px] text-muted font-mono font-medium px-1.5 py-0.2 rounded bg-surface-2 border border-line/60">
              AI Selected
            </span>
          </div>

          {primaryWeakTopic && (
            <span className="text-xs text-muted hidden sm:inline-flex items-center gap-1">
              Target area: <strong className="text-text font-medium">{primaryWeakTopic.topic}</strong>
              <span className="text-[11px] font-mono text-danger font-semibold">
                ({Math.round(primaryWeakTopic.struggleRatio * 100)}% struggle)
              </span>
            </span>
          )}
        </div>

        {/* Featured Content */}
        {dailyFocus ? (
          <div className="py-2.5 space-y-2">
            {/* Tag & Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-surface-2 border border-line/60 text-text-secondary">
                  <span>{dailyFocus.badge || 'Priority Recall'}</span>
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-text tracking-tight leading-snug">
                <Link
                  to={`/problems/${dailyFocus.id}`}
                  className="hover:text-accent transition-colors hover:underline"
                >
                  {dailyFocus.title}
                </Link>
              </h3>
            </div>

            {/* Inline Metadata Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className={`inline-flex items-center font-semibold ${diffCfg.text}`}>
                <span>{diffCfg.label}</span>
              </span>

              <span className="text-line/60">/</span>

              <span className="text-text-secondary font-medium">
                {PLATFORM_LABELS[dailyFocus.platform] || dailyFocus.platform}
              </span>

              {topicList && (
                <>
                  <span className="text-line/60">/</span>
                  <span className="text-muted truncate max-w-xs">{topicList}</span>
                </>
              )}
            </div>

            {/* Subtle Memory Insight Bar */}
            <div className="border-l-2 border-accent/70 pl-2.5 py-1 bg-surface-2/30 rounded-r-md">
              <p className="text-xs text-text-secondary leading-relaxed">
                <span className="font-semibold text-text">Memory Insight: </span>
                {dailyFocus.rationale}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-0.5 flex flex-wrap items-center gap-2">
              <Link
                to={`/problems/${dailyFocus.id}`}
                className="btn-primary text-xs py-1.5 px-3.5 rounded-md font-semibold inline-flex items-center gap-1.5 shadow-none"
              >
                <span>Solve & Log Attempt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {dailyFocus.link && (
                <a
                  href={dailyFocus.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3 rounded-md font-medium inline-flex items-center gap-1.5 text-text-secondary hover:text-text"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs text-muted">Practice queue clear! Log problems to unlock daily focus.</p>
          </div>
        )}
      </div>

      {/* ── ZONE 2: Spaced Recall Queue (Next Due Items) ─────────────── */}
      <div className="pt-2.5 border-t border-line/50 mt-auto">
        {/* Sub-Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Upcoming Revisions
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tabular-nums bg-accent/12 border border-accent/25 text-accent">
              {queue.length} due
            </span>
          </div>

          <Link
            to="/revision"
            className="text-xs text-muted hover:text-accent transition-colors font-medium flex items-center gap-1 group"
          >
            <span>View all queue</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {/* Due Items List */}
        {upcomingQueue.length === 0 ? (
          <div className="py-3 text-center text-xs text-muted flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>No additional revisions due today. High retention!</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {upcomingQueue.map((item, idx) => {
              const statusKey = item.latestStatus || item.lastAttemptStatus || 'revisit_needed';
              const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.revisit_needed;
              const itemDiffCfg = DIFFICULTY_CONFIG[item.difficulty] || DIFFICULTY_CONFIG.medium;
              const platformLabel = PLATFORM_LABELS[item.platform] || item.platform;
              const itemTopic = item.topics?.length > 0 ? item.topics[0] : '';

              return (
                <Link
                  key={item.problemId}
                  to={`/problems/${item.problemId}`}
                  className="px-3 py-2 rounded-lg bg-surface-2/30 hover:bg-surface-2/70 border border-line/40 hover:border-line transition-all flex items-center justify-between gap-3 group"
                >
                  {/* Left info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded bg-surface-3 border border-line/60 flex items-center justify-center text-[10px] font-mono font-bold text-text-secondary group-hover:text-accent shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-text group-hover:text-accent line-clamp-1 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-line/60 hidden sm:inline">/</span>
                    <span className={`text-[11px] font-medium hidden sm:inline ${itemDiffCfg.text}`}>
                      {itemDiffCfg.label}
                    </span>
                    {itemTopic && (
                      <span className="text-[11px] text-muted truncate hidden md:inline">
                        / {itemTopic}
                      </span>
                    )}
                  </div>

                  {/* Right Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusCfg.text} ${statusCfg.bg}`}>
                      <span>{statusCfg.label}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Mini Backlog Footer */}
        {queue.length > 3 && (
          <div className="pt-2 flex items-center justify-between text-[11px] text-muted">
            <span>+{queue.length - upcomingQueue.length} more in spaced recall queue</span>
            <Link to="/revision" className="text-accent hover:underline font-medium">
              Start revision session →
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default PracticeStudio;
