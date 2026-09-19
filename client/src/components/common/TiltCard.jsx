import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * 3D Magnetic Tilt Card driven by GSAP.
 * Gives rich tactile responsiveness with smooth deceleration and ambient sheen.
 */
export function TiltCard({
  children,
  className = '',
  maxTilt = 6,
  scale = 1.01,
  sheen = true,
  ...props
}) {
  const cardRef = useRef(null);
  const sheenRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cardRef.current) gsap.killTweensOf(cardRef.current);
      if (sheenRef.current) gsap.killTweensOf(sheenRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    const node = cardRef.current;
    if (!node) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    gsap.to(node, {
      rotateX,
      rotateY,
      scale,
      transformPerspective: 1000,
      ease: 'power1.out',
      duration: 0.3,
    });

    if (sheen && sheenRef.current) {
      const sheenX = (x / rect.width) * 100;
      const sheenY = (y / rect.height) * 100;
      gsap.to(sheenRef.current, {
        opacity: 0.15,
        background: `radial-gradient(circle 180px at ${sheenX}% ${sheenY}%, rgba(224, 122, 56, 0.4), transparent 80%)`,
        duration: 0.2,
      });
    }
  };

  const handleMouseLeave = () => {
    const node = cardRef.current;
    if (!node) return;

    gsap.to(node, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      ease: 'power2.out',
      duration: 0.5,
    });

    if (sheen && sheenRef.current) {
      gsap.to(sheenRef.current, {
        opacity: 0,
        duration: 0.4,
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform transform-gpu ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {sheen && (
        <div
          ref={sheenRef}
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 transition-opacity z-10"
        />
      )}
      {children}
    </div>
  );
}

export default TiltCard;
