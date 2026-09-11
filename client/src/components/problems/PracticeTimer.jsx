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
    <div className="panel overflow-hidden border-white/[0.09] bg-[#101217] transition-all duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-[#0C0E13]">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
            isRunning
              ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
              : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse text-orange-400' : ''}`} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 tracking-tight">Practice Stopwatch & Timer</span>
            <span className="text-[10px] text-slate-500 ml-2 font-mono hidden sm:inline">
              {isRunning ? '• Session in progress' : '• Ready to practice'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex rounded-lg bg-[#151821] p-0.5 border border-white/[0.06] text-[11px] font-medium font-mono">
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setMode('stopwatch');
                setSeconds(0);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === 'stopwatch'
                  ? 'bg-orange-500 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
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
                  ? 'bg-orange-500 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Countdown
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
            title={isCollapsed ? 'Expand timer' : 'Collapse timer'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Timer Body */}
      {!isCollapsed && (
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Left: Clock Display & Presets */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className={`font-mono text-3xl sm:text-4xl font-black tracking-wider transition-colors ${
                isFinished
                  ? 'text-rose-400 animate-pulse'
                  : isRunning
                    ? 'text-orange-400'
                    : 'text-slate-200'
              }`}>
                {formatTime(seconds)}
              </span>

              {isFinished && (
                <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25">
                  TIME'S UP!
                </span>
              )}
            </div>

            {/* Presets if countdown */}
            {mode === 'countdown' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-1">Target:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.minutes}
                    type="button"
                    onClick={() => handleSelectPreset(p.minutes)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all ${
                      targetMinutes === p.minutes
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/35 font-semibold'
                        : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
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
              className={`px-4 h-10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.35)]'
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
              className="p-2.5 h-10 rounded-xl border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Log Attempt with prefilled time */}
            {seconds > 0 && (
              <button
                type="button"
                onClick={handleLogAttempt}
                className="px-3.5 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
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
