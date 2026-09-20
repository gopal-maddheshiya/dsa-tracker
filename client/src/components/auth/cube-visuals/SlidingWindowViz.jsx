import React from 'react';
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

  // Geometry: 10 cells in SVG viewBox 0 0 200 90
  const cellW = 17;
  const gap = 2.5;
  const startX = 3.75;
  const cellY = 24;
  const cellH = 28;

  const currentWindowX = startX + windowStart * (cellW + gap);
  const windowWidth = K * cellW + (K - 1) * gap;
  const bestWindowX = startX + bestWindowIndex * (cellW + gap);

  return (
    <div className="w-full h-full flex flex-col justify-between select-none py-1 min-h-0">
      {/* 1. Dynamic Calculation Stats (12px HTML) */}
      <div className="flex items-center justify-between px-1 mb-1 text-[12px] font-mono whitespace-nowrap shrink-0">
        <div className="flex items-center gap-1.5 text-text-secondary shrink-0">
          <span>Window Sum:</span>
          <span className="font-bold text-accent px-1.5 py-0.5 rounded bg-surface-2 border border-line">
            {currentSum}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-text-secondary shrink-0">
          <span>Best:</span>
          <span className="font-bold text-easy px-1.5 py-0.5 rounded bg-easy/15 border border-easy/30">
            {bestSoFar}
          </span>
        </div>
      </div>

      {/* 2. Scalable SVG Visualization Area */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0">
        <svg
          viewBox="0 0 200 90"
          className="w-full h-full max-h-[110px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* Best Window Tint Background */}
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

          {/* Active Moving Window Highlight */}
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
                {/* Index above cell (10px SVG label) */}
                <text
                  x={x + cellW / 2}
                  y={cellY - 5}
                  textAnchor="middle"
                  fill={muted}
                  fontSize={10}
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

                {/* Cell Value (12px monospace) */}
                <text
                  x={x + cellW / 2}
                  y={cellY + cellH / 2 + 4}
                  textAnchor="middle"
                  fill={inWindow ? accent : text}
                  fontSize={12}
                  fontWeight={inWindow ? 'bold' : 'normal'}
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* L and R Pointer Markers under the window edges (10px bold) */}
          <g className="transition-all duration-300 ease-out">
            <text
              x={startX + windowStart * (cellW + gap) + cellW / 2}
              y={cellY + cellH + 16}
              textAnchor="middle"
              fill={accent}
              fontSize={10}
              fontWeight="bold"
              fontFamily="monospace"
            >
              ▲ L
            </text>
            <text
              x={startX + (windowStart + K - 1) * (cellW + gap) + cellW / 2}
              y={cellY + cellH + 16}
              textAnchor="middle"
              fill={accent}
              fontSize={10}
              fontWeight="bold"
              fontFamily="monospace"
            >
              ▲ R
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default React.memo(SlidingWindowViz);
