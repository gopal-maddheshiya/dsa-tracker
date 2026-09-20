import React, { useState, useEffect } from 'react';
import { easy, medium, hard, surface2, text, muted } from '../../../theme/colors';

const TOTAL_COUNT = 35;
const EASY_COUNT = 11;
const MEDIUM_COUNT = 17;
const HARD_COUNT = 7;

// SVG Donut Geometry
const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~226.195

const EASY_LEN = (EASY_COUNT / TOTAL_COUNT) * CIRCUMFERENCE;
const MEDIUM_LEN = (MEDIUM_COUNT / TOTAL_COUNT) * CIRCUMFERENCE;
const HARD_LEN = (HARD_COUNT / TOTAL_COUNT) * CIRCUMFERENCE;

const DifficultySplitViz = ({ active, reducedMotion }) => {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (active) {
      setAnimKey((prev) => prev + 1);
    }
  }, [active]);

  const easyAngle = -90;
  const mediumAngle = -90 + (EASY_COUNT / TOTAL_COUNT) * 360;
  const hardAngle = -90 + ((EASY_COUNT + MEDIUM_COUNT) / TOTAL_COUNT) * 360;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between select-none py-1 min-h-0">
      {/* 1. Main Donut Graphic */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0">
        <svg
          key={animKey}
          viewBox="0 0 160 110"
          className="w-full h-full max-h-[120px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* Base Background Track Circle */}
          <circle
            cx="80"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke={surface2}
            strokeWidth="10"
          />

          {/* Easy Arc */}
          <circle
            cx="80"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke={easy}
            strokeWidth="10"
            strokeLinecap="round"
            transform={`rotate(${easyAngle} 80 55)`}
            style={{
              strokeDasharray: reducedMotion
                ? `${EASY_LEN} ${CIRCUMFERENCE - EASY_LEN}`
                : active
                ? undefined
                : `0 ${CIRCUMFERENCE}`,
            }}
            className={active && !reducedMotion ? 'arc-easy-anim' : ''}
          />

          {/* Medium Arc */}
          <circle
            cx="80"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke={medium}
            strokeWidth="10"
            strokeLinecap="round"
            transform={`rotate(${mediumAngle} 80 55)`}
            style={{
              strokeDasharray: reducedMotion
                ? `${MEDIUM_LEN} ${CIRCUMFERENCE - MEDIUM_LEN}`
                : active
                ? undefined
                : `0 ${CIRCUMFERENCE}`,
            }}
            className={active && !reducedMotion ? 'arc-medium-anim' : ''}
          />

          {/* Hard Arc */}
          <circle
            cx="80"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke={hard}
            strokeWidth="10"
            strokeLinecap="round"
            transform={`rotate(${hardAngle} 80 55)`}
            style={{
              strokeDasharray: reducedMotion
                ? `${HARD_LEN} ${CIRCUMFERENCE - HARD_LEN}`
                : active
                ? undefined
                : `0 ${CIRCUMFERENCE}`,
            }}
            className={active && !reducedMotion ? 'arc-hard-anim' : ''}
          />

          {/* Center Total Count (20px monospace) */}
          <text
            x="80"
            y="52"
            textAnchor="middle"
            fill={text}
            fontSize="20"
            fontWeight="bold"
            fontFamily="monospace"
            className="tabular-nums"
          >
            {TOTAL_COUNT}
          </text>
          {/* Label (10px SVG internal) */}
          <text
            x="80"
            y="66"
            textAnchor="middle"
            fill={muted}
            fontSize="10"
            fontWeight="600"
            letterSpacing="0.08em"
          >
            SOLVED
          </text>
        </svg>
      </div>

      {/* 2. Legend Row (HTML text 12px) */}
      <div className="w-full flex items-center justify-around px-2 pt-1 border-t border-line/50 text-[12px] font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: easy }} />
          <span className="text-text-secondary">Easy</span>
          <span className="font-bold text-text tabular-nums">{EASY_COUNT}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: medium }} />
          <span className="text-text-secondary">Med</span>
          <span className="font-bold text-text tabular-nums">{MEDIUM_COUNT}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: hard }} />
          <span className="text-text-secondary">Hard</span>
          <span className="font-bold text-text tabular-nums">{HARD_COUNT}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DifficultySplitViz);
