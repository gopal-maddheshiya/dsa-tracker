import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProfileAnalytics, fetchHeatmapAnalytics } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';
import ProgressRing from '../components/ui/ProgressRing';
import Badge from '../components/ui/Badge';

/* ── Helpers ──────────────────────────────────────────────────────── */
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

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
  heatmapData.forEach(({ date, count }) => { countMap[date] = count; });

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
    if (count === 0)   return '#1C1A18';
    if (count === 1)   return '#92400E';
    if (count === 2)   return '#B45309';
    if (count <= 4)    return '#D97706';
    if (count <= 6)    return '#F59E0B';
    return '#FCD34D';
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
                {lbl && <span className="text-[9px] text-[#3E3834] font-mono">{lbl.month}</span>}
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
                  <span className="text-[8px] text-[#3E3834] font-mono w-6 text-right">{d}</span>
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
                  title={cell.count !== null ? `${cell.date}: ${cell.count} session${cell.count !== 1 ? 's' : ''}` : ''}
                  style={{
                    width: 11, height: 11, borderRadius: 2,
                    background: getColor(cell.count),
                    border: cell.count !== null ? '1px solid rgba(0,0,0,0.2)' : 'none',
                    cursor: cell.count !== null ? 'pointer' : 'default',
                    transition: 'transform 0.1s',
                  }}
                  onMouseEnter={e => { if (cell.count !== null) e.target.style.transform = 'scale(1.4)'; }}
                  onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-2 ml-8">
          <span className="text-[9px] text-[#3E3834] font-mono">Less</span>
          {['#1C1A18','#92400E','#B45309','#D97706','#F59E0B','#FCD34D'].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: 2, background: c, border: '1px solid rgba(0,0,0,0.2)' }} />
          ))}
          <span className="text-[9px] text-[#3E3834] font-mono">More</span>
        </div>
      </div>
    </div>
  );
};

/* ── Stat Block ───────────────────────────────────────────────────── */
const StatBlock = ({ label, value, sub, color = '#F5F5F4', icon }) => (
  <div className="flex flex-col gap-1 p-4 rounded-2xl bg-[#1C1A18] border border-[#262320]">
    {icon && <span className="text-xl mb-0.5">{icon}</span>}
    <span className="text-[10px] font-mono uppercase tracking-widest text-[#3E3834]">{label}</span>
    <span className="text-2xl font-bold font-mono tracking-tight leading-none" style={{ color }}>{value}</span>
    {sub && <span className="text-[10px] font-mono text-[#6B6560]">{sub}</span>}
  </div>
);

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

  if (loading) {
    return (
      <div className="space-y-5 pb-12 animate-pulse">
        <div className="h-32 panel shimmer rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 panel shimmer rounded-2xl" />)}
        </div>
        <div className="h-48 panel shimmer rounded-2xl" />
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
      <div className="panel p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1C1A18 0%, #191715 60%, #1E1A16 100%)' }}>
        {/* Decorative glow blob */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #F97316, transparent)', transform: 'translate(30%, -30%)' }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-mono"
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))',
                border: '2px solid rgba(249,115,22,0.3)',
                color: '#F97316',
                boxShadow: '0 0 24px rgba(249,115,22,0.15)',
              }}>
              {initials}
            </div>
            {profile?.currentStreak > 0 && (
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#111110] border border-[#262320] flex items-center justify-center text-xs">
                🔥
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold tracking-tight text-[#F5F5F4]">
                {user?.name || 'DSA Coder'}
              </h1>
              <Badge variant="online" dot size="sm">Active</Badge>
            </div>
            <p className="text-xs text-[#6B6560] font-mono">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {profile?.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span>🔥</span>
                  <span className="font-bold font-mono text-[#F97316]">{profile.currentStreak}</span>
                  <span className="text-[#6B6560] font-mono">day streak</span>
                </div>
              )}
              {profile?.activeDays > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-mono text-[#6B6560]">📅</span>
                  <span className="font-bold font-mono text-[#A8A29E]">{profile.activeDays}</span>
                  <span className="text-[#6B6560] font-mono">active days</span>
                </div>
              )}
              {profile?.bestDay && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-mono text-[#6B6560]">⚡</span>
                  <span className="font-bold font-mono text-[#A8A29E]">{profile.bestDayCount}</span>
                  <span className="text-[#6B6560] font-mono">best day ({fmtDate(profile.bestDay)})</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress rings */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="text-center">
              <ProgressRing value={solvedPct} size={68} stroke={5} color="#10B981"
                label={<span className="text-xs font-bold font-mono text-emerald-400">{solvedPct}%</span>} />
              <p className="text-[9px] font-mono text-[#3E3834] mt-1">solved</p>
            </div>
            <div className="text-center">
              <ProgressRing
                value={Math.min(100, Math.round((profile?.longestStreak || 0) / 30 * 100))}
                size={68} stroke={5} color="#F97316"
                label={<span className="text-xs font-bold font-mono text-[#F97316]">{profile?.longestStreak || 0}d</span>}
              />
              <p className="text-[9px] font-mono text-[#3E3834] mt-1">best streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBlock label="Total Cataloged"   value={profile?.totalProblems ?? 0}  sub="problems"          icon="📂" />
        <StatBlock label="Total Solved"       value={profile?.totalSolved ?? 0}     sub="unique problems"   icon="✅" color="#10B981" />
        <StatBlock label="Sessions Logged"    value={profile?.totalAttempts ?? 0}   sub="total attempts"    icon="🗒️" />
        <StatBlock label="Current Streak"     value={`${profile?.currentStreak ?? 0}d`} sub={`best: ${profile?.longestStreak ?? 0}d`} icon="🔥" color="#F97316" />
      </div>

      {/* ── Difficulty breakdown ─────────────────────────────── */}
      <div className="panel p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F5F4]">Difficulty Breakdown</h2>
            <p className="text-[11px] text-[#6B6560] font-mono mt-0.5">Solved problems by tier</p>
          </div>
          <span className="text-xs font-mono text-[#3E3834]">{profile?.totalSolved ?? 0} total</span>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Easy',   key: 'easy',   color: '#10B981', track: '#052e16' },
            { label: 'Medium', key: 'medium', color: '#F59E0B', track: '#1c1400' },
            { label: 'Hard',   key: 'hard',   color: '#EF4444', track: '#1f0707' },
          ].map(({ label, key, color, track }) => {
            const val = profile?.solvedByDifficulty?.[key] ?? 0;
            const total = profile?.totalSolved || 1;
            const pct = Math.round((val / total) * 100);
            return (
              <div key={key}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color }}>{label}</span>
                  <span className="text-xs font-mono text-[#6B6560]">{val} <span className="text-[#3E3834]">({pct}%)</span></span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: track }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}99, ${color})`,
                      boxShadow: `0 0 8px ${color}66`,
                    }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Yearly Heatmap ──────────────────────────────────────── */}
      <div className="panel p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F5F4]">Activity Heatmap</h2>
            <p className="text-[11px] text-[#6B6560] font-mono mt-0.5">365-day practice history</p>
          </div>
          <Badge variant="default" size="xs">{heatmap.length} active days</Badge>
        </div>
        <YearlyHeatmap heatmapData={heatmap} />
      </div>

      {/* ── Milestone Badges ────────────────────────────────────── */}
      <div className="panel p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F5F4]">Milestones</h2>
            <p className="text-[11px] text-[#6B6560] font-mono mt-0.5">Achievements unlocked</p>
          </div>
          <Badge variant="gold" size="xs">{profile?.badges?.length ?? 0} earned</Badge>
        </div>

        {profile?.badges?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {profile.badges.map((badge) => (
              <div key={badge.id}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#2E2A27] bg-[#141312] hover:border-[#F97316]/20 hover:bg-[#1C1A18] transition-all duration-200 text-center group">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {badge.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F5F5F4]">{badge.label}</p>
                  <p className="text-[10px] text-[#6B6560] font-mono mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#262320] rounded-2xl p-10 text-center">
            <span className="text-3xl mb-3 block">🎯</span>
            <p className="text-xs text-[#6B6560] font-mono">Start solving problems to earn badges!</p>
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
