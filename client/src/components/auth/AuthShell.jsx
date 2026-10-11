import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import LogoMark from '../common/LogoMark';

/**
 * Curated developer mindsets & DSA practice slogans.
 * Rotates dynamically on refresh and on gentle timed intervals.
 */
const AUTH_SLOGANS = [
  'Better problems. Better thinking. A better you.',
  'Discipline today. Better opportunities tomorrow.',
  'Same problem. Stronger you.',
  'Patterns over memorization. Progress over perfection.',
  'Consistency is the code that solves everything.',
  'Small deliberate practice, exponential mastery.',
  'Turn every failed attempt into intuition.',
  'Master the fundamentals. The rest is implementation.',
  'One clean solution at a time.',
  'Don’t just solve problems. Build problem-solving instincts.',
];

function DynamicSlogan() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * AUTH_SLOGANS.length));
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Gentle slow rotation every 12 seconds with smooth crossfade
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % AUTH_SLOGANS.length);
        setIsFading(false);
      }, 600);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden sm:flex items-center text-right justify-end max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
      <span
        className={`text-xs font-serif italic text-zinc-300/90 drop-shadow-sm transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'
          }`}
      >
        &ldquo;{AUTH_SLOGANS[index]}&rdquo;
      </span>
    </div>
  );
}

/**
 * AuthShell: Cinematic Twilight Developer Workspace Canvas.
 * Directly integrates the photorealistic ambient developer desk backdrop,
 * glowing warm amber lighting, and precision obsidian glassmorphic card.
 * Fits within 100vh on desktop with zero scrolling (bina scroll ke).
 */
export default function AuthShell({
  children,
  title,
  subtitle,
  sideShowcase = null,
}) {
  return (
    <div
      className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#09090d] text-zinc-100 flex flex-col justify-between selection:bg-orange-500/30 selection:text-orange-200 relative font-sans"
    >
      {/* --- CINEMATIC PHOTOREALISTIC DESK BACKDROP --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Photorealistic Developer Workspace Backdrop */}
        <img
          src="/cinematic-desk.jpg"
          alt="Cinematic Developer Desk"
          className="w-full h-full object-cover object-left lg:object-center filter brightness-[0.85] contrast-[1.05] scale-[1.01]"
        />

        {/* Ambient Dark Gradients & Vignette for Contrast & Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/75" />

        {/* Subtle Ambient Radial Lighting around Auth Card */}
        <div className="absolute top-1/2 right-[18%] -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-bl from-orange-500/15 via-amber-500/8 to-transparent rounded-full blur-[160px]" />
      </div>

      {/* --- TOP GLOBAL NAVIGATION HEADER --- */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 pb-2 sm:pt-5 sm:pb-3 flex items-center justify-between relative z-20 shrink-0">
        {/* Left Signature Brand Identity */}
        <Link to="/" className="inline-flex items-center gap-3 group shrink-0" title="DSA Tracker Home">
          <LogoMark size="sm" animated={true} />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-tight text-white group-hover:text-amber-400 transition-colors drop-shadow-sm">
              DSA Tracker
            </span>
            <span className="text-[10px] font-mono leading-none mt-0.5 text-zinc-300 drop-shadow-sm">
              Practice · Analyze · Improve
            </span>
          </div>
        </Link>

        {/* Right Dynamic Slogan (Rotates on refresh & slow intervals) */}
        <DynamicSlogan />
      </header>

      {/* --- MAIN WORKSPACE VIEWPORT (Fitted strictly within 100vh on desktop) --- */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-2 sm:py-4 flex items-center justify-center relative z-10">
        {sideShowcase ? (
          /* --- 2-COLUMN SPLIT (Showcase Left + Glowing Card Right) --- */
          <div className="w-full h-full max-h-[660px] grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8 xl:gap-14">
            {/* Left Column: Product Value Showcase floating over desk */}
            <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 h-full flex-col justify-start pr-2 xl:pr-6">
              {sideShowcase}
            </div>

            {/* Right Column / Mobile Center: Glowing Frosted Glass Auth Card */}
            <div className="lg:col-span-5 xl:col-span-5 w-full flex flex-col items-center justify-center">
              {/* Pure Glassmorphic Auth Card */}
              <div className="relative w-full max-w-[420px]">
                {/* Subtle soft ambient depth */}
                <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-tr from-white/[0.04] via-amber-500/6 to-transparent blur-xl opacity-60 pointer-events-none" />

                {/* Main Glassmorphic Card Surface */}
                <div className="relative w-full bg-black/40 backdrop-blur-2xl border border-white/[0.13] hover:border-white/[0.2] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_24px_60px_rgba(0,0,0,0.7)] text-zinc-100 overflow-hidden transition-all">
                  {/* Specular Edge Highlights */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-black/20 pointer-events-none rounded-2xl sm:rounded-3xl" />

                  {/* Clean Unified Brand & Action Header */}
                  {(title || subtitle) && (
                    <div className="flex items-center gap-3.5 mb-5 relative z-10">
                      <LogoMark size="md" animated={false} />
                      <div>
                        {title && (
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                            {title}
                          </h2>
                        )}
                        {subtitle && (
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form & Actions */}
                  <div className="relative z-10">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- SINGLE-COLUMN CENTERED (For Signup / Password Reset) --- */
          <div className="w-full max-w-[420px] flex flex-col items-center">
            <div className="relative w-full">
              <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-tr from-white/[0.04] via-amber-500/6 to-transparent blur-xl opacity-60 pointer-events-none" />
              <div className="relative w-full bg-black/40 backdrop-blur-2xl border border-white/[0.13] hover:border-white/[0.2] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_24px_60px_rgba(0,0,0,0.7)] text-zinc-100 overflow-hidden transition-all">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-black/20 pointer-events-none rounded-2xl sm:rounded-3xl" />

                {(title || subtitle) && (
                  <div className="flex items-center gap-3.5 mb-5 relative z-10">
                    <LogoMark size="md" animated={false} />
                    <div>
                      {title && (
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                          {title}
                        </h2>
                      )}
                      {subtitle && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="relative z-10">
                  {children}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MINIMALIST COMPACT FOOTER --- */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-2.5 sm:py-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-400 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-1.5 shrink-0 backdrop-blur-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-bit Encrypted Session · Offline PWA Ready</span>
        </div>
        <div className="text-zinc-400">
          DSA Tracker · Deliberate Engineering Practice
        </div>
      </footer>
    </div>
  );
}
