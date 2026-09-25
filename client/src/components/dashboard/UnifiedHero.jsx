import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Plus, ArrowRight, Sparkles, Rocket, CheckCircle2 } from 'lucide-react';

/**
 * UnifiedHero: Grand Editorial Mastery Hub.
 *
 * Inspired by executive dashboard architectures:
 * - Left column: High-impact deliberate practice headline, micro-telemetry bullets,
 *   quick action pills, and glowing spaced-repetition priority ribbon.
 * - Right column: Contained, high-contrast progress card with circular SVG ring
 *   and tiered Easy/Medium/Hard breakdown progress bars.
 * - Background: Subtle architectural engineering grid with radial vignette.
 */
const UnifiedHero = ({
  user,
  summary,
  revisionCount = 0,
  dailyFocus = null,
  isLoading = false,
  onQuickAdd,
}) => {
  const firstName = user?.name?.split(' ')[0] || 'Coder';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-line card-classy p-6 sm:p-8 animate-pulse select-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex gap-2">
              <div className="h-3.5 w-28 bg-surface-2 rounded-xs" />
              <div className="h-3.5 w-32 bg-surface-2 rounded-xs" />
            </div>
            <div className="h-8 sm:h-10 w-3/4 bg-surface-2 rounded-md" />
            <div className="space-y-2 py-1">
              <div className="h-3 w-56 bg-surface-2 rounded-xs" />
              <div className="h-3 w-48 bg-surface-2 rounded-xs" />
              <div className="h-3 w-64 bg-surface-2 rounded-xs" />
            </div>
            <div className="h-9 w-72 bg-surface-2 rounded-full" />
            <div className="flex gap-3 pt-2">
              <div className="h-9 w-32 bg-surface-2 rounded-lg" />
              <div className="h-9 w-28 bg-surface-2 rounded-lg" />
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-5 space-y-5 lg:pl-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-2 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-40 bg-surface-2 rounded-xs" />
                <div className="h-3 w-56 bg-surface-2 rounded-xs" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-surface-2 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-24 bg-surface-2 rounded-xs" />
                <div className="h-3 w-32 bg-surface-2 rounded-xs" />
              </div>
            </div>
            <div className="space-y-2.5 pt-2">
              <div className="h-2 w-full bg-surface-2 rounded-full" />
              <div className="h-2 w-full bg-surface-2 rounded-full" />
              <div className="h-2 w-full bg-surface-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Telemetry Calculations
  const streak = summary?.currentStreak ?? 0;
  const totalTracked = summary?.catalogProblems ?? summary?.totalProblems ?? 0;
  const totalSolved = summary?.solvedProblems ?? 0;
  const totalAttempts = summary?.totalAttempts ?? 0;

  const diffBreakdown = summary?.difficultyBreakdown || [];
  const easySolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'easy')?.solved ?? 0;
  const medSolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'medium')?.solved ?? 0;
  const hardSolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'hard')?.solved ?? 0;

  const easyTotal = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'easy')?.total ?? easySolved;
  const medTotal = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'medium')?.total ?? medSolved;
  const hardTotal = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'hard')?.total ?? hardSolved;

  const totalCalculated = totalSolved > 0 ? totalSolved : (easySolved + medSolved + hardSolved);
  const solveRatio = totalTracked > 0 ? Math.min(100, Math.round((totalCalculated / totalTracked) * 100)) : 0;
  const remainingQuestions = Math.max(0, totalTracked - totalCalculated);

  const easyPct = easyTotal > 0 ? Math.min(100, Math.round((easySolved / easyTotal) * 100)) : 0;
  const medPct = medTotal > 0 ? Math.min(100, Math.round((medSolved / medTotal) * 100)) : 0;
  const hardPct = hardTotal > 0 ? Math.min(100, Math.round((hardSolved / hardTotal) * 100)) : 0;

  // SVG Circular Ring Configuration
  const radius = 34;
  const strokeWidth = 6.5;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (solveRatio / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line/80 card-classy p-5 sm:p-7 lg:p-8 select-none shadow-2xl">
      {/* ── Architectural Engineering Grid Overlay ── */}
      <div className="absolute inset-0 engineering-grid pointer-events-none opacity-90 z-0" />

      {/* ── Subtle Ambient Glows (Classy Atmospheric Portfolio Blueprint) ── */}
      <div className="pointer-events-none absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 bg-accent/8 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 w-80 h-80 bg-easy/5 rounded-full blur-3xl z-0" />

      {/* ── Main Content Grid ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* ── LEFT COLUMN (7 cols): Editorial Deliberate Practice Headline ── */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* Top Micro-Bar: Greeting, Date & Streak */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted">
            <span>{greeting}, {firstName}</span>
            <span className="text-muted/40">·</span>
            <span>{todayFormatted}</span>
            {streak > 0 && (
              <>
                <span className="text-muted/40">·</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/12 border border-accent/25 text-accent font-semibold shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-accent animate-pulse" />
                  <span>{streak}d streak</span>
                </span>
              </>
            )}
          </div>

          {/* Grand Headline */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text leading-tight">
              DSA Deliberate Practice
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary font-medium max-w-xl leading-relaxed">
              Algorithmic mastery engine powered by forgetting curve schedules and structured difficulty recall.
            </p>
          </div>

          {/* Micro-Telemetry Bullet Points (Inspired by Screenshot) */}
          <div className="space-y-1.5 text-xs text-muted font-medium pt-0.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>
                Spaced repetition active ·{' '}
                <strong className="text-text tabular-nums">{revisionCount}</strong> {revisionCount === 1 ? 'problem' : 'problems'} due for recall
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/70" />
              <span>
                Difficulty Solves:{' '}
                <span className="text-easy font-semibold">{easySolved} Easy</span>
                {' · '}
                <span className="text-medium font-semibold">{medSolved} Med</span>
                {' · '}
                <span className="text-hard font-semibold">{hardSolved} Hard</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>
                Total Sessions:{' '}
                <strong className="text-text tabular-nums">{totalAttempts.toLocaleString()}</strong> practice runs across{' '}
                <strong className="text-text tabular-nums">{totalTracked}</strong> cataloged problems
              </span>
            </div>
          </div>

          {/* Glowing Priority Ribbon (Inspired by DSA 360 Ribbon in Screenshot) */}
          <div className="pt-1">
            {dailyFocus ? (
              <Link
                to={`/problems/${dailyFocus.id || dailyFocus._id}`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glow-pill-accent text-xs font-semibold text-accent hover:text-accent-hover transition-all cursor-pointer group"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent animate-spin-slow shrink-0" />
                <span className="truncate max-w-[240px] sm:max-w-md">
                  Next Priority: <strong className="text-text">{dailyFocus.title}</strong> ({dailyFocus.difficulty}) · Due for recall
                </span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 shrink-0" />
              </Link>
            ) : revisionCount > 0 ? (
              <Link
                to="/revision"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glow-pill-accent text-xs font-semibold text-accent hover:text-accent-hover transition-all cursor-pointer group"
              >
                <Flame className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>
                  {revisionCount} {revisionCount === 1 ? 'problem' : 'problems'} ready for spaced repetition recall drill
                </span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 shrink-0" />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success/10 border border-success/25 text-xs font-semibold text-success">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span>All Spaced Repetition Schedules Up To Date</span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {dailyFocus ? (
              <Link
                to={`/problems/${dailyFocus.id || dailyFocus._id}`}
                className="btn-primary text-xs py-2 px-4 rounded-lg font-semibold inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Daily Drill</span>
              </Link>
            ) : (
              <Link
                to="/revision"
                className="btn-primary text-xs py-2 px-4 rounded-lg font-semibold inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Open Revision Queue</span>
              </Link>
            )}

            <button
              type="button"
              onClick={onQuickAdd}
              className="btn-secondary text-xs py-2 px-3.5 rounded-lg font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer text-text-secondary hover:text-text"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Problem</span>
            </button>

            <Link
              to="/problems"
              className="text-xs text-muted hover:text-text font-mono font-medium px-2 py-2 inline-flex items-center gap-1 transition-colors"
            >
              <span>Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* ── RIGHT COLUMN (5 cols): Open & Floating on the Big Grid Canvas (Matches Reference Screenshot) ── */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 lg:pl-6">

          {/* Motivational Momentum Header (Floating, No Box) */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/25 text-accent shrink-0 shadow-xs">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-text">You're building momentum!</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Every problem solved unlocks intuition and resets forgetting curves.
              </p>
            </div>
          </div>

          {/* Circular Progress + Total Progress Metric (Floating on Canvas) */}
          <div className="flex items-center gap-5 pt-1">
            {/* SVG Circular Progress Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 80 80">
                {/* Track Circle */}
                <circle
                  cx="40"
                  cy="40"
                  r={normalizedRadius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-surface-2"
                  fill="transparent"
                />
                {/* Active Progress Arc */}
                <circle
                  cx="40"
                  cy="40"
                  r={normalizedRadius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  className="text-accent transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              {/* Inner Percentage Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-sm font-bold text-text tabular-nums">
                  {solveRatio}%
                </span>
                <span className="text-[9px] font-mono text-muted tabular-nums">
                  {totalSolved}/{totalTracked || totalSolved}
                </span>
              </div>
            </div>

            {/* Total Metric Text */}
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-extrabold text-text tabular-nums">
                  {totalSolved.toLocaleString()}
                </span>
                <span className="text-xs text-muted font-medium">solved</span>
              </div>
              <h3 className="text-xs font-semibold text-text">Total progress</h3>
              <p className="text-[11px] text-muted font-mono tabular-nums">
                {remainingQuestions > 0 ? `${remainingQuestions} questions to catalog goal` : 'All catalog questions mastered'}
              </p>
            </div>
          </div>

          {/* Tiered Difficulty Progress Bars (Floating on Canvas) */}
          <div className="space-y-3 pt-1">
            {/* Easy Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-easy">
                  <span className="w-1.5 h-1.5 rounded-full bg-easy" />
                  <span>Easy</span>
                </span>
                <span className="font-mono text-[11px] text-muted tabular-nums">
                  <strong className="text-text">{easySolved}</strong>/{easyTotal || easySolved}{' '}
                  <span className="text-muted/80">({easyPct}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-easy rounded-full transition-all duration-500"
                  style={{ width: `${easyPct}%` }}
                />
              </div>
            </div>

            {/* Medium Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-medium" />
                  <span>Medium</span>
                </span>
                <span className="font-mono text-[11px] text-muted tabular-nums">
                  <strong className="text-text">{medSolved}</strong>/{medTotal || medSolved}{' '}
                  <span className="text-muted/80">({medPct}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-medium rounded-full transition-all duration-500"
                  style={{ width: `${medPct}%` }}
                />
              </div>
            </div>

            {/* Hard Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-hard">
                  <span className="w-1.5 h-1.5 rounded-full bg-hard" />
                  <span>Hard</span>
                </span>
                <span className="font-mono text-[11px] text-muted tabular-nums">
                  <strong className="text-text">{hardSolved}</strong>/{hardTotal || hardSolved}{' '}
                  <span className="text-muted/80">({hardPct}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-hard rounded-full transition-all duration-500"
                  style={{ width: `${hardPct}%` }}
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UnifiedHero;
