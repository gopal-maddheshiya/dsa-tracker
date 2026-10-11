import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/auth/AuthShell';
import ProductValueShowcase from '../components/auth/ProductValueShowcase';
import PasswordInput from '../components/auth/PasswordInput';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import FormAlert from '../components/common/FormAlert';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * LoginPage: Cinematic, Atmospheric Developer Login Experience.
 * Matches the reference artwork with photorealistic workspace backdrop,
 * typewriter headline, four feature badges, glowing amber card, and instant demo workspace.
 */
export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const destination = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Enter your email address.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Enter your password.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      await login(formData.email.trim(), formData.password);
      navigate(destination, { replace: true });
    } catch (err) {
      if (err.status === 401) {
        setServerError('Invalid email or password.');
      } else if (err.status === 400) {
        setServerError(err.message || 'Please provide both email and password.');
      } else {
        console.error('Unexpected login error:', err);
        const msg = err?.response?.data?.message || err?.message;
        setServerError(
          msg && !msg.includes('status code')
            ? msg
            : 'Could not connect to the backend server. Please check your network or server status.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    if (submitting) return;
    setSubmitting(true);
    setServerError('');
    try {
      await loginWithGoogle(credential);
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Google login error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Google authentication failed.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    setServerError('');
    try {
      await login('demo@dsa-tracker.local', 'Demo1234!');
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Demo login error:', err);
      const msg = err?.response?.data?.message || err?.message;
      setServerError(
        msg && !msg.includes('status code')
          ? msg
          : 'Could not connect to the backend server. Please check your network or server status.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to continue your journey."
        sideShowcase={<ProductValueShowcase />}
      >
        <div className="space-y-4">
          {serverError && <FormAlert message={serverError} />}

          {/* Google One-Click Sign-In */}
          <div className="w-full">
            <GoogleSignInButton
              onCredentialReceived={handleGoogleCredential}
              disabled={submitting}
            />
          </div>

          {/* Hairline Clean Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[10px] font-mono tracking-widest uppercase text-zinc-400">
              <span className="px-3 bg-black/40 backdrop-blur-md border border-white/[0.08] rounded-full">
                OR
              </span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={submitting}
                  autoComplete="email"
                  className={`w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm rounded-xl border bg-black/40 backdrop-blur-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${fieldErrors.email
                      ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-white/[0.12] hover:border-white/[0.2] focus:border-amber-500/70 focus:ring-amber-500/20'
                    }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-medium text-amber-400/90 hover:text-amber-300 hover:underline transition-colors focus:outline-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={submitting}
                autoComplete="current-password"
                leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
                className={`h-11 rounded-xl bg-black/40 backdrop-blur-md text-xs sm:text-sm text-white placeholder:text-zinc-500 ${fieldErrors.password
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-white/[0.12] hover:border-white/[0.2] focus:border-amber-500/70 focus:ring-amber-500/20'
                  }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-rose-400 font-medium">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Radiant Amber-Orange Gradient Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 px-4 text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-[0.99] text-white rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_6px_25px_rgba(249,115,22,0.5)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500/50 mt-1 cursor-pointer group"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="pt-0.5 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              state={{ from: location.state?.from }}
              className="text-amber-400 hover:text-amber-300 hover:underline font-semibold transition-colors"
            >
              Create one →
            </Link>
          </div>

          {/* Frosted Glass Quick Demo Access Button */}
          <div className="pt-2.5 border-t border-white/[0.08]">
            <button
              type="button"
              disabled={submitting}
              onClick={handleDemoLogin}
              className="w-full h-11 px-4 rounded-xl border border-white/[0.12] hover:border-white/[0.22] bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.99] text-zinc-200 hover:text-white transition-all text-xs sm:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer shadow-xs group backdrop-blur-md"
              title="Explore full workspace with 35 preloaded problems"
            >
              <span>Try Demo Workspace</span>
              <span className="text-amber-400 group-hover:scale-110 transition-transform">⚡</span>
            </button>
          </div>
        </div>
      </AuthShell>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </>
  );
}
