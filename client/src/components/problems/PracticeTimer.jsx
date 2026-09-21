import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Play, Pause, RotateCcw, Clock, Zap, CheckCircle2,
  ChevronDown, ChevronUp, Maximize2, Minimize2, Sparkles, ShieldAlert
} from 'lucide-react';

const PRESETS = [
  { label: '15m Speed', minutes: 15, desc: 'Easy speed run' },
  { label: '25m Standard', minutes: 25, desc: 'LeetCode Medium' },
  { label: '45m Mock Interview', minutes: 45, desc: 'FAANG screen' },
  { label: '60m Deep Dive', minutes: 60, desc: 'Hard / Contest' },
];

const PracticeTimer = ({ onLogWithTime, problemTitle = '' }) => {
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' | 'countdown'
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0); // Elapsed in stopwatch; Remaining in countdown
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  const timerRef = useRef(null);

  // Initialize countdown seconds on targetMinutes change
  useEffect(() => {
    if (mode === 'countdown' && !isRunning) {
      setSeconds(targetMinutes * 60);
      setIsFinished(false);
    }
  }, [mode, targetMinutes, isRunning]);

  // Timer Tick Interval
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

  // Global Keyboard Shortcuts: Space (Play/Pause), R (Reset), Esc (Exit Zen Mode)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleTogglePlay = () => {
    if (isFinished && mode === 'countdown') {
      setSeconds(targetMinutes * 60);
      setIsFinished(false);
    }
    setIsRunning((prev) => !prev);
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
    setIsZenMode(false);
    onLogWithTime?.(elapsedMinutes);
  };

  // Progress percentage for radial display
  const progressPct = mode === 'countdown'
    ? Math.max(0, Math.min(100, Math.round((1 - seconds / (targetMinutes * 60)) * 100)))
    : Math.min(100, Math.round((seconds % 3600) / 36));

  const ZenOverlay = isZenMode ? (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-md flex flex-col justify-between p-6 sm:p-10 animate-fade-in text-text">
      {/* Zen Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-muted font-bold block">Interview Zen Mode</span>
            <h2 className="text-base font-bold text-text truncate max-w-md">{problemTitle || 'Live Practice'}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="btn-secondary h-9 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize2 className="w-4 h-4 text-muted" />
            <span>Exit Zen</span>
          </button>
        </div>
      </div>

      {/* Zen Center Timer Display */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6">
        <div className="relative flex items-center justify-center">
          <svg className="w-64 h-64 sm:w-80 sm:h-80 -rotate-90 transform">
            <circle
              cx="50%" cy="50%" r="42%"
              fill="none" stroke="currentColor" strokeWidth="8"
              className="text-surface-2"
            />
            <circle
              cx="50%" cy="50%" r="42%"
              fill="none" stroke="currentColor" strokeWidth="8"
              strokeDasharray="264"
              strokeDashoffset={264 - (264 * progressPct) / 100}
              strokeLinecap="round"
              className={`transition-all duration-500 ${isFinished ? 'text-danger' : 'text-accent'}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`font-mono text-5xl sm:text-7xl font-black tracking-tight tabular-nums ${
              isFinished ? 'text-danger animate-pulse' : isRunning ? 'text-accent' : 'text-text'
            }`}>
              {formatTime(seconds)}
            </span>
            <span className="text-xs font-semibold text-muted uppercase tracking-widest mt-2">
              {mode === 'countdown' ? `${targetMinutes}m Interview Target` : 'Elapsed Practice Time'}
            </span>
          </div>
        </div>

        {/* Big Controls in Zen */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`h-14 px-8 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isRunning
                ? 'bg-surface-2 border border-line text-text hover:bg-surface-3'
                : 'btn-primary'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{seconds > 0 && mode === 'stopwatch' ? 'Resume Session' : 'Start Solving'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="h-14 w-14 rounded-2xl bg-surface-2 border border-line text-muted hover:text-text hover:bg-surface-3 transition-colors flex items-center justify-center cursor-pointer"
            title="Reset (R)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {seconds > 0 && (
            <button
              type="button"
              onClick={handleLogAttempt}
              className="h-14 px-6 rounded-2xl bg-success/15 border border-success/30 text-success text-sm font-bold flex items-center gap-2 hover:bg-success/25 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Log Attempt ({elapsedMinutes}m)</span>
            </button>
          )}
        </div>
      </div>

      {/* Zen Footer */}
      <div className="flex items-center justify-between text-xs text-muted border-t border-line/60 pt-4">
        <span>Keyboard Shortcuts: <kbd className="px-2 py-0.5 rounded bg-surface-2 font-mono text-[11px] text-text">Space</kbd> Start/Pause · <kbd className="px-2 py-0.5 rounded bg-surface-2 font-mono text-[11px] text-text">R</kbd> Reset · <kbd className="px-2 py-0.5 rounded bg-surface-2 font-mono text-[11px] text-text">Esc</kbd> Exit</span>
        <span>DSA Practice Cockpit</span>
      </div>
    </div>
  ) : null;

  return (
    <div className={`overflow-hidden border border-line bg-surface rounded-2xl transition-all duration-300 shadow-sm ${
      isRunning ? 'border-accent/50 shadow-[0_0_24px_rgba(255,161,22,0.12)]' : ''
    }`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 border-b border-line bg-surface-2/30 gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
            isRunning
              ? 'bg-accent/20 border-accent/40 text-accent ring-2 ring-accent/20'
              : 'bg-surface-2 border-line text-muted'
          }`}>
            <Clock className={`w-4 h-4 ${isRunning ? 'animate-pulse text-accent' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text tracking-tight uppercase">Practice Stopwatch & Interview Timer</span>
              {isRunning && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-accent animate-pulse">
                  Session Active
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted block">
              {isRunning ? 'Timing your solve in real-time' : 'Time yourself to build speed for coding screens'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex rounded-xl bg-surface-2 p-1 border border-line text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setMode('stopwatch');
                setSeconds(0);
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                mode === 'stopwatch'
                  ? 'bg-surface text-text font-bold border border-line shadow-xs'
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
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                mode === 'countdown'
                  ? 'bg-surface text-text font-bold border border-line shadow-xs'
                  : 'text-muted hover:text-text'
              }`}
            >
              Countdown
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsZenMode(true)}
            className="p-2 rounded-xl text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer border border-line"
            title="Open Fullscreen Zen Focus Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer border border-line"
            title={isCollapsed ? 'Expand timer' : 'Collapse timer'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Timer Body */}
      {!isCollapsed && (
        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Clock Display & Presets */}
          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className={`font-mono text-4xl sm:text-5xl font-black tracking-wider transition-colors select-none ${
                isFinished
                  ? 'text-danger animate-pulse'
                  : isRunning
                    ? 'text-accent'
                    : 'text-text'
              }`}>
                {formatTime(seconds)}
              </span>

              {isFinished && (
                <span className="text-xs font-bold text-danger px-2.5 py-1 rounded-lg bg-danger/15 border border-danger/30 flex items-center gap-1.5 animate-bounce">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Time is up! Log your session</span>
                </span>
              )}

              <span className="text-xs font-mono text-muted hidden sm:inline">
                {mode === 'countdown' ? `Target: ${targetMinutes}m` : `Elapsed: ${elapsedMinutes}m`}
              </span>
            </div>

            {mode === 'countdown' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted uppercase tracking-wider font-semibold mr-1">Interview Presets:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() => handleSelectPreset(p.minutes)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      targetMinutes === p.minutes
                        ? 'bg-accent/20 text-accent border border-accent/40 font-bold shadow-xs'
                        : 'bg-surface-2 text-secondary hover:text-text border border-line hover:border-accent/30'
                    }`}
                    title={p.desc}
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Controls & Log CTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`h-11 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                isRunning
                  ? 'bg-accent text-bg hover:brightness-110 shadow-accent/20'
                  : 'btn-primary'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{seconds > 0 && mode === 'stopwatch' ? 'Resume Timer' : 'Start Timer'}</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              disabled={seconds === 0 && !isFinished}
              className="p-3 h-11 rounded-xl border border-line hover:border-line/90 bg-surface-2 text-muted hover:text-text transition-colors disabled:opacity-30 cursor-pointer"
              title="Reset Timer (Press R)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Log Attempt with prefilled time */}
            {seconds > 0 && (
              <button
                type="button"
                onClick={handleLogAttempt}
                className="h-11 px-4 rounded-xl bg-success/15 hover:bg-success/25 border border-success/35 text-success text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Log Attempt ({elapsedMinutes}m)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {typeof document !== 'undefined' && isZenMode && createPortal(ZenOverlay, document.body)}
    </div>
  );
};

export default PracticeTimer;
