import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { accent, hard, line, surface2, text, textSecondary, muted } from '../../../theme/colors';

const TOPICS = [
  { name: 'Arrays', ratio: 0.35 },
  { name: 'Graphs', ratio: 0.55 },
  { name: 'DP', ratio: 0.80, isWeakest: true },
  { name: 'Trees', ratio: 0.30 },
  { name: 'Strings', ratio: 0.45 },
  { name: 'Heaps', ratio: 0.60 },
];

const R = 34;
const CX = 100;
const CY = 48;
const RINGS = [0.33, 0.66, 1.0];

// Compute ring path points
const getRingPoints = (radiusFrac) => {
  return TOPICS.map((_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const x = CX + Math.cos(angle) * R * radiusFrac;
    const y = CY + Math.sin(angle) * R * radiusFrac;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
};

// Compute polygon data points
const DATA_POINTS = TOPICS.map((t, i) => {
  const angle = (i * 60 - 90) * (Math.PI / 180);
  const x = CX + Math.cos(angle) * R * t.ratio;
  const y = CY + Math.sin(angle) * R * t.ratio;
  return { x, y, str: `${x.toFixed(1)},${y.toFixed(1)}`, isWeakest: t.isWeakest };
});

const POLYGON_POINTS_STR = DATA_POINTS.map((p) => p.str).join(' ');

const TopicRadarViz = ({ active, reducedMotion }) => {
  const [isGrown, setIsGrown] = useState(reducedMotion);

  useEffect(() => {
    if (!active) {
      setIsGrown(false);
      return;
    }

    if (reducedMotion) {
      setIsGrown(true);
      return;
    }

    setIsGrown(false);
    const frame = requestAnimationFrame(() => {
      setIsGrown(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [active, reducedMotion]);

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between border-b border-line pb-1 sm:pb-1.5 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 sm:gap-1.5 text-accent whitespace-nowrap shrink-0">
          <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-medium" />
          TOPIC MATRIX
        </span>
        <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary border border-line whitespace-nowrap shrink-0">
          RADAR SCAN
        </span>
      </div>

      {/* 2. Main Visualization Area (>= 60% of face) */}
      <div className="flex-1 flex flex-col justify-center py-0.5 min-h-0">
        <svg
          viewBox="0 0 200 96"
          className="w-full h-auto max-h-[96px] overflow-visible"
          aria-hidden="true"
        >
          {/* 3 Concentric Grid Rings */}
          {RINGS.map((ringFrac, idx) => (
            <polygon
              key={idx}
              points={getRingPoints(ringFrac)}
              fill="none"
              stroke={line}
              strokeWidth={idx === 2 ? 0.9 : 0.6}
              strokeDasharray={idx < 2 ? '2 2' : 'none'}
            />
          ))}

          {/* 6 Axis Spoke Lines */}
          {TOPICS.map((_, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const x2 = CX + Math.cos(angle) * R;
            const y2 = CY + Math.sin(angle) * R;
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={x2}
                y2={y2}
                stroke={line}
                strokeWidth={0.7}
              />
            );
          })}

          {/* Growing Data Polygon & Dots (700ms ease-out) */}
          <g
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: isGrown ? 'scale(1)' : 'scale(0)',
              transition: reducedMotion ? 'none' : 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Polygon fill & stroke */}
            <polygon
              points={POLYGON_POINTS_STR}
              fill="rgba(255, 161, 22, 0.22)"
              stroke={accent}
              strokeWidth={1.5}
            />

            {/* Vertex Dots */}
            {DATA_POINTS.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={pt.isWeakest ? 3.8 : 2.5}
                fill={pt.isWeakest ? hard : accent}
                stroke={surface2}
                strokeWidth={1}
              />
            ))}
          </g>

          {/* Axis Labels positioned safely outside the chart perimeter */}
          {TOPICS.map((t, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const labelDist = R + 11;
            const lx = CX + Math.cos(angle) * labelDist;
            const ly = CY + Math.sin(angle) * labelDist;

            // Compute anchor
            let anchor = 'middle';
            let dy = 3.5;
            if (i === 0) { anchor = 'middle'; dy = -1; }
            else if (i === 1) { anchor = 'start'; dy = 0; }
            else if (i === 2) { anchor = 'start'; dy = 5; }
            else if (i === 3) { anchor = 'middle'; dy = 8; }
            else if (i === 4) { anchor = 'end'; dy = 5; }
            else if (i === 5) { anchor = 'end'; dy = 0; }

            return (
              <text
                key={t.name}
                x={lx}
                y={ly + dy}
                textAnchor={anchor}
                fill={t.isWeakest ? hard : textSecondary}
                fontSize={8}
                fontFamily="sans-serif"
                fontWeight={t.isWeakest ? 'bold' : 'normal'}
              >
                {t.name}
                {t.isWeakest && (
                  <tspan fill={hard} fontSize={7} fontWeight="bold">
                    {' '}(Focus)
                  </tspan>
                )}
              </text>
            );
          })}
        </svg>
      </div>

      {/* 3. One-line Caption */}
      <p className="text-[10px] text-text-secondary text-center truncate pt-1 border-t border-line/60">
        Ranked by struggle ratio · sample
      </p>

      {/* 4. Small Verdict / Status Chip at Bottom */}
      <div className="mt-1 flex items-center justify-center">
        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-hard/12 text-hard border border-hard/25 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-hard" />
          Weakest: DP
        </span>
      </div>
    </div>
  );
};

export default React.memo(TopicRadarViz);
