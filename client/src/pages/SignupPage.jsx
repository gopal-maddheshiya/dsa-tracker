import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/auth/GoogleButton';
import Rotating3DCube from '../components/auth/Rotating3DCube';
import { ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time password strength evaluation
  const passwordEvaluation = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-zinc-700', textColor: 'text-zinc-500', checks: { length: false, number: false, special: false } };
    const hasLength = password.length >= 6;
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);

    let score = 0;
    if (hasLength) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    if (hasUpper && password.length >= 8) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';
    let textColor = 'text-rose-400';

    if (score === 2) {
      label = 'Fair';
      color = 'bg-amber-500';
      textColor = 'text-amber-400';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-sky-500';
      textColor = 'text-sky-400';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
      textColor = 'text-emerald-400';
    }

    return {
      score,
      label,
      color,
      textColor,
      checks: {
        length: hasLength,
        number: hasNumber,
        special: hasSpecial
      }
    };
  }, [password]);

  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Min. 6 characters required';
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

  const handleGoogleSuccess = async (tokenPayload) => {
    setApiError('');
    setIsSubmitting(true);
    const result = await googleLogin(tokenPayload);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setApiError(result.message);
    }
  };

  const handleGoogleError = () => {
    setApiError('Google sign in was cancelled or failed.');
  };

  return (
    <div className="min-h-screen flex bg-[#090B0E] relative overflow-hidden selection:bg-orange-500/30 selection:text-orange-200">
      {/* Ambient background glows for deep optical depth */}
      <div
        className="absolute top-[-10%] left-[10%] w-[680px] h-[680px] rounded-full pointer-events-none opacity-25 animate-aurora"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15), transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[20%] w-[620px] h-[620px] rounded-full pointer-events-none opacity-20 animate-aurora"
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.16), transparent 70%)',
          filter: 'blur(110px)',
          animationDelay: '4s',
        }}
      />

      {/* Subtle global vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] z-0" />

      {/* ── Left: Interactive 3D Stage Panel (Identical Cohesion) ── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col justify-between p-8 xl:p-10 bg-gradient-to-b from-[#0F1218]/90 via-[#0B0D12]/95 to-[#07080B] border-r border-white/[0.07] z-10">
        
        {/* Architectural Tech Grid background */}
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Ambient glow under cube stage */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[400px] rounded-full bg-cyan-500/[0.04] blur-[120px] pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/25 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#F97316] dot-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">
                DSA<span className="text-[#F97316]">Tracker</span>
              </span>
              <span className="text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-wider">
                PRO PREP
              </span>
            </div>
          </div>
        </div>

        {/* Center 3D Stage with Alternating Diagonal Telemetry Cards */}
        <div className="relative z-10 flex items-center justify-center my-auto py-4 w-full">
          <Rotating3DCube />
        </div>

        {/* Bottom Platform Ribbon */}
        <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {['LeetCode', 'GeeksforGeeks', 'Codeforces', 'HackerRank', 'CodeChef', 'InterviewBit'].map((brand) => (
              <span
                key={brand}
                className="px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-slate-400 hover:text-slate-200 hover:border-white/[0.12] transition-all cursor-default whitespace-nowrap text-[10.5px]"
              >
                {brand}
              </span>
            ))}
          </div>
          <span className="hidden xl:inline text-slate-600 text-[10.5px]">© 2026 DSA Tracker</span>
        </div>
      </div>

      {/* ── Right: Balanced, Luxury Glass Signup Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10 bg-gradient-to-br from-[#0C0E13]/95 via-[#090B0E] to-[#060709]">
        
        {/* Soft radial backlight glow behind the card */}
        <div className="absolute w-[440px] h-[440px] rounded-full bg-orange-500/[0.06] blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[400px] relative animate-fade-up">

          {/* Mobile brand (hidden on lg) */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] dot-pulse" />
            </div>
            <div className="font-bold text-white text-xl tracking-tight">
              DSA<span className="text-[#F97316]">Tracker</span>
            </div>
          </div>

          {/* Floating Luxury Auth Card */}
          <div className="relative p-7 sm:p-8 rounded-2xl bg-[#11141B]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7),0_1px_1px_rgba(255,255,255,0.06)]">
            
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Create your account
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Join thousands of engineers leveling up their problem-solving retention.
              </p>
            </div>

            {apiError && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                <p className="text-xs text-rose-300 leading-tight">{apiError}</p>
              </div>
            )}

            {/* Google Sign Up Button */}
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="Sign up with Google"
              disabled={isSubmitting}
            />

            {/* Clean Hairline Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <span className="relative px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-[#11141B]">
                or register with email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  disabled={isSubmitting}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full h-11 px-3.5 rounded-xl bg-[#0B0D12] border border-white/[0.09] hover:border-white/[0.16] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/90 focus:ring-2 focus:ring-orange-500/20 transition-all ${
                    errors.name ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                />
                {errors.name && <p className="mt-1.5 text-xs text-rose-400">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full h-11 px-3.5 rounded-xl bg-[#0B0D12] border border-white/[0.09] hover:border-white/[0.16] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/90 focus:ring-2 focus:ring-orange-500/20 transition-all ${
                    errors.email ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                />
                {errors.email && <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Min. 6 chars</span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    disabled={isSubmitting}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full h-11 pl-3.5 pr-11 rounded-xl bg-[#0B0D12] border border-white/[0.09] hover:border-white/[0.16] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/90 focus:ring-2 focus:ring-orange-500/20 transition-all ${
                      errors.password ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-rose-400">{errors.password}</p>}

                {/* Real-time Password Strength Meter */}
                {password && (
                  <div className="mt-2.5 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Password Strength:</span>
                      <span className={`font-bold ${passwordEvaluation.textColor}`}>
                        {passwordEvaluation.label}
                      </span>
                    </div>

                    {/* 4-Segment Progress Bar */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full rounded-full transition-all duration-300 ${
                            step <= passwordEvaluation.score
                              ? passwordEvaluation.color
                              : 'bg-white/[0.08]'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Requirement checklist badges */}
                    <div className="flex items-center gap-2 pt-1 text-[10px] font-mono">
                      <span className={`flex items-center gap-1 transition-colors ${passwordEvaluation.checks.length ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3 h-3" /> 6+ chars
                      </span>
                      <span className={`flex items-center gap-1 transition-colors ${passwordEvaluation.checks.number ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3 h-3" /> Number
                      </span>
                      <span className={`flex items-center gap-1 transition-colors ${passwordEvaluation.checks.special ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3 h-3" /> Symbol
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-[0.99] shadow-[0_4px_24px_rgba(249,115,22,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account…</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Sign-In Link */}
            <p className="mt-6 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Session Security Micro-badge */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
            <span>256-bit encrypted authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
