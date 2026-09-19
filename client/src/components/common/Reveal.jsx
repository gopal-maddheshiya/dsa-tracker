import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Premium scroll reveal driven by GSAP ScrollTrigger for a silky,
 * Lenis-synced fade-up with a subtle blur settle.
 * Matches portfolio's Reveal component.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  duration = 0.7,
  y = 22,
  as: Tag = 'div',
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const tween = gsap.fromTo(
      node,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        ease: 'power3.out',
        delay: delay / 1000,
        clearProps: 'all',
        scrollTrigger: {
          trigger: node,
          start: 'top 92%',
          once: true,
        },
      }
    );

    return () => {
      if (tween.scrollTrigger) {
        tween.scrollTrigger.kill();
      }
      tween.kill();
    };
  }, [delay, duration, y]);

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}

export default Reveal;
