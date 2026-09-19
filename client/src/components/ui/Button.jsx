import React from 'react';

const variants = {
  primary:   'bg-accent text-bg font-semibold hover:bg-accent-hover active:opacity-95 transition-colors cursor-pointer',
  secondary: 'bg-surface-2 text-text border border-line hover:bg-surface active:opacity-95 transition-colors cursor-pointer',
  ghost:     'bg-transparent hover:bg-surface-2 border border-transparent text-text-secondary hover:text-text transition-colors cursor-pointer',
  danger:    'bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger transition-colors cursor-pointer',
  outline:   'bg-transparent border border-line hover:border-accent text-text-secondary hover:text-accent transition-colors cursor-pointer',
  success:   'bg-success/10 hover:bg-success/20 border border-success/30 text-success transition-colors cursor-pointer',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1 rounded-lg',
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
};

/**
 * Button — unified interactive button component.
 * @param {string} variant — primary | secondary | ghost | danger | outline | success
 * @param {string} size    — xs | sm | md | lg
 * @param {bool}   loading — shows spinner
 * @param {bool}   fullWidth — w-full
 */
const Button = ({
  variant = 'primary',
  size = 'sm',
  loading = false,
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium font-sans
        transition-all duration-150 active:scale-[0.98] select-none
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant] ?? variants.primary}
        ${sizes[size] ?? sizes.sm}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;
