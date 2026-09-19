import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * AnimatedNumber — animates from start to target value using GSAP power2.out easing.
 * @param {number} value      — target number
 * @param {number} duration   — duration in ms or seconds (default 0.9s / 900ms)
 * @param {string} suffix     — e.g. '%'
 * @param {string} className  — extra classes
 */
const AnimatedNumber = ({ value = 0, duration = 900, suffix = '', className = '' }) => {
  const [display, setDisplay] = useState(0);
  const counterRef = useRef({ val: 0 });
  const end = typeof value === 'number' ? value : parseInt(value, 10) || 0;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(end);
      counterRef.current.val = end;
      return;
    }

    const dur = duration > 10 ? duration / 1000 : duration;

    const tween = gsap.to(counterRef.current, {
      val: end,
      duration: dur,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplay(Math.round(counterRef.current.val));
      },
    });

    return () => tween.kill();
  }, [end, duration]);

  return <span className={className}>{display}{suffix}</span>;
};

export default AnimatedNumber;
