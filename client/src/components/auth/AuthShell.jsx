import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import LogoMark from '../common/LogoMark';

/**
 * AuthShell: Responsive split layout for authentication pages.
 * Desktop: Identity/values panel on the left, centered form card on the right.
 * Mobile: Collapses to a single-column, centered form with brand header.
 */
export default function AuthShell({ children, title, subtitle }) {
  const { theme, toggleTheme } = useTheme();

  const pillars = [
    {
      label: 'Topic Weakness Detection',
      desc: 'Pinpoint conceptual friction across Dynamic Programming, Graphs, and Trees.',
    },
    {
      label: 'Deterministic Spaced Repetition',
      desc: 'Scheduled problem revisions calculated by difficulty and past recall confidence.',
    },
    {
      label: 'Engineering Practice Analytics',
      desc: 'Transparent velocity metrics and consistency tracking without visual noise.',
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between selection:bg-accent/20 selection:text-accent relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Desktop Top-Right Theme Toggle */}
      <div className="hidden lg:block absolute top-6 right-8 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-surface/80 backdrop-blur-md border border-line/80 text-text-secondary hover:text-text hover:bg-surface active:scale-95 transition-all shadow-xs group"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Top Mobile Brand Bar */}
      <header className="lg:hidden p-4 sm:p-5 border-b border-line/70 bg-surface/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <LogoMark size={30} />
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-text leading-tight">
              DSA Tracker
            </span>
            <span className="text-[10px] font-mono text-muted leading-none">
              prep workspace
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-surface border border-line text-text-secondary hover:text-text active:scale-95 transition-all shadow-xs"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 items-center p-4 sm:p-6 lg:p-12 gap-8 lg:gap-16 relative z-10">
        {/* Left Side: Product Identity & Value Pillars (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-10 pr-6">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <LogoMark size={36} />
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-tight text-text leading-tight group-hover:text-accent transition-colors">
                  DSA Tracker
                </span>
                <span className="text-[10px] font-mono text-muted leading-none">
                  prep workspace
                </span>
              </div>
            </Link>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono mb-4">
              <span>✦</span>
              <span>Deterministic Spaced Repetition</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-text leading-tight">
              Track algorithm practice with deliberate intent.
            </h1>
            <p className="text-sm text-text-secondary mt-3 max-w-md leading-relaxed">
              Transform problem-solving history into actionable weakness detection, retention curves, and revision schedules.
            </p>
          </div>

          {/* Pillars List */}
          <div className="space-y-4 border-t border-line/70 pt-8">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-text">{pillar.label}</div>
                  <div className="text-[11px] text-muted mt-0.5 leading-normal">
                    {pillar.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs font-mono text-muted/80">
            Developer Productivity System · Engineering Practice
          </div>
        </div>

        {/* Right Side: Centered Authentication Form Card */}
        <div className="lg:col-span-6 w-full flex justify-center">
          <div className="max-w-md w-full bg-surface/90 backdrop-blur-xl border border-line/80 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden">
            {/* Subtle card top glow line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text tracking-tight">{title}</h2>
              <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="p-4 border-t border-line/60 text-center text-xs font-mono text-muted relative z-10">
        DSA / Interview Prep Tracker · Personal Engineering Practice
      </footer>
    </div>
  );
}
