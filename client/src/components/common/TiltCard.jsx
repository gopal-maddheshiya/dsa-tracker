import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * 3D Subtle Tilt Card driven by GSAP without glows or gradients.
 */
export function TiltCard({
  children,
  className = '',
  maxTilt = 3,
  scale = 1.005,
  ...props
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cardRef.current) gsap.killTweensOf(cardRef.current);
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
      {children}
    </div>
  );
}

export default TiltCard;
