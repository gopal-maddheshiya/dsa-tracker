import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

// Register ScrollTrigger globally once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Global smooth scroll provider powered by Lenis and synchronized with GSAP ScrollTrigger.
 * Matches the performance and configuration of the portfolio's SmoothScrollProvider.
 */
export function SmoothScrollProvider({ children }) {
  useEffect(() => {
    // Respect user's accessibility reduced motion preference
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    window.__lenis = lenis;

    // Sync Lenis scroll events with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis directly from GSAP ticker for 60/120fps sync
    const tickerUpdate = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    // Re-measure all ScrollTrigger start/end positions once Lenis is active
    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

    const onContentUpdated = () => ScrollTrigger.refresh();
    window.addEventListener('app:content-updated', onContentUpdated);

    return () => {
      cancelAnimationFrame(refreshId);
      window.removeEventListener('app:content-updated', onContentUpdated);
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}

/**
 * Programmatic smooth scrolling helper using active Lenis instance.
 */
export const scrollToTop = (immediate = false) => {
  if (typeof window !== 'undefined') {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate });
    } else {
      window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
    }
  }
};

export default SmoothScrollProvider;
