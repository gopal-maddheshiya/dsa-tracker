import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';

const SmoothScrollContext = createContext(null);

/**
 * SmoothScrollProvider
 * Global Lenis smooth scroll engine unified with GSAP's animation ticker.
 * Provides 60fps momentum scrolling on wheel & touch, zero jank,
 * and automatic scroll reset on route changes.
 */
export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Only run on client with window
    if (typeof window === 'undefined') return;

    // Respect reduced motion user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.6,
      autoRaf: false, // Unified with GSAP RAF ticker
    });

    lenisRef.current = lenis;

    // Direct binding of Lenis to GSAP ticker for synchronized 60/120Hz rendering
    const onTick = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smooth scroll reset to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <SmoothScrollContext.Provider value={lenisRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

export default SmoothScrollProvider;
