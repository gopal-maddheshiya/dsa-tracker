import React from 'react';

/**
 * AppBackground: World-Class Linear/Raycast-Inspired Obsidian Matrix Canvas.
 *
 * Architecture & Performance:
 * - Rendered at `fixed inset-0 pointer-events-none -z-10` with `aria-hidden="true"`.
 * - Zero repaint cost on scroll via CSS hardware acceleration (`transform: translate3d(0,0,0)`).
 * - Multi-layered atmospheric lighting:
 *   1. Deep Obsidian Base (#0b0d11).
 *   2. Top Specular Amber Spotlight (LeetCode iconic warm glow).
 *   3. Algorithmic Teal Resonance (Cool lower-right balance).
 *   4. Subtle Indigo Whisper (Chromatic depth).
 *   5. Mathematically Vignetted Precision 28px Dot Matrix.
 */
const AppBackground = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transform-gpu"
      style={{ transform: 'translate3d(0, 0, 0)' }}
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian Base Gradient */}
      <div className="absolute inset-0 bg-[#0b0d11]" />

      {/* 2. Top Specular Amber Spotlight (LeetCode Accent Glow) */}
      <div
        className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[1000px] max-w-[120vw] h-[520px] rounded-full blur-[140px] opacity-75 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 161, 22, 0.13) 0%, rgba(255, 161, 22, 0.04) 45%, transparent 75%)',
        }}
      />

      {/* 3. Cool Algorithmic Teal Resonance (Bottom-Right) */}
      <div
        className="absolute -bottom-[120px] -right-[80px] w-[650px] max-w-[100vw] h-[650px] rounded-full blur-[160px] opacity-35 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 184, 163, 0.12) 0%, rgba(0, 184, 163, 0.025) 50%, transparent 75%)',
        }}
      />

      {/* 4. Center-Left Indigo Whisper (Deep Space Chromatic Balance) */}
      <div
        className="absolute top-[32%] -left-[160px] w-[500px] h-[500px] rounded-full blur-[160px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.10) 0%, transparent 70%)',
        }}
      />

      {/* 5. Vignetted Precision Dot-Matrix Grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-80" />

      {/* 6. Subtle Ambient Specular Horizon Beam (Subtle Light Crest) */}
      <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-accent/[0.035] via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default React.memo(AppBackground);
