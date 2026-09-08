import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Flame, Trophy } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Min. 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setIsSubmitting(true);
    const result = await signup(name.trim(), email.trim(), password);
    setIsSubmitting(false);
    if (result.success) navigate('/dashboard', { replace: true });
    else setApiError(result.message);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Branding Panel ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center bg-gradient-to-br from-[#13161C] via-[#0D0E12] to-[#08090B] border-r border-white/[0.08]">
        {/* Decorative grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.1), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%)', filter: 'blur(50px)' }} />

        <div className="relative z-10 px-12 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F97316]/15 border border-[#F97316]/30 shadow-[0_0_25px_rgba(249,115,22,0.15)]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F97316] dot-pulse" />
            </div>
            <div className="font-bold text-xl text-[#F3F4F6] tracking-tight">
              DSA<span className="text-[#F97316]">Tracker</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-[#F3F4F6] tracking-tight leading-tight mb-4">
            Your coding journey<br />
            <span className="text-gradient">starts here.</span>
          </h2>
          <p className="text-sm text-[#9CA3AF] leading-relaxed mb-8">
            Join a smarter way to practice — catalog problems, track attempts, and let spaced repetition supercharge your retention.
          </p>

          {/* Stats preview */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: BarChart3, color: '#F97316', label: 'Analytics', desc: 'Real-time insights' },
              { icon: Flame, color: '#F59E0B', label: 'Streaks', desc: 'Build consistency' },
              { icon: Trophy, color: '#FCD34D', label: 'Milestones', desc: 'Earn badges' },
            ].map(s => {
              const IconComp = s.icon;
              return (
                <div key={s.label} className="p-3 rounded-xl bg-[#131519] border border-white/[0.08] text-center flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 border"
                    style={{
                      backgroundColor: `${s.color}15`,
                      borderColor: `${s.color}30`,
                      color: s.color,
                    }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-semibold text-[#F3F4F6]">{s.label}</p>
                  <p className="text-[9px] font-mono text-[#9CA3AF]">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 animate-fade-up">
        <div className="w-full max-w-[420px]">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F97316]/15 border border-[#F97316]/30">
              <span className="w-3 h-3 rounded-full bg-[#F97316] dot-pulse" />
            </div>
            <div className="font-bold text-[#F3F4F6] text-lg tracking-tight">
              DSA<span className="text-[#F97316]">Tracker</span>
            </div>
          </div>

          <div className="panel p-7 bg-[#131519] border border-white/[0.08]">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight">Create your account</h1>
              <p className="text-sm text-[#9CA3AF] mt-1">
                Start cataloging problems and tracking your retention.
              </p>
            </div>

            {apiError && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <p className="text-xs text-rose-300">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="block section-label mb-1.5">Full name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting} placeholder="Your name"
                  className={`input-base ${errors.name ? 'input-error' : ''}`} />
                {errors.name && <p className="mt-1.5 text-xs text-rose-400">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block section-label mb-1.5">Email address</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting} placeholder="you@example.com"
                  className={`input-base ${errors.email ? 'input-error' : ''}`} />
                {errors.email && <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block section-label mb-1.5">
                  Password <span className="text-[#9CA3AF] font-normal normal-case tracking-normal">(min. 6 chars)</span>
                </label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting} placeholder="••••••••"
                  className={`input-base ${errors.password ? 'input-error' : ''}`} />
                {errors.password && <p className="mt-1.5 text-xs text-rose-400">{errors.password}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account…</span>
                  </>
                ) : 'Create account'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/[0.08] text-center text-xs text-[#9CA3AF]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#F97316] hover:text-[#FB923C] font-semibold transition-colors">
                Sign in →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
