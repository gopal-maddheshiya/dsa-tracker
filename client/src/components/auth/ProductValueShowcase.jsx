import React, { useState, useEffect } from 'react';
import { BarChart3, Crosshair, Calendar, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ProductValueShowcase: Cinematic Hero Section matching the reference artwork.
 * Positions the headline and the 4 feature pills directly above the photorealistic
 * laptop and workspace desk from the background.
 */
export default function ProductValueShowcase() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Subtle Typewriter Cycling Words for "into Progress."
  const words = ['into Progress.', 'into Mastery.', 'into Confidence.', 'into Consistency.'];
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting && displayText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 2400);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      const speed = isDeleting ? 40 : 85;
      timeout = setTimeout(() => {
        setDisplayText((prev) =>
          isDeleting
            ? currentWord.substring(0, prev.length - 1)
            : currentWord.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex]);

  const pills = [
    {
      icon: <BarChart3 className="w-3.5 h-3.5 text-orange-400" />,
      title: 'Track',
      subtitle: 'Your Progress',
      color: 'bg-orange-500/10 border-orange-500/25 text-orange-400',
    },
    {
      icon: <Crosshair className="w-3.5 h-3.5 text-emerald-400" />,
      title: 'Find',
      subtitle: 'Weak Topics',
      color: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    },
    {
      icon: <Calendar className="w-3.5 h-3.5 text-purple-400" />,
      title: 'Smart',
      subtitle: 'Revision',
      color: 'bg-purple-500/10 border-purple-500/25 text-purple-400',
    },
    {
      icon: <TrendingUp className="w-3.5 h-3.5 text-blue-400" />,
      title: 'Stay',
      subtitle: 'Consistent',
      color: 'bg-blue-500/10 border-blue-500/25 text-blue-400',
    },
  ];

  return (
    <div className="w-full flex flex-col justify-start space-y-4 xl:space-y-5 select-none pt-2 xl:pt-4">
      {/* 1. Top Focused Learner Pill */}
      <div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono tracking-tight shadow-[0_0_20px_rgba(249,115,22,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span>A focused workspace for serious learners</span>
        </span>
      </div>

      {/* 2. Main Headline with Smooth Typewriter Effect */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl xl:text-[44px] font-extrabold tracking-tight text-white leading-[1.12]">
          Turn Practice <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">
            {displayText}
          </span>
          <span className="text-amber-400 animate-pulse font-normal">|</span>
        </h1>

        <p className="text-xs sm:text-sm text-zinc-300 max-w-md leading-relaxed font-sans drop-shadow-sm">
          Track your DSA journey, detect weak topics, get smart revision schedules
          and build consistency — all in one place.
        </p>
      </div>

      {/* 3. Four Feature Highlight Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {pills.map((pill, idx) => (
          <div
            key={idx}
            className={`px-3 py-1.5 rounded-xl border backdrop-blur-md flex items-center gap-2 shadow-xs transition-transform hover:scale-105 ${pill.color}`}
          >
            {pill.icon}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-white tracking-tight">{pill.title}</span>
              <span className="text-[10px] text-zinc-300 font-mono">· {pill.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
