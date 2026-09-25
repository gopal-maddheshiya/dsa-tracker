import React, { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

/**
 * PracticeStateBar: Executive Telemetry Rail.
 *
 * Clean, restrained, and purposeful:
 * 4 quiet cards providing instant visibility into core practice telemetry.
 *
 * Mobile layout (< lg):
 * - Displays all 4 cards in a single horizontal rail (`flex overflow-x-auto scrollbar-none snap-x snap-mandatory`).
 * - Shows 2 cards at a time side-by-side (`w-[calc(50%-5px)] min-w-[150px] shrink-0 snap-start`).
 * - User scrolls horizontally to see the next 2 cards (Practice Streak & Problems Tracked).
 * - Interactive pagination dots indicate current page and allow 1-tap navigation.
 *
 * Desktop layout (lg+):
 * - Clean 4-column grid (`lg:grid lg:grid-cols-4`).
 */
const PracticeStateBar = ({
  summary,
  isLoading = false,
  revisionCount = 0,
  className = '',
}) => {
  const scrollRef = useRef(null);
  const [activePage, setActivePage] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const page = scrollLeft > clientWidth * 0.35 ? 1 : 0;
    setActivePage(page);
  }, []);

  const scrollToPage = useCallback((pageIndex) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const targetX = pageIndex === 0 ? 0 : container.scrollWidth - container.clientWidth;
    container.scrollTo({ left: targetX, behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return (
      <div className={`space-y-2 select-none ${className}`}>
        <div className="flex lg:grid lg:grid-cols-4 gap-2.5 sm:gap-4 overflow-hidden -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[calc(50%-5px)] min-w-[150px] lg:w-auto shrink-0 p-3 sm:p-5 rounded-lg border border-line bg-surface animate-pulse space-y-3"
            >
              <div className="h-3 w-16 sm:w-20 bg-surface-2 rounded-xs" />
              <div className="h-6 sm:h-7 w-14 sm:w-16 bg-surface-2 rounded-xs" />
              <div className="h-3 w-20 sm:w-24 bg-surface-2 rounded-xs" />
            </div>
          ))}
        </div>
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
    <div className={`space-y-1.5 select-none ${className}`}>
      {/* ── HORIZONTAL SCROLL RAIL (MOBILE) / 4-COL GRID (DESKTOP) ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        aria-label="Practice State Telemetry"
        className="flex lg:grid lg:grid-cols-4 gap-2.5 sm:gap-4 overflow-x-auto lg:overflow-visible scrollbar-none snap-x snap-mandatory scroll-smooth -mx-3.5 px-3.5 sm:mx-0 sm:px-0 scroll-pl-3.5 sm:scroll-pl-0 pb-1 pt-0.5"
      >
        {/* ── CARD 1: SOLVED PROBLEMS (LeetCode Multi-Segment Visual) ── */}
        <Link
          to="/problems?status=solved"
          className="w-[calc(50%-5px)] min-w-[150px] lg:w-auto shrink-0 snap-start p-3 sm:p-5 rounded-lg border border-line bg-surface hover:bg-surface-2/40 hover:border-line/80 transition-colors flex flex-col justify-between"
          title="View all solved problems"
        >
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted font-medium block truncate">
              Total Solved
            </span>
            <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1 sm:gap-1.5">
              <span className="font-mono text-xl sm:text-3xl font-bold tracking-tight text-text tabular-nums">
                {totalSolved.toLocaleString()}
              </span>
              <span className="text-[11px] sm:text-xs text-muted truncate">problems</span>
            </div>

            {/* LeetCode Iconic Segmented Progress Track */}
            <div className="mt-2 sm:mt-2.5 h-1.5 w-full rounded-full bg-surface-2 overflow-hidden flex gap-0.5">
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

          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-line-subtle flex items-center justify-between text-[10.5px] sm:text-xs font-mono">
            <span className="flex items-center gap-1 text-easy font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-easy shrink-0" />
              <span>{easySolved}</span>
              <span className="text-[10px] text-muted">E</span>
            </span>
            <span className="flex items-center gap-1 text-medium font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-medium shrink-0" />
              <span>{medSolved}</span>
              <span className="text-[10px] text-muted">M</span>
            </span>
            <span className="flex items-center gap-1 text-hard font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-hard shrink-0" />
              <span>{hardSolved}</span>
              <span className="text-[10px] text-muted">H</span>
            </span>
          </div>
        </Link>

        {/* ── CARD 2: REVISION DUE ────────────────────────────────── */}
        <Link
          to="/revision"
          className="w-[calc(50%-5px)] min-w-[150px] lg:w-auto shrink-0 snap-start p-3 sm:p-5 rounded-lg border border-line bg-surface hover:bg-surface-2/40 hover:border-line/80 transition-colors flex flex-col justify-between"
          title="Open spaced repetition revision queue"
        >
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted font-medium block truncate">
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
              <span className="text-[11px] sm:text-xs text-muted truncate">
                {revisionCount === 1 ? 'problem' : 'problems'}
              </span>
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-line-subtle flex items-center justify-between text-[10.5px] sm:text-xs font-mono">
            <span className="flex items-center gap-1 sm:gap-1.5 truncate">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  revisionCount > 0 ? 'bg-accent' : 'bg-easy'
                }`}
              />
              <span className={`truncate ${revisionCount > 0 ? 'text-accent font-medium' : 'text-muted'}`}>
                {revisionCount > 0 ? 'Recall due' : 'All clear'}
              </span>
            </span>
            <span className="text-muted/70 hover:text-text shrink-0 ml-1">Queue →</span>
          </div>
        </Link>

        {/* ── CARD 3: ACTIVE STREAK ───────────────────────────────── */}
        <Link
          to="/profile?tab=activity"
          className="w-[calc(50%-5px)] min-w-[150px] lg:w-auto shrink-0 snap-start p-3 sm:p-5 rounded-lg border border-line bg-surface hover:bg-surface-2/40 hover:border-line/80 transition-colors flex flex-col justify-between"
          title="View consistency streak and milestones"
        >
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted font-medium block truncate">
              Practice Streak
            </span>
            <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1 sm:gap-1.5">
              <span className="font-mono text-xl sm:text-3xl font-bold tracking-tight text-text tabular-nums">
                {currentStreak}
              </span>
              <span className="text-[11px] sm:text-xs text-muted truncate">
                {currentStreak === 1 ? 'day active' : 'days active'}
              </span>
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-line-subtle flex items-center justify-between text-[10.5px] sm:text-xs font-mono text-muted">
            <span className="truncate">Best: <strong className="text-text font-medium">{longestStreak}d</strong></span>
            <span className="text-muted/70 hover:text-text shrink-0 ml-1">Activity →</span>
          </div>
        </Link>

        {/* ── CARD 4: PROBLEMS TRACKED ─────────────────────────────── */}
        <Link
          to="/problems"
          className="w-[calc(50%-5px)] min-w-[150px] lg:w-auto shrink-0 snap-start p-3 sm:p-5 rounded-lg border border-line bg-surface hover:bg-surface-2/40 hover:border-line/80 transition-colors flex flex-col justify-between"
          title="View all cataloged practice problems"
        >
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-muted font-medium block truncate">
              Problems Tracked
            </span>
            <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1 sm:gap-1.5">
              <span className="font-mono text-xl sm:text-3xl font-bold tracking-tight text-text tabular-nums">
                {totalTracked.toLocaleString()}
              </span>
              <span className="text-[11px] sm:text-xs text-muted truncate">cataloged</span>
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-line-subtle flex items-center justify-between text-[10.5px] sm:text-xs font-mono text-muted">
            <span className="flex items-center gap-1 sm:gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-easy shrink-0" />
              <span className="truncate">In library</span>
            </span>
            <span className="text-muted/70 hover:text-text shrink-0 ml-1">Catalog →</span>
          </div>
        </Link>
      </div>

      {/* ── MOBILE PAGINATION INDICATOR (Dots below rail on < lg) ── */}
      <div className="flex lg:hidden items-center justify-center gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => scrollToPage(0)}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            activePage === 0 ? 'w-5 bg-accent' : 'w-1.5 bg-line hover:bg-muted'
          }`}
          aria-label="View first 2 metrics: Solved and Revision Due"
        />
        <button
          type="button"
          onClick={() => scrollToPage(1)}
          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
            activePage === 1 ? 'w-5 bg-accent' : 'w-1.5 bg-line hover:bg-muted'
          }`}
          aria-label="View next 2 metrics: Practice Streak and Problems Tracked"
        />
      </div>
    </div>
  );
};

export default PracticeStateBar;
