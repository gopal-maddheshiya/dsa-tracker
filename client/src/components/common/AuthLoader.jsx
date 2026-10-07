import React, { useState, useEffect } from 'react';

/**
 * 3D Isometric Blue/Amber Cube Logo Mark for the loader
 */
function LoaderLogoCube() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Ambient Pulsing Glow Bloom */}
      <div className="absolute w-24 h-24 rounded-3xl bg-accent/25 blur-xl animate-pulse-glow" />

      {/* Orbital Rotating Dashed Accent Ring */}
      <div className="absolute w-20 h-20 rounded-2xl border border-dashed border-accent/35 animate-spin-slow pointer-events-none" />

      {/* Floating 3D Isometric Cube Container */}
      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ed8641] to-[#d96720] flex items-center justify-center shadow-[0_0_28px_rgba(237,134,65,0.45)] border border-white/25 animate-float-emblem">
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            fill="#ed8641"
            fillOpacity="0.45"
          />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#ffffff" />
          <line x1="12" y1="22.08" x2="12" y2="12" stroke="#ffffff" />
        </svg>
      </div>
    </div>
  );
}

/**
 * AuthLoader: Premium, animated workspace loader.
 * Features an orbital 3D emblem, glowing travelling progress beam,
 * and elegant status micro-copy (no robotic 'Verifying session...' text).
 */
export default function AuthLoader({ message }) {
  // Gracefully filter out/replace robotic "Verifying session..." with clean, polished text
  const cleanMessage =
    !message || message.toLowerCase().includes('verifying')
      ? 'Preparing your workspace...'
      : message;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Subtle rotating micro-copy if loading takes longer
  const loadingHints = [
    cleanMessage,
    'Syncing algorithms & progress...',
    'Calibrating revision schedule...',
    'Entering DSA cockpit...',
  ];

  useEffect(() => {
    // Only cycle text if default cleanMessage is used
    if (!message || message.toLowerCase().includes('verifying')) {
      const interval = setInterval(() => {
        setCurrentTextIndex((prev) => (prev + 1) % loadingHints.length);
      }, 2400);
      return () => clearInterval(interval);
    }
  }, [message]);

  const displayMessage =
    !message || message.toLowerCase().includes('verifying')
      ? loadingHints[currentTextIndex]
      : cleanMessage;

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Ambient Radial Glows */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-accent/10 blur-[100px] pointer-events-none -translate-y-8 animate-pulse-glow" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#5ebdbc]/5 blur-[80px] pointer-events-none translate-y-36" />

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Animated 3D Isometric Emblem */}
        <LoaderLogoCube />

        {/* Brand Name */}
        <div className="flex flex-col items-center gap-1 mt-1 text-center">
          <span className="font-bold text-base sm:text-lg tracking-tight text-text">
            DSA Tracker
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono text-muted uppercase tracking-widest">
            Interview Prep & Mastery
          </span>
        </div>

        {/* Sleek Travelling Progress Beam */}
        <div className="w-44 sm:w-52 h-1 rounded-full bg-surface-2 overflow-hidden border border-line/60 relative mt-1">
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full animate-loading-beam" />
        </div>

        {/* Status Indicator & Elegant Micro-Copy */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface/80 border border-line/60 backdrop-blur-md shadow-xs transition-all duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-xs font-medium text-text-secondary transition-all">
            {displayMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
