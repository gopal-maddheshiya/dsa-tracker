import React from 'react';
import { ListOrdered, ArrowRight } from 'lucide-react';
import { useTicker } from './useTicker';
import { easy, medium, accent, surface2, line, text, textSecondary, muted } from '../../../theme/colors';

const TABS = [
  {
    id: 'due',
    label: 'Due',
    problem: 'Course Schedule II',
    difficulty: 'Medium',
    diffColor: medium,
    tag: 'Graph · Topo',
  },
  {
    id: 'weak',
    label: 'Weak spot',
    problem: 'Coin Change',
    difficulty: 'Medium',
    diffColor: medium,
    tag: 'DP · Knapsack',
  },
  {
    id: 'fresh',
    label: 'Fresh',
    problem: 'Two Sum',
    difficulty: 'Easy',
    diffColor: easy,
    tag: 'Array · Hash',
  },
];

const NextUpViz = ({ active, reducedMotion }) => {
  const activeTabIdx = useTicker({
    active,
    intervalMs: 1600,
    totalSteps: TABS.length,
    reducedMotion,
  });

  const activeItem = TABS[activeTabIdx] || TABS[0];

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between border-b border-line pb-1 sm:pb-1.5 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 sm:gap-1.5 text-accent whitespace-nowrap shrink-0">
          <ListOrdered className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-accent" />
          QUEUE · ADAPTIVE
        </span>
        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary border border-line whitespace-nowrap shrink-0">
          NEXT UP
        </span>
      </div>

      {/* 2. Main Visualization Area (>= 60% of face) */}
      <div className="flex-1 flex flex-col justify-center py-1 min-h-0">
        {/* 3 Cycling Tabs */}
        <div className="relative w-full p-0.5 rounded-lg bg-surface-2/70 border border-line flex items-center mb-2">
          {/* Sliding Highlight Pill */}
          <div
            className="absolute top-0.5 bottom-0.5 rounded-md bg-surface border border-line shadow-xs"
            style={{
              width: 'calc((100% - 4px) / 3)',
              left: `calc(2px + ${activeTabIdx} * ((100% - 4px) / 3))`,
              transition: reducedMotion
                ? 'none'
                : 'left 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />

          {TABS.map((tab, idx) => {
            const isTabActive = activeTabIdx === idx;
            return (
              <div
                key={tab.id}
                className={`relative z-10 flex-1 text-center py-1 text-[10px] sm:text-[11px] font-medium transition-colors duration-200 truncate ${
                  isTabActive ? 'text-text font-semibold' : 'text-muted'
                }`}
              >
                {tab.label}
              </div>
            );
          })}
        </div>

        {/* Active Problem Row with Cross-Fade */}
        <div className="relative w-full min-h-[58px] rounded-lg border border-line/80 bg-surface-2/30 p-2 flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <h4
                key={activeItem.problem}
                className="text-[11px] sm:text-xs font-semibold text-text truncate tracking-tight animate-fade-in"
              >
                {activeItem.problem}
              </h4>
              <p className="text-[9px] sm:text-[10px] font-mono text-text-secondary mt-0.5 truncate">
                {activeItem.tag}
              </p>
            </div>

            {/* Difficulty Badge */}
            <span
              className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 border"
              style={{
                color: activeItem.diffColor,
                backgroundColor: `${activeItem.diffColor}18`,
                borderColor: `${activeItem.diffColor}35`,
              }}
            >
              {activeItem.difficulty}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-line/40 text-[9px] sm:text-[10px]">
            <span className="text-muted font-mono">Priority Solve</span>
            <span className="flex items-center gap-1 font-semibold text-accent font-mono">
              <span>Solve & Log</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. One-line Caption */}
      <p className="text-[10px] text-text-secondary text-center truncate pt-1 border-t border-line/60">
        Adaptive practice queue · sample
      </p>

      {/* 4. Small Verdict / Status Chip at Bottom */}
      <div className="mt-1 flex items-center justify-center">
        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-accent/12 text-accent border border-accent/25 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Next up
        </span>
      </div>
    </div>
  );
};

export default React.memo(NextUpViz);
