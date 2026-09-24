import React from 'react';

const BrandLogo = ({ size = 'md', showText = true, className = '', textClassName = '' }) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 16, text: 'text-sm' },
    md: { box: 'w-8 h-8', icon: 18, text: 'text-sm' },
    lg: { box: 'w-9 h-9', icon: 20, text: 'text-base' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Clean Emblem */}
      <div
        className={`relative ${currentSize.box} rounded-md bg-surface-2 border border-line p-1.5 flex items-center justify-center transition-colors duration-150 shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Code Bracket Left < */}
          <path
            d="M10 10.5L5 16L10 21.5"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Code Bracket Right > */}
          <path
            d="M22 10.5L27 16L22 21.5"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Lightning Bolt */}
          <path
            d="M18 8.5L13.5 15.5H17.5L14 23.5"
            stroke="var(--text)"
            strokeWidth="2.2"
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

