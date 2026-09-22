import React, { useMemo } from 'react';
import { Layers, BarChart3, TrendingUp } from 'lucide-react';
import Reveal from '../../common/Reveal';
import Badge from '../../ui/Badge';
import YearlyHeatmap from '../YearlyHeatmap';
import { colors } from '../../../theme/colors';

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

      const label = weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      result.push({ label, count, startStr, endStr });
    }
    return result;
  }, [heatmapData]);

  const maxCount = Math.max(1, ...weeks.map(w => w.count));

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

const ProfileActivityTab = ({ profile, heatmap = [] }) => {
  return (
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
          <YearlyHeatmap
            heatmapData={heatmap}
            currentStreak={profile?.currentStreak ?? 0}
            longestStreak={profile?.longestStreak ?? 0}
          />
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
  );
};

export default ProfileActivityTab;
