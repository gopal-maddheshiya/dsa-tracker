import React from 'react';

/**
 * LogoMark: The official signature DSA Tracker brand emblem.
 * Features code brackets < > with a central energy lightning bolt,
 * matching the user reference and title icon with ultra-clean precision.
 *
 * @param {{
 *   size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number,
 *   animated?: boolean,
 *   className?: string
 * }} props
 */
export default function LogoMark({ size = 'md', animated = false, className = '' }) {
  // Determine pixel size based on preset or numeric value
  let pixelSize = 34;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'xs':
        pixelSize = 22;
        break;
      case 'sm':
        pixelSize = 28;
        break;
      case 'md':
        pixelSize = 34;
        break;
      case 'lg':
        pixelSize = 44;
        break;
      case 'xl':
        pixelSize = 64;
        break;
      case '2xl':
        pixelSize = 84;
        break;
      default:
        pixelSize = 34;
    }
  }

  return (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={`relative shrink-0 flex items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Warm Amber/Orange Gradient for Squircle Border and Brackets */}
          <linearGradient id="dsaLogoAccentGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff8a3d" />
            <stop offset="50%" stopColor="#ed8641" />
            <stop offset="100%" stopColor="#d96720" />
          </linearGradient>

          {/* Core Ambient Backlight Glow for the Lightning Bolt */}
          <radialGradient id="dsaLogoCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ed8641" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#ed8641" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ed8641" stopOpacity="0" />
          </radialGradient>

          {/* Dark Glass Card Gradient */}
          <linearGradient id="dsaLogoBgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a1a1d" />
            <stop offset="100%" stopColor="#121214" />
          </linearGradient>

          {/* Lightning Filter Glow */}
          <filter id="lightningGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* 1. Squircle Card Container */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="25"
          fill="url(#dsaLogoBgGrad)"
        />
        {/* Border Stroke */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="25"
          stroke="url(#dsaLogoAccentGrad)"
          strokeWidth="5"
          strokeOpacity="0.9"
        />

        {/* 2. Ambient Core Backlight Glow */}
        <circle cx="50" cy="50" r="28" fill="url(#dsaLogoCoreGlow)" />

        {/* 3. Left Bracket < */}
        <path
          d="M33 30 L19 50 L33 70"
          stroke="url(#dsaLogoAccentGrad)"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-[pulse_2.2s_ease-in-out_infinite]' : ''}
        />

        {/* 4. Right Bracket > */}
        <path
          d="M67 30 L81 50 L67 70"
          stroke="url(#dsaLogoAccentGrad)"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-[pulse_2.2s_ease-in-out_infinite]' : ''}
        />

        {/* 5. Center Dynamic Lightning Bolt */}
        <path
          d="M54 23 L43 47 H53 L46 77"
          stroke="#FFFFFF"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lightningGlow)"
          className={animated ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''}
        />
      </svg>
    </div>
  );
}
