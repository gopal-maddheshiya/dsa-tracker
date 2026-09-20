import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTicker } from './useTicker';
import { accent, easy, line, surface2, text, muted } from '../../../theme/colors';

const ARRAY = [2, 1, 5, 1, 3, 2, 7, 4, 2, 6];
const K = 3;

// Precompute algorithm results dynamically
const WINDOW_STEPS = (() => {
  const steps = [];
  let currentMax = -Infinity;
  let bestIdx = 0;

  for (let i = 0; i <= ARRAY.length - K; i++) {
    const sum = ARRAY[i] + ARRAY[i + 1] + ARRAY[i + 2];
    if (sum > currentMax) {
      currentMax = sum;
      bestIdx = i;
    }
    steps.push({
      index: i,
      sum,
      bestSoFar: currentMax,
      bestWindowIndex: bestIdx,
    });
  }
  return steps;
})();

const SlidingWindowViz = ({ active, reducedMotion }) => {
  const stepIndex = useTicker({
    active,
    intervalMs: 900,
    totalSteps: WINDOW_STEPS.length,
    pauseAtEndMs: 1200,
    reducedMotion,
  });

  const currentStep = WINDOW_STEPS[stepIndex] || WINDOW_STEPS[0];
  const { index: windowStart, sum: currentSum, bestSoFar, bestWindowIndex } = currentStep;

  // Geometry: 10 cells in SVG viewBox 0 0 200 95
  // cell width: 17px, gap: 2.5px. Total = 10 * 17 + 9 * 2.5 = 192.5px. Offset = 3.75px.
  const cellW = 17;
  const gap = 2.5;
  const startX = 3.75;
  const cellY = 22;
  const cellH = 26;

  const currentWindowX = startX + windowStart * (cellW + gap);
  const windowWidth = K * cellW + (K - 1) * gap;

  const bestWindowX = startX + bestWindowIndex * (cellW + gap);

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between border-b border-line pb-1 sm:pb-1.5 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 sm:gap-1.5 text-accent whitespace-nowrap shrink-0">
          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-easy" />
          SOLVES · K={K}
        </span>
        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary border border-line whitespace-nowrap shrink-0">
          SLIDING WINDOW
        </span>
      </div>

      {/* 2. Main Visualization Area (>= 60% of face) */}
      <div className="flex-1 flex flex-col justify-center py-1 min-h-0">
        {/* Dynamic Calculation Stats */}
        <div className="flex items-center justify-between px-1 mb-1 text-[10px] sm:text-[11px] font-mono whitespace-nowrap">
          <div className="flex items-center gap-1 text-text-secondary shrink-0">
            <span>Sum:</span>
            <span className="font-bold text-accent px-1 rounded bg-surface-2 border border-line">
              {currentSum}
            </span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary shrink-0">
            <span>Best:</span>
            <span className="font-bold text-easy px-1 rounded bg-easy/15 border border-easy/30">
              {bestSoFar}
            </span>
          </div>
        </div>

        {/* Scalable SVG Visualization */}
        <div className="w-full flex items-center justify-center">
          <svg
            viewBox="0 0 200 78"
            className="w-full h-auto max-h-[88px] overflow-visible"
            aria-hidden="true"
          >
            {/* Best Window Tint Background (tinted with easy) */}
            <rect
              x={bestWindowX - 1}
              y={cellY - 1}
              width={windowWidth + 2}
              height={cellH + 2}
              rx={5}
              fill="rgba(0, 184, 163, 0.12)"
              stroke={easy}
              strokeWidth={1}
              strokeDasharray="3 2"
              className="transition-all duration-300 ease-out"
            />

            {/* Active Moving Window Highlight (tinted with accent) */}
            <rect
              x={currentWindowX}
              y={cellY}
              width={windowWidth}
              height={cellH}
              rx={4}
              fill="rgba(255, 161, 22, 0.18)"
              stroke={accent}
              strokeWidth={1.5}
              className="transition-all duration-300 ease-out"
            />

            {/* 10 Array Cells */}
            {ARRAY.map((val, idx) => {
              const x = startX + idx * (cellW + gap);
              const inWindow = idx >= windowStart && idx < windowStart + K;
              const inBest = idx >= bestWindowIndex && idx < bestWindowIndex + K;

              return (
                <g key={idx}>
                  {/* Small Index above cell */}
                  <text
                    x={x + cellW / 2}
                    y={cellY - 4}
                    textAnchor="middle"
                    fill={muted}
                    fontSize={8}
                    fontFamily="monospace"
                  >
                    {idx}
                  </text>

                  {/* Cell Box */}
                  <rect
                    x={x}
                    y={cellY}
                    width={cellW}
                    height={cellH}
                    rx={3}
                    fill={inWindow ? 'rgba(255, 161, 22, 0.1)' : surface2}
                    stroke={inWindow ? accent : inBest ? easy : line}
                    strokeWidth={inWindow ? 1.2 : 0.8}
                    className="transition-colors duration-200"
                  />

                  {/* Cell Value */}
                  <text
                    x={x + cellW / 2}
                    y={cellY + cellH / 2 + 3.5}
                    textAnchor="middle"
                    fill={inWindow ? accent : text}
                    fontSize={11}
                    fontWeight={inWindow ? 'bold' : 'normal'}
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* L and R Pointer Markers under the window edges */}
            <g className="transition-all duration-300 ease-out">
              {/* L Pointer */}
              <text
                x={startX + windowStart * (cellW + gap) + cellW / 2}
                y={cellY + cellH + 14}
                textAnchor="middle"
                fill={accent}
                fontSize={9}
                fontWeight="bold"
                fontFamily="monospace"
              >
                ▲ L
              </text>

              {/* R Pointer */}
              <text
                x={startX + (windowStart + K - 1) * (cellW + gap) + cellW / 2}
                y={cellY + cellH + 14}
                textAnchor="middle"
                fill={accent}
                fontSize={9}
                fontWeight="bold"
                fontFamily="monospace"
              >
                ▲ R
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* 3. One-line Caption */}
      <p className="text-[10px] text-text-secondary text-center truncate pt-1 border-t border-line/60">
        Sliding Window · sample
      </p>

      {/* 4. Small Verdict / Status Chip at Bottom */}
      <div className="mt-1 flex items-center justify-center">
        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-easy/12 text-easy border border-easy/25 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-easy" />
          Accepted · sample
        </span>
      </div>
    </div>
  );
};

export default React.memo(SlidingWindowViz);
