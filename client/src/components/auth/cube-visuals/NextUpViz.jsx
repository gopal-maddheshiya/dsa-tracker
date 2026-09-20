import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTicker } from './useTicker';
import { easy, medium, accent, line, text } from '../../../theme/colors';

const TABS = [
  {
    id: 'due',
    label: 'Due',
    problem: 'Course Schedule II',
    difficulty: 'Medium',
    diffColor: medium,
    tag: 'Graph · Topo Sort',
  },
  {
    id: 'weak',
    label: 'Weak',
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
    tag: 'Array · Hash Map',
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
    <div className="w-full h-full flex flex-col justify-between select-none py-1 min-h-0">
      {/* 1. 3 Cycling Queue Tabs */}
      <div className="relative grid grid-cols-3 w-full p-1 rounded-lg bg-surface-2/80 border border-line mb-1.5 shrink-0">
        {/* Sliding Highlight Pill */}
        <div
          className="absolute top-1 bottom-1 rounded-md bg-surface border border-line shadow-xs pointer-events-none"
          style={{
            width: 'calc((100% - 6px) / 3)',
            left: `calc(3px + ${activeTabIdx} * ((100% - 6px) / 3))`,
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
              className="relative z-10 flex items-center justify-center py-1 transition-colors duration-200"
            >
              <span
                className={`text-[12px] font-medium truncate px-1 ${
                  isTabActive ? 'text-text font-bold' : 'text-muted'
                }`}
              >
                {tab.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Active Problem Card */}
      <div className="flex-1 w-full rounded-lg border border-line bg-surface-2/40 p-2.5 flex flex-col justify-between overflow-hidden min-h-0">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <h4
              key={activeItem.problem}
              className="text-[12px] font-semibold text-text truncate tracking-tight animate-fade-in"
            >
              {activeItem.problem}
            </h4>
            <p className="text-[12px] font-mono text-text-secondary mt-0.5 truncate">
              {activeItem.tag}
            </p>
          </div>

          {/* Difficulty Badge */}
          <span
            className="text-[12px] font-mono px-2 py-0.5 rounded-full shrink-0 border"
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
        <div className="flex items-center justify-between pt-1.5 border-t border-line/50 text-[12px] font-mono">
          <span className="text-muted">Queue Item</span>
          <span className="flex items-center gap-1 font-semibold text-accent">
            <span>Solve & Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(NextUpViz);
