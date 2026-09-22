import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2, CheckCircle2, History, Flame,
  TrendingUp, Brain, Zap
} from 'lucide-react';
import Reveal from '../../common/Reveal';
import TiltCard from '../../common/TiltCard';
import AnimatedNumber from '../../ui/AnimatedNumber';
import TargetGoalsCard from '../TargetGoalsCard';
import { colors } from '../../../theme/colors';

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

const ProfileOverviewTab = ({ profile, memberSince }) => {
  const pace = profile?.activeDays > 0
    ? ((profile.totalSolved / profile.activeDays) * 7).toFixed(1)
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
    <div className="space-y-6 animate-fade-up">
      {/* KPI Grid */}
      <Reveal delay={40} y={15}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBlock
            label="Total Cataloged"
            value={profile?.totalProblems ?? 0}
            sub="problems"
            icon={FolderGit2}
            color={colors.muted}
            isNumber
          />
          <StatBlock
            label="Total Solved"
            value={profile?.totalSolved ?? 0}
            sub="unique problems"
            icon={CheckCircle2}
            color={colors.easy}
            isNumber
          />
          <StatBlock
            label="Sessions Logged"
            value={profile?.totalAttempts ?? 0}
            sub="total attempts"
            icon={History}
            color={colors.accent}
            isNumber
          />
          <StatBlock
            label="Current Streak"
            value={`${profile?.currentStreak ?? 0}d`}
            sub={`best: ${profile?.longestStreak ?? 0}d`}
            icon={Flame}
            color={colors.medium}
          />
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
              <span className={`text-xl font-semibold tabular-nums leading-none my-0.5 ${medHardPct >= 65 ? 'text-easy' : 'text-medium'}`}>
                {medHardPct}%
              </span>
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
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default ProfileOverviewTab;
