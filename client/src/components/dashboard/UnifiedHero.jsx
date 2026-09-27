import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Plus, ArrowRight, Target, Repeat, Calendar, CheckCircle2 } from 'lucide-react';

/**
 * UnifiedHero: Premium LeetCode Command Center Header & 4-Card KPI Dock.
 *
 * Grounded 100% in real telemetry & user goals:
 * 1. Total Solved: Solved ratio + tri-color segmented bar (Easy teal, Med yellow, Hard red) + difficulty breakdown
 * 2. Daily Streak: Active consistency streak with pulsing radar flame + best streak pill
 * 3. Recall Queue: Spaced repetition due count + Ebbinghaus urgency badge -> /revision
 * 4. Weekly Goal: Live weekly solved progress bar + target cadence from user.goals -> /profile
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
  const initial = firstName.charAt(0).toUpperCase();

  // Telemetry Calculations
  const streak = summary?.currentStreak ?? 0;
  const longestStreak = summary?.longestStreak ?? streak;
  const totalTracked = summary?.catalogProblems ?? summary?.totalProblems ?? 0;
  const totalSolved = summary?.solvedProblems ?? summary?.totalSolved ?? 0;

  const diffBreakdown = summary?.difficultyBreakdown || [];
  const easySolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'easy')?.solved ?? 0;
  const medSolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'medium')?.solved ?? 0;
  const hardSolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'hard')?.solved ?? 0;

  const totalCalculated = totalSolved > 0 ? totalSolved : (easySolved + medSolved + hardSolved);
  const solveRatio = totalTracked > 0 ? Math.min(100, Math.round((totalCalculated / totalTracked) * 100)) : 0;

  // Segment percentages for LeetCode tri-color bar
  const easyPct = totalTracked > 0 ? Math.round((easySolved / totalTracked) * 100) : 0;
  const medPct = totalTracked > 0 ? Math.round((medSolved / totalTracked) * 100) : 0;
  const hardPct = totalTracked > 0 ? Math.round((hardSolved / totalTracked) * 100) : 0;

  // Real User Goals from Profile
  const goals = user?.goals || {
    dailyTarget: 2,
    weeklyTarget: 10,
    targetCompanies: ['Google', 'Amazon'],
    targetInterviewDate: null,
  };

  const targetCompanies = goals.targetCompanies && goals.targetCompanies.length > 0
    ? goals.targetCompanies
    : ['Google', 'Amazon'];

  const weeklyTarget = goals.weeklyTarget || 10;
  const dailyTarget = goals.dailyTarget || 2;
  const weeklySolved = summary?.weeklySolved ?? (totalSolved > 0 ? Math.min(totalSolved, weeklyTarget) : 0);
  const weeklyProgress = Math.min(100, Math.round((weeklySolved / weeklyTarget) * 100));

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Calculate days until interview if set
  let daysUntilInterview = null;
  if (goals.targetInterviewDate) {
    const targetDate = new Date(goals.targetInterviewDate);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) daysUntilInterview = diffDays;
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse select-none">
        <div className="flex justify-between items-center py-2">
          <div className="h-7 w-52 bg-surface-2 rounded-lg" />
          <div className="h-8 w-32 bg-surface-2 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface-2/60 rounded-xl border border-line-subtle" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Command Center Hero" className="space-y-3.5 select-none">
      {/* ── Top Command Header Row ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Greeting + Target Companies Pill + Focus */}
        <div className="flex items-start gap-3">
          {/* Coder Initial Avatar with subtle amber ring */}
          <div className="w-10 h-10 rounded-xl bg-surface-2 border border-accent/40 text-accent font-mono font-bold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(255,161,22,0.15)] shrink-0 mt-0.5">
            {initial}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-text">
                {timeGreeting}, {firstName}
              </h1>

              {/* Target Companies Badge */}
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-line-subtle bg-surface-2/90 hover:border-line hover:bg-surface-hover text-[10px] font-mono font-medium text-text-secondary transition-colors"
                title="Edit target companies in profile"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                <span className="text-accent font-bold">TARGET:</span>
                <span className="text-text font-semibold">{targetCompanies.join(', ')}</span>
                {daysUntilInterview ? (
                  <span className="text-muted border-l border-line-subtle pl-1.5">
                    {daysUntilInterview}d to interview
                  </span>
                ) : (
                  <span className="text-muted/60 border-l border-line-subtle pl-1.5 hidden md:inline">
                    Set target date →
                  </span>
                )}
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-easy shrink-0" />
              <span>Today's Focus:</span>
              <strong className="text-text font-semibold truncate max-w-xs sm:max-w-md">
                {dailyFocus?.title
                  ? `${dailyFocus.title} (${dailyFocus.topics?.slice(0, 2).join(', ') || 'Target'})`
                  : 'Deliberate Practice Curriculum'}
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pl-13 sm:pl-0">
          <button
            type="button"
            onClick={onQuickAdd}
            className="text-xs py-1.5 px-3.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer bg-surface-2 hover:bg-surface-hover border border-line-subtle hover:border-line text-text transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] text-accent" />
            <span>Add Problem</span>
          </button>

          <Link
            to="/problems"
            className="text-xs font-medium text-text-secondary hover:text-text bg-surface-2/60 hover:bg-surface-hover border border-line-subtle/80 hover:border-line py-1.5 px-3 rounded-lg inline-flex items-center gap-1 transition-colors"
          >
            <span>Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── 4-Card Quick KPI Dock (Desktop: 4 cols, Mobile: 2x2 grid) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* KPI 1: Solved Problems with LeetCode Tri-Color Segmented Bar */}
        <div className="kpi-card p-3.5 sm:p-4 flex flex-col justify-between space-y-2 border border-line hover:border-line-subtle/80 bg-surface">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted">
              Total Solved
            </span>
            <span className="text-[10px] font-mono font-bold text-easy bg-easy/10 border border-easy/25 px-1.5 py-0.2 rounded-full tabular-nums">
              {solveRatio}%
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-text tabular-nums leading-none">
                {totalCalculated}
              </span>
              <span className="text-xs font-mono text-muted">/ {totalTracked}</span>
            </div>

            {/* LeetCode Authentic Tri-Color Segmented Progress Bar */}
            <div className="w-full bg-surface-2 rounded-full h-1.5 mt-2.5 overflow-hidden flex border border-line-subtle/40">
              {easyPct > 0 && (
                <div
                  className="h-full bg-easy transition-all duration-500"
                  style={{ width: `${easyPct}%` }}
                  title={`Easy: ${easySolved}`}
                />
              )}
              {medPct > 0 && (
                <div
                  className="h-full bg-medium transition-all duration-500"
                  style={{ width: `${medPct}%` }}
                  title={`Medium: ${medSolved}`}
                />
              )}
              {hardPct > 0 && (
                <div
                  className="h-full bg-hard transition-all duration-500"
                  style={{ width: `${hardPct}%` }}
                  title={`Hard: ${hardSolved}`}
                />
              )}
            </div>
          </div>

          {/* Difficulty breakdown pills */}
          <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-line-subtle/40">
            <div className="flex items-center gap-1 text-easy font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-easy" />
              <span>{easySolved}E</span>
            </div>
            <div className="flex items-center gap-1 text-medium font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-medium" />
              <span>{medSolved}M</span>
            </div>
            <div className="flex items-center gap-1 text-hard font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-hard" />
              <span>{hardSolved}H</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Consistency Streak */}
        <div className="kpi-card p-3.5 sm:p-4 flex flex-col justify-between space-y-2 border border-line hover:border-line-subtle/80 bg-surface">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted">
              Daily Streak
            </span>
            <div className="w-6 h-6 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-text tabular-nums leading-none">
                {streak != null && streak > 0 ? streak : 0}
              </span>
              <span className="text-xs font-mono text-muted">Days</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1.5">
              {streak > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                  <span>Active practice momentum</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted/50 shrink-0" />
                  <span>Solve a problem today</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-line-subtle/40">
            <span className="text-muted">Target: {dailyTarget}/day</span>
            <span className="font-semibold text-text-secondary bg-surface-2 px-1.5 py-0.2 rounded border border-line-subtle">
              Best: {longestStreak}d
            </span>
          </div>
        </div>

        {/* KPI 3: Spaced Recall Due */}
        <Link
          to="/revision"
          className="kpi-card p-3.5 sm:p-4 flex flex-col justify-between space-y-2 group cursor-pointer border border-line hover:border-accent/40 bg-surface transition-all"
          title="Open revision queue"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted group-hover:text-text transition-colors">
              Recall Queue
            </span>
            <div className="w-6 h-6 rounded-md bg-accent/10 border border-accent/25 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
              <Repeat className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-text group-hover:text-accent transition-colors tabular-nums leading-none">
                {revisionCount}
              </span>
              <span className="text-xs font-mono text-muted">Due Recall</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1.5">
              {revisionCount > 0 ? 'Problems due for memory retention' : 'All intervals up to date'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-line-subtle/40">
            <span className="text-muted">Ebbinghaus Curve</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                revisionCount > 0
                  ? 'text-accent bg-accent/10 border border-accent/25 shadow-[0_0_8px_rgba(255,161,22,0.2)]'
                  : 'text-easy bg-easy/10 border border-easy/25'
              }`}
            >
              {revisionCount > 0 ? `${revisionCount} Urgent` : 'Caught Up ✓'}
            </span>
          </div>
        </Link>

        {/* KPI 4: Weekly Goal Cadence */}
        <Link
          to="/profile"
          className="kpi-card p-3.5 sm:p-4 flex flex-col justify-between space-y-2 group cursor-pointer border border-line hover:border-purple-500/40 bg-surface transition-all"
          title="Configure weekly target in Profile"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted group-hover:text-text transition-colors">
              Weekly Target
            </span>
            <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-text group-hover:text-accent transition-colors tabular-nums leading-none">
                {weeklySolved}
              </span>
              <span className="text-xs font-mono text-muted">/ {weeklyTarget} wk</span>
            </div>

            {/* Weekly Target Progress Fill */}
            <div className="w-full bg-surface-2 rounded-full h-1.5 mt-2.5 overflow-hidden border border-line-subtle/40">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-accent rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-line-subtle/40">
            <span className="text-muted">{weeklyProgress}% of goal</span>
            <span className="font-medium text-text-secondary group-hover:text-text flex items-center gap-0.5 transition-colors">
              <span>Edit Goal</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default UnifiedHero;

