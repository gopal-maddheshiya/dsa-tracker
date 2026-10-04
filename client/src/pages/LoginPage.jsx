import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/auth/AuthShell';
import PasswordInput from '../components/auth/PasswordInput';
import FormAlert from '../components/common/FormAlert';
import { Loader2 } from 'lucide-react';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific validation error on edit
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
        setServerError("Couldn't connect to the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Pick up where you left off in your interview preparation."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && <FormAlert message={serverError} />}

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="developer@example.com"
            disabled={submitting}
            autoComplete="email"
            className={`w-full px-3 py-2 text-xs bg-bg border rounded-md text-text placeholder:text-muted focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              fieldErrors.email
                ? 'border-danger focus:border-danger focus:ring-danger'
                : 'border-line focus:border-accent focus:ring-accent'
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-[11px] text-danger font-medium">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-text-secondary"
            >
              Password
            </label>
          </div>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={submitting}
            autoComplete="current-password"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-md transition-colors shadow-subtle flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-6 pt-4 border-t border-line text-center text-xs text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          state={{ from: location.state?.from }}
          className="text-accent hover:underline font-medium"
        >
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}
