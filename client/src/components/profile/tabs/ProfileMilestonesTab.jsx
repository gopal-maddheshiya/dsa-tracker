import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket, Sprout, Flame, Zap, Award, Crown, Brain, Gem,
  Calendar, Target, PartyPopper, CheckCircle2, Lock
} from 'lucide-react';
import Reveal from '../../common/Reveal';
import TiltCard from '../../common/TiltCard';
import { colors } from '../../../theme/colors';

/* ── Milestone Config with Theme Colors ───────────────────────────── */
export const MILESTONE_CONFIG = {
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

export const MilestoneBadgeIcon = ({ id, size = 22, className = '' }) => {
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
export const ALL_MILESTONES = [
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

const ProfileMilestonesTab = ({ profile, onSelectMilestone }) => {
  const [milestoneFilter, setMilestoneFilter] = useState('all'); // 'all' | 'earned'

  return (
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
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
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
                className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
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
                          onClick={() => onSelectMilestone?.({ ...m, iconComponent: conf.Icon, ...conf })}
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
  );
};

export default ProfileMilestonesTab;
