import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * PasswordInput: Secure, accessible password input field with visibility toggle.
 */
export default function PasswordInput({
  id,
  name = 'password',
  value,
  onChange,
  placeholder = '••••••••',
  disabled = false,
  required = true,
  autoComplete = 'current-password',
  className = '',
  leftIcon = null,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
          {leftIcon}
        </div>
      )}
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={`w-full ${leftIcon ? 'pl-10' : 'px-3.5'} pr-10 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || 'h-10 bg-bg border border-line rounded-md text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'
          }`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        title={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
