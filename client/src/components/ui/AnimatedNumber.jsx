import { useState, useEffect, useRef } from 'react';

/**
 * AnimatedNumber — animates from 0 to target value with easeOutExpo.
 * @param {number} value      — target number
 * @param {number} duration   — ms (default 800)
 * @param {string} suffix     — e.g. '%'
 * @param {string} className  — extra classes
 */
const AnimatedNumber = ({ value = 0, duration = 800, suffix = '', className = '' }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = typeof value === 'number' ? value : parseInt(value, 10) || 0;
    if (start === end) return;

    let startTime = null;
    let frame;

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(start + (end - start) * eased);

      setDisplay(current);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className={className}>{display}{suffix}</span>;
};

export default AnimatedNumber;
