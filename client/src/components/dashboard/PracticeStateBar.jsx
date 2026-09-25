import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PracticeStateBar: Executive Telemetry Rail.
 *
 * Clean, restrained, and purposeful:
 * 4 quiet cards providing instant visibility into core practice telemetry
 * without neon halos, glowing boxes, or visual noise.
 */
const PracticeStateBar = ({
  summary,
  isLoading = false,
  revisionCount = 0,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 sm:p-5 rounded-lg border border-line bg-surface animate-pulse space-y-3"
          >
            <div className="h-3 w-20 bg-surface-2 rounded-xs" />
            <div className="h-6 sm:h-7 w-16 bg-surface-2 rounded-xs" />
            <div className="h-3 w-24 bg-surface-2 rounded-xs" />
          </div>
        ))}
      </div>
    );
  }

  const totalTracked = summary?.catalogProblems ?? summary?.totalProblems ?? 0;
  const totalSolved = summary?.solvedProblems ?? 0;
  const currentStreak = summary?.currentStreak ?? 0;
  const longestStreak = summary?.longestStreak ?? currentStreak;

  // Extract difficulty breakdown
  const diffBreakdown = summary?.difficultyBreakdown || [];
  const easySolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'easy')?.solved ?? 0;
  const medSolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'medium')?.solved ?? 0;
  const hardSolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'hard')?.solved ?? 0;

  const totalCalculated = totalSolved > 0 ? totalSolved : (easySolved + medSolved + hardSolved);
  const easyPct = totalCalculated > 0 ? (easySolved / totalCalculated) * 100 : 0;
  const medPct = totalCalculated > 0 ? (medSolved / totalCalculated) * 100 : 0;
  const hardPct = totalCalculated > 0 ? (hardSolved / totalCalculated) * 100 : 0;

  return (
    <div
      aria-label="Practice State Telemetry"
      className={`grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 select-none ${className}`}
    >
      {/* ── CARD 1: SOLVED PROBLEMS (LeetCode Multi-Segment Visual) ── */}
      <Link
        to="/problems?status=solved"
        className="p-3.5 sm:p-5 rounded-lg border border-line bg-surface hover:bg-surface-2/40 hover:border-line/80 transition-colors flex flex-col justify-between"
        title="View all solved problems"
      >
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted font-medium block">
            Total Solved
          </span>
          <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1 sm:gap-1.5">
            <span className="font-mono text-xl sm:text-3xl font-bold tracking-tight text-text tabular-nums">
              {totalSolved.toLocaleString()}
            </span>
            <span className="text-[11px] sm:text-xs text-muted">problems</span>
          </div>

          {/* LeetCode Iconic Segmented Progress Track */}
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-surface-2 overflow-hidden flex gap-0.5">
            {easySolved > 0 && (
              <div style={{ width: `${easyPct}%` }} className="h-full bg-easy rounded-xs transition-all duration-300" title={`Easy: ${easySolved}`} />
            )}
            {medSolved > 0 && (
              <div style={{ width: `${medPct}%` }} className="h-full bg-medium rounded-xs transition-all duration-300" title={`Medium: ${medSolved}`} />
            )}
            {hardSolved > 0 && (
              <div style={{ width: `${hardPct}%` }} className="h-full bg-hard rounded-xs transition-all duration-300" title={`Hard: ${hardSolved}`} />
            )}
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-line-subtle flex items-center justify-between text-[11px] sm:text-xs font-mono">
          <span className="flex items-center gap-1 text-easy font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-easy" />
            <span>{easySolved}</span>
            <span className="text-[10px] text-muted hidden sm:inline">E</span>
          </span>
          <span className="flex items-center gap-1 text-medium font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-medium" />
            <span>{medSolved}</span>
            <span className="text-[10px] text-muted hidden sm:inline">M</span>
          </span>
          <span className="flex items-center gap-1 text-hard font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-hard" />
            <span>{hardSolved}</span>
            <span className="text-[10px] text-muted hidden sm:inline">H</span>
          </span>
        </div>
      </Link>

      {/* ── CARD 2: REVISION DUE ────────────────────────────────── */}
      <Link
        to="/revision"
        className="p-3.5 sm:p-5 rounded-lg border border-line bg-surface hover:bg-surface-2/40 hover:border-line/80 transition-colors flex flex-col justify-between"
        title="Open spaced repetition revision queue"
      >
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted font-medium block">
            Revision Due
          </span>
          <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1 sm:gap-1.5">
            <span
              className={`font-mono text-xl sm:text-3xl font-bold tracking-tight tabular-nums ${
                revisionCount > 0 ? 'text-accent' : 'text-text'
              }`}
            >
              {revisionCount}
            </span>
            <span className="text-[11px] sm:text-xs text-muted">
              {revisionCount === 1 ? 'problem' : 'problems'}
            </span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-line-subtle flex items-center justify-between text-[11px] sm:text-xs font-mono">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                revisionCount > 0 ? 'bg-accent' : 'bg-easy'
              }`}
            />
            <span className={revisionCount > 0 ? 'text-accent font-medium' : 'text-muted'}>
              {revisionCount > 0 ? 'Recall due' : 'All clear'}
            </span>
          </span>
          <span className="text-muted/70 hover:text-text">Queue →</span>
        </div>
      </Link>

      {/* ── CARD 3: ACTIVE STREAK ───────────────────────────────── */}
      <Link
        to="/profile?tab=activity"
        className="p-3.5 sm:p-5 rounded-lg border border-line bg-surface hover:bg-surface-2/40 hover:border-line/80 transition-colors flex flex-col justify-between"
        title="View consistency streak and milestones"
      >
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted font-medium block">
            Practice Streak
          </span>
          <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1 sm:gap-1.5">
            <span className="font-mono text-xl sm:text-3xl font-bold tracking-tight text-text tabular-nums">
              {currentStreak}
            </span>
            <span className="text-[11px] sm:text-xs text-muted">
              {currentStreak === 1 ? 'day active' : 'days active'}
            </span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-line-subtle flex items-center justify-between text-[11px] sm:text-xs font-mono text-muted">
          <span>Best: <strong className="text-text font-medium">{longestStreak}d</strong></span>
          <span className="text-muted/70 hover:text-text">Activity →</span>
        </div>
      </Link>

      {/* ── CARD 4: CATALOG TRACKED ─────────────────────────────── */}
      <Link
        to="/problems"
        className="p-3.5 sm:p-5 rounded-lg border border-line bg-surface hover:bg-surface-2/40 hover:border-line/80 transition-colors flex flex-col justify-between"
        title="View all cataloged practice problems"
      >
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted font-medium block">
            Problems Tracked
          </span>
          <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1 sm:gap-1.5">
            <span className="font-mono text-xl sm:text-3xl font-bold tracking-tight text-text tabular-nums">
              {totalTracked.toLocaleString()}
            </span>
            <span className="text-[11px] sm:text-xs text-muted">cataloged</span>
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-line-subtle flex items-center justify-between text-[11px] sm:text-xs font-mono text-muted">
          <span>Catalog active</span>
          <span className="text-muted/70 hover:text-text">Catalog →</span>
        </div>
      </Link>
    </div>
  );
};

export default PracticeStateBar;
