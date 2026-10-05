import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/auth/AuthShell';
import PasswordInput from '../components/auth/PasswordInput';
import FormAlert from '../components/common/FormAlert';
import { Loader2 } from 'lucide-react';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
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
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Enter your full name.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Enter your email address.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Enter a password.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
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
      await signup(formData.name.trim(), formData.email.trim(), formData.password);
      navigate(destination, { replace: true });
    } catch (err) {
      if (err.status === 409) {
        setServerError('An account with this email already exists.');
      } else if (err.status === 400) {
        setServerError(err.message || 'Please check the provided details.');
      } else {
        console.error('Unexpected signup error:', err);
        setServerError("Couldn't connect to the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your coding interview preparation systematically."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && <FormAlert message={serverError} />}

        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-medium text-text-secondary mb-1.5"
          >
            Full name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ada Lovelace"
            disabled={submitting}
            autoComplete="name"
            className={`w-full h-9 px-3 text-xs bg-bg border rounded-md text-text placeholder:text-muted focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              fieldErrors.name
                ? 'border-danger focus:border-danger focus:ring-danger'
                : 'border-line focus:border-accent focus:ring-accent'
            }`}
          />
          {fieldErrors.name && (
            <p className="mt-1 text-[11px] text-danger font-medium">
              {fieldErrors.name}
            </p>
          )}
        </div>

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
            className={`w-full h-9 px-3 text-xs bg-bg border rounded-md text-text placeholder:text-muted focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
            <span className="text-[10px] font-mono text-muted">Min. 6 characters</span>
          </div>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-9 px-4 text-xs font-medium bg-accent hover:bg-accent-hover active:scale-[0.99] text-white rounded-md transition-all duration-150 shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-4 border-t border-line text-center text-xs text-text-secondary">
        Already have an account?{' '}
        <Link
          to="/login"
          state={{ from: location.state?.from }}
          className="text-accent hover:underline font-medium"
        >
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}
