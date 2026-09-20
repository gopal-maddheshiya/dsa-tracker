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

const DifficultySplitViz = ({ active, settled, reducedMotion }) => {
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
    <div className="w-full h-full flex flex-col items-center justify-between select-none py-1 min-h-0" style={{ transformStyle: 'preserve-3d' }}>
      {/* 1. Main Donut Graphic with Floating Center 3D Badge */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 relative" style={{ transformStyle: 'preserve-3d' }}>
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
        </svg>

        {/* Center 3D Floating Pill Badge */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: settled && !reducedMotion ? 'translateZ(44px)' : 'translateZ(0px)',
            transformStyle: 'preserve-3d',
            transition: 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            className="w-14 h-14 rounded-full bg-surface border border-line flex flex-col items-center justify-center"
            style={{
              boxShadow: settled && !reducedMotion ? '0 16px 24px -2px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
              transition: 'box-shadow 350ms ease-out',
            }}
          >
            <span className="text-[17px] font-bold font-mono text-text leading-tight tabular-nums">35</span>
            <span className="text-[8.5px] font-bold text-muted tracking-wider uppercase">SOLVED</span>
          </div>
        </div>
      </div>

      {/* 2. Legend Row (HTML text 12px) - Elevated 3D */}
      <div
        className="w-full flex items-center justify-around px-2 pt-1 border-t border-line/50 text-[12px] font-mono shrink-0"
        style={{
          transform: settled && !reducedMotion ? 'translateZ(26px)' : 'translateZ(0px)',
          transformStyle: 'preserve-3d',
          transition: 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
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
