import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/auth/AuthShell';
import PasswordInput from '../components/auth/PasswordInput';
import FormAlert from '../components/common/FormAlert';
import { KeyRound, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errors = {};
    if (!password) {
      errors.password = 'Enter your new password.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your new password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!token) {
      setServerError('Missing reset token. Please request a new password reset link.');
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      const res = await authApi.resetPassword({
        token,
        newPassword: password,
      });

      if (res?.data?.token && res?.data?.user) {
        setAuthSession(res.data.token, res.data.user);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Reset password error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to reset password.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create new password"
      subtitle="Your new password must be at least 6 characters."
    >
      {!token ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs leading-relaxed">
            No recovery token detected in URL. Please request a password reset link first.
          </div>
          <Link
            to="/login"
            className="w-full h-9 px-4 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : success ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text">Password updated successfully</p>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                You have been authenticated. Redirecting you to your workspace...
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard', { replace: true })}
            className="w-full h-9 px-4 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {serverError && <FormAlert message={serverError} />}

          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              New Password
            </label>
            <PasswordInput
              id="new-password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              placeholder="••••••••"
              disabled={submitting}
              autoComplete="new-password"
              className={
                fieldErrors.password
                  ? 'border-danger focus:border-danger focus:ring-danger'
                  : ''
              }
            />
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] text-danger font-medium">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-medium text-text-secondary mb-1.5"
            >
              Confirm New Password
            </label>
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }
              }}
              placeholder="••••••••"
              disabled={submitting}
              autoComplete="new-password"
              className={
                fieldErrors.confirmPassword
                  ? 'border-danger focus:border-danger focus:ring-danger'
                  : ''
              }
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-[11px] text-danger font-medium">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-9 px-4 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Save & Sign In</span>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs text-muted hover:text-text transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
