import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Repeat, Flame, Globe } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';
import { easy, medium, hard } from '../../theme/colors';
import { PLATFORM_CONFIG } from '../../theme/platforms';

/**
 * PracticeStateBar: Cohesive Level 1 Practice State Command Strip.
 *
 * Unifies:
 * 1. Platform Solved (Footprint with mini-donut + difficulty breakdown)
 * 2. Tracked Catalog (Curated repository in DSA Tracker)
 * 3. Revision Due (Active spaced recall load)
 * 4. Streak & Output (Daily consistency + 7-day rhythm)
 *
 * Eliminates scattered mini-cards and visual competition with Today's Focus.
 */
const PracticeStateBar = ({
  summary,
  isLoading = false,
  solveRate = 0,
  heatmapData = [],
  revisionCount = 0,
  className = '',
}) => {
  // Extract 7-day consistency rhythm
  const { weekDays, todayCount } = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const countMap = new Map();
    (heatmapData || []).forEach(({ date, count }) => {
      if (date) countMap.set(date, Number(count) || 0);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    let todayLogged = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const count = countMap.get(iso) || 0;
      const isToday = i === 0;

      if (isToday) todayLogged = count;

      days.push({
        date: iso,
        shortDay: isToday ? 'Now' : dayNames[d.getDay()][0],
        count,
        isToday,
      });
    }

    return { weekDays: days, todayCount: todayLogged };
  }, [heatmapData]);

  // Active platforms
  const platformBreakdown = summary?.platformBreakdown || {};
  const activePlatforms = useMemo(() => {
    return [
      { key: 'leetcode', short: 'LC', count: platformBreakdown.leetcode || 0, style: PLATFORM_CONFIG.leetcode.style },
      { key: 'codeforces', short: 'CF', count: platformBreakdown.codeforces || 0, style: PLATFORM_CONFIG.codeforces.style },
      { key: 'gfg', short: 'GFG', count: platformBreakdown.gfg || 0, style: PLATFORM_CONFIG.gfg.style },
      { key: 'codechef', short: 'CC', count: platformBreakdown.codechef || 0, style: PLATFORM_CONFIG.codechef.style },
    ].filter((p) => p.count > 0);
  }, [platformBreakdown]);

  if (isLoading) {
    return (
      <div className={`panel p-4 border-line/60 animate-pulse ${className}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-surface-2 rounded" />
              <div className="h-6 w-16 bg-surface-2 rounded" />
              <div className="h-3 w-28 bg-surface-2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalProblems = summary?.totalProblems || 0;
  const solvedProblems = summary?.solvedProblems || 0;
  const catalogProblems = summary?.catalogProblems ?? totalProblems;
  const catalogSolved = summary?.catalogSolved ?? 0;
  const currentStreak = summary?.currentStreak || 0;
  const longestStreak = summary?.longestStreak || currentStreak;
  const totalAttempts = summary?.totalAttempts || 0;

  // Extract counts per difficulty
  const diffItems = summary?.difficultyBreakdown || [];
  const easyItem = diffItems.find((d) => d.difficulty === 'easy') || { count: 0, solved: 0 };
  const medItem = diffItems.find((d) => d.difficulty === 'medium') || { count: 0, solved: 0 };
  const hardItem = diffItems.find((d) => d.difficulty === 'hard') || { count: 0, solved: 0 };

  const easySolved = easyItem.solved ?? (totalProblems > 0 ? Math.round(solvedProblems * 0.5) : 0);
  const medSolved = medItem.solved ?? (totalProblems > 0 ? Math.round(solvedProblems * 0.35) : 0);
  const hardSolved = hardItem.solved ?? Math.max(0, solvedProblems - easySolved - medSolved);

  // Compact Mini Donut Geometry (size 44px)
  const donutSize = 44;
  const strokeWidth = 4.5;
  const center = donutSize / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const easyArc = totalProblems > 0 ? (easySolved / totalProblems) * circumference : 0;
  const medArc = totalProblems > 0 ? (medSolved / totalProblems) * circumference : 0;
  const hardArc = totalProblems > 0 ? (hardSolved / totalProblems) * circumference : 0;

  const easyOffset = 0;
  const medOffset = -easyArc;
  const hardOffset = -(easyArc + medArc);

  return (
    <div className={`panel p-3 sm:p-3.5 border-line/70 transition-all ${className}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-0 lg:divide-x lg:divide-line/40 items-center">

        {/* ── STATION 1: Revision Due (Primary Actionable State) ─────────── */}
        <Link
          to="/revision"
          className="p-2 sm:p-2.5 lg:p-0 lg:pr-4 rounded-lg bg-surface-2/20 lg:bg-transparent border border-line/30 lg:border-none flex items-center gap-2.5 sm:gap-3 group/rev transition-colors"
          title="Open Spaced Repetition Revision Queue"
        >
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
            revisionCount > 0
              ? 'bg-accent/10 border-accent/30 text-accent group-hover/rev:border-accent'
              : 'bg-surface-2/60 border-line/60 text-muted'
          }`}>
            <Repeat className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${revisionCount > 0 ? 'group-hover/rev:rotate-180 transition-transform duration-300' : ''}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted group-hover/rev:text-text-secondary transition-colors">
                Revision Due
              </span>
              <span className="text-[10px] text-muted group-hover/rev:text-accent transition-colors">
                →
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-base sm:text-xl font-black tabular-nums leading-none ${
                revisionCount > 0 ? 'text-accent' : 'text-text'
              }`}>
                <AnimatedNumber value={revisionCount} />
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted font-normal">due now</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted mt-0.5 truncate">
              {revisionCount > 0 ? (
                <span className="text-accent font-medium">Spaced recall active</span>
              ) : (
                <span>All caught up!</span>
              )}
            </div>
          </div>
        </Link>

        {/* ── STATION 2: Tracked Catalog (Secondary Curated Base) ───────── */}
        <Link
          to="/problems"
          className="p-2 sm:p-2.5 lg:p-0 lg:px-4 rounded-lg bg-surface-2/20 lg:bg-transparent border border-line/30 lg:border-none flex items-center gap-2.5 sm:gap-3 group/stat transition-colors"
          title="Browse your curated practice catalog"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface-2/60 border border-line/60 flex items-center justify-center text-text-secondary group-hover/stat:text-text group-hover/stat:border-accent/40 transition-colors shrink-0">
            <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted group-hover/stat:text-text-secondary transition-colors">
                Tracked Catalog
              </span>
              <span className="text-[10px] text-muted group-hover/stat:text-accent transition-colors">
                →
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-xl font-black text-text tabular-nums leading-none">
                <AnimatedNumber value={catalogProblems} />
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted font-normal">problems</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted mt-0.5 truncate">
              <span className="text-text-secondary font-medium tabular-nums">{catalogSolved}</span> solved in tracker
            </div>
          </div>
        </Link>

        {/* ── STATION 3: Platform Solved (Secondary Footprint) ─────────── */}
        <div className="p-2 sm:p-2.5 lg:p-0 lg:px-4 rounded-lg bg-surface-2/20 lg:bg-transparent border border-line/30 lg:border-none flex items-center gap-2.5 sm:gap-3">
          {/* Mini Donut */}
          <div className="relative shrink-0 flex items-center justify-center" style={{ width: donutSize, height: donutSize }}>
            <svg
              width={donutSize}
              height={donutSize}
              viewBox={`0 0 ${donutSize} ${donutSize}`}
              className="-rotate-90 transform"
            >
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-surface-2"
              />
              {hardArc > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={hard}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${hardArc} ${circumference - hardArc}`}
                  strokeDashoffset={hardOffset}
                  strokeLinecap="round"
                />
              )}
              {medArc > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={medium}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${medArc} ${circumference - medArc}`}
                  strokeDashoffset={medOffset}
                  strokeLinecap="round"
                />
              )}
              {easyArc > 0 && (
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={easy}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${easyArc} ${circumference - easyArc}`}
                  strokeDashoffset={easyOffset}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent font-mono">
              <Globe className="w-3.5 h-3.5 text-accent" />
            </span>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Platform Solved
              </span>
              {activePlatforms.length > 0 && (
                <span className="text-[9px] font-mono text-muted hidden xl:inline">
                  {activePlatforms.length} Hubs
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-xl font-black text-text tabular-nums leading-none">
                <AnimatedNumber value={solvedProblems} />
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted font-normal">solved</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-muted mt-0.5 tabular-nums truncate">
              <span className="text-easy font-medium">{easySolved}E</span>
              <span className="text-line/60">·</span>
              <span className="text-medium font-medium">{medSolved}M</span>
              <span className="text-line/60">·</span>
              <span className="text-hard font-medium">{hardSolved}H</span>
            </div>
          </div>
        </div>

        {/* ── STATION 4: Active Streak (Supporting Rhythm) ──────────────── */}
        <div className="p-2 sm:p-2.5 lg:p-0 lg:pl-4 rounded-lg bg-surface-2/20 lg:bg-transparent border border-line/30 lg:border-none flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface-2/60 border border-line/60 flex items-center justify-center text-accent shrink-0">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Active Streak
              </span>
              <span className={`text-[8px] sm:text-[9px] font-mono px-1 py-0.2 rounded border ${
                todayCount > 0
                  ? 'text-success bg-success/10 border-success/20 font-semibold'
                  : 'text-muted bg-surface-3 border-line/40'
              }`}>
                {todayCount > 0 ? '✓ Today' : 'Pending'}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-xl font-black text-text tabular-nums leading-none">
                <AnimatedNumber value={currentStreak} />
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted font-normal truncate">
                days <span className="text-[9px] sm:text-[10px] text-muted/70">(best {longestStreak}d)</span>
              </span>
            </div>
            {/* 7 Micro Column Rhythm */}
            <div className="flex items-center gap-0.5 sm:gap-1 mt-1">
              {weekDays.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 h-1 sm:h-1.5 rounded-xs bg-surface-2 overflow-hidden"
                  title={`${d.date}: ${d.count} attempt${d.count !== 1 ? 's' : ''}`}
                >
                  <div
                    className={`h-full rounded-xs ${
                      d.isToday
                        ? d.count > 0 ? 'bg-success' : 'bg-accent/40'
                        : d.count > 0 ? 'bg-accent' : 'bg-transparent'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PracticeStateBar;
