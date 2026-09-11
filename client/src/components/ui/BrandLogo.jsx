import React from 'react';

const BrandLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 16, text: 'text-sm' },
    md: { box: 'w-8 h-8', icon: 18, text: 'text-base' },
    lg: { box: 'w-10 h-10', icon: 22, text: 'text-lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Radiant Glowing Emblem */}
      <div
        className={`relative ${currentSize.box} rounded-xl bg-gradient-to-br from-[#1E2330] to-[#0D1017] border border-orange-500/40 p-1 flex items-center justify-center shadow-[0_0_14px_rgba(249,115,22,0.2)] group-hover:shadow-[0_0_22px_rgba(249,115,22,0.4)] group-hover:border-orange-500/70 transition-all duration-300`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="brandLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <radialGradient id="brandLogoGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Glow Aura */}
          <circle cx="16" cy="16" r="8" fill="url(#brandLogoGlow)" />

          {/* Code Bracket Left < */}
          <path
            d="M10 10.5L5 16L10 21.5"
            stroke="url(#brandLogoGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Code Bracket Right > */}
          <path
            d="M22 10.5L27 16L22 21.5"
            stroke="url(#brandLogoGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Lightning Bolt / Fast Execution */}
          <path
            d="M18 8.5L13.5 15.5H17.5L14 23.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <span className={`font-extrabold tracking-tight text-white ${currentSize.text}`}>
          DSA<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Tracker</span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
