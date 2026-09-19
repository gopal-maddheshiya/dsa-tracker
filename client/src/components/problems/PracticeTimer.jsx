import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Zap, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '25m (Pomodoro)', minutes: 25 },
  { label: '45m (Interview)', minutes: 45 },
  { label: '60m', minutes: 60 },
];

const PracticeTimer = ({ onLogWithTime }) => {
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' | 'countdown'
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0); // For stopwatch: elapsed. For countdown: remaining.
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [totalElapsed, setTotalElapsed] = useState(0); // Cumulative practice time in seconds
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef(null);

  // Initialize countdown seconds on targetMinutes change
  useEffect(() => {
    if (mode === 'countdown' && !isRunning) {
      setSeconds(targetMinutes * 60);
      setIsFinished(false);
    }
  }, [mode, targetMinutes, isRunning]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTotalElapsed((prev) => prev + 1);

        if (mode === 'stopwatch') {
          setSeconds((prev) => prev + 1);
        } else {
          setSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsRunning(false);
              setIsFinished(true);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  const handleTogglePlay = () => {
    if (isFinished && mode === 'countdown') {
      setSeconds(targetMinutes * 60);
      setIsFinished(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    if (mode === 'stopwatch') {
      setSeconds(0);
      setTotalElapsed(0);
    } else {
      setSeconds(targetMinutes * 60);
    }
  };

  const handleSelectPreset = (m) => {
    setMode('countdown');
    setIsRunning(false);
    setIsFinished(false);
    setTargetMinutes(m);
    setSeconds(m * 60);
  };

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate elapsed minutes for logging
  const elapsedMinutes = Math.max(1, Math.round((mode === 'countdown' ? (targetMinutes * 60 - seconds) : seconds) / 60));

  const handleLogAttempt = () => {
    setIsRunning(false);
    onLogWithTime?.(elapsedMinutes);
  };

  return (
    <div className="panel overflow-hidden border-line bg-surface rounded-xl transition-all duration-200">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-5 py-3.5 border-b border-line bg-surface-2/40 gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
            isRunning
              ? 'bg-accent/15 border-accent/30 text-accent'
              : 'bg-surface-2 border-line text-muted'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse text-accent' : ''}`} />
          </div>
          <div>
            <span className="text-xs font-semibold text-text tracking-tight">Practice Stopwatch & Timer</span>
            <span className="text-xs text-muted ml-2 hidden sm:inline">
              {isRunning ? '• Session in progress' : '• Ready to practice'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex rounded-lg bg-surface-2 p-0.5 border border-line text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setMode('stopwatch');
                setSeconds(0);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === 'stopwatch'
                  ? 'bg-surface text-text font-semibold border border-line shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              Stopwatch
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setMode('countdown');
                setSeconds(targetMinutes * 60);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === 'countdown'
                  ? 'bg-surface text-text font-semibold border border-line shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              Countdown
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors"
            title={isCollapsed ? 'Expand timer' : 'Collapse timer'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Timer Body */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          {/* Left: Clock Display & Presets */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className={`font-mono text-3xl sm:text-4xl font-bold tracking-wider transition-colors ${
                isFinished
                  ? 'text-danger animate-pulse'
                  : isRunning
                    ? 'text-accent'
                    : 'text-text'
              }`}>
                {formatTime(seconds)}
              </span>

              {isFinished && (
                <span className="text-xs font-bold text-danger px-2 py-0.5 rounded-md bg-danger/12 border border-danger/25">
                  TIME'S UP!
                </span>
              )}
            </div>

            {mode === 'countdown' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-muted uppercase tracking-wider mr-1">Target:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() => handleSelectPreset(p.minutes)}
                    className={`px-2 py-0.5 rounded-md text-xs transition-all ${
                      targetMinutes === p.minutes
                        ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                        : 'bg-surface-2 text-muted hover:text-text border border-line'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Controls & Log CTA */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-4 h-10 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isRunning
                  ? 'bg-accent text-bg hover:bg-accent-hover'
                  : 'btn-primary'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{seconds > 0 && mode === 'stopwatch' ? 'Resume' : 'Start Timer'}</span>
                </>
              )}
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              disabled={seconds === 0 && !isFinished}
              className="p-2.5 h-10 rounded-lg border border-line hover:border-line bg-surface-2 text-muted hover:text-text transition-colors disabled:opacity-30 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Log Attempt with prefilled time */}
            {seconds > 0 && (
              <button
                type="button"
                onClick={handleLogAttempt}
                className="px-3.5 h-10 rounded-lg bg-success/12 hover:bg-success/20 border border-success/30 text-success text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Log ({elapsedMinutes}m)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeTimer;
