import React, { useRef } from 'react';

/**
 * SpotlightCard: GPU-accelerated cursor-following radial illumination.
 * Zero React re-renders on pointer move (updates CSS custom properties directly on DOM node).
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(237, 134, 65, 0.12)',
  borderColor = 'rgba(237, 134, 65, 0.35)',
  radius = 350,
  ...props
}) {
  const cardRef = useRef(null);

  const handlePointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`spotlight-card group relative overflow-hidden ${className}`}
      {...props}
    >
      {/* 1. Surface Spotlight Glow */}
      <div
        className="spotlight-overlay pointer-events-none absolute inset-0 -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(${radius}px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), ${spotlightColor}, transparent 70%)`,
        }}
      />
      {/* 2. Border Specular Sheen Glow */}
      <div
        className="spotlight-border pointer-events-none absolute inset-0 rounded-[inherit] -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `inset 0 0 0 1px transparent`,
          background: `radial-gradient(${radius * 0.75}px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), ${borderColor}, transparent 65%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />
      {/* 3. Card Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
