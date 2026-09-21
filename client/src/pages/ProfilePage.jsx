import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProfileAnalytics, fetchHeatmapAnalytics } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';
import { getRank, fmtMonthYear } from '../utils/profileUtils';
import ProgressRing from '../components/ui/ProgressRing';
import Badge from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { fetchProblems } from '../api/problems';
import EditProfileModal from '../components/profile/EditProfileModal';
import DataImportModal from '../components/profile/DataImportModal';
import MilestoneDetailModal from '../components/profile/MilestoneDetailModal';
import TargetGoalsCard from '../components/profile/TargetGoalsCard';
import PlatformSyncHub from '../components/profile/PlatformSyncHub';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import Reveal from '../components/common/Reveal';
import TiltCard from '../components/common/TiltCard';
import { colors } from '../theme/colors';
import {
  Rocket, Sprout, Flame, Zap, Award, Crown, Brain, Gem, Calendar, Target,
  PartyPopper, FolderGit2, CheckCircle2, History, FolderOpen,
  TrendingUp, BarChart3, Trophy, Layers, Download, FileJson, FileSpreadsheet, Database,
  Settings, Upload, Lock, Sparkles, Globe
} from 'lucide-react';

/* ── Helpers ──────────────────────────────────────────────────────── */
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ── Milestone Config with Theme Colors ───────────────────────────── */
const MILESTONE_CONFIG = {
  day_one:      { Icon: Rocket,   color: colors.easy,    bg: `${colors.easy}1f`,    border: `${colors.easy}40` },
  first_step:   { Icon: Sprout,   color: colors.success, bg: `${colors.success}1f`, border: `${colors.success}40` },
  getting_warm: { Icon: Flame,    color: colors.accent,  bg: `${colors.accent}1f`,  border: `${colors.accent}40` },
  half_century: { Icon: Zap,      color: colors.medium,  bg: `${colors.medium}1f`,  border: `${colors.medium}40` },
  century:      { Icon: Award,    color: colors.accent,  bg: `${colors.accent}1f`,  border: `${colors.accent}40` },
  elite:        { Icon: Crown,    color: colors.medium,  bg: `${colors.medium}1f`,  border: `${colors.medium}40` },
  hard_first:   { Icon: Brain,    color: colors.hard,    bg: `${colors.hard}1f`,    border: `${colors.hard}40` },
  hard_ten:     { Icon: Gem,      color: colors.hard,    bg: `${colors.hard}1f`,    border: `${colors.hard}40` },
  streak_7:     { Icon: Calendar, color: colors.easy,    bg: `${colors.easy}1f`,    border: `${colors.easy}40` },
  streak_30:    { Icon: Target,   color: colors.accent,  bg: `${colors.accent}1f`,  border: `${colors.accent}40` },
};

const MilestoneBadgeIcon = ({ id, size = 22, className = '' }) => {
  const conf = MILESTONE_CONFIG[id] || { Icon: Award, color: colors.accent, bg: `${colors.accent}1f`, border: `${colors.accent}40` };
  const { Icon, color, bg, border } = conf;
  return (
    <div
      className={`rounded-xl flex items-center justify-center transition-transform duration-200 border ${className}`}
      style={{
        width: Math.round(size * 2),
        height: Math.round(size * 2),
        backgroundColor: bg,
        borderColor: border,
        color: color,
      }}
    >
      <Icon style={{ width: size, height: size }} />
    </div>
  );
};

/* ── All possible milestones (mirroring backend) ─────────────────── */
const ALL_MILESTONES = [
  { id: 'day_one',     label: 'Day One',        desc: 'First practice session',   check: (p) => p.activeDays >= 1,    metric: (p) => p.activeDays,   target: 1,   field: 'activeDays' },
  { id: 'first_step',  label: 'First Step',     desc: 'Solved your first problem', check: (p) => p.totalSolved >= 1,   metric: (p) => p.totalSolved,  target: 1,   field: 'totalSolved' },
  { id: 'getting_warm',label: 'Getting Warm',   desc: '10 problems solved',        check: (p) => p.totalSolved >= 10,  metric: (p) => p.totalSolved,  target: 10,  field: 'totalSolved' },
  { id: 'half_century',label: 'Half Century',   desc: '50 problems solved',        check: (p) => p.totalSolved >= 50,  metric: (p) => p.totalSolved,  target: 50,  field: 'totalSolved' },
  { id: 'century',     label: 'Century',        desc: '100 problems solved',       check: (p) => p.totalSolved >= 100, metric: (p) => p.totalSolved,  target: 100, field: 'totalSolved' },
  { id: 'elite',       label: 'Elite Coder',    desc: '250 problems solved',       check: (p) => p.totalSolved >= 250, metric: (p) => p.totalSolved,  target: 250, field: 'totalSolved' },
  { id: 'hard_first',  label: 'Deep Thinker',   desc: 'First Hard solved',         check: (p) => (p.solvedByDifficulty?.hard ?? 0) >= 1,  metric: (p) => p.solvedByDifficulty?.hard ?? 0, target: 1,  field: 'hard' },
  { id: 'hard_ten',    label: 'Diamond Mind',   desc: '10 Hard problems solved',   check: (p) => (p.solvedByDifficulty?.hard ?? 0) >= 10, metric: (p) => p.solvedByDifficulty?.hard ?? 0, target: 10, field: 'hard' },
  { id: 'streak_7',    label: 'On a Roll',      desc: '7-day streak',              check: (p) => p.currentStreak >= 7,  metric: (p) => p.currentStreak, target: 7,  field: 'streak' },
  { id: 'streak_30',   label: 'Consistent',     desc: '30-day streak',             check: (p) => p.currentStreak >= 30, metric: (p) => p.currentStreak, target: 30, field: 'streak' },
];

/* ── Animated bar keyframes (injected once) ──────────────────────── */
const styleId = 'profile-anims';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes barGrow { from { width: 0% } }
    @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .bar-animated { animation: barGrow 0.8s cubic-bezier(0.4,0,0.2,1) forwards; }
    .badge-card { position: relative; overflow: hidden; }
    .heatmap-cell { position: relative; }
  `;
  document.head.appendChild(style);
}

/* ── Yearly Heatmap ───────────────────────────────────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const YearlyHeatmap = ({ heatmapData = [], currentStreak = 0, longestStreak = 0 }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    if (scrollRef.current && window.innerWidth < 768) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(today.getFullYear() - 1);
  yearAgo.setDate(yearAgo.getDate() + 1);

  // Build a map from date string -> count
  const countMap = {};
  let totalSessions = 0;
  const monthCounts = {};
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  heatmapData.forEach(({ date, count }) => {
    const c = Number(count) || 0;
    countMap[date] = c;
    totalSessions += c;
    const m = date.slice(0, 7); // YYYY-MM
    monthCounts[m] = (monthCounts[m] || 0) + c;
    if (c > 0) {
      const dt = new Date(date + 'T00:00:00');
      dayCounts[dt.getDay()] += c;
    }
  });

  // Summary stats
  const activeDaysCount = heatmapData.filter(h => h.count > 0).length;
  const consistencyRate = Math.round((activeDaysCount / 365) * 100);
  const weeksCount = Math.max(1, Math.ceil(365 / 7));
  const avgPerWeek = (totalSessions / weeksCount).toFixed(1);

  const busiestMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestMonthLabel = busiestMonth
    ? (() => { const [y, m] = busiestMonth[0].split('-'); return `${MONTHS[parseInt(m, 10) - 1]} ${y}`; })()
    : '—';
  const busiestMonthCount = busiestMonth ? busiestMonth[1] : 0;

  // Best day of week
  let bestDayIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (dayCounts[i] > dayCounts[bestDayIdx]) bestDayIdx = i;
  }
  const bestDayName = dayCounts[bestDayIdx] > 0 ? DAYS_FULL[bestDayIdx] : '—';
  const bestDaySessions = dayCounts[bestDayIdx];

  // Build weeks array (Sun–Sat columns)
  const weeks = [];
  let current = new Date(yearAgo);
  // Align to Sunday
  current.setDate(current.getDate() - current.getDay());

  while (current <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10);
      const isInRange = current >= yearAgo && current <= today;
      week.push({ date: dateStr, count: isInRange ? (countMap[dateStr] || 0) : null });
      current = new Date(current);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const getColor = (count) => {
    if (count === null) return 'transparent';
    if (count === 0)   return colors.surface2;
    if (count === 1)   return `${colors.easy}40`;
    if (count === 2)   return `${colors.easy}70`;
    if (count <= 4)    return `${colors.easy}a6`;
    if (count <= 6)    return `${colors.easy}d9`;
    return colors.easy;
  };

  // Month label positions
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const firstNonNull = week.find(d => d.count !== null);
    if (firstNonNull) {
      const dt = new Date(firstNonNull.date);
      if (dt.getDate() <= 7) {
        monthLabels.push({ week: wi, month: MONTHS[dt.getMonth()] });
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* ── Scrollable Heatmap Board ──────────────────────────── */}
      <div ref={scrollRef} className="overflow-x-auto relative rounded-xl bg-surface border border-line p-3 sm:p-4">
        <div ref={containerRef} className="relative select-none" style={{ minWidth: 780 }}>
          {/* Month labels */}
          <div className="flex mb-1.5 ml-8" style={{ gap: 2.5 }}>
            {weeks.map((_, wi) => {
              const lbl = monthLabels.find(m => m.week === wi);
              return (
                <div key={wi} style={{ width: 12.5, flexShrink: 0 }}>
                  {lbl && <span className="text-xs text-muted font-medium">{lbl.month}</span>}
                </div>
              );
            })}
          </div>

          <div className="flex" style={{ gap: 2.5 }}>
            {/* Day labels */}
            <div className="flex flex-col mr-1.5" style={{ gap: 2.5, paddingTop: 0 }}>
              {DAYS.map((d, i) => (
                <div key={d} style={{ height: 12.5, display: 'flex', alignItems: 'center' }}>
                  {i % 2 === 1 && (
                    <span className="text-xs text-muted w-6 text-right font-medium">{d}</span>
                  )}
                  {i % 2 === 0 && <span className="w-6" />}
                </div>
              ))}
            </div>

            {/* Cells */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: 2.5 }}>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className="heatmap-cell"
                    style={{
                      width: 12.5,
                      height: 12.5,
                      borderRadius: 2.5,
                      background: getColor(cell.count),
                      border: cell.count !== null ? `1px solid ${colors.line}` : 'none',
                      cursor: cell.count !== null ? 'pointer' : 'default',
                      transition: 'transform 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (cell.count !== null && containerRef.current) {
                        e.currentTarget.style.transform = 'scale(1.4)';
                        e.currentTarget.style.zIndex = '10';
                        const containerRect = containerRef.current.getBoundingClientRect();
                        const cellRect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          count: cell.count,
                          date: cell.date,
                          x: cellRect.left - containerRect.left + cellRect.width / 2,
                          y: cellRect.top - containerRect.top,
                        });
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.zIndex = '1';
                      setHoveredCell(null);
                    }}
                    onClick={(e) => {
                      if (cell.count !== null && containerRef.current) {
                        const containerRect = containerRef.current.getBoundingClientRect();
                        const cellRect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell((prev) =>
                          prev?.date === cell.date
                            ? null
                            : {
                                count: cell.count,
                                date: cell.date,
                                x: cellRect.left - containerRect.left + cellRect.width / 2,
                                y: cellRect.top - containerRect.top,
                              }
                        );
                      }
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Floating Single Tooltip: Always on top, no z-index fighting or column clipping */}
          {hoveredCell && (() => {
            const isFlipped = hoveredCell.y < 35;
            const clampedX = Math.max(75, Math.min(hoveredCell.x, 780 - 75));
            const arrowOffset = hoveredCell.x - clampedX;

            return (
              <div
                className="pointer-events-none absolute z-50 px-2.5 py-1.5 rounded-lg text-xs shadow-modal transition-all duration-75"
                style={{
                  left: clampedX,
                  top: isFlipped ? hoveredCell.y + 20 : hoveredCell.y - 36,
                  transform: 'translateX(-50%)',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.line}`,
                  whiteSpace: 'nowrap',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold ${hoveredCell.count > 0 ? 'text-accent' : 'text-muted'}`}>
                    {hoveredCell.count} {hoveredCell.count === 1 ? 'session' : 'sessions'}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-text font-medium">
                    {hoveredCell.date}
                  </span>
                </div>

                {/* Downward/Upward Triangle Arrow */}
                <div
                  className="absolute w-0 h-0"
                  style={{
                    left: `calc(50% + ${arrowOffset}px)`,
                    transform: 'translateX(-50%)',
                    ...(isFlipped
                      ? {
                          bottom: '100%',
                          borderLeft: '5px solid transparent',
                          borderRight: '5px solid transparent',
                          borderBottom: `5px solid ${colors.surface}`,
                        }
                      : {
                          top: '100%',
                          borderLeft: '5px solid transparent',
                          borderRight: '5px solid transparent',
                          borderTop: `5px solid ${colors.surface}`,
                        }),
                  }}
                />
              </div>
            );
          })()}

          {/* Legend Strip */}
          <div className="flex flex-wrap items-center justify-between mt-3.5 pt-2.5 border-t border-line sm:ml-8 ml-1 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Less</span>
              {[colors.surface2, `${colors.easy}40`, `${colors.easy}70`, `${colors.easy}a6`, colors.easy].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: 2.5, background: c, border: `1px solid ${colors.line}` }} />
              ))}
              <span className="text-xs text-muted">More</span>
            </div>
            <span className="text-xs text-muted">
              Tap or hover any square to view date & practice sessions
            </span>
          </div>
        </div>
      </div>

      {/* ── Integrated Heatmap Analytics Bar ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted" />
            Active Days
          </span>
          <div className="my-1">
            <span className="text-xl font-semibold tabular-nums text-text">{activeDaysCount}</span>
            <span className="text-xs text-muted"> / 365d</span>
          </div>
          <span className="text-xs text-muted">{consistencyRate}% annual habit</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-medium" />
            Practice Pace
          </span>
          <div className="my-1">
            <span className="text-xl font-semibold tabular-nums text-text">{avgPerWeek}</span>
            <span className="text-xs text-muted"> sess/wk</span>
          </div>
          <span className="text-xs text-muted">{totalSessions} sessions logged</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-medium flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-easy" />
            Prime Practice Day
          </span>
          <div className="my-1">
            <span className="text-xl font-semibold text-easy truncate block">{bestDayName}</span>
          </div>
          <span className="text-xs text-muted">{bestDaySessions} sessions logged</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-line flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-medium flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-accent" />
            Peak Month
          </span>
          <div className="my-1">
            <span className="text-xl font-semibold text-accent truncate block">{busiestMonthLabel}</span>
          </div>
          <span className="text-xs text-muted">{busiestMonthCount} peak sessions</span>
        </div>
      </div>
    </div>
  );
};

/* ── Stat Block ───────────────────────────────────────────────────── */
const StatBlock = ({ label, value, sub, color = colors.text, icon: Icon, isNumber = false }) => (
  <TiltCard maxTilt={7} className="h-full">
    <div className="h-full flex flex-col gap-1.5 p-4 rounded-xl bg-surface border border-line hover:border-line/80 cursor-default relative overflow-hidden group">
      {Icon && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mb-0.5 border"
          style={{
            color: color || colors.muted,
            backgroundColor: color ? `${color}14` : 'rgba(255,255,255,0.05)',
            borderColor: color ? `${color}28` : colors.line,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
      )}
      <span className="text-xs font-medium uppercase tracking-wider text-secondary">{label}</span>
      <span className="text-2xl font-semibold tabular-nums tracking-tight leading-none" style={{ color }}>
        {isNumber && typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
      </span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  </TiltCard>
);

/* ── Next Badge Teaser ───────────────────────────────────────────── */
const NextBadgeTeaser = ({ profile }) => {
  const nextMilestone = useMemo(() => {
    if (!profile) return null;
    for (const m of ALL_MILESTONES) {
      if (!m.check(profile)) {
        const current = m.metric(profile);
        const pct = Math.min(99, Math.round((current / m.target) * 100));
        return { ...m, current, pct };
      }
    }
    return null; // All earned!
  }, [profile]);

  if (!nextMilestone) {
    return (
      <div className="mt-4 p-4 rounded-xl border border-dashed border-accent/40 bg-accent/10 text-center">
        <PartyPopper className="w-8 h-8 text-accent mx-auto mb-1" />
        <p className="text-xs text-accent mt-1">All milestones unlocked! You're a legend.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl border border-line bg-surface">
      <div className="flex items-center gap-3">
        <MilestoneBadgeIcon id={nextMilestone.id} size={18} className="opacity-40 grayscale shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-secondary">
              Next: <span className="text-text">{nextMilestone.label}</span>
            </span>
            <span className="text-xs tabular-nums text-muted">
              {nextMilestone.current}/{nextMilestone.target}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-surface-2">
            <div
              className="h-full rounded-full bar-animated bg-accent"
              style={{
                width: `${nextMilestone.pct}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted mt-1">{nextMilestone.desc}</p>
        </div>
      </div>
    </div>
  );
};

/* ── Difficulty Distribution ─────────────────────────────────────── */
const DifficultyDistribution = ({ profile }) => {
  const easy = profile?.solvedByDifficulty?.easy ?? 0;
  const med  = profile?.solvedByDifficulty?.medium ?? 0;
  const hard = profile?.solvedByDifficulty?.hard ?? 0;
  const total = easy + med + hard || 1;

  const bars = [
    { label: 'Easy',   count: easy, pct: Math.round((easy / total) * 100), color: colors.easy, bgClass: 'bg-easy' },
    { label: 'Medium', count: med,  pct: Math.round((med  / total) * 100), color: colors.medium, bgClass: 'bg-medium' },
    { label: 'Hard',   count: hard, pct: Math.round((hard / total) * 100), color: colors.hard, bgClass: 'bg-hard' },
  ];

  return (
    <div className="space-y-4">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
              <span className="text-xs font-semibold text-text">{b.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tabular-nums" style={{ color: b.color }}>{b.count}</span>
              <span className="text-xs tabular-nums text-muted">{b.pct}%</span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-surface-2">
            <div
              className={`h-full rounded-full bar-animated ${b.bgClass}`}
              style={{ width: `${b.pct}%` }}
            />
          </div>
        </div>
      ))}

      {/* Ratio summary strip */}
      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-line">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden flex bg-surface-2">
          {easy > 0 && <div className="h-full bg-easy" style={{ width: `${(easy / total) * 100}%` }} />}
          {med  > 0 && <div className="h-full bg-medium" style={{ width: `${(med  / total) * 100}%` }} />}
          {hard > 0 && <div className="h-full bg-hard" style={{ width: `${(hard / total) * 100}%` }} />}
        </div>
        <span className="text-xs tabular-nums text-muted shrink-0">{total} solved</span>
      </div>
    </div>
  );
};

/* ── Weekly Momentum ─────────────────────────────────────────────── */
const WeeklyMomentum = ({ heatmapData = [] }) => {
  // Compute last 8 weeks of sessions
  const today = new Date();
  const weeks = useMemo(() => {
    const result = [];
    for (let w = 7; w >= 0; w--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);

      const startStr = weekStart.toISOString().slice(0, 10);
      const endStr   = weekEnd.toISOString().slice(0, 10);

      let count = 0;
      heatmapData.forEach(({ date, count: c }) => {
        if (date >= startStr && date <= endStr) count += Number(c) || 0;
      });

      // Week label like "Aug 25"
      const label = weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      result.push({ label, count, startStr, endStr });
    }
    return result;
  }, [heatmapData]);

  const maxCount = Math.max(1, ...weeks.map(w => w.count));

  // Trend arrow
  const lastWeek = weeks[weeks.length - 1]?.count ?? 0;
  const prevWeek = weeks[weeks.length - 2]?.count ?? 0;
  const trend = lastWeek > prevWeek ? 'up' : lastWeek < prevWeek ? 'down' : 'flat';
  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.muted;
  const trendLabel = trend === 'up' ? `+${lastWeek - prevWeek} vs last week` : trend === 'down' ? `${lastWeek - prevWeek} vs last week` : 'Same as last week';

  return (
    <div>
      {/* Trend indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${trendColor}18`, border: `1px solid ${trendColor}33` }}>
          <TrendingUp className="w-3.5 h-3.5" style={{ color: trendColor, transform: trend === 'down' ? 'rotate(180deg)' : 'none' }} />
        </div>
        <span className="text-xs tabular-nums" style={{ color: trendColor }}>{trendLabel}</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2" style={{ height: 100 }}>
        {weeks.map((w, i) => {
          const barH = Math.max(4, (w.count / maxCount) * 88);
          const isLatest = i === weeks.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-default">
              <span className="text-xs tabular-nums text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                {w.count}
              </span>
              <div
                className="w-full rounded-md bar-animated transition-all duration-200 group-hover:scale-x-110"
                style={{
                  height: barH,
                  backgroundColor: isLatest ? colors.accent : colors.surface2,
                  border: isLatest ? `1px solid ${colors.accent}` : `1px solid ${colors.line}`,
                  minWidth: 12,
                }}
              />
              <span className="text-xs text-muted truncate w-full text-center">
                {w.label.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const ProfilePage = () => {
  useEffect(() => {
    document.title = 'Profile · DSA Tracker';
  }, []);

  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, hRes] = await Promise.all([
        fetchProfileAnalytics(),
        fetchHeatmapAnalytics(),
      ]);
      if (pRes?.success) setProfile(pRes.data);
      if (hRes?.success) setHeatmap(hRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? 'U').toUpperCase();

  const solvedPct = profile?.totalProblems > 0
    ? Math.round((profile.totalSolved / profile.totalProblems) * 100) : 0;

  const rank = useMemo(() => getRank(profile?.totalSolved ?? 0), [profile?.totalSolved]);

  // Member since — use createdAt from user if available
  const memberSince = user?.createdAt ? fmtMonthYear(user.createdAt) : null;

  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = useMemo(() => ['overview', 'platforms', 'milestones', 'activity', 'settings'], []);
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(validTabs.includes(initialTab) ? initialTab : 'overview');

  // Sync tab if URL search parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && validTabs.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, validTabs, activeTab]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === 'overview') {
        next.delete('tab');
      } else {
        next.set('tab', tabId);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const [isExporting, setIsExporting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [milestoneFilter, setMilestoneFilter] = useState('all'); // 'all' | 'earned'
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const handleExportData = async (format = 'json') => {
    setIsExporting(true);
    try {
      const res = await fetchProblems();
      const problems = res?.data || [];

      if (!problems.length) {
        toast?.error ? toast.error('No problems cataloged to export yet.') : alert('No problems found.');
        return;
      }

      if (format === 'json') {
        const jsonString = JSON.stringify(problems, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', url);
        downloadAnchor.setAttribute('download', `dsa-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
        toast?.success && toast.success(`Successfully exported ${problems.length} problems as JSON!`);
      } else if (format === 'csv') {
        const headers = ['Title', 'Platform', 'Difficulty', 'Topics', 'Link', 'Created At'];
        const rows = problems.map((p) => [
          `"${(p.title || '').replace(/"/g, '""')}"`,
          `"${p.platform || ''}"`,
          `"${p.difficulty || ''}"`,
          `"${(p.topics || []).join('; ').replace(/"/g, '""')}"`,
          `"${p.link || ''}"`,
          `"${p.createdAt || ''}"`,
        ]);
        const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', url);
        downloadAnchor.setAttribute('download', `dsa-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
        toast?.success && toast.success(`Successfully exported ${problems.length} problems as CSV!`);
      }
    } catch (err) {
      toast?.error ? toast.error('Failed to export problem data: ' + err.message) : alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 pb-12 animate-pulse">
        <div className="h-36 bg-surface border border-line rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-surface border border-line rounded-xl" />)}
        </div>
        <div className="h-24 bg-surface border border-line rounded-xl" />
        <div className="h-52 bg-surface border border-line rounded-xl" />
        <div className="h-40 bg-surface border border-line rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-line rounded-xl p-10 text-center">
        <p className="text-danger text-sm">{error}</p>
        <button onClick={load} className="btn-secondary mt-4">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 animate-fade-up">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <Reveal delay={0} y={15}>
        <div className="bg-surface border border-line rounded-xl p-4 sm:p-6 lg:p-7 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 relative">
            
            {/* Left: User Identity & Stats */}
            <div className="flex-1 min-w-0 w-full lg:w-auto">
              {/* Avatar + Primary User Details Row */}
              <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
                {/* Avatar with rank border */}
                <div className="relative shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'User'}
                      className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl object-cover border-2 transition-all"
                      style={{
                        borderColor: rank.color,
                      }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold transition-all bg-surface-2 border-2"
                      style={{
                        borderColor: rank.color,
                        color: rank.color,
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  {profile?.currentStreak > 0 && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-surface border border-line flex items-center justify-center">
                      <Flame className="w-3 h-3 text-accent fill-accent/20" />
                    </div>
                  )}
                </div>

                {/* Name, Badges, Email */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-text truncate">
                      {user?.name || 'DSA Coder'}
                    </h1>
                    {/* Rank badge */}
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0"
                      style={{
                        color: rank.color,
                        borderColor: `${rank.color}40`,
                        backgroundColor: `${rank.color}14`,
                      }}
                    >
                      {rank.Icon && <rank.Icon className="w-3 h-3" />}
                      {rank.label}
                    </span>
                    <Badge variant="online" size="sm">Active</Badge>
                  </div>

                  <p className="text-xs text-secondary truncate">
                    {user?.email}
                    {memberSince && <span className="ml-2 text-muted hidden sm:inline">· Member since {memberSince}</span>}
                  </p>
                </div>
              </div>

              {/* Activity highlights */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {profile?.currentStreak > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-xs">
                    <Flame className="w-3.5 h-3.5 text-accent fill-accent/20" />
                    <span className="font-semibold tabular-nums text-accent">{profile.currentStreak}d</span>
                    <span className="text-muted text-xs">streak</span>
                  </div>
                )}
                {profile?.activeDays > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-xs">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    <span className="font-semibold tabular-nums text-text">{profile.activeDays}</span>
                    <span className="text-muted text-xs">active days</span>
                  </div>
                )}
                {profile?.bestDay && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-xs">
                    <Zap className="w-3.5 h-3.5 text-medium" />
                    <span className="font-semibold tabular-nums text-text">{profile.bestDayCount}</span>
                    <span className="text-muted text-xs">best ({fmtDate(profile.bestDay)})</span>
                  </div>
                )}
              </div>

              {/* Rank progress bar (if not max rank) */}
              {rank.next && (
                <div className="mt-3.5 max-w-lg">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-secondary flex items-center gap-1.5">
                      {rank.Icon && <rank.Icon className="w-3 h-3 text-accent" />}
                      <span className="font-semibold text-text">{rank.label}</span>
                    </span>
                    <span className="text-accent font-semibold flex items-center gap-1">
                      <span className="tabular-nums">{Math.round(rank.progress)}%</span>
                      <span className="text-muted">to {rank.next.label}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-surface-2 p-0.5">
                    <div
                      className="h-full rounded-full bar-animated bg-accent"
                      style={{
                        width: `${Math.min(rank.progress, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted mt-1 flex items-center justify-between">
                    <span className="tabular-nums">{profile?.totalSolved ?? 0} problems solved</span>
                    <span className="tabular-nums">Goal: {rank.next.min} solved</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Actions & Dual Progress Rings Panel */}
            <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 border-line pt-3.5 lg:pt-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="btn-secondary text-xs flex items-center justify-center gap-1.5 min-h-[36px] w-full sm:w-auto self-end order-1 sm:order-2 lg:order-1"
              >
                <Settings className="w-3.5 h-3.5 text-muted" />
                <span>Account Settings</span>
              </button>

              <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-4 sm:gap-6 bg-surface-2/50 p-3 sm:p-4 rounded-xl border border-line w-full sm:w-auto order-2 sm:order-1 lg:order-2">
                <div className="text-center flex flex-col items-center">
                  <ProgressRing value={solvedPct} size={62} stroke={5} color={colors.easy}
                    label={<span className="text-xs font-semibold tabular-nums text-easy">{solvedPct}%</span>} />
                  <p className="text-xs text-secondary mt-1 font-medium">solved</p>
                </div>
                <div className="text-center flex flex-col items-center border-l sm:border-l-0 border-line pl-2 sm:pl-0">
                  <ProgressRing
                    value={Math.min(100, Math.round((profile?.longestStreak || 0) / 30 * 100))}
                    size={62} stroke={5} color={colors.accent}
                    label={<span className="text-xs font-semibold tabular-nums text-accent">{profile?.longestStreak || 0}d</span>}
                  />
                  <p className="text-xs text-secondary mt-1 font-medium">best streak</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Reveal>

      {/* ── Workspace Tab Strip ─────────────────────────────────── */}
      <Reveal delay={20} y={10}>
        <div className="flex items-center gap-1.5 p-1.5 bg-surface border border-line rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-accent text-white shadow-xs'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Overview & Goals</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('platforms')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'platforms'
                ? 'bg-accent text-white shadow-xs'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Connected Platforms</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              activeTab === 'platforms' ? 'bg-white/20 text-white' : 'bg-accent/15 text-accent'
            }`}>
              Sync
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('milestones')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'milestones'
                ? 'bg-accent text-white shadow-xs'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Milestones & Badges</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              activeTab === 'milestones' ? 'bg-white/20 text-white' : 'bg-surface-2 text-secondary'
            }`}>
              {profile?.badges?.length ?? 0}/{ALL_MILESTONES.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('activity')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'activity'
                ? 'bg-accent text-white shadow-xs'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Activity & Analytics</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              activeTab === 'activity' ? 'bg-white/20 text-white' : 'bg-surface-2 text-secondary'
            }`}>
              {heatmap.length}d
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-accent text-white shadow-xs'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data & Settings</span>
          </button>
        </div>
      </Reveal>

      {/* ── Tab 1: Overview & Goals ──────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-up">
          {/* KPI Grid */}
          <Reveal delay={40} y={15}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBlock label="Total Cataloged"   value={profile?.totalProblems ?? 0}  sub="problems"          icon={FolderGit2}   color={colors.muted} isNumber />
              <StatBlock label="Total Solved"       value={profile?.totalSolved ?? 0}     sub="unique problems"   icon={CheckCircle2} color={colors.easy} isNumber />
              <StatBlock label="Sessions Logged"    value={profile?.totalAttempts ?? 0}   sub="total attempts"    icon={History}      color={colors.accent} isNumber />
              <StatBlock label="Current Streak"     value={`${profile?.currentStreak ?? 0}d`} sub={`best: ${profile?.longestStreak ?? 0}d`} icon={Flame} color={colors.medium} />
            </div>
          </Reveal>

          {/* Target Goals & Interview Readiness */}
          <Reveal delay={70} y={15}>
            <TargetGoalsCard />
          </Reveal>

          {/* Solve Pace & Insights */}
          <Reveal delay={100} y={15}>
            <div className="bg-surface border border-line rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-text flex items-center gap-2">
                    Solve Pace
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-2 text-secondary border border-line">
                      Weekly Velocity
                    </span>
                  </h2>
                  <p className="text-xs text-muted mt-0.5">Your practice rhythm & difficulty split</p>
                </div>
                <Link
                  to="/problems"
                  className="text-xs text-accent hover:text-accent-hover transition-colors shrink-0 whitespace-nowrap flex items-center gap-1 group"
                >
                  <span>View all</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(() => {
                  const pace = profile?.activeDays > 0
                    ? (profile.totalSolved / profile.activeDays * 7).toFixed(1)
                    : '0';
                  const attPerSolve = profile?.totalSolved > 0
                    ? (profile.totalAttempts / profile.totalSolved).toFixed(1)
                    : '—';
                  const easy = profile?.solvedByDifficulty?.easy ?? 0;
                  const med = profile?.solvedByDifficulty?.medium ?? 0;
                  const hard = profile?.solvedByDifficulty?.hard ?? 0;
                  const total = profile?.totalSolved || 1;
                  const medHardPct = Math.round(((med + hard) / total) * 100);
                  return (
                    <>
                      <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-surface-2/40 border border-line hover:border-line/80 transition-all cursor-default">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-secondary font-medium">Solve Rate</span>
                          <TrendingUp className="w-3.5 h-3.5 text-easy" />
                        </div>
                        <span className="text-xl font-semibold tabular-nums text-text leading-none my-0.5">{pace}</span>
                        <span className="text-xs text-muted">problems/week</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-surface-2/40 border border-line hover:border-line/80 transition-all cursor-default">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-secondary font-medium">Attempts/Solve</span>
                          <History className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <span className="text-xl font-semibold tabular-nums text-accent leading-none my-0.5">{attPerSolve}</span>
                        <span className="text-xs text-muted">avg attempts</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-surface-2/40 border border-line hover:border-line/80 transition-all cursor-default">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-secondary font-medium">Med+Hard %</span>
                          <Brain className={`w-3.5 h-3.5 ${medHardPct >= 65 ? 'text-easy' : 'text-medium'}`} />
                        </div>
                        <span className={`text-xl font-semibold tabular-nums leading-none my-0.5 ${medHardPct >= 65 ? 'text-easy' : 'text-medium'}`}>{medHardPct}%</span>
                        <span className="text-xs text-muted">{medHardPct >= 65 ? 'interview ready' : 'need more hard'}</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-surface-2/40 border border-line hover:border-line/80 transition-all cursor-default">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-wider text-secondary font-medium">Active Ratio</span>
                          <Zap className="w-3.5 h-3.5 text-medium" />
                        </div>
                        <span className="text-xl font-semibold tabular-nums text-medium leading-none my-0.5">
                          {profile?.activeDays > 0 && memberSince ? `${profile.activeDays}d` : `${profile?.activeDays ?? 0}d`}
                        </span>
                        <span className="text-xs text-muted">active days</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ── Tab: Connected Platforms ────────────────────────────── */}
      {activeTab === 'platforms' && (
        <div className="space-y-6 animate-fade-up">
          <Reveal delay={40} y={15}>
            <PlatformSyncHub onSyncSuccess={load} />
          </Reveal>
        </div>
      )}

      {/* ── Tab 2: Milestones & Badges ───────────────────────────── */}
      {activeTab === 'milestones' && (
        <div className="space-y-6 animate-fade-up">
          <Reveal delay={40} y={15}>
            <div className="bg-surface border border-line rounded-xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-text">Milestone Hall of Fame</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/12 border border-accent/25 text-accent">
                      {profile?.badges?.length ?? 0} / {ALL_MILESTONES.length} Unlocked
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Click any milestone badge to inspect unlock criteria & your progress</p>
                </div>

                {/* Segmented Filter Pills */}
                <div className="flex items-center p-1 bg-surface-2 border border-line rounded-lg text-xs shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMilestoneFilter('all')}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      milestoneFilter === 'all'
                        ? 'bg-surface text-text shadow-xs'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    All ({ALL_MILESTONES.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMilestoneFilter('earned')}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      milestoneFilter === 'earned'
                        ? 'bg-surface text-text shadow-xs'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    Earned ({profile?.badges?.length ?? 0})
                  </button>
                </div>
              </div>

              {milestoneFilter === 'earned' && (!profile?.badges || profile.badges.length === 0) ? (
                <div className="border border-dashed border-line rounded-xl p-10 text-center">
                  <Target className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-xs text-muted">No badges earned yet. Solve your first problem to kickstart your journey!</p>
                  <Link to="/problems" className="btn-primary inline-flex mt-4 text-xs">
                    + Catalog a Problem
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {(milestoneFilter === 'earned'
                      ? ALL_MILESTONES.filter(m => m.check(profile || {}))
                      : ALL_MILESTONES
                    ).map((m, idx) => {
                      const isUnlocked = m.check ? m.check(profile || {}) : false;
                      const currentMetric = m.metric ? m.metric(profile || {}) : 0;
                      const pct = Math.min(100, Math.round((currentMetric / m.target) * 100));
                      const conf = MILESTONE_CONFIG[m.id] || { Icon: Award, color: colors.accent, bg: `${colors.accent}1f`, border: `${colors.accent}40` };

                      return (
                        <Reveal key={m.id} delay={Math.min(idx * 25, 250)} y={10} className="h-full">
                          <TiltCard maxTilt={6} className="h-full">
                            <div
                              onClick={() => setSelectedMilestone({ ...m, iconComponent: conf.Icon, ...conf })}
                              className={`badge-card h-full flex flex-col items-center p-3.5 rounded-xl border transition-all duration-200 text-center cursor-pointer group select-none relative ${
                                isUnlocked
                                  ? 'border-line bg-surface hover:bg-surface-2'
                                  : 'border-line/60 bg-surface/60 opacity-60 hover:opacity-90'
                              }`}
                            >
                              {/* Top Mini Lock / Check Icon */}
                              <div className="absolute top-2.5 right-2.5">
                                {isUnlocked ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-easy" />
                                ) : (
                                  <Lock className="w-3 h-3 text-muted" />
                                )}
                              </div>

                              <MilestoneBadgeIcon
                                id={m.id}
                                size={20}
                                className={`mb-2.5 ${!isUnlocked ? 'grayscale opacity-50' : ''}`}
                              />

                              <p className="text-xs font-semibold text-text truncate w-full">{m.label}</p>
                              <p className="text-xs text-muted line-clamp-2 h-[32px] mt-0.5 leading-snug w-full">
                                {m.desc}
                              </p>

                              {/* Progress indicator for locked milestones */}
                              {!isUnlocked && (
                                <div className="w-full mt-2.5">
                                  <div className="h-1 rounded-full overflow-hidden bg-surface-2">
                                    <div
                                      className="h-full rounded-full"
                                      style={{ width: `${pct}%`, backgroundColor: conf.color }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-muted block mt-1">
                                    {currentMetric}/{m.target} ({pct}%)
                                  </span>
                                </div>
                              )}
                            </div>
                          </TiltCard>
                        </Reveal>
                      );
                    })}
                  </div>

                  {/* Next badge teaser */}
                  <NextBadgeTeaser profile={profile} />
                </>
              )}
            </div>
          </Reveal>
        </div>
      )}

      {/* ── Tab 3: Activity & Analytics ─────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="space-y-6 animate-fade-up">
          {/* Yearly Heatmap */}
          <Reveal delay={40} y={15}>
            <div className="bg-surface border border-line rounded-xl p-5">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-text">Activity Heatmap</h2>
                  <p className="text-xs text-muted mt-0.5">365-day practice history</p>
                </div>
                <Badge variant="default" size="xs">{heatmap.length} active days</Badge>
              </div>
              <YearlyHeatmap heatmapData={heatmap} />
            </div>
          </Reveal>

          {/* Difficulty Distribution + Weekly Momentum */}
          <Reveal delay={70} y={15}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-surface border border-line rounded-xl p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-text">Difficulty Distribution</h2>
                    <p className="text-xs text-muted mt-0.5">Your solve breakdown by difficulty</p>
                  </div>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-easy/12 border border-easy/25">
                    <Layers className="w-3.5 h-3.5 text-easy" />
                  </div>
                </div>
                <DifficultyDistribution profile={profile} />
              </div>

              <div className="bg-surface border border-line rounded-xl p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-text">Weekly Momentum</h2>
                    <p className="text-xs text-muted mt-0.5">Sessions per week · last 8 weeks</p>
                  </div>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/12 border border-accent/25">
                    <BarChart3 className="w-3.5 h-3.5 text-accent" />
                  </div>
                </div>
                <WeeklyMomentum heatmapData={heatmap} />
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* ── Tab 4: Data & Settings ──────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-up">
          {/* Account Preferences & Security */}
          <Reveal delay={40} y={15}>
            <div className="bg-surface border border-line rounded-xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-text">Account & Security</h2>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-2 text-secondary border border-line">
                      PROFILE SETTINGS
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Manage your profile details, avatar, and password credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn-primary min-h-[40px] px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Edit Profile & Password</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-line">
                <div className="p-3 rounded-lg bg-surface-2/40 border border-line">
                  <span className="text-xs text-muted block">Display Name</span>
                  <span className="text-xs font-semibold text-text mt-0.5 block truncate">{user?.name || 'DSA Coder'}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-2/40 border border-line">
                  <span className="text-xs text-muted block">Email Address</span>
                  <span className="text-xs font-semibold text-text mt-0.5 block truncate">{user?.email || '—'}</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-2/40 border border-line">
                  <span className="text-xs text-muted block">Account Status</span>
                  <span className="text-xs font-semibold text-easy mt-0.5 block">Verified & Active</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Data Portability & Backup */}
          <Reveal delay={70} y={15}>
            <div className="bg-surface border border-line rounded-xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-text">Data Portability & Backup</h2>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-2 text-secondary border border-line">
                      OFFLINE BACKUP
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Export all your cataloged problems, topics, and practice records.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(true)}
                    className="btn-secondary min-h-[40px] px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-easy" />
                    <span>Import Backup</span>
                  </button>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportData('json')}
                    className="btn-secondary min-h-[40px] px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <FileJson className="w-3.5 h-3.5 text-medium" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportData('csv')}
                    className="btn-primary min-h-[40px] px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-surface-2/40 border border-line flex items-center gap-3 text-xs text-muted">
                <Database className="w-4 h-4 text-muted shrink-0" />
                <p className="leading-relaxed text-xs">
                  Your data belongs to you. Backups include full problem descriptions, difficulty ratings, tags, attempt timestamps, and review statuses.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      {/* Edit Profile & Security Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Data Import & Restore Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={load}
      />

      {/* Interactive Milestone Detail & Progress Modal */}
      <MilestoneDetailModal
        milestone={selectedMilestone}
        profile={profile}
        isOpen={Boolean(selectedMilestone)}
        onClose={() => setSelectedMilestone(null)}
      />

    </div>
  );
};

export default ProfilePage;
