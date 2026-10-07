import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * LogoMark: Signature official DSA Tracker brand emblem.
 * Faithful implementation of the < ⚡ > code brackets & lightning bolt emblem
 * matching the user's reference (media_1791353662067.png).
 *
 * Architecture & Resiliency:
 * - Hybrid CSS + SVG architecture: Outer gradient squircle rim and ambient glow
 *   are rendered with CSS gradients and border-radius.
 * - ZERO fragile SVG url(#id) references: Completely eliminates WebKit / mobile Safari /
 *   Chrome Android SVG ID resolution failures inside <Link> (<a>) tags.
 * - 100% visible on every phone, tablet, desktop, and WebView.
 * - Theme-harmonized: Rich dark obsidian squircle with radiant ember rim that provides
 *   maximum contrast and authoritative developer credibility across both Dark and Light themes.
 *
 * @param {{
 *   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number,
 *   animated?: boolean,
 *   theme?: 'dark' | 'light' | 'auto',
 *   className?: string
 * }} props
 */
export default function LogoMark({
  size = 'md',
  animated = false,
  theme: explicitTheme,
  className = '',
}) {
  // Theme context detection with safe fallback
  let activeTheme = 'dark';
  try {
    const themeContext = useTheme();
    if (themeContext?.theme) {
      activeTheme = themeContext.theme;
    }
  } catch {
    activeTheme = 'dark';
  }

  const effectiveTheme = explicitTheme && explicitTheme !== 'auto' ? explicitTheme : activeTheme;
  const isLight = effectiveTheme === 'light';

  // Sizing normalization
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
        pixelSize = 60;
        break;
      case '2xl':
        pixelSize = 80;
        break;
      default:
        pixelSize = 34;
    }
  }

  // Proportional layout tokens
  // Border thickness: ~5.5% of total size, minimum 1.2px
  const borderWidth = Math.max(1.2, Math.round(pixelSize * 0.055 * 10) / 10);
  // Outer squircle corner radius: ~28% of size
  const outerRadius = Math.round(pixelSize * 0.28);
  const innerRadius = Math.max(1, outerRadius - borderWidth);

  // Gradient rim tuned for dark vs light background contrast
  const rimGradient = isLight
    ? 'linear-gradient(135deg, #fb923c 0%, #ea580c 55%, #c2410c 100%)'
    : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 55%, #9a3412 100%)';

  // Drop shadow tuned for theme
  const boxDropShadow = isLight
    ? '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(234, 88, 12, 0.2)'
    : '0 4px 14px rgba(234, 88, 12, 0.28), 0 0 1px rgba(0, 0, 0, 0.6)';

  return (
    <div
      style={{
        width: pixelSize,
        height: pixelSize,
        padding: borderWidth,
        borderRadius: outerRadius,
        background: rimGradient,
        boxShadow: boxDropShadow,
      }}
      className={`relative shrink-0 inline-flex items-center justify-center select-none ${className}`}
      title="DSA Tracker"
    >
      {/* Deep Obsidian Inner Badge Canvas */}
      <div
        style={{
          borderRadius: innerRadius,
          background: '#121316',
        }}
        className="w-full h-full relative flex items-center justify-center overflow-hidden"
      >
        {/* Core Ambient Backlight Halo Glow */}
        <div
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.65) 0%, rgba(234, 88, 12, 0.2) 55%, transparent 75%)',
          }}
          className={`absolute w-3/4 h-3/4 rounded-full pointer-events-none ${
            animated ? 'animate-[pulse_1.8s_ease-in-out_infinite]' : ''
          }`}
        />

        {/* Pure Vector Brand Mark (< ⚡ >) */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Left Bracket < */}
          <path
            d="M 10.5 10.5 L 5.5 16 L 10.5 21.5"
            stroke="#f97316"
            strokeWidth="2.35"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? 'animate-[pulse_2.2s_ease-in-out_infinite]' : ''}
          />

          {/* Right Bracket > */}
          <path
            d="M 21.5 10.5 L 26.5 16 L 21.5 21.5"
            stroke="#f97316"
            strokeWidth="2.35"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? 'animate-[pulse_2.2s_ease-in-out_infinite]' : ''}
          />

          {/* Dynamic Center Lightning Bolt ⚡ */}
          <path
            d="M 18.2 8.8 L 13.4 15.4 H 18.2 L 13.8 23.2"
            stroke="#FFFFFF"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? 'animate-[pulse_1.4s_ease-in-out_infinite]' : ''}
          />
        </svg>
      </div>
    </div>
  );
}
