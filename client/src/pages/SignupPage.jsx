import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from '../components/auth/GoogleButton';
import Rotating3DCube from '../components/auth/Rotating3DCube';
import BrandLogo from '../components/ui/BrandLogo';
import { ArrowRight, ShieldCheck, Eye, EyeOff, CheckCircle2, User, Mail, Lock } from 'lucide-react';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic document title
  useEffect(() => {
    document.title = 'Create Account · DSA Tracker';
  }, []);

  // Real-time password strength evaluation
  const passwordEvaluation = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-surface-2', textColor: 'text-muted', checks: { length: false, number: false, special: false } };
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
    let color = 'bg-danger';
    let textColor = 'text-danger';

    if (score === 2) {
      label = 'Fair';
      color = 'bg-medium';
      textColor = 'text-medium';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-accent';
      textColor = 'text-accent';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'bg-success';
      textColor = 'text-success';
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
    <div className="min-h-screen flex bg-bg relative overflow-hidden">
      {/* ── Left: Interactive 3D Stage Panel ── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col justify-between p-8 xl:p-10 bg-surface border-r border-line z-10">
        
        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="lg" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/12 text-accent border border-accent/25 tracking-wide">
              PRO PREP
            </span>
          </div>
        </div>

        {/* Center 3D Stage */}
        <div className="relative z-10 flex items-center justify-center my-auto py-4 w-full">
          <Rotating3DCube />
        </div>

        {/* Bottom Platform Ribbon */}
        <div className="relative z-10 pt-4 border-t border-line flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {['LeetCode', 'GeeksforGeeks', 'Codeforces', 'HackerRank', 'CodeChef', 'InterviewBit'].map((brand) => (
              <span
                key={brand}
                className="px-2.5 py-1 rounded-full bg-surface-2 border border-line text-text-secondary transition-colors cursor-default whitespace-nowrap text-xs"
              >
                {brand}
              </span>
            ))}
          </div>
          <span className="hidden xl:inline text-muted text-xs">© 2026 DSA Tracker</span>
        </div>
      </div>

      {/* ── Right: Auth Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10 bg-bg">
        <div className="w-full max-w-[408px] relative animate-fade-up">

          {/* Mobile brand (hidden on lg) */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <BrandLogo size="lg" />
          </div>

          {/* Flat Auth Card */}
          <div className="relative p-7 sm:p-8 rounded-xl bg-surface border border-line shadow-modal overflow-hidden">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-text tracking-tight">
                Create your account
              </h1>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Join thousands of engineers leveling up their problem-solving retention.
              </p>
            </div>

            {apiError && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-danger/10 border border-danger/25">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1 shrink-0" />
                <p className="text-xs text-danger leading-tight">{apiError}</p>
              </div>
            )}

            {/* Google Sign Up Button */}
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="Sign up with Google"
              disabled={isSubmitting}
            />

            {/* Hairline Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <span className="relative px-3 text-xs uppercase tracking-wider text-text-secondary bg-surface">
                or register with email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Full name
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    disabled={isSubmitting}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className={`input-base pl-10 ${
                      errors.name ? 'border-danger/60 focus:border-danger' : ''
                    }`}
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-danger">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled={isSubmitting}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`input-base pl-10 ${
                      errors.email ? 'border-danger/60 focus:border-danger' : ''
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs font-medium text-text-secondary">
                    Password
                  </label>
                  <span className="text-xs text-muted">Min. 6 chars</span>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    disabled={isSubmitting}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`input-base pl-10 pr-11 ${
                      errors.password ? 'border-danger/60 focus:border-danger' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password}</p>}

                {/* Real-time Password Strength Meter */}
                {password && (
                  <div className="mt-2.5 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Password Strength:</span>
                      <span className={`font-semibold ${passwordEvaluation.textColor}`}>
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
                              : 'bg-surface-2'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Requirement checklist badges */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className={`flex items-center gap-1 transition-colors ${passwordEvaluation.checks.length ? 'text-success font-medium' : 'text-muted'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> 6+ chars
                      </span>
                      <span className={`flex items-center gap-1 transition-colors ${passwordEvaluation.checks.number ? 'text-success font-medium' : 'text-muted'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Number
                      </span>
                      <span className={`flex items-center gap-1 transition-colors ${passwordEvaluation.checks.special ? 'text-success font-medium' : 'text-muted'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Symbol
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full h-10 text-xs font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
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
            <p className="mt-6 text-center text-xs text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-accent hover:text-accent-hover transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Session Security Micro-badge */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-secondary">
            <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
            <span>256-bit encrypted authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
