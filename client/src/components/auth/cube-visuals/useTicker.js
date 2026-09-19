import { useState, useEffect } from 'react';

/**
 * Shared hook for interval-based visualization loops.
 * 
 * Guarantees:
 * 1. Only runs timers when `active` is true.
 * 2. Starts from frame 0 whenever `active` becomes true.
 * 3. Immediately cleans up all intervals/timeouts on unmount or when `active` becomes false.
 * 4. In `reducedMotion` mode, returns the final static frame without scheduling any timers.
 */
export function useTicker({ active, intervalMs, totalSteps, pauseAtEndMs = 0, reducedMotion = false }) {
  const [step, setStep] = useState(reducedMotion ? totalSteps - 1 : 0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }

    if (reducedMotion) {
      setStep(totalSteps - 1);
      return;
    }

    setStep(0);
    let currentStep = 0;
    let intervalId = null;
    let timeoutId = null;

    const clearAll = () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const runInterval = () => {
      intervalId = setInterval(() => {
        currentStep++;
        if (currentStep >= totalSteps) {
          clearInterval(intervalId);
          intervalId = null;
          if (pauseAtEndMs > 0) {
            timeoutId = setTimeout(() => {
              currentStep = 0;
              setStep(0);
              runInterval();
            }, pauseAtEndMs);
          } else {
            currentStep = 0;
            setStep(0);
            runInterval();
          }
        } else {
          setStep(currentStep);
        }
      }, intervalMs);
    };

    runInterval();

    return () => clearAll();
  }, [active, intervalMs, totalSteps, pauseAtEndMs, reducedMotion]);

  return step;
}

export default useTicker;
