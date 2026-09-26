import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Plus, ArrowRight, Target, Trophy, Repeat, GitBranch, Sparkles } from 'lucide-react';

/**
 * UnifiedHero: Clean Command Header & 4-Card KPI Dock.
 *
 * Implements Phase UI Next-Level Command Center:
 * - High-clarity greeting row with Level HUD & active focus track.
 * - 4 High-Impact KPI Cards (Desktop: 4-col, Mobile: 2x2 grid):
 *   1. Total Solved (Ratio + difficulty breakdown + progress bar)
 *   2. Consistency Streak (Flame + habit status)
 *   3. Spaced Recall (Due count + urgency tag + review trigger)
 *   4. Pattern Mastery (NeetCode tracks mastered + percentage)
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

  // Telemetry Calculations
  const streak = summary?.currentStreak ?? 0;
  const totalTracked = summary?.catalogProblems ?? summary?.totalProblems ?? 0;
  const totalSolved = summary?.solvedProblems ?? summary?.totalSolved ?? 0;

  const diffBreakdown = summary?.difficultyBreakdown || [];
  const easySolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'easy')?.solved ?? 0;
  const medSolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'medium')?.solved ?? 0;
  const hardSolved = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'hard')?.solved ?? 0;

  const easyTotal = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'easy')?.total ?? easySolved;
  const medTotal = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'medium')?.total ?? medSolved;
  const hardTotal = diffBreakdown.find((d) => d.difficulty?.toLowerCase() === 'hard')?.total ?? hardSolved;

  const totalCalculated = totalSolved > 0 ? totalSolved : (easySolved + medSolved + hardSolved);
  const solveRatio = totalTracked > 0 ? Math.min(100, Math.round((totalCalculated / totalTracked) * 100)) : 0;

  // Dynamic Coder Level & Title Calculation
  const getLevelInfo = (solved) => {
    if (solved >= 300) return { level: 5, title: 'Grandmaster', badge: 'text-amber-300 border-amber-500/40 bg-amber-500/15' };
    if (solved >= 150) return { level: 4, title: 'Pattern Specialist', badge: 'text-purple-300 border-purple-500/40 bg-purple-500/15' };
    if (solved >= 60) return { level: 3, title: 'Pattern Practitioner', badge: 'text-blue-300 border-blue-500/40 bg-blue-500/15' };
    if (solved >= 20) return { level: 2, title: 'Pattern Apprentice', badge: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15' };
    return { level: 1, title: 'Pattern Novice', badge: 'text-text-secondary border-line bg-surface-2' };
  };

  const levelInfo = getLevelInfo(totalCalculated);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse select-none">
        <div className="flex justify-between items-center py-2">
          <div className="h-6 w-48 bg-surface-2 rounded-md" />
          <div className="h-8 w-28 bg-surface-2 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-surface-2/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Command Center Hero" className="space-y-3.5 select-none">
      
      {/* ── Top Command Header Row ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        
        {/* Left: Greeting + Level HUD + Current Track */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-text">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-text via-text to-accent">{firstName}</span>
            </h1>

            {/* Level Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${levelInfo.badge}`}>
              <Trophy className="w-3 h-3 text-current" />
              <span>LVL {levelInfo.level} · {levelInfo.title.toUpperCase()}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Active Curriculum:</span>
            <strong className="text-text font-semibold">Non-Linear Structures (Trees & Graphs)</strong>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onQuickAdd}
            className="btn-primary text-xs py-1.5 px-3 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Problem</span>
          </button>

          <Link
            to="/problems"
            className="text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line-subtle py-1.5 px-3 rounded-lg inline-flex items-center gap-1 transition-colors"
          >
            <span>Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* ── 4-Card Quick KPI Dock (Desktop: 4 cols, Mobile: 2x2 grid) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* KPI 1: Solved Problems */}
        <div className="kpi-card p-3 sm:p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted">Total Solved</span>
            <div className="w-6 h-6 rounded-md bg-easy/10 border border-easy/25 flex items-center justify-center text-easy">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-text tabular-nums">
                {totalCalculated}
              </span>
              <span className="text-xs font-mono text-muted">/ {totalTracked || 399}</span>
            </div>
            
            {/* Slim progress bar */}
            <div className="w-full bg-surface-2/80 rounded-full h-1.5 mt-1.5 overflow-hidden border border-line-subtle/40">
              <div
                className="h-full bg-gradient-to-r from-easy via-accent to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${solveRatio}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5 border-t border-line-subtle/40">
            <span className="text-muted">{solveRatio}% achieved</span>
            <div className="flex items-center gap-1.5">
              <span className="text-easy font-bold">{easySolved}E</span>
              <span className="text-muted/40">·</span>
              <span className="text-medium font-bold">{medSolved}M</span>
              <span className="text-muted/40">·</span>
              <span className="text-hard font-bold">{hardSolved}H</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Consistency Streak */}
        <div className="kpi-card p-3 sm:p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted">Daily Streak</span>
            <div className="w-6 h-6 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-accent tabular-nums">
                {streak != null && streak > 0 ? streak : 0}
              </span>
              <span className="text-xs font-mono text-muted">Days</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              {streak > 0 ? 'Consistent practice rhythm' : 'Practice today to begin streak'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5 border-t border-line-subtle/40">
            <span className="text-muted">Target Cadence</span>
            <span className="font-bold text-accent">Daily Velocity</span>
          </div>
        </div>

        {/* KPI 3: Spaced Recall Due */}
        <Link
          to="/revision"
          className="kpi-card p-3 sm:p-3.5 flex flex-col justify-between space-y-2 group cursor-pointer"
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
              <span className="text-xl sm:text-2xl font-black font-mono text-text group-hover:text-accent transition-colors tabular-nums">
                {revisionCount}
              </span>
              <span className="text-xs font-mono text-muted">Due Recall</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              {revisionCount > 0 ? 'Problems due for memory retention' : 'All intervals up to date'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5 border-t border-line-subtle/40">
            <span className="text-muted">Status</span>
            <span className={`font-bold px-1.5 py-0.2 rounded ${revisionCount > 0 ? 'text-accent bg-accent/15 border border-accent/30' : 'text-easy bg-easy/10'}`}>
              {revisionCount > 0 ? `${revisionCount} Urgent` : 'Caught Up ✓'}
            </span>
          </div>
        </Link>

        {/* KPI 4: Curriculum Mastery */}
        <a
          href="#skill-tree-roadmap"
          className="kpi-card p-3 sm:p-3.5 flex flex-col justify-between space-y-2 group cursor-pointer"
          title="Jump to skill tree roadmap"
        >
          <div className="flex items-center justify-between text-muted text-xs">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted group-hover:text-text transition-colors">
              Tree Mastery
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-text group-hover:text-accent transition-colors tabular-nums">
                7 / 14
              </span>
              <span className="text-xs font-mono text-muted">Patterns</span>
            </div>
            
            {/* Slim progress bar */}
            <div className="w-full bg-surface-2/80 rounded-full h-1.5 mt-1.5 overflow-hidden border border-line-subtle/40">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-accent rounded-full transition-all duration-500"
                style={{ width: '50%' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5 border-t border-line-subtle/40">
            <span className="text-muted">50% Complete</span>
            <span className="font-bold text-accent flex items-center gap-0.5">
              <span>Inspect</span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </a>

      </div>

    </section>
  );
};

export default UnifiedHero;
