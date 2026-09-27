import React from 'react';

/**
 * AppBackground: Authentic LeetCode Dark Mode Canvas.
 *
 * Design Architecture:
 * - Pure LeetCode matte charcoal base (#1a1a1a).
 * - Subtle ambient LeetCode amber spotlight at the top horizon (#ffa116).
 * - Soft algorithmic teal whisper (#00b8a3) in the lower quadrant.
 * - Hardware accelerated, zero repaint cost on scroll.
 */
const AppBackground = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transform-gpu"
      style={{ transform: 'translate3d(0, 0, 0)' }}
      aria-hidden="true"
    >
      {/* 1. Authentic LeetCode Matte Charcoal Base */}
      <div className="absolute inset-0 bg-[#1a1a1a]" />

      {/* 2. LeetCode Signature Amber Atmospheric Crest */}
      <div
        className="absolute -top-[160px] left-1/2 -translate-x-1/2 w-[1000px] max-w-[120vw] h-[480px] rounded-full blur-[140px] opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 161, 22, 0.08) 0%, rgba(255, 161, 22, 0.02) 45%, transparent 70%)',
        }}
      />

      {/* 3. Subtle Algorithmic Teal Horizon Resonance */}
      <div
        className="absolute -bottom-[100px] -right-[80px] w-[500px] max-w-[90vw] h-[500px] rounded-full blur-[150px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 184, 163, 0.05) 0%, transparent 65%)',
        }}
      />

      {/* 4. Fine Clean Grid Texture (Developer Console Vibe) */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 15%, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 15%, black 40%, transparent 90%)',
        }}
      />

      {/* 5. Top Specular Border Glow Beam */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ffa116]/25 to-transparent pointer-events-none" />
    </div>
  );
};

export default React.memo(AppBackground);
