import React from 'react';

const BrandLogo = ({ size = 'md', showText = true, className = '', textClassName = '' }) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', icon: 18, text: 'text-sm' },
    md: { box: 'w-9 h-9', icon: 20, text: 'text-base' },
    lg: { box: 'w-10 h-10', icon: 22, text: 'text-lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Clean Emblem */}
      <div
        className={`relative ${currentSize.box} rounded-xl bg-surface-2 border border-line/80 p-1.5 flex items-center justify-center transition-all duration-150 group-hover:border-accent group-hover:shadow-[0_0_10px_rgba(255,161,22,0.2)] shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
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

          {/* Central Lightning Bolt / Fast Execution */}
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
        <span className={`font-bold tracking-tight text-text ${currentSize.text} ${textClassName}`}>
          DSA<span className="text-accent">Tracker</span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
