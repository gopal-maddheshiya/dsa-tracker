import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/auth/GoogleButton';
import Rotating3DCube from '../components/auth/Rotating3DCube';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import {
  Flame,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, googleLogin } = useAuth();
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

  const handleGoogleSuccess = async (tokenPayload) => {
    setApiError('');
    setIsSubmitting(true);
    const result = await googleLogin(tokenPayload);
    setIsSubmitting(false);
    if (result.success) {
      navigate(from, { replace: true });
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

      {/* ── Left: Interactive 3D Stage Panel ── */}
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

      {/* ── Right: Balanced, Ultra-Premium Auth Panel ── */}
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
                Welcome back
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Sign in to your account to continue your preparation
              </p>
            </div>

            {apiError && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                <p className="text-xs text-rose-300 leading-tight">{apiError}</p>
              </div>
            )}

            {/* Google Sign In Button */}
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="Continue with Google"
              disabled={isSubmitting}
            />

            {/* Clean Hairline Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <span className="relative px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-[#11141B]">
                or continue with email
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
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
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Clean 1-Click Demo Credentials Card */}
            <div className="mt-5 p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.09] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">Demo Account</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/[0.06] text-slate-400">test</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">demo@dsa-tracker.local</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@dsa-tracker.local');
                  setPassword('DemoPassword123!');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500 border border-orange-500/25 hover:border-transparent transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                Auto-fill
              </button>
            </div>

            {/* Bottom Sign-Up Link */}
            <p className="mt-5 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                Create an account
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={email}
      />
    </div>
  );
};

export default LoginPage;
