import React from 'react';
import { Flame, Calendar, Zap, CheckCircle2, Globe, Settings } from 'lucide-react';
import ProgressRing from '../ui/ProgressRing';
import Badge from '../ui/Badge';
import Reveal from '../common/Reveal';
import { colors } from '../../theme/colors';

const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ProfileHeader = ({
  user,
  profile,
  rank,
  solvedPct,
  initials,
  memberSince,
  activeTab,
  onTabChange,
  onOpenEditModal,
}) => {
  return (
    <Reveal delay={0} y={15}>
      <div className="bg-gradient-to-br from-surface via-surface to-surface-2/60 border border-line/90 shadow-md rounded-2xl p-5 sm:p-7 relative overflow-hidden">
        {/* Ambient Lighting Gradients */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-easy/6 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Left: User Identity & Stats */}
          <div className="flex-1 min-w-0 w-full lg:w-auto">
            {/* Avatar + Primary User Details Row */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              {/* Avatar with rank glowing border */}
              <div className="relative shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || 'User'}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 shadow-sm transition-all"
                    style={{
                      borderColor: rank.color,
                      boxShadow: `0 0 20px -4px ${rank.color}35`,
                    }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold transition-all bg-surface-2 border-2 shadow-sm"
                    style={{
                      borderColor: rank.color,
                      color: rank.color,
                      boxShadow: `0 0 20px -4px ${rank.color}35`,
                    }}
                  >
                    {initials}
                  </div>
                )}
                {profile?.currentStreak > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-surface border border-line flex items-center justify-center shadow-xs">
                    <Flame className="w-3.5 h-3.5 text-accent fill-accent/20" />
                  </div>
                )}
              </div>

              {/* Name, Badges, Email */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text truncate">
                    {user?.name || 'DSA Coder'}
                  </h1>
                  {/* Rank badge */}
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border shrink-0 backdrop-blur-sm"
                    style={{
                      color: rank.color,
                      borderColor: `${rank.color}45`,
                      backgroundColor: `${rank.color}18`,
                    }}
                  >
                    {rank.Icon && <rank.Icon className="w-3.5 h-3.5" />}
                    <span>{rank.label}</span>
                  </span>
                  <Badge variant="online" size="sm">Active</Badge>
                </div>

                <p className="text-xs text-secondary truncate flex items-center gap-2">
                  <span>{user?.email}</span>
                  {memberSince && <span className="text-muted hidden sm:inline">· Member since {memberSince}</span>}
                </p>
              </div>
            </div>

            {/* Activity Highlights Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {profile?.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2/80 border border-line text-xs font-medium">
                  <Flame className="w-3.5 h-3.5 text-accent fill-accent/20" />
                  <span className="font-bold tabular-nums text-accent">{profile.currentStreak}d</span>
                  <span className="text-muted text-[11px]">streak</span>
                </div>
              )}
              {profile?.activeDays > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2/80 border border-line text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5 text-muted" />
                  <span className="font-bold tabular-nums text-text">{profile.activeDays}</span>
                  <span className="text-muted text-[11px]">active days</span>
                </div>
              )}
              {profile?.bestDay && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2/80 border border-line text-xs font-medium">
                  <Zap className="w-3.5 h-3.5 text-medium" />
                  <span className="font-bold tabular-nums text-text">{profile.bestDayCount}</span>
                  <span className="text-muted text-[11px]">best ({fmtDate(profile.bestDay)})</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2/80 border border-line text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-easy" />
                <span className="font-bold tabular-nums text-text">
                  {profile?.effectiveTotalSolved ?? profile?.totalSolved ?? 0}
                </span>
                <span className="text-muted text-[11px]">
                  solved {profile?.platformTotalSolved > 0 ? `(${profile.platformTotalSolved} platform)` : `/ ${profile?.totalProblems ?? 0}`}
                </span>
              </div>
            </div>

            {/* Rank Progress Bar (if not max rank) */}
            {rank.next && (
              <div className="mt-4 max-w-lg">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-secondary flex items-center gap-1.5 font-medium">
                    {rank.Icon && <rank.Icon className="w-3.5 h-3.5 text-accent" />}
                    <span className="text-text">{rank.label}</span>
                  </span>
                  <span className="text-accent font-semibold flex items-center gap-1">
                    <span className="tabular-nums">{Math.round(rank.progress)}%</span>
                    <span className="text-muted font-normal">to {rank.next.label}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-surface-2/80 border border-line/40 p-0.5">
                  <div
                    className="h-full rounded-full bar-animated bg-accent"
                    style={{
                      width: `${Math.min(rank.progress, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-muted mt-1 flex items-center justify-between">
                  <span className="tabular-nums">{profile?.totalSolved ?? 0} problems solved</span>
                  <span className="tabular-nums">Goal: {rank.next.min} solved</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions & Dual Progress Rings Telemetry Cockpit */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 border-line pt-4 lg:pt-0">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2 lg:order-1 flex-wrap">
              <button
                type="button"
                onClick={() => onTabChange('platforms')}
                className={`text-xs flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 rounded-xl font-medium transition-all cursor-pointer ${
                  activeTab === 'platforms'
                    ? 'btn-primary shadow-sm'
                    : 'btn-secondary text-text hover:border-accent/40'
                }`}
                title="Connect and manage LeetCode, Codeforces, GFG, CodeChef"
              >
                <Globe className="w-3.5 h-3.5 text-accent" />
                <span>Connect Platforms</span>
              </button>

              <button
                type="button"
                onClick={onOpenEditModal}
                className="btn-secondary text-xs flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 rounded-xl w-full sm:w-auto cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-muted" />
                <span>Account Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-4 sm:gap-6 bg-surface-2/60 backdrop-blur-xs p-4 rounded-2xl border border-line/80 w-full sm:w-auto order-2 sm:order-1 lg:order-2 shadow-inner">
              <div className="text-center flex flex-col items-center">
                <ProgressRing
                  value={solvedPct}
                  size={64}
                  stroke={5.5}
                  color={colors.easy}
                  label={<span className="text-xs font-bold tabular-nums text-easy">{solvedPct}%</span>}
                />
                <p className="text-[11px] text-secondary mt-1.5 font-medium">solved</p>
              </div>
              <div className="text-center flex flex-col items-center border-l sm:border-l-0 border-line pl-2 sm:pl-0">
                <ProgressRing
                  value={Math.min(100, Math.round(((profile?.longestStreak || 0) / 30) * 100))}
                  size={64}
                  stroke={5.5}
                  color={colors.accent}
                  label={<span className="text-xs font-bold tabular-nums text-accent">{profile?.longestStreak || 0}d</span>}
                />
                <p className="text-[11px] text-secondary mt-1.5 font-medium">best streak</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Reveal>
  );
};

export default ProfileHeader;
