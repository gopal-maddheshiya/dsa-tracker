import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
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
import {
  Rocket, Sprout, Flame, Zap, Award, Crown, Brain, Gem, Calendar, Target,
  PartyPopper, FolderGit2, CheckCircle2, History, FolderOpen,
  TrendingUp, BarChart3, Trophy, Layers, Download, FileJson, FileSpreadsheet, Database,
  Settings, Upload, Lock, Sparkles
} from 'lucide-react';

/* ── Helpers ──────────────────────────────────────────────────────── */
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ── Milestone Config with Premium Icons ──────────────────────────── */
const MILESTONE_CONFIG = {
  day_one:      { Icon: Rocket, color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)' },
  first_step:   { Icon: Sprout, color: '#34D399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
  getting_warm: { Icon: Flame,  color: '#FB923C', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)' },
  half_century: { Icon: Zap,    color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
  century:      { Icon: Award,  color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  elite:        { Icon: Crown,  color: '#FCD34D', bg: 'rgba(252,211,77,0.15)', border: 'rgba(252,211,77,0.4)' },
  hard_first:   { Icon: Brain,  color: '#F43F5E', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)' },
  hard_ten:     { Icon: Gem,    color: '#C084FC', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)' },
  streak_7:     { Icon: Calendar, color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },
  streak_30:    { Icon: Target, color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
};

const MilestoneBadgeIcon = ({ id, size = 22, className = '' }) => {
  const conf = MILESTONE_CONFIG[id] || { Icon: Award, color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' };
  const { Icon, color, bg, border } = conf;
  return (
    <div
      className={`rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-lg ${className}`}
      style={{
        width: Math.round(size * 2),
        height: Math.round(size * 2),
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        color: color,
        boxShadow: `0 4px 16px ${color}22`,
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
    .stat-block-hover { transition: transform 0.2s, box-shadow 0.2s; }
    .stat-block-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(249,115,22,0.08); }
    .badge-card { position: relative; overflow: hidden; }
    .badge-card::before {
      content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
      background: linear-gradient(45deg, transparent 40%, rgba(249,115,22,0.06) 50%, transparent 60%);
      transform: translateX(-100%); transition: none;
    }
    .badge-card:hover::before { transform: translateX(100%); transition: transform 0.6s ease; }
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
  const [hoveredCell, setHoveredCell] = useState(null);

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
    if (count === 0)   return 'rgba(255, 255, 255, 0.04)';
    if (count === 1)   return '#9A3412';
    if (count === 2)   return '#C2410C';
    if (count <= 4)    return '#EA580C';
    if (count <= 6)    return '#F97316';
    return '#FDBA74';
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
      <div className="overflow-x-auto relative rounded-xl bg-[#0B0C0E]/50 border border-white/[0.05] p-3 sm:p-4">
        <div ref={containerRef} className="relative select-none" style={{ minWidth: 780 }}>
          {/* Month labels */}
          <div className="flex mb-1.5 ml-8" style={{ gap: 2.5 }}>
            {weeks.map((_, wi) => {
              const lbl = monthLabels.find(m => m.week === wi);
              return (
                <div key={wi} style={{ width: 12.5, flexShrink: 0 }}>
                  {lbl && <span className="text-[10px] text-[#9CA3AF] font-mono font-medium">{lbl.month}</span>}
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
                    <span className="text-[8px] text-[#9CA3AF] font-mono w-6 text-right font-medium">{d}</span>
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
                      border: cell.count !== null ? '1px solid rgba(255,255,255,0.06)' : 'none',
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
                className="pointer-events-none absolute z-50 px-2.5 py-1.5 rounded-xl text-[11px] font-mono shadow-2xl transition-all duration-75"
                style={{
                  left: clampedX,
                  top: isFlipped ? hoveredCell.y + 20 : hoveredCell.y - 36,
                  transform: 'translateX(-50%)',
                  backgroundColor: '#161920',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: '0 10px 28px -4px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(249, 115, 22, 0.25)',
                  whiteSpace: 'nowrap',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${hoveredCell.count > 0 ? 'text-[#F97316]' : 'text-[#9CA3AF]'}`}>
                    {hoveredCell.count} {hoveredCell.count === 1 ? 'session' : 'sessions'}
                  </span>
                  <span className="text-white/25">·</span>
                  <span className="text-[#F3F4F6] font-medium">
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
                          borderBottom: '5px solid #161920',
                        }
                      : {
                          top: '100%',
                          borderLeft: '5px solid transparent',
                          borderRight: '5px solid transparent',
                          borderTop: '5px solid #161920',
                        }),
                  }}
                />
              </div>
            );
          })()}

          {/* Legend Strip */}
          <div className="flex flex-wrap items-center justify-between mt-3.5 pt-2.5 border-t border-white/[0.05] sm:ml-8 ml-1 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#9CA3AF] font-mono">Less</span>
              {['rgba(255,255,255,0.04)','#9A3412','#C2410C','#EA580C','#F97316','#FDBA74'].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: 2.5, background: c, border: '1px solid rgba(255,255,255,0.08)' }} />
              ))}
              <span className="text-[10px] text-[#9CA3AF] font-mono">More</span>
            </div>
            <span className="text-[10px] font-mono text-[#6B7280]">
              Tap or hover any square to view date & practice sessions
            </span>
          </div>
        </div>
      </div>

      {/* ── Integrated Heatmap Analytics Bar ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-[#9CA3AF]" />
            Active Days
          </span>
          <div className="my-1">
            <span className="text-xl font-bold font-mono text-[#F3F4F6]">{activeDaysCount}</span>
            <span className="text-xs font-mono text-[#6B7280]"> / 365d</span>
          </div>
          <span className="text-[10px] font-mono text-[#9CA3AF]">{consistencyRate}% annual habit</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            Practice Pace
          </span>
          <div className="my-1">
            <span className="text-xl font-bold font-mono text-[#F3F4F6]">{avgPerWeek}</span>
            <span className="text-xs font-mono text-[#6B7280]"> sess/wk</span>
          </div>
          <span className="text-[10px] font-mono text-[#9CA3AF]">{totalSessions} sessions logged</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
            <Target className="w-3 h-3 text-emerald-400" />
            Prime Practice Day
          </span>
          <div className="my-1">
            <span className="text-xl font-bold font-mono text-emerald-400 truncate block">{bestDayName}</span>
          </div>
          <span className="text-[10px] font-mono text-[#9CA3AF]">{bestDaySessions} sessions logged</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-[#F97316]" />
            Peak Month
          </span>
          <div className="my-1">
            <span className="text-xl font-bold font-mono text-[#F97316] truncate block">{busiestMonthLabel}</span>
          </div>
          <span className="text-[10px] font-mono text-[#9CA3AF]">{busiestMonthCount} peak sessions</span>
        </div>
      </div>
    </div>
  );
};

/* ── Stat Block ───────────────────────────────────────────────────── */
const StatBlock = ({ label, value, sub, color = '#F3F4F6', icon: Icon }) => (
  <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[#14171C] border border-white/[0.08] stat-block-hover cursor-default shadow-md shadow-black/40">
    {Icon && (
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5 border"
        style={{
          color: color || '#9CA3AF',
          backgroundColor: color ? `${color}14` : 'rgba(255,255,255,0.05)',
          borderColor: color ? `${color}28` : 'rgba(255,255,255,0.08)',
        }}
      >
        <Icon className="w-4 h-4" />
      </div>
    )}
    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">{label}</span>
    <span className="text-2xl font-bold font-mono tracking-tight leading-none" style={{ color }}>{value}</span>
    {sub && <span className="text-[10px] font-mono text-[#6B7280]">{sub}</span>}
  </div>
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
      <div className="mt-4 p-4 rounded-2xl border border-dashed border-[#F97316]/30 bg-[#F97316]/5 text-center">
        <PartyPopper className="w-8 h-8 text-[#F97316] mx-auto mb-1" />
        <p className="text-xs font-mono text-[#F97316] mt-1">All milestones unlocked! You're a legend.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-2xl border border-white/[0.08] bg-[#0E1014]">
      <div className="flex items-center gap-3">
        <MilestoneBadgeIcon id={nextMilestone.id} size={18} className="opacity-40 grayscale shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#9CA3AF]">
              Next: <span className="text-[#F3F4F6]">{nextMilestone.label}</span>
            </span>
            <span className="text-[10px] font-mono text-[#9CA3AF]">
              {nextMilestone.current}/{nextMilestone.target}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-white/[0.08]">
            <div
              className="h-full rounded-full bar-animated"
              style={{
                width: `${nextMilestone.pct}%`,
                background: 'linear-gradient(90deg, #F9731666, #F97316)',
                boxShadow: '0 0 8px rgba(249,115,22,0.4)',
              }}
            />
          </div>
          <p className="text-[10px] font-mono text-[#6B7280] mt-1">{nextMilestone.desc}</p>
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
    { label: 'Easy',   count: easy, pct: Math.round((easy / total) * 100), color: '#10B981', gradient: 'linear-gradient(90deg, #059669, #10B981, #34D399)' },
    { label: 'Medium', count: med,  pct: Math.round((med  / total) * 100), color: '#F59E0B', gradient: 'linear-gradient(90deg, #D97706, #F59E0B, #FBBF24)' },
    { label: 'Hard',   count: hard, pct: Math.round((hard / total) * 100), color: '#F43F5E', gradient: 'linear-gradient(90deg, #E11D48, #F43F5E, #FB7185)' },
  ];

  return (
    <div className="space-y-4">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color, boxShadow: `0 0 6px ${b.color}66` }} />
              <span className="text-xs font-semibold text-[#F3F4F6]">{b.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono" style={{ color: b.color }}>{b.count}</span>
              <span className="text-[10px] font-mono text-[#6B7280]">{b.pct}%</span>
            </div>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-white/[0.06]">
            <div
              className="h-full rounded-full bar-animated"
              style={{
                width: `${b.pct}%`,
                background: b.gradient,
                boxShadow: `0 0 10px ${b.color}33`,
              }}
            />
          </div>
        </div>
      ))}

      {/* Ratio summary strip */}
      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/[0.06]">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden flex">
          {easy > 0 && <div className="h-full" style={{ width: `${(easy / total) * 100}%`, background: '#10B981' }} />}
          {med  > 0 && <div className="h-full" style={{ width: `${(med  / total) * 100}%`, background: '#F59E0B' }} />}
          {hard > 0 && <div className="h-full" style={{ width: `${(hard / total) * 100}%`, background: '#F43F5E' }} />}
        </div>
        <span className="text-[10px] font-mono text-[#6B7280] shrink-0">{total} solved</span>
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
  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#F43F5E' : '#9CA3AF';
  const trendLabel = trend === 'up' ? `+${lastWeek - prevWeek} vs last week` : trend === 'down' ? `${lastWeek - prevWeek} vs last week` : 'Same as last week';

  return (
    <div>
      {/* Trend indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${trendColor}18`, border: `1px solid ${trendColor}33` }}>
          <TrendingUp className="w-3.5 h-3.5" style={{ color: trendColor, transform: trend === 'down' ? 'rotate(180deg)' : 'none' }} />
        </div>
        <span className="text-xs font-mono" style={{ color: trendColor }}>{trendLabel}</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2" style={{ height: 100 }}>
        {weeks.map((w, i) => {
          const barH = Math.max(4, (w.count / maxCount) * 88);
          const isLatest = i === weeks.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-default">
              <span className="text-[9px] font-mono text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity">
                {w.count}
              </span>
              <div
                className="w-full rounded-md bar-animated transition-all duration-200 group-hover:scale-x-110"
                style={{
                  height: barH,
                  background: isLatest
                    ? 'linear-gradient(180deg, #F97316, #EA580C)'
                    : 'linear-gradient(180deg, rgba(249,115,22,0.35), rgba(249,115,22,0.15))',
                  border: isLatest ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(249,115,22,0.1)',
                  boxShadow: isLatest ? '0 0 12px rgba(249,115,22,0.3)' : 'none',
                  minWidth: 12,
                }}
              />
              <span className="text-[8px] font-mono text-[#6B7280] truncate w-full text-center">
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
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(problems, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `dsa-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast?.success && toast.success(`Successfully exported ${problems.length} problems as JSON!`);
      } else if (format === 'csv') {
        const headers = ['Title', 'Platform', 'Difficulty', 'Topics', 'Link', 'Created At'];
        const rows = problems.map((p) => [
          `"${(p.title || '').replace(/"/g, '""')}"`,
          `"${p.platform || ''}"`,
          `"${p.difficulty || ''}"`,
          `"${(p.topics || []).join('; ')}"`,
          `"${p.link || ''}"`,
          `"${p.createdAt || ''}"`,
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', encodedUri);
        downloadAnchor.setAttribute('download', `dsa-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
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
        <div className="h-36 panel shimmer rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-28 panel shimmer rounded-2xl" />)}
        </div>
        <div className="h-24 panel shimmer rounded-2xl" />
        <div className="h-52 panel shimmer rounded-2xl" />
        <div className="h-40 panel shimmer rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-10 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={load} className="btn-ghost mt-4">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-up">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="panel p-6 sm:p-7 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #14171C 0%, #101216 100%)' }}>
        {/* Decorative glow blob */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)', transform: 'translate(20%, -20%)', filter: 'blur(30px)' }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || 'User'}
                className="w-16 h-16 rounded-2xl object-cover border-2 transition-all shadow-xl"
                style={{
                  borderColor: `${rank.color}66`,
                  boxShadow: `0 0 24px ${rank.color}33`,
                }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-mono transition-all shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${rank.color}33, ${rank.color}0D)`,
                  border: `2px solid ${rank.color}66`,
                  color: rank.color,
                  boxShadow: `0 0 24px ${rank.color}33`,
                }}
              >
                {initials}
              </div>
            )}
            {profile?.currentStreak > 0 && (
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#0D0F13] border border-white/[0.1] flex items-center justify-center shadow-md">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-xl font-bold tracking-tight text-[#F3F4F6]">
                {user?.name || 'DSA Coder'}
              </h1>
              {/* Rank badge */}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono border"
                style={{
                  color: rank.color,
                  borderColor: `${rank.color}33`,
                  background: `${rank.color}14`,
                }}
              >
                {rank.Icon && <rank.Icon className="w-3 h-3" />}
                {rank.label}
              </span>
              <Badge variant="online" dot size="sm">Active</Badge>
            </div>
            <p className="text-xs text-[#9CA3AF] font-mono">
              {user?.email}
              {memberSince && <span className="ml-2 text-[#6B7280]">· Member since {memberSince}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {profile?.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Flame className="w-3.5 h-3.5 text-[#F97316] fill-[#F97316]/20" />
                  <span className="font-bold font-mono text-[#F97316]">{profile.currentStreak}</span>
                  <span className="text-[#9CA3AF] font-mono">day streak</span>
                </div>
              )}
              {profile?.activeDays > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span className="font-bold font-mono text-[#F3F4F6]">{profile.activeDays}</span>
                  <span className="text-[#9CA3AF] font-mono">active days</span>
                </div>
              )}
              {profile?.bestDay && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="font-bold font-mono text-[#F3F4F6]">{profile.bestDayCount}</span>
                  <span className="text-[#9CA3AF] font-mono">best day ({fmtDate(profile.bestDay)})</span>
                </div>
              )}
            </div>

            {/* Rank progress bar (if not max rank) */}
            {rank.next && (
              <div className="mt-3.5 max-w-sm">
                <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    {rank.Icon && <rank.Icon className="w-3 h-3 text-orange-400" />}
                    <span className="font-semibold text-[#F3F4F6]">{rank.label}</span>
                  </span>
                  <span className="text-orange-400 font-semibold flex items-center gap-1">
                    <span>{Math.round(rank.progress)}%</span>
                    <span className="text-[#6B7280]">to {rank.next.label}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-white/[0.08] p-0.5">
                  <div
                    className="h-full rounded-full bar-animated"
                    style={{
                      width: `${Math.min(rank.progress, 100)}%`,
                      background: `linear-gradient(90deg, ${rank.color}, ${rank.next.color})`,
                      boxShadow: `0 0 10px ${rank.color}66`,
                    }}
                  />
                </div>
                <p className="text-[10px] font-mono text-[#6B7280] mt-1 flex items-center justify-between">
                  <span>{profile?.totalSolved ?? 0} problems solved</span>
                  <span>Goal: {rank.next.min} solved</span>
                </p>
              </div>
            )}
          </div>

          {/* Edit Profile & Security Action */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="self-start sm:self-center shrink-0 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-orange-500/40 text-xs font-semibold text-slate-200 hover:text-orange-400 transition-all flex items-center gap-2 active:scale-95 shadow-xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account Settings</span>
          </button>

          {/* Progress rings */}
          <div className="flex items-center gap-5 shrink-0 bg-[#0D0F13]/80 p-3 rounded-2xl border border-white/[0.06]">
            <div className="text-center">
              <ProgressRing value={solvedPct} size={68} stroke={5} color="#10B981"
                label={<span className="text-xs font-bold font-mono text-emerald-400">{solvedPct}%</span>} />
              <p className="text-[10px] font-mono text-[#9CA3AF] mt-1">solved</p>
            </div>
            <div className="text-center">
              <ProgressRing
                value={Math.min(100, Math.round((profile?.longestStreak || 0) / 30 * 100))}
                size={68} stroke={5} color="#F97316"
                label={<span className="text-xs font-bold font-mono text-[#F97316]">{profile?.longestStreak || 0}d</span>}
              />
              <p className="text-[10px] font-mono text-[#9CA3AF] mt-1">best streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBlock label="Total Cataloged"   value={profile?.totalProblems ?? 0}  sub="problems"          icon={FolderGit2}   color="#9CA3AF" />
        <StatBlock label="Total Solved"       value={profile?.totalSolved ?? 0}     sub="unique problems"   icon={CheckCircle2} color="#10B981" />
        <StatBlock label="Sessions Logged"    value={profile?.totalAttempts ?? 0}   sub="total attempts"    icon={History}      color="#F97316" />
        <StatBlock label="Current Streak"     value={`${profile?.currentStreak ?? 0}d`} sub={`best: ${profile?.longestStreak ?? 0}d`} icon={Flame} color="#F59E0B" />
      </div>

      {/* ── Target Goals & Interview Readiness ──────────────────── */}
      <TargetGoalsCard />


      {/* ── Solve Pace & Insights ─────────────────────────────── */}
      <div className="panel p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#F3F4F6]">Solve Pace</h2>
            <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">Your practice rhythm & difficulty split</p>
          </div>
          <Link to="/problems" className="text-[11px] font-mono text-[#F97316] hover:text-[#FB923C] transition-colors">
            View all →
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
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#0E1014] border border-white/[0.07] stat-block-hover cursor-default">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">Solve Rate</span>
                  <span className="text-lg font-bold font-mono text-[#F3F4F6] leading-none">{pace}</span>
                  <span className="text-[10px] font-mono text-[#6B7280]">problems/week</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#0E1014] border border-white/[0.07] stat-block-hover cursor-default">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">Attempts/Solve</span>
                  <span className="text-lg font-bold font-mono text-[#F97316] leading-none">{attPerSolve}</span>
                  <span className="text-[10px] font-mono text-[#6B7280]">avg attempts</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#0E1014] border border-white/[0.07] stat-block-hover cursor-default">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">Med+Hard %</span>
                  <span className={`text-lg font-bold font-mono leading-none ${medHardPct >= 65 ? 'text-emerald-400' : 'text-amber-400'}`}>{medHardPct}%</span>
                  <span className="text-[10px] font-mono text-[#6B7280]">{medHardPct >= 65 ? 'interview ready' : 'need more hard'}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#0E1014] border border-white/[0.07] stat-block-hover cursor-default">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF]">Split</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px] font-bold font-mono text-emerald-400">{easy}E</span>
                    <span className="text-[9px] text-[#6B7280]">/</span>
                    <span className="text-[11px] font-bold font-mono text-amber-400">{med}M</span>
                    <span className="text-[9px] text-[#6B7280]">/</span>
                    <span className="text-[11px] font-bold font-mono text-rose-400">{hard}H</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B7280]">difficulty ratio</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ── Yearly Heatmap ──────────────────────────────────────── */}
      <div className="panel p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[#F3F4F6]">Activity Heatmap</h2>
            <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">365-day practice history</p>
          </div>
          <Badge variant="default" size="xs">{heatmap.length} active days</Badge>
        </div>
        <YearlyHeatmap heatmapData={heatmap} />
      </div>

      {/* ── Difficulty Distribution + Weekly Momentum ────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="panel p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-[#F3F4F6]">Difficulty Distribution</h2>
              <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">Your solve breakdown by difficulty</p>
            </div>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <DifficultyDistribution profile={profile} />
        </div>

        <div className="panel p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-[#F3F4F6]">Weekly Momentum</h2>
              <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">Sessions per week · last 8 weeks</p>
            </div>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#F97316]/10 border border-[#F97316]/20">
              <BarChart3 className="w-3.5 h-3.5 text-[#F97316]" />
            </div>
          </div>
          <WeeklyMomentum heatmapData={heatmap} />
        </div>
      </div>

      {/* ── Milestone Hall of Fame ─────────────────────────────── */}
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#F3F4F6]">Milestone Hall of Fame</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                {profile?.badges?.length ?? 0} / {ALL_MILESTONES.length} Unlocked
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">Click any milestone badge to inspect unlock criteria & your progress</p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center p-1 bg-[#0E1014] border border-white/[0.08] rounded-xl text-xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMilestoneFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                milestoneFilter === 'all'
                  ? 'bg-white/[0.1] text-[#F3F4F6] shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#D1D5DB]'
              }`}
            >
              All ({ALL_MILESTONES.length})
            </button>
            <button
              type="button"
              onClick={() => setMilestoneFilter('earned')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                milestoneFilter === 'earned'
                  ? 'bg-white/[0.1] text-[#F3F4F6] shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#D1D5DB]'
              }`}
            >
              Earned ({profile?.badges?.length ?? 0})
            </button>
          </div>
        </div>

        {milestoneFilter === 'earned' && (!profile?.badges || profile.badges.length === 0) ? (
          <div className="border border-dashed border-white/[0.1] rounded-2xl p-10 text-center">
            <Target className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
            <p className="text-xs text-[#9CA3AF] font-mono">No badges earned yet. Solve your first problem to kickstart your journey!</p>
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
              ).map((m) => {
                const isUnlocked = m.check ? m.check(profile || {}) : false;
                const currentMetric = m.metric ? m.metric(profile || {}) : 0;
                const pct = Math.min(100, Math.round((currentMetric / m.target) * 100));
                const conf = MILESTONE_CONFIG[m.id] || { Icon: Award, color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' };

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMilestone({ ...m, iconComponent: conf.Icon, ...conf })}
                    className={`badge-card flex flex-col items-center p-3.5 rounded-2xl border transition-all duration-200 text-center cursor-pointer group select-none relative ${
                      isUnlocked
                        ? 'border-white/[0.1] bg-[#0E1014] hover:border-[#F97316]/50 hover:bg-[#15181E] shadow-sm hover:scale-[1.02]'
                        : 'border-white/[0.05] bg-[#0A0C0E]/60 opacity-60 hover:opacity-90 hover:border-white/[0.15]'
                    }`}
                  >
                    {/* Top Mini Lock / Check Icon */}
                    <div className="absolute top-2 right-2">
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-[#6B7280]" />
                      )}
                    </div>

                    <MilestoneBadgeIcon
                      id={m.id}
                      size={20}
                      className={`mb-2.5 ${!isUnlocked ? 'grayscale opacity-50' : ''}`}
                    />

                    <p className="text-xs font-semibold text-[#F3F4F6] truncate w-full">{m.label}</p>
                    <p className="text-[10px] text-[#9CA3AF] font-mono truncate w-full mt-0.5">{m.desc}</p>

                    {/* Progress indicator for locked milestones */}
                    {!isUnlocked && (
                      <div className="w-full mt-2.5">
                        <div className="h-1 rounded-full overflow-hidden bg-white/[0.08]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: conf.color }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-[#6B7280] block mt-1">
                          {currentMetric}/{m.target} ({pct}%)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Next badge teaser */}
            <NextBadgeTeaser profile={profile} />
          </>
        )}
      </div>

      {/* ── Data Portability & Backup ────────────────────────────── */}
      <div className="panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#F3F4F6]">Data Portability & Backup</h2>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                OFFLINE BACKUP
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">
              Export all your cataloged problems, topics, and practice records.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Backup</span>
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExportData('json')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleExportData('csv')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-[0_2px_12px_rgba(249,115,22,0.25)] transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 text-xs text-slate-400 font-mono">
          <Database className="w-4 h-4 text-slate-500 shrink-0" />
          <p className="leading-relaxed text-[11px]">
            Your data belongs to you. Backups include full problem descriptions, difficulty ratings, tags, attempt timestamps, and review statuses.
          </p>
        </div>
      </div>

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
