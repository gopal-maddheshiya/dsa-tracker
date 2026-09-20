import React, { useState, useEffect } from 'react';
import { accent, hard, line, surface2, textSecondary } from '../../../theme/colors';

const TOPICS = [
  { name: 'Arrays', ratio: 0.35 },
  { name: 'Graphs', ratio: 0.55 },
  { name: 'DP (Focus)', ratio: 0.82, isWeakest: true },
  { name: 'Trees', ratio: 0.30 },
  { name: 'Strings', ratio: 0.45 },
  { name: 'Heaps', ratio: 0.60 },
];

const R = 46;
const CX = 105;
const CY = 78;
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
    <div className="w-full h-full flex flex-col items-center justify-center select-none py-1 min-h-0">
      <svg
        viewBox="0 0 210 160"
        className="w-full h-full max-h-[160px] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* 3 Concentric Grid Rings */}
        {RINGS.map((ringFrac, idx) => (
          <polygon
            key={idx}
            points={getRingPoints(ringFrac)}
            fill="none"
            stroke={line}
            strokeWidth={idx === 2 ? 1 : 0.7}
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
              strokeWidth={0.8}
            />
          );
        })}

        {/* Growing Data Polygon & Dots */}
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: isGrown ? 'scale(1)' : 'scale(0)',
            transition: reducedMotion ? 'none' : 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <polygon
            points={POLYGON_POINTS_STR}
            fill="rgba(255, 161, 22, 0.22)"
            stroke={accent}
            strokeWidth={1.8}
          />

          {DATA_POINTS.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={pt.isWeakest ? 4.2 : 3}
              fill={pt.isWeakest ? hard : accent}
              stroke={surface2}
              strokeWidth={1.2}
            />
          ))}
        </g>

        {/* Axis Labels positioned safely outside the chart perimeter (10px SVG font) */}
        {TOPICS.map((t, i) => {
          const angle = (i * 60 - 90) * (Math.PI / 180);
          const labelDist = R + 14;
          const lx = CX + Math.cos(angle) * labelDist;
          const ly = CY + Math.sin(angle) * labelDist;

          let anchor = 'middle';
          let dy = 3.5;
          if (i === 0) { anchor = 'middle'; dy = -3; }
          else if (i === 1) { anchor = 'start'; dy = 1; }
          else if (i === 2) { anchor = 'start'; dy = 6; }
          else if (i === 3) { anchor = 'middle'; dy = 10; }
          else if (i === 4) { anchor = 'end'; dy = 6; }
          else if (i === 5) { anchor = 'end'; dy = 1; }

          return (
            <text
              key={t.name}
              x={lx}
              y={ly + dy}
              textAnchor={anchor}
              fill={t.isWeakest ? hard : textSecondary}
              fontSize={10}
              fontFamily="sans-serif"
              fontWeight={t.isWeakest ? 'bold' : 'normal'}
            >
              {t.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default React.memo(TopicRadarViz);
