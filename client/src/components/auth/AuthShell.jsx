import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Code2 } from 'lucide-react';

/**
 * AuthShell: Responsive split layout for authentication pages.
 * Desktop: Identity/values panel on the left, centered form card on the right.
 * Mobile: Collapses to a single-column, centered form with brand header.
 */
export default function AuthShell({ children, title, subtitle }) {
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
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between selection:bg-accent/20 selection:text-accent">
      {/* Top Mobile Brand Bar */}
      <header className="lg:hidden p-4 sm:p-6 border-b border-line bg-surface/50">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/25 via-accent/15 to-surface-2 border border-accent/35 flex items-center justify-center text-accent shadow-xs shrink-0">
            <Code2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-text leading-tight">
              DSA Tracker
            </span>
            <span className="text-[10px] font-mono text-muted leading-none">
              prep workspace
            </span>
          </div>
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 items-center p-4 sm:p-6 lg:p-12 gap-8 lg:gap-16">
        {/* Left Side: Product Identity & Value Pillars (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-10 pr-6">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/25 via-accent/15 to-surface-2 border border-accent/35 flex items-center justify-center text-accent shadow-xs group-hover:border-accent/60 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all duration-150 shrink-0">
                <Code2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-tight text-text leading-tight group-hover:text-text">
                  DSA Tracker
                </span>
                <span className="text-[10px] font-mono text-muted leading-none">
                  prep workspace
                </span>
              </div>
            </Link>

            <h1 className="text-3xl font-semibold tracking-tight text-text leading-tight">
              Track algorithm practice with deliberate intent.
            </h1>
            <p className="text-sm text-text-secondary mt-3 max-w-md leading-relaxed">
              Transform problem-solving history into actionable weakness detection, retention curves, and revision schedules.
            </p>
          </div>

          {/* Pillars List */}
          <div className="space-y-5 border-t border-line pt-8">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-text">{pillar.label}</div>
                  <div className="text-[11px] text-muted mt-0.5 leading-normal">
                    {pillar.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs font-mono text-muted">
            Developer Productivity System · Engineering Practice
          </div>
        </div>

        {/* Right Side: Centered Authentication Form Card */}
        <div className="lg:col-span-6 w-full flex justify-center">
          <div className="max-w-md w-full bg-surface border border-line rounded-lg p-6 sm:p-8 shadow-elevated">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-text tracking-tight">{title}</h2>
              <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="p-4 border-t border-line text-center text-xs font-mono text-muted">
        DSA / Interview Prep Tracker · Personal Engineering Practice
      </footer>
    </div>
  );
}
