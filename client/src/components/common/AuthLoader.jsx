import React from 'react';
import LogoMark from './LogoMark';

/**
 * AuthLoader: Ultra-clean, premium brand loader.
 * Eliminates all visual clutter (no dashed rings, no heavy progress tracks).
 * Focuses entirely on the radiant < ⚡ > signature emblem with a subtle ambient glow.
 */
export default function AuthLoader() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Subtle Warm Radial Bloom behind the emblem */}
      <div className="absolute w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none animate-[pulse_3s_ease-in-out_infinite]" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Animated Signature < ⚡ > Emblem */}
        <div className="transition-transform duration-500 hover:scale-105">
          <LogoMark size={72} animated={true} />
        </div>

        {/* Minimal, Crisp Brand Name */}
        <span className="font-bold text-sm tracking-wide text-text/90 mt-1">
          DSA Tracker
        </span>
      </div>
    </div>
  );
}
