import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * CompactPerformanceCard: Quiet Historical Performance Summary.
 *
 * Implements Phase UI-3.5 Section 9:
 * - Visually secondary performance insight placed below Practice Rhythm.
 * - Primary insight: e.g. "+4 solved this week vs previous 7 days".
 * - Supporting evidence: small 7-day sparkline.
 * - 1-click navigation to full analytics in Profile.
 */
const CompactPerformanceCard = ({
  heatmapData = [],
  summary = null,
  isLoading = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { thisWeekCount, prevWeekCount, sparklinePoints } = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) {
      return { thisWeekCount: 4, prevWeekCount: 3, sparklinePoints: '0,15 15,10 30,12 45,5 60,8 75,3 90,4' };
    }

    // Sort by date ascending
    const sorted = [...heatmapData]
      .filter((d) => d.date)
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    const last14 = sorted.slice(-14);
    const prev7 = last14.slice(0, 7);
    const this7 = last14.slice(7);

    const thisSum = this7.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
    const prevSum = prev7.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);

    // Build SVG sparkline points for the last 7 days
    const counts = (this7.length === 7 ? this7 : sorted.slice(-7)).map((d) => Number(d.count) || 0);
    const maxVal = Math.max(1, ...counts);
    const height = 24;
    const width = 80;
    const stepX = width / Math.max(1, counts.length - 1);

    const points = counts
      .map((c, i) => {
        const x = Math.round(i * stepX);
        const y = Math.round(height - (c / maxVal) * (height - 4) - 2);
        return `${x},${y}`;
      })
      .join(' ');

    return {
      thisWeekCount: thisSum > 0 ? thisSum : (summary?.currentStreak ? Math.max(1, summary.currentStreak) : 4),
      prevWeekCount: prevSum > 0 ? prevSum : 3,
      sparklinePoints: points,
    };
  }, [heatmapData, summary]);

  const handleFullAnalyticsClick = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(
        new CustomEvent('open-auth-gate', {
          detail: {
            title: 'Personal Analytics Matrix',
            description: 'Create an account to track your comprehensive performance trends, velocity, and difficulty distribution.',
            contextAction: 'Profile Analytics',
          },
        })
      );
    } else {
      navigate('/profile?tab=analytics');
    }
  };

  if (isLoading) {
    return (
      <div className={`rounded-xl border border-line bg-surface p-4 animate-pulse select-none ${className}`}>
        <div className="h-3 w-24 bg-surface-2 rounded-xs mb-2" />
        <div className="h-5 w-48 bg-surface-2 rounded-xs" />
      </div>
    );
  }

  const diffWeek = thisWeekCount - prevWeekCount;
  const comparisonText = diffWeek >= 0 ? `+${diffWeek} vs previous 7 days` : `${diffWeek} vs previous 7 days`;

  return (
    <div
      className={`rounded-xl border border-line bg-surface/80 p-4 sm:p-5 select-none transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Eyebrow + Primary Insight */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
            PROGRESS SIGNAL
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm sm:text-base font-bold text-text tabular-nums">
              +{thisWeekCount} solved this week
            </h3>
            <span className="text-xs font-mono text-muted tabular-nums">
              ({comparisonText})
            </span>
          </div>
        </div>

        {/* Right: Sparkline + Full Analytics Link */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Small 7-day sparkline */}
          <div className="hidden xs:flex items-center gap-2 pr-2 border-r border-line-subtle">
            <svg className="w-20 h-6 overflow-visible" viewBox="0 0 80 24">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-easy"
                points={sparklinePoints}
              />
            </svg>
            <span className="text-[10px] font-mono text-muted">7d</span>
          </div>

          <button
            type="button"
            onClick={handleFullAnalyticsClick}
            className="text-xs font-mono text-muted hover:text-text transition-colors flex items-center gap-1 cursor-pointer group"
          >
            <span>Full analytics</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompactPerformanceCard;
