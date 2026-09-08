import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);
    if (result.success) navigate(from, { replace: true });
    else setApiError(result.message);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Branding Panel ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #1C1A18 0%, #111110 40%, #0D0C0B 100%)' }}>
        {/* Decorative grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(#262320 1px, transparent 1px), linear-gradient(90deg, #262320 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)', filter: 'blur(50px)' }} />

        <div className="relative z-10 px-12 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F97316]/15 border border-[#F97316]/25"
              style={{ boxShadow: '0 0 30px rgba(249,115,22,0.15)' }}>
              <span className="w-3.5 h-3.5 rounded-full bg-[#F97316] dot-pulse" />
            </div>
            <div>
              <div className="font-bold text-xl text-[#F5F5F4] tracking-tight">
                DSA<span className="text-[#F97316]">Tracker</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-[#F5F5F4] tracking-tight leading-tight mb-4">
            Master Data Structures<br />
            <span className="text-gradient">& Algorithms</span>
          </h2>
          <p className="text-sm text-[#6B6560] leading-relaxed mb-8">
            Track your problem-solving journey with spaced repetition, smart analytics, and a revision engine that helps you retain what you learn.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['Spaced Repetition', 'Topic Analytics', 'Solve Velocity', 'Difficulty Tracking'].map(f => (
              <span key={f} className="text-[10px] font-mono px-3 py-1.5 rounded-xl bg-[#1C1A18] border border-[#262320] text-[#6B6560]">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 animate-fade-up">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand (hidden on lg) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20">
              <span className="w-3 h-3 rounded-full bg-[#F97316] dot-pulse" />
            </div>
            <div className="font-bold text-[#F5F5F4] text-lg tracking-tight">
              DSA<span className="text-[#F97316]">Tracker</span>
            </div>
          </div>

          <div className="panel p-7" style={{ background: 'linear-gradient(160deg, #1C1A18, #191715)' }}>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[#F5F5F4] tracking-tight">Welcome back</h1>
              <p className="text-sm text-[#6B6560] mt-1">
                Sign in to access your problem repository and analytics.
              </p>
            </div>

            {apiError && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <p className="text-xs text-rose-300">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block section-label mb-1.5">Email address</label>
                <input
                  id="email" type="email" value={email} disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`input-base ${errors.email ? 'input-error' : ''}`}
                />
                {errors.email && <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block section-label mb-1.5">Password</label>
                <input
                  id="password" type="password" value={password} disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`input-base ${errors.password ? 'input-error' : ''}`}
                />
                {errors.password && <p className="mt-1.5 text-xs text-rose-400">{errors.password}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : 'Sign in'}
              </button>
            </form>

            {/* Demo helper */}
            <div className="mt-5 p-3 rounded-xl bg-[#141312] border border-[#262320]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#3E3834] font-mono">Demo credentials</span>
                <button type="button"
                  onClick={() => { setEmail('demo@dsa-tracker.local'); setPassword('DemoPassword123!'); }}
                  className="text-[11px] font-semibold text-[#F97316] hover:text-[#FB923C] transition-colors">
                  Auto-fill
                </button>
              </div>
              <p className="font-mono text-[11px] text-[#6B6560] truncate">demo@dsa-tracker.local</p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#262320] text-center text-xs text-[#6B6560]">
              No account yet?{' '}
              <Link to="/signup" className="text-[#F97316] hover:text-[#FB923C] font-semibold transition-colors">
                Create one for free →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
