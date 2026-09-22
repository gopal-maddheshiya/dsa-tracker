import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { PLATFORM_CONFIG } from '../theme/platforms';

export const getUrgencyPresentation = (score) => {
  const s = Number(score) || 0;
  if (s >= 4.0) {
    return {
      label: 'Critical Overdue',
      dot: 'bg-danger',
      text: 'text-danger',
      subtle: 'text-danger/70',
      tooltip: `Urgency Score: ${s.toFixed(2)} (High priority recall)`,
    };
  }
  if (s >= 2.5) {
    return {
      label: 'Recall Due',
      dot: 'bg-medium',
      text: 'text-medium',
      subtle: 'text-medium/70',
      tooltip: `Urgency Score: ${s.toFixed(2)} (Scheduled recall)`,
    };
  }
  return {
    label: 'Upcoming',
    dot: 'bg-success/80',
    text: 'text-success/80',
    subtle: 'text-success/60',
    tooltip: `Urgency Score: ${s.toFixed(2)} (Recent practice on schedule)`,
  };
};

const DIFFICULTY_DOTS = {
  easy:   { dot: 'bg-easy',   text: 'text-easy',   label: 'Easy' },
  medium: { dot: 'bg-medium', text: 'text-medium', label: 'Med' },
  hard:   { dot: 'bg-hard',   text: 'text-hard',   label: 'Hard' },
};

const formatDaysAgo = (days) => {
  if (days == null) return 'Never';
  if (days < 0.5) return 'Today';
  const rounded = Math.round(days);
  if (rounded === 1) return 'Yesterday';
  return `${rounded}d ago`;
};

/**
 * RevisionMobileCard: Touch-optimized, scannable revision card for mobile viewports (<768px).
 * Eliminates horizontal table scrolling while exposing all critical actions and telemetry.
 */
const RevisionMobileCard = ({ item, index = 0, onOpenLog, onQuickLog, startIndex = 0 }) => {
  const platformCfg = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.other;
  const diffCfg = DIFFICULTY_DOTS[item.difficulty] || { dot: 'bg-muted', text: 'text-muted', label: item.difficulty };
  const urgency = getUrgencyPresentation(item.priorityScore);
  const rankStr = String(startIndex + index + 1).padStart(2, '0');
  const daysFormatted = formatDaysAgo(item.daysSinceLastAttempt);

  const statusLabel =
    item.latestStatus === 'struggled' ? 'Struggled' :
    item.latestStatus === 'revisit_needed' ? 'Revisit Needed' :
    item.latestStatus === 'solved' ? 'Solved' : 'Review';

  return (
    <div className="p-3.5 bg-surface border border-line hover:border-line/80 rounded-xl space-y-2.5 transition-colors">
      {/* 1. Title & External Link */}
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/problems/${item.problemId}`}
          className="text-sm font-semibold text-text hover:text-accent active:text-accent transition-colors line-clamp-2 leading-snug flex-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
        >
          {item.title}
        </Link>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 -mr-1 -mt-1 flex items-center justify-center rounded-lg text-muted hover:text-accent active:bg-surface-2 transition-colors shrink-0"
            title="Open external problem link"
            aria-label={`Open ${item.title} on ${platformCfg.label}`}
          >
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>
        )}
      </div>

      {/* 2. Compact Metadata Row: Rank · Platform · Difficulty · Topics */}
      <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
        <span className="font-mono text-[11px] text-muted tabular-nums">
          #{rankStr}
        </span>
        <span className="text-line/60">·</span>
        <span
          className={`font-mono text-[11px] font-semibold ${platformCfg.text}`}
          title={platformCfg.label}
        >
          {platformCfg.short}
        </span>
        <span className="text-line/60">·</span>
        <span className="inline-flex items-center gap-1 font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
          <span className={diffCfg.text}>{diffCfg.label}</span>
        </span>
        {item.topics?.length > 0 && (
          <>
            <span className="text-line/60">·</span>
            <span className="font-mono text-[10px] text-text-secondary truncate max-w-[130px]">
              #{item.topics[0]}
              {item.topics.length > 1 ? ` +${item.topics.length - 1}` : ''}
            </span>
          </>
        )}
      </div>

      {/* 3. Urgency & Recall Schedule Strip */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-line/50 text-xs">
        {/* Semantic Urgency Indicator + Tooltip Score */}
        <div
          className="flex items-center gap-1.5 cursor-help"
          title={urgency.tooltip}
        >
          <span className={`w-2 h-2 rounded-full ${urgency.dot}`} />
          <span className={`font-semibold ${urgency.text}`}>
            {urgency.label}
          </span>
          <span className="text-[10px] font-mono text-muted tabular-nums">
            ({item.priorityScore.toFixed(2)})
          </span>
        </div>

        {/* Timing & Schedule Context */}
        <div className="text-right text-[11px] text-muted tabular-nums">
          <span className="text-text font-medium">{daysFormatted}</span>
          <span className="text-muted ml-1">· {statusLabel}</span>
        </div>
      </div>

      {/* 4. Action Bar with Comfortable Touch Targets (Min 40-44px) */}
      <div className="flex items-center gap-2 pt-2 border-t border-line/50">
        {/* 1-Tap Quick Mark Solved */}
        <button
          type="button"
          onClick={() => onQuickLog(item, 'solved')}
          className="min-h-[42px] px-3 rounded-lg text-xs font-semibold text-success bg-surface-2 hover:bg-success/15 border border-line hover:border-success/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-success"
          title="Quick 1-Tap: Mark Solved"
          aria-label={`Mark ${item.title} as solved`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Solved</span>
        </button>

        {/* Log Recall Attempt */}
        <button
          type="button"
          onClick={() => onOpenLog(item)}
          className="min-h-[42px] flex-1 px-3 rounded-lg text-xs font-semibold text-success bg-success/12 hover:bg-success/20 border border-success/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-success"
          title="Log recall attempt details"
          aria-label={`Log recall attempt for ${item.title}`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Recall</span>
        </button>

        {/* Problem Cockpit Link */}
        <Link
          to={`/problems/${item.problemId}`}
          className="min-h-[42px] px-3 rounded-lg text-xs font-semibold text-text-secondary hover:text-text bg-surface-2 hover:bg-surface border border-line active:scale-[0.98] transition-all flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          title="Open problem cockpit details"
          aria-label={`Open details for ${item.title}`}
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5 text-muted" />
        </Link>
      </div>
    </div>
  );
};

export default RevisionMobileCard;
