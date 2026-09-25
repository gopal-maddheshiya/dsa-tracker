import React from 'react';

/**
 * BrandLogo: Refined, elegant DSA Tracker emblem.
 *
 * Clean geometric code brackets with central energy spark.
 * Balanced stroke weights (2.0 / 1.9) with generous breathing room
 * and refined rounded corners, avoiding harsh or gaudy visuals.
 */
const BrandLogo = ({ size = 'md', showText = true, className = '', textClassName = '' }) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-sm' },
    md: { box: 'w-8 h-8', text: 'text-sm' },
    lg: { box: 'w-9 h-9', text: 'text-base' },
    xl: { box: 'w-12 h-12', text: 'text-lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Refined Emblem Box */}
      <div
        className={`relative ${currentSize.box} rounded-lg bg-surface border border-line p-1.5 flex items-center justify-center transition-colors duration-150 shrink-0 shadow-xs`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          {/* Code Bracket Left < */}
          <path
            d="M9.5 9.5L4.5 16L9.5 22.5"
            stroke="var(--accent)"
            strokeWidth="2.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Lightning Bolt ⚡ */}
          <path
            d="M17.5 7.5L12.5 15.5H16.8L14.2 24.5"
            stroke="var(--text)"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Code Bracket Right > */}
          <path
            d="M22.5 9.5L27.5 16L22.5 22.5"
            stroke="var(--accent)"
            strokeWidth="2.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span className={`font-semibold tracking-tight text-text ${currentSize.text} ${textClassName}`}>
          DSA <span className="text-accent">Tracker</span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
