import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProfileAnalytics, fetchHeatmapAnalytics } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';
import { getRank, fmtMonthYear } from '../utils/profileUtils';
import ProgressRing from '../components/ui/ProgressRing';
import Badge from '../components/ui/Badge';
import {
  Rocket, Sprout, Flame, Zap, Award, Crown, Brain, Gem, Calendar, Target,
  PartyPopper, FolderGit2, CheckCircle2, History, FolderOpen
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
    .heatmap-cell .heatmap-tip {
      display: none; position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
      background: #14171C; border: 1px solid rgba(255,255,255,0.14); border-radius: 8px; padding: 4px 8px;
      white-space: nowrap; z-index: 50; pointer-events: none;
      font-size: 10px; font-family: monospace; color: #F3F4F6;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    }
    .heatmap-cell .heatmap-tip::after {
      content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
      border: 4px solid transparent; border-top-color: rgba(255,255,255,0.14);
    }
    .heatmap-cell:hover .heatmap-tip { display: block; }
  `;
  document.head.appendChild(style);
}

/* ── Yearly Heatmap ───────────────────────────────────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const YearlyHeatmap = ({ heatmapData = [] }) => {
  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(today.getFullYear() - 1);
  yearAgo.setDate(yearAgo.getDate() + 1);

  // Build a map from date string -> count
  const countMap = {};
  let totalSessions = 0;
  const monthCounts = {};
  heatmapData.forEach(({ date, count }) => {
    countMap[date] = count;
    totalSessions += count;
    const m = date.slice(0, 7); // YYYY-MM
    monthCounts[m] = (monthCounts[m] || 0) + count;
  });

  // Summary stats
  const activeDaysCount = heatmapData.filter(h => h.count > 0).length;
  const weeksCount = Math.max(1, Math.ceil(365 / 7));
  const avgPerWeek = (totalSessions / weeksCount).toFixed(1);
  const busiestMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestMonthLabel = busiestMonth
    ? (() => { const [y, m] = busiestMonth[0].split('-'); return `${MONTHS[parseInt(m, 10) - 1]} ${y}`; })()
    : '—';

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
    <div className="overflow-x-auto">
      <div style={{ minWidth: 680 }}>
        {/* Month labels */}
        <div className="flex mb-1 ml-8" style={{ gap: 2 }}>
          {weeks.map((_, wi) => {
            const lbl = monthLabels.find(m => m.week === wi);
            return (
              <div key={wi} style={{ width: 11, flexShrink: 0 }}>
                {lbl && <span className="text-[9px] text-[#6B6560] font-mono">{lbl.month}</span>}
              </div>
            );
          })}
        </div>

        <div className="flex" style={{ gap: 2 }}>
          {/* Day labels */}
          <div className="flex flex-col mr-1" style={{ gap: 2, paddingTop: 0 }}>
            {DAYS.map((d, i) => (
              <div key={d} style={{ height: 11, display: 'flex', alignItems: 'center' }}>
                {i % 2 === 1 && (
                  <span className="text-[8px] text-[#6B6560] font-mono w-6 text-right">{d}</span>
                )}
                {i % 2 === 0 && <span className="w-6" />}
              </div>
            ))}
          </div>

          {/* Cells */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: 2 }}>
              {week.map((cell, di) => (
                <div
                  key={di}
                  className="heatmap-cell"
                  style={{
                    width: 11, height: 11, borderRadius: 2,
                    background: getColor(cell.count),
                    border: cell.count !== null ? '1px solid rgba(0,0,0,0.2)' : 'none',
                    cursor: cell.count !== null ? 'pointer' : 'default',
                    transition: 'transform 0.1s',
                  }}
                  onMouseEnter={e => { if (cell.count !== null) e.currentTarget.style.transform = 'scale(1.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {cell.count !== null && (
                    <div className="heatmap-tip">
                      <span style={{ color: cell.count > 0 ? '#F59E0B' : '#6B6560' }}>{cell.count}</span>
                      <span style={{ color: '#6B6560' }}> session{cell.count !== 1 ? 's' : ''} · </span>
                      <span style={{ color: '#A8A29E' }}>{cell.date}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend + Summary stats */}
        <div className="flex flex-wrap items-center justify-between mt-3 ml-8 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#6B6560] font-mono">Less</span>
            {['#1C1A18','#92400E','#B45309','#D97706','#F59E0B','#FCD34D'].map(c => (
              <div key={c} style={{ width: 11, height: 11, borderRadius: 2, background: c, border: '1px solid rgba(0,0,0,0.2)' }} />
            ))}
            <span className="text-[9px] text-[#6B6560] font-mono">More</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-[#6B6560]">
              <span className="text-[#A8A29E]">{totalSessions}</span> sessions
            </span>
            <span className="text-[9px] font-mono text-[#6B6560]">
              <span className="text-[#A8A29E]">{avgPerWeek}</span>/week avg
            </span>
            <span className="text-[9px] font-mono text-[#6B6560]">
              busiest: <span className="text-[#A8A29E]">{busiestMonthLabel}</span>
            </span>
          </div>
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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-mono"
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.06))',
                border: '2px solid rgba(249,115,22,0.35)',
                color: '#F97316',
                boxShadow: '0 0 24px rgba(249,115,22,0.2)',
              }}>
              {initials}
            </div>
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
              <div className="mt-3.5 max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-[#9CA3AF] flex items-center gap-1">
                    {rank.Icon && <rank.Icon className="w-2.5 h-2.5" />}
                    {rank.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#9CA3AF] flex items-center gap-1">
                    {rank.next.Icon && <rank.next.Icon className="w-2.5 h-2.5" />}
                    {rank.next.label}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bar-animated"
                    style={{
                      width: `${Math.min(rank.progress, 100)}%`,
                      background: `linear-gradient(90deg, ${rank.color}99, ${rank.next.color})`,
                    }}
                  />
                </div>
                <p className="text-[10px] font-mono text-[#6B7280] mt-1">
                  {profile?.totalSolved ?? 0}/{rank.next.min} solved to rank up
                </p>
              </div>
            )}
          </div>

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

      {/* ── Milestone Badges ────────────────────────────────────── */}
      <div className="panel p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[#F3F4F6]">Milestones</h2>
            <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">Achievements unlocked</p>
          </div>
          <Badge variant="gold" size="xs">{profile?.badges?.length ?? 0} earned</Badge>
        </div>

        {profile?.badges?.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {profile.badges.map((badge) => (
                <div key={badge.id}
                  className="badge-card flex flex-col items-center gap-3 p-4 rounded-2xl border border-white/[0.08] bg-[#0E1014] hover:border-[#F97316]/35 hover:bg-[#15181D] transition-all duration-200 text-center group">
                  <MilestoneBadgeIcon id={badge.id} size={22} />
                  <div>
                    <p className="text-xs font-semibold text-[#F3F4F6]">{badge.label}</p>
                    <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <NextBadgeTeaser profile={profile} />
          </>
        ) : (
          <div className="border border-dashed border-white/[0.1] rounded-2xl p-10 text-center">
            <Target className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
            <p className="text-xs text-[#9CA3AF] font-mono">Start solving problems to earn badges!</p>
            <Link to="/problems" className="btn-primary inline-flex mt-4 text-xs">
              + Add a Problem
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;
